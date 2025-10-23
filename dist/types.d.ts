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
export declare const isNode: boolean;
/**
 * Detects whether the current environment is a browser.
 */
export declare const isBrowser: boolean;
export declare const isWorker: boolean;
/**
 * Represents a standard MIME type as a string literal.
 * E.g., "application/json", "text/plain"
 */
export type TMimeType = `${string}/${string}`;
/**
 * @date 2025/7/27 7:08:18
 */
export type TUFSInputType = string | File | Blob;
export type TUFSJsonType = Record<string, unknown> | unknown[] | object;
/**
 * Format-keyed mapping to the corresponding TypeScript type for file data.
 */
export interface IUFSFormatMap {
  text: string;
  json: TUFSJsonType;
  arrayBuffer: ArrayBuffer;
  blob: Blob;
  binary: Uint8Array;
}
/**
 * ```ts
 * "text" | "json" | "arrayBuffer" | "blob" | "binary"
 * ```
 */
export type TUFSFormat = keyof IUFSFormatMap;
/**
 * Supported data types for universal file operations.
 */
export type TUFSData = IUFSFormatMap[keyof IUFSFormatMap];
/**
 * Options used for both reading and writing files universally.
 */
export type TUFSOptions = {
  /**
   * Character encoding used for reading and writing operations.
   * - Reading: Specifies the encoding used when reading text files.
   *   If omitted, the default encoding is `utf8`.
   * - Writing: (WIP) To be documented.
   */
  encoding?: BufferEncoding;
  /** Format used when reading (ignored on write). */
  format?: TUFSFormat;
  useDetails?: true;
};
export type TUFSOptNoFormat = Omit<TUFSOptions, "format">;
/** Adds `data` only if T is not undefined */
type WithData<T extends UWrap<TUFSData>> = [T] extends [undefined]
  ? {}
  : {
      data: T;
    };
/**
 * Generic result type for universal file operations.
 * @template T - Optional data returned when reading.
 */
export type TUFSResult<T extends UWrap<TUFSData> = undefined> = {
  filename: string;
  size: number;
  strategy: "node" | "browser";
  timestamp: number;
  path?: string;
  url?: string;
  mimeType?: TMimeType;
} & WithData<T>;
export type TUFSEnvironment = "node" | "browser" | "unknown";
export type UWrap<T> = T | undefined;
export type PickUFSDataType<Opt extends UWrap<TUFSOptions>> = [Opt] extends [
  undefined,
]
  ? TUFSData
  : Opt extends {
        format: keyof IUFSFormatMap;
      }
    ? IUFSFormatMap[Opt["format"]]
    : TUFSData;
/**
 * Improved type inference for universal file operations.
 * - If Type is undefined, use PickUFSDataType<Opt>.
 * - If Type matches PickUFSDataType<Opt>, use it.
 * - Otherwise: fallback to TUFSData.
 */
export type InferBaseType<
  Type extends UWrap<TUFSData> = undefined,
  Opt extends UWrap<TUFSOptions> = undefined,
  Cache extends TUFSData = PickUFSDataType<Opt>,
  Fallback = Cache extends TUFSData ? Cache : TUFSData,
> = [Type] extends [undefined]
  ? Fallback
  : Type extends Cache
    ? Type
    : TUFSData;
export type TUFSReadFileSig<
  Type extends UWrap<TUFSData> = string,
  OptBase extends TUFSOptNoFormat = TUFSOptNoFormat,
> = <
  Input extends TUFSInputType = TUFSInputType,
  Opt extends OptBase = OptBase,
  Ret = Opt extends {
    useDetails: true;
  }
    ? TUFSResult<InferBaseType<Type, Opt>>
    : InferBaseType<Type, Opt>,
>(
  filename: Input,
  options?: Opt,
) => Promise<Ret>;
export type TUFSWriteFileSig<T = unknown> = <
  Opt extends TUFSOptions,
  R extends Opt extends {
    useDetails: true;
  }
    ? TUFSResult
    : void,
>(
  filename: string,
  data: T,
  options?: Opt,
) => Promise<R>;
export declare interface IInternalFs {
  exists(pathOrUrl: string): Promise<boolean>;
  /**
   * Reads a file and returns the contents.
   * @param filename - Path or name of the file.
   * @param [options] - Optional settings for format, encoding, etc.
   */
  readFile<
    Type extends UWrap<TUFSData> = undefined,
    Opt extends UWrap<TUFSOptions> = TUFSOptions,
    Ret = Opt extends {
      useDetails: true;
    }
      ? TUFSResult<InferBaseType<Type, Opt>>
      : InferBaseType<Type, Opt>,
  >(
    filename: TUFSInputType,
    options?: Opt,
  ): Promise<Ret>;
  /**
   * Writes data to a file.
   * @param filename - Target filename or path.
   * @param data - Data to be written.
   * @param options - Optional settings like encoding or MIME type.
   */
  writeFile<
    D extends BlobPart,
    Opt extends TUFSOptions,
    Ret extends Opt extends {
      useDetails: true;
    }
      ? TUFSResult
      : void,
  >(
    filename: string,
    data: D,
    options?: Opt,
  ): Promise<Ret>;
}
/**
 * Interface for a universal file system abstraction.
 * Supports both Node.js and browser environments.
 */
export interface IUniversalFs extends IInternalFs {
  version: string;
  env: TUFSEnvironment;
  /**
   * Reads a file as plain text.
   */
  readText: TUFSReadFileSig<string>;
  /**
   * Reads and parses a file as JSON.
   */
  readJSON<
    T extends IUFSFormatMap["json"],
    Opt extends TUFSOptNoFormat = TUFSOptNoFormat,
    Ret = Opt extends {
      useDetails: true;
    }
      ? TUFSResult<T>
      : T,
  >(
    filename: TUFSInputType,
    options?: Opt,
  ): Promise<Ret>;
  /**
   * Reads a file as a Blob object.
   */
  readBlob: TUFSReadFileSig<Blob>;
  /**
   * Reads a file as an ArrayBuffer.
   */
  readBuffer: TUFSReadFileSig<ArrayBuffer>;
  /**
   * Writes a string as plain text to a file.
   */
  writeText: TUFSWriteFileSig<string>;
  /**
   * Serializes and writes a JavaScript object as JSON.
   */
  writeJSON: TUFSWriteFileSig<any>;
  /**
   * Writes a Blob to a file.
   */
  writeBlob: TUFSWriteFileSig<Blob>;
  /**
   * Writes an ArrayBuffer to a file.
   */
  writeBuffer: TUFSWriteFileSig<ArrayBuffer | Uint8Array>;
}
export {};
