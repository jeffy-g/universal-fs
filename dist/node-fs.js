/*!
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  Copyright (C) 2025 jeffy-g <hirotom1107@gmail.com>
//  Released under the MIT license
//  https://opensource.org/licenses/mit-license.php
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
/**
 * @file universal-fs/src/node-fs.ts
 */
import * as fs from "node:fs/promises";
import { constants } from "node:fs";
import * as path from "node:path";
import {
  UniversalFsError,
  guessMimeType,
  formatFsErrorMessage,
  createErrorParameters,
  convertToBlob,
  convertToJSON,
  decideFormat,
  MSG_UNSUPPORTED_INPUT,
  emitReadFileFunction,
} from "./utils.js";
/**
 * @import {
 * TUFSOptions,
 * IInternalFs
 * } from "./types.d.ts"
 */
const writeErrParams = createErrorParameters(void 0, "node", "write");
async function readFileLocal(filename, options = {}) {
  if (typeof filename !== "string") {
    // TODO: 2025/7/31 7:11:15 - Or, Blob and File will be supported (in the future)
    throw new Error(MSG_UNSUPPORTED_INPUT);
  }
  const fullPath = path.resolve(filename);
  const stats = await fs.stat(fullPath);
  if (!stats.isFile()) {
    throw new UniversalFsError(`Path is not a file: ${fullPath}`);
  }
  const buffer = await fs.readFile(fullPath);
  const convertedData = convertFromBuffer(buffer, options, fullPath);
  if (!options.useDetails) return convertedData;
  return {
    filename,
    path: fullPath,
    size: stats.size,
    strategy: "node",
    timestamp: Date.now(),
    data: convertedData,
    mimeType: guessMimeType(filename),
  };
}
/**
 * Reads a file via HTTP(S) or from a Blob/File in a browser environment.
 *
 * - Supports input as `string` (URL) or `Blob`/`File`.
 * - Automatically parses based on `options.format`
 * - Supported formats: `"text"`, `"json"`, `"arrayBuffer"`, `"blob"`, `"binary"`.
 *
 * **Note:**
 * When reading from a `Blob` or `File`, the returned `url` property will be a pseudo-URL (`"blob://local"`)
 * instead of an actual object URL to avoid memory leaks. Consumers should not rely on this for displaying
 * the content directly. If an actual object URL is required, consider using `URL.createObjectURL()` manually.
 *
 * @param filename - File path, URL string, or `Blob`/`File` instance.
 * @param [options] - UniversalFs options.
 * @returns Result object containing the data.
 * @type {IInternalFs["readFile"]}
 */
// local file read:
//   node env の場合、file access permision に問題なければ無制限
//   browser env では不可
export const readFile = emitReadFileFunction("node", readFileLocal);
/**
 * Write a file in Node.js environment.
 * @param filename - File path.
 * @param data - Data to write.
 * @param [options] - UniversalFs options.
 * @returns Result object.
 * @type {IInternalFs["writeFile"]}
 */
export async function writeFile(filename, data, options = {}) {
  try {
    const fullPath = path.resolve(filename);
    // If the directory does not exist, create it
    const dir = path.dirname(fullPath);
    if (!(await exists(dir))) {
      await fs.mkdir(dir, { recursive: true });
    }
    const normalized = await normalizeWriteData(data, options);
    // Since normalizeWriteData always returns a Uint8Array, there is no point in passing encoding to fs.writeFile.
    await fs.writeFile(fullPath, normalized /* , options.encoding || "utf8" */);
    if (options.useDetails) {
      const stats = await fs.stat(fullPath);
      return {
        filename,
        path: fullPath,
        size: stats.size,
        strategy: "node",
        timestamp: Date.now(),
        mimeType: guessMimeType(filename),
      };
    }
    return void 0;
  } catch (e) {
    throw new UniversalFsError(formatFsErrorMessage(e, "node", "write"), {
      ...writeErrParams,
      cause: e,
    });
  }
}
/**
 * Checks whether a file or directory exists at the given path.
 *
 * This is a modern and Promise-based alternative to the deprecated `fs.exists()` API,
 * using `fs.access()` with `constants.F_OK`.
 *
 * - Does **not** throw if the path does not exist.
 * - Use in both sync/async-safe code paths.
 *
 * @param {string} path - The filesystem path to check.
 * @returns `true` if the path exists, otherwise `false`.
 */
async function exists(path) {
  try {
    await fs.access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}
/**
 * Converts raw Buffer data into the desired type based on the `format` option.
 *
 * NOTE: Only for node (because the type to be converted is different)
 *
 * - `"text"` → returns string (default, uses encoding or UTF-8)
 * - `"json"` → parses as JSON and returns an object or array
 * - `"binary"` → returns Node.js Buffer (Uint8Array)
 * - `"arrayBuffer"` → returns ArrayBuffer (safe slice of underlying memory)
 * - `"blob"` → returns Blob (Node.js >=15, fallback to Buffer if not available)
 *
 * @template T - Expected return type inferred from the format.
 * @param {Buffer} rawData - Raw file data as a Node.js Buffer.
 * @param {TUFSOptions} options - Universal FS options, must include a `format` field.
 * @param {string} filepath - Original file path (used for guessing format if not provided).
 * @returns {T} Processed data in the requested format.
 * @throws {Error} If the format is unknown or JSON parsing fails.
 */
function convertFromBuffer(rawData, options, filepath) {
  const format = decideFormat(options);
  switch (format) {
    case "text": /* falls through */
    case "json":
      const text = rawData.toString(options.encoding || "utf8");
      if (format === "text") return text;
      // T = Record<string, unknown> | unknown[] | object
      return convertToJSON(text);
    case "binary":
      // T = Uint8Array
      return rawData;
    case "arrayBuffer":
      // T = ArrayBuffer
      return rawData.buffer.slice(
        rawData.byteOffset,
        rawData.byteOffset + rawData.byteLength,
      );
    case "blob":
      // T = Blob | Buffer(fallback)
      return convertToBlob(rawData, guessMimeType(filepath));
  }
}
/**
 * Normalize data for Node.js write operation.
 *
 * - Returns `Uint8Array` for all binary-like inputs.
 * - Respects `encoding` for text data and Blob text mode.
 *
 * @param {BlobPart} data - Data to normalize for writing.
 * @param {TUFSOptions} [options] - Universal FS options (affects encoding).
 * @returns {Promise<Uint8Array>} Normalized data as `Uint8Array`.
 * @throws {UniversalFsError} when data type is unsupported.
 * @todo Future: Add support for multi-byte encodings (Shift_JIS, EUC-JP, etc.) via iconv-lite or Web TextDecoder API.
 */
async function normalizeWriteData(data, options) {
  // 1. Uint8Array or Buffer (Node.js Buffer is Uint8Array subclass)
  if (data instanceof Uint8Array) {
    return data;
  }
  const encoding = options?.encoding || "utf8";
  // 2. String → Encode using specified encoding
  if (typeof data === "string") {
    return Buffer.from(data, encoding);
  }
  // 3. ArrayBuffer → Wrap in Uint8Array
  if (data instanceof ArrayBuffer) {
    return new Uint8Array(data);
  }
  // 4. Blob → Handle text or binary based on encoding
  if (data instanceof Blob) {
    if (encoding !== "binary") {
      // `encoding` is probably the text type. Interpret Blob as text and encode
      // NOTE: Blob.text() always decodes as UTF-8. If original encoding was different,
      // data will be corrupted. encoding param applies only to re-encode the UTF-8 text.
      // **Blob.text() always returns a UTF-8 decoded string (as per the spec)**
      const text = await data.text();
      return Buffer.from(text, encoding);
    }
    // encoding is binary or not
    const ab = await data.arrayBuffer();
    return new Uint8Array(ab);
  }
  // 5. TypedArray (other than Uint8Array) or DataView
  if (ArrayBuffer.isView(data)) {
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  }
  throw new UniversalFsError(
    `Unsupported data type: ${Object.prototype.toString.call(data)}. Expected string, Uint8Array, ArrayBuffer, Buffer, or Blob.`,
    writeErrParams,
  );
}
