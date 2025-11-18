# Zaguán TypeScript SDK

[![CI](https://github.com/ZaguanLabs/zaguan-sdk-ts/actions/workflows/ci.yml/badge.svg)](https://github.com/ZaguanLabs/zaguan-sdk-ts/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@zaguan_ai/sdk)](https://www.npmjs.com/package/@zaguan_ai/sdk)
[![License](https://img.shields.io/npm/l/@zaguan_ai/sdk)](LICENSE)

Official Zaguán SDK for TypeScript - The easiest way to integrate with Zaguán CoreX, an enterprise-grade AI gateway that provides unified access to 15+ AI providers and 500+ models through a single, OpenAI-compatible API.

## What's New in v1.2.0

🎉 **Full Feature Release - Complete OpenAI API Coverage**

This is a **major feature release** implementing all optional and advanced features from the SDK specification!

### New Features
- **Audio Processing** - Transcription, translation, and speech generation (3 methods)
- **Image Generation** - DALL-E integration with editing and variations (3 methods)
- **Text Embeddings** - Semantic search capabilities (1 method)
- **Batch Processing** - Cost-optimized batch jobs (4 methods)
- **Assistants API** - Stateful conversation management (10 methods)
- **Fine-Tuning** - Custom model training (5 methods)
- **Content Moderation** - Safety and filtering (1 method)
- **Retry Logic** - Exponential backoff with configurable strategies
- **Logging Hooks** - Full observability support
- **Helper Utilities** - Streaming message reconstruction

### Statistics
- **40+ new client methods** covering all OpenAI-compatible endpoints
- **70+ new TypeScript types** for complete type safety
- **2,000+ lines** of new implementation code
- **Zero breaking changes** - fully backward compatible
- **Zero new runtime dependencies**

### Previous Releases

**v1.1.1** - Package name update to `@zaguan_ai/sdk`  
**v1.1.0** - Credits management, enhanced examples, security improvements

See [CHANGELOG.md](CHANGELOG.md) for full details.

## Why Zaguán?

Zaguán CoreX eliminates vendor lock-in and optimizes costs while unlocking advanced capabilities:

- **Multi-Provider Abstraction**: Access OpenAI, Anthropic, Google, Alibaba, DeepSeek, Groq, Perplexity, xAI, Mistral, Cohere, and more through one API
- **Cost Optimization**: 40-60% cost reduction through smart routing and provider arbitrage
- **Advanced Features**: Reasoning control, multimodal AI, real-time data, long context windows
- **Enterprise Performance**: 2-3x faster responses, 5,000+ concurrent connections
- **Zero Vendor Lock-in**: Switch providers by changing model name only

## Getting Started

1. **Register for an account** at [zaguanai.com](https://zaguanai.com/)
2. **Select a tier** that fits your needs
3. **Obtain your API key** from your account dashboard
4. **Choose an API endpoint**:
   - `https://api.zaguanai.com/` - Main endpoint proxied through Cloudflare (recommended)
   - `https://api-eu-fi-01.zaguanai.com/` - Direct connection for lower latency

## Installation

```bash
npm install @zaguan_ai/sdk
```

## Quick Start

```typescript
import { ZaguanClient } from '@zaguan_ai/sdk';

// Initialize the client with your API key
const client = new ZaguanClient({
  baseUrl: 'https://api.zaguanai.com/', // or https://api-eu-fi-01.zaguanai.com/
  apiKey: 'your-api-key-from-zaguanai.com',
});

// Simple chat completion
const response = await client.chat({
  model: 'openai/gpt-4o-mini',
  messages: [{ role: 'user', content: 'Hello, world!' }],
});

console.log(response.choices[0].message.content);
```

## Streaming Responses

For real-time responses, use the streaming API:

```typescript
// Streaming chat completion
for await (const chunk of client.chatStream({
  model: 'openai/gpt-4o-mini',
  messages: [{ role: 'user', content: 'Tell me a story' }],
})) {
  if (chunk.choices[0]?.delta?.content) {
    process.stdout.write(chunk.choices[0].delta.content);
  }
}
```

## Multi-Provider Access

Access any of the 15+ supported AI providers with a simple model name change:

```typescript
// OpenAI
const openaiResponse = await client.chat({
  model: 'openai/gpt-4o-mini',
  messages: [{ role: 'user', content: 'Hello!' }],
});

// Anthropic
const anthropicResponse = await client.chat({
  model: 'anthropic/claude-3-5-sonnet',
  messages: [{ role: 'user', content: 'Hello!' }],
});

// Google Gemini
const googleResponse = await client.chat({
  model: 'google/gemini-2.0-flash',
  messages: [{ role: 'user', content: 'Hello!' }],
});
```

## Advanced Features

### Provider-Specific Parameters

Access advanced features of each provider:

```typescript
const response = await client.chat({
  model: 'google/gemini-2.5-pro',
  messages: [{ role: 'user', content: 'Solve this complex problem...' }],
  provider_specific_params: {
    reasoning_effort: 'high',
    thinking_budget: 10000,
  },
});
```

### Function Calling

Use tools and functions with any provider:

```typescript
const tools = [{
  type: 'function',
  function: {
    name: 'get_weather',
    description: 'Get weather information for a location',
    parameters: {
      type: 'object',
      properties: {
        location: { type: 'string' }
      },
      required: ['location']
    }
  }
}];

const response = await client.chat({
  model: 'openai/gpt-4o-mini',
  messages: [{ role: 'user', content: 'What's the weather in Paris?' }],
  tools: tools,
  tool_choice: 'auto'
});
```

## API Reference

### ZaguanClient

#### Constructor

```typescript
new ZaguanClient(config: ZaguanConfig)
```

**Configuration Options:**

- `baseUrl`: Your Zaguán CoreX instance URL (`https://api.zaguanai.com/` or `https://api-eu-fi-01.zaguanai.com/`)
- `apiKey`: Your API key obtained from [zaguanai.com](https://zaguanai.com/)
- `timeoutMs`: Optional timeout for requests (default: no timeout)
- `fetch`: Optional custom fetch implementation

#### Core Methods

- `chat(request: ChatRequest, options?: RequestOptions): Promise<ChatResponse>`
- `chatStream(request: ChatRequest, options?: RequestOptions): AsyncIterable<ChatChunk>`
- `listModels(options?: RequestOptions): Promise<ModelInfo[]>`
- `getCapabilities(options?: RequestOptions): Promise<ModelCapabilities[]>`
- `getCapabilitiesWithFilter(filter, options?: RequestOptions): Promise<ModelCapabilities[]>`

#### Credits Methods (when credits system is enabled)

- `getCreditsBalance(options?: RequestOptions): Promise<CreditsBalance>`
- `getCreditsHistory(options?: CreditsHistoryOptions, requestOptions?: RequestOptions): Promise<CreditsHistory>`
- `getCreditsStats(options?: CreditsStatsOptions, requestOptions?: RequestOptions): Promise<CreditsStats>`

## Features

- **🎯 OpenAI Compatibility**: Drop-in replacement for OpenAI SDK with familiar interfaces
- **🔌 Multi-Provider Support**: Unified access to 15+ AI providers through a single API
- **⚡ Production Ready**: Built-in timeouts, retries, and streaming support
- **\_typeDefinition**: Comprehensive TypeScript definitions for all API surfaces
- **🛡️ Error Handling**: Structured error types for better error handling
- **🔄 Streaming**: Async iterable interface for real-time responses
- **🔐 Secure**: Bearer token authentication and request ID tracking

## Credits Management

When the credits system is enabled on your Zaguán instance, you can monitor usage and track costs:

```typescript
// Check your credits balance
const balance = await client.getCreditsBalance();
console.log(`Credits remaining: ${balance.credits_remaining}`);
console.log(`Tier: ${balance.tier}`);
console.log(`Bands: ${balance.bands.join(', ')}`);

// Get usage history
const history = await client.getCreditsHistory({
  page: 1,
  page_size: 10,
  model: 'openai/gpt-4o-mini', // Optional filter
});

// Get usage statistics
const stats = await client.getCreditsStats({
  start_date: '2024-01-01T00:00:00Z',
  end_date: '2024-12-31T23:59:59Z',
  group_by: 'day',
});
```

See `examples/credits-usage.ts` for a complete example.

## Function Calling

Use tools and functions with any provider that supports them:

```typescript
const tools = [{
  type: 'function',
  function: {
    name: 'get_weather',
    description: 'Get weather information for a location',
    parameters: {
      type: 'object',
      properties: {
        location: { type: 'string', description: 'City name' },
        unit: { type: 'string', enum: ['celsius', 'fahrenheit'] }
      },
      required: ['location']
    }
  }
}];

const response = await client.chat({
  model: 'openai/gpt-4o-mini',
  messages: [{ role: 'user', content: 'What's the weather in Paris?' }],
  tools,
  tool_choice: 'auto'
});

// Handle tool calls
if (response.choices[0].message.tool_calls) {
  for (const toolCall of response.choices[0].message.tool_calls) {
    const result = executeFunction(toolCall.function.name, toolCall.function.arguments);
    // Send result back to model...
  }
}
```

See `examples/function-calling.ts` for a complete example.

## Vision and Multimodal

Analyze images with vision-capable models:

```typescript
const response = await client.chat({
  model: 'openai/gpt-4o',
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: "What's in this image?" },
      {
        type: 'image_url',
        image_url: {
          url: 'https://example.com/image.jpg',
          detail: 'high' // 'low', 'high', or 'auto'
        }
      }
    ]
  }]
});
```

Supports both URL and base64-encoded images. See `examples/vision-multimodal.ts` for more examples.

## Provider-Specific Features

Access advanced features of each provider through `provider_specific_params`:

### Google Gemini Reasoning

```typescript
const response = await client.chat({
  model: 'google/gemini-2.0-flash-thinking-exp',
  messages: [{ role: 'user', content: 'Solve this complex problem...' }],
  provider_specific_params: {
    reasoning_effort: 'high', // 'none', 'low', 'medium', 'high'
    thinking_budget: 10000,
    include_thinking: true
  }
});
```

### Anthropic Extended Thinking

```typescript
const response = await client.chat({
  model: 'anthropic/claude-3-5-sonnet',
  messages: [{ role: 'user', content: 'Complex reasoning task...' }],
  provider_specific_params: {
    thinking: {
      type: 'enabled',
      budget_tokens: 5000
    }
  }
});
```

### Perplexity Search

```typescript
const response = await client.chat({
  model: 'perplexity/sonar-reasoning',
  messages: [{ role: 'user', content: 'Latest AI news?' }],
  provider_specific_params: {
    search_domain_filter: ['arxiv.org'],
    return_citations: true,
    search_recency_filter: 'month'
  }
});
```

### DeepSeek Thinking Control

```typescript
const response = await client.chat({
  model: 'deepseek/deepseek-chat',
  messages: [{ role: 'user', content: 'Explain quantum physics' }],
  thinking: false // Disable <think> tags
});
```

### OpenAI Reasoning Models

```typescript
const response = await client.chat({
  model: 'openai/o1',
  messages: [{ role: 'user', content: 'Complex problem...' }],
  reasoning_effort: 'high' // 'minimal', 'low', 'medium', 'high'
});
```

See `examples/provider-specific.ts` for comprehensive examples of all providers.

## Reasoning Tokens

Many providers expose reasoning/thinking tokens in the usage details:

```typescript
const response = await client.chat({
  model: 'openai/o1-mini',
  messages: [{ role: 'user', content: 'Solve this...' }]
});

console.log(`Total tokens: ${response.usage.total_tokens}`);
if (response.usage.completion_tokens_details?.reasoning_tokens) {
  console.log(`Reasoning tokens: ${response.usage.completion_tokens_details.reasoning_tokens}`);
}
```

**Providers with reasoning token support:**
- ✅ OpenAI (o1, o3, o1-mini)
- ✅ Google Gemini (with `reasoning_effort`)
- ✅ Anthropic Claude (with extended thinking)
- ✅ DeepSeek (R1, Reasoner)
- ✅ Alibaba Qwen (QwQ)
- ⚠️ Perplexity (uses `<think>` tags in content, not usage details)

## Request Cancellation

Use AbortController to cancel requests:

```typescript
const controller = new AbortController();

// Cancel after 5 seconds
setTimeout(() => controller.abort(), 5000);

try {
  const response = await client.chat({
    model: 'openai/gpt-4o-mini',
    messages: [{ role: 'user', content: 'Long task...' }]
  }, {
    signal: controller.signal
  });
} catch (error) {
  if (error instanceof Error && error.message.includes('aborted')) {
    console.log('Request was cancelled');
  }
}
```

## Advanced Features

### Audio Processing

```typescript
// Transcribe audio to text
const transcription = await client.transcribeAudio({
  file: audioBlob,
  model: 'openai/whisper-1',
  language: 'en',
  response_format: 'verbose_json',
  timestamp_granularities: ['word', 'segment'],
});

// Translate audio to English
const translation = await client.translateAudio({
  file: audioBlob,
  model: 'openai/whisper-1',
});

// Generate speech from text
const audioBuffer = await client.generateSpeech({
  model: 'openai/tts-1',
  input: 'Hello, world!',
  voice: 'alloy',
  response_format: 'mp3',
});
```

### Image Generation

```typescript
// Generate images
const images = await client.generateImage({
  prompt: 'A futuristic city at sunset',
  model: 'openai/dall-e-3',
  quality: 'hd',
  size: '1024x1024',
});

// Edit images
const edited = await client.editImage({
  image: imageBlob,
  prompt: 'Add a rainbow',
  size: '1024x1024',
});

// Create variations
const variations = await client.createImageVariation({
  image: imageBlob,
  n: 2,
});
```

### Text Embeddings

```typescript
const embeddings = await client.createEmbeddings({
  input: ['Text to embed', 'Another text'],
  model: 'openai/text-embedding-3-small',
});
```

### Batch Processing

```typescript
// Create batch job
const batch = await client.createBatch({
  input_file_id: 'file-abc123',
  endpoint: '/v1/chat/completions',
  completion_window: '24h',
});

// Check status
const status = await client.retrieveBatch(batch.id);

// List batches
const batches = await client.listBatches();

// Cancel batch
await client.cancelBatch(batch.id);
```

### Assistants API

```typescript
// Create assistant
const assistant = await client.createAssistant({
  model: 'openai/gpt-4o-mini',
  name: 'Math Tutor',
  instructions: 'You are a helpful math tutor.',
  tools: [{ type: 'code_interpreter' }],
});

// Create thread
const thread = await client.createThread({
  messages: [{ role: 'user', content: 'Help me solve 2x + 5 = 15' }],
});

// Create run
const run = await client.createRun(thread.id, {
  assistant_id: assistant.id,
});

// Check run status
const runStatus = await client.retrieveRun(thread.id, run.id);
```

### Fine-Tuning

```typescript
// Create fine-tuning job
const job = await client.createFineTuningJob({
  training_file: 'file-abc123',
  model: 'openai/gpt-4o-mini-2024-07-18',
  hyperparameters: { n_epochs: 3 },
});

// List jobs
const jobs = await client.listFineTuningJobs();

// Get job details
const jobDetails = await client.retrieveFineTuningJob(job.id);

// List events
const events = await client.listFineTuningEvents(job.id);
```

### Content Moderation

```typescript
const moderation = await client.createModeration({
  input: 'Text to moderate',
  model: 'text-moderation-latest',
});

console.log('Flagged:', moderation.results[0].flagged);
console.log('Categories:', moderation.results[0].categories);
```

### Retry Logic with Exponential Backoff

```typescript
const client = new ZaguanClient({
  baseUrl: 'https://api.zaguanai.com/',
  apiKey: 'your-api-key',
  retry: {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 10000,
    backoffMultiplier: 2,
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  },
});
```

### Logging and Observability

```typescript
const client = new ZaguanClient({
  baseUrl: 'https://api.zaguanai.com/',
  apiKey: 'your-api-key',
  onLog: (event) => {
    switch (event.type) {
      case 'request_start':
        console.log(`Starting ${event.method} ${event.url}`);
        break;
      case 'request_end':
        console.log(`Completed in ${event.latencyMs}ms`);
        break;
      case 'request_error':
        console.error(`Failed: ${event.error.message}`);
        break;
      case 'retry_attempt':
        console.log(`Retry ${event.attempt}/${event.maxRetries}`);
        break;
    }
  },
});
```

### Streaming Message Reconstruction

```typescript
const chunks = [];
for await (const chunk of client.chatStream({
  model: 'openai/gpt-4o-mini',
  messages: [{ role: 'user', content: 'Hello!' }],
})) {
  chunks.push(chunk);
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}

// Reconstruct complete message from chunks
const complete = ZaguanClient.reconstructMessageFromChunks(chunks);
console.log('Complete message:', complete.choices[0].message.content);
```

## Error Handling

The SDK provides structured error types:

```typescript
import { APIError, InsufficientCreditsError, RateLimitError, BandAccessDeniedError } from '@zaguan_ai/sdk';

try {
  const response = await client.chat({...});
} catch (error) {
  if (error instanceof InsufficientCreditsError) {
    console.error(`Need ${error.creditsRequired}, have ${error.creditsRemaining}`);
    console.error(`Resets on: ${error.resetDate}`);
  } else if (error instanceof RateLimitError) {
    console.error(`Rate limited. Retry after ${error.retryAfter} seconds`);
  } else if (error instanceof BandAccessDeniedError) {
    console.error(`Access denied to band ${error.band}`);
    console.error(`Requires ${error.requiredTier}, you have ${error.currentTier}`);
  } else if (error instanceof APIError) {
    console.error(`API Error ${error.statusCode}: ${error.message}`);
    console.error(`Request ID: ${error.requestId}`);
  }
}
```

## Supported Providers

Zaguán CoreX supports 15+ AI providers with 500+ models:

| Provider          | Key Models                       | Capabilities                               |
| ----------------- | -------------------------------- | ------------------------------------------ |
| **OpenAI**        | GPT-4o, GPT-4o-mini, o1, o3      | Vision, audio, reasoning, function calling |
| **Google Gemini** | Gemini 2.0 Flash, Gemini 2.5 Pro | 2M context, advanced reasoning             |
| **Anthropic**     | Claude 3.5 Sonnet, Claude 3 Opus | Extended thinking, citations               |
| **Alibaba Qwen**  | Qwen 2.5, QwQ                    | Advanced reasoning, multilingual           |
| **DeepSeek**      | DeepSeek V3, DeepSeek R1         | Cost-effective reasoning                   |
| **Groq**          | Llama 3, Mixtral                 | Ultra-fast inference                       |
| **Perplexity**    | Sonar, Sonar Reasoning           | Real-time web search                       |
| **xAI**           | Grok 2, Grok 2 Vision            | Real-time data                             |
| **Mistral**       | Mistral Large, Mixtral           | Open models, multilingual                  |
| **+ More**        | 500+ models                      | Specialized capabilities                   |

## Contributing

We welcome contributions! Please see our [contributing guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please [open an issue](https://github.com/ZaguanLabs/zaguan-sdk-ts/issues) on GitHub or contact our team at support@zaguan.ai.
