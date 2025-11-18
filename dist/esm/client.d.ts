/**
 * Main client for the Zaguán SDK
 *
 * This file contains the main client class that provides access to all Zaguán API endpoints.
 */
import { ChatRequest, ChatResponse, ChatChunk, ModelInfo, ModelCapabilities, CreditsBalance, CreditsHistory, CreditsHistoryOptions, CreditsStats, CreditsStatsOptions } from './types.js';
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
     * Optional timeout in milliseconds for requests
     */
    timeoutMs?: number;
    /**
     * Optional custom fetch implementation
     */
    fetch?: typeof fetch;
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
    /**
     * Create a new Zaguán client
     * @param config Configuration for the client
     */
    constructor(config: ZaguanConfig);
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
     * Create headers for a request
     *
     * @param options Request options
     * @returns Headers object and request ID
     */
    private createRequestHeaders;
}
