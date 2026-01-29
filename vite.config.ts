import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { cartographer } from "@replit/vite-plugin-cartographer";
import { devBanner } from "@replit/vite-plugin-dev-banner";

const plugins = [react()];

if (process.env.NODE_ENV !== "production" && process.env.REPL_ID) {
  plugins.push(cartographer(), devBanner());
}

export default defineConfig({
  plugins,
  root: path.resolve(import.meta.dirname, "client"),
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  css: {
    postcss: "./postcss.config.js",
  },
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
});
