import type { TUFSResult, TUFSOptions, IInternalFs } from "./types.ts";
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
export declare const readFile: IInternalFs["readFile"];
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
export declare function writeFile<
  Opt extends TUFSOptions,
  R extends Opt extends {
    useDetails: true;
  }
    ? TUFSResult
    : void,
>(filename: string, data: BlobPart, options?: Opt): Promise<R>;
