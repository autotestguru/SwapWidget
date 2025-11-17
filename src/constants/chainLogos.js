// Chain logos and fallbacks
export const CHAIN_LOGOS = {
  bnb: {
    primary: "https://cryptologos.cc/logos/bnb-bnb-logo.png",
    fallbacks: [
      "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
      "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png",
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/info/logo.png",
    ],
    emoji: "⚡",
  },
  besc: {
    primary: "https://explorer.beschyperchain.com/favicon.ico",
    fallbacks: [
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiM5MzMzZWEiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iOCIgaGVpZ2h0PSI4Ij4KPHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9IndoaXRlIj4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgY2xhc3M9Imx1Y2lkZSBsdWNpZGUtbGluayI+PHBhdGggZD0ibTkgMTUgNi02Ii8+PHBhdGggZD0iTTExIDZoLjUxYTUgNSAwIDAgMSA0LjVgNHYuNWE1IDUgMCAwIDEtNCA0LjVIMTFhNSA1IDAgMCAxLTQtNHYtMWE1IDUgMCAwIDEgNC00WiIvPjwvc3ZnPgo8L3N2Zz4KPC9zdmc+Cjwvc3ZnPgo=",
    ],
    emoji: "🔗",
  },
};

// Helper function to create logo with fallbacks
export const createChainLogo = (chain, size = "w-5 h-5", altText = "") => {
  const logoData = CHAIN_LOGOS[chain];
  if (!logoData) return null;

  return {
    src: logoData.primary,
    alt: altText || chain.toUpperCase(),
    className: size,
    fallbacks: logoData.fallbacks,
    emoji: logoData.emoji,
  };
};
