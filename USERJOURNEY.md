# User Journey — TreasuryManager V2

## Personas

### 1. Owner (Client)
The contract owner who deploys and configures the treasury.

### 2. Operator (AMI)
The AI agent that actively manages treasury operations.

### 3. Public User
Anyone who can trigger permissionless rebalances when conditions are met.

---

## Journey 1: Owner Setup

1. **Deploy contract** — Owner deploys TreasuryManagerV2 with their address as owner, sets operator and USDC recipient
2. **Fund the treasury** — Send ETH/WETH/USDC to the contract address
3. **Set operator** — Call `setOperator()` to authorize the AMI agent
4. **Configure caps** — Optionally adjust default caps via `updateCaps()`
5. **Set slippage** — Optionally adjust operator slippage via `setSlippage()`

## Journey 2: Operator Buyback (WETH)

1. Operator sees WETH balance in treasury dashboard
2. Clicks "Buyback with WETH" → enters amount
3. Contract checks: operator role, 60-min cooldown, within per-action cap, within daily cap
4. Swaps WETH → ₸USD via official V3 pool
5. ₸USD stays in contract. Dashboard updates balances.

## Journey 3: Operator Buyback (USDC)

1. Operator sees USDC balance in treasury
2. Clicks "Buyback with USDC" → enters amount
3. Contract swaps: USDC → WETH → ₸USD (two hops, via official pool)
4. ₸USD stays in contract

## Journey 4: Operator Burns ₸USD

1. Operator has ₸USD in treasury
2. Clicks "Burn" → enters amount
3. Contract sends ₸USD to `0x...dEaD`
4. Dashboard shows reduced ₸USD balance, burn event logged

## Journey 5: Operator Stakes ₸USD

1. Operator clicks "Stake" → enters amount and pool ID
2. Contract approves staking contract, deposits ₸USD
3. Dashboard shows staked amount

## Journey 6: Operator Unstakes

1. Operator clicks "Unstake" → enters pool ID
2. Contract withdraws full balance + rewards from staking
3. No caps, no cooldown — always available
4. Dashboard shows increased ₸USD balance

## Journey 7: Operator Buys Token with ETH

1. Operator identifies a token opportunity
2. Clicks "Buy Token" → enters token address, ETH amount, swap path
3. Contract wraps ETH → WETH, swaps via V3 router
4. Records cost basis via balanceOf delta
5. Token appears in tracked tokens list

## Journey 8: Operator Rebalances

1. Operator sees a tracked token with high ROI
2. Clicks "Rebalance" → enters token, amount, paths
3. Contract splits: 75% → WETH → ₸USD (stays), 25% → USDC to owner
4. Updates ROI tracking based on actual swap output
5. Updates lastOperatorRebalance timestamp

## Journey 9: Permissionless Rebalance

1. Public user sees a token with 1000%+ ROI in the dashboard
2. Checks: ROI ≥ 1000%, 14 days since tier reached, no operator rebalance since then
3. Clicks "Permissionless Rebalance" → enters token, amount, paths
4. Contract enforces: max 5% of unlocked, 4h cooldown, 0.5 ETH per action, 2 ETH per day, circuit breaker
5. Executes 75/25 split with immutable 3% slippage
6. Treasury continues accumulating ₸USD even if operator is offline

## Journey 10: Dead Pool Rescue (Owner Only)

1. Pool has been inactive for 90+ days
2. Owner calls `rescueDeadPoolToken()` with token and path
3. Contract swaps token → WETH (stays in contract)
4. Treasury preserves value even from dead positions

---

## Key UX Flows in Frontend

### Connect Wallet
1. User lands on page → sees "Connect Wallet" button
2. Connects → app detects if owner, operator, or public

### Four-State Button Flow
1. **Not connected** → Connect Wallet
2. **Wrong network** → Switch to Base
3. **Needs approval** → Approve (for token operations)
4. **Ready** → Execute Action

### Dashboard View
- Treasury balances (ETH, WETH, USDC, ₸USD)
- Tracked tokens with cost basis and ROI
- Operator status (last action, cooldowns)
- Permissionless availability per token
- Recent events (buybacks, burns, stakes, rebalances)
