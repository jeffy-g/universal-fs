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
export function extname(path) {
  const basename = path.split(/[/\\]/).pop() || "";
  const ext = basename.split(".");
  const splitedLen = ext.length;
  return splitedLen > 1 && ext[splitedLen - 2] !== ""
    ? "." + ext[splitedLen - 1]
    : "";
}
export function basename(path, extToStrip) {
  const base = path.split(/[/\\]/).pop() || "";
  if (extToStrip && base.endsWith(extToStrip)) {
    return base.slice(0, -extToStrip.length);
  }
  return base;
}
export function dirname(filePath) {
  if (filePath === "" || filePath === "/") {
    return "/";
  }
  filePath = filePath.replace(/\\/g, "/");
  const noTrailing = filePath.replace(/\/+$/, "");
  const lastSlash = noTrailing.lastIndexOf("/");
  if (lastSlash === -1) {
    return ".";
  }
  if (lastSlash === 0) {
    return "/";
  }
  return noTrailing.slice(0, lastSlash);
}
/** @type {(value?: unknown) => string} */
const toString = {}.toString;
/**
 * Checks if the value is a Blob or File.
 *
 * + This is a type guard that narrows the type to `Blob | File`.
 *
 * @param {unknown} value - The value to check.
 * @returns {value is (Blob | File)} `true` if the value is a Blob or File, otherwise `false`.
 */
const isBlob = (value) => {
  const tag = toString.call(value);
  return tag === "[object Blob]" || tag === "[object File]";
};
export async function handleBlob(subject, format) {
  let url;
  let size;
  let buffer;
  let mimeType;
  let actualFilename;
  let convertedData;
  const blob = subject;
  const isFile = "name" in subject;
  size = blob.size;
  actualFilename = isFile ? subject.name : "anonymous";
  url = `local-${isFile ? "file" : "blob"}://${encodeURIComponent(actualFilename)}`;
  mimeType = blob.type || guessMimeType(actualFilename);
  if (format === "blob") {
    convertedData = blob;
  } else {
    buffer = await blob.arrayBuffer();
  }
  return {
    url,
    size,
    buffer,
    mimeType,
    actualFilename,
    convertedData,
  };
}
async function handleURL(filename) {
  let url;
  let size;
  let buffer;
  let mimeType;
  let actualFilename;
  const response = await fetch(filename);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  buffer = await response.arrayBuffer();
  url = response.url;
  size = buffer.byteLength;
  mimeType = response.headers.get("content-type") || guessMimeType(filename);
  actualFilename = filename.split("/").pop() || filename;
  return {
    url,
    size,
    buffer,
    mimeType,
    actualFilename,
  };
}
/**
 * @param {IUniversalFsErrorParams["strategy"]} strategy
 * @param {IInternalFs["readFile"]} readFileLocal
 * @returns {IInternalFs["readFile"]}
 */
export function emitReadFileFunction(strategy, readFileLocal) {
  async function readFile(filename, options = {}) {
    try {
      let url;
      let size;
      let buffer;
      let mimeType;
      let actualFilename;
      let convertedData;
      if (typeof filename === "string") {
        try {
          ({ url, size, buffer, mimeType, actualFilename } =
            await handleURL(filename));
        } catch (e) {
          if (readFileLocal) {
            try {
              return await readFileLocal(filename, options);
            } catch (e) {
              throw e;
            }
          }
          throw e;
        }
      } else if (isBlob(filename)) {
        ({ url, size, buffer, mimeType, actualFilename, convertedData } =
          await handleBlob(filename, options.format || "text"));
      } else {
        throw new Error(MSG_UNSUPPORTED_INPUT);
      }
      if (buffer && !convertedData) {
        convertedData = await convertFromBuffer(buffer, mimeType, options);
      }
      if (!options.useDetails) return convertedData;
      return {
        url,
        size,
        mimeType,
        strategy,
        timestamp: Date.now(),
        data: convertedData,
        filename: actualFilename,
      };
    } catch (e) {
      throw new UniversalFsError(
        formatFsErrorMessage(e, strategy, "read"),
        createErrorParameters(e, strategy, "read", filename?.toString()),
      );
    }
  }
  return readFile;
}
const te = new TextDecoder();
/**
 * Converts an ArrayBuffer to the specified format based on `options.format`.
 *
 * Supported formats:
 * - `"text"` → UTF-8 decoded string
 * - `"json"` → Parsed JSON object or array (with error handling)
 * - `"blob"` → `Blob` with inferred MIME type
 * - `"binary"` → `Uint8Array`
 * - `"arrayBuffer"` → `ArrayBuffer`
 *
 * @template T - Target data type after conversion.
 * @param {ArrayBuffer} buffer - Raw binary data to convert.
 * @param {TMimeType} mimeType - MIME type for Blob creation.
 * @param {TUFSOptions} options - Options specifying desired format.
 * @returns {Promise<T>} Converted data in the requested format.
 * @throws {Error} If the format is unknown or JSON parsing fails.
 */
async function convertFromBuffer(buffer, mimeType, options) {
  const format = decideFormat(options);
  switch (format) {
    case "text": /* falls through */
    case "json":
      const text = te.decode(buffer);
      if (format === "text") return text;
      return convertToJSON(text);
    case "blob":
      return new Blob([buffer], { type: mimeType });
    case "binary": /* falls through */
    case "arrayBuffer":
      if (format === "arrayBuffer") return buffer;
      return new Uint8Array(buffer);
  }
}
/**
 * Validates the input format string against the supported formats.
 */
const VALID_FORMATS = ["text", "json", "blob", "binary", "arrayBuffer"];
/**
 * ```
 * `Unsupported input type`
 * ```
 */
export const MSG_UNSUPPORTED_INPUT = "Unsupported input type";
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
export const isValidFormat = (format) => {
  if (!VALID_FORMATS.includes(format)) {
    throw new TypeError(
      `[ufs] Unsupported format: "${format}", Supported: ${VALID_FORMATS.join(", ")}`,
    );
  }
  return true;
};
/**
 * Decides the format based on the options provided.
 *
 * + If the `options.format` is not specified, it defaults to "text".
 *
 * @param {TUFSOptions} options - UniversalFs options object.
 * @returns {TUFSFormat | never} The format string, guaranteed to be a valid `TUFSFormat`.
 * @throws {Error} If the format is not valid.
 */
export function decideFormat(options) {
  const format = options.format || "text";
  if (isValidFormat(format)) {
    return format;
  }
  return format;
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
export const createErrorParameters = (cause, strategy, operation, filename) => {
  return { cause, strategy, operation, filename };
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
export const formatFsErrorMessage = (e, strategy, operation) => {
  const env = strategy === "node" ? "Node.js" : "Browser";
  return `Failed to ${operation} file in ${env}: ${e instanceof Error ? e.message : "Unknown error"}`;
};
/**
 * MIME type mapping dictionary.
 * Defines the MIME type inferred from the file extension (with ".").
 *
 * @todo extract extenstion with types from https://github.com/jshttp/mime-db
 */
const MIME_TYPES = {
  ".txt": "text/plain",
  ".json": "application/json",
  ".csv": "text/csv",
  ".md": "text/markdown",
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".ts": "application/typescript",
  ".xml": "application/xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".avi": "video/x-msvideo",
  ".mid": "audio/midi",
  ".midi": "audio/midi",
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".zip": "application/zip",
  ".tar": "application/x-tar",
  ".gz": "application/gzip",
  ".als": "application/gzip",
};
const FILE_EXTENSION_REGEX = /\.[a-zA-Z0-9]+$/;
/**
 * Utility function to guess MIME type from file name.
 *
 * Gets the extension with `path.extname()`, and returns the MIME type from `MIME_TYPES` based on it.
 * Returns `"application/octet-stream"` if the extension is not supported.
 *
 * @param filename - File name including extension
 * @returns Guessed MIME type (`"application/octet-stream"` if not known)
 */
export function guessMimeType(filename) {
  const m = FILE_EXTENSION_REGEX.exec(filename);
  const ext = m ? m[0].toLowerCase() : "";
  return MIME_TYPES[ext] || "application/octet-stream";
}
/**
 * Converts a Buffer to a Blob object if supported, otherwise returns the original Buffer.
 *
 * @param {Buffer} rawData - The raw binary data to convert.
 * @param {TMimeType} mimeType - The MIME type to assign to the Blob.
 * @returns {Blob | Buffer} The resulting Blob if supported, or the original Buffer as a fallback.
 */
export function convertToBlob(rawData, mimeType) {
  try {
    return new Blob([rawData], { type: mimeType });
  } catch (e) {
    console.warn(
      "Blob is not available in this Node.js version, returning Buffer instead",
    );
    return rawData;
  }
}
/**
 * Safely parses a JSON string into a strongly-typed object.
 *
 * @template T - The expected type of the parsed JSON object.
 * @param {string} jsonString - The JSON string to parse.
 * @returns {T} The parsed object with type `T`.
 * @throws {Error} If the input string is not valid JSON, an error is thrown with details.
 */
export function convertToJSON(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    const preview = jsonString.slice(0, 100).replace(/\s+/g, " ");
    throw new Error(
      `Invalid JSON format: ${error instanceof Error ? error.message : "Unknown error"}\n` +
        `Preview: ${preview}${jsonString.length > 100 ? "..." : ""}`,
    );
  }
}
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
export function sanitizeFilename(filename) {
  return filename
    .replace(/[<>:"/\\|?*]/g, "_")
    .replace(/^\.+/, "")
    .slice(0, 255);
}