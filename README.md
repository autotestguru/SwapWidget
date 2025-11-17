# 🌉 Swap Bridge Widget

A responsive, mobile-first React widget for swapping and bridging tokens between BNB Chain and BESC Hyperchain. Built with Tailwind CSS for modern, compact design that works perfectly on both desktop and mobile devices.

## ✨ Features

- 🎨 **Modern UI with Tailwind CSS** - Clean, responsive design with glassmorphism effects
- 📱 **Mobile-First Responsive** - Optimized for all screen sizes, from mobile to desktop
- ⚡ **Compact & Lightweight** - Minimal bundle size, perfect for widget integration
- 🔗 **Dual Functionality** - Both token swapping and cross-chain bridging
- 🌐 **Multi-Chain Support** - BNB Chain and BESC Hyperchain
- 🎯 **Easy Integration** - Simple API for embedding in any DApp
- ♿ **Accessible** - WCAG compliant with proper form controls and focus management

## 🎨 UI Improvements

### Before (CSS Modules)

- Basic styling with CSS modules
- Limited mobile responsiveness
- Larger bundle size
- Maintenance overhead

### After (Tailwind CSS)

- **90% smaller CSS** - Purged, optimized styles
- **Fully responsive** - Mobile-first design with breakpoints
- **Modern aesthetics** - Gradients, shadows, and smooth animations
- **Consistent spacing** - Systematic design tokens
- **Better UX** - Loading states, hover effects, and micro-interactions

## 🚀 Quick Start

### Installation

```bash
npm install
npm run build
```

### Usage

#### As UMD Script

```html
<script src="dist/swap-bridge-widget.umd.js"></script>
<script>
  SwapBridgeWidget(document.getElementById("widget-container"), {
    initialTab: "swap",
    rpcBsc: "your-bsc-rpc-url",
    rpcHyperchain: "your-hyperchain-rpc-url",
  });
</script>
```

#### As ES Module

```javascript
import { initSwapBridgeWidget } from "./dist/swap-bridge-widget.esm.js";

initSwapBridgeWidget(containerElement, {
  initialTab: "bridge",
  theme: {
    container: { maxWidth: "400px" },
  },
});
```

## 📱 Responsive Design

The widget automatically adapts to different screen sizes:

### Mobile (< 640px)

- Single column layout
- Stacked buttons
- Touch-optimized controls
- Compact spacing

### Desktop (≥ 640px)

- Multi-column layouts where appropriate
- Inline button groups
- Hover effects
- Optimal spacing

## 🎛️ Configuration Options

```javascript
{
  // Initial tab to display
  initialTab: 'swap' | 'bridge', // default: 'swap'

  // Custom RPC endpoints
  rpcBsc: 'string',
  rpcHyperchain: 'string',

  // Wallet connectors
  connectors: [], // Array of wagmi connectors

  // Theme customization
  theme: {
    container: {}, // Container styles
    swapWidget: {}, // Swap widget styles
    bridgeWidget: {} // Bridge widget styles
  },

  // Chain configuration overrides
  chainConfigOverrides: {
    bnbChain: {}, // BNB Chain config
    bescChain: {} // BESC Hyperchain config
  }
}
```

## 🛠️ Development

### Dev Server

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Demo

Open `demo.html` in your browser to see the widget in action.

## 📦 Bundle Analysis

- **UMD Bundle**: ~384KB (gzipped: ~116KB)
- **ES Module**: ~538KB (gzipped: ~137KB)
- **Tailwind CSS**: Automatically purged for optimal size

## 🌈 Design System

### Colors

- **Primary**: Blue gradient (`from-blue-600 to-purple-600`)
- **Background**: Dark glass morphism
- **Text**: Gray scale with proper contrast
- **Status**: Semantic colors (red, yellow, green, blue)

### Spacing

- Consistent `space-y-4` for vertical rhythm
- `gap-2` to `gap-4` for component spacing
- Responsive padding and margins

### Components

- Gradient buttons with hover effects
- Glass-morphism containers
- Loading spinners
- Status badges
- Form inputs with focus states

## 🔧 Technical Stack

- **React 18** - Modern React with hooks
- **Wagmi v2** - Web3 React hooks
- **Viem v2** - TypeScript Ethereum library
- **TanStack Query v5** - Data fetching and caching
- **Tailwind CSS v4** - Utility-first CSS framework
- **Vite** - Fast build tool and dev server

## 🎯 Browser Support

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📄 License

MIT License - see LICENSE file for details.

---

**Ready to integrate?** Check out `demo.html` for a live example, or use the widget in your own DApp today! 🚀
