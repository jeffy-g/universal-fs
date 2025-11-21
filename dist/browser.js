/*!
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  Copyright (C) 2025 jeffy-g <hirotom1107@gmail.com>
//  Released under the MIT license
//  https://opensource.org/licenses/mit-license.php
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
/**
 * @file universal-fs/src/browser.ts
 */
import * as bwfs from "./browser-fs.js";
import { extname, basename, dirname } from "./utils.js";
export { selectFromEnv } from "./env.js";
/**
 * @import {
 *  IUniversalFs,
 *  IInternalFs,
 *  TUFSFormat,
 *  TUFSOptions,
 *  TUFSInputType,
 * } from "./types.d.ts"
 */
/**
 * WIP
 */
export const ufs = (() => {
  /**
   * @type {<T extends unknown>(method: keyof IInternalFs, ...args: unknown[]) => Promise<T>}
   */
  const _invokeFs = async (method, ...args) => {
    // @ts-expect-error parameter compatibility ts(2349)
    return bwfs[method](...args);
  };
  /**
   * Get and Read by `format` type
   * @type {<T extends unknown>(filename: TUFSInputType, format: TUFSFormat, options?: TUFSOptions) => Promise<T>}
   */
  const _getNRead = async (filename, format, options = {}) => {
    return _invokeFs("readFile", filename, { ...options, format });
  };
  return /** @satisfies {IUniversalFs} */ ({
    version: "v0.4.1",
    env: "browser",
    extname,
    basename,
    dirname,
    exists(pathOrUrl) {
      return _invokeFs("exists", pathOrUrl);
    },
    /**
     * Reads a file and returns the contents.
     * @param filename Path or name of the file.
     * @param [options] Optional settings for format, encoding, etc.
     * @returns Promise of universal file operation result.
     * ```ts
     * const result = await ufs.readFile("foo.txt");
     * console.log(result.data);
     * ```
     */
    async readFile(filename, options) {
      return _invokeFs("readFile", filename, options);
    },
    /**
     * Writes data to a file.
     * @param filename Target filename or path.
     * @param data Data to be written.
     * @param [options] Optional settings like encoding or MIME type.
     * @returns Promise of universal file operation result.
     * ```ts
     * await ufs.writeFile("foo.txt", "hello");
     * ```
     */
    async writeFile(filename, data, options) {
      return _invokeFs("writeFile", filename, data, options);
    },
    /**
     * Reads a file as plain text.
     * @param filename Path or name of the file.
     * @param [options] Optional settings for encoding, etc.
     * @returns Promise of universal file operation result.
     */
    readText: async (filename, options) => {
      return _getNRead(filename, "text", options);
    },
    /**
     * Reads and parses a file as JSON.
     *
     * @param filename Path or name of the file.
     * @param [options] Optional settings for encoding, etc.
     * @returns Promise of universal file operation result.
     */
    async readJSON(filename, options) {
      return _getNRead(filename, "json", options);
    },
    /**
     * Reads a file as a Blob object.
     * @param filename Path or name of the file.
     * @param [options] Optional settings for encoding, etc.
     * @returns Promise of universal file operation result.
     */
    readBlob: async (filename, options) => {
      return _getNRead(filename, "blob", options);
    },
    /**
     * Reads a file as an ArrayBuffer.
     * @param filename Path or name of the file.
     * @param [options] Optional settings for encoding, etc.
     * @returns Promise of universal file operation result.
     */
    readBuffer: async (filename, options) => {
      return _getNRead(filename, "arrayBuffer", options);
    },
    /**
     * Writes a string as plain text to a file.
     * @param filename Target filename or path.
     * @param text Text to be written.
     * @param [options] Optional settings like encoding or MIME type.
     * @returns Promise of universal file operation result.
     */
    writeText: async (filename, text, options) => {
      return _invokeFs("writeFile", filename, text, options);
    },
    /**
     * Serializes and writes a JavaScript object as JSON.
     * @param filename Target filename or path.
     * @param data Data to be written (object).
     * @param [options] Optional settings like encoding or MIME type.
     * @returns Promise of universal file operation result.
     */
    writeJSON: async (filename, data, options) => {
      data = JSON.stringify(data, null, 2);
      return _invokeFs("writeFile", filename, data, options);
    },
    /**
     * Writes a Blob to a file.
     * @param filename Target filename or path.
     * @param blob Blob to be written.
     * @param [options] Optional settings like encoding or MIME type.
     * @returns Promise of universal file operation result.
     */
    writeBlob: async (filename, blob, options) => {
      return _invokeFs("writeFile", filename, blob, options);
    },
    /**
     * Writes an ArrayBuffer to a file.
     * @param Target filename or path.
     * @param buffer Buffer to be written.
     * @param [options] Optional settings like encoding or MIME type.
     * @returns Promise of universal file operation result.
     */
    writeBuffer: async (filename, buffer, options) => {
      return _invokeFs("writeFile", filename, buffer, options);
    },
  });
})();