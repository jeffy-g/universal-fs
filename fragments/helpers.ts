/**
 * @file universal-fs/tests/helpers.ts
 */
import { vi, expect } from 'vitest';

/**
 * Create a mock File object for testing
 */
export function createMockFile(
  content: string | ArrayBuffer | Uint8Array,
  filename: string,
  options: { type?: string; lastModified?: number } = {}
): File {
  const { type = 'text/plain', lastModified = Date.now() } = options;

  let blobParts: BlobPart[];
  if (typeof content === 'string') {
    blobParts = [content];
  } else if (content instanceof ArrayBuffer) {
    blobParts = [content];
  } else {
    blobParts = [content];
  }

  return new File(blobParts, filename, { type, lastModified });
}

/**
 * Create a mock Blob object for testing
 */
export function createMockBlob(
  content: string | ArrayBuffer | Uint8Array,
  options: { type?: string } = {}
): Blob {
  const { type = 'text/plain' } = options;

  let blobParts: BlobPart[];
  if (typeof content === 'string') {
    blobParts = [content];
  } else if (content instanceof ArrayBuffer) {
    blobParts = [content];
  } else {
    blobParts = [content];
  }

  return new Blob(blobParts, { type });
}

/**
 * Create a mock Response for fetch testing
 */
export function createMockResponse(
  data: any,
  options: {
    status?: number;
    statusText?: string;
    headers?: Record<string, string>;
  } = {}
): Response {
  const { status = 200, statusText = 'OK', headers = {} } = options;

  return new Response(data, {
    status,
    statusText,
    headers: new Headers(headers)
  });
}

/**
 * Mock browser environment for testing
 */
export function mockBrowserEnvironment() {
  const mockElement = {
    href: '',
    download: '',
    click: vi.fn(),
    style: { display: '' }
  };

  const mockURL = {
    createObjectURL: vi.fn().mockReturnValue('blob:mock-url'),
    revokeObjectURL: vi.fn()
  };

  Object.defineProperty(globalThis, 'window', {
    value: {
      document: {},
      URL: mockURL,
      location: { href: 'https://localhost:3000' }
    },
    writable: true,
    configurable: true
  });

  Object.defineProperty(globalThis, 'document', {
    value: {
      createElement: vi.fn().mockReturnValue(mockElement),
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn()
      }
    },
    writable: true,
    configurable: true
  });

  global.fetch = vi.fn();

  return { mockElement, mockURL };
}

/**
 * Mock Node.js environment for testing
 */
export function mockNodeEnvironment() {
  // Remove browser globals
  delete (globalThis as any).window;
  delete (globalThis as any).document;

  // Set Node.js globals
  Object.defineProperty(globalThis, 'process', {
    value: {
      versions: { node: '16.0.0' },
      env: { NODE_ENV: 'test' }
    },
    writable: true,
    configurable: true
  });
}

/**
 * Generate test data of various types
 */
export const TestDataGenerator = {
  /**
   * Generate random text of specified length
   */
  randomText(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  /**
   * Generate random JSON object
   */
  randomJson(depth: number = 2, width: number = 3): any {
    if (depth === 0) {
      const types = ['string', 'number', 'boolean'];
      const type = types[Math.floor(Math.random() * types.length)];

      switch (type) {
        case 'string':
          return this.randomText(10);
        case 'number':
          return Math.random() * 1000;
        case 'boolean':
          return Math.random() > 0.5;
        default:
          return null;
      }
    }

    const obj: any = {};
    for (let i = 0; i < width; i++) {
      const key = `key${i}`;
      obj[key] = this.randomJson(depth - 1, width);
    }
    return obj;
  },

  /**
   * Generate random binary data
   */
  randomBinary(size: number): Uint8Array {
    const data = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      data[i] = Math.floor(Math.random() * 256);
    }
    return data;
  },

  /**
   * Generate Unicode test string
   */
  unicodeText(): string {
    return '🚀 Universal FS 📁 supports Unicode! 中文 العربية Русский 日本語';
  },

  /**
   * Generate large text content
   */
  largeText(sizeInKB: number): string {
    const chunkSize = 1024;
    const chunks: string[] = [];
    const baseText = this.randomText(chunkSize);
    for (let i = 0; i < sizeInKB; i++) {
      chunks.push(baseText);
    }
    return chunks.join('');
  }
};

/**
 * Performance measurement utilities
 */
export class PerformanceTracker {
  private marks: Map<string, number> = new Map();

  start(label: string): void {
    this.marks.set(label, performance.now());
  }

  end(label: string): number {
    const startTime = this.marks.get(label);
    if (!startTime) {
      throw new Error(`No start time found for label: ${label}`);
    }

    const duration = performance.now() - startTime;
    this.marks.delete(label);
    return duration;
  }

  measure<T>(label: string, fn: () => T): T;
  measure<T>(label: string, fn: () => Promise<T>): Promise<T>;
  measure<T>(label: string, fn: () => T | Promise<T>): T | Promise<T> {
    this.start(label);
    const result = fn();

    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = this.end(label);
        console.log(`${label}: ${duration.toFixed(2)}ms`);
      });
    } else {
      const duration = this.end(label);
      console.log(`${label}: ${duration.toFixed(2)}ms`);
      return result;
    }
  }
}

/**
 * File system test utilities
 */
export class FileSystemTestUtils {
  /**
   * Create a temporary file path for testing
   */
  static createTempPath(filename: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return `./test-temp/${timestamp}-${random}-${filename}`;
  }

  /**
   * Validate file metadata
   */
  static validateMetadata(metadata: any, expectedFilename?: string): void {
    expect(metadata).toHaveProperty('filename');
    expect(metadata).toHaveProperty('size');
    expect(metadata).toHaveProperty('strategy');
    expect(metadata).toHaveProperty('timestamp');

    expect(typeof metadata.filename).toBe('string');
    expect(typeof metadata.size).toBe('number');
    expect(['node', 'browser']).toContain(metadata.strategy);
    expect(typeof metadata.timestamp).toBe('number');

    if (expectedFilename) {
      expect(metadata.filename).toBe(expectedFilename);
    }

    expect(metadata.size).toBeGreaterThanOrEqual(0);
    expect(metadata.timestamp).toBeGreaterThan(0);
  }

  /**
   * Compare binary data arrays
   */
  static compareBinaryData(actual: ArrayBuffer | Uint8Array, expected: ArrayBuffer | Uint8Array): void {
    const actualArray = actual instanceof ArrayBuffer ? new Uint8Array(actual) : actual;
    const expectedArray = expected instanceof ArrayBuffer ? new Uint8Array(expected) : expected;

    expect(actualArray.length).toBe(expectedArray.length);
    expect(Array.from(actualArray)).toEqual(Array.from(expectedArray));
  }

  /**
   * Validate MIME type
   */
  static validateMimeType(mimeType: string | undefined, filename: string): void {
    if (!mimeType) return;

    expect(typeof mimeType).toBe('string');
    expect(mimeType).toMatch(/^[a-zA-Z][a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*$/);

    // Basic extension-to-MIME-type validation
    const ext = filename.split('.').pop()?.toLowerCase();

    const expectedMimeTypes: Record<string, string> = {
      'txt': 'text/plain',
      'json': 'application/json',
      'html': 'text/html',
      'htm': 'text/html',
      'css': 'text/css',
      'js': 'application/javascript',
      'ts': 'application/typescript',
      'xml': 'application/xml',
      'pdf': 'application/pdf',
      'zip': 'application/zip',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
      'webp': 'image/webp',
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'bin': 'application/octet-stream',
      'exe': 'application/octet-stream'
    };

    if (ext && expectedMimeTypes[ext]) {
      expect(mimeType).toBe(expectedMimeTypes[ext]);
    }
  }
}

/**
 * Async test utilities
 */
export class AsyncTestUtils {
  /**
   * Wait for a specified amount of time
   */
  static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Wait for a condition to become true
   */
  static async waitFor(
    condition: () => boolean | Promise<boolean>,
    timeout: number = 5000,
    interval: number = 100
  ): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return;
      }
      await this.delay(interval);
    }

    throw new Error(`Condition not met within ${timeout}ms`);
  }

  /**
   * Run operations concurrently and collect results
   */
  static async concurrent<T>(operations: (() => Promise<T>)[]): Promise<T[]> {
    return Promise.all(operations.map(op => op()));
  }

  /**
   * Run operations sequentially
   */
  static async sequential<T>(operations: (() => Promise<T>)[]): Promise<T[]> {
    const results: T[] = [];
    for (const operation of operations) {
      results.push(await operation());
    }
    return results;
  }
}

/**
 * Error testing utilities
 */
export class ErrorTestUtils {
  /**
   * Test that an async function throws with specific error properties
   */
  static async expectAsyncError(
    fn: () => Promise<any>,
    expectedMessage?: string | RegExp,
    expectedType?: new (...args: any[]) => Error
  ): Promise<Error> {
    try {
      await fn();
      throw new Error('Expected function to throw but it did not');
    } catch (error) {
      if (expectedType && !(error instanceof expectedType)) {
        throw new Error(`Expected error of type ${expectedType.name} but got ${error.constructor.name}`);
      }

      if (expectedMessage) {
        if (typeof expectedMessage === 'string') {
          expect(error.message).toContain(expectedMessage);
        } else {
          expect(error.message).toMatch(expectedMessage);
        }
      }
      return error as Error;
    }
  }

  /**
   * Test error recovery scenarios
   */
  static async testRecovery<T>(
    operation: () => Promise<T>,
    recovery: () => Promise<T>,
    expectError: boolean = true
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (!expectError) {
        throw error;
      }
      return await recovery();
    }
  }
}

/**
 * Environment-specific test decorators
 */
export const TestDecorators = {
  /**
   * Skip test in browser environment
   */
  nodeOnly: (testFn: () => void | Promise<void>) => {
    return typeof window === 'undefined' ? testFn : () => { };
  },

  /**
   * Skip test in Node.js environment
   */
  browserOnly: (testFn: () => void | Promise<void>) => {
    return typeof window !== 'undefined' ? testFn : () => { };
  },

  /**
   * Run test with timeout
   */
  withTimeout: (timeout: number) => (testFn: () => Promise<void>) => {
    return async () => {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Test timed out after ${timeout}ms`)), timeout);
      });

      return Promise.race([testFn(), timeoutPromise]);
    };
  },

  /**
   * Retry test on failure
   */
  withRetry: (maxRetries: number) => (testFn: () => Promise<void>) => {
    return async () => {
      let lastError: Error;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          await testFn();
          return; // Success
        } catch (error) {
          lastError = error as Error;
          if (attempt < maxRetries) {
            await AsyncTestUtils.delay(100 * (attempt + 1)); // Exponential backoff
          }
        }
      }

      throw lastError!;
    };
  }
};

/**
 * Custom Jest/Vitest matchers
 */
export const customMatchers = {
  /**
   * Check if value is a valid UFS result with details
   */
  toBeUFSResult(received: any, expectedData?: any) {
    const pass =
      typeof received === 'object' &&
      received !== null &&
      typeof received.filename === 'string' &&
      typeof received.size === 'number' &&
      typeof received.strategy === 'string' &&
      typeof received.timestamp === 'number' &&
      ['node', 'browser'].includes(received.strategy) &&
      (expectedData === undefined || received.data === expectedData);

    return {
      pass,
      message: () => pass
        ? `Expected not to be a valid UFS result`
        : `Expected to be a valid UFS result with properties: filename, size, strategy, timestamp`
    };
  },

  /**
   * Check if ArrayBuffer or Uint8Array contains specific bytes
   */
  toContainBytes(received: ArrayBuffer | Uint8Array, expected: number[]) {
    const receivedArray = received instanceof ArrayBuffer ? new Uint8Array(received) : received;
    const receivedBytes = Array.from(receivedArray);

    let foundIndex = -1;
    for (let i = 0; i <= receivedBytes.length - expected.length; i++) {
      if (receivedBytes.slice(i, i + expected.length).every((byte, index) => byte === expected[index])) {
        foundIndex = i;
        break;
      }
    }

    const pass = foundIndex !== -1;

    return {
      pass,
      message: () => pass
        ? `Expected not to contain bytes [${expected.join(', ')}]`
        : `Expected to contain bytes [${expected.join(', ')}] but did not find them`
    };
  },

  /**
   * Check if MIME type is valid format
   */
  toBeValidMimeType(received: string) {
    const mimeTypeRegex = /^[a-zA-Z][a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*$/;
    const pass = typeof received === 'string' && mimeTypeRegex.test(received);

    return {
      pass,
      message: () => pass
        ? `Expected "${received}" not to be a valid MIME type`
        : `Expected "${received}" to be a valid MIME type`
    };
  }
};
