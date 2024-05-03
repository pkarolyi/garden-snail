import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["**/*.e2e-spec.ts"],
    globals: true,
    root: "./",
    env: {
      STORAGE_PROVIDER: "local",
      LOCAL_STORAGE_PATH: "blobs",
    },
  },
  plugins: [swc.vite()],
});
