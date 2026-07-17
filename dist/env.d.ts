/// <reference types="node" preserve="true" />
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
export declare const selectFromEnv: <T extends string, R>(
  key: string,
  cb: (select?: T) => R,
) => R;
/**
 * Dynamically loads an ESM module using an environment-appropriate specifier.
 *
 * This helper is intended for projects that share module-loading code between
 * Node.js and browser or worker runtimes:
 *
 * - **Node.js** imports `modId` unchanged, resolving installed packages,
 *   built-in modules, and other specifiers supported by Node.js.
 * - **Non-Node runtimes** load the package as ESM from jsDelivr using
 *   `https://cdn.jsdelivr.net/npm/<modId>[@version]/+esm`.
 *
 * Module loading and caching are delegated to the runtime's native `import()`.
 * This is a convenience loader, not a general-purpose package resolver;
 * callers should prepare specialized package subpaths or URLs themselves.
 *
 * @example
 * // Node.js: imports the locally installed package.
 * // Browser/worker: imports fflate@0.8.2 from jsDelivr.
 * const fflate = await loadModule<typeof import("fflate")>("fflate", "0.8.2");
 *
 * @template GR Module namespace type expected by the caller. This type is not
 * validated at runtime.
 * @param {string} modId Package or module specifier. It is passed directly to
 * `import()` in Node.js and treated as a jsDelivr npm package identifier in
 * non-Node runtimes.
 * @param {string=} version Optional package version for the jsDelivr URL.
 * This value is ignored in Node.js. Omit it when `modId` already contains the
 * required version or package subpath.
 * @returns {Promise<GR>} The imported ESM module namespace.
 * @experimental 2026/07/18 04:39:42
 */
export declare const loadModule: <GR extends unknown>(
  modId: string,
  version?: string,
) => Promise<GR>;
