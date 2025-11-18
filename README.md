# Zaguán TypeScript SDK

[![CI](https://github.com/ZaguanLabs/zaguan-sdk-ts/actions/workflows/ci.yml/badge.svg)](https://github.com/ZaguanLabs/zaguan-sdk-ts/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@zaguan/sdk)](https://www.npmjs.com/package/@zaguan/sdk)
[![License](https://img.shields.io/npm/l/@zaguan/sdk)](LICENSE)

Official Zaguán SDK for TypeScript - The easiest way to integrate with Zaguán CoreX, an enterprise-grade AI gateway that provides unified access to 15+ AI providers and 500+ models through a single, OpenAI-compatible API.

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
npm install @zaguan/sdk
```

## Quick Start

```typescript
import { ZaguanClient } from '@zaguan/sdk';

// Initialize the client with your API key
const client = new ZaguanClient({
  baseUrl: 'https://api.zaguanai.com/', // or https://api-eu-fi-01.zaguanai.com/
  apiKey: 'your-api-key-from-zaguanai.com'
});

// Simple chat completion
const response = await client.chat({
  model: 'openai/gpt-4o-mini',
  messages: [
    { role: 'user', content: 'Hello, world!' }
  ]
});

console.log(response.choices[0].message.content);
```

## Streaming Responses

For real-time responses, use the streaming API:

```typescript
// Streaming chat completion
for await (const chunk of client.chatStream({
  model: 'openai/gpt-4o-mini',
  messages: [
    { role: 'user', content: 'Tell me a story' }
  ]
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
  messages: [{ role: 'user', content: 'Hello!' }]
});

// Anthropic
const anthropicResponse = await client.chat({
  model: 'anthropic/claude-3-5-sonnet',
  messages: [{ role: 'user', content: 'Hello!' }]
});

// Google Gemini
const googleResponse = await client.chat({
  model: 'google/gemini-2.0-flash',
  messages: [{ role: 'user', content: 'Hello!' }]
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
    thinking_budget: 10000
  }
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

## Features

- **🎯 OpenAI Compatibility**: Drop-in replacement for OpenAI SDK with familiar interfaces
- **🔌 Multi-Provider Support**: Unified access to 15+ AI providers through a single API
- **⚡ Production Ready**: Built-in timeouts, retries, and streaming support
- **_typeDefinition**: Comprehensive TypeScript definitions for all API surfaces
- **🛡️ Error Handling**: Structured error types for better error handling
- **🔄 Streaming**: Async iterable interface for real-time responses
- **🔐 Secure**: Bearer token authentication and request ID tracking

## Supported Providers

Zaguán CoreX supports 15+ AI providers with 500+ models:

| Provider | Key Models | Capabilities |
|----------|------------|-------------|
| **OpenAI** | GPT-4o, GPT-4o-mini, o1, o3 | Vision, audio, reasoning, function calling |
| **Google Gemini** | Gemini 2.0 Flash, Gemini 2.5 Pro | 2M context, advanced reasoning |
| **Anthropic** | Claude 3.5 Sonnet, Claude 3 Opus | Extended thinking, citations |
| **Alibaba Qwen** | Qwen 2.5, QwQ | Advanced reasoning, multilingual |
| **DeepSeek** | DeepSeek V3, DeepSeek R1 | Cost-effective reasoning |
| **Groq** | Llama 3, Mixtral | Ultra-fast inference |
| **Perplexity** | Sonar, Sonar Reasoning | Real-time web search |
| **xAI** | Grok 2, Grok 2 Vision | Real-time data |
| **Mistral** | Mistral Large, Mixtral | Open models, multilingual |
| **+ More** | 500+ models | Specialized capabilities |

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
