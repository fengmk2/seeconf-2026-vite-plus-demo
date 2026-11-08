import { defineConfig } from "vite-plus";

export default defineConfig({
  server: {
    host: "127.0.0.1",
    port: 6517,
    strictPort: true,
  },
  lint: {
    options: { typeAware: true, typeCheck: true },
  },
  test: {
    include: ["src/**/*.test.ts"],
  },
  run: {
    tasks: {
      verify: {
        command: "vp check && vp test && vp build",
      },
    },
  },
});
