import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: "127.0.0.1",
    port: 6518,
    strictPort: true,
  },
  build: {
    outDir: "dist",
  },
});
