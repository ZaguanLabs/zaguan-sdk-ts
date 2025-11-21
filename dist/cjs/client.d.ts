/**
 * Main client for the Zaguán SDK
 *
 * This file contains the main client class that provides access to all Zaguán API endpoints.
 */
import { ChatRequest, ChatResponse, ChatChunk, ModelInfo, ModelCapabilities, CreditsBalance, CreditsHistory, CreditsHistoryOptions, CreditsStats, CreditsStatsOptions, AudioTranscriptionRequest, AudioTranscriptionResponse, AudioTranslationRequest, AudioTranslationResponse, SpeechRequest, ImageGenerationRequest, ImageGenerationResponse, ImageEditRequest, ImageVariationRequest, EmbeddingsRequest, EmbeddingsResponse, BatchRequest, BatchObject, BatchListResponse, AssistantRequest, AssistantObject, ThreadRequest, ThreadObject, RunRequest, RunObject, FineTuningJobRequest, FineTuningJobObject, FineTuningJobEvent, FineTuningJobListResponse, ModerationRequest, ModerationResponse, MessagesRequest, MessagesResponse, MessagesStreamChunk, CountTokensRequest, CountTokensResponse, MessagesBatchRequestItem, MessagesBatchResponse } from './types.js';
/**
 * Logging event types
 */
export type LogEvent = {
    type: 'request_start';
    requestId: string;
    method: string;
    url: string;
    timestamp: number;
} | {
    type: 'request_end';
    requestId: string;
    method: string;
    url: string;
    statusCode: number;
    latencyMs: number;
    timestamp: number;
} | {
    type: 'request_error';
    requestId: string;
    method: string;
    url: string;
    error: Error;
    latencyMs: number;
    timestamp: number;
} | {
    type: 'retry_attempt';
    requestId: string;
    attempt: number;
    maxRetries: number;
    delayMs: number;
    timestamp: number;
};
/**
 * Retry configuration
 */
export interface RetryConfig {
    /**
     * Maximum number of retry attempts
     */
    maxRetries: number;
    /**
     * Initial delay in milliseconds before first retry
     */
    initialDelayMs: number;
    /**
     * Maximum delay in milliseconds between retries
     */
    maxDelayMs: number;
    /**
     * Multiplier for exponential backoff
     */
    backoffMultiplier: number;
    /**
     * HTTP status codes that should trigger a retry
     */
    retryableStatusCodes: number[];
}
/**
 * Configuration for the Zaguán client
 */
export interface ZaguanConfig {
    /**
     * Base URL for the Zaguán API (e.g. "https://api.zaguan.example.com")
     */
    baseUrl: string;
    /**
     * API key for authentication
     */
    apiKey: string;
    /**
     * Optional timeout in milliseconds for requests (default: 60000ms / 60 seconds)
     */
    timeoutMs?: number;
    /**
     * Optional custom fetch implementation
     */
    fetch?: typeof fetch;
    /**
     * Optional retry configuration for failed requests
     */
    retry?: Partial<RetryConfig>;
    /**
     * Optional logging hook for observability
     */
    onLog?: (event: LogEvent) => void;
}
/**
 * Options for individual requests
 */
export interface RequestOptions {
    /**
     * Optional request ID - if not provided, one will be generated
     */
    requestId?: string;
    /**
     * Optional timeout in milliseconds for this specific request
     */
    timeoutMs?: number;
    /**
     * Optional additional headers to include in the request
     */
    headers?: Record<string, string>;
    /**
     * Optional AbortSignal for cancellation
     */
    signal?: AbortSignal;
}
/**
 * Main client class for interacting with the Zaguán API
 */
export declare class ZaguanClient {
    private readonly baseUrl;
    private readonly apiKey;
    private readonly timeoutMs?;
    private readonly fetchImpl;
    private readonly retryConfig;
    private readonly onLog?;
    /**
     * Create a new Zaguán client
     * @param config Configuration for the client
     */
    constructor(config: ZaguanConfig);
    /**
     * Helper method to reconstruct a complete message from streaming chunks
     * @param chunks Array of chat chunks from streaming
     * @returns Reconstructed chat response
     */
    static reconstructMessageFromChunks(chunks: ChatChunk[]): ChatResponse;
    /**
     * Helper method to extract thinking content from Perplexity responses
     * Perplexity embeds reasoning in <think> tags within the content
     * @param content The response content to parse
     * @returns Object with thinking content and cleaned response text
     */
    static extractPerplexityThinking(content: string): {
        thinking: string | null;
        response: string;
    };
    /**
     * Helper method to check if a response has reasoning tokens
     * @param usage Usage object from a chat response
     * @returns True if reasoning tokens are present
     */
    static hasReasoningTokens(usage: {
        completion_tokens_details?: {
            reasoning_tokens?: number;
        };
    }): boolean;
    /**
     * Make a non-streaming chat completion request
     * @param request The chat completion request
     * @param options Optional request options
     * @returns The chat completion response
     */
    chat(request: ChatRequest, options?: RequestOptions): Promise<ChatResponse>;
    /**
     * Make a streaming chat completion request
     * @param request The chat completion request
     * @param options Optional request options
     * @returns An async iterable of chat chunks
     */
    chatStream(request: ChatRequest, options?: RequestOptions): AsyncIterable<ChatChunk>;
    /**
     * List available models
     * @param options Optional request options
     * @returns Array of model information
     */
    listModels(options?: RequestOptions): Promise<ModelInfo[]>;
    /**
     * Get model capabilities
     * @param options Optional request options
     * @returns Array of model capabilities
     */
    getCapabilities(options?: RequestOptions): Promise<ModelCapabilities[]>;
    /**
     * Get model capabilities with filtering options
     * @param filter Filter options for capabilities
     * @param options Optional request options
     * @returns Array of filtered model capabilities
     */
    getCapabilitiesWithFilter(filter: {
        provider?: string;
        supportsVision?: boolean;
        supportsTools?: boolean;
        supportsReasoning?: boolean;
    }, options?: RequestOptions): Promise<ModelCapabilities[]>;
    /**
     * Get credits balance
     * @param options Optional request options
     * @returns Credits balance information
     */
    getCreditsBalance(options?: RequestOptions): Promise<CreditsBalance>;
    /**
     * Get credits history
     * @param options Optional query options for filtering history
     * @param requestOptions Optional request options
     * @returns Credits history with pagination
     */
    getCreditsHistory(options?: CreditsHistoryOptions, requestOptions?: RequestOptions): Promise<CreditsHistory>;
    /**
     * Get credits statistics
     * @param options Optional query options for filtering stats
     * @param requestOptions Optional request options
     * @returns Credits statistics with aggregations
     */
    getCreditsStats(options?: CreditsStatsOptions, requestOptions?: RequestOptions): Promise<CreditsStats>;
    /**
     * Transcribe audio to text
     * @param request Audio transcription request
     * @param options Optional request options
     * @returns Transcription response
     */
    transcribeAudio(request: AudioTranscriptionRequest, options?: RequestOptions): Promise<AudioTranscriptionResponse>;
    /**
     * Translate audio to English text
     * @param request Audio translation request
     * @param options Optional request options
     * @returns Translation response
     */
    translateAudio(request: AudioTranslationRequest, options?: RequestOptions): Promise<AudioTranslationResponse>;
    /**
     * Generate speech from text
     * @param request Speech generation request
     * @param options Optional request options
     * @returns Audio data as ArrayBuffer
     */
    generateSpeech(request: SpeechRequest, options?: RequestOptions): Promise<ArrayBuffer>;
    /**
     * Generate images from text prompt
     * @param request Image generation request
     * @param options Optional request options
     * @returns Image generation response
     */
    generateImage(request: ImageGenerationRequest, options?: RequestOptions): Promise<ImageGenerationResponse>;
    /**
     * Edit an image with a prompt
     * @param request Image edit request
     * @param options Optional request options
     * @returns Image generation response
     */
    editImage(request: ImageEditRequest, options?: RequestOptions): Promise<ImageGenerationResponse>;
    /**
     * Create variations of an image
     * @param request Image variation request
     * @param options Optional request options
     * @returns Image generation response
     */
    createImageVariation(request: ImageVariationRequest, options?: RequestOptions): Promise<ImageGenerationResponse>;
    /**
     * Create embeddings for text
     * @param request Embeddings request
     * @param options Optional request options
     * @returns Embeddings response
     */
    createEmbeddings(request: EmbeddingsRequest, options?: RequestOptions): Promise<EmbeddingsResponse>;
    /**
     * Create a batch processing job
     * @param request Batch request
     * @param options Optional request options
     * @returns Batch object
     */
    createBatch(request: BatchRequest, options?: RequestOptions): Promise<BatchObject>;
    /**
     * Retrieve a batch by ID
     * @param batchId Batch ID
     * @param options Optional request options
     * @returns Batch object
     */
    retrieveBatch(batchId: string, options?: RequestOptions): Promise<BatchObject>;
    /**
     * Cancel a batch
     * @param batchId Batch ID
     * @param options Optional request options
     * @returns Batch object
     */
    cancelBatch(batchId: string, options?: RequestOptions): Promise<BatchObject>;
    /**
     * List batches
     * @param options Optional request options
     * @returns Batch list response
     */
    listBatches(options?: RequestOptions): Promise<BatchListResponse>;
    /**
     * Create an assistant
     * @param request Assistant request
     * @param options Optional request options
     * @returns Assistant object
     */
    createAssistant(request: AssistantRequest, options?: RequestOptions): Promise<AssistantObject>;
    /**
     * Retrieve an assistant by ID
     * @param assistantId Assistant ID
     * @param options Optional request options
     * @returns Assistant object
     */
    retrieveAssistant(assistantId: string, options?: RequestOptions): Promise<AssistantObject>;
    /**
     * Update an assistant
     * @param assistantId Assistant ID
     * @param request Assistant request
     * @param options Optional request options
     * @returns Assistant object
     */
    updateAssistant(assistantId: string, request: Partial<AssistantRequest>, options?: RequestOptions): Promise<AssistantObject>;
    /**
     * Delete an assistant
     * @param assistantId Assistant ID
     * @param options Optional request options
     * @returns Deletion status
     */
    deleteAssistant(assistantId: string, options?: RequestOptions): Promise<{
        id: string;
        object: string;
        deleted: boolean;
    }>;
    /**
     * Create a thread
     * @param request Thread request
     * @param options Optional request options
     * @returns Thread object
     */
    createThread(request?: ThreadRequest, options?: RequestOptions): Promise<ThreadObject>;
    /**
     * Retrieve a thread by ID
     * @param threadId Thread ID
     * @param options Optional request options
     * @returns Thread object
     */
    retrieveThread(threadId: string, options?: RequestOptions): Promise<ThreadObject>;
    /**
     * Delete a thread
     * @param threadId Thread ID
     * @param options Optional request options
     * @returns Deletion status
     */
    deleteThread(threadId: string, options?: RequestOptions): Promise<{
        id: string;
        object: string;
        deleted: boolean;
    }>;
    /**
     * Create a run
     * @param threadId Thread ID
     * @param request Run request
     * @param options Optional request options
     * @returns Run object
     */
    createRun(threadId: string, request: RunRequest, options?: RequestOptions): Promise<RunObject>;
    /**
     * Retrieve a run
     * @param threadId Thread ID
     * @param runId Run ID
     * @param options Optional request options
     * @returns Run object
     */
    retrieveRun(threadId: string, runId: string, options?: RequestOptions): Promise<RunObject>;
    /**
     * Cancel a run
     * @param threadId Thread ID
     * @param runId Run ID
     * @param options Optional request options
     * @returns Run object
     */
    cancelRun(threadId: string, runId: string, options?: RequestOptions): Promise<RunObject>;
    /**
     * Create a fine-tuning job
     * @param request Fine-tuning job request
     * @param options Optional request options
     * @returns Fine-tuning job object
     */
    createFineTuningJob(request: FineTuningJobRequest, options?: RequestOptions): Promise<FineTuningJobObject>;
    /**
     * List fine-tuning jobs
     * @param options Optional request options
     * @returns Fine-tuning job list response
     */
    listFineTuningJobs(options?: RequestOptions): Promise<FineTuningJobListResponse>;
    /**
     * Retrieve a fine-tuning job
     * @param jobId Job ID
     * @param options Optional request options
     * @returns Fine-tuning job object
     */
    retrieveFineTuningJob(jobId: string, options?: RequestOptions): Promise<FineTuningJobObject>;
    /**
     * Cancel a fine-tuning job
     * @param jobId Job ID
     * @param options Optional request options
     * @returns Fine-tuning job object
     */
    cancelFineTuningJob(jobId: string, options?: RequestOptions): Promise<FineTuningJobObject>;
    /**
     * List fine-tuning job events
     * @param jobId Job ID
     * @param options Optional request options
     * @returns Array of fine-tuning job events
     */
    listFineTuningEvents(jobId: string, options?: RequestOptions): Promise<FineTuningJobEvent[]>;
    /**
     * Classify text for content moderation
     * @param request Moderation request
     * @param options Optional request options
     * @returns Moderation response
     */
    createModeration(request: ModerationRequest, options?: RequestOptions): Promise<ModerationResponse>;
    /**
     * Send a message using Anthropic's native Messages API
     * @param request Messages request
     * @param options Optional request options
     * @returns Messages response
     */
    messages(request: MessagesRequest, options?: RequestOptions): Promise<MessagesResponse>;
    /**
     * Stream messages using Anthropic's native Messages API
     * @param request Messages request
     * @param options Optional request options
     * @returns Async iterable of message stream chunks
     */
    messagesStream(request: MessagesRequest, options?: RequestOptions): AsyncIterable<MessagesStreamChunk>;
    /**
     * Count tokens for a message request
     * @param request Token counting request
     * @param options Optional request options
     * @returns Token count response
     */
    countTokens(request: CountTokensRequest, options?: RequestOptions): Promise<CountTokensResponse>;
    /**
     * Create a batch of message requests
     * @param requests Array of batch request items
     * @param options Optional request options
     * @returns Batch response
     */
    createMessagesBatch(requests: MessagesBatchRequestItem[], options?: RequestOptions): Promise<MessagesBatchResponse>;
    /**
     * Get a message batch by ID
     * @param batchId Batch ID
     * @param options Optional request options
     * @returns Batch response
     */
    getMessagesBatch(batchId: string, options?: RequestOptions): Promise<MessagesBatchResponse>;
    /**
     * List message batches
     * @param options Optional request options
     * @returns Array of batch responses
     */
    listMessagesBatches(options?: RequestOptions): Promise<MessagesBatchResponse[]>;
    /**
     * Cancel a message batch
     * @param batchId Batch ID
     * @param options Optional request options
     * @returns Batch response
     */
    cancelMessagesBatch(batchId: string, options?: RequestOptions): Promise<MessagesBatchResponse>;
    /**
     * Get message batch results
     * @param batchId Batch ID
     * @param options Optional request options
     * @returns Readable stream of results
     */
    getMessagesBatchResults(batchId: string, options?: RequestOptions): Promise<ReadableStream<Uint8Array>>;
    /**
     * Create headers for a request
     *
     * @param options Request options
     * @returns Headers object and request ID
     */
    private createRequestHeaders;
}
