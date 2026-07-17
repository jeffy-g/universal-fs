/**
 * @file universal-fs/tests/env.test.ts
 */
import { describe, expect, it } from "vitest";
import { loadModule } from "../dist/env.js";


describe("loadModule", () => {
  it("loads a module from its Node.js specifier", async () => {
    const path = await loadModule<typeof import("node:path")>("node:path");
    expect(typeof path.join).toBe("function");
    expect(path.join("a", "b")).toBe(`a${path.sep}b`);
  });

  it("ignores the CDN version and preserves native module caching in Node.js", async () => {
    const first = await loadModule<typeof import("node:path")>("node:path");
    const second = await loadModule<typeof import("node:path")>("node:path", "ignored-in-node");
    expect(second).toBe(first);
  });

  it("propagates import failures", async () => {
    await expect(loadModule("@jeffy-g/ufs-missing-test-module")).rejects.toBeInstanceOf(Error);
  });
});
