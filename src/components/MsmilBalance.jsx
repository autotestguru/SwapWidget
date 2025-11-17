import { useEffect, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { MSMIL_CONTRACTS } from "../constants/tokenContracts.js";
import msmilTokenAbi from "../constants/msmilTokenAbi.json";

export default function MsmilBalance() {
  const { address, chainId, isConnected } = useAccount();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get MSMIL contract address for current chain
  const contractAddress = chainId ? MSMIL_CONTRACTS[chainId] : null;

  // Read MSMIL balance
  const {
    data: balanceData,
    isError,
    isLoading,
    refetch,
  } = useReadContract({
    address: contractAddress,
    abi: msmilTokenAbi,
    functionName: "balanceOf",
    args: [address],
    enabled: Boolean(address && contractAddress && isConnected),
  });

  // Read token decimals
  const { data: decimalsData } = useReadContract({
    address: contractAddress,
    abi: msmilTokenAbi,
    functionName: "decimals",
    enabled: Boolean(contractAddress),
  });

  // Read token symbol
  const { data: symbolData } = useReadContract({
    address: contractAddress,
    abi: msmilTokenAbi,
    functionName: "symbol",
    enabled: Boolean(contractAddress),
  });

  useEffect(() => {
    if (balanceData && decimalsData) {
      try {
        const formattedBalance = formatUnits(balanceData, decimalsData);
        setBalance(parseFloat(formattedBalance).toFixed(4));
        setError(null);
      } catch (err) {
        console.error("Error formatting balance:", err);
        setError("Error formatting balance");
      }
    } else if (isError) {
      setError("Error fetching balance");
      setBalance(null);
    }
  }, [balanceData, decimalsData, isError]);

  // Don't render if not connected or no contract address for this chain
  if (!isConnected || !contractAddress) {
    return null;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full p-3 bg-gray-800/30 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">MSMIL Balance:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-gray-400">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full p-3 bg-gray-800/30 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">MSMIL Balance:</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-400">⚠️ {error}</span>
            <button
              onClick={() => refetch()}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show balance
  return (
    <div className="w-full p-3 bg-gray-800/30 rounded-lg">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-300 font-medium">
          MSMIL Balance:
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-green-400">
            {balance !== null ? `${balance}` : "0.0000"}
          </span>
          <span className="text-xs text-gray-500">MSMIL</span>
          <button
            onClick={() => refetch()}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors ml-2"
            title="Refresh balance"
          >
            🔄
          </button>
        </div>
      </div>
    </div>
  );
}