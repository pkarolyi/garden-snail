import { resolve } from "path";
import swc from "unplugin-swc";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      src: resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    root: "./",
    env: {
      AUTH_TOKENS: "token",
      STORAGE_PROVIDER: "local",
      LOCAL_STORAGE_PATH: "blobs",
    },
    exclude: [...configDefaults.exclude, "**/dist/**", "integration/*"],
    coverage: {
      exclude: [
        ...configDefaults.exclude,
        "**/dist/**",
        "integration/*",
        "test/*",
        ".eslintrc.js",
        "**/*.constants.ts",
      ],
    },
  },
  plugins: [swc.vite()],
});
