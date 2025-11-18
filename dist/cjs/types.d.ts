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
    by_model?: Record<string, {
        requests: number;
        tokens: number;
        credits: number;
        cost: number;
    }>;
    by_provider?: Record<string, {
        requests: number;
        tokens: number;
        credits: number;
        cost: number;
    }>;
    by_band?: Record<string, {
        requests: number;
        tokens: number;
        credits: number;
        cost: number;
    }>;
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
