import { describe, it, expect } from 'vitest';
import { ZaguanClient } from '../src/index.js';
import { ChatChunk } from '../src/types.js';

describe('Helper Methods', () => {
  describe('reconstructMessageFromChunks()', () => {
    it('should reconstruct a complete message from streaming chunks', () => {
      const chunks: ChatChunk[] = [
        {
          id: 'chatcmpl-123',
          object: 'chat.completion.chunk',
          created: 1234567890,
          model: 'openai/gpt-4o-mini',
          choices: [
            {
              index: 0,
              delta: {
                role: 'assistant',
                content: 'Hello',
              },
            },
          ],
        },
        {
          id: 'chatcmpl-123',
          object: 'chat.completion.chunk',
          created: 1234567890,
          model: 'openai/gpt-4o-mini',
          choices: [
            {
              index: 0,
              delta: {
                role: 'assistant',
                content: ', world',
              },
            },
          ],
        },
        {
          id: 'chatcmpl-123',
          object: 'chat.completion.chunk',
          created: 1234567890,
          model: 'openai/gpt-4o-mini',
          choices: [
            {
              index: 0,
              delta: {
                role: 'assistant',
                content: '!',
              },
              finish_reason: 'stop',
            },
          ],
        },
      ];

      const result = ZaguanClient.reconstructMessageFromChunks(chunks);

      expect(result.id).toBe('chatcmpl-123');
      expect(result.model).toBe('openai/gpt-4o-mini');
      expect(result.choices[0]?.message?.content).toBe('Hello, world!');
      expect(result.choices[0]?.message?.role).toBe('assistant');
      expect(result.choices[0]?.finish_reason).toBe('stop');
    });

    it('should handle tool calls in streaming chunks', () => {
      const chunks: ChatChunk[] = [
        {
          id: 'chatcmpl-123',
          object: 'chat.completion.chunk',
          created: 1234567890,
          model: 'openai/gpt-4o-mini',
          choices: [
            {
              index: 0,
              delta: {
                role: 'assistant',
                content: '',
                tool_calls: [
                  {
                    id: 'call_123',
                    type: 'function',
                    function: {
                      name: 'get_weather',
                      arguments: '{"location": "San Francisco"}',
                    },
                  },
                ],
              },
            },
          ],
        },
        {
          id: 'chatcmpl-123',
          object: 'chat.completion.chunk',
          created: 1234567890,
          model: 'openai/gpt-4o-mini',
          choices: [
            {
              index: 0,
              delta: {
                role: 'assistant',
                content: '',
              },
              finish_reason: 'tool_calls',
            },
          ],
        },
      ];

      const result = ZaguanClient.reconstructMessageFromChunks(chunks);

      expect(result.choices[0]?.message?.tool_calls).toHaveLength(1);
      expect(result.choices[0]?.message?.tool_calls?.[0]?.function.name).toBe(
        'get_weather'
      );
      expect(result.choices[0]?.finish_reason).toBe('tool_calls');
    });

    it('should throw error for empty chunks array', () => {
      expect(() => {
        ZaguanClient.reconstructMessageFromChunks([]);
      }).toThrow('Cannot reconstruct message from empty chunks array');
    });
  });

  describe('extractPerplexityThinking()', () => {
    it('should extract thinking content from Perplexity responses', () => {
      const content =
        '<think>Let me analyze this problem step by step...</think>Based on my analysis, the answer is 42.';

      const result = ZaguanClient.extractPerplexityThinking(content);

      expect(result.thinking).toBe(
        'Let me analyze this problem step by step...'
      );
      expect(result.response).toBe('Based on my analysis, the answer is 42.');
    });

    it('should handle multiple thinking blocks', () => {
      const content =
        '<think>First thought</think>Some text<think>Second thought</think>Final answer';

      const result = ZaguanClient.extractPerplexityThinking(content);

      expect(result.thinking).toBe('First thought\n\nSecond thought');
      expect(result.response).toBe('Some textFinal answer');
    });

    it('should return null thinking when no think tags present', () => {
      const content = 'Just a regular response without thinking.';

      const result = ZaguanClient.extractPerplexityThinking(content);

      expect(result.thinking).toBeNull();
      expect(result.response).toBe('Just a regular response without thinking.');
    });

    it('should handle nested content in think tags', () => {
      const content =
        '<think>Step 1: Analyze\nStep 2: Conclude</think>The answer is correct.';

      const result = ZaguanClient.extractPerplexityThinking(content);

      expect(result.thinking).toBe('Step 1: Analyze\nStep 2: Conclude');
      expect(result.response).toBe('The answer is correct.');
    });
  });

  describe('hasReasoningTokens()', () => {
    it('should return true when reasoning tokens are present', () => {
      const usage = {
        prompt_tokens: 10,
        completion_tokens: 100,
        total_tokens: 110,
        completion_tokens_details: {
          reasoning_tokens: 50,
        },
      };

      expect(ZaguanClient.hasReasoningTokens(usage)).toBe(true);
    });

    it('should return false when reasoning tokens are zero', () => {
      const usage = {
        prompt_tokens: 10,
        completion_tokens: 100,
        total_tokens: 110,
        completion_tokens_details: {
          reasoning_tokens: 0,
        },
      };

      expect(ZaguanClient.hasReasoningTokens(usage)).toBe(false);
    });

    it('should return false when reasoning tokens are undefined', () => {
      const usage = {
        prompt_tokens: 10,
        completion_tokens: 100,
        total_tokens: 110,
        completion_tokens_details: {},
      };

      expect(ZaguanClient.hasReasoningTokens(usage)).toBe(false);
    });

    it('should return false when completion_tokens_details is undefined', () => {
      const usage = {};

      expect(ZaguanClient.hasReasoningTokens(usage)).toBe(false);
    });
  });
});
