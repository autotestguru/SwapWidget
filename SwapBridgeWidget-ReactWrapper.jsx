import { useEffect, useRef, useState } from 'react';

/**
 * React wrapper component for the Swap Bridge Widget
 * 
 * @param {Object} props
 * @param {string} props.widgetUrl - Base URL where widget is hosted (e.g., 'https://your-project.vercel.app')
 * @param {Object} props.theme - Theme customization object
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onLoad - Callback when widget loads
 * @param {Function} props.onError - Callback when widget fails to load
 */
const SwapBridgeWidget = ({ 
  widgetUrl = 'https://your-project.vercel.app', 
  theme = {},
  className = '',
  onLoad,
  onError 
}) => {
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const loadWidget = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        // Load CSS if not already loaded
        const cssId = 'swap-bridge-widget-css';
        if (!document.getElementById(cssId)) {
          const link = document.createElement('link');
          link.id = cssId;
          link.rel = 'stylesheet';
          link.href = `${widgetUrl}/swap-bridge-widget.css`;
          document.head.appendChild(link);
        }

        // Load JS if not already loaded
        if (!window.initSwapBridgeWidget) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `${widgetUrl}/swap-bridge-widget.js`;
            script.onload = resolve;
            script.onerror = () => reject(new Error('Failed to load widget script'));
            document.head.appendChild(script);
          });
        }

        // Initialize widget if component is still mounted
        if (isMounted && containerRef.current && window.initSwapBridgeWidget) {
          window.initSwapBridgeWidget(containerRef.current, { theme });
          setIsLoading(false);
          onLoad?.();
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(error.message);
          setIsLoading(false);
          onError?.(error);
        }
      }
    };

    loadWidget();

    return () => {
      isMounted = false;
    };
  }, [widgetUrl, theme, onLoad, onError]);

  if (loadError) {
    return (
      <div className={`swap-widget-error ${className}`}>
        <div className="error-message">
          <h3>Widget Load Error</h3>
          <p>{loadError}</p>
          <p>Please check if the widget URL is correct: {widgetUrl}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`swap-widget-wrapper ${className}`}>
      {isLoading && (
        <div className="swap-widget-loading">
          <div className="loading-spinner">Loading widget...</div>
        </div>
      )}
      <div ref={containerRef} className="swap-widget-container" />
    </div>
  );
};

export default SwapBridgeWidget;

/**
 * Usage Example:
 * 
 * import SwapBridgeWidget from './SwapBridgeWidget';
 * 
 * function App() {
 *   return (
 *     <div className="App">
 *       <h1>My DeFi App</h1>
 *       <SwapBridgeWidget 
 *         widgetUrl="https://your-project.vercel.app"
 *         theme={{
 *           swapWidget: { backgroundColor: '#1a1a1a' },
 *           bridgeWidget: { backgroundColor: '#2a2a2a' }
 *         }}
 *         onLoad={() => console.log('Widget loaded!')}
 *         onError={(error) => console.error('Widget error:', error)}
 *       />
 *     </div>
 *   );
 * }
 */