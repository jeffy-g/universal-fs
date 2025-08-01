/*!
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  Copyright (C) 2025 jeffy-g <hirotom1107@gmail.com>
//  Released under the MIT license
//  https://opensource.org/licenses/mit-license.php
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
/**
 * @file flagments/ufs-sample.ts
 * @command tsx flagments/ufs-sample.ts
 */
import { ufs } from "@jeffy-g/universal-fs";
import type {
  IInternalFs,
  IUFSFormatMap,
  TUFSOptions,
  TUFSData,
  TUFSOptNoFormat,
  TUFSResult,
  TUFSFormat,
  TUFSInputType,
} from "@jeffy-g/universal-fs";
// https://cdn.jsdelivr.net/npm/@jeffy-g/universal-fs/+esm
// https://cdn.jsdelivr.net/npm/@jeffy-g/universal-fs/dist/index.js

// Write text file
await ufs.writeText("./tmp/hello.txt", "Hello, World!");
// Read JSON file
// config0: TUFSResult<object | Record<string, unknown> | unknown[]> 🆗️  意図した結果
const config0 = await ufs.readJSON("package.json", { useDetails: true });
// config1: { name: string; } 🆗️　TUFSResult<{ name: string; }>
const config1: TUFSResult<{ name: string }> = await ufs.readJSON("package.json", { useDetails: true });
console.log(config1.data.name);

// Read as text (default)
const readme = await ufs.readText("README.md", { useDetails: true });
console.log(readme.data.slice(0, 500));

// Read binary data
const image = await ufs.readBuffer("npm-universal-fs.png", { useDetails: true });
console.log(image.data.slice(0, 50));

// type inference ready!
// string
const ret0 = await ufs.readFile("package.json", { format: "text" });
// Record<string, unknown> | unknown[]
const ret1: { name: string } = await ufs.readFile("package.json", { format: "json" });
const ret12 = await ufs.readFile("package.json", { format: "json", useDetails: true });
// Blob
const ret2 = await ufs.readFile("package.json", { format: "blob" });
// Uint8Array<ArrayBufferLike>
const ret3 = await ufs.readFile("package.json", { format: "binary" });
// ArrayBuffer
const ret4 = await ufs.readFile("package.json", { format: "arrayBuffer", useDetails: true });
// string
const ok = await ufs.readFile("package.json");

// Record<string, unknown> | unknown[]
const json = await ufs.readJSON("package.json");
// { name: string }
const namedJson1 = await ufs.readJSON<{ name: string }>("package.json");
const namedJson2: TUFSResult<{ name: string }> = await ufs.readJSON("package.json", { useDetails: true });

const aa: IInternalFs = {} as IInternalFs;
const read = await aa.readFile("", { format: "arrayBuffer", useDetails: true });
const write = await aa.writeFile("", "TEST", { format: "arrayBuffer" });
const write2 = await aa.writeFile("", "TEST", { format: "arrayBuffer", useDetails: true });

await ufs.writeText("tmp/data.txt", "buffer", {});
await ufs.writeText("tmp/data.txt", "buffer", { useDetails: true });
const buffer = new Uint8Array([72, 101, 108, 108, 111]);
await ufs.writeBuffer("tmp/data.bin", buffer, {});
await ufs.writeBuffer("tmp/data2.bin", buffer.buffer, { useDetails: true });

// type TUFSInferBaseType<
//   T,
//   O extends TUFSOptions
// > = [T] extends [undefined]
//   ? (O["format"] extends keyof IUFSFormatMap
//       ? IUFSFormatMap[O["format"]]
//       : string)
//   : T;

// type TUFSInferReturn<
//   T,
//   O extends TUFSOptions
// > = O extends { useDetails: true }
//   ? TUFSResult<TUFSInferBaseType<T, O>>
//   : TUFSInferBaseType<T, O>;

// type TUFSReadFile = <
//   T = undefined,
//   O extends TUFSOptions = TUFSOptions
// >(
//   filename: string,
//   options?: O
// ) => Promise<TUFSInferReturn<T, O>>;


// declare const readFile: TUFSReadFile;

// await readFile(""); // Promise<string>
// await readFile("", { useDetails: true }); // Promise<TUFSResult<string>>

// await readFile("", { format: "text" }); // Promise<string>
// await readFile("", { format: "json" }); // Promise<Record<string, unknown> | unknown[] | object>
// await readFile("", { format: "blob" }); // Promise<Blob>
// await readFile("", { format: "binary" }); // Promise<Uint8Array<ArrayBufferLike>>
// await readFile("", { format: "arrayBuffer" }); // Promise<ArrayBuffer>
// await readFile<{ name: string }>("", { format: "arrayBuffer" }); // Promise<{ name: string }>
// await readFile("", { format: "text", useDetails: true }); // Promise<TUFSResult<string>>
// await readFile<{ name: string }>("", { useDetails: true });
// 汎用型: options と明示型 T から最終的なデータ型を導く

type TUFSOptionsZ = { format: TUFSFormat; useDetails?: true };
type TUFSDataUndef = TUFSData// | undefined;

// useDetails オプションによって返却型を切り替える
type FixResultType<
  T extends TUFSData,
  O extends TUFSOptions,
// Type extends InferBaseType<T, O> = InferBaseType<T, O>
> = O extends { useDetails: true } ? TUFSResult<InferBaseType<T, O>> : InferBaseType<T, O>;


//  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                      WIP: 2025/7/30 1:49:53
//  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
type PickUFSDataType<Opt extends TUFSOptions | undefined> =
  [Opt] extends [undefined]
    ? "undefined"
    : Opt extends { format: keyof IUFSFormatMap }
      ? IUFSFormatMap[Opt["format"]]
      : never;

type InferBaseType<
  Type extends TUFSData | undefined,
  Opt extends TUFSOptions | undefined = undefined,
  Cache = PickUFSDataType<Opt>
> = [Type] extends [undefined] // T extends void でも挙動は同じようだが・・・?
  ? Cache
    : Type extends Cache
      ? Extract<Type, Cache>
    : undefined;

export type TUFSReadFileFunction<In extends TUFSInputType = string> = <
  Type extends TUFSData | undefined = undefined,
  Opt extends TUFSOptions | undefined = TUFSOptions,
>(filename: In, options?: Opt) => Promise<
  Opt extends { useDetails: true }
  ? TUFSResult<InferBaseType<Type, Opt>>
  : InferBaseType<Type, Opt>
>;
declare const readFile: TUFSReadFileFunction;

const a0 = readFile("", { format: "text" }); //  ✅ const a0: Promise<string>
const a1 = readFile("", { format: "json" }); //  ✅ const a1: Promise<object | Record<string, unknown> | unknown[]>
const a2 = readFile("", { format: "blob" }); //  ✅ const a2: Promise<Blob>
const a3 = readFile("", { format: "binary" }); //  ✅ const a3: Promise<Uint8Array<ArrayBufferLike>>
const r0 = readFile("", { format: "arrayBuffer" }); //  ✅ const r0: Promise<ArrayBuffer>
const r1 = readFile("", { format: "arrayBuffer", useDetails: true }); //  ✅ const r1: Promise<TUFSResult<ArrayBuffer>>

const r2 = readFile<ArrayBuffer>("", { format: "arrayBuffer" }); // ❌ const r2: Promise<undefined>
const r3 = readFile<ArrayBuffer>("", { format: "arrayBuffer", useDetails: true }); // ❌ const r3: Promise<undefined>
const r4 = readFile<string>("", { format: "arrayBuffer" }); // ✅ const r4: Promise<undefined>
const r5 = readFile<string>("", { format: "arrayBuffer", useDetails: true }); // ✅ const r5: Promise<undefined>
type Debug0 = InferBaseType<undefined, { format: "arrayBuffer" }>; // ✅ ArrayBuffer
type Debug1 = InferBaseType<ArrayBuffer, { format: "arrayBuffer" }>; // ✅ ArrayBuffer
type Debug2 = InferBaseType<string>;
type Debug3 = InferBaseType<string, { useDetails: true }>;
type Debug4 = InferBaseType<string, { format: "text" }>;
type Debug5 = InferBaseType<string, { format: "arrayBuffer" }>;
//  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


await readFile(""); // Promise<string>
await readFile("", { useDetails: true }); // Promise<TUFSResult<string>>
const resultx = await readFile('data.json', {
  format: 'json',
  useDetails: true
});
// バイナリとして読み込み
const binary = await readFile('image.png', { format: 'binary' });
const ab = await readFile<ArrayBuffer>("", { format: "arrayBuffer" });
const ab2 = await readFile<ArrayBuffer>("", { format: "arrayBuffer", useDetails: true });
// これも通ってしまう？
const wrong = await readFile<string>("", { format: "arrayBuffer" });

await readFile("", { format: "text" }); // Promise<string>
await readFile("", { format: "json" }); // Promise<Record<string, unknown> | unknown[] | object>
await readFile("", { format: "blob" }); // Promise<Blob>
await readFile("", { format: "binary" }); // Promise<Uint8Array<ArrayBufferLike>>
await readFile("", { format: "arrayBuffer" }); // Promise<ArrayBuffer>
await readFile("", { format: "text", useDetails: true }); // Promise<TUFSResult<string>>
await readFile<{ name: string }>("", { useDetails: true });

declare function readJSON<
  T extends IUFSFormatMap["json"],
  Opt extends TUFSOptNoFormat = TUFSOptNoFormat,
// Ret = Opt extends { useDetails: true } ? TUFSResult<T>: T
>(
  filename: string, options?: Opt
): Promise<
  Opt extends { useDetails: true } ? TUFSResult<T> : T
// InferResultType<T, Opt>
>;

const a: { name: string } = await readJSON(""); // Promise< object | Record<string, unknown> | unknown[] >
const b = await readJSON("", { useDetails: true }); // Promise< TUFSResult<object | unknown[] | Record<string, unknown>> >
const c = await readJSON<{ name: string }>("", { useDetails: true });

if (1) {
  type TAppConfig = {
    apiUrl: string;
    features: string[];
    debug: boolean;
  };
  interface IAppConfig {
    apiUrl: string;
    features: string[];
    debug: boolean;
  }
// Read configuration with type safety
const c = await ufs.readJSON<TAppConfig>("app-config.json");

  const config: TUFSResult<TAppConfig> = await readJSON("app-config.json", { encoding: "binary", useDetails: true });
  const { data: b } = await readJSON<TUFSResult<TAppConfig>>("app-config.json", { useDetails: true });
  // Read configuration
  const { data: appConfig } = await ufs.readJSON<TUFSResult<IAppConfig>>("app-config.json", { useDetails: true });
  const { data: appConfig2 } = await ufs.readJSON<TUFSResult<TAppConfig>>("app-config.json", { useDetails: true });

  const obj: IUFSFormatMap["json"] = { foo: "bar" }; // OK
  const arr: IUFSFormatMap["json"] = ["a", "b"]; // OK
  // @ts-expect-error ts(2322)
  const num: IUFSFormatMap["json"] = 123; // ❌ エラー ts(2322)
  // @ts-expect-error ts(2322)
  const str: IUFSFormatMap["json"] = "text"; // ❌ エラー ts(2322)
  const date: IUFSFormatMap["json"] = new Date(); // object のせいで許容されるが、放置でおｋ ┐(´д｀)┌
}
