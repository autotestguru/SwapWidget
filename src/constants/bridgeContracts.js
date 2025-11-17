// Bridge contract addresses for each supported chain
export const BRIDGE_CONTRACTS = {
  56: {
    // BNB Smart Chain
    address: "0x0000000000000000000000000000000000000000", // To be deployed
    deploymentBlock: 0,
  },
  2372: {
    // BESC Hyperchain
    address: "0x0000000000000000000000000000000000000000", // To be deployed
    deploymentBlock: 0,
  },
};

// Chain configurations for the swap widget
export const chains = {
  bsc: {
    id: 56,
    name: "BNB Chain",
    network: "bsc",
    nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
    explorer: "https://bscscan.com",
  },
  hyperchain: {
    id: 2372,
    name: "BESC Hyperchain",
    network: "besc",
    nativeCurrency: { name: "BESC", symbol: "BESC", decimals: 18 },
    explorer: "https://explorer.beschyperchain.com",
  },
};

// Bridge configuration
export const BRIDGE_CONFIG = {
  // Fee configuration (in basis points: 100 = 1.00%)
  DEFAULT_FEE_BASIS_POINTS: 100, // 1.00% default fee
  MIN_FEE_BASIS_POINTS: 0, // 0.00% minimum fee
  MAX_FEE_BASIS_POINTS: 500, // 5.00% maximum fee

  // Default bridge limits (configurable via contract)
  DEFAULT_MIN_BRIDGE_AMOUNT: "1000000000000000000000", // 1000 MSMIL
  DEFAULT_MAX_BRIDGE_AMOUNT: "10000000000000000000000000", // 10M MSMIL

  // Network confirmation requirements
  CONFIRMATION_BLOCKS: {
    56: 3, // BNB Smart Chain
    2372: 12, // BESC Hyperchain
  },
};

// Bridge transaction status
export const BRIDGE_STATUS = {
  INITIATED: "initiated",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
};

// Supported chains for bridging
export const SUPPORTED_BRIDGE_CHAINS = [56, 2372];

// Fee utility functions
export const BRIDGE_FEE_UTILS = {
  /**
   * Convert basis points to percentage string
   * @param {number} basisPoints - Fee in basis points (100 = 1.00%)
   * @returns {string} - Formatted percentage string (e.g., "1.50%")
   */
  basisPointsToPercentage: (basisPoints) => {
    const percentage = basisPoints / 100;
    return `${percentage.toFixed(2)}%`;
  },

  /**
   * Convert percentage to basis points
   * @param {number} percentage - Percentage (1.5 = 1.5%)
   * @returns {number} - Basis points (150)
   */
  percentageToBasisPoints: (percentage) => {
    return Math.round(percentage * 100);
  },

  /**
   * Calculate fee amount from total amount
   * @param {string} amount - Total amount in wei
   * @param {number} feeBasisPoints - Fee rate in basis points
   * @returns {string} - Fee amount in wei
   */
  calculateFee: (amount, feeBasisPoints) => {
    const amountBN = BigInt(amount);
    const feeBN = (amountBN * BigInt(feeBasisPoints)) / BigInt(10000);
    return feeBN.toString();
  },

  /**
   * Calculate bridge amount (amount after fees)
   * @param {string} totalAmount - Total amount in wei
   * @param {number} feeBasisPoints - Fee rate in basis points
   * @returns {string} - Amount after fees in wei
   */
  calculateBridgeAmount: (totalAmount, feeBasisPoints) => {
    const fee = BRIDGE_FEE_UTILS.calculateFee(totalAmount, feeBasisPoints);
    return (BigInt(totalAmount) - BigInt(fee)).toString();
  },
};
