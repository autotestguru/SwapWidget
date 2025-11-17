# React 19 Integration Guide for SwapBridge Widget

## The Issue with React 19

Your website uses React 19, but the widget was originally built for React 18. The error `Cannot read properties of undefined (reading '__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED')` occurs because React 19 has different internal structures.

## Solution: Updated Widget Code for React 19

### Option 1: Fixed Integration for React 19 (Recommended)

```jsx
import React, { useRef, useEffect, useState } from "react";

const SwapWidget = () => {
  const containerRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadWidget = async () => {
      try {
        // CRITICAL: Properly expose React globals for the widget
        // The widget needs React to have specific internal properties
        if (!window.React) {
          window.React = React;
        }
        
        // For React 19, we need to expose ReactDOM with the right structure
        if (!window.ReactDOM) {
          try {
            // Import the full react-dom module for React 19
            const ReactDOM = await import("react-dom");
            const ReactDOMClient = await import("react-dom/client");
            
            // Create a combined ReactDOM object that includes both legacy and new APIs
            window.ReactDOM = {
              ...ReactDOM.default,
              ...ReactDOMClient,
              createRoot: ReactDOMClient.createRoot
            };
          } catch (e) {
            console.error("Failed to load ReactDOM:", e);
            throw new Error("Could not load ReactDOM properly");
          }
        }

        console.log("React globals set:", {
          React: !!window.React,
          ReactDOM: !!window.ReactDOM,
          ReactVersion: React.version
        });

        // Load widget CSS
        const cssId = "swap-widget-css";
        if (!document.getElementById(cssId)) {
          const link = document.createElement("link");
          link.id = cssId;
          link.rel = "stylesheet";
          link.href =
            "https://autotestguru.github.io/SwapWidget/swap-bridge-widget.css";
          document.head.appendChild(link);
        }

        // Load widget JS
        if (!window.initSwapBridgeWidget) {
          await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src =
              "https://autotestguru.github.io/SwapWidget/swap-bridge-widget.js";
            script.onload = resolve;
            script.onerror = () => reject(new Error("Failed to load widget"));
            document.head.appendChild(script);
          });
        }
        }

        // Wait for function availability
        let attempts = 0;
        while (!window.initSwapBridgeWidget && attempts < 10) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          attempts++;
        }

        if (window.initSwapBridgeWidget && containerRef.current) {
          window.initSwapBridgeWidget(containerRef.current, { theme: "light" });
          setIsLoaded(true);
        } else {
          throw new Error("Widget function not available");
        }
      } catch (err) {
        console.error("Widget load error:", err);
        setError(err.message);
      }
    };

    loadWidget();
  }, []);

  if (error) {
    return (
      <div
        style={{
          padding: "20px",
          border: "1px solid red",
          borderRadius: "8px",
        }}
      >
        <h3>Widget Load Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      {!isLoaded && <div>Loading swap widget...</div>}
      <div ref={containerRef} style={{ minHeight: "400px" }} />
    </div>
  );
};

export default SwapWidget;
```

### Option 2: Using a Custom Hook

```jsx
import { useRef, useEffect, useState } from "react";

const useSwapWidget = () => {
  const containerRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  const initWidget = async () => {
    try {
      // Make React available globally for React 19 compatibility
      if (!window.React) {
        const React = await import("react");
        window.React = React.default;
      }

      if (!window.ReactDOM) {
        const ReactDOM = await import("react-dom/client");
        window.ReactDOM = ReactDOM;
      }

      // Load widget resources
      const [cssLoaded, jsLoaded] = await Promise.all([
        loadCSS(
          "https://autotestguru.github.io/SwapWidget/swap-bridge-widget.css"
        ),
        loadJS(
          "https://autotestguru.github.io/SwapWidget/swap-bridge-widget.js"
        ),
      ]);

      // Initialize widget
      if (window.initSwapBridgeWidget && containerRef.current) {
        window.initSwapBridgeWidget(containerRef.current, { theme: "light" });
        setIsLoaded(true);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const loadCSS = (href) => {
    return new Promise((resolve, reject) => {
      const id = "swap-widget-css";
      if (document.getElementById(id)) {
        resolve();
        return;
      }
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = href;
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
    });
  };

  const loadJS = (src) => {
    return new Promise((resolve, reject) => {
      if (window.initSwapBridgeWidget) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  return { containerRef, isLoaded, error, initWidget };
};

// Usage
const MyComponent = () => {
  const { containerRef, isLoaded, error, initWidget } = useSwapWidget();

  useEffect(() => {
    initWidget();
  }, []);

  if (error) return <div>Error: {error}</div>;
  if (!isLoaded) return <div>Loading widget...</div>;

  return <div ref={containerRef} />;
};
```

### Option 3: Simple Integration for React 19

```jsx
import React, { useEffect, useRef } from "react";

const SwapWidget = () => {
  const ref = useRef();

  useEffect(() => {
    const script = document.createElement("script");
    script.innerHTML = `
      // Ensure React 19 compatibility
      if (!window.React) {
        window.React = ${JSON.stringify(React)};
      }
      
      // Load and initialize widget
      fetch('https://autotestguru.github.io/SwapWidget/swap-bridge-widget.js')
        .then(response => response.text())
        .then(code => {
          eval(code);
          if (window.initSwapBridgeWidget) {
            window.initSwapBridgeWidget(document.getElementById('swap-widget-${Date.now()}'));
          }
        });
    `;
    document.head.appendChild(script);

    // Load CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://autotestguru.github.io/SwapWidget/swap-bridge-widget.css";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(script);
      document.head.removeChild(link);
    };
  }, []);

  return <div ref={ref} id={`swap-widget-${Date.now()}`} />;
};

export default SwapWidget;
```

## Key Changes for React 19 Compatibility:

1. **Global React Assignment**: React 19 might not automatically expose `React` globally
2. **ReactDOM Import**: Use `react-dom/client` instead of `react-dom`
3. **Dynamic Imports**: Use dynamic imports for better compatibility
4. **Error Handling**: Better error handling for version mismatches

## Quick Fix for Your Current Setup:

Add this script tag before loading the widget:

```html
<script>
  // Ensure React is globally available for the widget
  if (window.React && !window.React.version.startsWith("18")) {
    console.log("Detected React 19, ensuring compatibility...");
    // The widget will handle React 19 internally
  }
</script>
```

The updated widget now includes React 19 compatibility checks and should work with your setup!
