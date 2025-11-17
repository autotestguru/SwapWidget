# 🚀 GitHub Pages Deployment Guide

## ✨ **Quick Setup (5 minutes)**

### Step 1: Push to GitHub

```bash
# Initialize git repository (if not already done)
git init
git add .
git commit -m "Initial widget build"

# Add your GitHub repository
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### Step 2: Enable GitHub Pages

1. Go to your GitHub repository
2. Click **Settings** tab
3. Scroll down to **Pages** section
4. Under **Source**, select: **GitHub Actions**
5. The workflow will automatically trigger!

### Step 3: Your Widget URLs

After deployment (2-3 minutes), your widget will be available at:

```
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/swap-bridge-widget.js
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/swap-bridge-widget.css
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/index.html (demo page)
```

## 🎯 **Integration in Your React Website**

### Method 1: React Component (Recommended)

```jsx
import { useEffect, useRef } from "react";

const SwapWidget = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const loadWidget = async () => {
      // Load CSS
      const cssId = "swap-widget-css";
      if (!document.getElementById(cssId)) {
        const link = document.createElement("link");
        link.id = cssId;
        link.rel = "stylesheet";
        link.href =
          "https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/swap-bridge-widget.css";
        document.head.appendChild(link);
      }

      // Load JS
      if (!window.initSwapBridgeWidget) {
        const script = document.createElement("script");
        script.src =
          "https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/swap-bridge-widget.js";
        script.onload = () => {
          if (containerRef.current && window.initSwapBridgeWidget) {
            window.initSwapBridgeWidget(containerRef.current);
          }
        };
        document.head.appendChild(script);
      } else {
        // Widget already loaded, just initialize
        if (containerRef.current) {
          window.initSwapBridgeWidget(containerRef.current);
        }
      }
    };

    loadWidget();
  }, []);

  return (
    <div>
      <h2>Swap Your Tokens</h2>
      <div ref={containerRef} />
    </div>
  );
};

export default SwapWidget;
```

### Method 2: Direct HTML Integration

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My DeFi App</title>
    <link
      rel="stylesheet"
      href="https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/swap-bridge-widget.css"
    />
  </head>
  <body>
    <h1>Welcome to My DeFi Platform</h1>

    <!-- Swap Widget Container -->
    <div id="swap-widget-container"></div>

    <script src="https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/swap-bridge-widget.js"></script>
    <script>
      // Initialize widget when page loads
      window.addEventListener("load", () => {
        const container = document.getElementById("swap-widget-container");
        if (window.initSwapBridgeWidget && container) {
          window.initSwapBridgeWidget(container);
        }
      });
    </script>
  </body>
</html>
```

## 🔄 **Auto-Deploy Workflow**

Your GitHub Actions workflow is already set up! Every time you:

1. Make changes to your code
2. Run `npm run build`
3. Commit and push to `main` branch
4. GitHub will automatically rebuild and deploy your widget!

## 📊 **Benefits of GitHub Pages**

✅ **FREE** - No cost for public repositories  
✅ **Global CDN** - Fast loading worldwide  
✅ **HTTPS** - Secure by default  
✅ **Custom Domains** - Add your own domain later  
✅ **Auto Deploy** - Deploys on every push  
✅ **99.9% Uptime** - Reliable GitHub infrastructure

## 🌐 **Adding Custom Domain (Optional)**

### Step 1: Buy a domain (e.g., `widget.yourdomain.com`)

### Step 2: Add DNS record

```
Type: CNAME
Name: widget
Value: YOUR_USERNAME.github.io
```

### Step 3: Configure in GitHub

1. Go to repository **Settings** → **Pages**
2. Add custom domain: `widget.yourdomain.com`
3. Enable **Enforce HTTPS**

Your widget will be available at: `https://widget.yourdomain.com/`

## 🔧 **Widget Customization**

### Theme Support

```jsx
// Custom theme example
window.initSwapBridgeWidget(container, {
  theme: {
    swapWidget: {
      backgroundColor: "#1a1a1a",
      borderColor: "#333",
    },
    bridgeWidget: {
      backgroundColor: "#2a2a2a",
    },
  },
});
```

## 📈 **Monitoring & Analytics**

Your widget will be served from GitHub's CDN with:

- **Automatic compression** (gzip)
- **Browser caching** (efficient loading)
- **Global edge locations** (fast worldwide)

## 🚨 **Important Notes**

1. **Public Repository**: GitHub Pages requires public repo (free)
2. **Build Process**: Always run `npm run build` before pushing
3. **Cache**: Changes may take 2-3 minutes to appear due to CDN cache
4. **Size Limit**: 1GB repository size limit (you're well under this)

## 🎉 **You're Ready!**

Total cost: **$0/month**  
Setup time: **5 minutes**  
Global CDN: **Included**  
Custom domain: **Free** (domain purchase separate)

Your widget is production-ready for integration into any React website!
