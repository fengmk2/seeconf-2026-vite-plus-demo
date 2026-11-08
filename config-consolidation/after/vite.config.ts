// vp migrate: merged .oxlintrc.json (41212182491f911917a3f6cb50ff5ca0).
import { defineConfig } from "vite-plus";

export default defineConfig({
  fmt: {
    semi: true,
    singleQuote: false,
    printWidth: 100,
  },
  lint: {
    rules: {
      eqeqeq: "error",
      "vite-plus/prefer-vite-plus-imports": "error",
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
    jsPlugins: [
      {
        name: "vite-plus",
        specifier: "vite-plus/oxlint-plugin",
      },
    ],
  },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
  run: {
    tasks: {
      verify: {
        command: "vp check && vp test && vp build",
      },
    },
  },
  server: {
    host: "127.0.0.1",
    port: 6518,
    strictPort: true,
  },
  build: {
    outDir: "dist",
  },
});
