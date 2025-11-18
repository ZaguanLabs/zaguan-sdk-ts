import { describe, it, expect, vi } from 'vitest';
import { ZaguanClient } from '../src/index.js';
import { ChatRequest, ChatResponse, ModelInfo, ModelCapabilities } from '../src/types.js';

describe('ZaguanClient', () => {
  // Mock fetch implementation
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a client with the correct configuration', () => {
    const client = new ZaguanClient({
      baseUrl: 'https://api.zaguan.example.com',
      apiKey: 'test-key'
    });

    expect(client).toBeInstanceOf(ZaguanClient);
  });

  it('should handle trailing slashes in baseUrl', () => {
    const client = new ZaguanClient({
      baseUrl: 'https://api.zaguan.example.com/',
      apiKey: 'test-key'
    });

    // We can't easily test the private property, but we can test that it doesn't crash
    expect(client).toBeInstanceOf(ZaguanClient);
  });

  it('should make a chat request with correct parameters', async () => {
    const client = new ZaguanClient({
      baseUrl: 'https://api.zaguan.example.com',
      apiKey: 'test-key',
      fetch: mockFetch as any
    });

    // Mock response
    const mockResponse = {
      ok: true,
      status: 200,
      headers: new Map(),
      text: vi.fn().mockResolvedValue(JSON.stringify({
        id: 'test-id',
        object: 'chat.completion',
        created: Date.now(),
        model: 'openai/gpt-4o-mini',
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: 'Hello, world!'
          },
          finish_reason: 'stop'
        }],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 5,
          total_tokens: 15
        }
      }))
    };

    mockFetch.mockResolvedValue(mockResponse);

    const request: ChatRequest = {
      model: 'openai/gpt-4o-mini',
      messages: [
        { role: 'user', content: 'Hello, world!' }
      ]
    };

    const response = await client.chat(request);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.zaguan.example.com/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-key',
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify(request)
      })
    );

    expect(response).toEqual(expect.objectContaining({
      id: 'test-id',
      model: 'openai/gpt-4o-mini'
    }));
  });

  it('should list models correctly', async () => {
    const client = new ZaguanClient({
      baseUrl: 'https://api.zaguan.example.com',
      apiKey: 'test-key',
      fetch: mockFetch as any
    });

    // Mock response
    const mockResponse = {
      ok: true,
      status: 200,
      headers: new Map(),
      text: vi.fn().mockResolvedValue(JSON.stringify({
        data: [
          {
            id: 'openai/gpt-4o-mini',
            object: 'model',
            owned_by: 'openai'
          }
        ]
      }))
    };

    mockFetch.mockResolvedValue(mockResponse);

    const models = await client.listModels();

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.zaguan.example.com/v1/models',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-key',
          'Content-Type': 'application/json'
        })
      })
    );

    expect(models).toEqual([
      expect.objectContaining({
        id: 'openai/gpt-4o-mini'
      })
    ]);
  });

  it('should get capabilities correctly', async () => {
    const client = new ZaguanClient({
      baseUrl: 'https://api.zaguan.example.com',
      apiKey: 'test-key',
      fetch: mockFetch as any
    });

    // Mock response
    const mockResponse = {
      ok: true,
      status: 200,
      headers: new Map(),
      text: vi.fn().mockResolvedValue(JSON.stringify([
        {
          model_id: 'openai/gpt-4o-mini',
          supports_vision: false,
          supports_tools: true,
          supports_reasoning: false
        }
      ]))
    };

    mockFetch.mockResolvedValue(mockResponse);

    const capabilities = await client.getCapabilities();

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.zaguan.example.com/v1/capabilities',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-key',
          'Content-Type': 'application/json'
        })
      })
    );

    expect(capabilities).toEqual([
      expect.objectContaining({
        model_id: 'openai/gpt-4o-mini',
        supports_tools: true
      })
    ]);
  });
});