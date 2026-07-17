/// <reference types="vitest" />
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["./tests/**/*.test.ts"],
    exclude: [
      "./tests/**/browser.test.ts",
      "./tests/**/browser-readfile.test.ts",
      "./tests/**/*.browser.test.ts",
    ],
    globals: true,
    environment: "node", // or "jsdom" for browser-like
    coverage: {
      provider: "v8",
      include: ["dist/**/*.js"],
      // reporter: ["text", "lcov"],
    },
  },
});
