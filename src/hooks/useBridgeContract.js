import { useContractRead, useContractWrite } from "wagmi";
import { parseEther, formatEther } from "viem";
import {
  BRIDGE_CONTRACTS,
  BRIDGE_CONFIG,
  BRIDGE_FEE_UTILS,
} from "../constants/bridgeContracts";
import bridgeAbi from "../constants/bridgeAbi.json";

export function useBridgeContract(chainId) {
  const bridgeContract = BRIDGE_CONTRACTS[chainId];

  // Read bridge limits
  const { data: bridgeLimits } = useContractRead({
    address: bridgeContract?.address,
    abi: bridgeAbi,
    functionName: "getBridgeLimits",
    enabled:
      !!bridgeContract?.address &&
      bridgeContract.address !== "0x0000000000000000000000000000000000000000",
  });

  // Read bridge fee rate
  const { data: bridgeFeeRate } = useContractRead({
    address: bridgeContract?.address,
    abi: bridgeAbi,
    functionName: "getBridgeFeeRate",
    args: [chainId],
    enabled:
      !!bridgeContract?.address &&
      bridgeContract.address !== "0x0000000000000000000000000000000000000000",
  });

  // Bridge tokens function
  const {
    data: bridgeData,
    isLoading: isBridging,
    write: bridgeTokens,
  } = useContractWrite({
    address: bridgeContract?.address,
    abi: bridgeAbi,
    functionName: "bridgeTokens",
  });

  // Get bridge fee for amount
  const getBridgeFee = (amount, toChainId) => {
    if (!amount || !bridgeFeeRate) return "0";

    const feeRate = Number(bridgeFeeRate);
    return BRIDGE_FEE_UTILS.calculateFee(amount, feeRate);
  };

  // Get bridge amount after fees
  const getBridgeAmount = (amount, toChainId) => {
    if (!amount || !bridgeFeeRate) return amount;

    const feeRate = Number(bridgeFeeRate);
    return BRIDGE_FEE_UTILS.calculateBridgeAmount(amount, feeRate);
  };

  // Get fee percentage string
  const getFeePercentage = () => {
    if (!bridgeFeeRate) return "0.00%";
    return BRIDGE_FEE_UTILS.basisPointsToPercentage(Number(bridgeFeeRate));
  };

  // Validate bridge amount
  const validateBridgeAmount = (amount) => {
    if (!bridgeLimits) return { valid: true };

    const amountWei = parseEther(amount.toString());
    const [minAmount, maxAmount] = bridgeLimits;

    if (amountWei < minAmount) {
      return {
        valid: false,
        error: `Minimum bridge amount is ${formatEther(minAmount)} MSMIL`,
      };
    }

    if (amountWei > maxAmount) {
      return {
        valid: false,
        error: `Maximum bridge amount is ${formatEther(maxAmount)} MSMIL`,
      };
    }

    return { valid: true };
  };

  return {
    // Contract info
    bridgeContract: bridgeContract?.address,
    isContractDeployed:
      bridgeContract?.address &&
      bridgeContract.address !== "0x0000000000000000000000000000000000000000",

    // Read functions
    bridgeLimits,
    bridgeFeeRate,
    getFeePercentage,
    getBridgeFee,
    getBridgeAmount,
    validateBridgeAmount,

    // Write functions
    bridgeTokens,
    isBridging: isBridging,
    bridgeTransactionHash: bridgeData?.hash,
  };
}
