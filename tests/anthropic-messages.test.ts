import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ZaguanClient } from '../src/index.js';
import {
  MessagesRequest,
  MessagesResponse,
  AnthropicMessage,
} from '../src/types.js';

describe('Anthropic Messages API', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('messages()', () => {
    it('should send a message request to the Messages API', async () => {
      const client = new ZaguanClient({
        baseUrl: 'https://api.zaguan.example.com',
        apiKey: 'test-key',
        fetch: mockFetch as any,
      });

      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Map([['X-Request-Id', 'test-request-id']]),
        text: vi.fn().mockResolvedValue(
          JSON.stringify({
            id: 'msg_123',
            type: 'message',
            role: 'assistant',
            content: [
              {
                type: 'text',
                text: 'Hello! How can I help you today?',
              },
            ],
            model: 'claude-3-opus-20240229',
            stop_reason: 'end_turn',
            usage: {
              input_tokens: 10,
              output_tokens: 20,
            },
          })
        ),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const request: MessagesRequest = {
        model: 'claude-3-opus-20240229',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: 'Hello!',
          },
        ],
      };

      const response = await client.messages(request);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.zaguan.example.com/v1/messages',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-key',
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(request),
        })
      );

      expect(response).toEqual(
        expect.objectContaining({
          id: 'msg_123',
          type: 'message',
          role: 'assistant',
        })
      );
    });

    it('should support extended thinking configuration', async () => {
      const client = new ZaguanClient({
        baseUrl: 'https://api.zaguan.example.com',
        apiKey: 'test-key',
        fetch: mockFetch as any,
      });

      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Map(),
        text: vi.fn().mockResolvedValue(
          JSON.stringify({
            id: 'msg_123',
            type: 'message',
            role: 'assistant',
            content: [
              {
                type: 'thinking',
                thinking: 'Let me think about this...',
                signature: 'sig_abc',
              },
              {
                type: 'text',
                text: 'Based on my analysis...',
              },
            ],
            model: 'claude-3-opus-20240229',
            stop_reason: 'end_turn',
            usage: {
              input_tokens: 10,
              output_tokens: 50,
            },
          })
        ),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const request: MessagesRequest = {
        model: 'claude-3-opus-20240229',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: 'Solve this complex problem...',
          },
        ],
        thinking: {
          type: 'enabled',
          budget_tokens: 5000,
        },
      };

      const response = await client.messages(request);

      expect(response.content).toHaveLength(2);
      expect(response.content[0]?.type).toBe('thinking');
      expect(response.content[1]?.type).toBe('text');
    });
  });

  describe('countTokens()', () => {
    it('should count tokens for a message request', async () => {
      const client = new ZaguanClient({
        baseUrl: 'https://api.zaguan.example.com',
        apiKey: 'test-key',
        fetch: mockFetch as any,
      });

      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Map(),
        text: vi.fn().mockResolvedValue(
          JSON.stringify({
            input_tokens: 15,
          })
        ),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const response = await client.countTokens({
        model: 'claude-3-opus-20240229',
        messages: [
          {
            role: 'user',
            content: 'Hello, how are you?',
          },
        ],
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.zaguan.example.com/v1/messages/count_tokens',
        expect.objectContaining({
          method: 'POST',
        })
      );

      expect(response.input_tokens).toBe(15);
    });
  });

  describe('createMessagesBatch()', () => {
    it('should create a batch of message requests', async () => {
      const client = new ZaguanClient({
        baseUrl: 'https://api.zaguan.example.com',
        apiKey: 'test-key',
        fetch: mockFetch as any,
      });

      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Map(),
        text: vi.fn().mockResolvedValue(
          JSON.stringify({
            id: 'batch_123',
            type: 'message_batch',
            processing_status: 'in_progress',
            request_counts: {
              processing: 2,
              succeeded: 0,
              errored: 0,
              canceled: 0,
              expired: 0,
            },
            created_at: '2024-01-01T00:00:00Z',
            expires_at: '2024-01-02T00:00:00Z',
          })
        ),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const response = await client.createMessagesBatch([
        {
          custom_id: 'req_1',
          params: {
            model: 'claude-3-opus-20240229',
            max_tokens: 1024,
            messages: [{ role: 'user', content: 'Hello 1' }],
          },
        },
        {
          custom_id: 'req_2',
          params: {
            model: 'claude-3-opus-20240229',
            max_tokens: 1024,
            messages: [{ role: 'user', content: 'Hello 2' }],
          },
        },
      ]);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.zaguan.example.com/v1/messages/batches',
        expect.objectContaining({
          method: 'POST',
        })
      );

      expect(response.id).toBe('batch_123');
      expect(response.processing_status).toBe('in_progress');
    });
  });

  describe('getMessagesBatch()', () => {
    it('should retrieve a batch by ID', async () => {
      const client = new ZaguanClient({
        baseUrl: 'https://api.zaguan.example.com',
        apiKey: 'test-key',
        fetch: mockFetch as any,
      });

      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Map(),
        text: vi.fn().mockResolvedValue(
          JSON.stringify({
            id: 'batch_123',
            type: 'message_batch',
            processing_status: 'ended',
            request_counts: {
              processing: 0,
              succeeded: 2,
              errored: 0,
              canceled: 0,
              expired: 0,
            },
            created_at: '2024-01-01T00:00:00Z',
            expires_at: '2024-01-02T00:00:00Z',
            ended_at: '2024-01-01T01:00:00Z',
            results_url: 'https://example.com/results',
          })
        ),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const response = await client.getMessagesBatch('batch_123');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.zaguan.example.com/v1/messages/batches/batch_123',
        expect.objectContaining({
          method: 'GET',
        })
      );

      expect(response.processing_status).toBe('ended');
      expect(response.request_counts.succeeded).toBe(2);
    });
  });

  describe('cancelMessagesBatch()', () => {
    it('should cancel a batch', async () => {
      const client = new ZaguanClient({
        baseUrl: 'https://api.zaguan.example.com',
        apiKey: 'test-key',
        fetch: mockFetch as any,
      });

      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Map(),
        text: vi.fn().mockResolvedValue(
          JSON.stringify({
            id: 'batch_123',
            type: 'message_batch',
            processing_status: 'canceling',
            request_counts: {
              processing: 1,
              succeeded: 0,
              errored: 0,
              canceled: 1,
              expired: 0,
            },
            created_at: '2024-01-01T00:00:00Z',
            expires_at: '2024-01-02T00:00:00Z',
          })
        ),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const response = await client.cancelMessagesBatch('batch_123');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.zaguan.example.com/v1/messages/batches/batch_123/cancel',
        expect.objectContaining({
          method: 'POST',
        })
      );

      expect(response.processing_status).toBe('canceling');
    });
  });
});
