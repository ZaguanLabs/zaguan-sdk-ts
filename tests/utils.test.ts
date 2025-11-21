import { describe, it, expect } from 'vitest';
import { generateUUID, createHeaders } from '../src/utils.js';

describe('Utils', () => {
  describe('generateUUID', () => {
    it('should generate a valid UUID v4 format', () => {
      const uuid = generateUUID();

      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuid).toMatch(uuidRegex);
    });

    it('should generate unique UUIDs', () => {
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();
      const uuid3 = generateUUID();

      expect(uuid1).not.toBe(uuid2);
      expect(uuid2).not.toBe(uuid3);
      expect(uuid1).not.toBe(uuid3);
    });

    it('should generate UUIDs of correct length', () => {
      const uuid = generateUUID();
      expect(uuid).toHaveLength(36); // 32 hex chars + 4 hyphens
    });
  });

  describe('createHeaders', () => {
    it('should create headers with API key and request ID', () => {
      const headers = createHeaders('test-api-key', 'test-request-id');

      expect(headers).toEqual({
        Authorization: 'Bearer test-api-key',
        'Content-Type': 'application/json',
        'X-Request-Id': 'test-request-id',
      });
    });

    it('should merge additional headers', () => {
      const headers = createHeaders('test-api-key', 'test-request-id', {
        'X-Custom-Header': 'custom-value',
        'X-Another-Header': 'another-value',
      });

      expect(headers).toEqual({
        Authorization: 'Bearer test-api-key',
        'Content-Type': 'application/json',
        'X-Request-Id': 'test-request-id',
        'X-Custom-Header': 'custom-value',
        'X-Another-Header': 'another-value',
      });
    });

    it('should allow additional headers to override defaults', () => {
      const headers = createHeaders('test-api-key', 'test-request-id', {
        'Content-Type': 'application/xml',
      });

      expect(headers['Content-Type']).toBe('application/xml');
    });

    it('should handle empty additional headers', () => {
      const headers = createHeaders('test-api-key', 'test-request-id', {});

      expect(headers).toEqual({
        Authorization: 'Bearer test-api-key',
        'Content-Type': 'application/json',
        'X-Request-Id': 'test-request-id',
      });
    });

    it('should handle undefined additional headers', () => {
      const headers = createHeaders(
        'test-api-key',
        'test-request-id',
        undefined
      );

      expect(headers).toEqual({
        Authorization: 'Bearer test-api-key',
        'Content-Type': 'application/json',
        'X-Request-Id': 'test-request-id',
      });
    });
  });
});
