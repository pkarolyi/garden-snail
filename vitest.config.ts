import swc from "unplugin-swc";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    root: "./",
    env: {
      AUTH_TOKENS: "token",
      STORAGE_PROVIDER: "local",
      LOCAL_STORAGE_PATH: "blobs",
    },
    exclude: [...configDefaults.exclude, "integration/*"],
    coverage: {
      exclude: [
        ...configDefaults.exclude,
        "integration/*",
        "test/*",
        ".eslintrc.js",
        "**/*.constants.ts",
      ],
    },
  },
  plugins: [swc.vite()],
});
