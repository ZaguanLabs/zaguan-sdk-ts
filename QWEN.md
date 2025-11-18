# Zaguán TypeScript SDK - Development Context

## Project Overview

This is the official Zaguán SDK for TypeScript/JavaScript, designed to provide easy access to Zaguán CoreX - an enterprise-grade AI gateway that offers unified access to 15+ AI providers and 500+ models through a single, OpenAI-compatible API.

### Purpose

The SDK aims to:

- Make it easy to call Zaguán CoreX without dealing with raw HTTP
- Expose all important features of CoreX, not just basic chat
- Provide a stable, ergonomic API over OpenAI-compatible chat endpoints and Zaguán-specific enhancements
- Be safe and production-ready with features like timeouts, retries, and streaming

### Key Features

- Multi-Provider Abstraction: Access 15+ AI providers through one API
- Cost Optimization: 40-60% cost reduction through smart routing
- Advanced Features: Reasoning control, multimodal AI, real-time data, long context windows
- Enterprise Performance: 2-3x faster responses, 5,000+ concurrent connections
- Zero Vendor Lock-in: Switch providers by changing model name only

## Project Structure

Currently, the project contains:

- Documentation in the `docs/SDK/` directory
- License file (Apache 2.0)
- Minimal README

The project appears to be in the early stages of development with no source code checked in yet.

## Core Concepts

### Zaguán CoreX

Zaguán CoreX is an enterprise-grade AI gateway that provides unified access to 15+ AI providers and 500+ models through a single, OpenAI-compatible API. It eliminates vendor lock-in, optimizes costs, and unlocks advanced capabilities that individual providers don't offer.

### SDK Design Principles

- **Compatibility first**: Should feel familiar to users of OpenAI SDKs
- **Zaguán-native features second**: Provide explicit access to Zaguán-specific features
- **Minimal magic**: Defaults are safe and sensible, advanced features are opt-in
- **Language idiomatic**: Follows TypeScript/JavaScript best practices
- **Production-ready**: Comprehensive error handling, request ID tracking, retry logic

## Planned API Structure

Based on the implementation notes, the SDK will have:

### Client Class

```typescript
class ZaguanClient {
  constructor(config: ZaguanConfig);
  chat(request: ChatRequest): Promise<ChatResponse>;
  chatStream(request: ChatRequest): AsyncIterable<ChatChunk>;
  listModels(): Promise<ModelInfo[]>;
  getCapabilities(): Promise<ModelCapabilities[]>;
  getCreditsBalance(): Promise<CreditsBalance>;
}
```

### Configuration

```typescript
interface ZaguanConfig {
  baseUrl: string; // e.g. "https://api.zaguan.example.com"
  apiKey: string; // Bearer token
  timeoutMs?: number; // Optional per-request timeout
  fetch?: typeof fetch; // Optional custom fetch implementation
}
```

### Core Types

- `ChatRequest`: OpenAI-compatible chat request with Zaguán extensions
- `ChatResponse`: Standard response format with usage tracking
- `Message`: Multi-modal message support (text, images, audio)
- `ModelInfo`: Information about available models
- `CreditsBalance`: Credit system information (when enabled)

## Key Endpoints

The SDK will support these core endpoints:

- `POST /v1/chat/completions` - Primary chat endpoint (streaming and non-streaming)
- `GET /v1/models` - Lists available models with provider-prefixed IDs
- `GET /v1/capabilities` - Detailed capability information per model
- `GET /v1/credits/balance` - Current credit balance (when credits enabled)
- `GET /v1/credits/history` - Historical usage (when credits enabled)
- `GET /v1/credits/stats` - Aggregated statistics (when credits enabled)

## Provider-Specific Features

The SDK will support provider-specific parameters through `provider_specific_params`:

- Google Gemini: `reasoning_effort`, `thinking_budget`
- Anthropic: Extended thinking API, prompt caching
- Alibaba Qwen: Thinking controls
- Perplexity: Search options, citation modes
- xAI: Responses API for structured outputs
- DeepSeek: Thinking parameter control

## Development Guidelines

When implementing the SDK, follow these guidelines:

1. Maintain strong compatibility with OpenAI SDK interfaces
2. Provide strong TypeScript typing for all requests and responses
3. Implement first-class streaming support via `AsyncIterable`
4. Handle authentication with Bearer tokens
5. Support request ID tracking for debugging
6. Implement proper error handling with structured error types
7. Support timeout configuration
8. Enable custom HTTP client injection for advanced scenarios

## Building and Testing

Once implementation begins, the project will likely use:

- TypeScript for development with type declarations
- Modern build tools for ESM output
- Testing frameworks like Jest or Vitest
- Mocking libraries for HTTP requests
- Integration tests against a local CoreX instance

## Target Environments

The SDK is designed for:

- Node.js (18+)
- Modern browsers (optional)
- Both backend services and frontend applications

## Future Enhancements

Planned future features:

- Audio transcription/translation/synthesis
- Image generation/editing
- Text embeddings for semantic search
- Batch processing
- Assistants API
- Fine-tuning support
- Moderation/content filtering
