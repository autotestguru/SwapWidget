# SwapBridge Widget - Iframe Integration Guide

## 🎯 **Why Iframe Integration?**

Using an iframe completely isolates the widget from your main application, preventing:

- React version conflicts (your React 19 vs widget's React 18)
- Global variable conflicts
- CSS conflicts
- Bundle size increases

## 🚀 **Quick Integration**

### **Basic Iframe Usage**

```html
<iframe
  src="https://autotestguru.github.io/SwapWidget/embed.html"
  width="100%"
  height="500"
  frameborder="0"
  style="border: none; border-radius: 12px;"
  title="SwapBridge Widget"
>
</iframe>
```

### **Responsive Integration**

```html
<div style="width: 100%; max-width: 450px; margin: 0 auto;">
  <iframe
    src="https://autotestguru.github.io/SwapWidget/embed.html?theme=light"
    width="100%"
    height="500"
    frameborder="0"
    style="border: none; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"
    title="SwapBridge Widget"
  >
  </iframe>
</div>
```

## ⚙️ **Configuration Options**

You can customize the widget using URL parameters:

### **Theme**

```html
<!-- Light Theme (default) -->
<iframe
  src="https://autotestguru.github.io/SwapWidget/embed.html?theme=light"
></iframe>

<!-- Dark Theme -->
<iframe
  src="https://autotestguru.github.io/SwapWidget/embed.html?theme=dark"
></iframe>
```

## 📱 **React Component Wrapper**

For your React 19 website, you can wrap the iframe in a component:

```jsx
import React, { useRef, useEffect, useState } from "react";

const SwapWidget = ({
  theme = "light",
  width = "100%",
  height = "500",
  className = "",
  onLoad = () => {},
  onError = () => {},
}) => {
  const iframeRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleMessage = (event) => {
      // Verify origin for security
      if (event.origin !== "https://autotestguru.github.io") return;

      switch (event.data.type) {
        case "SWAP_WIDGET_LOADED":
          setIsLoaded(true);
          onLoad();
          break;
        case "SWAP_WIDGET_ERROR":
          setError(event.data.error);
          onError(event.data.error);
          break;
        case "IFRAME_RESIZE":
          if (iframeRef.current) {
            iframeRef.current.style.height = event.data.height + "px";
          }
          break;
        case "IFRAME_READY":
          console.log("SwapWidget iframe is ready");
          break;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onLoad, onError]);

  const iframeSrc = `https://autotestguru.github.io/SwapWidget/embed.html?theme=${theme}`;

  return (
    <div className={className}>
      <iframe
        ref={iframeRef}
        src={iframeSrc}
        width={width}
        height={height}
        frameBorder="0"
        style={{
          border: "none",
          borderRadius: "12px",
          backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        }}
        title="SwapBridge Widget"
      />
      {error && (
        <div
          style={{
            padding: "16px",
            marginTop: "8px",
            backgroundColor: "#fef2f2",
            border: "1px solid #f87171",
            borderRadius: "8px",
            color: "#dc2626",
          }}
        >
          Error loading widget: {error}
        </div>
      )}
    </div>
  );
};

export default SwapWidget;
```

### **Usage in Your App**

```jsx
import SwapWidget from "./components/SwapWidget";

function MyApp() {
  return (
    <div>
      <h1>My DeFi Platform</h1>
      <SwapWidget
        theme="light"
        width="100%"
        height="600"
        onLoad={() => console.log("Widget loaded!")}
        onError={(error) => console.error("Widget error:", error)}
      />
    </div>
  );
}
```

## 🎨 **Styling Examples**

### **Card Style**

```css
.widget-container {
  max-width: 420px;
  margin: 0 auto;
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.widget-container iframe {
  border-radius: 12px;
}
```

### **Full-width Integration**

```css
.widget-fullwidth {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.widget-fullwidth iframe {
  width: 100%;
  min-height: 500px;
}
```

## 🔒 **Security Considerations**

The iframe integration is secure by default:

- ✅ **Isolated Environment**: Widget runs in its own context
- ✅ **No Direct DOM Access**: Widget cannot access your main app
- ✅ **Origin Verification**: Message handling verifies the source
- ✅ **No Script Injection**: No external scripts loaded in your app

## 📊 **Browser Support**

Works in all modern browsers:

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+

## 🔧 **Troubleshooting**

### **Widget Not Loading**

1. Check browser console for errors
2. Verify the iframe src URL is accessible
3. Ensure your website allows iframe loading

### **Height Issues**

The iframe includes auto-resize functionality, but you can set a fixed height:

```html
<iframe
  src="https://autotestguru.github.io/SwapWidget/embed.html"
  height="600"
  style="min-height: 500px;"
>
</iframe>
```

### **Theme Not Applying**

Make sure to include the theme parameter in the URL:

```html
<iframe
  src="https://autotestguru.github.io/SwapWidget/embed.html?theme=dark"
></iframe>
```

## 🎯 **Benefits of Iframe Integration**

1. **Zero Conflicts**: No React version issues
2. **Easy Integration**: Just add one HTML tag
3. **Automatic Updates**: Widget updates without code changes
4. **Secure**: Isolated execution environment
5. **Responsive**: Auto-adjusts to container size
6. **Cross-Platform**: Works in any web framework (React, Vue, Angular, etc.)

## 🚀 **Production Ready**

The iframe is production-ready and hosted on GitHub Pages with:

- ✅ Global CDN
- ✅ HTTPS enabled
- ✅ 99.9% uptime
- ✅ Fast loading
- ✅ Mobile optimized

Start using it immediately with zero setup required! 🎉
