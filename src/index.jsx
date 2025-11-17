import React from "react";
import { createRoot } from "react-dom/client";
import WidgetContainer from "./WidgetContainer.jsx";
import "./index.css"; // Import Tailwind CSS

// Mounts widget to given DOM node or container ID and passes any props
function initSwapBridgeWidget(containerOrId, props = {}) {
  let container;
  
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
    createRoot(container).render(<WidgetContainer {...props} />);
    console.log('SwapBridge Widget initialized successfully');
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
