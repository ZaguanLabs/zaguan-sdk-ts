# Changelog

All notable changes to the Zaguán TypeScript SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
