import { describe, it, expect } from 'vitest';
import { ZaguanClient } from '../src/index.js';
import { ZaguanError } from '../src/errors.js';

describe('Input Validation', () => {
  describe('ZaguanClient constructor', () => {
    it('should throw error if baseUrl is missing', () => {
      expect(() => {
        new ZaguanClient({
          baseUrl: '',
          apiKey: 'test-key',
        });
      }).toThrow(ZaguanError);
    });

    it('should throw error if baseUrl is not a string', () => {
      expect(() => {
        new ZaguanClient({
          baseUrl: 123 as any,
          apiKey: 'test-key',
        });
      }).toThrow(ZaguanError);
    });

    it('should throw error if baseUrl is not a valid URL', () => {
      expect(() => {
        new ZaguanClient({
          baseUrl: 'not-a-valid-url',
          apiKey: 'test-key',
        });
      }).toThrow(ZaguanError);
    });

    it('should throw error if apiKey is missing', () => {
      expect(() => {
        new ZaguanClient({
          baseUrl: 'https://api.example.com',
          apiKey: '',
        });
      }).toThrow(ZaguanError);
    });

    it('should throw error if apiKey is not a string', () => {
      expect(() => {
        new ZaguanClient({
          baseUrl: 'https://api.example.com',
          apiKey: 123 as any,
        });
      }).toThrow(ZaguanError);
    });

    it('should throw error if timeoutMs is not a positive number', () => {
      expect(() => {
        new ZaguanClient({
          baseUrl: 'https://api.example.com',
          apiKey: 'test-key',
          timeoutMs: -1,
        });
      }).toThrow(ZaguanError);

      expect(() => {
        new ZaguanClient({
          baseUrl: 'https://api.example.com',
          apiKey: 'test-key',
          timeoutMs: 0,
        });
      }).toThrow(ZaguanError);
    });

    it('should accept valid configuration', () => {
      expect(() => {
        new ZaguanClient({
          baseUrl: 'https://api.example.com',
          apiKey: 'test-key',
        });
      }).not.toThrow();

      expect(() => {
        new ZaguanClient({
          baseUrl: 'https://api.example.com/',
          apiKey: 'test-key',
          timeoutMs: 5000,
        });
      }).not.toThrow();
    });
  });

  describe('chat method validation', () => {
    const client = new ZaguanClient({
      baseUrl: 'https://api.example.com',
      apiKey: 'test-key',
    });

    it('should throw error if model is missing', async () => {
      await expect(
        client.chat({
          model: '',
          messages: [{ role: 'user', content: 'test' }],
        })
      ).rejects.toThrow(ZaguanError);
    });

    it('should throw error if model is not a string', async () => {
      await expect(
        client.chat({
          model: 123 as any,
          messages: [{ role: 'user', content: 'test' }],
        })
      ).rejects.toThrow(ZaguanError);
    });

    it('should throw error if messages is empty', async () => {
      await expect(
        client.chat({
          model: 'test-model',
          messages: [],
        })
      ).rejects.toThrow(ZaguanError);
    });

    it('should throw error if messages is not an array', async () => {
      await expect(
        client.chat({
          model: 'test-model',
          messages: 'not-an-array' as any,
        })
      ).rejects.toThrow(ZaguanError);
    });
  });

  describe('chatStream method validation', () => {
    const client = new ZaguanClient({
      baseUrl: 'https://api.example.com',
      apiKey: 'test-key',
    });

    it('should throw error if model is missing', async () => {
      const stream = client.chatStream({
        model: '',
        messages: [{ role: 'user', content: 'test' }],
      });

      await expect(async () => {
        for await (const _ of stream) {
          // Should throw before yielding any chunks
        }
      }).rejects.toThrow(ZaguanError);
    });

    it('should throw error if messages is empty', async () => {
      const stream = client.chatStream({
        model: 'test-model',
        messages: [],
      });

      await expect(async () => {
        for await (const _ of stream) {
          // Should throw before yielding any chunks
        }
      }).rejects.toThrow(ZaguanError);
    });
  });
});
