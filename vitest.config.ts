import swc from "unplugin-swc";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    root: "./",
    exclude: [...configDefaults.exclude, "integration/*"],
    coverage: {
      exclude: [
        ...configDefaults.exclude,
        "integration/*",
        "test/*",
        ".eslintrc.js",
        "**/*.module.ts",
        "**/*.constants.ts",
      ],
    },
  },
  plugins: [swc.vite()],
});
