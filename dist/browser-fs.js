/*!
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  Copyright (C) 2025 jeffy-g <hirotom1107@gmail.com>
//  Released under the MIT license
//  https://opensource.org/licenses/mit-license.php
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
/**
 * @file universal-fs/src/browser-fs.ts
 */
import {
  UniversalFsError,
  guessMimeType,
  sanitizeFilename,
  formatFsErrorMessage,
  createErrorParameters,
  emitReadFileFunction,
  // decideFormat,
  // convertToJSON,
} from "./utils.js";
/**
 * @import {
 * IInternalFs,
 * TMimeType,
 * TUFSOptions,
 * } from "./types.d.ts"
 */
const writeErrParams = createErrorParameters(void 0, "browser", "write");
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
export const readFile = emitReadFileFunction("browser");
/**
 * Writes a file in the browser by triggering a download.
 *
 * @param filename - The name to give the downloaded file.
 * @param data - The data to be written and downloaded.
 * @param [options] - Write options (e.g., mimeType).
 * @returns Universal file system result.
 * @throws {UniversalFsError} Throws when download triggering fails.
 * @type {IInternalFs["writeFile"]}
 */
export async function writeFile(filename, data, options = {}) {
  try {
    const mimeType = guessMimeType(filename);
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    await triggerDownload(url, sanitizeFilename(filename));
    if (options.useDetails) {
      return {
        filename,
        url,
        size: blob.size,
        strategy: "browser",
        timestamp: Date.now(),
        mimeType,
      };
    }
    return void 0;
  } catch (e) {
    throw new UniversalFsError(formatFsErrorMessage(e, "browser", "write"), {
      ...writeErrParams,
      cause: e,
    });
  }
}
/**
 * Checks whether a file or directory exists at the given URL.
 *
 * This is done by sending a HEAD request to the URL.
 *
 * - Does **not** throw if the URL does not exist.
 * - Use in both sync/async-safe code paths.
 *
 * @param {string} url - The URL to check.
 * @returns `true` if the URL exists (response status 200-299), otherwise `false`.
 */
export async function exists(url) {
  try {
    const response = await fetch(url, { method: "head", mode: "cors" });
    return response.ok;
    // response.text().then(str => console.log(str)); // -> empty result
    // return response.headers.get("content-length") > "0";
  } catch {
    return false;
  }
}
// helper
// const te = new TextDecoder();
// /**
//  * Converts an ArrayBuffer to the specified format based on `options.format`.
//  *
//  * Supported formats:
//  * - `"text"` → UTF-8 decoded string
//  * - `"json"` → Parsed JSON object or array (with error handling)
//  * - `"blob"` → `Blob` with inferred MIME type
//  * - `"binary"` → `Uint8Array`
//  * - `"arrayBuffer"` → `ArrayBuffer`
//  *
//  * @template T - Target data type after conversion.
//  * @param {ArrayBuffer} buffer - Raw binary data to convert.
//  * @param {TMimeType} mimeType - MIME type for Blob creation.
//  * @param {TUFSOptions} options - Options specifying desired format.
//  * @returns {Promise<T>} Converted data in the requested format.
//  * @throws {Error} If the format is unknown or JSON parsing fails.
//  */
// async function convertFromBuffer<T>(
//   buffer: ArrayBuffer,
//   mimeType: TMimeType,
//   options: TUFSOptions
// ): Promise<T> {
//   const format = decideFormat(options);
//   switch (format) {
//     case "text": /* falls through */
//     case "json":
//       const text = te.decode(buffer);
//       if (format === "text") return text as T;
//       return convertToJSON<T>(text);
//     case "blob":
//       return new Blob([buffer], { type: mimeType }) as T;
//     case "binary": /* falls through */
//     case "arrayBuffer":
//       if (format === "arrayBuffer") return buffer as T;
//       return new Uint8Array(buffer) as T;
//   }
// }
/**
 * Triggers download of a Blob by creating and clicking an invisible anchor element.
 *
 * @param {string} url - Blob URL for download target.
 * @param {string} filename - The name for the downloaded file.
 * @returns {Promise<void>} Resolves when download initiated.
 */
async function triggerDownload(url, filename) {
  return new Promise((resolve, reject) => {
    try {
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.style.display = "none";
      // Added timeout function
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error("Download timeout"));
      }, 30000); // 30sec
      const cleanup = () => {
        clearTimeout(timeout);
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        setTimeout(() => URL.revokeObjectURL(url), 100);
      };
      link.addEventListener(
        "click",
        () => {
          cleanup();
          resolve();
        },
        { once: true },
      );
      // Also monitors error events
      link.addEventListener(
        "error",
        (e) => {
          cleanup();
          reject(new Error(`Download failed: ${e.message || "Unknown error"}`));
        },
        { once: true },
      );
      document.body.appendChild(link);
      link.click();
    } catch (e) {
      reject(e);
    }
  });
}
