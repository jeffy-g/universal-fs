/**
 * @file universal-fs/tests/node-readfile.test.ts
 */
import { /* vi, */ describe, it, expect } from "vitest";
import { readFile } from "../dist/node-fs";
import type { TUFSResult } from "../dist";
import {
  PKG_JSON_PATH,
  LOCAL_TEXT_PATH
} from "./utils";


const rePackageName = /@jeffy-g\/universal-fs/;
describe("[Node.js] FS Node Env Tests (no jsdom, with useDetails)", () => {
  it("should handle Blob input with text format", async () => {
    const result = await readFile(LOCAL_TEXT_PATH, { format: "text", useDetails: true });
    expect(result.data).toMatch(/universal-fs/);
  });

  it("should handle Blob input with json format", async () => {
    const result: TUFSResult<{name: string}> = await readFile(PKG_JSON_PATH, { format: "json", useDetails: true });
    expect(result.data.name).toEqual("@jeffy-g/universal-fs");
  });

  it("should handle Blob input with blob format\n" +
    "       (Due to implementation reasons, when the format is specified as 'blob' for a Blob object, readFile returns the Blob object as is.)", async () => {
    const result = await readFile(LOCAL_TEXT_PATH, { format: "blob", useDetails: true });
    expect(result.data).toBeInstanceOf(Blob);
    expect(result.data.type).toEqual("text/plain");
  });
});

describe("[Node.js] FS Node Env Tests (no jsdom, with useDetails)", () => {
  it("should handle Blob input with text format", async () => {
    const result = await readFile(PKG_JSON_PATH, { format: "text" });
    expect(result).toMatch(rePackageName);
  });

  it("should handle Blob input with json format", async () => {
    const result: {name: string} = await readFile(PKG_JSON_PATH, { format: "json" });
    expect(result.name).toEqual("@jeffy-g/universal-fs");
  });

  it("should handle Blob input with blob format\n" +
    "       (Due to implementation reasons, when the format is specified as 'blob' for a Blob object, readFile returns the Blob object as is.)", async () => {
    const result = await readFile(LOCAL_TEXT_PATH, { format: "blob" });
    expect(result).toBeInstanceOf(Blob);
    expect(result.type).toEqual("text/plain");
  });
});
