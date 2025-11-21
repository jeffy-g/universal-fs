import type { IUniversalFs } from "./types.ts";
export * from "./types.js";
export type {
  UWrap,
  IInternalFs,
  IUniversalFs,
  TUFSData,
  TMimeType,
  TUFSResult,
  TUFSFormat,
  TUFSOptions,
  TUFSJsonType,
  TUFSInputType,
  IUFSFormatMap,
  TUFSEnvironment,
  TUFSOptNoFormat,
  InferBaseType,
} from "./types.ts";
export { selectFromEnv } from "./env.js";
/**
 * WIP
 */
export declare const ufs: IUniversalFs;
