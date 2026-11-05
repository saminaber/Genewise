import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: { rollupOptions: { output: { manualChunks(id) { if (id.endsWith("/src/lib/catalog.js")) return "marker-catalog"; } } } },
  server: { allowedHosts: ["terminal.local"] },
});
