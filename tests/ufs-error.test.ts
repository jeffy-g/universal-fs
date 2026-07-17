/**
 * @file universal-fs/tests/ufs-error.test.ts
 */
import { describe, expect, it } from "vitest";

import {
  UniversalFsError,
  isUFSError,
} from "../dist/index.js";
import {
  UniversalFsError as BrowserUniversalFsError,
  isUFSError as isBrowserUFSError,
} from "../dist/browser.js";
import { readFile as readNodeFile } from "../dist/node-fs";
import { readFile as readBrowserFile } from "../dist/browser-fs";

const capture = async (operation: Promise<unknown>): Promise<unknown> => {
  try {
    await operation;
  } catch (e) {
    return e;
  }
  return undefined;
};

describe("UniversalFsError", () => {
  it("is exported from public node and browser entries", () => {
    expect(typeof UniversalFsError).toBe("function");
    expect(typeof isUFSError).toBe("function");
    expect(BrowserUniversalFsError).toBe(UniversalFsError);
    expect(isBrowserUFSError).toBe(isUFSError);
  });

  it("preserves structured error metadata", () => {
    const cause = new Error();
    const error = new UniversalFsError("ufs failure", {
      cause,
      strategy: "node",
      operation: "read",
      filename: "missing.txt",
    });

    expect(error).toBeInstanceOf(UniversalFsError);
    expect(isUFSError(error)).toBe(true);
    expect(isBrowserUFSError(error)).toBe(true);
    expect(error.cause).toBe(cause);
    expect(error.strategy).toBe("node");
    expect(error.operation).toBe("read");
    expect(error.filename).toBe("missing.txt");
  });

  it("wraps node read failures as UniversalFsError", async () => {
    const filename = "missing-universal-fs-error-test.txt";
    const error = await capture(readNodeFile(filename));

    expect(error).toBeInstanceOf(UniversalFsError);
    expect(isUFSError(error)).toBe(true);
    expect((error as UniversalFsError).strategy).toBe("node");
    expect((error as UniversalFsError).operation).toBe("read");
    expect((error as UniversalFsError).filename).toBe(filename);
    expect((error as UniversalFsError).cause).toBeDefined();
  });

  it("wraps browser read failures as UniversalFsError", async () => {
    const error = await capture(readBrowserFile(null as any));

    expect(error).toBeInstanceOf(UniversalFsError);
    expect(isUFSError(error)).toBe(true);
    expect((error as UniversalFsError).strategy).toBe("browser");
    expect((error as UniversalFsError).operation).toBe("read");
    expect((error as UniversalFsError).filename).toBeUndefined();
    expect((error as UniversalFsError).cause).toBeDefined();
  });
});
