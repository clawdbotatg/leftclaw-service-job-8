"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { formatEther, formatUnits } from "viem";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { Address } from "@scaffold-ui/components";

const CONTRACT_ADDRESS = "0xC5127c4b0e5AC19088D233AB43C0FFd1E1134332";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  // Read contract state
  const { data: owner } = useScaffoldReadContract({
    contractName: "TreasuryManagerV2",
    functionName: "owner",
  });

  const { data: operator } = useScaffoldReadContract({
    contractName: "TreasuryManagerV2",
    functionName: "operator",
  });

  const { data: operatorSlippage } = useScaffoldReadContract({
    contractName: "TreasuryManagerV2",
    functionName: "operatorSlippageBps",
  });

  const { data: lastPoolInteraction } = useScaffoldReadContract({
    contractName: "TreasuryManagerV2",
    functionName: "lastPoolInteraction",
  });

  const { data: lastOperatorRebalance } = useScaffoldReadContract({
    contractName: "TreasuryManagerV2",
    functionName: "lastOperatorRebalance",
  });

  const { data: trackedTokens } = useScaffoldReadContract({
    contractName: "TreasuryManagerV2",
    functionName: "getTrackedTokens",
  });

  const { data: remainingBuybackWETH } = useScaffoldReadContract({
    contractName: "TreasuryManagerV2",
    functionName: "getRemainingDailyBudget",
    args: [0], // BuybackWETH
  });

  const { data: remainingBuybackUSDC } = useScaffoldReadContract({
    contractName: "TreasuryManagerV2",
    functionName: "getRemainingDailyBudget",
    args: [1], // BuybackUSDC
  });

  const { data: remainingBurn } = useScaffoldReadContract({
    contractName: "TreasuryManagerV2",
    functionName: "getRemainingDailyBudget",
    args: [2], // Burn
  });

  const { data: remainingStake } = useScaffoldReadContract({
    contractName: "TreasuryManagerV2",
    functionName: "getRemainingDailyBudget",
    args: [3], // Stake
  });

  const { data: permissionlessBudget } = useScaffoldReadContract({
    contractName: "TreasuryManagerV2",
    functionName: "getRemainingPermissionlessBudget",
  });

  const isOwner = connectedAddress && owner && connectedAddress.toLowerCase() === owner.toLowerCase();
  const isOperator = connectedAddress && operator && connectedAddress.toLowerCase() === operator.toLowerCase();

  return (
    <div className="flex flex-col items-center pt-10 px-5">
      <h1 className="text-4xl font-bold mb-2">🏦 ₸USD Treasury Manager</h1>
      <p className="text-lg text-gray-500 mb-8">Operated by AMI (Artificial Monetary Intelligence)</p>

      {/* Contract Info */}
      <div className="w-full max-w-4xl">
        <div className="bg-base-100 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Contract Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Contract</p>
              <Address address={CONTRACT_ADDRESS} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Owner</p>
              <Address address={owner} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Operator</p>
              <Address address={operator} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Operator Slippage</p>
              <p className="font-mono">{operatorSlippage ? `${Number(operatorSlippage) / 100}%` : "..."}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Pool Interaction</p>
              <p className="font-mono">
                {lastPoolInteraction ? new Date(Number(lastPoolInteraction) * 1000).toLocaleString() : "Never"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Operator Rebalance</p>
              <p className="font-mono">
                {lastOperatorRebalance && Number(lastOperatorRebalance) > 0
                  ? new Date(Number(lastOperatorRebalance) * 1000).toLocaleString()
                  : "Never"}
              </p>
            </div>
          </div>
        </div>

        {/* Daily Budgets */}
        <div className="bg-base-100 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Daily Budgets Remaining</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title">Buyback WETH</div>
              <div className="stat-value text-lg">
                {remainingBuybackWETH !== undefined ? formatEther(remainingBuybackWETH) : "..."} ETH
              </div>
            </div>
            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title">Buyback USDC</div>
              <div className="stat-value text-lg">
                {remainingBuybackUSDC !== undefined ? formatUnits(remainingBuybackUSDC, 6) : "..."} USDC
              </div>
            </div>
            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title">Burn</div>
              <div className="stat-value text-lg">
                {remainingBurn !== undefined
                  ? `${(Number(formatEther(remainingBurn)) / 1e6).toFixed(0)}M`
                  : "..."}{" "}
                ₸USD
              </div>
            </div>
            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title">Stake</div>
              <div className="stat-value text-lg">
                {remainingStake !== undefined
                  ? `${(Number(formatEther(remainingStake)) / 1e6).toFixed(0)}M`
                  : "..."}{" "}
                ₸USD
              </div>
            </div>
            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title">Permissionless</div>
              <div className="stat-value text-lg">
                {permissionlessBudget !== undefined ? formatEther(permissionlessBudget) : "..."} ETH
              </div>
            </div>
          </div>
        </div>

        {/* Tracked Tokens */}
        <div className="bg-base-100 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Tracked Tokens</h2>
          {trackedTokens && trackedTokens.length > 0 ? (
            <div className="space-y-2">
              {trackedTokens.map((token: string, i: number) => (
                <TokenRow key={i} token={token} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No tokens tracked yet. The operator buys tokens via buyTokenWithETH.</p>
          )}
        </div>

        {/* Role-based panels */}
        {isOwner && <OwnerPanel />}
        {isOperator && <OperatorPanel />}

        {/* Permissionless always visible */}
        <PermissionlessPanel />

        {/* Immutable Constants */}
        <div className="bg-base-100 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Immutable Constants</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Permissionless Slippage:</span> 3%
            </div>
            <div>
              <span className="text-gray-500">Permissionless Cooldown:</span> 4 hours
            </div>
            <div>
              <span className="text-gray-500">Max Per Swap:</span> 5% of unlocked
            </div>
            <div>
              <span className="text-gray-500">Circuit Breaker:</span> 15% vs TWAP
            </div>
            <div>
              <span className="text-gray-500">Operator Inactivity:</span> 14 days
            </div>
            <div>
              <span className="text-gray-500">Dead Pool Threshold:</span> 90 days
            </div>
            <div>
              <span className="text-gray-500">Operator Cooldown:</span> 60 min
            </div>
            <div>
              <span className="text-gray-500">Per-Action Cap:</span> 0.5 ETH
            </div>
            <div>
              <span className="text-gray-500">Per-Day Cap:</span> 2 ETH
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Token row component
function TokenRow({ token }: { token: string }) {
  const { data: tokenInfo } = useScaffoldReadContract({
    contractName: "TreasuryManagerV2",
    functionName: "getTokenInfo",
    args: [token],
  });

  const { data: unlocked } = useScaffoldReadContract({
    contractName: "TreasuryManagerV2",
    functionName: "getUnlockedAmount",
    args: [token],
  });

  const { data: permStatus } = useScaffoldReadContract({
    contractName: "TreasuryManagerV2",
    functionName: "isPermissionlessAvailable",
    args: [token],
  });

  return (
    <div className="bg-base-200 rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <Address address={token} />
        {permStatus && (
          <span className={`badge ${permStatus[0] ? "badge-success" : "badge-warning"}`}>
            {permStatus[0] ? "Permissionless Available" : permStatus[1]}
          </span>
        )}
      </div>
      {tokenInfo && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div>
            <span className="text-gray-500">Cost Basis:</span> {formatEther(tokenInfo[0])} ETH
          </div>
          <div>
            <span className="text-gray-500">Amount:</span> {formatEther(tokenInfo[1])}
          </div>
          <div>
            <span className="text-gray-500">Highest ROI:</span> {Number(tokenInfo[2]) / 100}%
          </div>
          <div>
            <span className="text-gray-500">Unlocked:</span> {unlocked ? formatEther(unlocked) : "0"}
          </div>
        </div>
      )}
    </div>
  );
}

// Owner Panel
function OwnerPanel() {
  const [newOperator, setNewOperator] = useState("");
  const [slippageBps, setSlippageBps] = useState("");
  const [isSettingOp, setIsSettingOp] = useState(false);
  const [isSettingSlip, setIsSettingSlip] = useState(false);

  const { writeContractAsync: writeContract } = useScaffoldWriteContract("TreasuryManagerV2");

  return (
    <div className="bg-base-100 rounded-xl shadow-lg p-6 mb-6 border-2 border-primary">
      <h2 className="text-2xl font-bold mb-4">👑 Owner Panel</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Set Operator</label>
          <div className="flex gap-2">
            <input
              type="text"
              className="input input-bordered flex-1"
              placeholder="0x..."
              value={newOperator}
              onChange={e => setNewOperator(e.target.value)}
            />
            <button
              className="btn btn-primary"
              disabled={isSettingOp || !newOperator}
              onClick={async () => {
                setIsSettingOp(true);
                try {
                  await writeContract({ functionName: "setOperator", args: [newOperator as `0x${string}`] });
                } catch (e) {
                  console.error(e);
                } finally {
                  setIsSettingOp(false);
                }
              }}
            >
              {isSettingOp ? "Setting..." : "Set"}
            </button>
          </div>
        </div>

        <div>
          <label className="label">Set Slippage (bps)</label>
          <div className="flex gap-2">
            <input
              type="number"
              className="input input-bordered flex-1"
              placeholder="e.g. 300 = 3%"
              value={slippageBps}
              onChange={e => setSlippageBps(e.target.value)}
            />
            <button
              className="btn btn-primary"
              disabled={isSettingSlip || !slippageBps}
              onClick={async () => {
                setIsSettingSlip(true);
                try {
                  await writeContract({ functionName: "setSlippage", args: [BigInt(slippageBps)] });
                } catch (e) {
                  console.error(e);
                } finally {
                  setIsSettingSlip(false);
                }
              }}
            >
              {isSettingSlip ? "Setting..." : "Set"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Operator Panel
function OperatorPanel() {
  const [buybackWethAmt, setBuybackWethAmt] = useState("");
  const [buybackUsdcAmt, setBuybackUsdcAmt] = useState("");
  const [burnAmt, setBurnAmt] = useState("");
  const [stakeAmt, setStakeAmt] = useState("");
  const [stakePoolId, setStakePoolId] = useState("0");
  const [unstakePoolId, setUnstakePoolId] = useState("0");

  const [isBuybackWeth, setIsBuybackWeth] = useState(false);
  const [isBuybackUsdc, setIsBuybackUsdc] = useState(false);
  const [isBurning, setIsBurning] = useState(false);
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);

  const { writeContractAsync: writeContract } = useScaffoldWriteContract("TreasuryManagerV2");

  return (
    <div className="bg-base-100 rounded-xl shadow-lg p-6 mb-6 border-2 border-secondary">
      <h2 className="text-2xl font-bold mb-4">🤖 Operator Panel</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Buyback WETH */}
        <div>
          <label className="label">Buyback with WETH</label>
          <div className="flex gap-2">
            <input
              type="text"
              className="input input-bordered flex-1"
              placeholder="Amount in ETH"
              value={buybackWethAmt}
              onChange={e => setBuybackWethAmt(e.target.value)}
            />
            <button
              className="btn btn-secondary"
              disabled={isBuybackWeth || !buybackWethAmt}
              onClick={async () => {
                setIsBuybackWeth(true);
                try {
                  const amount = BigInt(Math.floor(parseFloat(buybackWethAmt) * 1e18));
                  await writeContract({ functionName: "buybackWithWETH", args: [amount] });
                } catch (e) {
                  console.error(e);
                } finally {
                  setIsBuybackWeth(false);
                }
              }}
            >
              {isBuybackWeth ? "Buying..." : "Buyback"}
            </button>
          </div>
        </div>

        {/* Buyback USDC */}
        <div>
          <label className="label">Buyback with USDC</label>
          <div className="flex gap-2">
            <input
              type="text"
              className="input input-bordered flex-1"
              placeholder="Amount in USDC"
              value={buybackUsdcAmt}
              onChange={e => setBuybackUsdcAmt(e.target.value)}
            />
            <button
              className="btn btn-secondary"
              disabled={isBuybackUsdc || !buybackUsdcAmt}
              onClick={async () => {
                setIsBuybackUsdc(true);
                try {
                  const amount = BigInt(Math.floor(parseFloat(buybackUsdcAmt) * 1e6));
                  await writeContract({ functionName: "buybackWithUSDC", args: [amount] });
                } catch (e) {
                  console.error(e);
                } finally {
                  setIsBuybackUsdc(false);
                }
              }}
            >
              {isBuybackUsdc ? "Buying..." : "Buyback"}
            </button>
          </div>
        </div>

        {/* Burn */}
        <div>
          <label className="label">Burn ₸USD</label>
          <div className="flex gap-2">
            <input
              type="text"
              className="input input-bordered flex-1"
              placeholder="Amount in ₸USD"
              value={burnAmt}
              onChange={e => setBurnAmt(e.target.value)}
            />
            <button
              className="btn btn-error"
              disabled={isBurning || !burnAmt}
              onClick={async () => {
                setIsBurning(true);
                try {
                  const amount = BigInt(Math.floor(parseFloat(burnAmt) * 1e18));
                  await writeContract({ functionName: "burn", args: [amount] });
                } catch (e) {
                  console.error(e);
                } finally {
                  setIsBurning(false);
                }
              }}
            >
              {isBurning ? "Burning..." : "Burn"}
            </button>
          </div>
        </div>

        {/* Stake */}
        <div>
          <label className="label">Stake ₸USD</label>
          <div className="flex gap-2">
            <input
              type="text"
              className="input input-bordered flex-1"
              placeholder="Amount"
              value={stakeAmt}
              onChange={e => setStakeAmt(e.target.value)}
            />
            <input
              type="number"
              className="input input-bordered w-20"
              placeholder="Pool"
              value={stakePoolId}
              onChange={e => setStakePoolId(e.target.value)}
            />
            <button
              className="btn btn-accent"
              disabled={isStaking || !stakeAmt}
              onClick={async () => {
                setIsStaking(true);
                try {
                  const amount = BigInt(Math.floor(parseFloat(stakeAmt) * 1e18));
                  await writeContract({
                    functionName: "stake",
                    args: [amount, BigInt(stakePoolId)],
                  });
                } catch (e) {
                  console.error(e);
                } finally {
                  setIsStaking(false);
                }
              }}
            >
              {isStaking ? "Staking..." : "Stake"}
            </button>
          </div>
        </div>

        {/* Unstake */}
        <div>
          <label className="label">Unstake</label>
          <div className="flex gap-2">
            <input
              type="number"
              className="input input-bordered flex-1"
              placeholder="Pool ID"
              value={unstakePoolId}
              onChange={e => setUnstakePoolId(e.target.value)}
            />
            <button
              className="btn btn-warning"
              disabled={isUnstaking}
              onClick={async () => {
                setIsUnstaking(true);
                try {
                  await writeContract({
                    functionName: "unstake",
                    args: [BigInt(unstakePoolId)],
                  });
                } catch (e) {
                  console.error(e);
                } finally {
                  setIsUnstaking(false);
                }
              }}
            >
              {isUnstaking ? "Unstaking..." : "Unstake"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Permissionless Panel
function PermissionlessPanel() {
  return (
    <div className="bg-base-100 rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">🌐 Permissionless Rebalance</h2>
      <p className="text-gray-500 mb-4">
        Anyone can trigger rebalances when a tracked token reaches 1000%+ ROI and the operator has been inactive for
        14+ days. Check the tracked tokens above for availability.
      </p>
      <div className="text-sm">
        <p>
          <strong>Requirements:</strong>
        </p>
        <ul className="list-disc list-inside">
          <li>ROI ≥ 1000% vs weighted average cost</li>
          <li>14 days since current ROI tier reached with no operator rebalance</li>
          <li>Max 5% of unlocked per transaction</li>
          <li>4-hour cooldown per token</li>
          <li>0.5 ETH per action, 2 ETH per day cap</li>
          <li>Circuit breaker: blocks if ₸USD spot {">"} 15% above 24h TWAP</li>
        </ul>
      </div>
    </div>
  );
}

export default Home;
