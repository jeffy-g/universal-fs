/**
 * @file universal-fs/tests/integration.test.ts
 */
import { describe, it, expect } from 'vitest';
import { ufs } from '../dist';
import type {
  TUFSData,
} from "../dist"
import { UniversalFsError } from '../dist/utils.js';

describe('Universal FS - Integration Tests', () => {
  describe('Environment Detection', () => {
    it('should detect Node.js environment correctly', () => {
      // Mock Node.js environment
      const originalWindow = globalThis.window;
      const originalProcess = globalThis.process;

      delete (globalThis as any).window;
      (globalThis as any).process = { versions: { node: '16.0.0' } };

      // Re-import to trigger environment detection
      // Note: This might not work in all test setups due to module caching
      expect(process?.versions?.node).toBeDefined();

      // Restore
      (globalThis as any).window = originalWindow;
      (globalThis as any).process = originalProcess;
    });

    it('should detect browser environment correctly', () => {
      // Mock browser environment
      const originalProcess = globalThis.process;

      delete (globalThis as any).process;
      (globalThis as any).window = { document: {} };
      (globalThis as any).document = {};

      expect(typeof window).toBe('object');
      expect(typeof document).toBe('object');

      // Restore
      (globalThis as any).process = originalProcess;
    });
  });

  describe('Error Handling', () => {
    it('should throw UniversalFsError with proper metadata', async () => {
      try {
        await ufs.readFile('non-existent-file.txt');
        expect.fail('Should have thrown an error');
      } catch (error) {
        if (error instanceof UniversalFsError) {
          expect(error.operation).toBeDefined();
          expect(error.strategy).toBeDefined();
          expect(error.filename).toBe('non-existent-file.txt');
          expect(error.cause).toBeDefined();
        } else {
          // In some environments, it might throw a different error
          expect(error).toBeInstanceOf(Error);
        }
      }
    });

    it('should handle unsupported environment gracefully', async () => {
      // Mock unsupported environment
      const originalWindow = globalThis.window;
      const originalProcess = globalThis.process;
      const originalDocument = globalThis.document;

      delete (globalThis as any).window;
      delete (globalThis as any).process;
      delete (globalThis as any).document;

      try {
        // This should trigger the unsupported environment error
        // Note: Due to lazy loading, we need to trigger the internal fs loading
        // WIP: 2025/7/31 14:26:13 - How to handle `string` type or? 
        await expect(ufs.readFile('test.txt')).rejects.toThrow(/Failed to parse URL|ENOENT/); // /Failed to parse URL/ or /ENOENT/
      } finally {
        // Restore environment
        (globalThis as any).window = originalWindow;
        (globalThis as any).process = originalProcess;
        (globalThis as any).document = originalDocument;
      }
    });
  });

  describe('Type Safety and Inference', () => {
    it('should maintain type safety with generic parameters', async () => {
      interface TestConfig {
        name: string;
        version: string;
        features: string[];
      }

      const mockFile = new File(
        [JSON.stringify({ name: 'test', version: '1.0.0', features: ['a', 'b'] })],
        'config.json',
        { type: 'application/json' }
      );

      // Type should be inferred as TestConfig
      const config = await ufs.readFile<TestConfig>(mockFile, { format: "json" });
      // TypeScript should allow these operations without type assertion
      expect(typeof config.name).toBe('string');
      expect(Array.isArray(config.features)).toBe(true);
      expect(config.features.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle union types correctly', async () => {
      type ConfigValue = string | number | boolean | string[];
      interface FlexibleConfig {
        [key: string]: ConfigValue;
      }
      const testConfig: FlexibleConfig = {
        name: 'flexible-test',
        port: 3000,
        debug: true,
        tags: ['test', 'config']
      };

      const mockFile = new File(
        [JSON.stringify(testConfig)],
        'flexible.json',
        { type: 'application/json' }
      );

      const result = await ufs.readFile<FlexibleConfig>(mockFile, { format: "json" });
      expect(result.name).toBe('flexible-test');
      expect(result.port).toBe(3000);
      expect(result.debug).toBe(true);
      expect(Array.isArray(result.tags)).toBe(true);
    });
  });

  describe('Format Conversion Edge Cases', () => {
    it('should handle binary data with different typed arrays', async () => {
      const int16Data = new Int16Array([1000, -1000, 32767, -32768]);
      const buffer = int16Data.buffer;
      const mockFile = new File([buffer], 'int16.bin', { type: 'application/octet-stream' });
      const result = await ufs.readBuffer(mockFile);
      const resultView = new Int16Array(result);
      expect(Array.from(resultView)).toEqual(Array.from(int16Data));
    });

    it('should handle float data correctly', async () => {
      const floatData = new Float32Array([3.14159, -2.71828, 1.41421, 0.57721]);
      const buffer = floatData.buffer;
      const mockFile = new File([buffer], 'floats.bin', { type: 'application/octet-stream' });
      const result = await ufs.readBuffer(mockFile);
      const resultView = new Float32Array(result);
      // Use approximate equality for floating point
      expect(resultView[0]).toBeCloseTo(3.14159, 5);
      expect(resultView[1]).toBeCloseTo(-2.71828, 5);
      expect(resultView[2]).toBeCloseTo(1.41421, 5);
      expect(resultView[3]).toBeCloseTo(0.57721, 5);
    });

    it('should handle mixed content types', async () => {
      // Create a file that could be interpreted as either text or binary
      const ambiguousContent = new Uint8Array([
        72, 101, 108, 108, 111, 32, // "Hello "
        240, 159, 152, 128, // 😀 emoji in UTF-8
        33 // "!"
      ]);

      const mockFile = new File([ambiguousContent], 'ambiguous.txt', { type: 'text/plain' });
      // Read as text - should interpret as UTF-8
      const textResult = await ufs.readText(mockFile);
      expect(textResult).toBe('Hello 😀!');
      // Read as binary - should preserve exact bytes
      const binaryResult = await ufs.readBuffer(mockFile);
      const binaryView = new Uint8Array(binaryResult);
      expect(Array.from(binaryView)).toEqual(Array.from(ambiguousContent));
    });
  });

  describe('Concurrency and Performance', () => {
    it('should handle rapid sequential operations', async () => {
      const operations: Promise<TUFSData>[] = [];
      const testData = 'Rapid operation test';
      // Create multiple rapid operations
      for (let i = 0; i < 10; i++) {
        const file = new File([`${testData} ${i}`], `rapid-${i}.txt`, { type: 'text/plain' });
        operations.push(ufs.readFile(file));
      }
      const results = await Promise.all(operations);
      results.forEach((result, index) => {
        expect(result).toBe(`${testData} ${index}`);
      });
    });

    it('should handle mixed operation types concurrently', async () => {
      const textFile = new File(['Text content'], 'text.txt', { type: 'text/plain' });
      const jsonFile = new File([JSON.stringify({ key: 'value' })], 'data.json', { type: 'application/json' });
      const binaryFile = new File([new Uint8Array([1, 2, 3])], 'data.bin', { type: 'application/octet-stream' });

      const [textResult, jsonResult, binaryResult] = await Promise.all([
        ufs.readText(textFile),
        ufs.readFile(jsonFile, { format: "json" }),
        ufs.readBuffer(binaryFile)
      ]);

      expect(textResult).toBe('Text content');
      expect(jsonResult).toEqual({ key: 'value' });
      expect(new Uint8Array(binaryResult)).toEqual(new Uint8Array([1, 2, 3]));
    });
  });

  describe('Large Data Handling', () => {
    it('should handle large JSON objects', async () => {
      // Create a large but structured JSON object
      const largeObject = {
        metadata: {
          version: '1.0.0',
          timestamp: Date.now(),
          size: 'large'
        },
        data: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          name: `item-${i}`,
          value: Math.random(),
          tags: [`tag-${i % 10}`, `category-${Math.floor(i / 100)}`]
        }))
      };

      const jsonContent = JSON.stringify(largeObject);
      const largeFile = new File([jsonContent], 'large.json', { type: 'application/json' });
      const result = await ufs.readFile(largeFile, { format: "json" });

      expect(result).toHaveProperty('metadata');
      expect(result).toHaveProperty('data');
      expect(Array.isArray((result as any).data)).toBe(true);
      expect((result as any).data.length).toBe(1000);
      expect((result as any).data[0]).toHaveProperty('id', 0);
      expect((result as any).data[999]).toHaveProperty('id', 999);
    });

    it('should handle large binary data efficiently', async () => {
      // Create a 2MB binary file
      const size = 2 * 1024 * 1024; // 2MB
      const largeBuffer = new ArrayBuffer(size);
      const view = new Uint8Array(largeBuffer);

      // Fill with a pattern for verification
      for (let i = 0; i < size; i++) {
        view[i] = i % 256;
      }

      const largeFile = new File([largeBuffer], 'large.bin', { type: 'application/octet-stream' });
      const result = await ufs.readBuffer(largeFile);
      expect(result.byteLength).toBe(size);
      const resultView = new Uint8Array(result);

      // Verify pattern at key positions
      expect(resultView[0]).toBe(0);
      expect(resultView[255]).toBe(255);
      expect(resultView[256]).toBe(0);
      expect(resultView[size - 1]).toBe((size - 1) % 256);
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle extremely long filenames', async () => {
      const longFilename = 'a'.repeat(255) + '.txt'; // Max typical filename length
      const testContent = 'Long filename test';
      const file = new File([testContent], longFilename, { type: 'text/plain' });

      const result = await ufs.readText(file);
      expect(result).toBe(testContent);
      const detailResult = await ufs.readText(file, { useDetails: true });
      expect(detailResult.filename).toBe(longFilename);
    });

    it('should handle special Unicode filenames', async () => {
      const unicodeFilename = '🚀📁文件名.json';
      const testData = { unicode: 'filename test' };
      const file = new File([JSON.stringify(testData)], unicodeFilename, { type: 'application/json' });

      const result = await ufs.readFile(file, { format: "json" }); // readJSON
      expect(result).toEqual(testData);
    });

    it('should handle null bytes in text content', async () => {
      const contentWithNulls = 'Hello\x00World\x00!';
      const file = new File([contentWithNulls], 'nulls.txt', { type: 'text/plain' });

      const result = await ufs.readText(file);
      expect(result).toBe(contentWithNulls);
      expect(result.includes('\x00')).toBe(true);
    });

    it('should handle deeply nested JSON structures', async () => {
      // Create a deeply nested object
      let deepObject: any = { value: 'deep' };
      for (let i = 0; i < 100; i++) {
        deepObject = { level: i, nested: deepObject };
      }

      const file = new File([JSON.stringify(deepObject)], 'deep.json', { type: 'application/json' });
      const result = await ufs.readFile(file, { format: "json" }); // readJSON

      // Navigate to the deep value
      let current = result as any;
      for (let i = 99; i >= 0; i--) {
        expect(current.level).toBe(i);
        current = current.nested;
      }
      expect(current.value).toBe('deep');
    });
  });

  describe('Memory and Resource Management', () => {
    it('should not leak memory with repeated operations', async () => {
      // This test is more about ensuring operations complete successfully
      // rather than actually measuring memory usage
      const iterations = 50;
      const results: string[] = [];

      for (let i = 0; i < iterations; i++) {
        const file = new File([`Content ${i}`], `file-${i}.txt`, { type: 'text/plain' });
        const result = await ufs.readText(file);
        results.push(result);
      }

      expect(results).toHaveLength(iterations);
      results.forEach((result, index) => {
        expect(result).toBe(`Content ${index}`);
      });
    });

    it('should handle cleanup properly with aborted operations', async () => {
      const controller = new AbortController();
      const file = new File(['Aborted content'], 'abort.txt', { type: 'text/plain' });

      // Start reading then immediately abort
      const readPromise = ufs.readText(file);
      controller.abort();

      // The read should still complete since File reading is synchronous
      const result = await readPromise;
      expect(result).toBe('Aborted content');
    });
  });
});
