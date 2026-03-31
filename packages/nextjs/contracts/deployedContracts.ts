import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";

const deployedContracts = {
  8453: {
    TreasuryManagerV2: {
      address: "0xC5127c4b0e5AC19088D233AB43C0FFd1E1134332",
      abi: [
      {
            "type": "constructor",
            "inputs": [
                  {
                        "name": "_owner",
                        "type": "address",
                        "internalType": "address"
                  },
                  {
                        "name": "_operator",
                        "type": "address",
                        "internalType": "address"
                  },
                  {
                        "name": "_usdcRecipient",
                        "type": "address",
                        "internalType": "address"
                  }
            ],
            "stateMutability": "nonpayable"
      },
      {
            "type": "receive",
            "stateMutability": "payable"
      },
      {
            "type": "function",
            "name": "BASE_UNLOCK_BPS",
            "inputs": [],
            "outputs": [
                  {
                        "name": "",
                        "type": "uint256",
                        "internalType": "uint256"
                  }
            ],
            "stateMutability": "view"
      },
      {
            "type": "function",
            "name": "BPS_DENOMINATOR",
            "inputs": [],
            "outputs": [
                  {
                        "name": "",
                        "type": "uint256",
                        "internalType": "uint256"
                  }
            ],
            "stateMutability": "view"
      },
      {
            "type": "function",
            "name": "CIRCUIT_BREAKER_BPS",
            "inputs": [],
            "outputs": [
                  {
                        "name": "",
                        "type": "uint256",
                        "internalType": "uint256"
                  }
            ],
            "stateMutability": "view"
      },
      {
            "type": "function",
            "name": "DEAD_POOL_THRESHOLD",
            "inputs": [],
            "outputs": [
                  {
                        "name": "",
                        "type": "uint256",
                        "internalType": "uint256"
                  }
            ],
            "stateMutability": "view"
      },
      {
            "type": "function",
            "name": "OFFICIAL_POOL",
            "inputs": [],
            "outputs": [
                  {
                        "name": "",
                        "type": "address",
                        "internalType": "contract IUniswapV3Pool"
                  }
            ],
            "stateMutability": "view"
      },
      {
            "type": "function",
            "name": "OPERATOR_COOLDOWN",
            "inputs": [],
            "outputs": [
                  {
                        "name": "",
                        "type": "uint256",
                        "internalType": "uint256"
                  }
            ],
            "stateMutability": "view"
      },
      {
            "type": "function",
            "name": "OPERATOR_INACTIVITY_PERIOD",
            "inputs": [],
            "outputs": [
                  {
                        "name": "",
                        "type": "uint256",
                        "internalType": "uint256"
                  }
            ],
            "stateMutability": "view"
      },
      {
            "type": "function",
            "name": "PERMISSIONLESS_COOLDOWN",
            "inputs": [],
            "outputs": [
                  {
                        "name": "",
                        "type": "uint256",
                        "internalType": "uint256"
                  }
            ],
            "stateMutability": "view"
      },
      {
            "type": "function",
            "name": "PERMISSIONLESS_MAX_PCT",
            "inputs": [],
            "outputs": [
                  {
                        "name": "",
                        "type": "uint256",
                        "internalType": "uint256"
                  }
            ],
            "stateMutability": "view"
      },
      {
            "type": "function",
            "name": "PERMISSIONLESS_PER_ACTION_CAP",
            "inputs": [],
            "outputs": [
                  {
                        "name": "",
                        "type": "uint256",
                        "internalType": "uint256"
                  }
            ],
            "stateMutability": "view"
      },
      {
            "type": "function",
            "name": "PERMISSIONLESS_PER_DAY_CAP",
            "inputs": [],
            "outputs": [
                  {
                        "name": "",
                        "type": "uint256",
                        "internalType": "uint256"
                  }
            ],
            "stateMutability": "view"
      },
      {
            "type": "function",
            "name": "ROI_STEP_BPS",
            "inputs": [],
            "outputs": [
                  {
                        "name": "",
                        "type": "uint256",
                        "internalType": "uint256"
                  }
            ],
            "stateMutability": "view"
      },
      {
            "type": "function",
            "name": "ROI_THRESHOLD_BPS",
            "inputs": [],
            "outputs": [
                  {
                        "name": "",
                        "type": "uint256",
                        "internalType": "uint256"
                  }
            ],
            "stateMutability": "view"
      },
      {
            "type": "function",
            "name": "SLIPPAGE_BPS",
            "inputs": [],
            "outputs": [
                  {
                        "name": "",
                        "type": "uint256",
                        "internalType": "uint256"
                  }
            ],
            "stateMutability": "view"
      },
      {
            "type": "function",
            "name": "STAKING",
            "inputs": [],
            "outputs": [
                  {
                        "name": "",
                        "type": "address",
                        "internalType": "contract IStaking"
                  }
            ],
            "stateMutability": "view"
      },
      {
            "type": "function",
            "name": "TWAP_PERIOD",
            "inputs": [],
            "outputs": [
                  {
                        "name": "",
                        "type": "uint256",
                        "internalType": "uint256"
                  }
            ],
            "stateMutability": "view"
      },
      {
            "type": "function",
            "name": "UNIVERSAL_ROUTER",
            "inputs": [],
            "outputs": [
                  {
                        "name": "",
                        "type": "address",
                        "internalType": "contract IUniversalRouter"
                  }
            ],
            "stateMutability": "view"
      },
      {
            "type": "function",
            "name": "UNLOCK_STEP_BPS",
            "inputs": [],
            "outputs": [
                  {
                        "name": "",
                        "type": "uint256",
                        "internalType": "uint256"
                  }
            ],
            "stateMutability": "view"
      },
      {
            "type": "function",
            "name": "USD",
            "inputs": [],
            "outputs": [
                  {
                        "name": "",
                        "type": "address",
                        "internalType": "contract IERC20"
                  }
            ],
            "stateMutability": "view"
      },
      {
            "type": "function",
            "name": "USDC",
            "inputs": [],
            "outputs": [
                  {
                        "name": "",
                        "type": "address",
                        "internalType": "contract IERC20"
                  }
            ],
            "stateMutability": "view"
      },
      {
            "type": "function",
            "name": "V3_ROUTER",
            "inputs": [],
            "outputs": [
                  {
                        "name": "",
                        "type": "address",
                        "internalType": "contract ISwapRouter02"
                  }
            ],
            "stateMutability": "view"
      },
      {
            "type": "function",
            "name": "WETH",
            "inputs": [],
            "outputs": [
                  {
                        "name": "",
                        "type": "address",
                        "internalType": "contract IWETH"
                  }
            ],
            "stateMutability": "view"
      },
      {
            "type": "function",
            "name": "acceptOwnership",
            "inputs": [],
            "outputs": [],
            "stateMutability": "nonpayable"
      },
      {
            "type": "function",
            "name": "burn",
            "inputs": [
                  {
                        "name": "amount",
                        "type": "uint256",
                        "internalType": "uint256"
                  }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
      },
      {
            "type": "function",
            "name": "buyTokenWithETH",
            "inputs": [
                  {
                        "name": "token",
                        "type": "address",
                        "internalType": "address"
                  },
                  {
                        "name": "amountETH",
                        "type": "uint256",
                        "internalType": "uint256"
                  },
                  {
                        "name": "path",
                        "type": "bytes",
                        "internalType": "bytes"
                  }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
      },
      {
            "type": "function",
            "name": "buybackWithUSDC",
            "inputs": [
                  {
                        "name": "amountIn",
                        "type": "uint256",
                        "internalType": "uint256"
                  }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
      },
      {
            "type": "function",
            "name": "buybackWithWETH",
            "inputs": [
                  {
                        "name": "amountIn",
                        "type": "uint256",
                        "internalType": "uint256"
                  }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
      },
      {
            "type": "function",
            "name": "caps",
            "inputs": [
                  {
                        "name": "",
                        "type": "uint8",
                        "internalType": "enum TreasuryManagerV2.ActionType"
                  }
            ],
            "outputs": [
                  {
                        "name": "perAction",
                        "type": "uint256",
                        "internalType": "uint256"
                  },
                  {
                        "name": "perDay",
                        "type": "uint256",
                        "internalType": "uint256"
                  }
            ],
            "stateMutability": "view"
      },
      {
            "type": "function",
            "name": "dailyUsage",
            "inputs": [
                  {
                        "name": "",
                        "type": "uint8",
                        "internalType": "enum TreasuryManagerV2.ActionType"
                  }
            ],
            "outputs": [
                  {
                        "name": "amount",
                        "type": "uint256",
                        "internalType": "uint256"
                  },
                  {
                        "name": "resetTime",
                        "type": "uint256",
                        "internalType": "uint256"
                  }
            ],
            "stateMutability": "view"
      },
      {
            "type": "function",
            "name": "getCaps",
            "inputs": [
                  {
                        "name": "action",
                        "type": "uint8",
                        "internalType": "enum TreasuryManagerV2.ActionType"
                  }
            ],
            "outputs": [
                  {
                        "name": "perAction",
                        "type": "uint256",
                        "internalType": "uint256"
                  },
                  {
                        "name": "perDay",
                        "type": "uint256",
                        "internalType": "uint256"
                  }
            ],
            "stateMutability": "view"
      },
      {
            "type": "function",
            "name": "getRemainingDailyBudget",
            "inputs": [
                  {
                        "name": "action",
                        "type": "uint8",
                        "internalType": "enum TreasuryManagerV2.ActionType"
                  }
            ],
            "outputs": [
                  {
                        "name": "",
                        "type": "uint256",
                        "internalType": "uint256"
                  }
            ],
            "stateMutability": "view"
      },
      {
            "type": "function",
            "name": "getRemainingPermissionlessBudget",
            "inputs": [],
            "outputs": [
                  {
                        "name": "",
                        "type": "uint256",
                        "internalType": "uint256"
                  }
            ],
            "stateMutability": "view"
      },
      {
            "type": "function",
            "name": "getTokenInfo",
            "inputs": [
                  {
                        "name": "token",
                        "type": "address",
                        "internalType": "address"
                  }
            ],
            "outputs": [
                  {
                        "name": "totalCostWei",
                        "type": "uint256",
                        "internalType": "uint256"
                  },
                  {
                        "name": "totalAmount",
                        "type": "uint256",
                        "internalType": "uint256"
                  },
                  {
                        "name": "highestRoiBps",
                        "type": "uint256",
                        "internalType": "uint256"
                  },
                  {
                        "name": "roiTierTimestamp",
                        "type": "uint256",
                        "internalType": "uint256"
                  }
            ],
            "stateMutability": "view"
      },
      {
            "type": "function",
            "name": "getTrackedTokens",
            "inputs": [],
            "outputs": [
                  {
                        "name": "",
                        "type": "address[]",
                        "internalType": "address[]"
                  }
            ],
            "stateMutability": "view"
      },
      {
            "type": "function",
            "name": "getUnlockedAmount",
            "inputs": [
                  {
                        "name": "token",
                        "type": "address",
                        "internalType": "address"
                  }
            ],
            "outputs": [
                  {
                        "name": "",
                        "type": "uint256",
                        "internalType": "uint256"
                  }
            ],
            "stateMutability": "view"
      },
      {
            "type": "function",
            "name": "isPermissionlessAvailable",
            "inputs": [
                  {
                        "name": "token",
                        "type": "address",
                        "internalType": "address"
                  }
            ],
            "outputs": [
                  {
                        "name": "available",
                        "type": "bool",
                        "internalType": "bool"
                  },
                  {
                        "name": "reason",
                        "type": "string",
                        "internalType": "string"
                  }
            ],
            "stateMutability": "view"
      },
      {
            "type": "function",
            "name": "isTrackedToken",
            "inputs": [
                  {
                        "name": "",
                        "type": "address",
                        "internalType": "address"
                  }
            ],
            "outputs": [
                  {
                        "name": "",
                        "type": "bool",
                        "internalType": "bool"
                  }
            ],
            "stateMutability": "view"
      },
      {
            "type": "function",
            "name": "lastOperatorAction",
            "inputs": [
                  {
                        "name": "",
                        "type": "uint8",
                        "internalType": "enum TreasuryManagerV2.ActionType"
                  }
            ],
            "outputs": [
                  {
                        "name": "",
                        "type": "uint256",
                        "internalType": "uint256"
                  }
            ],
            "stateMutability": "view"
      },
      {
            "type": "function",
            "name": "lastOperatorRebalance",
            "inputs": [],
            "outputs": [
                  {
                        "name": "",
                        "type": "uint256",
                        "internalType": "uint256"
                  }
            ],
            "stateMutability": "view"
      },
      {
            "type": "function",
            "name": "lastPermissionlessAction",
            "inputs": [
                  {
                        "name": "",
                        "type": "address",
                        "internalType": "address"
                  }
            ],
            "outputs": [
                  {
                        "name": "",
                        "type": "uint256",
                        "internalType": "uint256"
                  }
            ],
            "stateMutability": "view"
      },
      {
            "type": "function",
            "name": "lastPoolInteraction",
            "inputs": [],
            "outputs": [
                  {
                        "name": "",
                        "type": "uint256",
                        "internalType": "uint256"
                  }
            ],
            "stateMutability": "view"
      },
      {
            "type": "function",
            "name": "operator",
            "inputs": [],
            "outputs": [
                  {
                        "name": "",
                        "type": "address",
                        "internalType": "address"
                  }
            ],
            "stateMutability": "view"
      },
      {
            "type": "function",
            "name": "operatorSlippageBps",
            "inputs": [],
            "outputs": [
                  {
                        "name": "",
                        "type": "uint256",
                        "internalType": "uint256"
                  }
            ],
            "stateMutability": "view"
      },
      {
            "type": "function",
            "name": "owner",
            "inputs": [],
            "outputs": [
                  {
                        "name": "",
                        "type": "address",
                        "internalType": "address"
                  }
            ],
            "stateMutability": "view"
      },
      {
            "type": "function",
            "name": "pendingOwner",
            "inputs": [],
            "outputs": [
                  {
                        "name": "",
                        "type": "address",
                        "internalType": "address"
                  }
            ],
            "stateMutability": "view"
      },
      {
            "type": "function",
            "name": "permissionlessDailyUsage",
            "inputs": [],
            "outputs": [
                  {
                        "name": "amount",
                        "type": "uint256",
                        "internalType": "uint256"
                  },
                  {
                        "name": "resetTime",
                        "type": "uint256",
                        "internalType": "uint256"
                  }
            ],
            "stateMutability": "view"
      },
      {
            "type": "function",
            "name": "permissionlessRebalance",
            "inputs": [
                  {
                        "name": "token",
                        "type": "address",
                        "internalType": "address"
                  },
                  {
                        "name": "amount",
                        "type": "uint256",
                        "internalType": "uint256"
                  },
                  {
                        "name": "pathToWETH",
                        "type": "bytes",
                        "internalType": "bytes"
                  },
                  {
                        "name": "pathToUSDC",
                        "type": "bytes",
                        "internalType": "bytes"
                  }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
      },
      {
            "type": "function",
            "name": "rebalance",
            "inputs": [
                  {
                        "name": "token",
                        "type": "address",
                        "internalType": "address"
                  },
                  {
                        "name": "amount",
                        "type": "uint256",
                        "internalType": "uint256"
                  },
                  {
                        "name": "pathToWETH",
                        "type": "bytes",
                        "internalType": "bytes"
                  },
                  {
                        "name": "pathToUSDC",
                        "type": "bytes",
                        "internalType": "bytes"
                  }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
      },
      {
            "type": "function",
            "name": "renounceOwnership",
            "inputs": [],
            "outputs": [],
            "stateMutability": "nonpayable"
      },
      {
            "type": "function",
            "name": "rescueDeadPoolToken",
            "inputs": [
                  {
                        "name": "token",
                        "type": "address",
                        "internalType": "address"
                  },
                  {
                        "name": "path",
                        "type": "bytes",
                        "internalType": "bytes"
                  }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
      },
      {
            "type": "function",
            "name": "setOperator",
            "inputs": [
                  {
                        "name": "_operator",
                        "type": "address",
                        "internalType": "address"
                  }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
      },
      {
            "type": "function",
            "name": "setSlippage",
            "inputs": [
                  {
                        "name": "bps",
                        "type": "uint256",
                        "internalType": "uint256"
                  }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
      },
      {
            "type": "function",
            "name": "stake",
            "inputs": [
                  {
                        "name": "amount",
                        "type": "uint256",
                        "internalType": "uint256"
                  },
                  {
                        "name": "poolId",
                        "type": "uint256",
                        "internalType": "uint256"
                  }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
      },
      {
            "type": "function",
            "name": "tokenInfo",
            "inputs": [
                  {
                        "name": "",
                        "type": "address",
                        "internalType": "address"
                  }
            ],
            "outputs": [
                  {
                        "name": "totalCostWei",
                        "type": "uint256",
                        "internalType": "uint256"
                  },
                  {
                        "name": "totalAmount",
                        "type": "uint256",
                        "internalType": "uint256"
                  },
                  {
                        "name": "highestRoiBps",
                        "type": "uint256",
                        "internalType": "uint256"
                  },
                  {
                        "name": "roiTierTimestamp",
                        "type": "uint256",
                        "internalType": "uint256"
                  }
            ],
            "stateMutability": "view"
      },
      {
            "type": "function",
            "name": "trackedTokens",
            "inputs": [
                  {
                        "name": "",
                        "type": "uint256",
                        "internalType": "uint256"
                  }
            ],
            "outputs": [
                  {
                        "name": "",
                        "type": "address",
                        "internalType": "address"
                  }
            ],
            "stateMutability": "view"
      },
      {
            "type": "function",
            "name": "transferOwnership",
            "inputs": [
                  {
                        "name": "newOwner",
                        "type": "address",
                        "internalType": "address"
                  }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
      },
      {
            "type": "function",
            "name": "unstake",
            "inputs": [
                  {
                        "name": "poolId",
                        "type": "uint256",
                        "internalType": "uint256"
                  }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
      },
      {
            "type": "function",
            "name": "updateCaps",
            "inputs": [
                  {
                        "name": "action",
                        "type": "uint8",
                        "internalType": "enum TreasuryManagerV2.ActionType"
                  },
                  {
                        "name": "perAction",
                        "type": "uint256",
                        "internalType": "uint256"
                  },
                  {
                        "name": "perDay",
                        "type": "uint256",
                        "internalType": "uint256"
                  }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
      },
      {
            "type": "function",
            "name": "usdcRecipient",
            "inputs": [],
            "outputs": [
                  {
                        "name": "",
                        "type": "address",
                        "internalType": "address"
                  }
            ],
            "stateMutability": "view"
      },
      {
            "type": "event",
            "name": "BurnExecuted",
            "inputs": [
                  {
                        "name": "amount",
                        "type": "uint256",
                        "indexed": false,
                        "internalType": "uint256"
                  }
            ],
            "anonymous": false
      },
      {
            "type": "event",
            "name": "BuybackExecuted",
            "inputs": [
                  {
                        "name": "token",
                        "type": "address",
                        "indexed": true,
                        "internalType": "address"
                  },
                  {
                        "name": "amountIn",
                        "type": "uint256",
                        "indexed": false,
                        "internalType": "uint256"
                  },
                  {
                        "name": "usdOut",
                        "type": "uint256",
                        "indexed": false,
                        "internalType": "uint256"
                  }
            ],
            "anonymous": false
      },
      {
            "type": "event",
            "name": "CapsUpdated",
            "inputs": [
                  {
                        "name": "actionType",
                        "type": "uint8",
                        "indexed": true,
                        "internalType": "enum TreasuryManagerV2.ActionType"
                  },
                  {
                        "name": "perAction",
                        "type": "uint256",
                        "indexed": false,
                        "internalType": "uint256"
                  },
                  {
                        "name": "perDay",
                        "type": "uint256",
                        "indexed": false,
                        "internalType": "uint256"
                  }
            ],
            "anonymous": false
      },
      {
            "type": "event",
            "name": "DeadPoolTokenRescued",
            "inputs": [
                  {
                        "name": "token",
                        "type": "address",
                        "indexed": true,
                        "internalType": "address"
                  },
                  {
                        "name": "amount",
                        "type": "uint256",
                        "indexed": false,
                        "internalType": "uint256"
                  },
                  {
                        "name": "wethReceived",
                        "type": "uint256",
                        "indexed": false,
                        "internalType": "uint256"
                  }
            ],
            "anonymous": false
      },
      {
            "type": "event",
            "name": "OperatorUpdated",
            "inputs": [
                  {
                        "name": "newOperator",
                        "type": "address",
                        "indexed": true,
                        "internalType": "address"
                  }
            ],
            "anonymous": false
      },
      {
            "type": "event",
            "name": "OwnershipTransferStarted",
            "inputs": [
                  {
                        "name": "previousOwner",
                        "type": "address",
                        "indexed": true,
                        "internalType": "address"
                  },
                  {
                        "name": "newOwner",
                        "type": "address",
                        "indexed": true,
                        "internalType": "address"
                  }
            ],
            "anonymous": false
      },
      {
            "type": "event",
            "name": "OwnershipTransferred",
            "inputs": [
                  {
                        "name": "previousOwner",
                        "type": "address",
                        "indexed": true,
                        "internalType": "address"
                  },
                  {
                        "name": "newOwner",
                        "type": "address",
                        "indexed": true,
                        "internalType": "address"
                  }
            ],
            "anonymous": false
      },
      {
            "type": "event",
            "name": "RebalanceExecuted",
            "inputs": [
                  {
                        "name": "token",
                        "type": "address",
                        "indexed": true,
                        "internalType": "address"
                  },
                  {
                        "name": "amount",
                        "type": "uint256",
                        "indexed": false,
                        "internalType": "uint256"
                  },
                  {
                        "name": "wethPortion",
                        "type": "uint256",
                        "indexed": false,
                        "internalType": "uint256"
                  },
                  {
                        "name": "usdcPortion",
                        "type": "uint256",
                        "indexed": false,
                        "internalType": "uint256"
                  },
                  {
                        "name": "permissionless",
                        "type": "bool",
                        "indexed": false,
                        "internalType": "bool"
                  },
                  {
                        "name": "caller",
                        "type": "address",
                        "indexed": false,
                        "internalType": "address"
                  }
            ],
            "anonymous": false
      },
      {
            "type": "event",
            "name": "SlippageUpdated",
            "inputs": [
                  {
                        "name": "newBps",
                        "type": "uint256",
                        "indexed": false,
                        "internalType": "uint256"
                  }
            ],
            "anonymous": false
      },
      {
            "type": "event",
            "name": "StakeExecuted",
            "inputs": [
                  {
                        "name": "poolId",
                        "type": "uint256",
                        "indexed": false,
                        "internalType": "uint256"
                  },
                  {
                        "name": "amount",
                        "type": "uint256",
                        "indexed": false,
                        "internalType": "uint256"
                  }
            ],
            "anonymous": false
      },
      {
            "type": "event",
            "name": "TokenPurchased",
            "inputs": [
                  {
                        "name": "token",
                        "type": "address",
                        "indexed": true,
                        "internalType": "address"
                  },
                  {
                        "name": "ethSpent",
                        "type": "uint256",
                        "indexed": false,
                        "internalType": "uint256"
                  },
                  {
                        "name": "tokensReceived",
                        "type": "uint256",
                        "indexed": false,
                        "internalType": "uint256"
                  }
            ],
            "anonymous": false
      },
      {
            "type": "event",
            "name": "UnstakeExecuted",
            "inputs": [
                  {
                        "name": "poolId",
                        "type": "uint256",
                        "indexed": false,
                        "internalType": "uint256"
                  },
                  {
                        "name": "amount",
                        "type": "uint256",
                        "indexed": false,
                        "internalType": "uint256"
                  },
                  {
                        "name": "rewards",
                        "type": "uint256",
                        "indexed": false,
                        "internalType": "uint256"
                  }
            ],
            "anonymous": false
      },
      {
            "type": "error",
            "name": "CircuitBreakerTriggered",
            "inputs": []
      },
      {
            "type": "error",
            "name": "CooldownNotElapsed",
            "inputs": []
      },
      {
            "type": "error",
            "name": "ExceedsPerActionCap",
            "inputs": []
      },
      {
            "type": "error",
            "name": "ExceedsPerDayCap",
            "inputs": []
      },
      {
            "type": "error",
            "name": "ExceedsUnlockedAmount",
            "inputs": []
      },
      {
            "type": "error",
            "name": "InsufficientBalance",
            "inputs": []
      },
      {
            "type": "error",
            "name": "InsufficientROI",
            "inputs": []
      },
      {
            "type": "error",
            "name": "InvalidPath",
            "inputs": []
      },
      {
            "type": "error",
            "name": "OnlyOperator",
            "inputs": []
      },
      {
            "type": "error",
            "name": "OperatorStillActive",
            "inputs": []
      },
      {
            "type": "error",
            "name": "OwnableInvalidOwner",
            "inputs": [
                  {
                        "name": "owner",
                        "type": "address",
                        "internalType": "address"
                  }
            ]
      },
      {
            "type": "error",
            "name": "OwnableUnauthorizedAccount",
            "inputs": [
                  {
                        "name": "account",
                        "type": "address",
                        "internalType": "address"
                  }
            ]
      },
      {
            "type": "error",
            "name": "PoolNotDead",
            "inputs": []
      },
      {
            "type": "error",
            "name": "ReentrancyGuardReentrantCall",
            "inputs": []
      },
      {
            "type": "error",
            "name": "SafeERC20FailedOperation",
            "inputs": [
                  {
                        "name": "token",
                        "type": "address",
                        "internalType": "address"
                  }
            ]
      },
      {
            "type": "error",
            "name": "SlippageTooHigh",
            "inputs": []
      },
      {
            "type": "error",
            "name": "UnlockNotReady",
            "inputs": []
      },
      {
            "type": "error",
            "name": "ZeroAddress",
            "inputs": []
      },
      {
            "type": "error",
            "name": "ZeroAmount",
            "inputs": []
      }
],
    },
  },
} as const;

export default deployedContracts satisfies GenericContractsDeclaration;
