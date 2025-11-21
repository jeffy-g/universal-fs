/*!
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  Copyright (C) 2025 jeffy-g <hirotom1107@gmail.com>
//  Released under the MIT license
//  https://opensource.org/licenses/mit-license.php
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
/**
 * @file universal-fs/src/env.ts
 */
import { isNode, isBrowser } from "./types.js";
/**
 * 🎛️ Environment‑aware selector for feature flags and runtime switches.
 *
 * This helper bridges **Node.js** and **browser** environments with a single API:
 *
 * - **Node.js**: reads from `process.env[key]`
 * - **Browser**: reads from `globalThis[key]` (e.g. `window.LME_EXPORT_LIST`)
 * - **Other**: falls back to `undefined`
 *
 * The resolved value is passed to your callback, so you can:
 * - Interpret **string flags** (`"1"`, `"true"`, `"on"`, …)
 * - Provide **defaults** when the key is missing
 * - Keep all branching logic **type‑safe** and localized
 *
 * @template {string} T
 *   A specific string literal type to allow type‑safe branching
 *   (for example `"1" | "0"` or `"on" | "off"`).
 * @template R
 *
 * @param {string} key
 *   Environment key to read.
 *   - Node.js: `process.env[key]`
 *   - Browser: `globalThis[key]`
 * @param {(select?: T) => R} cb
 *   Callback that receives the selected value and returns the final result.
 *
 * @returns {R}
 *   Whatever your callback returns (fully inferred).
 *
 * @example
 * // Toggle a feature flag in Node.js / Browser:
 * const enabled = selectFromEnv("FEATURE_EXPORT", (flag) => {
 *   return flag === "1";
 * });
 *
 * @example
 * // Use relaxed truthy string handling:
 * const shouldInspect = selectFromEnv("DISABLE_LME_INSPECT", (flag) => {
 *   const normalized = (flag ?? "").toLowerCase();
 *   return normalized === "" || normalized === "0" || normalized === "false"
 *     ? true  // inspection enabled
 *     : false; // disabled by env
 * });
 */
export const selectFromEnv = (key, cb) => {
  /** @type {T | undefined} */
  let selected;
  if (isNode) {
    selected = /** @type {typeof selected} */ (process.env[key]);
  } else if (isBrowser) {
    selected = /** @type {any} */ (globalThis)[key];
  }
  return cb(selected);
};