# 🏦 ₸USD Treasury Manager V2

Onchain treasury management contract for **₸USD (TurboUSD)** on **Base**, operated by AMI (Artificial Monetary Intelligence).

The contract enforces strict one-directional token flows: tokens are accumulated into the treasury, ₸USD can only be **bought**, **staked**, or **burned** — **never sold**. A permissionless fallback mechanism guarantees ₸USD buybacks will continue even if the operator goes offline.

## 🔗 Links

| Resource | Link |
|----------|------|
| **Frontend** | [IPFS Dashboard](https://bafybeidmputmhonuees4ww7kjokso46f2qf5d3vyrgemrznldpayl5a2pa.ipfs.community.bgipfs.com/) |
| **Contract** | [`0xC5127c4b0e5AC19088D233AB43C0FFd1E1134332`](https://base.blockscout.com/address/0xC5127c4b0e5AC19088D233AB43C0FFd1E1134332) |
| **₸USD Token** | [`0x3d5e487B21E0569048c4D1A60E98C36e1B09DB07`](https://basescan.org/token/0x3d5e487b21e0569048c4d1a60e98c36e1b09db07) |
| **Official Pool** | [`0xd013725b904e76394A3aB0334Da306C505D778F8`](https://basescan.org/address/0xd013725b904e76394a3ab0334da306c505d778f8) |
| **Network** | Base (Chain ID: 8453) |

## 🏗 Architecture

### Roles

| Role | Description |
|------|-------------|
| **Owner** | Client who deploys the contract. Sets operator, configures caps, rescues dead pool tokens. |
| **Operator** | AMI agent. Executes buybacks, burns, stakes, token purchases, and rebalances. |
| **Permissionless** | Anyone. Triggers rebalances when tokens hit 1000%+ ROI after 14 days of operator inactivity. |

### Key Functions

#### Owner-Only
- `setOperator(address)` — Set the AMI operator
- `updateCaps(ActionType, perAction, perDay)` — Configure operator limits
- `setSlippage(uint256 bps)` — Set operator slippage tolerance (max 10%)
- `rescueDeadPoolToken(address, bytes)` — Rescue tokens from pools inactive 90+ days

#### Operator-Only (60-min cooldown, caps enforced)
- `buybackWithWETH(uint256)` — WETH → ₸USD via official pool
- `buybackWithUSDC(uint256)` — USDC → WETH → ₸USD
- `burn(uint256)` — Send ₸USD to 0xdead
- `stake(uint256, uint256)` — Deposit ₸USD to staking contract
- `unstake(uint256)` — Withdraw + rewards (no caps, no cooldown)
- `buyTokenWithETH(address, uint256, bytes)` — Buy ERC20s, track cost basis
- `rebalance(address, uint256, bytes, bytes)` — 75% → ₸USD, 25% → USDC to owner

#### Permissionless
- `permissionlessRebalance(address, uint256, bytes, bytes)` — Anyone can rebalance when:
  - ROI ≥ 1000% (vs weighted average cost)
  - 14 days since ROI tier reached with no operator rebalance
  - Max 5% of unlocked per tx
  - 4-hour cooldown per token
  - Circuit breaker: blocks if ₸USD spot > 15% above 24h TWAP

### Immutable Constants (Hardcoded, Never Changeable)

| Parameter | Value |
|-----------|-------|
| Permissionless Slippage | 3% (300 bps) |
| Permissionless Cooldown | 4 hours |
| Max Per Swap | 5% of unlocked |
| Circuit Breaker | 15% vs 24h TWAP |
| Operator Inactivity | 14 days |
| Dead Pool Threshold | 90 days |
| Operator Cooldown | 60 minutes |
| Per-Action Cap | 0.5 ETH |
| Per-Day Cap | 2 ETH |

### Default Operator Caps (Owner-Configurable)

| Action | Per Action | Per Day |
|--------|-----------|---------|
| BuybackWETH | 0.5 ETH | 2 ETH |
| BuybackUSDC | 2,000 USDC | 5,000 USDC |
| Burn | 100M ₸USD | 500M ₸USD |
| Stake | 100M ₸USD | 500M ₸USD |
| Rebalance | 0.5 ETH (equiv) | 2 ETH (equiv) |

## 🔒 Security

- **Ownable2Step** — Two-step ownership transfer
- **ReentrancyGuard** — On all external calls
- **CEI Pattern** — Checks-Effects-Interactions
- **SafeERC20** — Safe token transfers
- **balanceOf deltas** — All accounting uses balance snapshots
- **24h TWAP** — For ROI checks, circuit breaker, and slippage protection
- **Integer safety** — Solidity 0.8.26 built-in overflow protection

### Contract Prohibitions
- ❌ No withdrawals of any kind
- ❌ No selling ₸USD
- ❌ No LP management
- ❌ No changing permissionless parameters
- ❌ All ₸USD purchases through official pool only

## 🛠 Development

### Prerequisites
- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- [Node.js 18+](https://nodejs.org/)
- [Yarn](https://yarnpkg.com/)

### Build & Test

```bash
# Build contract
forge build

# Run tests
forge test -vvv

# Deploy (set env vars first)
PRIVATE_KEY=... OWNER_ADDRESS=... OPERATOR_ADDRESS=... USDC_RECIPIENT_ADDRESS=... \
  forge script script/DeployTreasuryManagerV2.s.sol --rpc-url $RPC_URL --broadcast
```

### Frontend

```bash
cd packages/nextjs
yarn install
yarn dev
```

## 📜 License

MIT
