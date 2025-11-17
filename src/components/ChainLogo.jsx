import { CHAIN_LOGOS } from '../constants/chainLogos.js';

export default function ChainLogo({ chain, size = 'w-5 h-5', className = '' }) {
  const logoData = CHAIN_LOGOS[chain];
  
  if (!logoData) {
    return <span className={`inline-block ${size} ${className}`}>?</span>;
  }

  return (
    <div className={`relative ${size} ${className}`}>
      <img
        src={logoData.primary}
        alt={chain.toUpperCase()}
        className={`${size} object-contain`}
        onError={(e) => {
          // Try fallback URLs
          const currentIndex = logoData.fallbacks.findIndex(url => url === e.target.src);
          if (currentIndex < logoData.fallbacks.length - 1) {
            e.target.src = logoData.fallbacks[currentIndex + 1];
          } else {
            // All fallbacks failed, use emoji
            e.target.style.display = 'none';
            e.target.nextElementSibling.style.display = 'inline';
          }
        }}
      />
      <span 
        className={`${size} text-center items-center justify-center hidden`}
        style={{ display: 'none' }}
      >
        {logoData.emoji}
      </span>
    </div>
  );
}