/*!
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  Copyright (C) 2025 jeffy-g <hirotom1107@gmail.com>
//  Released under the MIT license
//  https://opensource.org/licenses/mit-license.php
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
/**
 * @file universal-fs/src/types.ts
 */
/**
 * Detects whether the current environment is Node.js.
 */
export const isNode =
  typeof window === "undefined" &&
  typeof process !== "undefined" &&
  !!process.versions?.node;
/**
 * Detects whether the current environment is a browser.
 */
export const isBrowser = (() => {
  const result =
    typeof window !== "undefined" && typeof document !== "undefined";
  // @ts-ignore `vi` is VitestUtils object
  if (typeof vi !== "undefined") {
    return result;
  }
  return (
    result &&
    !("Deno" in globalThis) &&
    !("Bun" in globalThis) &&
    !globalThis.process?.versions?.node
  );
})();
export const isWorker =
  typeof self !== "undefined" && typeof self.importScripts === "function";