/**
 * @file universal-fs/tests/readfile-errors.test.ts
 */
import { /* vi, */ describe, it, expect } from "vitest";
import { readFile } from "../dist/node-fs";
import { readFile as bwReadFile } from "../dist/browser-fs";
import { MSG_UNSUPPORTED_INPUT } from "../dist/utils";
import {
  JSDELIVR_ICON_URL,
  RE_FORMAT_ERR, RE_INVALID_FORMAT,
  LOCAL_TEXT_PATH
} from "./utils";

const re_MSG_UNSUPPORTED_INPUT = new RegExp(MSG_UNSUPPORTED_INPUT);
describe("[Node.js] FS Node Env Tests (errors)", () => {
  it("should throw on non-existent file path", async () => {
    await expect(readFile("nonexistent.txt")).rejects.toThrow(/ENOENT|not found/i);
  });
  it("should throw SyntaxError on invalid JSON content", async () => {
    await expect(readFile(LOCAL_TEXT_PATH, { format: "json" })).rejects.toThrow(RE_INVALID_FORMAT);
  });
  it("should throw on unsupported format", async () => {
    // @ts-expect-error
    await expect(readFile(LOCAL_TEXT_PATH, { format: "foobar" })).rejects.toThrow(RE_FORMAT_ERR);
  });
  it("should throw when input is null", async () => {
    await expect(readFile(null as any)).rejects.toThrow(re_MSG_UNSUPPORTED_INPUT); // Unsupported input type
  });
});
describe("[Browser] FS Node Env Tests (errors)", () => {
  describe("should throw invalid input (string)", async () => {
    it("On invalid URL", async () => {
      // not URL format
      await expect(bwReadFile("nonexistent.url")).rejects.toThrow(/Failed to parse URL from nonexistent.url/i);
    });
    it("On non existent URL#1", async () => {
      // http error (404)
      await expect(bwReadFile("https://www.yahoo.co.jp-bad/")).rejects.toThrow(/fetch failed/);
    });
    it("On non existent URL#2", async () => {
      // http error (404)
      await expect(bwReadFile(JSDELIVR_ICON_URL + "-bad")).rejects.toThrow(/HTTP \d+: .+/);
    });
  })
  it("should throw SyntaxError on invalid JSON content", async () => {
    const blob = new Blob(["not json"], { type: "application/json" });
    await expect(bwReadFile(blob, { format: "json" })).rejects.toThrow(RE_INVALID_FORMAT);
  });
  it("should throw on unsupported format", async () => {
    // @ts-expect-error
    await expect(bwReadFile(JSDELIVR_ICON_URL, { format: "foobar" })).rejects.toThrow(/Unsupported format/);
  });
  it("should throw when input is null", async () => {
    await expect(bwReadFile(null as any)).rejects.toThrow(re_MSG_UNSUPPORTED_INPUT); // Unsupported input type
  });
});
