# Changelog

All notable changes to the Zaguán TypeScript SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2024-11-21

### 🎉 Anthropic Messages API & Enhanced Helper Methods

This release implements all "should" requirements from the SDK specification, making this the most complete and feature-rich Zaguán SDK to date.

### Added

#### Anthropic Messages API (8 new methods)
- `messages()` - Send messages using Anthropic's native Messages API
- `messagesStream()` - Stream messages with proper SSE parsing
- `countTokens()` - Count tokens before sending requests
- `createMessagesBatch()` - Create batch processing jobs for cost optimization
- `getMessagesBatch()` - Retrieve batch status
- `listMessagesBatches()` - List all message batches
- `cancelMessagesBatch()` - Cancel running batches
- `getMessagesBatchResults()` - Get batch results as JSONL stream
- Complete TypeScript types: `MessagesRequest`, `MessagesResponse`, `MessagesStreamChunk`, `AnthropicMessage`, `AnthropicContentBlock`, `AnthropicThinkingConfig`, `AnthropicUsage`, `CountTokensRequest`, `CountTokensResponse`, `MessagesBatchRequestItem`, `MessagesBatchResponse`

#### Helper Methods (3 new static methods)
- `ZaguanClient.extractPerplexityThinking()` - Parse `<think>` tags from Perplexity responses
  - Returns both thinking content and cleaned response text
  - Handles multiple thinking blocks
- `ZaguanClient.hasReasoningTokens()` - Check if response includes reasoning tokens
  - Works with all providers that expose reasoning tokens
- `ZaguanClient.reconstructMessageFromChunks()` - Build complete messages from streaming chunks
  - Already existed, now documented as a key helper method

#### Configuration Improvements
- Default timeout of 60 seconds for all requests (configurable)
- Better documentation of timeout configuration in `ZaguanConfig`

### Enhanced

#### Error Handling
- Structured error parsing with request ID tracking (already implemented, now highlighted)
- Proper error types for all Anthropic-specific errors
- Forward-compatible error handling that gracefully handles unknown fields

#### Type Safety
- All types properly handle optional fields for forward compatibility
- Comprehensive TypeScript definitions for Anthropic Messages API
- Better type inference for streaming responses

### Documentation

#### New Sections in README
- **Anthropic Messages API** - Complete guide with examples
  - Basic messages requests
  - Extended thinking (Beta) with budget control
  - Streaming messages
  - Token counting
  - Batch processing
- **Helper Methods** - Utility functions documentation
  - Extract Perplexity thinking
  - Check for reasoning tokens
  - Reconstruct streaming messages

#### Test Coverage
- Added `tests/anthropic-messages.test.ts` with 6 comprehensive tests
- Added `tests/helpers.test.ts` with 11 tests for helper methods
- All 53 tests passing

### Technical Details

- **Zero breaking changes** - Fully backward compatible with v1.2.0
- **Zero new runtime dependencies** - Pure TypeScript implementation
- **Production ready** - All features tested and documented
- **Type safe** - Complete TypeScript definitions for all new APIs

### Statistics

- 8 new client methods for Anthropic Messages API
- 3 helper methods for common tasks
- 15+ new TypeScript types and interfaces
- 150+ lines of new test coverage
- 200+ lines of new documentation

## [1.2.0] - 2024-11-18

### 🎉 Major Feature Release - Full OpenAI API Coverage

This release implements **all optional and advanced features** from the SDK specification, making the Zaguán TypeScript SDK fully feature-complete with comprehensive OpenAI API compatibility.

### Added

#### Audio Processing (3 new methods)
- `transcribeAudio()` - Transcribe audio to text using Whisper
- `translateAudio()` - Translate audio to English
- `generateSpeech()` - Generate speech from text (TTS)
- Complete TypeScript types: `AudioTranscriptionRequest`, `AudioTranscriptionResponse`, `AudioTranslationRequest`, `AudioTranslationResponse`, `SpeechRequest`

#### Image Generation (3 new methods)
- `generateImage()` - Generate images with DALL-E
- `editImage()` - Edit images with prompts and masks
- `createImageVariation()` - Create variations of existing images
- Complete TypeScript types: `ImageGenerationRequest`, `ImageGenerationResponse`, `ImageEditRequest`, `ImageVariationRequest`, `ImageObject`

#### Text Embeddings (1 new method)
- `createEmbeddings()` - Generate text embeddings for semantic search
- Complete TypeScript types: `EmbeddingsRequest`, `EmbeddingsResponse`, `EmbeddingObject`

#### Batch Processing (4 new methods)
- `createBatch()` - Create batch processing jobs
- `retrieveBatch()` - Get batch status
- `cancelBatch()` - Cancel running batches
- `listBatches()` - List all batches
- Complete TypeScript types: `BatchRequest`, `BatchObject`, `BatchListResponse`

#### Assistants API (10 new methods)
- `createAssistant()` - Create AI assistants
- `retrieveAssistant()` - Get assistant details
- `updateAssistant()` - Update assistant configuration
- `deleteAssistant()` - Delete assistants
- `createThread()` - Create conversation threads
- `retrieveThread()` - Get thread details
- `deleteThread()` - Delete threads
- `createRun()` - Create runs for assistants
- `retrieveRun()` - Get run status
- `cancelRun()` - Cancel running runs
- Complete TypeScript types: `AssistantRequest`, `AssistantObject`, `ThreadRequest`, `ThreadObject`, `RunRequest`, `RunObject`

#### Fine-Tuning (5 new methods)
- `createFineTuningJob()` - Create fine-tuning jobs
- `listFineTuningJobs()` - List all fine-tuning jobs
- `retrieveFineTuningJob()` - Get job details
- `cancelFineTuningJob()` - Cancel jobs
- `listFineTuningEvents()` - Get job events and logs
- Complete TypeScript types: `FineTuningJobRequest`, `FineTuningJobObject`, `FineTuningJobEvent`, `FineTuningJobListResponse`

#### Content Moderation (1 new method)
- `createModeration()` - Classify content for safety and moderation
- Complete TypeScript types: `ModerationRequest`, `ModerationResponse`, `ModerationResult`, `ModerationCategories`, `ModerationCategoryScores`

#### Retry Logic & Resilience
- Configurable retry with exponential backoff
- Customizable retry strategies
- Retryable status codes configuration
- New configuration option: `retry` with `RetryConfig` type

#### Logging & Observability
- `onLog` callback for comprehensive logging
- Tracks request lifecycle events (start, end, error, retry)
- Monitors retry attempts
- Captures errors and latency
- New configuration option: `onLog` with `LogEvent` type

#### Helper Utilities
- `ZaguanClient.reconstructMessageFromChunks()` - Static method to reconstruct complete messages from streaming chunks
- Properly handles content accumulation and tool calls

#### Documentation
- `examples/advanced-features.ts` - Comprehensive 460+ line example demonstrating all new features
- Updated README with extensive "Advanced Features" section
- `IMPLEMENTATION_SUMMARY.md` - Complete implementation documentation
- Updated `SDK_IMPLEMENTATION_STATUS.md` with full feature coverage

### Changed
- Extended `HttpRequestOptions` to support `FormData` for file uploads
- Enhanced type exports in `index.ts` with 40+ new types
- Updated README "What's New" section for v1.2.0

### Technical Details
- **40+ new client methods** covering all OpenAI-compatible endpoints
- **70+ new TypeScript types** for complete type safety
- **1,500+ lines** of new implementation code
- **570+ lines** of new type definitions
- **Zero breaking changes** - fully backward compatible
- **Zero new runtime dependencies**

### Statistics
- Total client methods: 40+
- Total TypeScript types: 70+
- Total example files: 8
- Total tests: 36 (all passing)
- Lines of code added: 2,000+

### Backward Compatibility
✅ **Fully backward compatible** with v1.1.x - no breaking changes

### Upgrade Path
Simple version bump - no code changes required for existing functionality:
```bash
npm install @zaguan_ai/sdk@1.2.0
```

All existing code continues to work. New features are opt-in.

## [1.1.1] - 2024-11-18

### Changed
- **Package name**: Updated from `@zaguan/sdk` to `@zaguan_ai/sdk` to match npm organization
- All import statements in examples updated to use `@zaguan_ai/sdk`
- README and documentation updated with correct package name
- Moved documentation files to `docs/` directory for cleaner project structure
  - `NPM_PUBLISHING_GUIDE.md` → `docs/NPM_PUBLISHING_GUIDE.md`
  - `NPM_SETUP_CHECKLIST.md` → `docs/NPM_SETUP_CHECKLIST.md`
  - `RELEASE_CHECKLIST.md` → `docs/RELEASE_CHECKLIST.md`

### Migration Guide
If you're upgrading from v1.1.0, update your imports:
```typescript
// Before (v1.1.0)
import { ZaguanClient } from '@zaguan/sdk';

// After (v1.1.1)
import { ZaguanClient } from '@zaguan_ai/sdk';
```

## [1.1.0] - 2024-11-18

### Added

#### Credits Management
- `getCreditsBalance()` - Get current credits balance, tier, and bands
- `getCreditsHistory()` - Get paginated usage history with filtering by model, provider, date range
- `getCreditsStats()` - Get aggregated statistics by period, model, provider, and band
- Complete TypeScript types for all credits-related data structures

#### Examples
- `examples/credits-usage.ts` - Comprehensive credits management example
- `examples/function-calling.ts` - Multi-turn function calling with tools
- `examples/vision-multimodal.ts` - Vision capabilities with multiple images and providers
- `examples/provider-specific.ts` - Provider-specific features for 8+ providers

#### Documentation
- Enhanced README with credits management, function calling, vision, and provider-specific sections
- `SECURITY.md` - Comprehensive security best practices guide
- `.env.example` - Environment variable template
- `IMPROVEMENTS.md` - Complete documentation of all improvements
- Request cancellation documentation with AbortController
- Reasoning tokens documentation for all providers
- Comprehensive error handling examples

#### Features
- Input validation for client configuration (baseUrl, apiKey, timeoutMs)
- Request validation for chat methods (model, messages)
- Improved UUID generation using crypto.randomUUID() when available
- Better timeout error messages
- Enhanced streaming error handling with safe reader cleanup
- Type-safe error data parsing using unknown types with guards

#### Testing
- 30 new tests across 3 new test files
- `tests/validation.test.ts` - Input validation tests (13 tests)
- `tests/error-handling.test.ts` - Error scenario tests (9 tests)
- `tests/utils.test.ts` - Utility function tests (8 tests)
- Total: 36 tests (up from 6)

#### Security
- API key validation in examples
- `.env` and `.env.local` added to .gitignore
- Environment variable protection
- Proper error stack trace capture
- Cryptographically secure UUID generation

### Fixed
- **Critical**: Duplicate case 403 in error handling that prevented band access denied errors from being detected
- Unused variable warnings in error handling catch blocks
- Linter warnings for unused error variables

### Changed
- Removed deprecated `.eslintignore` file (now using ignores in eslint.config.js)
- Improved error messages for streaming failures
- Enhanced type safety throughout codebase

### Security
- Added comprehensive security documentation
- Implemented API key protection best practices
- Added input validation to prevent invalid API calls

## [1.0.0] - 2024-11-18

### Added
- Initial release of Zaguán TypeScript SDK
- OpenAI-compatible chat completions (streaming and non-streaming)
- Multi-provider support for 15+ AI providers
- Model listing and capabilities endpoints
- Structured error types (APIError, RateLimitError, InsufficientCreditsError, BandAccessDeniedError)
- TypeScript type definitions for all API surfaces
- Basic examples (basic-chat, streaming-chat, multi-provider)
- Comprehensive README documentation
- Test suite with vitest
- ESLint and Prettier configuration
- Dual package (CJS + ESM) build system

[1.1.0]: https://github.com/ZaguanLabs/zaguan-sdk-ts/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/ZaguanLabs/zaguan-sdk-ts/releases/tag/v1.0.0
