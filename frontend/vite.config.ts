import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [react(), nodePolyfills()],
  optimizeDeps: {
    include: [
      "@gear-js/api",
      "@polkadot/api",
      "@polkadot/util",
      "@polkadot/util-crypto",
    ],
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    cors: true,
    hmr: {
      clientPort: 443,
    },
    allowedHosts: true,
  },
  resolve: {
    alias: { "@": "/src" },
    dedupe: ["@polkadot/api", "@polkadot/util", "@polkadot/util-crypto"],
  },
});
