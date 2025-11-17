import { useEffect, useRef, useState, useCallback } from "react";

interface SwapWidgetProps {
  /** Widget theme */
  theme?: 'light' | 'dark';
  /** Callback when widget loads successfully */
  onLoad?: () => void;
  /** Callback when widget fails to load */
  onError?: (error: Error) => void;
  /** Number of retry attempts */
  retryAttempts?: number;
  /** Delay between retries in milliseconds */
  retryDelay?: number;
  /** Custom styles for the container */
  style?: React.CSSProperties;
  /** CSS class for the container */
  className?: string;
}

declare global {
  interface Window {
    initSwapBridgeWidget?: (container: HTMLElement, config?: { theme?: string }) => void;
  }
}

/**
 * SwapBridge Widget Component for React with TypeScript
 */
const SwapWidget: React.FC<SwapWidgetProps> = ({ 
  theme = 'light', 
  onLoad = () => {}, 
  onError = () => {},
  retryAttempts = 5,
  retryDelay = 1000,
  style = {},
  className = ""
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loadAttempts, setLoadAttempts] = useState<number>(0);

  const loadWidget = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

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
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://autotestguru.github.io/SwapWidget/swap-bridge-widget.js";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load widget script"));
          document.head.appendChild(script);
        });
      }

      // Retry mechanism for function availability
      const checkAndInit = async (attempts = 0): Promise<void> => {
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
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error("Widget loading error:", err);
      setError(errorMessage);
      setIsLoading(false);
      onError(err instanceof Error ? err : new Error(errorMessage));
      
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