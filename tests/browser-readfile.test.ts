/**
 * @file universal-fs/tests/browser-readfile.test.ts
 */
import { /* vi, */ describe, it, expect } from "vitest";
import { readFile } from "../dist/browser-fs.js";
import {
  JSDELIVR_NPM_PACKAGE_URL,
} from "./utils.ts";


describe("[Browser] FS Node Env Tests (no jsdom, with useDetails)", () => {
  it("should handle Blob input with text format", async () => {
    const blob = new Blob(["Hello Vitest"], { type: "text/plain" });
    const result = await readFile(blob, { format: "text", useDetails: true });
    expect(result.data).toBe("Hello Vitest");
  });

  it("should handle Blob input with json format", async () => {
    const blob = new Blob([JSON.stringify({ a: 1, b: 2 })], { type: "application/json" });
    const result = await readFile(blob, { format: "json", useDetails: true });
    expect(result.data).toEqual({ a: 1, b: 2 });
  });

  it("should handle Blob input with blob format\n" +
    "       (Due to implementation reasons, when the format is specified as 'blob' for a Blob object, readFile returns the Blob object as is.)", async () => {
    const blob = new Blob(["blob content"], { type: "text/plain" });
    const result = await readFile(blob, { format: "blob", useDetails: true });
    expect(result.data).toBeInstanceOf(Blob);
    expect(result.data).toEqual(blob);
  });

  it("should handle string URL input with text format (fetch, jsDelivr npm asset)", async () => {
    const result = await readFile(JSDELIVR_NPM_PACKAGE_URL, { format: "text", useDetails: true });
    expect(JSON.parse(result.data).name).toBe("fflate");
  });
  // it("should handle string URL input with text format (mock fetch)", async () => {
  //   // Prepare a mock fetch to mimic a URL fetch
  //   global.fetch = vi.fn().mockImplementation(() =>
  //     Promise.resolve(new Response("mocked response text", { status: 200 }))
  //   );
  //   const result = await readFile("https://example.com/data.txt", { format: "text" });
  //   expect(result.data).toBe("mocked response text");
  //   // reset mock
  //   vi.resetAllMocks();
  // });
});

describe("[Browser] FS Node Env Tests (no jsdom, without useDetails)", () => {
  it("should handle Blob input with text format", async () => {
    const blob = new Blob(["Hello Vitest"], { type: "text/plain" });
    const result = await readFile(blob, { format: "text" });
    expect(result).toBe("Hello Vitest");
  });

  it("should handle Blob input with json format", async () => {
    const blob = new Blob([JSON.stringify({ a: 1, b: 2 })], { type: "application/json" });
    const result = await readFile(blob, { format: "json" });
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it("should handle Blob input with blob format\n" +
    "       (Due to implementation reasons, when the format is specified as 'blob' for a Blob object, readFile returns the Blob object as is.)", async () => {
    const blob = new Blob(["blob content"], { type: "text/plain" });
    const result = await readFile(blob, { format: "blob" });
    expect(result).toBeInstanceOf(Blob);
    expect(result).toEqual(blob);
  });

  it("should handle string URL input with text format (fetch, jsDelivr npm asset)", async () => {
    const result = await readFile(JSDELIVR_NPM_PACKAGE_URL, { format: "text" });
    expect(JSON.parse(result).name).toBe("fflate");
  });
});
