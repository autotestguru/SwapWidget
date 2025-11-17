import React from "react";
import { createRoot } from "react-dom/client";
import WidgetContainer from "./WidgetContainer.jsx";
import "./index.css"; // Import Tailwind CSS

// Mounts widget to given DOM node or container ID and passes any props
function initSwapBridgeWidget(containerOrId, props = {}) {
  let container;
  
  // Check if React and ReactDOM are available
  if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
    const errorMsg = 'React and ReactDOM must be loaded before initializing the widget. Please include React and ReactDOM scripts.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  // Check React version compatibility (support both 18 and 19)
  const reactVersion = React.version;
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
      // For React 19 compatibility, we need to handle the root creation more carefully
      let root;
      try {
        root = createRoot(container);
      } catch (error) {
        console.error('Failed to create React root:', error);
        throw new Error('Failed to create React root. Make sure container is a valid DOM element.');
      }
      
      // Render the widget with error boundary
      root.render(React.createElement(WidgetContainer, props));
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

// Default export for UMD builds
export default initSwapBridgeWidget;
