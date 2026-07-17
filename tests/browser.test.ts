/**
 * @file universal-fs/tests/browser.test.ts
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ufs } from "../dist/browser.js";

describe('Universal FS - Browser Environment', () => {
  let mockElement: HTMLAnchorElement;
  let mockURL: typeof URL;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", vi.fn());

    mockElement = document.createElement("a");
    vi.spyOn(mockElement, "click").mockImplementation(() => {
      mockElement.dispatchEvent(new MouseEvent("click"));
    });
    vi.spyOn(document, "createElement").mockReturnValue(mockElement as any);
    vi.spyOn(document.body, "appendChild");
    vi.spyOn(document.body, "removeChild");

    mockURL = URL;
    vi.spyOn(mockURL, "createObjectURL").mockReturnValue("blob:mock-url");
    vi.spyOn(mockURL, "revokeObjectURL").mockImplementation(() => {});
  });

  afterEach(async () => {
    await vi.runOnlyPendingTimersAsync();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('Basic Properties', () => {
    it('should expose all required methods', () => {
      ([
        "readFile", "readText", "readJSON", "readBlob", "readBuffer",
        "writeFile","writeText", "writeJSON", "writeBlob", "writeBuffer",
      ] as (keyof typeof ufs)[]).forEach((fnName => expect(typeof ufs[fnName]).toBe('function')));
    });
  });

  describe('File Object Reading', () => {
    it('should read text from File object', async () => {
      const testContent = 'File object test content';
      const mockFile = new File([testContent], 'test.txt', { type: 'text/plain' });
      const result = await ufs.readText(mockFile);
      expect(result).toBe(testContent);
    });

    it('should read JSON from File object', async () => {
      const testData = { name: 'file-test', value: 42 };
      const jsonContent = JSON.stringify(testData);
      const mockFile = new File([jsonContent], 'test.json', { type: 'application/json' });
      // readJSON
      const result = await ufs.readFile(mockFile, { format: "json" });
      expect(result).toEqual(testData);
    });

    it('should read binary data from File object', async () => {
      const testData = new Uint8Array([1, 2, 3, 4, 5]);
      const mockFile = new File([testData], 'test.bin', { type: 'application/octet-stream' });

      const result = await ufs.readBuffer(mockFile);
      expect(result).toBeInstanceOf(ArrayBuffer);

      const resultView = new Uint8Array(result);
      expect(Array.from(resultView)).toEqual([1, 2, 3, 4, 5]);
    });

    it('should read File object with details', async () => {
      const testContent = 'File with details';
      const mockFile = new File([testContent], 'test-details.txt', { type: 'text/plain' });

      const result = await ufs.readText(mockFile, { useDetails: true });

      expect(result).toHaveProperty('data', testContent);
      expect(result).toHaveProperty('filename', 'test-details.txt');
      expect(result).toHaveProperty('size');
      expect(result).toHaveProperty('strategy', 'browser');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('mimeType', 'text/plain');
      expect(typeof result.size).toBe('number');
      expect(result.size).toBeGreaterThan(0);
    });
  });

  describe('Blob Object Reading', () => {
    it('should read text from Blob object', async () => {
      const testContent = 'Blob test content';
      const mockBlob = new Blob([testContent], { type: 'text/plain' });

      const result = await ufs.readText(mockBlob);
      expect(result).toBe(testContent);
    });

    it('should read JSON from Blob object', async () => {
      const testData = { message: 'blob-json-test', count: 123 };
      const jsonContent = JSON.stringify(testData);
      const mockBlob = new Blob([jsonContent], { type: 'application/json' });

      const result = await ufs.readFile(mockBlob, { format: "json" });
      expect(result).toEqual(testData);
    });

    it('should read Blob as Blob (identity operation)', async () => {
      const testContent = 'Blob identity test';
      const mockBlob = new Blob([testContent], { type: 'text/plain' });

      const result = await ufs.readBlob(mockBlob);
      expect(result).toBeInstanceOf(Blob);

      const resultText = await result.text();
      expect(resultText).toBe(testContent);
    });

    it('should read Blob with details', async () => {
      const testContent = 'Blob with details';
      const mockBlob = new Blob([testContent], { type: 'text/html' });

      const result = await ufs.readText(mockBlob, { useDetails: true });

      expect(result).toHaveProperty('data', testContent);
      expect(result).toHaveProperty('filename');
      expect(result).toHaveProperty('size');
      expect(result).toHaveProperty('strategy', 'browser');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('mimeType', 'text/html');
    });
  });

  describe('URL Fetching', () => {
    it('should fetch and read text from URL', async () => {
      const testContent = 'Fetched content';
      const mockResponse = new Response(testContent, {
        status: 200,
        headers: { 'content-type': 'text/plain' }
      });

      vi.mocked(globalThis.fetch).mockResolvedValueOnce(mockResponse);

      const result = await ufs.readText('https://example.com/test.txt');
      expect(result).toBe(testContent);
      expect(fetch).toHaveBeenCalledWith('https://example.com/test.txt');
    });

    it('should fetch and parse JSON from URL', async () => {
      const testData = { api: 'test', version: '1.0' };
      const mockResponse = new Response(JSON.stringify(testData), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });

      vi.mocked(globalThis.fetch).mockResolvedValueOnce(mockResponse);
      const result = await ufs.readFile('https://api.example.com/config.json', { format: "json" });
      expect(result).toEqual(testData);
    });

    it('should fetch binary data from URL', async () => {
      const testData = new Uint8Array([255, 254, 253, 252]);
      const mockResponse = new Response(testData, {
        status: 200,
        headers: { 'content-type': 'application/octet-stream' }
      });

      vi.mocked(globalThis.fetch).mockResolvedValueOnce(mockResponse);

      const result = await ufs.readBuffer('https://example.com/data.bin');
      expect(result).toBeInstanceOf(ArrayBuffer);
    });

    it('should handle fetch errors gracefully', async () => {
      vi.mocked(globalThis.fetch).mockRejectedValueOnce(new Error('Network error'));

      await expect(ufs.readText('https://example.com/error.txt')).rejects.toThrow('Network error');
    });

    it('should handle HTTP error responses', async () => {
      const mockResponse = new Response('Not Found', {
        status: 404,
        statusText: 'Not Found'
      });

      vi.mocked(globalThis.fetch).mockResolvedValueOnce(mockResponse);

      await expect(ufs.readText('https://example.com/missing.txt')).rejects.toThrow();
    });

    it('should fetch with details including response metadata', async () => {
      const testContent = 'URL with details';
      const mockResponse = new Response(testContent, {
        status: 200,
        headers: {
          'content-type': 'text/plain',
          'content-length': testContent.length.toString()
        }
      });

      vi.mocked(globalThis.fetch).mockResolvedValueOnce(mockResponse);

      const result = await ufs.readText('https://example.com/details.txt', { useDetails: true });

      expect(result).toHaveProperty('data', testContent);
      expect(result).toHaveProperty('filename', 'details.txt');
      expect(result).toHaveProperty('strategy', 'browser');
      // can not set url to Response instance, https://example.com/details.txt
      expect(result).toHaveProperty('url', '');
      expect(result).toHaveProperty('mimeType', 'text/plain');
    });
  });

  describe('File Writing (Download Trigger)', () => {
    it('should trigger download for text file', async () => {
      const testContent = 'Download test content';

      await ufs.writeText("download-test.txt", testContent);

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockURL.createObjectURL).toHaveBeenCalled();
      expect(mockElement.download).toBe('download-test.txt');
      expect(mockElement.click).toHaveBeenCalled();
      expect(document.body.appendChild).toHaveBeenCalledWith(mockElement);
      expect(document.body.removeChild).toHaveBeenCalledWith(mockElement);
    });

    it('should trigger download for JSON file', async () => {
      const testData = { download: 'json-test', timestamp: Date.now() };

      await ufs.writeJSON("config.json", testData);

      expect(mockElement.download).toBe('config.json');
      expect(mockElement.click).toHaveBeenCalled();
    });

    it('should trigger download for binary data', async () => {
      const testData = new Uint8Array([1, 2, 3, 4]);

      await ufs.writeBuffer("data.bin", testData);

      expect(mockElement.download).toBe('data.bin');
      expect(mockElement.click).toHaveBeenCalled();
    });

    it('should trigger download for Blob', async () => {
      const testBlob = new Blob(['Blob download test'], { type: 'text/plain' });

      await ufs.writeBlob("blob-file.txt", testBlob);

      expect(mockElement.download).toBe('blob-file.txt');
      expect(mockElement.click).toHaveBeenCalled();
    });

    it('should return detailed result when writing with useDetails', async () => {
      const testContent = 'Write with details in browser';

      const result = await ufs.writeText("details-test.txt", testContent, { useDetails: true });

      expect(result).toHaveProperty('filename', 'details-test.txt');
      expect(result).toHaveProperty('size');
      expect(result).toHaveProperty('strategy', 'browser');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('url');
      expect(typeof result.size).toBe('number');
      expect(result.size).toBeGreaterThan(0);
    });

    it('should handle filename sanitization', async () => {
      const testContent = 'Sanitization test';
      const unsafeFilename = 'file<>"|?*.txt';

      await ufs.writeText(unsafeFilename, testContent);

      // The implementation should sanitize the filename
      expect(mockElement.download).toBeDefined();
      expect(mockElement.download).not.toContain('<');
      expect(mockElement.download).not.toContain('>');
    });

    it('should clean up object URLs after timeout', async () => {
      const testContent = 'Cleanup test';

      await ufs.writeText("cleanup-test.txt", testContent);
      await vi.advanceTimersByTimeAsync(100);

      expect(mockURL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });
  });

  describe('Format Handling', () => {
    it('should handle different read formats correctly', async () => {
      const testData = { format: 'test', value: 999 };
      const jsonContent = JSON.stringify(testData);
      const mockBlob = new Blob([jsonContent], { type: 'application/json' });

      // Read as text
      const textResult = await ufs.readFile(mockBlob, { format: 'text' });
      expect(typeof textResult).toBe('string');
      expect(textResult).toBe(jsonContent);

      // Read as JSON
      const jsonResult = await ufs.readFile(mockBlob, { format: 'json' });
      expect(jsonResult).toEqual(testData);

      // Read as buffer
      const bufferResult = await ufs.readFile(mockBlob, { format: 'arrayBuffer' });
      expect(bufferResult).toBeInstanceOf(ArrayBuffer);

      // Read as blob
      const blobResult = await ufs.readFile(mockBlob, { format: 'blob' });
      expect(blobResult).toBeInstanceOf(Blob);
    });

    it('should infer format when not specified', async () => {
      const testContent = 'Auto format test';
      const mockFile = new File([testContent], 'auto.txt', { type: 'text/plain' });

      const result = await ufs.readFile(mockFile);
      expect(typeof result).toBe('string');
      expect(result).toBe(testContent);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid JSON gracefully', async () => {
      const invalidJson = '{ invalid json }';
      const mockBlob = new Blob([invalidJson], { type: 'application/json' });

      await expect(ufs.readFile(mockBlob, { format: "json" })).rejects.toThrow();
    });

    it('should handle fetch network errors', async () => {
      vi.mocked(globalThis.fetch).mockRejectedValueOnce(new Error('Network timeout'));

      await expect(ufs.readText('https://timeout.example.com/file.txt')).rejects.toThrow('Network timeout');
    });

    it('should handle unsupported URL schemes', async () => {
      // Most browsers will reject file:// URLs for security reasons
      vi.mocked(globalThis.fetch).mockRejectedValueOnce(new Error('Failed to fetch'));

      await expect(ufs.readText('file:///etc/passwd')).rejects.toThrow();
    });
  });

  describe('Large File Handling', () => {
    it('should handle large blobs efficiently', async () => {
      // Create a moderately large blob (1MB)
      const largeContent = 'A'.repeat(1024 * 1024);
      const largeBlob = new Blob([largeContent], { type: 'text/plain' });

      const result = await ufs.readText(largeBlob);
      expect(result.length).toBe(1024 * 1024);
      expect(result).toBe(largeContent);
    });
  });

  describe('MIME Type Handling', () => {
    it('should preserve MIME types from File objects', async () => {
      const testContent = 'MIME type test';
      const mockFile = new File([testContent], 'test.html', { type: 'text/html' });

      const result = await ufs.readText(mockFile, { useDetails: true });
      expect(result.mimeType).toBe('text/html');
    });

    it('should preserve MIME types from Blob objects', async () => {
      const testContent = 'CSS content';
      const mockBlob = new Blob([testContent], { type: 'text/css' });

      const result = await ufs.readText(mockBlob, { useDetails: true });
      expect(result.mimeType).toBe('text/css');
    });

    it('should infer MIME types from URLs', async () => {
      const testContent = 'JavaScript content';
      const mockResponse = new Response(testContent, {
        status: 200,
        headers: { 'content-type': 'application/javascript' }
      });

      vi.mocked(globalThis.fetch).mockResolvedValueOnce(mockResponse);

      const result = await ufs.readText('https://example.com/script.js', { useDetails: true });
      expect(result.mimeType).toBe('application/javascript');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty files', async () => {
      const emptyFile = new File([], 'empty.txt', { type: 'text/plain' });

      const result = await ufs.readText(emptyFile);
      expect(result).toBe('');
    });

    it('should handle empty blobs', async () => {
      const emptyBlob = new Blob([], { type: 'text/plain' });

      const result = await ufs.readText(emptyBlob);
      expect(result).toBe('');
    });

    it('should handle files without extensions', async () => {
      const testContent = 'No extension file';
      const noExtFile = new File([testContent], 'README', { type: 'text/plain' });

      const result = await ufs.readText(noExtFile);
      expect(result).toBe(testContent);
    });

    it('should handle Unicode content correctly', async () => {
      const unicodeContent = '🚀 Universal FS supports Unicode! 中文 العربية';
      const unicodeFile = new File([unicodeContent], 'unicode.txt', { type: 'text/plain' });

      const result = await ufs.readText(unicodeFile);
      expect(result).toBe(unicodeContent);
    });

    it('should handle special characters in filenames', async () => {
      const testContent = 'Special filename test';
      const specialFile = new File([testContent], 'файл-тест.txt', { type: 'text/plain' });

      const result = await ufs.readText(specialFile);
      expect(result).toBe(testContent);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle multiple concurrent reads', async () => {
      const files = [
        new File(['Content 1'], 'file1.txt', { type: 'text/plain' }),
        new File(['Content 2'], 'file2.txt', { type: 'text/plain' }),
        new File(['Content 3'], 'file3.txt', { type: 'text/plain' })
      ];

      const promises = files.map(file => ufs.readText(file));
      const results = await Promise.all(promises);

      expect(results).toEqual(['Content 1', 'Content 2', 'Content 3']);
    });

    it('should handle multiple concurrent writes', async () => {
      const writePromises = [
        ufs.writeText("concurrent1.txt", 'Write 1'),
        ufs.writeText("concurrent2.txt", 'Write 2'),
        ufs.writeText("concurrent3.txt", 'Write 3')
      ];

      // Should not throw errors
      await expect(Promise.all(writePromises)).resolves.toBeDefined();

      // Verify all downloads were triggered
      expect(mockElement.click).toHaveBeenCalledTimes(3);
    });
  });

  describe('Memory Management', () => {
    it('should not leak object URLs during downloads', async () => {
      const testContent = 'Memory test';

      await ufs.writeText("memory-test.txt", testContent);

      expect(mockURL.createObjectURL).toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(100);

      expect(mockURL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    });
  });

  describe('Integration with Generic Methods', () => {
    it('should work with readFile using different input types', async () => {
      const testContent = 'Generic method test';

      // Test with File
      const file = new File([testContent], 'generic.txt', { type: 'text/plain' });
      const fileResult = await ufs.readFile(file, { format: 'text' });
      expect(fileResult).toBe(testContent);

      // Test with Blob
      const blob = new Blob([testContent], { type: 'text/plain' });
      const blobResult = await ufs.readFile(blob, { format: 'text' });
      expect(blobResult).toBe(testContent);
    });

    it('should work with writeFile for downloads', async () => {
      const testContent = 'Generic write test';

      await ufs.writeFile("generic-write.txt", testContent);

      expect(mockElement.download).toBe('generic-write.txt');
      expect(mockElement.click).toHaveBeenCalled();
    });
  });

  describe('Download Security Features', () => {
    it('should sanitize dangerous filenames', async () => {
      const testContent = 'Security test';
      const dangerousFilename = '<script>alert("xss")</script>.txt';

      await ufs.writeText(dangerousFilename, testContent);
      // Should sanitize the filename
      expect(mockElement.download).not.toContain('<script>');
    });

    it('should handle path traversal attempts', async () => {
      const testContent = 'Path traversal test';
      const traversalFilename = '../../../etc/passwd.txt';

      await ufs.writeText(traversalFilename, testContent);
      // Should sanitize path traversal
      expect(mockElement.download).not.toContain('../');
    });

    it('should limit filename length', async () => {
      const testContent = 'Long filename test';
      const longFilename = 'a'.repeat(300) + '.txt'; // Very long filename

      await ufs.writeText(longFilename, testContent);
      // Should limit or handle long filenames appropriately
      expect(mockElement.download.length).toBeLessThanOrEqual(255);
    });
  });

  describe('Error Recovery', () => {
    it('should handle Blob creation failures gracefully', async () => {
      const testContent = 'Error handling test';
      vi.stubGlobal("Blob", vi.fn(function BlobMock() {
        throw new Error('Blob creation failed');
      }));
      await expect(ufs.writeText("error-test.txt", testContent)).rejects.toThrow();
    });

    it('should handle DOM manipulation failures', async () => {
      const testContent = 'DOM error test';
      vi.mocked(document.createElement).mockImplementation(() => {
        throw new Error('Cannot create element');
      });
      await expect(ufs.writeText("dom-error.txt", testContent)).rejects.toThrow();
    });
  });

  describe('Browser Compatibility Features', () => {
    it('should handle missing URL.createObjectURL', async () => {
      const testContent = 'Compatibility test';

      vi.stubGlobal("URL", {});

      await expect(ufs.writeText("compat-test.txt", testContent)).rejects.toThrow();
    });

    it('should handle missing fetch API', async () => {
      vi.stubGlobal("fetch", undefined);

      await expect(ufs.readText('https://example.com/missing-fetch.txt')).rejects.toThrow();
    });
  });

  describe('Data Validation', () => {
    it('should validate File object properties', async () => {
      const testContent = 'Validation test';
      const mockFile = new File([testContent], 'validation.txt', {
        type: 'text/plain',
        lastModified: 1234567890000
      });

      const result = await ufs.readText(mockFile, { useDetails: true });

      expect(result.filename).toBe('validation.txt');
      expect(result.mimeType).toBe('text/plain');
      expect(result.size).toBeGreaterThan(0);
      expect(result.strategy).toBe('browser');
    });

    it('should handle malformed URLs gracefully', async () => {
      vi.mocked(globalThis.fetch).mockRejectedValueOnce(new TypeError('Invalid URL'));

      await expect(ufs.readText('not-a-valid-url')).rejects.toThrow('Invalid URL');
    });

    it('should validate response content types', async () => {
      const mockResponse = new Response('{"valid": "json"}', {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });

      vi.mocked(globalThis.fetch).mockResolvedValueOnce(mockResponse);

      const result = await ufs.readFile('https://example.com/valid.json', { format: "json" });
      expect(result).toEqual({ valid: 'json' });
    });
  });

  describe('Performance Considerations', () => {
    it('should handle large File objects efficiently', async () => {
      // Create a 5MB file
      const largeContent = 'A'.repeat(5 * 1024 * 1024);
      const largeFile = new File([largeContent], 'large.txt', { type: 'text/plain' });

      const startTime = performance.now();
      const result = await ufs.readText(largeFile);
      const endTime = performance.now();

      expect(result.length).toBe(5 * 1024 * 1024);
      // Performance check - should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(5000); // 5 seconds max
    });

    it('should handle many small operations efficiently', async () => {
      const operations: Promise<string>[] = [];

      for (let i = 0; i < 100; i++) {
        const file = new File([`Content ${i}`], `file${i}.txt`, { type: 'text/plain' });
        operations.push(ufs.readText(file));
      }

      const startTime = performance.now();
      const results = await Promise.all(operations);
      const endTime = performance.now();
      expect(results).toHaveLength(100);
      // Should handle 100 operations efficiently
      expect(endTime - startTime).toBeLessThan(2000); // 2 seconds max
    });
  });

  describe('TypeScript Integration', () => {
    it('should maintain proper types with generic parameters', async () => {
      interface TestData {
        name: string;
        count: number;
      }

      const testData: TestData = { name: 'typescript-test', count: 42 };
      const file = new File([JSON.stringify(testData)], 'typed.json', { type: 'application/json' });

      // Type should be properly inferred
      const result = await ufs.readFile<TestData>(file, { format: "json" });

      // TypeScript should understand these properties exist
      expect(result.name).toBe('typescript-test');
      expect(result.count).toBe(42);
    });

    it('should handle union types correctly', async () => {
      // type StringOrNumber = string | number;
      const stringFile = new File(['hello'], 'string.txt', { type: 'text/plain' });
      const numberFile = new File(['42'], 'number.txt', { type: 'text/plain' });
      const stringResult = await ufs.readText(stringFile);
      const numberResult = await ufs.readText(numberFile);

      expect(typeof stringResult).toBe('string');
      expect(typeof numberResult).toBe('string');
      expect(stringResult).toBe('hello');
      expect(numberResult).toBe('42');
    });
  });
});
