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
export class UniversalFsError extends Error {
  /**
   * Creates a new UniversalFsError instance.
   *
   * @param message - The error message describing what went wrong
   * @param params - Optional structured parameters providing error context
   */
  constructor(message, params) {
    super(message);
    this.name = "UniversalFsError";
    if (params) {
      Object.assign(this, params);
    }
  }
}