import React, { useEffect, useState } from "react";
import { createPublicClient, http, parseUnits, formatUnits } from "viem";
import { useAccount, useWalletClient, useConnect, useDisconnect, useBalance, useReadContract } from "wagmi";
import { MSMIL_CONTRACTS } from "./constants/tokenContracts.js";
import { BRIDGE_CONTRACTS, SUPPORTED_BRIDGE_CHAINS } from "./constants/bridgeContracts.js";
import { useBridgeContract } from "./hooks/useBridgeContract.js";
import msmilTokenAbi from "./constants/msmilTokenAbi.json";

// ==========================
// LOCAL DEFAULTS & CONSTANTS
// ==========================

// Default Chains, RPCs, Explorers, etc.
const defaultChains = {
  bsc: {
    id: 56,
    name: "BNB Chain",
    rpc: "https://bsc-dataseed1.binance.org",
    explorer: "https://bscscan.com",
  },
  hyperchain: {
    id: 2372,
    name: "BESC Hyperchain",
    rpc: "https://rpc.beschyperchain.com/",
    explorer: "https://explorer.beschyperchain.com",
  },
};

// Default Token and Bridge addresses
const defaultTokens = {
  MSMIL: {
    bsc: "0x32c66fcb34229dad04651b8253cc8badbf0d803d",
    hyperchain: "0x32c66fcb34229dad04651b8253cc8badbf0d803d",
    decimals: 18,
  },
};

const defaultBridges = {
  bsc: "0x0000000000000000000000000000000000000000", // replace with actual bridge addresses
  hyperchain: "0x0000000000000000000000000000000000000000",
};

// Minimal ERC20 ABI
const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "address" }, { type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ type: "address" }, { type: "uint256" }],
    outputs: [{ type: "bool" }],
  },
];

// Placeholder bridge ABI (adjust for your actual bridge contract!)
const BRIDGE_ABI = [
  {
    name: "bridgeTokens",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ type: "uint256" }, { type: "address" }],
    outputs: [],
  },
];

// ==========================
// BRIDGE WIDGET COMPONENT
// ==========================

export default function BridgeWidget({
  chains = defaultChains,
  tokens = defaultTokens,
  bridgeAddresses = defaultBridges,
  bridgeLive = true, // default: bridge enabled
  theme = {},
  ...props
}) {
  // Web3 hooks
  const { address, isConnected, chainId } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  // Bridge contract hook
  const {
    isContractDeployed,
    getBridgeFee,
    getBridgeAmount,
    getFeePercentage,
    validateBridgeAmount,
    bridgeTokens,
    isBridging,
    bridgeTransactionHash,
  } = useBridgeContract(chainId);

  // Balance hooks for refreshing after bridge transactions
  const { data: nativeBalance, refetch: refetchNativeBalance } = useBalance({ address });
  
  // MSMIL balance hooks
  const msmilContractAddress = chainId ? MSMIL_CONTRACTS[chainId] : null;
  const { data: msmilBalanceData, refetch: refetchMsmilBalance } = useReadContract({
    address: msmilContractAddress,
    abi: msmilTokenAbi,
    functionName: "balanceOf",
    args: [address],
    enabled: Boolean(address && msmilContractAddress && isConnected),
  });

  // Function to refresh all balances
  const refreshAllBalances = async () => {
    try {
      await Promise.all([
        refetchNativeBalance(),
        refetchMsmilBalance(),
      ]);
    } catch (error) {
      console.error("Error refreshing balances after bridge:", error);
    }
  };

  // Component state
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");

  // Cleanup function to reset all form fields and state
  const cleanupFields = () => {
    setAmount("");
    setStatus("");
  };

  // Clean up fields when wallet connection state changes
  useEffect(() => {
    cleanupFields();
  }, [isConnected]);

  // Clean up fields when network/chain changes
  useEffect(() => {
    cleanupFields();
  }, [chainId]);

  // Auto-connect to wallet on component mount
  useEffect(() => {
    const autoConnect = async () => {
      if (!isConnected && connectors && connectors.length > 0) {
        try {
          // Try MetaMask first
          const metaMaskConnector = connectors.find(
            (connector) => connector.name?.toLowerCase().includes('metamask') ||
                           connector.id?.toLowerCase().includes('metamask')
          );

          if (metaMaskConnector) {
            console.log('Bridge: Attempting to auto-connect to MetaMask...');
            await connect({ connector: metaMaskConnector });
            return;
          }

          // Try injected connector (Trust Wallet, Phantom, etc.)
          const injectedConnector = connectors.find(
            (connector) => connector.id?.toLowerCase().includes('injected') ||
                           connector.name?.toLowerCase().includes('browser')
          );

          if (injectedConnector) {
            console.log('Bridge: MetaMask not found, attempting to connect to injected wallet...');
            await connect({ connector: injectedConnector });
            return;
          }

          // Use first available connector
          if (connectors[0]) {
            console.log('Bridge: Using first available connector:', connectors[0].name);
            await connect({ connector: connectors[0] });
          }
        } catch (error) {
          console.warn('Bridge: Auto-connect failed:', error);
        }
      }
    };

    const timer = setTimeout(autoConnect, 150); // Slightly delayed to avoid conflicts
    return () => clearTimeout(timer);
  }, [connect, connectors, isConnected]);
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [approved, setApproved] = useState(false);
  const [balance, setBalance] = useState("");
  const [allowance, setAllowance] = useState("0");
  const [decimals, setDecimals] = useState(tokens.MSMIL.decimals);
  const [direction, setDirection] = useState("bsc_to_hyperchain"); // bridge direction: bsc_to_hyperchain or hyperchain_to_bsc

  // Setup current/next chain, token, bridge addresses based on direction
  const fromChain = direction === "bsc_to_hyperchain" ? "bsc" : "hyperchain";
  const toChain = direction === "bsc_to_hyperchain" ? "hyperchain" : "bsc";
  const chainObj = chains[fromChain];
  const tokenAddr = tokens.MSMIL[fromChain];
  const bridgeAddr = bridgeAddresses[fromChain];

  // Conditionally show COMING SOON if bridgeLive is false
  if (!bridgeLive) {
    return (
      <div className={styles.bridgeComingSoon}>
        <div className={styles.bridgeComingSoonMessage}>COMING SOON</div>
      </div>
    );
  }

  // Fetch MSMIL balance & allowance for user
  useEffect(() => {
    async function fetchData() {
      if (!address || !isConnected) return;
      try {
        const client = createPublicClient({
          chain: { id: chainObj.id },
          transport: http(chainObj.rpc),
        });
        const bal = await client.readContract({
          address: tokenAddr,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [address],
        });
        const dec = await client.readContract({
          address: tokenAddr,
          abi: ERC20_ABI,
          functionName: "decimals",
          args: [],
        });
        setDecimals(Number(dec));
        setBalance(formatUnits(bal, Number(dec)));

        const allow = await client.readContract({
          address: tokenAddr,
          abi: ERC20_ABI,
          functionName: "allowance",
          args: [address, bridgeAddr],
        });
        setAllowance(formatUnits(allow, Number(dec)));
        setApproved(parseFloat(formatUnits(allow, Number(dec))) > 0);
      } catch (e) {
        setBalance("");
        setAllowance("0");
        setApproved(false);
      }
    }
    fetchData();
  }, [address, isConnected, chainObj, tokenAddr, bridgeAddr]);

  // Handle ERC20 approval
  const handleApprove = async () => {
    setError("");
    setStatus("");
    setLoading(true);
    try {
      const maxAmount = parseUnits("1000000000", decimals);
      const txHash = await walletClient.writeContract({
        address: tokenAddr,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [bridgeAddr, maxAmount],
      });
      setStatus("Approval submitted.");
      setTxHash(txHash);
      setApproved(true);
      setLoading(false);
    } catch (e) {
      setError(e?.message || (typeof e === "string" ? e : JSON.stringify(e)));
      setStatus("Approval failed");
      setLoading(false);
    }
  };

  // Handle bridge action
  const handleBridge = async () => {
    setError("");
    setStatus("");
    setLoading(true);
    
    try {
      // Validate bridge amount
      const validation = validateBridgeAmount(amount);
      if (!validation.valid) {
        setError(validation.error);
        setLoading(false);
        return;
      }

      // Check if bridge contract is deployed
      if (!isContractDeployed) {
        setError("Bridge contract not deployed on this network");
        setLoading(false);
        return;
      }

      // Get target chain ID
      const targetChainId = selectedChain === "bsc" ? 56 : 2372;
      
      // Validate supported chain
      if (!SUPPORTED_BRIDGE_CHAINS.includes(targetChainId)) {
        setError("Target chain not supported for bridging");
        setLoading(false);
        return;
      }

      const amountWei = parseUnits(amount, decimals);
      
      // Calculate fees and show user
      const fee = getBridgeFee(amountWei.toString(), targetChainId);
      const bridgeAmount = getBridgeAmount(amountWei.toString(), targetChainId);
      const feePercentage = getFeePercentage();
      
      setStatus(`Bridging ${formatUnits(bridgeAmount, decimals)} MSMIL (${feePercentage} fee) to ${selectedChain}...`);

      // Execute bridge transaction
      bridgeTokens({
        args: [targetChainId, amountWei, address], // toChain, amount, recipient
      });

    } catch (e) {
      console.error("Bridge error:", e);
      setError(e?.message || (typeof e === "string" ? e : JSON.stringify(e)));
      setStatus("Bridge failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4" style={theme.bridgeWidget}>
      {!isConnected ? (
        <div className="space-y-3">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-300 mb-2">
              Bridge Tokens
            </div>
            <p className="text-sm text-gray-400 mb-3">
              Connect your wallet to bridge tokens between chains
            </p>
          </div>
          
          {/* Preferred wallet buttons */}
          <div className="space-y-2">
            {connectors?.filter(connector => 
              connector.name?.toLowerCase().includes('metamask') ||
              connector.id?.toLowerCase().includes('metamask')
            ).map((connector) => (
              <button
                key={connector.id}
                onClick={() => connect({ connector })}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 hover:scale-[1.02] transform"
              >
                🦊 Connect MetaMask (Recommended)
              </button>
            ))}
            
            {connectors?.filter(connector => 
              (connector.id?.toLowerCase().includes('injected') ||
               connector.name?.toLowerCase().includes('browser')) &&
              !connector.name?.toLowerCase().includes('metamask') &&
              !connector.id?.toLowerCase().includes('metamask')
            ).map((connector) => (
              <button
                key={connector.id}
                onClick={() => connect({ connector })}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-purple-600 hover:from-green-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 hover:scale-[1.02] transform"
              >
                🛡️ Connect Browser Wallet (Trust, Phantom, etc.)
              </button>
            ))}
            
            {connectors?.filter(connector => 
              connector.name?.toLowerCase().includes('walletconnect') ||
              connector.id?.toLowerCase().includes('walletconnect')
            ).map((connector) => (
              <button
                key={connector.id}
                onClick={() => connect({ connector })}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-600 hover:from-purple-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 hover:scale-[1.02] transform"
              >
                � Connect Mobile Wallet
              </button>
            ))}
            
            {/* Other wallets */}
            {connectors?.filter(connector => 
              !connector.name?.toLowerCase().includes('metamask') &&
              !connector.id?.toLowerCase().includes('metamask') &&
              !connector.id?.toLowerCase().includes('injected') &&
              !connector.name?.toLowerCase().includes('browser') &&
              !connector.name?.toLowerCase().includes('walletconnect') &&
              !connector.id?.toLowerCase().includes('walletconnect')
            ).map((connector) => (
              <button
                key={connector.id}
                onClick={() => connect({ connector })}
                className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-200"
              >
                Connect {connector.name || 'Wallet'}
              </button>
            ))}
            
            {/* Fallback if no connectors */}
            {(!connectors || connectors.length === 0) && (
              <button
                onClick={() => connect({ connector: connectors?.[0] })}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <label className="text-sm font-medium text-gray-300">
                Bridge direction:
              </label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
                className="px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
              >
                <option value="bsc_to_hyperchain">
                  BNB Chain → BESC Hyperchain
                </option>
                <option value="hyperchain_to_bsc">
                  BESC Hyperchain → BNB Chain
                </option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-gray-800/30 rounded-lg">
                <div className="text-sm text-gray-400">
                  <span className="font-medium text-white">MSMIL balance:</span>{" "}
                  {balance
                    ? `${parseFloat(balance).toFixed(6)} MSMIL`
                    : "Loading..."}
                </div>
              </div>
              <div className="p-3 bg-gray-800/30 rounded-lg">
                <div className="text-sm text-gray-400">
                  <span className="font-medium text-white">Allowance:</span>{" "}
                  {allowance
                    ? `${parseFloat(allowance).toFixed(6)} MSMIL`
                    : "0"}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount to bridge:
              </label>
              <input
                type="number"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
                placeholder="0.0"
              />
              
              {/* Bridge Fee Display */}
              {amount && Number(amount) > 0 && isContractDeployed && (
                <div className="mt-2 p-3 bg-gray-800/30 border border-gray-600/50 rounded-lg">
                  <div className="text-xs text-gray-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Bridge Fee ({getFeePercentage()}):</span>
                      <span className="text-yellow-400">
                        {formatUnits(getBridgeFee(parseUnits(amount, decimals).toString(), selectedChain === "bsc" ? 56 : 2372), decimals)} MSMIL
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>You will receive:</span>
                      <span className="text-green-400 font-semibold">
                        {formatUnits(getBridgeAmount(parseUnits(amount, decimals).toString(), selectedChain === "bsc" ? 56 : 2372), decimals)} MSMIL
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              {!approved && (
                <button
                  disabled={loading || !amount || Number(amount) <= 0}
                  className="w-full px-6 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200"
                  onClick={handleApprove}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      Approving...
                    </span>
                  ) : (
                    "Approve MSMIL"
                  )}
                </button>
              )}

              {approved && (
                <button
                  disabled={loading || isBridging || !amount || Number(amount) <= 0 || !isContractDeployed}
                  className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none"
                  onClick={handleBridge}
                >
                  {loading || isBridging ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      {isBridging ? "Bridging..." : "Processing..."}
                    </span>
                  ) : !isContractDeployed ? (
                    "Bridge Not Available"
                  ) : (
                    "Bridge MSMIL"
                  )}
                </button>
              )}
            </div>
          </div>

          {status && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="text-sm">
                <span className="font-semibold text-blue-400">Status:</span>{" "}
                <span className="text-white">{status}</span>
              </div>
              {(txHash || bridgeTransactionHash) && (
                <div className="mt-2">
                  <a
                    href={`${chains[fromChain].explorer}/tx/${bridgeTransactionHash || txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm transition-colors duration-200"
                  >
                    View Transaction
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="text-sm text-red-400">
                <span className="font-semibold">Error:</span> {error}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
