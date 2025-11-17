import React from "react";
import { createRoot } from "react-dom/client";
import WidgetContainer from "./WidgetContainer.jsx";
import "./index.css";

function initSwapBridgeWidget(containerOrId, props = {}) {
  let container;
  
  // For UMD builds, React and ReactDOM should be available globally
  const ReactLib = typeof React !== 'undefined' ? React : (typeof window !== 'undefined' ? window.React : null);
  
  if (!ReactLib) {
    const errorMsg = 'React is not available. Make sure React is loaded before initializing the widget.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  // Check React version compatibility
  const reactVersion = ReactLib.version;
  console.log('React version detected:', reactVersion);
  if (reactVersion && !reactVersion.match(/^(18|19)\./)) {
    console.warn('Widget is tested with React 18/19, detected version:', reactVersion);
  }
  
  // Handle both DOM node and string ID
  if (typeof containerOrId === 'string') {
    container = document.getElementById(containerOrId);
    if (!container) {
      throw new Error(`Container with id "${containerOrId}" not found`);
    }
  } else if (containerOrId instanceof Element) {
    container = containerOrId;
  } else {
    throw new Error("Container must be a DOM node or element ID string");
  }
  
  // Wait for DOM to be ready if needed
  const mountWidget = () => {
    try {
      let root;
      try {
        root = createRoot(container);
      } catch (error) {
        console.error('Failed to create React root:', error);
        throw new Error('Failed to create React root. Make sure container is a valid DOM element.');
      }
      
      // Render the widget - use React.createElement for better compatibility
      root.render(ReactLib.createElement(WidgetContainer, props));
      console.log('SwapBridge Widget initialized successfully');
    } catch (error) {
      console.error('Failed to mount widget:', error);
      throw error;
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountWidget);
  } else {
    mountWidget();
  }
}

// Make function available globally for browser usage
if (typeof window !== 'undefined') {
  window.initSwapBridgeWidget = initSwapBridgeWidget;
}

export default initSwapBridgeWidget;
