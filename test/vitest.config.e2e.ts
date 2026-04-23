import { resolve } from "path";
import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      src: resolve(__dirname, "../src"),
    },
  },
  test: {
    include: ["**/*.e2e-spec.ts"],
    globals: true,
    root: "./",
    env: {
      AUTH_TOKENS: "token",
      STORAGE_PROVIDER: "local",
      LOCAL_STORAGE_PATH: "blobs",
    },
  },
  plugins: [swc.vite()],
});
