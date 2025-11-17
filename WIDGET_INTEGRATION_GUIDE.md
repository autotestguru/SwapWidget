# 🔧 Widget Integration & Troubleshooting Guide

## ✅ **FIXED ISSUE: `window.initSwapBridgeWidget is not a function`**

**Problem**: The widget function wasn't being attached to the global window object.  
**Solution**: Updated the build to properly expose the function globally.

---

## 🚀 **Updated Integration Methods**

### **Method 1: React Component (Recommended)**

```jsx
import { useEffect, useRef, useState } from "react";

const SwapWidget = () => {
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadWidget = async () => {
      try {
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

        // Load JavaScript
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

        // Wait a moment for the function to be available
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Initialize widget
        if (containerRef.current && window.initSwapBridgeWidget) {
          window.initSwapBridgeWidget(containerRef.current);
          setIsLoading(false);
        } else {
          throw new Error("Widget initialization function not found");
        }
      } catch (err) {
        console.error("Widget loading error:", err);
        setError(err.message);
        setIsLoading(false);
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
        <p>Please check console for more details.</p>
      </div>
    );
  }

  if (isLoading) {
    return <div>Loading swap widget...</div>;
  }

  return <div ref={containerRef} />;
};

export default SwapWidget;
```

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
```

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
