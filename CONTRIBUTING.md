# Contributing to ÙSD Treasury Manager

Thank you for your interest in contributing to the ÙSD (TurboUSD) Treasury Manager! This project represents a novel approach to AI-operated treasury management on Base, with strict one-directional token flows and permissionless fallback mechanisms.

## Table of Contents

- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Security Considerations](#security-considerations)
- [Areas for Contribution](#areas-for-contribution)
- [Security Disclosure](#security-disclosure)

## Development Setup

### Prerequisites

- **Foundry**: Latest version for contract compilation and testing
  ```bash
  curl -L https://foundry.paradigm.xyz | bash
  foundryup
  ```

- **Node.js**: v18+ for tooling and scripts
  ```bash
  node --version  # Should be v18 or higher
  ```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/clawdbotatg/leftclaw-service-job-8.git
   cd leftclaw-service-job-8
   ```

2. Install dependencies:
   ```bash
   forge install
   ```

3. Set up environment (optional):
   ```bash
   # For mainnet forking tests
   export BASE_RPC_URL="https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY"
   ```

4. Build the project:
   ```bash
   forge build
   ```

5. Run tests:
   ```bash
   forge test
   ```

## Project Structure

```
leftclaw-service-job-8/
├── src/
│   ├── TreasuryManagerV2.sol    # Main treasury management contract
│   └── interfaces/              # Contract interfaces
│       ├── ISwapRouter02.sol
│       ├── IUniversalRouter.sol
│       ├── IUniswapV3Pool.sol
│       ├── IWETH.sol
│       └── IStaking.sol
├── script/                      # Deployment and utility scripts
├── test/                        # Test files
├── lib/                         # Dependencies (OpenZeppelin)
├── foundry.toml                 # Foundry configuration
└── README.md                    # Project documentation
```

### Key Components

- **TreasuryManagerV2.sol**: Core contract managing ÙSD treasury operations
  - AI-operated (AMI - Artificial Monetary Intelligence)
  - One-directional token flows (accumulate → buy → stake → burn)
  - Permissionless fallback for 14-day operator inactivity
  - Hardcoded safety parameters (immutable constants)

## Coding Standards

### Solidity Style

- **Version**: Use `pragma solidity 0.8.26;` (pinned version)
- **Style Guide**: Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- **Naming**:
  - Contracts: `PascalCase`
  - Functions/Variables: `camelCase`
  - Constants: `SCREAMING_SNAKE_CASE`
  - Immutable: `camelCase` with `i_` prefix (if applicable)
- **Comments**: Use NatSpec format for all public/external functions
- **Imports**: Group by external, then internal; alphabetize within groups

### Example

```solidity
/// @notice Executes a buyback of USD using WETH
/// @param amountIn The amount of WETH to spend
/// @param minAmountOut Minimum USD to receive (slippage protection)
/// @dev Only callable by operator or permissionless after cooldown
function executeBuyback(uint256 amountIn, uint256 minAmountOut) external {
    // Implementation
}
```

### Gas Optimization

- Use `immutable` for values set in constructor
- Prefer `calldata` over `memory` for external function parameters
- Use unchecked blocks where overflow is impossible
- Pack struct variables to minimize storage slots

## Testing Requirements

### Test Coverage

- **Minimum**: 80% line coverage
- **Focus Areas**:
  - Operator action validation
  - Permissionless fallback triggers
  - Slippage protection
  - Circuit breaker functionality
  - Reentrancy protection

### Test Types

1. **Unit Tests**: Individual function behavior
2. **Integration Tests**: Multi-contract interactions
3. **Fork Tests**: Against Base mainnet state (use sparingly)

### Running Tests

```bash
# Run all tests
forge test

# Run with verbosity
forge test -vvv

# Run specific test
forge test --match-test testExecuteBuyback

# Run with gas report
forge test --gas-report

# Run coverage
forge coverage
```

### Test Naming

- Descriptive names: `testExecuteBuybackWithValidSlippage`
- Fuzz tests: `testFuzz_ExecuteBuyback(uint256 amount)`
- Invariant tests: `invariant_TreasuryNeverDecreases`

## Security Considerations

### Critical Areas

1. **One-Directional Flows**: Never implement sell functionality
   - Tokens can only: accumulate → buy USD → stake → burn
   - Selling USD or treasury tokens is strictly prohibited

2. **Operator Permissions**: AMI agent has significant power
   - Operator can execute buybacks, burns, stakes
   - Owner can change operator but with time delays
   - All operator actions have per-action and per-day caps

3. **Permissionless Fallback**: Anyone can trigger rebalances
   - Only for tokens with 1000%+ ROI after 14 days of inactivity
   - Strict slippage limits (3%)
   - Per-action cap: 0.5 ETH, Per-day cap: 2 ETH

4. **Circuit Breakers**: 15% deviation from 24h TWAP
   - Prevents manipulation during volatile periods
   - Automatic protection, no governance needed

5. **Slippage Protection**: All swaps have minimum output
   - Permissionless: 3% slippage tolerance
   - Operator: Configurable but bounded

### Security Checklist

Before submitting PRs:
- [ ] No sell functionality added
- [ ] All external calls use reentrancy guards
- [ ] Slippage parameters validated
- [ ] Access controls properly implemented
- [ ] No storage collision risks
- [ ] Events emitted for all state changes

## Areas for Contribution

### High Priority

1. **Enhanced Monitoring**: Off-chain monitoring for operator health
   - Alert systems for operator inactivity
   - Treasury balance tracking
   - ROI calculation automation

2. **Additional Interfaces**: Support for new DEXs or routers
   - Must maintain one-directional flow constraint
   - Require security review for any new integrations

3. **Testing Improvements**: Expand test coverage
   - Edge cases for permissionless triggers
   - Fuzzing for mathematical operations
   - Gas optimization tests

### Medium Priority

4. **Documentation**: Improve technical documentation
   - Architecture diagrams
   - Operator runbooks
   - Integration guides for other protocols

5. **Analytics**: On-chain analytics and reporting
   - Treasury performance metrics
   - Buyback history tracking
   - ROI calculations per token

### Low Priority

6. **Tooling**: Developer experience improvements
   - Deployment scripts
   - Verification scripts
   - Gas estimation tools

## Security Disclosure

**⚠️ Please do not file public issues for security vulnerabilities.**

If you discover a security vulnerability:

1. **Email**: Send details to the repository maintainers
2. **Encryption**: Use PGP if available
3. **Response Time**: Expect acknowledgment within 48 hours
4. **Disclosure**: We will coordinate responsible disclosure

### Scope

Security issues of particular interest:
- Bypassing one-directional flow constraints
- Operator privilege escalation
- Permissionless fallback manipulation
- Slippage protection bypasses
- Reentrancy attacks
- Oracle manipulation

---

Thank you for contributing to ÙSD Treasury Manager! Your efforts help build more robust AI-operated DeFi infrastructure on Base.
