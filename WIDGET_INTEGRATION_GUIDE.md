# 🔧 Widget Integration & Troubleshooting Guide

## ✅ **FIXED ISSUE: `window.initSwapBridgeWidget is not a function`**

**Problem**: The widget function wasn't being attached to the global window object.  
**Solution**: Updated the build to properly expose the function globally.

---

## 🚀 **Updated Integration Methods**

### **Method 1: React Component (Recommended)**

```jsx
import { useEffect, useRef, useState, useCallback } from "react";

const SwapWidget = ({
  theme = "light",
  onLoad = () => {},
  onError = () => {},
  retryAttempts = 5,
  retryDelay = 1000,
}) => {
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadAttempts, setLoadAttempts] = useState(0);

  const loadWidget = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load CSS first
      const cssId = "swap-widget-css";
      if (!document.getElementById(cssId)) {
        const link = document.createElement("link");
        link.id = cssId;
        link.rel = "stylesheet";
        link.href =
          "https://autotestguru.github.io/SwapWidget/swap-bridge-widget.css";
        document.head.appendChild(link);
      }

      // Load JavaScript if not already loaded
      if (!window.initSwapBridgeWidget) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src =
            "https://autotestguru.github.io/SwapWidget/swap-bridge-widget.js";
          script.onload = resolve;
          script.onerror = () =>
            reject(new Error("Failed to load widget script"));
          document.head.appendChild(script);
        });
      }

      // Retry mechanism for function availability
      const checkAndInit = async (attempts = 0) => {
        if (window.initSwapBridgeWidget) {
          if (containerRef.current) {
            // Initialize widget with configuration
            window.initSwapBridgeWidget(containerRef.current, { theme });
            setIsLoading(false);
            onLoad();
            console.log("SwapWidget loaded successfully");
          } else {
            throw new Error("Container ref not available");
          }
        } else if (attempts < retryAttempts) {
          console.log(
            `Widget function not ready, retrying... (${
              attempts + 1
            }/${retryAttempts})`
          );
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          return checkAndInit(attempts + 1);
        } else {
          throw new Error(
            `Widget function not available after ${retryAttempts} attempts`
          );
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
          setLoadAttempts((prev) => prev + 1);
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
        containerRef.current.innerHTML = "";
      }
    };
  }, []);

  if (error && loadAttempts >= retryAttempts) {
    return (
      <div
        style={{
          padding: "20px",
          border: "1px solid #ef4444",
          borderRadius: "8px",
          backgroundColor: "#fef2f2",
          color: "#dc2626",
        }}
      >
        <h3>⚠️ Widget Load Error</h3>
        <p>{error}</p>
        <p>
          Attempted {loadAttempts} times. Please check your internet connection.
        </p>
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
            cursor: "pointer",
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
        style={{
          padding: "20px",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          backgroundColor: "#f9fafb",
          textAlign: "center",
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
    <div ref={containerRef} style={{ width: "100%", minHeight: "400px" }} />
  );
};

// Usage Example:
const App = () => {
  const handleWidgetLoad = () => {
    console.log("Widget loaded successfully!");
  };

  const handleWidgetError = (error) => {
    console.error("Widget failed to load:", error);
    // You could send this to your analytics/error tracking service
  };

  return (
    <div>
      <h1>My DeFi App</h1>
      <SwapWidget
        theme="light"
        onLoad={handleWidgetLoad}
        onError={handleWidgetError}
        retryAttempts={3}
        retryDelay={2000}
      />
    </div>
  );
};

export default SwapWidget;
```

### **Method 1B: React Hook (Advanced)**

For more control, you can create a custom hook:

```jsx
import { useEffect, useRef, useState, useCallback } from "react";

const useSwapWidget = (options = {}) => {
  const {
    theme = "light",
    autoInit = true,
    retryAttempts = 5,
    retryDelay = 1000,
    onLoad = () => {},
    onError = () => {},
  } = options;

  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);

  const initWidget = useCallback(
    async (container = containerRef.current) => {
      if (!container) {
        throw new Error("Container reference is required");
      }

      setIsLoading(true);
      setError(null);

      try {
        // Ensure scripts are loaded
        if (!window.initSwapBridgeWidget) {
          // Load CSS
          const cssId = "swap-widget-css";
          if (!document.getElementById(cssId)) {
            const link = document.createElement("link");
            link.id = cssId;
            link.rel = "stylesheet";
            link.href =
              "https://autotestguru.github.io/SwapWidget/swap-bridge-widget.css";
            document.head.appendChild(link);
          }

          // Load JS
          await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src =
              "https://autotestguru.github.io/SwapWidget/swap-bridge-widget.js";
            script.onload = resolve;
            script.onerror = () =>
              reject(new Error("Failed to load widget script"));
            document.head.appendChild(script);
          });
        }

        // Wait for function with retry
        let attempts = 0;
        while (!window.initSwapBridgeWidget && attempts < retryAttempts) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          attempts++;
        }

        if (!window.initSwapBridgeWidget) {
          throw new Error(
            `Widget function not available after ${retryAttempts} attempts`
          );
        }

        // Initialize
        window.initSwapBridgeWidget(container, { theme });
        setIsReady(true);
        setIsLoading(false);
        onLoad();
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
        onError(err);
        throw err;
      }
    },
    [theme, retryAttempts, retryDelay, onLoad, onError]
  );

  useEffect(() => {
    if (autoInit && containerRef.current && !isReady) {
      initWidget();
    }
  }, [autoInit, initWidget, isReady]);

  return {
    containerRef,
    isLoading,
    error,
    isReady,
    initWidget,
    retry: () => initWidget(),
  };
};

// Usage:
const MySwapComponent = () => {
  const { containerRef, isLoading, error, retry } = useSwapWidget({
    theme: "light",
    retryAttempts: 3,
    onLoad: () => console.log("Widget ready!"),
    onError: (err) => console.error("Widget error:", err),
  });

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <button onClick={retry}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      {isLoading && <p>Loading widget...</p>}
      <div ref={containerRef} />
    </div>
  );
};
```

};

export default SwapWidget;

````

### **Method 2: Direct HTML Integration**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My DeFi App</title>

    <!-- Load widget CSS -->
    <link
      rel="stylesheet"
      href="https://autotestguru.github.io/SwapWidget/swap-bridge-widget.css"
    />

    <!-- Load React and ReactDOM (required dependencies) -->
    <script
      crossorigin
      src="https://unpkg.com/react@18/umd/react.production.min.js"
    ></script>
    <script
      crossorigin
      src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"
    ></script>
  </head>
  <body>
    <h1>My DeFi Platform</h1>

    <!-- Widget Container -->
    <div id="swap-widget"></div>

    <!-- Load widget JavaScript -->
    <script src="https://autotestguru.github.io/SwapWidget/swap-bridge-widget.js"></script>

    <script>
      // Wait for everything to load
      window.addEventListener("load", function () {
        console.log("Page loaded, checking for widget...");

        // Check if function exists
        if (typeof window.initSwapBridgeWidget === "function") {
          console.log("Widget function found, initializing...");

          const container = document.getElementById("swap-widget");
          if (container) {
            try {
              window.initSwapBridgeWidget(container);
              console.log("Widget initialized successfully!");
            } catch (error) {
              console.error("Widget initialization error:", error);
            }
          } else {
            console.error("Container element not found");
          }
        } else {
          console.error("initSwapBridgeWidget function not found");
          console.log(
            "Available on window:",
            Object.keys(window).filter((k) => k.includes("init"))
          );
        }
      });
    </script>
  </body>
</html>
````

### **Method 3: Vue.js Integration**

```vue
<template>
  <div>
    <div v-if="loading">Loading widget...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div ref="widgetContainer"></div>
  </div>
</template>

<script>
export default {
  name: "SwapWidget",
  data() {
    return {
      loading: true,
      error: null,
    };
  },
  mounted() {
    this.loadWidget();
  },
  methods: {
    async loadWidget() {
      try {
        // Load CSS
        const cssId = "swap-widget-css";
        if (!document.getElementById(cssId)) {
          const link = document.createElement("link");
          link.id = cssId;
          link.rel = "stylesheet";
          link.href =
            "https://autotestguru.github.io/SwapWidget/swap-bridge-widget.css";
          document.head.appendChild(link);
        }

        // Load JS
        if (!window.initSwapBridgeWidget) {
          await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src =
              "https://autotestguru.github.io/SwapWidget/swap-bridge-widget.js";
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        // Initialize
        if (this.$refs.widgetContainer && window.initSwapBridgeWidget) {
          window.initSwapBridgeWidget(this.$refs.widgetContainer);
          this.loading = false;
        }
      } catch (err) {
        this.error = err.message;
        this.loading = false;
      }
    },
  },
};
</script>
```

---

## 🔍 **Debugging Steps**

### **1. Check if files are loading**

Open browser developer tools and check:

```javascript
// In browser console:
console.log(
  "CSS loaded:",
  !!document.querySelector('link[href*="swap-bridge-widget.css"]')
);
console.log(
  "JS loaded:",
  !!document.querySelector('script[src*="swap-bridge-widget.js"]')
);
console.log("Function available:", typeof window.initSwapBridgeWidget);
```

### **2. Check for errors**

Look in browser console for:

- Network errors (404, CORS issues)
- JavaScript errors
- React/ReactDOM missing

### **3. Test widget directly**

Visit your widget demo page: https://autotestguru.github.io/SwapWidget/

---

## ⚡ **Common Issues & Solutions**

### **Issue**: `React is not defined`

**Solution**: Load React and ReactDOM before the widget:

```html
<script
  crossorigin
  src="https://unpkg.com/react@18/umd/react.production.min.js"
></script>
<script
  crossorigin
  src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"
></script>
```

### **Issue**: Widget appears but doesn't function

**Solution**: Check for CSS conflicts or missing container element.

### **Issue**: CORS errors

**Solution**: GitHub Pages automatically sets correct CORS headers, this shouldn't happen.

---

## 📱 **Testing Your Integration**

After the GitHub Pages deployment completes (3-5 minutes), test:

1. **Direct access**: https://autotestguru.github.io/SwapWidget/swap-bridge-widget.js
2. **Demo page**: https://autotestguru.github.io/SwapWidget/
3. **Function test**:
   ```javascript
   fetch("https://autotestguru.github.io/SwapWidget/swap-bridge-widget.js")
     .then(() => console.log("✅ Widget JS accessible"))
     .catch(() => console.log("❌ Widget JS not accessible"));
   ```

---

## 🎯 **Next Steps**

1. **Wait 3-5 minutes** for GitHub Pages to deploy the fix
2. **Test the demo page**: https://autotestguru.github.io/SwapWidget/
3. **Use the updated integration code above**
4. **Check browser console** for any remaining errors

The `window.initSwapBridgeWidget is not a function` error should now be resolved! 🎉
