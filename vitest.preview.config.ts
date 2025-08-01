/// <reference types="vitest" />
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["**/tests/**/browser.test.ts"],
    globals: true,
    environment: "node", // or "jsdom" for browser-like
    coverage: {
      provider: "v8",
    },
  },
});
