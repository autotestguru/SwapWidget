import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useBalance, useSwitchChain, useWalletClient, usePublicClient } from 'wagmi';
import { parseEther, parseUnits, formatUnits, createPublicClient, http } from 'viem';
import { chains } from './constants/bridgeContracts';
import ChainLogo from './components/ChainLogo';
import { useMsmilBalance } from './hooks/useMsmilBalance';

// DEX Router addresses
const ROUTER_ADDRESSES = {
  bsc: "0x10ED43C718714eb63d5aA57B78B54704E256024E", // PancakeSwap v2
  hyperchain: "0x2600E57E2044d62277775A925709af0047c28Eb7", // BESC DEX Router
};

// MSMIL Token addresses
const MSMIL_TOKEN_ADDRESSES = {
  bsc: "0x32c66fcb34229dad04651b8253cc8badbf0d803d", // BNB Chain MSMIL
  hyperchain: "0x32c66fcb34229dad04651b8253cc8badbf0d803d", // BESC Hyperchain MSMIL
};

// Wrapped native token addresses
const WRAPPED_NATIVE = {
  bsc: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB
  hyperchain: "0x33e22F85CC1877697773ca5c85988663388883A0", // Wrapped BESC
};

// DEX Router ABI (minimal required functions)
const ROUTER_ABI = [
  {
    name: "getAmountsOut",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "uint256" }, { type: "address[]" }],
    outputs: [{ type: "uint256[]" }],
  },
  {
    name: "swapExactETHForTokens",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { type: "uint256" }, // amountOutMin
      { type: "address[]" }, // path
      { type: "address" }, // to
      { type: "uint256" }, // deadline
    ],
    outputs: [{ type: "uint256[]" }],
  },
];

function SwapWidget({ theme = {} }) {
  const [amount, setAmount] = useState('');
  const [expectedOut, setExpectedOut] = useState('');
  const [swapStatus, setSwapStatus] = useState('');
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');
  const [selectedChain, setSelectedChain] = useState('bsc');
  const [loading, setLoading] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);

  const { address, isConnected, chainId } = useAccount();
  const { connectors, connect } = useConnect();
  const { switchChain } = useSwitchChain();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  // Cleanup function to reset all form fields and state
  const cleanupFields = () => {
    setAmount('');
    setExpectedOut('');
    setSwapStatus('');
    setError('');
    setTxHash('');
    setLoading(false);
  };

  // Set selectedChain based on current chainId and cleanup on network change
  useEffect(() => {
    if (chainId === chains.bsc.id) {
      setSelectedChain('bsc');
    } else if (chainId === chains.hyperchain.id) {
      setSelectedChain('hyperchain');
    }
    // Clean up fields when network changes
    cleanupFields();
  }, [chainId]);

  // Clean up fields when wallet connection state changes
  useEffect(() => {
    cleanupFields();
    // Force close wallet modal if disconnected
    if (!isConnected) {
      setShowWalletModal(false);
    }
  }, [isConnected]);

  // Clean up fields when network/chain changes
  useEffect(() => {
    cleanupFields();
  }, [chainId]);

  const { data: balance, refetch: refetchBalance } = useBalance({
    address,
    chainId: selectedChain === 'bsc' ? chains.bsc.id : chains.hyperchain.id,
  });

  const [msmilBalance, refreshMsmilBalance, isMsmilLoading, msmilError] = useMsmilBalance(
    address, 
    selectedChain === 'bsc' ? chains.bsc.id : chains.hyperchain.id 
  );

  const refreshAllBalances = () => {
    refetchBalance();
    refreshMsmilBalance();
  };

  // Get expected MSMIL output using DEX router
  useEffect(() => {
    const estimateOutput = async () => {
      setExpectedOut('');
      
      // Don't calculate if wallet is not connected or no amount
      if (!isConnected || !amount || Number(amount) === 0) {
        setExpectedOut('');
        return;
      }
      
      try {
        const inputAmount = parseUnits(amount, 18);
        const routerAddress = ROUTER_ADDRESSES[selectedChain];
        const tokenAddress = MSMIL_TOKEN_ADDRESSES[selectedChain];
        const wrappedNative = WRAPPED_NATIVE[selectedChain];
        
        if (!routerAddress || !tokenAddress || !wrappedNative) {
          console.warn('Missing router or token configuration for', selectedChain);
          return;
        }

        // Create public client for the current chain
        const currentChain = selectedChain === 'bsc' ? chains.bsc : chains.hyperchain;
        const client = createPublicClient({
          chain: { 
            id: currentChain.id,
            rpcUrls: { default: { http: [
              selectedChain === 'bsc' 
                ? 'https://bsc-dataseed1.binance.org'
                : 'https://rpc.beschyperchain.com/'
            ] } }
          },
          transport: http(
            selectedChain === 'bsc' 
              ? 'https://bsc-dataseed1.binance.org'
              : 'https://rpc.beschyperchain.com/'
          ),
        });

        const result = await client.readContract({
          address: routerAddress,
          abi: ROUTER_ABI,
          functionName: 'getAmountsOut',
          args: [inputAmount, [wrappedNative, tokenAddress]],
        });

        setExpectedOut(formatUnits(result[1], 18));
      } catch (err) {
        console.error('Error estimating output:', err);
        setExpectedOut('');
      }
    };

    estimateOutput();
  }, [amount, selectedChain, chainId, isConnected]);

  const handleSwap = async () => {
    if (!amount || Number(amount) <= 0 || !walletClient) return;

    try {
      setLoading(true);
      setError('');
      setSwapStatus('Preparing swap...');

      if (!isConnected || !address) {
        throw new Error('Please connect your wallet first');
      }

      const inputAmount = parseUnits(amount, 18);
      const routerAddress = ROUTER_ADDRESSES[selectedChain];
      const tokenAddress = MSMIL_TOKEN_ADDRESSES[selectedChain];
      const wrappedNative = WRAPPED_NATIVE[selectedChain];
      
      if (!routerAddress || !tokenAddress || !wrappedNative) {
        throw new Error('DEX configuration missing for selected chain');
      }

      const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes

      // Calculate minimum amount out with 4% slippage
      let amountOutMin = 0n;
      if (expectedOut && Number(expectedOut) > 0) {
        const expectedOutBigInt = parseUnits(expectedOut, 18);
        // 96% of expected (allowing 4% slippage)
        amountOutMin = (expectedOutBigInt * 96n) / 100n;
      }

      setSwapStatus('Sending transaction...');

      const txHash = await walletClient.writeContract({
        address: routerAddress,
        abi: ROUTER_ABI,
        functionName: 'swapExactETHForTokens',
        args: [
          amountOutMin, // amountOutMin with 4% slippage protection
          [wrappedNative, tokenAddress],
          address,
          deadline,
        ],
        value: inputAmount,
      });

      setTxHash(txHash);
      setSwapStatus('Transaction sent, waiting for confirmation...');

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      
      if (receipt.status === 'success') {
        setSwapStatus('Swap completed successfully!');
        setAmount('');
        setExpectedOut('');
        
        // Refresh balances after successful swap
        setTimeout(() => {
          refreshAllBalances();
          setSwapStatus('');
          setTxHash('');
        }, 3000);
      } else {
        throw new Error('Transaction failed');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Swap failed:', error);
      setError(error.message || 'Swap failed. Please try again.');
      setLoading(false);
      setSwapStatus('');
    }
  };

  const isValidNetwork = chainId === chains.bsc.id || chainId === chains.hyperchain.id;
  const canSwap = isConnected && isValidNetwork && amount && Number(amount) > 0 && !loading;

  return (
    <div className="w-full relative" style={theme.swapWidget}>
      {/* Minimum height widget container - responsive heights */}
      <div className="min-h-[500px] md:min-h-[550px] bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden flex flex-col">
        
        {/* Header with wallet status */}
        <div className="px-6 py-4 border-b border-gray-700/50 bg-gray-800/30 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Token Swap</h3>
            {isConnected ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-green-400">
                  Connected Wallet: {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              </div>
            ) : (
              <button
                onClick={() => setShowWalletModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>

        {/* Network Status */}
        <div className="px-6 py-3 border-b border-gray-700/30 flex-shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Network:</span>
            <div className="flex items-center gap-2">
              {!isValidNetwork ? (
                <div className="flex gap-2 flex-col sm:flex-row">
                  <button
                    onClick={() => isConnected && switchChain({ chainId: chains.bsc.id })}
                    className="text-xs px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!isConnected}
                  >
                    Switch to BNB Chain
                  </button>
                  <button
                    onClick={() => isConnected && switchChain({ chainId: chains.hyperchain.id })}
                    className="text-xs px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!isConnected}
                  >
                    Switch to BESC
                  </button>
                </div>
              ) : (
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                  selectedChain === "bsc"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : selectedChain === "hyperchain"
                    ? "bg-purple-500/20 text-purple-400"
                    : "bg-gray-500/20 text-gray-400"
                }`}>
                  {selectedChain === "bsc" && <ChainLogo chain="bnb" size="w-3 h-3" />}
                  {selectedChain === "hyperchain" && <ChainLogo chain="besc" size="w-3 h-3" />}
                  {selectedChain === "bsc" ? "BNB Chain" : 
                   selectedChain === "hyperchain" ? "BESC Hyperchain" : "Unknown"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Balance Display */}
        <div className="px-6 py-3 border-b border-gray-700/30 flex-shrink-0">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Balance:</span>
              <span className={`${isConnected ? 'text-white' : 'text-gray-500'}`}>
                {isConnected ? `${Number(balance?.formatted || '0.00').toFixed(4)} ${balance?.symbol || 'ETH'}` : '--- ETH'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">MSMIL Balance:</span>
              <div className="flex items-center gap-2">
                <span className={`${isConnected ? 'text-white' : 'text-gray-500'}`}>
                  {isConnected ? `${parseInt(msmilBalance || '0.00')} MSMIL` : '--- MSMIL'}
                </span>
                {/* <button
                  onClick={refreshAllBalances}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Refresh balances"
                  disabled={!isConnected}
                >
                  🔄
                </button> */}
              </div>
            </div>
          </div>
        </div>

        {/* Main Swap Interface - takes remaining space */}
        <div className="px-6 py-4 flex-1 flex flex-col">
          <div className="space-y-4 flex-1">
            
            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount ({selectedChain === "bsc" ? "BNB" : "BESC"}):
              </label>
              <input
                type="number"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={!isConnected || !isValidNetwork}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder={isConnected ? "0.0" : "Connect wallet to continue"}
              />
            </div>

            {/* Expected Output */}
            <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
              <div className="text-sm text-gray-400">
                Expected MSMIL:{" "}
                <span className={`font-medium ${isConnected && expectedOut ? 'text-white' : 'text-gray-500'}`}>
                  {isConnected && expectedOut
                    ? `${parseFloat(expectedOut).toFixed(6)} MSMIL`
                    : amount && !isConnected
                    ? "Connect wallet to see estimate"
                    : amount && isConnected && !expectedOut
                    ? "Calculating..."
                    : "0.000000 MSMIL"
                  }
                </span>
              </div>
              {/* Slippage Information */}
              <div className="text-xs text-blue-400 mt-1">
                Slippage: 4% (Minimum received: {isConnected && expectedOut 
                  ? `${(parseFloat(expectedOut) * 0.96).toFixed(6)} MSMIL`
                  : "0.000000 MSMIL"
                })
              </div>
            </div>

            {/* Warning for unsupported network */}
            {isConnected && !isValidNetwork && (
              <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <p className="text-orange-400 text-sm">
                  ⚠️ Please switch to BNB Chain or BESC Hyperchain to continue.
                </p>
              </div>
            )}

            {/* Swap Button */}
            <div className="mt-auto">
              <button
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none disabled:opacity-50"
                disabled={!canSwap}
                onClick={handleSwap}
              >
                {!isConnected ? (
                  "Connect Wallet to Swap"
                ) : !isValidNetwork ? (
                  "Switch to Supported Network"
                ) : loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Swapping...
                  </span>
                ) : (
                  "Swap"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Status Messages - fixed at bottom */}
        <div className="px-6 pb-4 flex-shrink-0">
          {swapStatus && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-2">
              <div className="text-sm">
                <span className="font-semibold text-blue-400">Status:</span>{" "}
                <span className="text-white">{swapStatus}</span>
              </div>
              {txHash && (
                <div className="mt-2">
                  <a
                    href={`${chains[selectedChain].explorer}/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm transition-colors duration-200"
                  >
                    View Transaction
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
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
      </div>

      {/* Wallet Connection Overlay Modal */}
      {showWalletModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" 
          onClick={() => setShowWalletModal(false)}
        >
          <div 
            className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Connect Wallet</h3>
              <button
                onClick={() => setShowWalletModal(false)}
                className="text-gray-400 hover:text-gray-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-sm text-gray-400 mb-4">
              Choose your preferred wallet to connect and start swapping tokens
            </p>
            
            {/* Wallet Connection Buttons */}
            <div className="space-y-3">
              {/* MetaMask (Recommended) */}
              <button
                onClick={() => {
                  const metaMaskConnector = connectors?.find(connector => 
                    connector.name?.toLowerCase().includes('metamask') ||
                    connector.id?.toLowerCase().includes('metamask')
                  );
                  if (metaMaskConnector) {
                    connect({ connector: metaMaskConnector });
                  } else {
                    const fallbackConnector = connectors?.find(connector => 
                      !connector.name?.toLowerCase().includes('walletconnect')
                    );
                    if (fallbackConnector) connect({ connector: fallbackConnector });
                  }
                  setShowWalletModal(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 hover:scale-[1.02] transform"
              >
                <span className="text-xl">🦊</span>
                <div className="text-left flex-1">
                  <div className="font-medium">MetaMask</div>
                  <div className="text-sm opacity-75">Recommended</div>
                </div>
              </button>
              
              {/* Browser Wallet */}
              <button
                onClick={() => {
                  const browserConnector = connectors?.find(connector => 
                    (connector.name?.toLowerCase().includes('trust') ||
                     connector.name?.toLowerCase().includes('phantom') ||
                     connector.id?.toLowerCase().includes('injected') ||
                     connector.name?.toLowerCase().includes('browser')) &&
                    !connector.name?.toLowerCase().includes('metamask') &&
                    !connector.name?.toLowerCase().includes('walletconnect')
                  );
                  if (browserConnector) {
                    connect({ connector: browserConnector });
                  } else {
                    const fallbackConnector = connectors?.find(connector => 
                      !connector.name?.toLowerCase().includes('metamask') &&
                      !connector.name?.toLowerCase().includes('walletconnect')
                    );
                    if (fallbackConnector) connect({ connector: fallbackConnector });
                  }
                  setShowWalletModal(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-green-600 to-purple-600 hover:from-green-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 hover:scale-[1.02] transform"
              >
                <span className="text-xl">🛡️</span>
                <div className="text-left flex-1">
                  <div className="font-medium">Browser Wallet</div>
                  <div className="text-sm opacity-75">Trust Wallet, Phantom, etc.</div>
                </div>
              </button>
              
              {/* Mobile Wallet */}
              <button
                onClick={() => {
                  const walletConnectConnector = connectors?.find(connector => 
                    connector.name?.toLowerCase().includes('walletconnect') ||
                    connector.id?.toLowerCase().includes('walletconnect')
                  );
                  if (walletConnectConnector) {
                    connect({ connector: walletConnectConnector });
                  } else {
                    const fallbackConnector = connectors?.[connectors.length - 1];
                    if (fallbackConnector) connect({ connector: fallbackConnector });
                  }
                  setShowWalletModal(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-600 hover:from-purple-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 hover:scale-[1.02] transform"
              >
                <span className="text-xl">📱</span>
                <div className="text-left flex-1">
                  <div className="font-medium">Mobile Wallet</div>
                  <div className="text-sm opacity-75">WalletConnect</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SwapWidget;