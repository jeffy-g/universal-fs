/*!
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  Copyright (C) 2025 jeffy-g <hirotom1107@gmail.com>
//  Released under the MIT license
//  https://opensource.org/licenses/mit-license.php
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
/**
 * @file universal-fs/src/index.ts
 */
import { isNode, isBrowser } from "./types.js";
import { UniversalFsError } from "./utils.js";
/**
 * @import {
 *  IUniversalFs,
 *  TUFSData,
 *  TUFSFormat,
 *  TUFSOptions,
 *  TUFSInputType,
 * } from "./types.d.ts"
 */
/**
 * WIP
 */
export const ufs = (() => {
  // Optimize bundle size with lazy loading
  let _fs;
  async function getInternalFs() {
    if (!_fs) {
      // _fs = await import("./browser-fs.js");
      if (isNode) {
        _fs = await import("./node-fs.js");
      } else if (isBrowser) {
        _fs = await import("./browser-fs.js");
      } else {
        throw new UniversalFsError(
          "Unsupported environment: neither Node.js nor browser detected",
        );
      }
    }
    return _fs;
  }
  const _invokeLazyFs = async (method, ...args) => {
    const fs = await getInternalFs();
    //* ctt
    // @ts-expect-error parameter compatibility ts(2349)
    return fs[method](...args);
    /*/
        if (method === "readFile") return fs.readFile(...args as Parameters<IInternalFs["readFile"]>) as T;
        return fs.writeFile(...args as Parameters<IInternalFs["writeFile"]>) as T;
        //*/
  };
  /**
   * Get and Read by `format` type
   */
  const _getNRead = async (filename, format, options = {}) => {
    return _invokeLazyFs("readFile", filename, { ...options, format });
  };
  return /** @satisfies {IUniversalFs} */ ({
    version: "v0.1.1",
    // - - - - - - - -
    //    atomic
    // - - - - - - - -
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
    // TUFSReadFileSigBase
    async readFile(filename, options) {
      return _invokeLazyFs("readFile", filename, options);
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
      // TODO: 2025/7/28 15:40:44 - type inference...
      return _invokeLazyFs("writeFile", filename, data, options);
    },
    // - - - - - - - -
    //      read
    // - - - - - - - -
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
    // readJSON: async (filename: string, options) => {
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
    // - - - - - - - -
    //     write
    // - - - - - - - -
    /**
     * Writes a string as plain text to a file.
     * @param filename Target filename or path.
     * @param text Text to be written.
     * @param [options] Optional settings like encoding or MIME type.
     * @returns Promise of universal file operation result.
     */
    writeText: async (filename, text, options) => {
      return _invokeLazyFs("writeFile", filename, text, options);
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
      return _invokeLazyFs("writeFile", filename, data, options);
    },
    /**
     * Writes a Blob to a file.
     * @param filename Target filename or path.
     * @param blob Blob to be written.
     * @param [options] Optional settings like encoding or MIME type.
     * @returns Promise of universal file operation result.
     */
    writeBlob: async (filename, blob, options) => {
      return _invokeLazyFs("writeFile", filename, blob, options);
    },
    /**
     * Writes an ArrayBuffer to a file.
     * @param Target filename or path.
     * @param buffer Buffer to be written.
     * @param [options] Optional settings like encoding or MIME type.
     * @returns Promise of universal file operation result.
     */
    writeBuffer: async (filename, buffer, options) => {
      return _invokeLazyFs("writeFile", filename, buffer, options);
    },
  });
})();
