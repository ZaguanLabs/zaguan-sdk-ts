/**
 * Zaguán SDK for TypeScript
 *
 * This is the main entry point for the Zaguán SDK, exporting all public APIs.
 */

export {
  ZaguanClient,
  type ZaguanConfig,
  type RequestOptions,
} from './client.js';
export {
  type Role,
  type ContentPart,
  type MessageContent,
  type Message,
  type ToolCall,
  type Tool,
  type TokenDetails,
  type Usage,
  type ChatRequest,
  type Choice,
  type ChatResponse,
  type ChatChunk,
  type ModelInfo,
  type ModelCapabilities,
} from './types.js';
export {
  ZaguanError,
  APIError,
  InsufficientCreditsError,
  RateLimitError,
  BandAccessDeniedError,
} from './errors.js';
