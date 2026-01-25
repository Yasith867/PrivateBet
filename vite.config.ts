import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(async () => {
  const plugins = [react()];

  // Only load Replit plugins in Replit dev
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID
  ) {
    const { cartographer } = await import(
      "@replit/vite-plugin-cartographer"
    );
    const { devBanner } = await import(
      "@replit/vite-plugin-dev-banner"
    );

    plugins.push(cartographer(), devBanner());
  }

  return {
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
  };
});
