# **@jeffy-g/universal-fs**

> Universal file system utilities for Node.js and Browser environments

[![Node.js CI](https://github.com/jeffy-g/universal-fs/actions/workflows/main.yml/badge.svg)](https://github.com/jeffy-g/universal-fs/actions/workflows/main.yml)
[![npm version](https://img.shields.io/npm/v/@jeffy-g/universal-fs.svg)](https://www.npmjs.com/package/@jeffy-g/universal-fs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

A lightweight, TypeScript-first library that provides consistent file I/O operations across different JavaScript environments. Write once, run everywhere – whether you're building for Node.js servers or browser applications.

> ## ✨ Features

- 🌍 **Universal**: Works seamlessly in Node.js and browser environments
- 📝 **Type-safe**: Full TypeScript support with comprehensive type definitions and advanced type inference
- 🔄 **Format-aware**: Converts input based on the explicitly specified format (`text`, `json`, `binary`, `blob`, `arrayBuffer`). No automatic detection is performed.
- 📁 **Smart**: Auto-creates directories in Node.js, triggers downloads in browsers
- 🎯 **Consistent**: Same API across all supported environments
- 🚀 **Modern**: Built with ESM-first approach using native APIs
- 🔗 **Flexible Input**: Supports URLs, File objects, and Blob objects in browsers
- ⚡ **Lazy Loading**: Optimized bundle size with environment-specific lazy loading

> ## 🚀 Quick Start

```bash
npm install @jeffy-g/universal-fs
```

### `ufs` is the main entry point implementing the universal-fs API (`IUniversalFs`).
All file operations (`readFile`, `writeFile`, etc.) are accessible via this object.


```ts
import { ufs } from "@jeffy-g/universal-fs";

// Write text file
await ufs.writeText("hello.txt", "Hello, World!");

// Read JSON file with type safety
const config = await ufs.readJSON<{ name: string; version: string }>("config.json");
console.log(config.name); // Type-safe access

// Read with detailed metadata
const result = await ufs.readText("hello.txt", { useDetails: true });
console.log(result.filename);  // "hello.txt"
console.log(result.size);      // File size in bytes
console.log(result.strategy);  // "node" or "browser"
console.log(result.data);      // File content

// Write binary data
const buffer = new Uint8Array([72, 101, 108, 108, 111]);
// Both Uint8Array and ArrayBuffer are supported
await ufs.writeBuffer("data.bin", buffer);
await ufs.writeBuffer("data2.bin", buffer.buffer);
```

### Browser-specific features

```ts
// Read from File input
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];
const content = await ufs.readText(file);

// Read from Blob
const blob = new Blob(["Hello World"], { type: "text/plain" });
const text = await ufs.readText(blob);

// Read from URL
const data = await ufs.readJSON("https://api.example.com/config.json");
```

### Using in CommonJS

```js
(async () => {
  const { ufs } = await import('@jeffy-g/universal-fs');
  const result = await ufs.readText('hello.txt');
  console.log(result);
})();
```


## 🌐 CDN Usage

<details>

You can load **@jeffy-g/universal-fs** directly via CDN:

> **Note:** When loading via CDN (`<script type="module">`), TypeScript type inference is not available.  
> For full type support, install via npm or bun and use in a TypeScript project.


### ✅ ESM via jsDelivr
```html
<script type="module">
  const mod = await import("https://cdn.jsdelivr.net/npm/@jeffy-g/universal-fs@latest/dist/index.js");
  const { ufs } = mod;
  const result = await ufs.readFile("https://example.com/data.json", { format: "json" });
  console.log(result);
</script>
```

### ✅ Optimized ESM (Recommended)

```html
<script type="module">
  import { ufs } from "https://cdn.jsdelivr.net/npm/@jeffy-g/universal-fs@latest/+esm";
  const result = await ufs.readFile("https://example.com/data.json", { format: "json" });
  console.log(result);
</script>
```

### ✅ With SRI (Subresource Integrity)

```html
<script type="module" integrity="sha384-xxxxxxxx" crossorigin="anonymous">
  import { ufs } from "https://cdn.jsdelivr.net/npm/@jeffy-g/universal-fs@latest/+esm";
</script>
```

To get the `sha384` hash:

```sh
curl -sL "https://cdn.jsdelivr.net/npm/@jeffy-g/universal-fs@0.1.0/+esm" | openssl dgst -sha384 -binary | openssl base64 -A
```

> **Important:** Always use a fixed version when using SRI (e.g., `@0.1.0` instead of `latest`).  
> or use THIS -> https://www.srihash.org/

## 🦕 Deno
You can import via `npm:` specifier or CDN:

```ts
// Using npm:
import { ufs } from "npm:@jeffy-g/universal-fs@0.1.0";
// Using CDN (jsDelivr):
import { ufs } from "https://cdn.jsdelivr.net/npm/@jeffy-g/universal-fs@0.1.0/+esm";
const result = await ufs.readFile("https://example.com/file.json", { format: "json" });
```

---

## 🍞 Bun

Install and use:

```sh
bun add @jeffy-g/universal-fs
```

```ts
import { ufs } from "@jeffy-g/universal-fs";
const result = await ufs.readFile("https://example.com/file.json", { format: "json" });
```

</details>

> ## 🌐 Platform Support

| Environment | Status | Read Support | Write Support | Notes |
|-------------|--------|--------------|---------------|-------|
| **Node.js** | ✅ Full | Local files | File system | Complete filesystem access |
| **Browser** | ✅ Full | URLs, File, Blob | Download trigger | Secure, sandboxed environment |
| **Bun** | ⚠️ Limited | Basic | Basic | Uses Node.js compatibility layer |
| **Deno** | ⚠️ Limited | Basic | Basic | Experimental support |

### Environment-specific Notes:

+ **Node.js**: Full filesystem access with automatic directory creation
+ **Browser**: `read*` supports URLs (via fetch), File objects, and Blob objects; `write*` triggers secure file downloads
+ **Input Types**: 
  - **Node.js**: `string` (file paths)
  - **Browser**: `string` (URLs), `File`, `Blob`

## 📚 API Reference

### Core Methods

<details>

#### `readFile<T>(filename, options?)`
Universal file reader with automatic format detection and advanced type inference.

```ts
// Read as text (default, inferred from no format specified)
const textResult = await ufs.readFile("document.txt");
// Type: string

// Read as JSON with type safety
const jsonResult = await ufs.readFile("config.json", { format: "json" });
// Type: Record<string, unknown> | unknown[] | object

// Explicit type parameter for JSON
const typedResult = await ufs.readFile<{name: string}>("config.json", { format: "json" });
// Type: {name: string}

// Read binary data
const binaryResult = await ufs.readFile("image.png", { format: "arrayBuffer" });
// Type: ArrayBuffer

// Read with detailed metadata
const detailedResult = await ufs.readFile("data.txt", { useDetails: true });
// Type: TUFSResult<string> with filename, size, strategy, etc.

// Browser: Read from File object
const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
const file = fileInput.files![0];
const content = await ufs.readFile(file, { format: "text" });
```

#### `writeFile(filename, data, options?)`
Universal file writer with smart environment handling and download timeout protection.

```ts
// In Node.js: writes to filesystem with automatic directory creation
// In Browser: triggers secure download with 30-second timeout
await ufs.writeFile("output.txt", "Hello World");

// Write with detailed result
const result = await ufs.writeFile("output.txt", "Hello World", { useDetails: true });
console.log(result.size);      // File size
console.log(result.strategy);  // "node" or "browser"
console.log(result.timestamp); // Operation timestamp
```

</details>

### Convenience Methods

<details>

| Method | Input Type | Returns | Description |
|--------|------------|---------|-------------|
| `readText()` | `TUFSInputType` | `string` | Read file as UTF-8 text |
| `readJSON<T>()` | `string` | `T` | Parse JSON with type safety |
| `readBlob()` | `TUFSInputType` | `Blob` | Read as Blob object |
| `readBuffer()` | `TUFSInputType` | `ArrayBuffer` | Read as raw binary data |
| `writeText()` | `string, string` | `void` | Write UTF-8 text |
| `writeJSON()` | `string, any` | `void` | Serialize and write JSON |
| `writeBlob()` | `string, Blob` | `void` | Write Blob data |
| `writeBuffer()` | `string, ArrayBuffer \| Uint8Array` | `void` | Write binary data |

> **Note:**  
> - All read methods support the `useDetails` option to return metadata
> - `TUFSInputType` = `string | File | Blob` (environment-dependent)
> - The `readJSON<T>()` method supports object, array, and custom types
> - All write methods support both simple and detailed return modes

</details>

### Environment Helpers

<details>

#### `selectFromEnv(key, cb)`

Environment-aware helper for reading simple flags across Node.js and browser runtimes.

- **Node.js**: reads from `process.env[key]`
- **Browser**: reads from `globalThis[key]` (e.g. `window.FEATURE_FLAG`)
- **Other environments**: passes `undefined` to the callback

```ts
import { selectFromEnv } from "@jeffy-g/universal-fs";

// ✅ Toggle a feature flag: "1" -> enabled
const featureEnabled = selectFromEnv("FEATURE_EXPORT", (flag?: "1" | "0") => {
  return flag === "1";
});

// ✅ Use Case 2: Explicitly specifying the type
const featureEnabled2 = selectFromEnv<"1" | "0", boolean>(
  "FEATURE_EXPORT",
  (flag) => {
    return flag === "1";
  }
);
// ✅ Use Case 3: More complex return types
const config = selectFromEnv("APP_ENV", (env?: "dev" | "prod" | "test") => {
  return {
    isDev: env === "dev",
    isProd: env === "prod",
    logLevel: env === "prod" ? "error" : "debug"
  };
}); // { isDev: boolean; isProd: boolean; logLevel: string }

// ✅ Use Case 4: Filtering Types
const port = selectFromEnv<`${number}`, number>("PORT", (p) => {
  return p ? parseInt(p, 10) : 3000;
});
```

This keeps environment branching logic localized and type-safe while avoiding direct checks against `ufs.env` in application code.

</details>

### Options & Types

<details>

```ts
/**
 * Input types supported by universal-fs
 */
export type TUFSInputType = string | File | Blob;

/**
 * Format-keyed mapping to the corresponding TypeScript type for file data.
 */
export interface IUFSFormatMap {
  text: string;
  json: Record<string, unknown> | unknown[] | object;
  arrayBuffer: ArrayBuffer;
  blob: Blob;
  binary: Uint8Array; // Node.js Buffer is sub-class of Uint8Array
}

/**
 * Supported format types
 */
export type TUFSFormat = keyof IUFSFormatMap;
// "text" | "json" | "arrayBuffer" | "blob" | "binary"

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
   * Default: "utf8"
   */
  encoding?: BufferEncoding;
  /** Format used when reading (ignored on write). */
  format?: TUFSFormat;
  /** Return detailed metadata including size, strategy, timestamp */
  useDetails?: true;
};

/**
 * Generic result type for universal file operations.
 * @template T - Optional data returned when reading.
 */
export type TUFSResult<T extends TUFSData | undefined = undefined> = {
  filename: string;
  size: number;
  strategy: "node" | "browser";
  timestamp: number;
  path?: string;     // Node.js only
  url?: string;      // Browser only  
  mimeType?: TMimeType; // Inferred MIME type
} & ([T] extends [undefined] ? {} : { data: T });

/**
 * MIME type representation
 */
export type TMimeType = `${string}/${string}`;
```

</details>

> ## 🏗️ Advanced Examples

### Configuration Management

```ts
interface AppConfig {
  apiUrl: string;
  features: string[];
  debug: boolean;
}

// Read configuration with type safety
const config = await ufs.readJSON<AppConfig>("app-config.json");

// Update and save
config.debug = false;
await ufs.writeJSON("app-config.json", config);

// Read with metadata
const configWithMeta = await ufs.readJSON<AppConfig>("app-config.json", { useDetails: true });
console.log(`Config loaded from ${configWithMeta.strategy} environment`);
console.log(`File size: ${configWithMeta.size} bytes`);
```

### Binary Data Processing

```ts
// Read image file
const imageBuffer = await ufs.readBuffer("photo.jpg");

// Process the binary data
const processedData = processImage(imageBuffer);

// Save processed result with metadata
const result = await ufs.writeBuffer("processed-photo.jpg", processedData, { useDetails: true });
console.log(`Processed image saved: ${result.size} bytes`);
```

### Cross-Platform File Utilities

```ts
class FileManager {
  static async backup<T>(filename: string): Promise<void> {
    const original = await ufs.readFile(filename);
    const backupName = `${filename}.backup.${Date.now()}`;
    await ufs.writeFile(backupName, original);
  }
  
  static async migrate(oldPath: string, newPath: string): Promise<void> {
    const content = await ufs.readFile(oldPath);
    await ufs.writeFile(newPath, content);
    // Note: Deletion not supported in browser environment
  }
  
  static async getFileInfo(filename: string) {
    const result = await ufs.readFile(filename, { useDetails: true });
    return {
      name: result.filename,
      size: result.size,
      mimeType: result.mimeType,
      environment: result.strategy
    };
  }
}
```

### Browser File Handling

```ts
// Handle file input changes
document.getElementById('fileInput')?.addEventListener('change', async (e) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (file) {
    try {
      // Read file content
      const content = await ufs.readText(file);
      console.log('File content:', content);
      
      // Get file info
      const info = await ufs.readFile(file, { useDetails: true });
      console.log(`File: ${info.filename}, Size: ${info.size} bytes`);
      
    } catch (error) {
      console.error('Failed to read file:', error);
    }
  }
});

// Process and download modified content
async function processAndDownload(originalFile: File) {
  const content = await ufs.readText(originalFile);
  const processed = content.toUpperCase(); // Example processing
  
  // This will trigger a download in the browser
  await ufs.writeText(`processed_${originalFile.name}`, processed);
}
```

> ## 🔧 Environment Behavior (Node.js 15.7.0+ required for Blob support)

### Node.js Environment
- **Reading**: Direct filesystem access using `fs.promises`
- **Writing**: Creates directories automatically, writes to disk
- **Binary Support**: Full support including `Buffer` and `binary` format
- **Blob Support**: Requires Node.js **v15.7.0 or higher** for the `Blob` API.  
  On older versions, `ufs.readBlob()` and `ufs.writeBlob()` will return a `Buffer` instead of a `Blob`.

### Browser Environment  
- **Reading**: 
  - HTTP(S) URLs via `fetch()` API
  - `File` objects from input elements or drag & drop
  - `Blob` objects created programmatically
- **Writing**: Triggers secure file downloads via Blob URLs with:
  - 30-second timeout protection
  - Automatic cleanup of object URLs
  - Filename sanitization for security
- **Limitations**: No direct filesystem access (security restrictions)

### Error Handling

```ts
import { UniversalFsError } from "@jeffy-g/universal-fs";

try {
  const result = await ufs.readFile("nonexistent.txt");
} catch (error) {
  if (error instanceof UniversalFsError) {
    console.log(`Operation: ${error.operation}`);    // "read" | "write"
    console.log(`Strategy: ${error.strategy}`);      // "node" | "browser"
    console.log(`Filename: ${error.filename}`);      // File that caused error
    console.log(`Original cause:`, error.cause);     // Original error object
  }
}
```

### 🔍 MIME Type Handling

**universal-fs** automatically detects the MIME type from the file extension when performing read/write operations. The library includes comprehensive MIME type mappings:

#### Text Formats
- `.txt` → `text/plain`
- `.json` → `application/json`
- `.html` → `text/html`
- `.css` → `text/css`
- `.js` → `application/javascript`
- `.ts` → `application/typescript`

#### Image Formats
- `.png` → `image/png`
- `.jpg`, `.jpeg` → `image/jpeg`
- `.gif` → `image/gif`
- `.webp` → `image/webp`
- `.svg` → `image/svg+xml`

#### Audio/Video Formats
- `.mp3` → `audio/mpeg`
- `.wav` → `audio/wav`
- `.mp4` → `video/mp4`
- `.mid`, `.midi` → `audio/midi`

#### Archive Formats
- `.zip` → `application/zip`
- `.tar` → `application/x-tar`
- `.gz` → `application/gzip`
- `.als` → `application/gzip` (Ableton format)

If the extension is unknown, it defaults to:
```
application/octet-stream
```

## ⚠️ Current Limitations

- **Browser Security**: Only supports URLs accessible via CORS and File/Blob objects
- **Bun/Deno**: Limited testing, may have compatibility issues  
- **Blob Support**: Node.js requires v15.7.0+ for full Blob support
- **Download Timeout**: Browser downloads have a 30-second timeout limit

## 🛣️ Roadmap

- [x] File object support in browsers (drag & drop, input files) ✅ **v0.0.10**
- [x] Enhanced type inference system ✅ **v0.0.10**
- [x] Detailed metadata support with `useDetails` option ✅ **v0.0.10**
- [ ] Stream-based operations for large files (planned for v0.2.x)
- [ ] Enhanced Bun and Deno compatibility
- [ ] Directory operations (list, create, remove)
- [ ] Compression/decompression utilities
- [ ] Progress callbacks for large operations
- [ ] Custom MIME type override options

> ## 🤝 Contributing

Contributions are welcome! Please check our [Contributing Guide](CONTRIBUTING.md) for details.

> ## 📄 License

MIT © [jeffy-g](https://github.com/jeffy-g)

---

> **Need help?** Check out our [examples](examples/) or [open an issue](https://github.com/jeffy-g/universal-fs/issues).
