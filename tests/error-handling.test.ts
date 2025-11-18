import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ZaguanClient } from '../src/index.js';
import {
  APIError,
  RateLimitError,
  InsufficientCreditsError,
  BandAccessDeniedError,
} from '../src/errors.js';

describe('Error Handling', () => {
  const mockFetch = vi.fn();
  let client: ZaguanClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new ZaguanClient({
      baseUrl: 'https://api.example.com',
      apiKey: 'test-key',
      fetch: mockFetch as any,
    });
  });

  describe('HTTP Error Responses', () => {
    it('should throw APIError for 401 Unauthorized', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        headers: new Map([['X-Request-Id', 'test-request-id']]),
        text: vi.fn().mockResolvedValue(
          JSON.stringify({
            error: { message: 'Invalid API key' },
          })
        ),
      });

      await expect(
        client.chat({
          model: 'test-model',
          messages: [{ role: 'user', content: 'test' }],
        })
      ).rejects.toThrow(APIError);
    });

    it('should throw RateLimitError for 429 with retry-after header', async () => {
      const headers = new Map();
      headers.set('X-Request-Id', 'test-request-id');
      headers.set('Retry-After', '60');

      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        headers: {
          get: (key: string) => headers.get(key) || null,
        },
        text: vi.fn().mockResolvedValue(
          JSON.stringify({
            error: { message: 'Rate limit exceeded' },
          })
        ),
      });

      try {
        await client.chat({
          model: 'test-model',
          messages: [{ role: 'user', content: 'test' }],
        });
        expect.fail('Should have thrown RateLimitError');
      } catch (error) {
        expect(error).toBeInstanceOf(RateLimitError);
        if (error instanceof RateLimitError) {
          expect(error.retryAfter).toBe(60);
        }
      }
    });

    it('should throw InsufficientCreditsError for 402', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 402,
        statusText: 'Payment Required',
        headers: new Map([['X-Request-Id', 'test-request-id']]),
        text: vi.fn().mockResolvedValue(
          JSON.stringify({
            error: {
              message: 'Insufficient credits',
              credits_required: 100,
              credits_remaining: 50,
              reset_date: '2024-01-01',
            },
          })
        ),
      });

      try {
        await client.chat({
          model: 'test-model',
          messages: [{ role: 'user', content: 'test' }],
        });
        expect.fail('Should have thrown InsufficientCreditsError');
      } catch (error) {
        expect(error).toBeInstanceOf(InsufficientCreditsError);
        if (error instanceof InsufficientCreditsError) {
          expect(error.creditsRequired).toBe(100);
          expect(error.creditsRemaining).toBe(50);
          expect(error.resetDate).toBe('2024-01-01');
        }
      }
    });

    it('should throw BandAccessDeniedError for 403 with band_access_denied type', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        headers: new Map([['X-Request-Id', 'test-request-id']]),
        text: vi.fn().mockResolvedValue(
          JSON.stringify({
            error: {
              type: 'band_access_denied',
              message: 'Band access denied',
              band: 'premium',
              required_tier: 'enterprise',
              current_tier: 'free',
            },
          })
        ),
      });

      try {
        await client.chat({
          model: 'test-model',
          messages: [{ role: 'user', content: 'test' }],
        });
        expect.fail('Should have thrown BandAccessDeniedError');
      } catch (error) {
        expect(error).toBeInstanceOf(BandAccessDeniedError);
        if (error instanceof BandAccessDeniedError) {
          expect(error.band).toBe('premium');
          expect(error.requiredTier).toBe('enterprise');
          expect(error.currentTier).toBe('free');
        }
      }
    });

    it('should throw generic APIError for 403 without band_access_denied type', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        headers: new Map([['X-Request-Id', 'test-request-id']]),
        text: vi.fn().mockResolvedValue(
          JSON.stringify({
            error: { message: 'Access denied' },
          })
        ),
      });

      await expect(
        client.chat({
          model: 'test-model',
          messages: [{ role: 'user', content: 'test' }],
        })
      ).rejects.toThrow(APIError);
    });

    it('should handle malformed error responses gracefully', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Map(),
        text: vi.fn().mockResolvedValue('Not valid JSON'),
      });

      try {
        await client.chat({
          model: 'test-model',
          messages: [{ role: 'user', content: 'test' }],
        });
        expect.fail('Should have thrown APIError');
      } catch (error) {
        expect(error).toBeInstanceOf(APIError);
        if (error instanceof APIError) {
          expect(error.message).toContain('500');
        }
      }
    });

    it('should handle empty error responses', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Map(),
        text: vi.fn().mockResolvedValue(''),
      });

      try {
        await client.chat({
          model: 'test-model',
          messages: [{ role: 'user', content: 'test' }],
        });
        expect.fail('Should have thrown APIError');
      } catch (error) {
        expect(error).toBeInstanceOf(APIError);
        if (error instanceof APIError) {
          expect(error.statusCode).toBe(500);
        }
      }
    });
  });

  describe('Error Properties', () => {
    it('should include request ID in errors when available', async () => {
      const headers = new Map();
      headers.set('X-Request-Id', 'test-request-123');

      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        headers: {
          get: (key: string) => headers.get(key) || null,
        },
        text: vi.fn().mockResolvedValue(
          JSON.stringify({
            error: { message: 'Invalid API key' },
          })
        ),
      });

      try {
        await client.chat({
          model: 'test-model',
          messages: [{ role: 'user', content: 'test' }],
        });
        expect.fail('Should have thrown APIError');
      } catch (error) {
        expect(error).toBeInstanceOf(APIError);
        if (error instanceof APIError) {
          expect(error.requestId).toBe('test-request-123');
        }
      }
    });

    it('should have proper error names', () => {
      const apiError = new APIError(500, 'Test error');
      expect(apiError.name).toBe('APIError');

      const rateLimitError = new RateLimitError('Test error', 429);
      expect(rateLimitError.name).toBe('RateLimitError');

      const creditsError = new InsufficientCreditsError('Test error', 402);
      expect(creditsError.name).toBe('InsufficientCreditsError');

      const bandError = new BandAccessDeniedError('Test error', 403);
      expect(bandError.name).toBe('BandAccessDeniedError');
    });
  });
});
