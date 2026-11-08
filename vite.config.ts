import { defineConfig } from "vite-plus";

export default defineConfig({
  defaultPackage: {
    dev: "./apps/agenda-web",
    build: "./apps/agenda-web",
    preview: "./apps/agenda-web",
    pack: "./packages/favorites-lib",
  },
  fmt: {
    semi: true,
    singleQuote: false,
    printWidth: 100,
    ignorePatterns: ["config-consolidation/**", ".demo/**"],
  },
  lint: {
    options: { typeAware: true, typeCheck: true },
    ignorePatterns: ["config-consolidation/**", ".demo/**"],
  },
  test: {
    include: ["packages/*/src/**/*.test.ts", "apps/*/src/**/*.test.ts"],
    environment: "node",
  },
  run: {
    tasks: {
      verify: {
        command: "vp check && vp test && vp build && vp pack",
        // Pack reads previous outputs while cleaning. Track source inputs, not generated files.
        cache: { input: [{ auto: true }, "!**/dist/**"] },
      },
    },
  },
});
