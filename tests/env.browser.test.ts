/**
 * @file universal-fs/tests/env.browser.test.ts
 */
import { describe, expect, it } from "vitest";
import { loadModule } from "../dist/env.js";
import { isBrowser, isNode } from "../dist/types.js";

describe("loadModule in a browser", () => {
  it("runs in an actual browser environment", () => {
    expect(isBrowser).toBe(true);
    expect(isNode).toBe(false);
  });

  it("loads and caches a versioned ESM package from jsDelivr", async () => {
    const first = await loadModule<typeof import("fflate")>("fflate", "0.8.3");
    const second = await loadModule<typeof import("fflate")>("fflate", "0.8.3");

    expect(typeof first.gunzipSync).toBe("function");
    expect(second).toBe(first);
  });
});
