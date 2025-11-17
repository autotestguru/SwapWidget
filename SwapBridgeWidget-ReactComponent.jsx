import { useEffect, useRef, useState, useCallback } from "react";

/**
 * SwapBridge Widget Component - Compatible with React 18 & 19
 * 
 * @param {Object} props - Component props
 * @param {string} props.theme - Widget theme ('light' or 'dark')
 * @param {Function} props.onLoad - Callback when widget loads successfully
 * @param {Function} props.onError - Callback when widget fails to load
 * @param {number} props.retryAttempts - Number of retry attempts (default: 5)
 * @param {number} props.retryDelay - Delay between retries in ms (default: 1000)
 * @param {Object} props.style - Custom styles for the container
 * @param {string} props.className - CSS class for the container
 */
const SwapWidget = ({ 
  theme = 'light', 
  onLoad = () => {}, 
  onError = () => {},
  retryAttempts = 5,
  retryDelay = 1000,
  style = {},
  className = ""
}) => {
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadAttempts, setLoadAttempts] = useState(0);

  const loadWidget = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check React version compatibility
      const reactVersion = React?.version || 'unknown';
      console.log('Host React version:', reactVersion);

      // Load CSS first
      const cssId = "swap-widget-css";
      if (!document.getElementById(cssId)) {
        const link = document.createElement("link");
        link.id = cssId;
        link.rel = "stylesheet";
        link.href = "https://autotestguru.github.io/SwapWidget/swap-bridge-widget.css";
        document.head.appendChild(link);
      }

      // Load JavaScript if not already loaded
      if (!window.initSwapBridgeWidget) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://autotestguru.github.io/SwapWidget/swap-bridge-widget.js";
          script.onload = resolve;
          script.onerror = () => reject(new Error("Failed to load widget script"));
          document.head.appendChild(script);
        });
      }

      // For React 19 compatibility, we need to ensure React globals are available
      // The widget expects React and ReactDOM to be global
      if (!window.React) {
        window.React = React;
      }
      if (!window.ReactDOM) {
        window.ReactDOM = require('react-dom/client') || require('react-dom');
      }

      // Retry mechanism for function availability
      const checkAndInit = async (attempts = 0) => {
        if (window.initSwapBridgeWidget) {
          if (containerRef.current) {
            // Initialize widget with configuration
            window.initSwapBridgeWidget(containerRef.current, { theme });
            setIsLoading(false);
            onLoad();
            console.log('SwapWidget loaded successfully');
          } else {
            throw new Error("Container ref not available");
          }
        } else if (attempts < retryAttempts) {
          console.log(`Widget function not ready, retrying... (${attempts + 1}/${retryAttempts})`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return checkAndInit(attempts + 1);
        } else {
          throw new Error(`Widget function not available after ${retryAttempts} attempts`);
        }
      };

      await checkAndInit();
      
    } catch (err) {
      console.error("Widget loading error:", err);
      setError(err.message);
      setIsLoading(false);
      onError(err);
      
      // Auto-retry on failure
      if (loadAttempts < retryAttempts) {
        setTimeout(() => {
          setLoadAttempts(prev => prev + 1);
          loadWidget();
        }, retryDelay);
      }
    }
  }, [theme, onLoad, onError, retryAttempts, retryDelay, loadAttempts]);

  useEffect(() => {
    loadWidget();
  }, [loadWidget]);

  // Cleanup function
  useEffect(() => {
    return () => {
      // Clean up if needed when component unmounts
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  if (error && loadAttempts >= retryAttempts) {
    return (
      <div
        className={className}
        style={{
          padding: "20px",
          border: "1px solid #ef4444",
          borderRadius: "8px",
          backgroundColor: "#fef2f2",
          color: "#dc2626",
          ...style
        }}
      >
        <h3>⚠️ Widget Load Error</h3>
        <p>{error}</p>
        <p>Attempted {loadAttempts} times. Please check your internet connection.</p>
        <button 
          onClick={() => {
            setLoadAttempts(0);
            loadWidget();
          }}
          style={{
            marginTop: "10px",
            padding: "8px 16px",
            backgroundColor: "#dc2626",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className={className}
        style={{
          padding: "20px",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          backgroundColor: "#f9fafb",
          textAlign: "center",
          ...style
        }}
      >
        <div style={{ marginBottom: "10px" }}>🔄 Loading Swap Widget...</div>
        {loadAttempts > 0 && (
          <div style={{ fontSize: "0.9em", color: "#6b7280" }}>
            Attempt {loadAttempts + 1} of {retryAttempts + 1}
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={className}
      style={{ 
        width: "100%", 
        minHeight: "400px",
        ...style 
      }} 
    />
  );
};

export default SwapWidget;