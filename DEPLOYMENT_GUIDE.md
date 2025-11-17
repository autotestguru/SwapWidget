# 🚀 Widget Deployment Guide

## 📋 Overview

This guide shows you how to host your swap bridge widget so it can be embedded on any website. The widget is built as a UMD (Universal Module Definition) bundle that works with any HTML page.

## 📁 Required Files for Hosting

After running `npm run build`, you need these files from the `dist/` folder:

### Core Widget Files:

```
dist/
├── swap-bridge-widget.umd.js    # Main widget JavaScript bundle
└── swap-bridge-widget.css       # Widget styles
```

### Optional Files (for local testing):

```
public/
├── index.html                   # Basic integration example
├── simple-test.html            # Simple test page
└── demo.html                   # Full demo page
```

## 🌐 Hosting Options

### Option 1: CDN Hosting (Recommended)

Host on a CDN for global distribution and fast loading:

**Popular CDN Services:**

- **jsDelivr** (free, GitHub-based)
- **unpkg** (free, npm-based)
- **AWS CloudFront**
- **Cloudflare**
- **Vercel**
- **Netlify**

### Option 2: Self-Hosting

Host on your own server/domain for full control.

---

## 🎯 Step-by-Step Deployment

### Step 1: Prepare Files for Upload

1. **Copy the built files:**

```bash
# From your project directory
cp dist/swap-bridge-widget.umd.js ./widget/swap-bridge-widget.js
cp dist/swap-bridge-widget.css ./widget/swap-bridge-widget.css
```

2. **Create integration documentation:**

```bash
# Copy example HTML files
cp simple-test.html ./widget/example.html
```

### Step 2: Choose Your Hosting Method

#### 🅰️ Method A: GitHub + jsDelivr (Free CDN)

1. **Create a new GitHub repository:**

```bash
git init swap-bridge-widget-cdn
cd swap-bridge-widget-cdn
```

2. **Add your widget files:**

```
swap-bridge-widget-cdn/
├── dist/
│   ├── swap-bridge-widget.js
│   └── swap-bridge-widget.css
├── examples/
│   └── index.html
└── README.md
```

3. **Push to GitHub:**

```bash
git add .
git commit -m "Add swap bridge widget v1.0.0"
git tag v1.0.0
git push origin main --tags
```

4. **Access via jsDelivr:**

```
https://cdn.jsdelivr.net/gh/yourusername/swap-bridge-widget-cdn@v1.0.0/dist/swap-bridge-widget.js
https://cdn.jsdelivr.net/gh/yourusername/swap-bridge-widget-cdn@v1.0.0/dist/swap-bridge-widget.css
```

#### 🅱️ Method B: Self-Hosting

1. **Upload to your web server:**

```
your-domain.com/
└── widgets/
    └── swap-bridge/
        ├── swap-bridge-widget.js
        └── swap-bridge-widget.css
```

2. **Access via your domain:**

```
https://your-domain.com/widgets/swap-bridge/swap-bridge-widget.js
https://your-domain.com/widgets/swap-bridge/swap-bridge-widget.css
```

### Step 3: Create Integration Documentation

Create an `integration.html` file showing how others can use your widget:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Swap Bridge Widget Integration</title>
    <!-- Include the widget CSS -->
    <link rel="stylesheet" href="https://your-cdn-url/swap-bridge-widget.css" />
  </head>
  <body>
    <!-- Widget container -->
    <div id="swap-bridge-widget-container"></div>

    <!-- Include the widget JS -->
    <script src="https://your-cdn-url/swap-bridge-widget.js"></script>

    <!-- Initialize the widget -->
    <script>
      // Initialize the widget
      const container = document.getElementById("swap-bridge-widget-container");

      // Create widget with custom configuration
      const widget = SwapBridgeWidget.default({
        initialTab: "swap", // 'swap' or 'bridge'
        rpcBsc: "https://bsc-dataseed1.binance.org",
        rpcHyperchain: "https://rpc.beschyperchain.com/",
        theme: {
          container: {
            background: "rgba(0, 0, 0, 0.8)",
            borderRadius: "16px",
          },
        },
      });

      // Render the widget
      ReactDOM.render(widget, container);
    </script>
  </body>
</html>
```

## 🔧 Widget Integration Code

### Basic Integration (Minimal Code)

```html
<!-- Add to <head> -->
<link rel="stylesheet" href="https://your-cdn-url/swap-bridge-widget.css" />

<!-- Add where you want the widget -->
<div id="swap-widget"></div>

<!-- Add before closing </body> -->
<script src="https://your-cdn-url/swap-bridge-widget.js"></script>
<script>
  ReactDOM.render(
    SwapBridgeWidget.default(),
    document.getElementById("swap-widget")
  );
</script>
```

### Advanced Integration (Custom Configuration)

```html
<script>
  const widgetConfig = {
    initialTab: "bridge",
    rpcBsc: "https://your-custom-rpc.com",
    rpcHyperchain: "https://your-hyperchain-rpc.com",
    theme: {
      container: {
        maxWidth: "400px",
        margin: "20px auto",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      },
    },
  };

  ReactDOM.render(
    SwapBridgeWidget.default(widgetConfig),
    document.getElementById("swap-widget")
  );
</script>
```

## 📦 Distribution Package Structure

For easy distribution, create this structure:

```
swap-bridge-widget-package/
├── dist/
│   ├── swap-bridge-widget.js     # Main UMD bundle
│   └── swap-bridge-widget.css    # Styles
├── examples/
│   ├── basic.html                # Basic integration
│   ├── advanced.html             # Advanced with config
│   └── multiple-widgets.html     # Multiple widgets on page
├── docs/
│   ├── integration.md            # Integration guide
│   ├── configuration.md          # Config options
│   └── troubleshooting.md        # Common issues
└── README.md                     # Main documentation
```

## 🌍 CORS and Security Considerations

### CORS Headers (if self-hosting)

Add these headers to your server:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

### Content Security Policy

Websites using your widget may need to add:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="script-src 'self' https://your-cdn-url; 
               style-src 'self' https://your-cdn-url 'unsafe-inline';"
/>
```

## 🚀 Quick Start for Website Owners

Provide this simple copy-paste code for website owners:

```html
<!-- Swap Bridge Widget - Add anywhere on your page -->
<div id="swap-bridge-widget" style="max-width: 400px; margin: 20px auto;"></div>

<!-- Widget Dependencies -->
<link rel="stylesheet" href="https://your-cdn-url/swap-bridge-widget.css" />
<script
  crossorigin
  src="https://unpkg.com/react@18/umd/react.production.min.js"
></script>
<script
  crossorigin
  src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"
></script>
<script src="https://your-cdn-url/swap-bridge-widget.js"></script>

<script>
  // Initialize widget when page loads
  window.addEventListener("DOMContentLoaded", function () {
    ReactDOM.render(
      SwapBridgeWidget.default(),
      document.getElementById("swap-bridge-widget")
    );
  });
</script>
```

## 📋 Checklist for Going Live

- [ ] ✅ Build widget with `npm run build`
- [ ] ✅ Test widget files work independently
- [ ] ✅ Choose hosting method (CDN or self-host)
- [ ] ✅ Upload widget files to hosting
- [ ] ✅ Test widget loads from hosted URLs
- [ ] ✅ Create integration documentation
- [ ] ✅ Test on different websites
- [ ] ✅ Set up monitoring/analytics (optional)
- [ ] ✅ Create support documentation

## 🎯 Next Steps

1. **Version Control**: Tag releases for stable widget versions
2. **Documentation**: Create comprehensive integration docs
3. **Examples**: Provide multiple integration examples
4. **Support**: Set up support channel for integration help
5. **Updates**: Plan for seamless widget updates

Your widget is now ready for global distribution! 🌟
