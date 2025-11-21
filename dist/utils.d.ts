/*!
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  Copyright (C) 2025 jeffy-g <hirotom1107@gmail.com>
//  Released under the MIT license
//  https://opensource.org/licenses/mit-license.php
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
/**
 * @file universal-fs/src/utils.ts
 */
import type {
  IInternalFs,
  TUFSData,
  TMimeType,
  TUFSFormat,
  TUFSOptions,
} from "./types.ts";
/**
 * @import {
 *  IInternalFs,
 *  TMimeType,
 *  TUFSFormat,
 *  TUFSOptions,
 * } from "./types.d.ts";
 *
 * @import {
 *  IUniversalFsErrorParams,
 * } from "./utils.d.ts"
 */
export declare function extname(path: string): string;
export declare function basename(path: string, extToStrip?: string): string;
export declare function dirname(filePath: string): string;
export declare function handleBlob(
  subject: Blob | File,
  format: TUFSFormat,
): Promise<{
  url: string;
  size: number;
  buffer: ArrayBuffer;
  mimeType: `${string}/${string}`;
  actualFilename: string;
  convertedData: TUFSData;
}>;
/**
 * @param {IUniversalFsErrorParams["strategy"]} strategy
 * @param {IInternalFs["readFile"]} readFileLocal
 * @returns {IInternalFs["readFile"]}
 */
export declare function emitReadFileFunction(
  strategy: IUniversalFsErrorParams["strategy"],
  readFileLocal?: IInternalFs["readFile"],
): IInternalFs["readFile"];
/**
 * ```
 * `Unsupported input type`
 * ```
 */
export declare const MSG_UNSUPPORTED_INPUT = "Unsupported input type";
/**
 * Validates whether the given format string is a supported file format.
 *
 * If the format is valid, the function returns `true` and refines the type to `TUFSFormat`.
 * If invalid, it throws a `TypeError` with a descriptive error message listing all supported formats.
 *
 * @param format - The file format to validate (e.g. "text", "json", etc).
 * @returns `true` if the format is valid (and type-guarded as `TUFSFormat`)
 * @throws {TypeError} If the format is not supported.
 *
 * @example
 * ```ts
 * if (isValidFormat(format)) {
 *   // format is now of type TUFSFormat
 *   readFile("data.txt", { format });
 * }
 * ```
 */
export declare const isValidFormat: (format: string) => format is TUFSFormat;
/**
 * Decides the format based on the options provided.
 *
 * + If the `options.format` is not specified, it defaults to "text".
 *
 * @param {TUFSOptions} options - UniversalFs options object.
 * @returns {TUFSFormat | never} The format string, guaranteed to be a valid `TUFSFormat`.
 * @throws {Error} If the format is not valid.
 */
export declare function decideFormat(options: TUFSOptions): TUFSFormat | never;
/**
 * Parameters interface for UniversalFsError constructor.
 * Provides structured error context information for universal file system operations.
 */
export interface IUniversalFsErrorParams {
  /** The underlying cause of the error (original error object, exception, etc.) */
  cause?: unknown;
  /** The execution strategy/environment where the error occurred */
  strategy?: "node" | "browser";
  /** The type of file operation that failed */
  operation?: "read" | "write" | "both";
  /** The filename or path associated with the failed operation */
  filename?: string;
}
/**
 * Custom error class for universal file system operations.
 *
 * Provides enhanced error information including execution context,
 * operation type, and underlying cause for better debugging and error handling.
 *
 * @example
 * // Basic usage
 * throw new UniversalFsError("File not found");
 *
 * // With detailed context
 * throw new UniversalFsError("Permission denied", {
 *   cause: originalError,
 *   strategy: "node",
 *   operation: "read",
 *   filename: "/path/to/file.txt"
 * });
 *
 * // Using helper function
 * const params = createErrorParameters(err, "browser", "write", "config.json");
 * throw new UniversalFsError("Write failed", params);
 */
export declare class UniversalFsError extends Error {
  /** The underlying cause of the error */
  readonly cause?: unknown;
  /** The execution strategy/environment where the error occurred */
  readonly strategy?: IUniversalFsErrorParams["strategy"];
  /** The type of file operation that failed */
  readonly operation?: IUniversalFsErrorParams["operation"];
  /** The filename or path associated with the failed operation */
  readonly filename?: string;
  /**
   * Creates a new UniversalFsError instance.
   *
   * @param message - The error message describing what went wrong
   * @param params - Optional structured parameters providing error context
   */
  constructor(message: string, params?: IUniversalFsErrorParams);
}
/**
 * Helper function to create error parameters object with type safety.
 *
 * Provides a convenient way to construct `IUniversalFsErrorParams` objects
 * with proper type checking and intellisense support.
 *
 * @param cause - The underlying cause of the error
 * @param strategy - The execution strategy/environment where the error occurred
 * @param operation - The type of file operation that failed
 * @param filename - The filename or path associated with the failed operation
 * @returns A properly typed error parameters object
 *
 * @example
 * const params = createErrorParameters(originalError, "node", "read", "config.json");
 * throw new UniversalFsError("Failed to read configuration", params);
 */
export declare const createErrorParameters: (
  cause?: unknown,
  strategy?: IUniversalFsErrorParams["strategy"],
  operation?: IUniversalFsErrorParams["operation"],
  filename?: string,
) => {
  cause: unknown;
  strategy: "node" | "browser" | undefined;
  operation: "read" | "write" | "both" | undefined;
  filename: string | undefined;
};
/**
 * Formats a standardized error message for file system operations.
 *
 * Creates consistent error messages across different environments and operations,
 * extracting meaningful information from various error types.
 *
 * @param e - The error or exception to format (can be Error instance or any value)
 * @param strategy - The execution strategy/environment where the error occurred
 * @param operation - The type of file operation that failed
 * @returns A formatted error message string
 *
 * @example
 * // Format Node.js file read error
 * const message = formatFsErrorMessage(fsError, "node", "read");
 * // Result: "Failed to read file in Node.js: ENOENT: no such file or directory"
 *
 * // Format browser fetch error
 * const message = formatFsErrorMessage(fetchError, "browser", "write");
 * // Result: "Failed to write file in Browser: Network request failed"
 *
 * // Handle unknown error types
 * const message = formatFsErrorMessage("Something went wrong", "node", "both");
 * // Result: "Failed to both file in Node.js: Something went wrong"
 */
export declare const formatFsErrorMessage: (
  e: unknown,
  strategy: IUniversalFsErrorParams["strategy"],
  operation: IUniversalFsErrorParams["operation"],
) => string;
/**
 * Utility function to guess MIME type from file name.
 *
 * Gets the extension with `path.extname()`, and returns the MIME type from `MIME_TYPES` based on it.
 * Returns `"application/octet-stream"` if the extension is not supported.
 *
 * @param filename - File name including extension
 * @returns Guessed MIME type (`"application/octet-stream"` if not known)
 */
export declare function guessMimeType(filename: string): TMimeType;
/**
 * Converts a Buffer to a Blob object if supported, otherwise returns the original Buffer.
 *
 * @param {Buffer} rawData - The raw binary data to convert.
 * @param {TMimeType} mimeType - The MIME type to assign to the Blob.
 * @returns {Blob | Buffer} The resulting Blob if supported, or the original Buffer as a fallback.
 */
export declare function convertToBlob(
  rawData: Buffer,
  mimeType: TMimeType,
): Blob | Buffer;
/**
 * Safely parses a JSON string into a strongly-typed object.
 *
 * @template T - The expected type of the parsed JSON object.
 * @param {string} jsonString - The JSON string to parse.
 * @returns {T} The parsed object with type `T`.
 * @throws {Error} If the input string is not valid JSON, an error is thrown with details.
 */
export declare function convertToJSON<T>(jsonString: string): T;
/**
 * Sanitizes a filename by removing dangerous characters and limiting its length.
 * Intended primarily for use in browser environments.
 *
 * Note: As of Chrome latest (2025-07-27), browsers (including Chrome) automatically sanitize
 * filenames containing unsafe characters (such as "/") when downloading files.
 * Additional sanitization provided by this function ensures cross-browser compatibility and
 * more consistent behavior across environments.
 *
 * @param {string} filename - The input filename to sanitize.
 * @returns {string} The sanitized filename, with unsafe characters replaced and length capped at 255.
 */
export declare function sanitizeFilename(filename: string): string;
