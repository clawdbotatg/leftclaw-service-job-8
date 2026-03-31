# PLAN.md — TreasuryManager V2

## Overview
TreasuryManager v2 is an onchain treasury management contract for ₸USD (TurboUSD) on Base, operated by AMI (Artificial Monetary Intelligence). The contract enforces strict one-directional token flows: tokens are accumulated into the treasury, ₸USD can only be bought, staked, or burned — never sold.

## Architecture

### Single Contract: `TreasuryManagerV2.sol`
- Solidity 0.8.26, no proxy/upgradability
- Ownable2Step for ownership (two-step transfer)
- ReentrancyGuard + CEI pattern
- SafeERC20 for all token ops

### Key Roles
| Role | Description |
|------|-------------|
| **Owner** | Client (`0x9ba58Eea1Ea9ABDEA25BA83603D54F6D9A01E506`). Sets operator, configures caps, rescues dead pool tokens |
| **Operator** | AMI agent. Executes buybacks, burns, stakes, token purchases, rebalances |
| **Permissionless** | Anyone. Rebalances tokens that hit 1000%+ ROI after 14 days of operator inactivity |

### Contract Addresses (Base Mainnet)
| Contract | Address |
|----------|---------|
| WETH | `0x4200000000000000000000000000000000000006` |
| USDC | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| ₸USD | `0x583866fb22a3d67d7c45e1D0F34BcB20Bf9c6353` |
| Official ₸USD/WETH V3 Pool | `0xAD501A478bF0F81C42C8C80ea08968f5Aa4c2f9A` |
| Staking | `0x2a70a42BC0524aBCA9Bff59a51E7aAdB575DC89A` |
| V3 SwapRouter02 | `0x2626664c2603336E57B271c5C0b26F421741e481` |
| Universal Router | `0x6fF5693b99212Da76ad316178A184AB56D299b43` |

### Immutable Constants
| Parameter | Value |
|-----------|-------|
| Permissionless slippage | 3% (300 bps) |
| Permissionless cooldown | 4 hours |
| Max per swap (permissionless) | 5% of unlocked |
| Circuit breaker vs 24h TWAP | 15% |
| Operator inactivity period | 14 days |
| Dead pool threshold | 90 days |
| Operator cooldown | 60 minutes |
| Permissionless per-action cap | 0.5 ETH |
| Permissionless per-day cap | 2 ETH |

### Operator Caps (Owner-Configurable)
| Action | Per Action | Per Day |
|--------|-----------|---------|
| BuybackWETH | 0.5 ETH | 2 ETH |
| BuybackUSDC | 2,000 USDC | 5,000 USDC |
| Burn | 100M ₸USD | 500M ₸USD |
| Stake | 100M ₸USD | 500M ₸USD |
| Rebalance | 0.5 ETH (equiv) | 2 ETH (equiv) |

## Functions

### Owner-Only
- `setOperator(address)` — Set AMI operator
- `updateCaps(ActionType, perAction, perDay)` — Change operator caps
- `setSlippage(uint256 bps)` — Operator slippage (max 10%)
- `rescueDeadPoolToken(address, bytes)` — After 90+ days dead pool

### Operator-Only (60-min cooldown, caps enforced)
- `buybackWithWETH(uint256)` — WETH → ₸USD
- `buybackWithUSDC(uint256)` — USDC → WETH → ₸USD
- `burn(uint256)` — Partial burn to 0xdead
- `stake(uint256, uint256)` — Deposit to staking
- `unstake(uint256)` — Withdraw + rewards (no caps, no cooldown)
- `buyTokenWithETH(address, uint256, bytes)` — Buy ERC20 with ETH
- `rebalance(address, uint256, bytes, bytes)` — 75/25 split

### Permissionless
- `permissionlessRebalance(address, uint256, bytes, bytes)` — Requires 1000%+ ROI + 14 days inactivity

## Prohibitions
- No withdrawals
- No selling ₸USD
- No LP management
- No changing permissionless parameters
- All ₸USD purchases through official pool only

## Frontend
- Scaffold-ETH 2 based dashboard
- Read-only treasury status display
- Owner management panel (set operator, update caps)
- Operator action panel (buyback, burn, stake, rebalance)
- Permissionless rebalance panel

## Deployment
1. Deploy contract with owner = client address
2. Verify on Basescan
3. Deploy frontend to IPFS
