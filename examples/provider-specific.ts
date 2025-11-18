/**
 * Example: Provider-Specific Parameters
 *
 * This example demonstrates how to use provider-specific features
 * through the provider_specific_params field.
 */

import { ZaguanClient } from '@zaguan_ai/sdk';

async function providerSpecificDemo() {
  const apiKey = process.env.ZAGUAN_API_KEY || 'your-api-key-from-zaguanai.com';
  
  if (apiKey === 'your-api-key-from-zaguanai.com') {
    console.error('Error: Please set ZAGUAN_API_KEY environment variable');
    process.exit(1);
  }

  const client = new ZaguanClient({
    baseUrl: process.env.ZAGUAN_BASE_URL || 'https://api.zaguanai.com/',
    apiKey,
  });

  const complexProblem = 'Solve this step by step: If a train travels at 80 km/h for 2.5 hours, then at 100 km/h for 1.5 hours, what is the total distance traveled?';

  try {
    // Example 1: Google Gemini with Reasoning Control
    console.log('=== Google Gemini with High Reasoning Effort ===\n');
    
    const geminiResponse = await client.chat({
      model: 'google/gemini-2.0-flash-thinking-exp',
      messages: [{ role: 'user', content: complexProblem }],
      provider_specific_params: {
        reasoning_effort: 'high',
        thinking_budget: 10000,
        include_thinking: true,
      },
    });

    console.log('Response:', geminiResponse.choices[0].message.content);
    
    if (geminiResponse.usage.completion_tokens_details?.reasoning_tokens) {
      console.log(`\nReasoning tokens used: ${geminiResponse.usage.completion_tokens_details.reasoning_tokens}`);
    }
    console.log();

    // Example 2: Anthropic Claude with Extended Thinking
    console.log('=== Anthropic Claude with Extended Thinking ===\n');
    
    const claudeResponse = await client.chat({
      model: 'anthropic/claude-3-5-sonnet',
      messages: [{ role: 'user', content: complexProblem }],
      provider_specific_params: {
        thinking: {
          type: 'enabled',
          budget_tokens: 5000,
        },
      },
    });

    console.log('Response:', claudeResponse.choices[0].message.content);
    
    if (claudeResponse.usage.completion_tokens_details?.reasoning_tokens) {
      console.log(`\nReasoning tokens used: ${claudeResponse.usage.completion_tokens_details.reasoning_tokens}`);
    }
    console.log();

    // Example 3: Perplexity with Search
    console.log('=== Perplexity with Web Search ===\n');
    
    const perplexityResponse = await client.chat({
      model: 'perplexity/sonar-reasoning',
      messages: [{ role: 'user', content: 'What are the latest developments in quantum computing?' }],
      provider_specific_params: {
        search_domain_filter: ['arxiv.org', 'nature.com'],
        return_citations: true,
        return_related_questions: true,
        search_recency_filter: 'month',
      },
    });

    console.log('Response:', perplexityResponse.choices[0].message.content);
    console.log();

    // Example 4: DeepSeek with Thinking Control
    console.log('=== DeepSeek with Thinking Disabled ===\n');
    
    const deepseekResponse = await client.chat({
      model: 'deepseek/deepseek-chat',
      messages: [{ role: 'user', content: 'Explain quantum entanglement simply.' }],
      thinking: false, // Disable <think> tags
    });

    console.log('Response:', deepseekResponse.choices[0].message.content);
    console.log();

    // Example 5: OpenAI with Reasoning Effort
    console.log('=== OpenAI o1 with High Reasoning Effort ===\n');
    
    const o1Response = await client.chat({
      model: 'openai/o1',
      messages: [{ role: 'user', content: complexProblem }],
      reasoning_effort: 'high', // 'minimal', 'low', 'medium', 'high'
    });

    console.log('Response:', o1Response.choices[0].message.content);
    
    if (o1Response.usage.completion_tokens_details?.reasoning_tokens) {
      console.log(`\nReasoning tokens used: ${o1Response.usage.completion_tokens_details.reasoning_tokens}`);
    }
    console.log();

    // Example 6: Alibaba Qwen with Thinking Control
    console.log('=== Alibaba Qwen with Thinking Enabled ===\n');
    
    const qwenResponse = await client.chat({
      model: 'alibaba/qwen-2.5-72b-instruct',
      messages: [{ role: 'user', content: complexProblem }],
      provider_specific_params: {
        enable_thinking: true,
        thinking_budget: 8000,
      },
    });

    console.log('Response:', qwenResponse.choices[0].message.content);
    console.log();

    // Example 7: xAI Grok with Structured Output
    console.log('=== xAI Grok with JSON Schema ===\n');
    
    const grokResponse = await client.chat({
      model: 'xai/grok-2',
      messages: [{ role: 'user', content: 'List 3 programming languages with their primary use cases.' }],
      provider_specific_params: {
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'programming_languages',
            schema: {
              type: 'object',
              properties: {
                languages: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      use_case: { type: 'string' },
                    },
                    required: ['name', 'use_case'],
                  },
                },
              },
              required: ['languages'],
            },
          },
        },
      },
    });

    console.log('Response:', grokResponse.choices[0].message.content);
    console.log();

    // Example 8: Comparing reasoning across providers
    console.log('=== Comparing Reasoning Across Providers ===\n');
    
    const providers = [
      { model: 'openai/o1-mini', name: 'OpenAI o1-mini' },
      { model: 'google/gemini-2.0-flash-thinking-exp', name: 'Google Gemini Thinking' },
      { model: 'deepseek/deepseek-reasoner', name: 'DeepSeek Reasoner' },
    ];

    for (const provider of providers) {
      try {
        const response = await client.chat({
          model: provider.model,
          messages: [{ role: 'user', content: 'What is 15% of 240?' }],
          max_tokens: 100,
        });

        console.log(`${provider.name}:`);
        console.log(`  Answer: ${response.choices[0].message.content}`);
        console.log(`  Total tokens: ${response.usage.total_tokens}`);
        
        if (response.usage.completion_tokens_details?.reasoning_tokens) {
          console.log(`  Reasoning tokens: ${response.usage.completion_tokens_details.reasoning_tokens}`);
        }
        console.log();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.log(`${provider.name}: Error - ${message}\n`);
      }
    }

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error:', message);
  }
}

// Run the example
providerSpecificDemo();
