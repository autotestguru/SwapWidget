import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    lib: {
      entry: "src/index.jsx",
      name: "SwapBridgeWidget",
      fileName: (format) => `swap-bridge-widget.${format}.js`,
      formats: ["es", "umd"],
    },
    cssCodeSplit: false, // Include CSS in the main bundle
    rollupOptions: {
      // Exclude peer deps
      external: ["react", "react-dom"],
      output: {
        exports: "default",
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
        // Ensure the global function is available
        name: "initSwapBridgeWidget",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "style.css") return "swap-bridge-widget.css";
          return assetInfo.name;
        },
      },
    },
  },
});
