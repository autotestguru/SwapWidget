import { useState } from "react";
import { WagmiProvider, createConfig, http, useAccount, useSwitchChain } from "wagmi";
import { createPublicClient } from "viem";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { metaMask, injected, walletConnect } from "@wagmi/connectors";
import SwapWidget from "./SwapWidget.jsx";
import BridgeWidget from "./BridgeWidget.jsx";
import ChainLogo from "./components/ChainLogo.jsx";

// Network Switcher Component (needs to be inside WagmiProvider)
function NetworkSwitcher({ bnbChain, bescChain }) {
  const { chainId, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();

  // Don't show if not connected or on unsupported network
  if (!isConnected) return null;

  const selectedChain = 
    chainId === bnbChain.id ? "bsc" :
    chainId === bescChain.id ? "hyperchain" : null;

  // Only show for supported networks
  if (!selectedChain) return null;

  return (
    <div className="w-full p-3 bg-gray-800/30 rounded-lg">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Select Network:
      </label>
      <div className="flex gap-2">
        <button
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            selectedChain === "bsc"
              ? "bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg"
              : "bg-gray-700 hover:bg-gray-600 text-gray-300"
          }`}
          onClick={() => switchChain({ chainId: bnbChain.id })}
          disabled={chainId === bnbChain.id}
        >
          <div className="flex items-center justify-center gap-2">
            <ChainLogo chain="bnb" size="w-5 h-5" />
            <span>BNB Chain</span>
            {chainId === bnbChain.id && (
              <span className="text-green-400">•</span>
            )}
          </div>
        </button>
        <button
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            selectedChain === "hyperchain"
              ? "bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
              : "bg-gray-700 hover:bg-gray-600 text-gray-300"
          }`}
          onClick={() => switchChain({ chainId: bescChain.id })}
          disabled={chainId === bescChain.id}
        >
          <div className="flex items-center justify-center gap-2">
            <ChainLogo chain="besc" size="w-5 h-5" />
            <span>BESC Hyperchain</span>
            {chainId === bescChain.id && (
              <span className="text-green-400">•</span>
            )}
          </div>
        </button>
      </div>
    </div>
  );
}

// Accept custom RPC endpoints, theming, initial tab, and connectors via props
export default function WidgetContainer({
  initialTab = "swap",
  theme = {},
  rpcBsc,
  rpcHyperchain,
  connectors,
  chainConfigOverrides = {},
  ...restProps
}) {
  const [activeTab, setActiveTab] = useState(initialTab);

  // Create default wallet connectors with priority order: MetaMask > Injected > WalletConnect
  const createDefaultConnectors = () => {
    const defaultConnectors = [];
    
    // 1. MetaMask (highest priority)
    try {
      defaultConnectors.push(metaMask({
        dappMetadata: {
          name: "Swap Bridge Widget",
          url: window.location.href,
          iconUrl: `${window.location.origin}/favicon.ico`,
        },
      }));
    } catch (error) {
      console.warn("MetaMask connector not available:", error);
    }

    // 2. Generic Injected connector (Trust Wallet, Phantom, etc.)
    try {
      defaultConnectors.push(injected({
        target: {
          id: 'injected',
          name: 'Browser Wallet',
          provider: window.ethereum,
        },
      }));
    } catch (error) {
      console.warn("Injected connector not available:", error);
    }

    // 3. WalletConnect (for mobile wallets)
    try {
      defaultConnectors.push(walletConnect({
        projectId: 'swap-bridge-widget', // You should replace with actual WalletConnect project ID
        showQrModal: true,
        metadata: {
          name: 'Swap Bridge Widget',
          description: 'Token swap and bridge widget',
          url: window.location.href,
          icons: [`${window.location.origin}/favicon.ico`]
        }
      }));
    } catch (error) {
      console.warn("WalletConnect connector not available:", error);
    }

    return defaultConnectors;
  };

  // Default chain configs, allow overrides via props
  const bnbChain = {
    id: 56,
    name: "BNB Chain",
    network: "bsc",
    nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
    rpcUrls: { default: { http: [rpcBsc] } },
    blockExplorers: {
      default: { name: "BSC Explorer", url: "https://bscscan.com" },
    },
    ...chainConfigOverrides.bnbChain,
  };
  const bescChain = {
    id: 2372,
    name: "BESC Hyperchain",
    network: "besc",
    nativeCurrency: { name: "BESC", symbol: "BESC", decimals: 18 },
    rpcUrls: { default: { http: [rpcHyperchain] } },
    blockExplorers: {
      default: {
        name: "BESC Explorer",
        url: "https://explorer.beschyperchain.com",
      },
    },
    ...chainConfigOverrides.bescChain,
  };

  const config = createConfig({
    chains: [bnbChain, bescChain],
    transports: {
      [bnbChain.id]: http(rpcBsc),
      [bescChain.id]: http(rpcHyperchain),
    },
    connectors: connectors || createDefaultConnectors(),
    ssr: false,
  });

  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <div
          className="w-full max-w-md mx-auto my-6 p-4 flex flex-col gap-4 items-center bg-gradient-to-b from-gray-900/60 to-gray-950/65 rounded-2xl shadow-2xl backdrop-blur-md border border-gray-700/30"
          style={theme.container}
        >
          <div className="flex w-full rounded-lg bg-gray-800/50 p-1 gap-1">
            <button
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === "swap"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/50"
              }`}
              onClick={() => setActiveTab("swap")}
            >
              Swap
            </button>
            <button
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === "bridge"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/50"
              }`}
              onClick={() => setActiveTab("bridge")}
            >
              Bridge
            </button>
          </div>
          
          {/* Network Switcher */}
          <NetworkSwitcher bnbChain={bnbChain} bescChain={bescChain} />
          
          <div className="w-full">
            {activeTab === "swap" ? (
              <SwapWidget key="swap" {...restProps} />
            ) : (
              <BridgeWidget key="bridge" {...restProps} />
            )}
          </div>
        </div>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
