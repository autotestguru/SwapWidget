# 🚀 Widget Hosting Guide

## Quick Comparison

| Platform         | Cost  | Setup Time | CDN | Custom Domain    | Build Time |
| ---------------- | ----- | ---------- | --- | ---------------- | ---------- |
| **GitHub Pages** | FREE  | 5 min      | ✅  | ✅ (paid domain) | Fast       |
| **Vercel**       | FREE  | 2 min      | ✅  | ✅               | Very Fast  |
| **Netlify**      | FREE  | 3 min      | ✅  | ✅               | Fast       |
| **DigitalOcean** | $4/mo | 10 min     | ✅  | ✅               | Medium     |

## 🎯 **RECOMMENDED: Vercel (Easiest & Free)**

### Step 1: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (from project root)
vercel

# Follow prompts:
# ? Set up and deploy? Yes
# ? Which scope? (your account)
# ? Link to existing project? No
# ? What's your project's name? swap-bridge-widget
# ? In which directory is your code located? ./
# ? Want to override settings? No
```

### Step 2: Your widget will be available at:

```
https://your-project-name.vercel.app/swap-bridge-widget.js
https://your-project-name.vercel.app/swap-bridge-widget.css
```

### Step 3: Use in your React website:

```jsx
// In your React component
useEffect(() => {
  // Load CSS
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://your-project-name.vercel.app/swap-bridge-widget.css";
  document.head.appendChild(link);

  // Load JS
  const script = document.createElement("script");
  script.src = "https://your-project-name.vercel.app/swap-bridge-widget.js";
  script.onload = () => {
    // Initialize widget
    if (window.initSwapBridgeWidget) {
      const container = document.getElementById("widget-container");
      window.initSwapBridgeWidget(container);
    }
  };
  document.head.appendChild(script);

  return () => {
    document.head.removeChild(link);
    document.head.removeChild(script);
  };
}, []);

return <div id="widget-container" />;
```

## 🔥 **Alternative: GitHub Pages (100% Free)**

### Step 1: Enable GitHub Pages

1. Push code to GitHub repository
2. Go to Settings > Pages
3. Source: GitHub Actions
4. The workflow will auto-deploy on push to main

### Step 2: Your widget will be available at:

```
https://yourusername.github.io/swap-bridge-widget/swap-bridge-widget.js
https://yourusername.github.io/swap-bridge-widget/swap-bridge-widget.css
```

## 💰 **Cost Breakdown**

### FREE Options (Recommended)

- **Vercel Free**: 100GB bandwidth/month, custom domain
- **GitHub Pages**: Unlimited for public repos
- **Netlify Free**: 100GB bandwidth/month

### Paid Options (Only if needed)

- **DigitalOcean App Platform**: $4/month (if you need more control)
- **Vercel Pro**: $20/month (for teams/high traffic)

## 🌐 **Custom Domain Setup**

### For Vercel:

```bash
# Add custom domain
vercel domains add widget.yourdomain.com
```

### For GitHub Pages:

1. Go to Settings > Pages
2. Custom domain: `widget.yourdomain.com`
3. Add CNAME record in your DNS: `widget CNAME yourusername.github.io`

## 🔧 **Integration Examples**

### Option 1: Direct Script Loading

```html
<!DOCTYPE html>
<html>
  <head>
    <link
      rel="stylesheet"
      href="https://your-domain.vercel.app/swap-bridge-widget.css"
    />
  </head>
  <body>
    <div id="swap-widget"></div>
    <script src="https://your-domain.vercel.app/swap-bridge-widget.js"></script>
    <script>
      window.initSwapBridgeWidget(document.getElementById("swap-widget"));
    </script>
  </body>
</html>
```

### Option 2: React Component Wrapper

```jsx
import { useEffect, useRef } from "react";

const SwapWidget = ({ theme }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    let widget;

    const loadWidget = async () => {
      // Load CSS
      if (!document.querySelector('link[href*="swap-bridge-widget.css"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://your-domain.vercel.app/swap-bridge-widget.css";
        document.head.appendChild(link);
      }

      // Load JS
      if (!window.initSwapBridgeWidget) {
        await new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = "https://your-domain.vercel.app/swap-bridge-widget.js";
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }

      // Initialize widget
      if (containerRef.current && window.initSwapBridgeWidget) {
        window.initSwapBridgeWidget(containerRef.current, { theme });
      }
    };

    loadWidget();
  }, [theme]);

  return <div ref={containerRef} className="swap-widget-container" />;
};

export default SwapWidget;
```

## ⚡ **Quick Start Commands**

### Deploy to Vercel (Fastest):

```bash
npx vercel --prod
```

### Deploy to Netlify:

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=public
```

### Manual Upload:

```bash
# Build first
npm run build

# Upload public/ folder contents to any static host
# Files needed: swap-bridge-widget.js, swap-bridge-widget.css, index.html
```

## 🎯 **Recommended Approach**

1. **Start with Vercel** (easiest, professional)
2. Use URL: `https://your-project.vercel.app`
3. Add custom domain later if needed
4. Monitor usage and upgrade only if necessary

## 📊 **Performance Tips**

- All platforms provide global CDN
- Enable gzip compression (auto-enabled)
- Use browser caching (configured in headers)
- Current bundle size: ~650KB gzipped (excellent)

**Total Time to Deploy: 2-5 minutes!**
