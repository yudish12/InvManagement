import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@app": path.resolve(__dirname, "./src/"),
      "@components": path.resolve(__dirname, "./src/components/"),
      "@modules": path.resolve(__dirname, "./src/modules/"),
      "@state": path.resolve(__dirname, "./src/state/"),
      "@utils": path.resolve(__dirname, "./src/utils/"),
      "@layout": path.resolve(__dirname, "./src/layout/"),
    },
  },
});
