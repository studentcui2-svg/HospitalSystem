import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // equivalent to 0.0.0.0 – listen on all interfaces
    port: 5173, // you can change the port if needed
    open: true,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        rewrite: (path) => path,
      },
      "/uploads": {
        target: "http://localhost:5000",
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
  },
});
