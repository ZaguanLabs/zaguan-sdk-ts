/**
 * Core types for the Zaguán SDK
 *
 * This file contains the core data structures that mirror the API contracts
 * defined in the Zaguán CoreX documentation.
 */

/**
 * Role types for messages
 */
export type Role = 'system' | 'user' | 'assistant' | 'tool' | 'function';

/**
 * Content part for multimodal messages
 */
export interface ContentPart {
  type: 'text' | 'image_url' | 'input_audio';
  text?: string;
  image_url?: {
    url: string;
    detail?: 'auto' | 'low' | 'high';
  };
  input_audio?: {
    data: string;
    format: 'wav' | 'mp3';
  };
}

/**
 * Message content - either a string or an array of content parts
 */
export type MessageContent = string | ContentPart[];

/**
 * Message interface
 */
export interface Message {
  role: Role;
  content: MessageContent;
  name?: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  function_call?: {
    name: string;
    arguments: string;
  };
}

/**
 * Tool call interface
 */
export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

/**
 * Tool definition
 */
export interface Tool {
  type: 'function';
  function: {
    name: string;
    description?: string;
    parameters: Record<string, unknown>;
  };
}

/**
 * Token details for usage tracking
 */
export interface TokenDetails {
  reasoning_tokens?: number;
  cached_tokens?: number;
  audio_tokens?: number;
  accepted_prediction_tokens?: number;
  rejected_prediction_tokens?: number;
}

/**
 * Usage information
 */
export interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  prompt_tokens_details?: TokenDetails;
  completion_tokens_details?: TokenDetails;
}

/**
 * Chat request parameters
 */
export interface ChatRequest {
  model: string;
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
  tools?: Tool[];
  tool_choice?: string | Record<string, unknown>;
  response_format?: Record<string, unknown>;
  provider_specific_params?: Record<string, unknown>;
  extra_body?: Record<string, unknown>;
  thinking?: boolean;
  virtual_model_id?: string;
  metadata?: Record<string, unknown>;
  store?: boolean;
  verbosity?: string;
  modalities?: string[];
  audio?: {
    voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
    format: 'wav' | 'mp3' | 'opus' | 'aac' | 'flac' | 'pcm';
  };
  reasoning_effort?: 'minimal' | 'low' | 'medium' | 'high';
}

/**
 * Choice in a chat response
 */
export interface Choice {
  index: number;
  message?: Message;
  delta?: Message;
  finish_reason?: string;
  tool_calls?: ToolCall[];
}

/**
 * Chat response
 */
export interface ChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Choice[];
  usage: Usage;
}

/**
 * Chat chunk for streaming
 */
export interface ChatChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta?: Message;
    finish_reason?: string;
  }>;
}

/**
 * Model information
 */
export interface ModelInfo {
  id: string;
  object: string;
  owned_by?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Model capabilities
 */
export interface ModelCapabilities {
  model_id: string;
  supports_vision: boolean;
  supports_tools: boolean;
  supports_reasoning: boolean;
  max_context_tokens?: number;
  supports_audio_in?: boolean;
  supports_audio_out?: boolean;
  provider_specific?: Record<string, unknown>;
}

/**
 * Credits balance information
 */
export interface CreditsBalance {
  credits_remaining: number;
  tier: string;
  bands: string[];
  reset_date?: string;
  stripe_price_id?: string;
}

/**
 * Credits history entry
 */
export interface CreditsHistoryEntry {
  id: string;
  timestamp: string;
  request_id: string;
  model: string;
  provider: string;
  band: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  credits_debited: number;
  cost: number;
  latency_ms: number;
  status: string;
}

/**
 * Credits history response
 */
export interface CreditsHistory {
  entries: CreditsHistoryEntry[];
  total: number;
  page: number;
  page_size: number;
}

/**
 * Credits history options
 */
export interface CreditsHistoryOptions {
  page?: number;
  page_size?: number;
  start_date?: string;
  end_date?: string;
  model?: string;
  provider?: string;
}

/**
 * Credits stats entry
 */
export interface CreditsStatsEntry {
  period: string;
  total_requests: number;
  total_tokens: number;
  total_credits: number;
  total_cost: number;
  by_model?: Record<
    string,
    {
      requests: number;
      tokens: number;
      credits: number;
      cost: number;
    }
  >;
  by_provider?: Record<
    string,
    {
      requests: number;
      tokens: number;
      credits: number;
      cost: number;
    }
  >;
  by_band?: Record<
    string,
    {
      requests: number;
      tokens: number;
      credits: number;
      cost: number;
    }
  >;
}

/**
 * Credits stats response
 */
export interface CreditsStats {
  stats: CreditsStatsEntry[];
  summary: {
    total_requests: number;
    total_tokens: number;
    total_credits: number;
    total_cost: number;
  };
}

/**
 * Credits stats options
 */
export interface CreditsStatsOptions {
  start_date?: string;
  end_date?: string;
  group_by?: 'day' | 'week' | 'month';
  model?: string;
  provider?: string;
  band?: string;
}

// ============================================================================
// AUDIO TYPES
// ============================================================================

/**
 * Audio transcription request
 */
export interface AudioTranscriptionRequest {
  file: Blob | File;
  model: string;
  language?: string;
  prompt?: string;
  response_format?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
  temperature?: number;
  timestamp_granularities?: Array<'word' | 'segment'>;
}

/**
 * Audio transcription response
 */
export interface AudioTranscriptionResponse {
  text: string;
  language?: string;
  duration?: number;
  words?: Array<{
    word: string;
    start: number;
    end: number;
  }>;
  segments?: Array<{
    id: number;
    seek: number;
    start: number;
    end: number;
    text: string;
    tokens: number[];
    temperature: number;
    avg_logprob: number;
    compression_ratio: number;
    no_speech_prob: number;
  }>;
}

/**
 * Audio translation request
 */
export interface AudioTranslationRequest {
  file: Blob | File;
  model: string;
  prompt?: string;
  response_format?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
  temperature?: number;
}

/**
 * Audio translation response
 */
export interface AudioTranslationResponse {
  text: string;
  language?: string;
  duration?: number;
}

/**
 * Speech generation request
 */
export interface SpeechRequest {
  model: string;
  input: string;
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  response_format?: 'mp3' | 'opus' | 'aac' | 'flac' | 'wav' | 'pcm';
  speed?: number;
}

// ============================================================================
// IMAGES TYPES
// ============================================================================

/**
 * Image generation request
 */
export interface ImageGenerationRequest {
  prompt: string;
  model?: string;
  n?: number;
  quality?: 'standard' | 'hd';
  response_format?: 'url' | 'b64_json';
  size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
  style?: 'vivid' | 'natural';
  user?: string;
}

/**
 * Image object
 */
export interface ImageObject {
  url?: string;
  b64_json?: string;
  revised_prompt?: string;
}

/**
 * Image generation response
 */
export interface ImageGenerationResponse {
  created: number;
  data: ImageObject[];
}

/**
 * Image edit request
 */
export interface ImageEditRequest {
  image: Blob | File;
  prompt: string;
  mask?: Blob | File;
  model?: string;
  n?: number;
  size?: '256x256' | '512x512' | '1024x1024';
  response_format?: 'url' | 'b64_json';
  user?: string;
}

/**
 * Image variation request
 */
export interface ImageVariationRequest {
  image: Blob | File;
  model?: string;
  n?: number;
  response_format?: 'url' | 'b64_json';
  size?: '256x256' | '512x512' | '1024x1024';
  user?: string;
}

// ============================================================================
// EMBEDDINGS TYPES
// ============================================================================

/**
 * Embeddings request
 */
export interface EmbeddingsRequest {
  input: string | string[];
  model: string;
  encoding_format?: 'float' | 'base64';
  dimensions?: number;
  user?: string;
}

/**
 * Embedding object
 */
export interface EmbeddingObject {
  object: 'embedding';
  embedding: number[] | string;
  index: number;
}

/**
 * Embeddings response
 */
export interface EmbeddingsResponse {
  object: 'list';
  data: EmbeddingObject[];
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

// ============================================================================
// BATCHES TYPES
// ============================================================================

/**
 * Batch request
 */
export interface BatchRequest {
  input_file_id: string;
  endpoint: '/v1/chat/completions' | '/v1/embeddings' | '/v1/completions';
  completion_window: '24h';
  metadata?: Record<string, string>;
}

/**
 * Batch object
 */
export interface BatchObject {
  id: string;
  object: 'batch';
  endpoint: string;
  errors?: {
    object: 'list';
    data: Array<{
      code: string;
      message: string;
      param?: string;
      line?: number;
    }>;
  };
  input_file_id: string;
  completion_window: string;
  status:
    | 'validating'
    | 'failed'
    | 'in_progress'
    | 'finalizing'
    | 'completed'
    | 'expired'
    | 'cancelling'
    | 'cancelled';
  output_file_id?: string;
  error_file_id?: string;
  created_at: number;
  in_progress_at?: number;
  expires_at?: number;
  finalizing_at?: number;
  completed_at?: number;
  failed_at?: number;
  expired_at?: number;
  cancelling_at?: number;
  cancelled_at?: number;
  request_counts?: {
    total: number;
    completed: number;
    failed: number;
  };
  metadata?: Record<string, string>;
}

/**
 * Batch list response
 */
export interface BatchListResponse {
  object: 'list';
  data: BatchObject[];
  first_id?: string;
  last_id?: string;
  has_more: boolean;
}

// ============================================================================
// ASSISTANTS TYPES
// ============================================================================

/**
 * Assistant request
 */
export interface AssistantRequest {
  model: string;
  name?: string;
  description?: string;
  instructions?: string;
  tools?: Array<{
    type: 'code_interpreter' | 'file_search' | 'function';
    function?: {
      name: string;
      description?: string;
      parameters: Record<string, unknown>;
    };
  }>;
  tool_resources?: {
    code_interpreter?: {
      file_ids?: string[];
    };
    file_search?: {
      vector_store_ids?: string[];
    };
  };
  metadata?: Record<string, string>;
  temperature?: number;
  top_p?: number;
  response_format?: 'auto' | { type: 'text' | 'json_object' };
}

/**
 * Assistant object
 */
export interface AssistantObject {
  id: string;
  object: 'assistant';
  created_at: number;
  name?: string;
  description?: string;
  model: string;
  instructions?: string;
  tools: Array<{
    type: string;
    function?: {
      name: string;
      description?: string;
      parameters: Record<string, unknown>;
    };
  }>;
  tool_resources?: Record<string, unknown>;
  metadata?: Record<string, string>;
  temperature?: number;
  top_p?: number;
  response_format?: unknown;
}

/**
 * Thread request
 */
export interface ThreadRequest {
  messages?: Array<{
    role: 'user' | 'assistant';
    content: string;
    attachments?: Array<{
      file_id: string;
      tools?: Array<{ type: string }>;
    }>;
    metadata?: Record<string, string>;
  }>;
  tool_resources?: Record<string, unknown>;
  metadata?: Record<string, string>;
}

/**
 * Thread object
 */
export interface ThreadObject {
  id: string;
  object: 'thread';
  created_at: number;
  tool_resources?: Record<string, unknown>;
  metadata?: Record<string, string>;
}

/**
 * Run request
 */
export interface RunRequest {
  assistant_id: string;
  model?: string;
  instructions?: string;
  additional_instructions?: string;
  additional_messages?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  tools?: Array<{ type: string }>;
  metadata?: Record<string, string>;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
  max_prompt_tokens?: number;
  max_completion_tokens?: number;
  truncation_strategy?: {
    type: 'auto' | 'last_messages';
    last_messages?: number;
  };
  tool_choice?:
    | 'none'
    | 'auto'
    | 'required'
    | { type: string; function?: { name: string } };
  parallel_tool_calls?: boolean;
  response_format?: 'auto' | { type: 'text' | 'json_object' };
}

/**
 * Run object
 */
export interface RunObject {
  id: string;
  object: 'thread.run';
  created_at: number;
  thread_id: string;
  assistant_id: string;
  status:
    | 'queued'
    | 'in_progress'
    | 'requires_action'
    | 'cancelling'
    | 'cancelled'
    | 'failed'
    | 'completed'
    | 'incomplete'
    | 'expired';
  required_action?: {
    type: 'submit_tool_outputs';
    submit_tool_outputs: {
      tool_calls: Array<{
        id: string;
        type: 'function';
        function: {
          name: string;
          arguments: string;
        };
      }>;
    };
  };
  last_error?: {
    code: string;
    message: string;
  };
  expires_at?: number;
  started_at?: number;
  cancelled_at?: number;
  failed_at?: number;
  completed_at?: number;
  incomplete_details?: {
    reason?: string;
  };
  model: string;
  instructions?: string;
  tools: Array<{ type: string }>;
  metadata?: Record<string, string>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  temperature?: number;
  top_p?: number;
  max_prompt_tokens?: number;
  max_completion_tokens?: number;
  truncation_strategy?: Record<string, unknown>;
  tool_choice?: unknown;
  parallel_tool_calls?: boolean;
  response_format?: unknown;
}

// ============================================================================
// FINE-TUNING TYPES
// ============================================================================

/**
 * Fine-tuning job request
 */
export interface FineTuningJobRequest {
  training_file: string;
  validation_file?: string;
  model: string;
  hyperparameters?: {
    batch_size?: number | 'auto';
    learning_rate_multiplier?: number | 'auto';
    n_epochs?: number | 'auto';
  };
  suffix?: string;
  integrations?: Array<{
    type: 'wandb';
    wandb: {
      project: string;
      name?: string;
      entity?: string;
      tags?: string[];
    };
  }>;
  seed?: number;
}

/**
 * Fine-tuning job object
 */
export interface FineTuningJobObject {
  id: string;
  object: 'fine_tuning.job';
  created_at: number;
  error?: {
    code: string;
    message: string;
    param?: string;
  };
  fine_tuned_model?: string;
  finished_at?: number;
  hyperparameters: {
    n_epochs: number | 'auto';
    batch_size?: number | 'auto';
    learning_rate_multiplier?: number | 'auto';
  };
  model: string;
  organization_id: string;
  result_files: string[];
  status:
    | 'validating_files'
    | 'queued'
    | 'running'
    | 'succeeded'
    | 'failed'
    | 'cancelled';
  trained_tokens?: number;
  training_file: string;
  validation_file?: string;
  integrations?: Array<Record<string, unknown>>;
  seed?: number;
  estimated_finish?: number;
}

/**
 * Fine-tuning job event
 */
export interface FineTuningJobEvent {
  id: string;
  object: 'fine_tuning.job.event';
  created_at: number;
  level: 'info' | 'warn' | 'error';
  message: string;
  data?: Record<string, unknown>;
  type: string;
}

/**
 * Fine-tuning job list response
 */
export interface FineTuningJobListResponse {
  object: 'list';
  data: FineTuningJobObject[];
  has_more: boolean;
}

// ============================================================================
// MODERATIONS TYPES
// ============================================================================

/**
 * Moderation request
 */
export interface ModerationRequest {
  input: string | string[];
  model?:
    | 'text-moderation-latest'
    | 'text-moderation-stable'
    | 'omni-moderation-latest';
}

/**
 * Moderation categories
 */
export interface ModerationCategories {
  hate: boolean;
  'hate/threatening': boolean;
  harassment: boolean;
  'harassment/threatening': boolean;
  'self-harm': boolean;
  'self-harm/intent': boolean;
  'self-harm/instructions': boolean;
  sexual: boolean;
  'sexual/minors': boolean;
  violence: boolean;
  'violence/graphic': boolean;
  illicit?: boolean;
  'illicit/violent'?: boolean;
}

/**
 * Moderation category scores
 */
export interface ModerationCategoryScores {
  hate: number;
  'hate/threatening': number;
  harassment: number;
  'harassment/threatening': number;
  'self-harm': number;
  'self-harm/intent': number;
  'self-harm/instructions': number;
  sexual: number;
  'sexual/minors': number;
  violence: number;
  'violence/graphic': number;
  illicit?: number;
  'illicit/violent'?: number;
}

/**
 * Moderation result
 */
export interface ModerationResult {
  flagged: boolean;
  categories: ModerationCategories;
  category_scores: ModerationCategoryScores;
}

/**
 * Moderation response
 */
export interface ModerationResponse {
  id: string;
  model: string;
  results: ModerationResult[];
}
