// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Ownable2Step, Ownable} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ISwapRouter02} from "./interfaces/ISwapRouter02.sol";
import {IUniversalRouter} from "./interfaces/IUniversalRouter.sol";
import {IUniswapV3Pool} from "./interfaces/IUniswapV3Pool.sol";
import {IWETH} from "./interfaces/IWETH.sol";
import {IStaking} from "./interfaces/IStaking.sol";

/// @title TreasuryManagerV2
/// @notice Onchain treasury management for USD (TurboUSD) on Base
/// @notice Operated by AMI (Artificial Monetary Intelligence)
/// @dev Enforces one-directional token flows: accumulate, buy USD, stake, burn. Never sell.
contract TreasuryManagerV2 is Ownable2Step, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ─── Base Mainnet Addresses (immutable) ───
    IWETH public constant WETH = IWETH(0x4200000000000000000000000000000000000006);
    IERC20 public constant USDC = IERC20(0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913);
    IERC20 public constant USD = IERC20(0x583866fb22a3d67d7c45e1D0F34BcB20Bf9c6353);
    IUniswapV3Pool public constant OFFICIAL_POOL = IUniswapV3Pool(0xAD501A478bF0F81C42C8C80ea08968f5Aa4c2f9A);
    IStaking public constant STAKING = IStaking(0x2a70a42BC0524aBCA9Bff59a51E7aAdB575DC89A);
    ISwapRouter02 public constant V3_ROUTER = ISwapRouter02(0x2626664c2603336E57B271c5C0b26F421741e481);
    IUniversalRouter public constant UNIVERSAL_ROUTER = IUniversalRouter(0x6fF5693b99212Da76ad316178A184AB56D299b43);

    // ─── Immutable Constants (never changeable) ───
    uint256 public constant SLIPPAGE_BPS = 300; // 3%
    uint256 public constant BPS_DENOMINATOR = 10_000;
    uint256 public constant PERMISSIONLESS_COOLDOWN = 4 hours;
    uint256 public constant PERMISSIONLESS_MAX_PCT = 500; // 5% of unlocked, in BPS
    uint256 public constant CIRCUIT_BREAKER_BPS = 1500; // 15% vs 24h TWAP
    uint256 public constant OPERATOR_INACTIVITY_PERIOD = 14 days;
    uint256 public constant DEAD_POOL_THRESHOLD = 90 days;
    uint256 public constant OPERATOR_COOLDOWN = 60 minutes;
    uint256 public constant PERMISSIONLESS_PER_ACTION_CAP = 0.5 ether;
    uint256 public constant PERMISSIONLESS_PER_DAY_CAP = 2 ether;
    uint256 public constant ROI_THRESHOLD_BPS = 100_000; // 1000% in BPS
    uint256 public constant ROI_STEP_BPS = 1_000; // 10% in BPS
    uint256 public constant UNLOCK_STEP_BPS = 500; // 5% of remaining locked, in BPS
    uint256 public constant BASE_UNLOCK_BPS = 2500; // 25% base unlock at 1000%
    uint256 public constant TWAP_PERIOD = 24 hours;

    // ─── Enums ───
    enum ActionType { BuybackWETH, BuybackUSDC, Burn, Stake, Rebalance }

    // ─── Structs ───
    struct Caps {
        uint256 perAction;
        uint256 perDay;
    }

    struct DailyUsage {
        uint256 amount;
        uint256 resetTime;
    }

    struct TokenInfo {
        uint256 totalCostWei;     // Weighted total cost in ETH
        uint256 totalAmount;      // Total tokens held (by balanceOf delta)
        uint256 highestRoiBps;    // Ratcheted highest ROI achieved
        uint256 roiTierTimestamp; // When current ROI tier was first reached
    }

    // ─── State ───
    address public operator;
    uint256 public operatorSlippageBps;
    address public usdcRecipient;

    // Caps per action type (owner-configurable)
    mapping(ActionType => Caps) public caps;

    // Daily usage tracking per action type
    mapping(ActionType => DailyUsage) public dailyUsage;

    // Last action timestamps for operator cooldown
    mapping(ActionType => uint256) public lastOperatorAction;

    // Permissionless per-token tracking
    mapping(address => uint256) public lastPermissionlessAction; // per token
    mapping(address => TokenInfo) public tokenInfo;

    // Permissionless daily usage (ETH equivalent)
    DailyUsage public permissionlessDailyUsage;

    // Last operator rebalance timestamp (any token)
    uint256 public lastOperatorRebalance;

    // Tracked tokens array
    address[] public trackedTokens;
    mapping(address => bool) public isTrackedToken;

    // Last pool interaction for dead pool detection
    uint256 public lastPoolInteraction;
    // ─── Events ───
    event BuybackExecuted(address indexed token, uint256 amountIn, uint256 usdOut);
    event BurnExecuted(uint256 amount);
    event StakeExecuted(uint256 poolId, uint256 amount);
    event UnstakeExecuted(uint256 poolId, uint256 amount, uint256 rewards);
    event TokenPurchased(address indexed token, uint256 ethSpent, uint256 tokensReceived);
    event RebalanceExecuted(address indexed token, uint256 amount, uint256 wethPortion, uint256 usdcPortion, bool permissionless, address caller);
    event CapsUpdated(ActionType indexed actionType, uint256 perAction, uint256 perDay);
    event SlippageUpdated(uint256 newBps);
    event DeadPoolTokenRescued(address indexed token, uint256 amount, uint256 wethReceived);
    event OperatorUpdated(address indexed newOperator);

    // ─── Errors ───
    error OnlyOperator();
    error ZeroAddress();
    error ZeroAmount();
    error ExceedsPerActionCap();
    error ExceedsPerDayCap();
    error CooldownNotElapsed();
    error InsufficientBalance();
    error SlippageTooHigh();
    error InvalidPath();
    error CircuitBreakerTriggered();
    error InsufficientROI();
    error OperatorStillActive();
    error PoolNotDead();
    error UnlockNotReady();
    error ExceedsUnlockedAmount();

    // ─── Modifiers ───
    modifier onlyOperator() {
        if (msg.sender != operator) revert OnlyOperator();
        _;
    }

    modifier operatorCooldown(ActionType action) {
        if (block.timestamp < lastOperatorAction[action] + OPERATOR_COOLDOWN) revert CooldownNotElapsed();
        lastOperatorAction[action] = block.timestamp;
        _;
    }

    modifier withinCaps(ActionType action, uint256 amount) {
        Caps memory c = caps[action];
        if (amount > c.perAction) revert ExceedsPerActionCap();
        _checkAndUpdateDailyUsage(action, amount);
        _;
    }

    // ─── Constructor ───
    constructor(address _owner, address _operator, address _usdcRecipient) Ownable(_owner) {
        if (_operator == address(0)) revert ZeroAddress();
        if (_usdcRecipient == address(0)) revert ZeroAddress();

        operator = _operator;
        usdcRecipient = _usdcRecipient;
        operatorSlippageBps = 500; // Default 5%

        // Default operator caps
        caps[ActionType.BuybackWETH] = Caps(0.5 ether, 2 ether);
        caps[ActionType.BuybackUSDC] = Caps(2000e6, 5000e6);
        caps[ActionType.Burn] = Caps(100_000_000 ether, 500_000_000 ether);
        caps[ActionType.Stake] = Caps(100_000_000 ether, 500_000_000 ether);
        caps[ActionType.Rebalance] = Caps(0.5 ether, 2 ether); // Uses BuybackWETH caps on 100% of input

        lastPoolInteraction = block.timestamp;
    }

    // ─── Receive ETH ───
    receive() external payable {}
    // ═══════════════════════════════════════════════
    // ║             OWNER-ONLY FUNCTIONS            ║
    // ═══════════════════════════════════════════════

    /// @notice Set AMI operator address
    function setOperator(address _operator) external onlyOwner {
        if (_operator == address(0)) revert ZeroAddress();
        operator = _operator;
        emit OperatorUpdated(_operator);
    }

    /// @notice Update caps for an action type (operator only, never affects permissionless)
    function updateCaps(ActionType action, uint256 perAction, uint256 perDay) external onlyOwner {
        if (perAction == 0 || perDay == 0) revert ZeroAmount();
        caps[action] = Caps(perAction, perDay);
        emit CapsUpdated(action, perAction, perDay);
    }

    /// @notice Set operator slippage (does not affect immutable 3% permissionless slippage)
    function setSlippage(uint256 bps) external onlyOwner {
        if (bps == 0 || bps > 1000) revert SlippageTooHigh(); // Max 10%
        operatorSlippageBps = bps;
        emit SlippageUpdated(bps);
    }

    /// @notice Rescue tokens from dead pool (90+ days no interaction)
    /// @dev Swaps to WETH only. Only for tokens that have been bought via buyTokenWithETH.
    function rescueDeadPoolToken(address token, bytes calldata path) external onlyOwner nonReentrant {
        if (block.timestamp < lastPoolInteraction + DEAD_POOL_THRESHOLD) revert PoolNotDead();

        // Path must end in WETH
        _validatePathEndsWithWETH(path);

        uint256 balance = IERC20(token).balanceOf(address(this));
        if (balance == 0) revert InsufficientBalance();

        // Swap token -> WETH via V3 router
        IERC20(token).safeIncreaseAllowance(address(V3_ROUTER), balance);

        uint256 wethBefore = WETH.balanceOf(address(this));

        V3_ROUTER.exactInput(
            ISwapRouter02.ExactInputParams({
                path: path,
                recipient: address(this),
                amountIn: balance,
                amountOutMinimum: 0 // Dead pool rescue — accept any amount
            })
        );

        uint256 wethReceived = WETH.balanceOf(address(this)) - wethBefore;
        emit DeadPoolTokenRescued(token, balance, wethReceived);
    }
    // ═══════════════════════════════════════════════
    // ║           OPERATOR-ONLY FUNCTIONS           ║
    // ═══════════════════════════════════════════════

    /// @notice Buy USD with WETH via official pool
    function buybackWithWETH(uint256 amountIn)
        external
        onlyOperator
        nonReentrant
        operatorCooldown(ActionType.BuybackWETH)
        withinCaps(ActionType.BuybackWETH, amountIn)
    {
        if (amountIn == 0) revert ZeroAmount();
        if (WETH.balanceOf(address(this)) < amountIn) revert InsufficientBalance();

        uint256 usdOut = _swapWETHToUSD(amountIn, operatorSlippageBps);
        lastPoolInteraction = block.timestamp;

        emit BuybackExecuted(address(WETH), amountIn, usdOut);
    }

    /// @notice Buy USD with USDC: USDC -> WETH -> USD via official pool
    function buybackWithUSDC(uint256 amountIn)
        external
        onlyOperator
        nonReentrant
        operatorCooldown(ActionType.BuybackUSDC)
        withinCaps(ActionType.BuybackUSDC, amountIn)
    {
        if (amountIn == 0) revert ZeroAmount();
        if (USDC.balanceOf(address(this)) < amountIn) revert InsufficientBalance();

        // Step 1: USDC -> WETH
        USDC.safeIncreaseAllowance(address(V3_ROUTER), amountIn);
        uint256 wethBefore = WETH.balanceOf(address(this));

        V3_ROUTER.exactInputSingle(
            ISwapRouter02.ExactInputSingleParams({
                tokenIn: address(USDC),
                tokenOut: address(WETH),
                fee: 500, // 0.05% USDC/WETH pool
                recipient: address(this),
                amountIn: amountIn,
                amountOutMinimum: 0, // Intermediate step
                sqrtPriceLimitX96: 0
            })
        );

        uint256 wethAmount = WETH.balanceOf(address(this)) - wethBefore;

        // Step 2: WETH -> USD via official pool
        uint256 usdOut = _swapWETHToUSD(wethAmount, operatorSlippageBps);
        lastPoolInteraction = block.timestamp;

        emit BuybackExecuted(address(USDC), amountIn, usdOut);
    }

    /// @notice Burn USD tokens (partial burn)
    function burn(uint256 amount)
        external
        onlyOperator
        nonReentrant
        operatorCooldown(ActionType.Burn)
        withinCaps(ActionType.Burn, amount)
    {
        if (amount == 0) revert ZeroAmount();
        if (USD.balanceOf(address(this)) < amount) revert InsufficientBalance();

        // Send to dead address (0x...dead) since USD may not have a burn function
        USD.safeTransfer(address(0x000000000000000000000000000000000000dEaD), amount);

        emit BurnExecuted(amount);
    }

    /// @notice Stake USD in staking contract
    function stake(uint256 amount, uint256 poolId)
        external
        onlyOperator
        nonReentrant
        operatorCooldown(ActionType.Stake)
        withinCaps(ActionType.Stake, amount)
    {
        if (amount == 0) revert ZeroAmount();
        if (USD.balanceOf(address(this)) < amount) revert InsufficientBalance();

        USD.safeIncreaseAllowance(address(STAKING), amount);
        STAKING.deposit(poolId, amount);

        emit StakeExecuted(poolId, amount);
    }

    /// @notice Unstake from staking contract. No caps, no cooldown.
    function unstake(uint256 poolId) external onlyOperator nonReentrant {
        // Check staked amount before withdrawal
        (uint256 stakedAmount,) = STAKING.userInfo(poolId, address(this));
        
        uint256 usdBefore = USD.balanceOf(address(this));

        STAKING.withdraw(poolId);

        uint256 usdAfter = USD.balanceOf(address(this));
        uint256 totalReceived = usdAfter - usdBefore;
        // Rewards = total received - staked principal
        uint256 rewards = totalReceived > stakedAmount ? totalReceived - stakedAmount : 0;

        emit UnstakeExecuted(poolId, totalReceived, rewards);
    }
    /// @notice Buy any ERC20 token with ETH via Universal Router
    /// @dev Records cost basis via balanceOf delta. Path must start with WETH.
    function buyTokenWithETH(address token, uint256 amountETH, bytes calldata path)
        external
        onlyOperator
        nonReentrant
    {
        if (token == address(0)) revert ZeroAddress();
        if (amountETH == 0) revert ZeroAmount();
        if (address(this).balance < amountETH) revert InsufficientBalance();

        // Validate path starts with WETH
        _validatePathStartsWithWETH(path);

        // Wrap ETH -> WETH for V3 routing
        WETH.deposit{value: amountETH}();
        WETH.approve(address(V3_ROUTER), amountETH);

        uint256 tokenBefore = IERC20(token).balanceOf(address(this));

        V3_ROUTER.exactInput(
            ISwapRouter02.ExactInputParams({
                path: path,
                recipient: address(this),
                amountIn: amountETH,
                amountOutMinimum: 0 // Operator manages slippage offchain
            })
        );

        uint256 tokensReceived = IERC20(token).balanceOf(address(this)) - tokenBefore;

        // Record cost basis (weighted average)
        TokenInfo storage info = tokenInfo[token];
        info.totalCostWei += amountETH;
        info.totalAmount += tokensReceived;

        // Track token if new
        if (!isTrackedToken[token]) {
            isTrackedToken[token] = true;
            trackedTokens.push(token);
        }

        emit TokenPurchased(token, amountETH, tokensReceived);
    }

    /// @notice Operator rebalance: 75% -> WETH -> USD, 25% -> USDC to recipient
    function rebalance(address token, uint256 amount, bytes calldata pathToWETH, bytes calldata pathToUSDC)
        external
        onlyOperator
        nonReentrant
        operatorCooldown(ActionType.Rebalance)
    {
        if (token == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        if (IERC20(token).balanceOf(address(this)) < amount) revert InsufficientBalance();

        // Rebalance uses BuybackWETH caps on 100% of input (measured in WETH equivalent)
        // We estimate WETH value from cost basis
        TokenInfo storage info = tokenInfo[token];
        uint256 estimatedWethValue;
        if (info.totalAmount > 0) {
            estimatedWethValue = (amount * info.totalCostWei) / info.totalAmount;
        }
        // Check caps
        Caps memory c = caps[ActionType.Rebalance];
        if (estimatedWethValue > c.perAction) revert ExceedsPerActionCap();
        _checkAndUpdateDailyUsage(ActionType.Rebalance, estimatedWethValue);

        uint256 wethReceived = _executeRebalance(token, amount, pathToWETH, pathToUSDC, false);

        // Update ROI based on actual swap output
        // Scale wethReceived to full amount (we only swapped 75%)
        uint256 estimatedTotalWeth = (wethReceived * 100) / 75;
        _updateROI(info, estimatedTotalWeth, amount);

        lastOperatorRebalance = block.timestamp;
        lastPoolInteraction = block.timestamp;

        // Update token accounting
        info.totalAmount = info.totalAmount > amount ? info.totalAmount - amount : 0;
        if (info.totalAmount > 0 && info.totalCostWei > estimatedWethValue) {
            info.totalCostWei -= estimatedWethValue;
        } else {
            info.totalCostWei = 0;
        }
    }
    // ═══════════════════════════════════════════════
    // ║          PERMISSIONLESS FUNCTION             ║
    // ═══════════════════════════════════════════════

    /// @notice Permissionless rebalance — anyone can call if conditions met
    /// @dev Unlock conditions: ROI >= 1000% AND 14 days since ROI tier reached with no operator rebalance
    function permissionlessRebalance(
        address token,
        uint256 amount,
        bytes calldata pathToWETH,
        bytes calldata pathToUSDC
    ) external nonReentrant {
        if (token == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        if (IERC20(token).balanceOf(address(this)) < amount) revert InsufficientBalance();

        TokenInfo storage info = tokenInfo[token];

        // ── Check ROI ──
        if (info.highestRoiBps < ROI_THRESHOLD_BPS) revert InsufficientROI();

        // ── Check 14-day operator inactivity ──
        if (info.roiTierTimestamp == 0) revert UnlockNotReady();
        if (block.timestamp < info.roiTierTimestamp + OPERATOR_INACTIVITY_PERIOD) revert UnlockNotReady();
        if (lastOperatorRebalance > info.roiTierTimestamp) revert OperatorStillActive();

        // ── Calculate unlocked amount ──
        uint256 unlocked = _calculateUnlocked(info);
        uint256 maxThisTx = (unlocked * PERMISSIONLESS_MAX_PCT) / BPS_DENOMINATOR; // 5% of unlocked
        if (amount > maxThisTx) revert ExceedsUnlockedAmount();

        // ── Per-token cooldown (4h) ──
        if (block.timestamp < lastPermissionlessAction[token] + PERMISSIONLESS_COOLDOWN) revert CooldownNotElapsed();
        lastPermissionlessAction[token] = block.timestamp;

        // ── Per-action cap: 0.5 ETH ──
        uint256 estimatedWethValue;
        if (info.totalAmount > 0) {
            estimatedWethValue = (amount * info.totalCostWei) / info.totalAmount;
        }
        if (estimatedWethValue > PERMISSIONLESS_PER_ACTION_CAP) revert ExceedsPerActionCap();

        // ── Daily cap: 2 ETH ──
        _checkPermissionlessDailyUsage(estimatedWethValue);

        // ── Circuit breaker: USD spot vs 24h TWAP ──
        _checkCircuitBreaker();

        // ── Execute with immutable 3% slippage ──
        uint256 wethReceived = _executeRebalance(token, amount, pathToWETH, pathToUSDC, true);

        // Update ROI based on actual swap output (scale to full amount)
        uint256 estimatedTotalWeth = (wethReceived * 100) / 75;
        _updateROI(info, estimatedTotalWeth, amount);

        lastPoolInteraction = block.timestamp;

        // Update token accounting
        info.totalAmount = info.totalAmount > amount ? info.totalAmount - amount : 0;
        if (info.totalAmount > 0 && info.totalCostWei > estimatedWethValue) {
            info.totalCostWei -= estimatedWethValue;
        } else {
            info.totalCostWei = 0;
        }
    }
    // ═══════════════════════════════════════════════
    // ║           INTERNAL FUNCTIONS                ║
    // ═══════════════════════════════════════════════

    /// @dev Swap WETH -> ₸USD via official V3 pool with slippage protection
    function _swapWETHToUSD(uint256 wethAmount, uint256 slippageBps) internal returns (uint256) {
        WETH.approve(address(V3_ROUTER), wethAmount);

        uint256 usdBefore = USD.balanceOf(address(this));

        uint24 poolFee = OFFICIAL_POOL.fee();

        // Get a TWAP-based quote for slippage calculation
        uint256 amountOutMinimum = _getMinAmountOut(wethAmount, slippageBps);

        V3_ROUTER.exactInputSingle(
            ISwapRouter02.ExactInputSingleParams({
                tokenIn: address(WETH),
                tokenOut: address(USD),
                fee: poolFee,
                recipient: address(this),
                amountIn: wethAmount,
                amountOutMinimum: amountOutMinimum,
                sqrtPriceLimitX96: 0
            })
        );

        uint256 usdReceived = USD.balanceOf(address(this)) - usdBefore;
        return usdReceived;
    }

    /// @dev Calculate minimum output based on current pool price and slippage tolerance
    /// Uses slot0 sqrtPriceX96 for price estimation with slippage applied
    function _getMinAmountOut(uint256 wethAmount, uint256 slippageBps) internal view returns (uint256) {
        (uint160 sqrtPriceX96,,,,,,) = OFFICIAL_POOL.slot0();
        if (sqrtPriceX96 == 0) return 0;
        
        address token0 = OFFICIAL_POOL.token0();
        bool wethIsToken0 = (token0 == address(WETH));
        
        // sqrtPriceX96 = sqrt(token1/token0) * 2^96
        // price = (sqrtPriceX96 / 2^96)^2 = sqrtPriceX96^2 / 2^192
        uint256 expectedOut;
        if (wethIsToken0) {
            // WETH is token0, ₸USD is token1
            // price = token1/token0 = ₸USD per WETH
            // expectedOut = wethAmount * price = wethAmount * sqrtPriceX96^2 / 2^192
            expectedOut = (wethAmount * uint256(sqrtPriceX96)) / (1 << 96);
            expectedOut = (expectedOut * uint256(sqrtPriceX96)) / (1 << 96);
        } else {
            // ₸USD is token0, WETH is token1
            // price = token1/token0 = WETH per ₸USD
            // So ₸USD per WETH = 1/price = 2^192 / sqrtPriceX96^2
            // expectedOut = wethAmount * 2^192 / sqrtPriceX96^2
            expectedOut = (wethAmount * (1 << 96)) / uint256(sqrtPriceX96);
            expectedOut = (expectedOut * (1 << 96)) / uint256(sqrtPriceX96);
        }
        
        // Apply slippage tolerance
        return (expectedOut * (BPS_DENOMINATOR - slippageBps)) / BPS_DENOMINATOR;
    }

    /// @dev Execute the 75/25 rebalance split
    /// @return totalWethReceived Total WETH received from the 75% portion swap
    function _executeRebalance(
        address token,
        uint256 amount,
        bytes calldata pathToWETH,
        bytes calldata pathToUSDC,
        bool isPermissionless
    ) internal returns (uint256 totalWethReceived) {
        _validatePathEndsWithWETH(pathToWETH);
        _validatePathEndsWithUSDC(pathToUSDC);

        uint256 wethPortion = (amount * 75) / 100;
        uint256 usdcPortion = amount - wethPortion;

        // ── 75% -> WETH -> ₸USD (stays in contract) ──
        IERC20(token).safeIncreaseAllowance(address(V3_ROUTER), wethPortion);
        uint256 wethBefore = WETH.balanceOf(address(this));

        V3_ROUTER.exactInput(
            ISwapRouter02.ExactInputParams({
                path: pathToWETH,
                recipient: address(this),
                amountIn: wethPortion,
                amountOutMinimum: 0
            })
        );

        totalWethReceived = WETH.balanceOf(address(this)) - wethBefore;

        // Swap WETH -> ₸USD via official pool
        uint256 slippage = isPermissionless ? SLIPPAGE_BPS : operatorSlippageBps;
        _swapWETHToUSD(totalWethReceived, slippage);

        // ── 25% -> USDC to owner ──
        IERC20(token).safeIncreaseAllowance(address(V3_ROUTER), usdcPortion);
        uint256 usdcBefore = USDC.balanceOf(usdcRecipient);

        V3_ROUTER.exactInput(
            ISwapRouter02.ExactInputParams({
                path: pathToUSDC,
                recipient: usdcRecipient,
                amountIn: usdcPortion,
                amountOutMinimum: 0
            })
        );

        uint256 usdcReceived = USDC.balanceOf(usdcRecipient) - usdcBefore;

        lastPoolInteraction = block.timestamp;
        emit RebalanceExecuted(token, amount, totalWethReceived, usdcReceived, isPermissionless, msg.sender);
    }

    /// @dev Check and update daily usage for an action type
    function _checkAndUpdateDailyUsage(ActionType action, uint256 amount) internal {
        DailyUsage storage usage = dailyUsage[action];

        // Reset if new day
        if (block.timestamp >= usage.resetTime + 1 days) {
            usage.amount = 0;
            usage.resetTime = block.timestamp;
        }

        if (usage.amount + amount > caps[action].perDay) revert ExceedsPerDayCap();
        usage.amount += amount;
    }

    /// @dev Check and update permissionless daily usage
    function _checkPermissionlessDailyUsage(uint256 ethEquivalent) internal {
        DailyUsage storage usage = permissionlessDailyUsage;

        if (block.timestamp >= usage.resetTime + 1 days) {
            usage.amount = 0;
            usage.resetTime = block.timestamp;
        }

        if (usage.amount + ethEquivalent > PERMISSIONLESS_PER_DAY_CAP) revert ExceedsPerDayCap();
        usage.amount += ethEquivalent;
    }
    /// @dev Calculate ROI for a token using ratcheted highest ROI
    /// @return roiBps ROI in basis points (10000 = 100%)
    /// @dev ROI is updated during rebalance operations based on actual WETH received
    ///      vs cost basis. The ratchet ensures ROI never decreases.
    function _calculateROI(address /* token */, TokenInfo storage info) internal view returns (uint256) {
        if (info.totalAmount == 0 || info.totalCostWei == 0) return 0;
        return info.highestRoiBps;
    }

    /// @dev Update ROI based on actual swap output (WETH received) vs cost basis
    /// @param info Token info to update
    /// @param wethReceived WETH received from swapping `amountSwapped` tokens
    /// @param amountSwapped Number of tokens swapped
    function _updateROI(TokenInfo storage info, uint256 wethReceived, uint256 amountSwapped) internal {
        if (info.totalAmount == 0 || info.totalCostWei == 0) return;
        
        // Calculate what this portion cost in WETH
        uint256 costOfSwapped = (amountSwapped * info.totalCostWei) / info.totalAmount;
        if (costOfSwapped == 0) return;
        
        // ROI = (currentValue - cost) / cost * 10000
        // = (wethReceived * 10000 / costOfSwapped) - 10000
        uint256 currentRoiBps;
        if (wethReceived > costOfSwapped) {
            currentRoiBps = ((wethReceived * BPS_DENOMINATOR) / costOfSwapped) - BPS_DENOMINATOR;
        }
        
        // Ratchet: only update if higher
        if (currentRoiBps > info.highestRoiBps) {
            if (info.highestRoiBps < ROI_THRESHOLD_BPS || _isNewTier(currentRoiBps, info.highestRoiBps)) {
                info.roiTierTimestamp = block.timestamp;
            }
            info.highestRoiBps = currentRoiBps;
        }
    }

    /// @dev Check if we've entered a new ROI tier (each 10% step)
    function _isNewTier(uint256 newRoiBps, uint256 oldRoiBps) internal pure returns (bool) {
        // Tiers are at 1000%, 1010%, 1020%, etc.
        uint256 newTier = (newRoiBps - ROI_THRESHOLD_BPS) / ROI_STEP_BPS;
        uint256 oldTier;
        if (oldRoiBps >= ROI_THRESHOLD_BPS) {
            oldTier = (oldRoiBps - ROI_THRESHOLD_BPS) / ROI_STEP_BPS;
        }
        return newTier > oldTier;
    }

    /// @dev Calculate total unlocked amount based on ratcheted ROI
    function _calculateUnlocked(TokenInfo storage info) internal view returns (uint256) {
        if (info.highestRoiBps < ROI_THRESHOLD_BPS) return 0;

        // Base: 25% unlocked at 1000% ROI
        uint256 unlockBps = BASE_UNLOCK_BPS; // 2500 = 25%

        // Each additional 10% above 1000%: 5% of remaining locked unlocks
        uint256 stepsAbove = (info.highestRoiBps - ROI_THRESHOLD_BPS) / ROI_STEP_BPS;

        // Iteratively compute: each step unlocks 5% of what's still locked
        // remaining = 10000 - unlockBps
        // For each step: unlock += remaining * 500 / 10000; remaining -= that amount
        uint256 remaining = BPS_DENOMINATOR - unlockBps;
        for (uint256 i = 0; i < stepsAbove && i < 200; i++) {
            uint256 stepUnlock = (remaining * UNLOCK_STEP_BPS) / BPS_DENOMINATOR;
            unlockBps += stepUnlock;
            remaining -= stepUnlock;
        }

        // Apply to total amount
        return (info.totalAmount * unlockBps) / BPS_DENOMINATOR;
    }

    /// @dev Circuit breaker: block if USD spot price > 15% above 24h TWAP
    function _checkCircuitBreaker() internal view {
        // Get TWAP from official pool
        uint32[] memory secondsAgos = new uint32[](2);
        secondsAgos[0] = uint32(TWAP_PERIOD); // 24 hours ago
        secondsAgos[1] = 0; // now

        try OFFICIAL_POOL.observe(secondsAgos) returns (
            int56[] memory tickCumulatives,
            uint160[] memory
        ) {
            // Calculate TWAP tick
            int56 tickDiff = tickCumulatives[1] - tickCumulatives[0];
            int24 twapTick = int24(tickDiff / int56(int32(uint32(TWAP_PERIOD))));

            // Get current tick from slot0
            (, int24 currentTick,,,,,) = OFFICIAL_POOL.slot0();

            // Convert tick difference to price ratio
            // Each tick = ~0.01% price change
            // 15% = ~1500 ticks (approximate)
            int24 tickDelta = currentTick - twapTick;
            // If spot is significantly above TWAP (positive tick delta means USD is more expensive)
            // We need to check the direction based on token ordering
            address token0 = OFFICIAL_POOL.token0();
            bool usdIsToken0 = (token0 == address(USD));

            // If USD is token0, higher tick means USD is cheaper (more WETH per USD)
            // If USD is token1, higher tick means USD is more expensive
            int24 maxTickDelta;
            if (usdIsToken0) {
                // USD cheaper at higher ticks — we want to block if USD is too expensive (lower ticks)
                maxTickDelta = -int24(int256(CIRCUIT_BREAKER_BPS)); // Negative means USD more expensive
                if (tickDelta < maxTickDelta) revert CircuitBreakerTriggered();
            } else {
                // USD more expensive at higher ticks
                maxTickDelta = int24(int256(CIRCUIT_BREAKER_BPS));
                if (tickDelta > maxTickDelta) revert CircuitBreakerTriggered();
            }
        } catch {
            // If TWAP observation fails (insufficient observations), allow the trade
            // The pool may not have enough cardinality
        }
    }
    /// @dev Validate V3 path starts with WETH (first 20 bytes)
    function _validatePathStartsWithWETH(bytes calldata path) internal pure {
        if (path.length < 20) revert InvalidPath();
        address firstToken;
        assembly {
            firstToken := shr(96, calldataload(path.offset))
        }
        if (firstToken != address(0x4200000000000000000000000000000000000006)) revert InvalidPath();
    }

    /// @dev Validate V3 path ends with WETH (last 20 bytes)
    function _validatePathEndsWithWETH(bytes calldata path) internal pure {
        if (path.length < 20) revert InvalidPath();
        address lastToken;
        assembly {
            lastToken := shr(96, calldataload(add(path.offset, sub(path.length, 20))))
        }
        if (lastToken != address(0x4200000000000000000000000000000000000006)) revert InvalidPath();
    }

    /// @dev Validate V3 path ends with USDC (last 20 bytes)
    function _validatePathEndsWithUSDC(bytes calldata path) internal pure {
        if (path.length < 20) revert InvalidPath();
        address lastToken;
        assembly {
            lastToken := shr(96, calldataload(add(path.offset, sub(path.length, 20))))
        }
        if (lastToken != address(0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913)) revert InvalidPath();
    }

    // ═══════════════════════════════════════════════
    // ║              VIEW FUNCTIONS                 ║
    // ═══════════════════════════════════════════════

    /// @notice Get token info for a purchased token
    function getTokenInfo(address token) external view returns (
        uint256 totalCostWei,
        uint256 totalAmount,
        uint256 highestRoiBps,
        uint256 roiTierTimestamp
    ) {
        TokenInfo storage info = tokenInfo[token];
        return (info.totalCostWei, info.totalAmount, info.highestRoiBps, info.roiTierTimestamp);
    }

    /// @notice Check if permissionless rebalance is available for a token
    function isPermissionlessAvailable(address token) external view returns (
        bool available,
        string memory reason
    ) {
        TokenInfo storage info = tokenInfo[token];

        if (info.highestRoiBps < ROI_THRESHOLD_BPS) {
            return (false, "ROI below 1000%");
        }
        if (info.roiTierTimestamp == 0) {
            return (false, "No ROI tier recorded");
        }
        if (block.timestamp < info.roiTierTimestamp + OPERATOR_INACTIVITY_PERIOD) {
            return (false, "14-day waiting period not elapsed");
        }
        if (lastOperatorRebalance > info.roiTierTimestamp) {
            return (false, "Operator rebalanced since tier reached");
        }
        if (block.timestamp < lastPermissionlessAction[token] + PERMISSIONLESS_COOLDOWN) {
            return (false, "4h cooldown not elapsed");
        }

        return (true, "Available");
    }

    /// @notice Get unlocked amount for permissionless rebalance
    function getUnlockedAmount(address token) external view returns (uint256) {
        return _calculateUnlocked(tokenInfo[token]);
    }

    /// @notice Get current caps for an action type
    function getCaps(ActionType action) external view returns (uint256 perAction, uint256 perDay) {
        Caps memory c = caps[action];
        return (c.perAction, c.perDay);
    }

    /// @notice Get remaining daily budget for an action
    function getRemainingDailyBudget(ActionType action) external view returns (uint256) {
        DailyUsage storage usage = dailyUsage[action];
        if (block.timestamp >= usage.resetTime + 1 days) {
            return caps[action].perDay;
        }
        if (usage.amount >= caps[action].perDay) return 0;
        return caps[action].perDay - usage.amount;
    }

    /// @notice Get all tracked tokens
    function getTrackedTokens() external view returns (address[] memory) {
        return trackedTokens;
    }

    /// @notice Get remaining permissionless daily budget
    function getRemainingPermissionlessBudget() external view returns (uint256) {
        DailyUsage storage usage = permissionlessDailyUsage;
        if (block.timestamp >= usage.resetTime + 1 days) {
            return PERMISSIONLESS_PER_DAY_CAP;
        }
        if (usage.amount >= PERMISSIONLESS_PER_DAY_CAP) return 0;
        return PERMISSIONLESS_PER_DAY_CAP - usage.amount;
    }
}
