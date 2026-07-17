/*!
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  Copyright (C) 2026 jeffy-g <hirotom1107@gmail.com>
//  Released under the MIT license
//  https://opensource.org/licenses/mit-license.php
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
/**
 * @file universal-fs/src/ufs-error.ts
 */
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
