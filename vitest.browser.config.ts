/// <reference types="@vitest/browser-playwright" />
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [
      "./tests/env.browser.test.ts",
      "./tests/browser.test.ts",
      "./tests/browser-readfile.test.ts",
    ],
    testTimeout: 15_000,
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
    },
  },
});
