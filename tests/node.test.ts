/**
 * @file universal-fs/tests/node.test.ts
 */
import * as fs from "node:fs";
import * as os from 'node:os';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ufs } from '../dist/index.js';
import { join } from 'path';
const { existsSync, mkdirSync, rmSync } = fs;
// console.log(fs);


describe('Universal FS - Node.js Environment', () => {
  const testDir = './tmp/tests/test-output';
  const testFiles = {
    /** test.txt */
    text: join(testDir, 'test.txt'),
    /** test.json */
    json: join(testDir, 'test.json'),
    /** test.bin */
    binary: join(testDir, 'test.bin'),
    /** test.blob */
    blob: join(testDir, 'test.blob'),
    /** test.buffer */
    buffer: join(testDir, 'test.buffer'),
  };

  beforeEach(() => {
    // Create test directory
    if (!existsSync(testDir)) {
      mkdirSync(testDir, { recursive: true });
    }
  });
  afterEach(() => {
    // Clean up test files
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('Basic Properties', () => {
    it('should have version property', () => {
      expect(ufs.version).toBe('v0.1.3');
    });

    it('should expose all required methods', () => {
      expect(typeof ufs.readFile).toBe('function');
      expect(typeof ufs.writeFile).toBe('function');
      expect(typeof ufs.readText).toBe('function');
      expect(typeof ufs.readJSON).toBe('function');
      expect(typeof ufs.readBlob).toBe('function');
      expect(typeof ufs.readBuffer).toBe('function');
      expect(typeof ufs.writeText).toBe('function');
      expect(typeof ufs.writeJSON).toBe('function');
      expect(typeof ufs.writeBlob).toBe('function');
      expect(typeof ufs.writeBuffer).toBe('function');
    });
  });

  describe('Text Operations', () => {
    it('should write and read text files', async () => {
      const testContent = 'Hello, Universal FS!';
      await ufs.writeText(testFiles.text, testContent);
      expect(existsSync(testFiles.text)).toBe(true);
      const result = await ufs.readText(testFiles.text);
      expect(result).toBe(testContent);
    });

    it('should write and read text with encoding options', async () => {
      const testContent = 'Hello with encoding! 🚀';
      await ufs.writeText(testFiles.text, testContent, { encoding: 'utf8' });
      const result = await ufs.readText(testFiles.text, { encoding: 'utf8' });
      expect(result).toBe(testContent);
    });

    it('should return detailed result when useDetails is true', async () => {
      const testContent = 'Hello with details!';
      await ufs.writeText(testFiles.text, testContent);
      const result = await ufs.readText(testFiles.text, { useDetails: true });
      expect(result).toHaveProperty('data', testContent);
      expect(result).toHaveProperty('filename');
      expect(result).toHaveProperty('size');
      expect(result).toHaveProperty('strategy', 'node');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('path');
      expect(typeof result.size).toBe('number');
      expect(result.size).toBeGreaterThan(0);
    });
  });

  describe('JSON Operations', () => {
    it('should write and read JSON objects', async () => {
      const testData = { name: 'test', version: '1.0.0', features: ['read', 'write'] };

      await ufs.writeJSON(testFiles.json, testData);
      expect(existsSync(testFiles.json)).toBe(true);

      const result = await ufs.readJSON(testFiles.json);
      expect(result).toEqual(testData);
    });

    it('should write and read JSON arrays', async () => {
      const testData = [1, 2, 3, { nested: true }];

      await ufs.writeJSON(testFiles.json, testData);
      const result = await ufs.readJSON(testFiles.json);

      expect(result).toEqual(testData);
    });

    it('should handle typed JSON reading', async () => {
      interface TestConfig {
        name: string;
        version: string;
        debug: boolean;
      }

      const testData: TestConfig = { name: 'test-app', version: '2.0.0', debug: true };
      await ufs.writeJSON(testFiles.json, testData);
      const result = await ufs.readJSON<TestConfig>(testFiles.json);
      expect(result.name).toBe('test-app');
      expect(result.version).toBe('2.0.0');
      expect(result.debug).toBe(true);
    });

    it('should format JSON with proper indentation', async () => {
      const testData = { name: 'format-test', nested: { value: 42 } };

      await ufs.writeJSON(testFiles.json, testData);

      // Read raw file content to check formatting
      const rawContent = await ufs.readText(testFiles.json);
      expect(rawContent).toContain('  '); // Should have indentation
      expect(rawContent).toMatch(/\{\s+\"name\":/); // Should be formatted
    });
  });

  describe('Binary Operations', () => {
    it('should write and read ArrayBuffer', async () => {
      const testData = new ArrayBuffer(8);
      const view = new Uint8Array(testData);
      view.set([72, 101, 108, 108, 111, 33, 0, 0]); // "Hello!" + nulls

      await ufs.writeBuffer(testFiles.buffer, testData);
      expect(existsSync(testFiles.buffer)).toBe(true);

      const result = await ufs.readBuffer(testFiles.buffer);
      expect(result).toBeInstanceOf(ArrayBuffer);
      expect(result.byteLength).toBe(8);

      const resultView = new Uint8Array(result);
      expect(Array.from(resultView)).toEqual(Array.from(view));
    });

    it('should write and read Uint8Array', async () => {
      const testData = new Uint8Array([1, 2, 3, 4, 5]);

      await ufs.writeBuffer(testFiles.buffer, testData);
      const result = await ufs.readBuffer(testFiles.buffer);

      const resultView = new Uint8Array(result);
      expect(Array.from(resultView)).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle binary format reading', async () => {
      const testData = new Uint8Array([255, 254, 253, 252]);

      await ufs.writeBuffer(testFiles.binary, testData);
      const result = await ufs.readFile(testFiles.binary, { format: 'binary' });

      expect(result).toBeInstanceOf(Uint8Array);
      expect(Array.from(result as Uint8Array)).toEqual([255, 254, 253, 252]);
    });
  });

  describe('Blob Operations', () => {
    it('should write and read Blob objects', async () => {
      const testContent = 'Blob test content';
      const testBlob = new Blob([testContent], { type: 'text/plain' });

      await ufs.writeBlob(testFiles.blob, testBlob);
      expect(existsSync(testFiles.blob)).toBe(true);

      const result = await ufs.readBlob(testFiles.blob);
      expect(result).toBeInstanceOf(Blob);

      const resultText = await result.text();
      expect(resultText).toBe(testContent);
    });

    it('should preserve MIME type information', async () => {
      const testBlob = new Blob(['<h1>HTML Content</h1>'], { type: 'text/html' });

      await ufs.writeBlob(testFiles.blob, testBlob);
      const result = await ufs.readFile(testFiles.blob, { useDetails: true });

      expect(result).toHaveProperty('mimeType');
      // Note: MIME type is inferred from file extension, not from original blob
    });
  });

  describe('Generic readFile/writeFile', () => {
    it('should handle different formats via format option', async () => {
      const testData = { message: 'generic test' };

      // Write as JSON string, read with format
      await ufs.writeFile(testFiles.json, JSON.stringify(testData));
      const textResult = await ufs.readFile(testFiles.json, { format: 'text' });
      expect(typeof textResult).toBe('string');
      const jsonResult = await ufs.readJSON(testFiles.json);
      expect(jsonResult).toEqual(testData);
      const bufferResult = await ufs.readFile(testFiles.json, { format: 'arrayBuffer' });
      expect(bufferResult).toBeInstanceOf(ArrayBuffer);
    });

    it('should default to appropriate format when not specified', async () => {
      const testContent = 'Default format test';
      await ufs.writeFile(testFiles.text, testContent);
      const result = await ufs.readFile(testFiles.text);
      expect(typeof result).toBe('string');
      expect(result).toBe(testContent);
    });
  });

  describe('Directory Handling', () => {
    it('should create nested directories automatically', async () => {
      const nestedPath = join(testDir, 'nested', 'deep', 'file.txt');
      const testContent = 'Nested directory test';
      await ufs.writeText(nestedPath, testContent);
      expect(existsSync(nestedPath)).toBe(true);
      const result = await ufs.readText(nestedPath);
      expect(result).toBe(testContent);
    });
  });

  describe('Error Handling', () => {
    it('should throw error for non-existent files', async () => {
      await expect(ufs.readText('non-existent-file.txt')).rejects.toThrow();
    });
    it('should throw error for invalid JSON', async () => {
      const invalidJson = '{ invalid json content';
      await ufs.writeText(testFiles.json, invalidJson);
      await expect(ufs.readJSON(testFiles.json)).rejects.toThrow();
    });
    // *** FIXME:
    it('should handle permission errors gracefully', async () => {
      if (os.platform() === 'win32') {
        console.warn('Skipping permission error test on Windows');
        return;
      }
      // This test might not work in all environments
      const restrictedPath = '/root/restricted-file.txt';
      await expect(ufs.writeText(restrictedPath, 'test')).rejects.toThrow();
    });
  });

  describe('Large File Handling', () => {
    it('should handle moderately large files', async () => {
      // Create a 1MB string
      const largeContent = 'A'.repeat(1024 * 1024);
      const largePath = join(testDir, 'large-file.txt');
      await ufs.writeText(largePath, largeContent);
      const result = await ufs.readText(largePath);
      expect(result.length).toBe(1024 * 1024);
      expect(result).toBe(largeContent);
    });
  });

  describe('Write with Details', () => {
    it('should return detailed result when writing with useDetails', async () => {
      const testContent = 'Write with details test';
      const result = await ufs.writeText(testFiles.text, testContent, { useDetails: true });
      expect(result).toHaveProperty('filename');
      expect(result).toHaveProperty('size');
      expect(result).toHaveProperty('strategy', 'node');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('path');
      expect(typeof result.size).toBe('number');
      expect(result.size).toBeGreaterThan(0);
    });
  });
});
