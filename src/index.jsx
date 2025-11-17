import React from "react";
import { createRoot } from "react-dom/client";
import WidgetContainer from "./WidgetContainer.jsx";
import "./index.css"; // Import Tailwind CSS

// Mounts widget to given DOM node and passes any props
function initSwapBridgeWidget(container, props = {}) {
  if (!container) throw new Error("Container DOM node required");
  createRoot(container).render(<WidgetContainer {...props} />);
}

// Make function available globally for browser usage
if (typeof window !== 'undefined') {
  window.initSwapBridgeWidget = initSwapBridgeWidget;
}

// Default export for UMD builds
export default initSwapBridgeWidget;
