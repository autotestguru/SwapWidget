import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { MSMIL_CONTRACTS } from "../constants/tokenContracts.js";
import msmilTokenAbi from "../constants/msmilTokenAbi.json";

/**
 * Custom hook to fetch MSMIL balance for a given address and chain
 * Returns [balance, refreshFunction]
 */
export function useMsmilBalance(address, chainId) {
  const [balance, setBalance] = useState(null);
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
    enabled: Boolean(address && contractAddress),
  });

  // Read token decimals
  const { data: decimalsData } = useReadContract({
    address: contractAddress,
    abi: msmilTokenAbi,
    functionName: "decimals",
    enabled: Boolean(contractAddress),
  });

  useEffect(() => {
    if (balanceData && decimalsData) {
      try {
        const formattedBalance = formatUnits(balanceData, decimalsData);
        setBalance(parseFloat(formattedBalance).toFixed(4));
        setError(null);
      } catch (err) {
        console.error("Error formatting MSMIL balance:", err);
        setError("Error formatting balance");
        setBalance(null);
      }
    } else if (isError) {
      setError("Error fetching balance");
      setBalance(null);
    } else if (!contractAddress) {
      setBalance(null);
      setError(null);
    }
  }, [balanceData, decimalsData, isError, contractAddress]);

  return [balance, refetch, isLoading, error];
}
