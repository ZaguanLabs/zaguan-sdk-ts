"use strict";
/**
 * Main client for the Zaguán SDK
 *
 * This file contains the main client class that provides access to all Zaguán API endpoints.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZaguanClient = void 0;
const errors_js_1 = require("./errors.js");
const utils_js_1 = require("./utils.js");
const http_js_1 = require("./http.js");
/**
 * Main client class for interacting with the Zaguán API
 */
class ZaguanClient {
    /**
     * Create a new Zaguán client
     * @param config Configuration for the client
     */
    constructor(config) {
        // Validate required configuration
        if (!config.baseUrl || typeof config.baseUrl !== 'string') {
            throw new errors_js_1.ZaguanError('baseUrl is required and must be a non-empty string');
        }
        if (!config.apiKey || typeof config.apiKey !== 'string') {
            throw new errors_js_1.ZaguanError('apiKey is required and must be a non-empty string');
        }
        // Validate baseUrl format
        try {
            new URL(config.baseUrl);
        }
        catch {
            throw new errors_js_1.ZaguanError('baseUrl must be a valid URL');
        }
        // Validate timeout if provided
        if (config.timeoutMs !== undefined &&
            (typeof config.timeoutMs !== 'number' || config.timeoutMs <= 0)) {
            throw new errors_js_1.ZaguanError('timeoutMs must be a positive number');
        }
        this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
        this.apiKey = config.apiKey;
        this.timeoutMs = config.timeoutMs;
        this.fetchImpl = config.fetch ?? fetch;
        this.onLog = config.onLog;
        // Set up retry configuration with defaults
        this.retryConfig = {
            maxRetries: config.retry?.maxRetries ?? 0,
            initialDelayMs: config.retry?.initialDelayMs ?? 1000,
            maxDelayMs: config.retry?.maxDelayMs ?? 10000,
            backoffMultiplier: config.retry?.backoffMultiplier ?? 2,
            retryableStatusCodes: config.retry?.retryableStatusCodes ?? [
                408, 429, 500, 502, 503, 504,
            ],
        };
    }
    /**
     * Helper method to reconstruct a complete message from streaming chunks
     * @param chunks Array of chat chunks from streaming
     * @returns Reconstructed chat response
     */
    static reconstructMessageFromChunks(chunks) {
        if (chunks.length === 0) {
            throw new errors_js_1.ZaguanError('Cannot reconstruct message from empty chunks array');
        }
        const firstChunk = chunks[0]; // Safe because we checked length above
        let content = '';
        let role = 'assistant';
        const toolCalls = [];
        let finishReason;
        // Accumulate content and tool calls from all chunks
        for (const chunk of chunks) {
            const delta = chunk.choices[0]?.delta;
            if (delta) {
                if (delta.content) {
                    content += delta.content;
                }
                if (delta.role) {
                    role = delta.role;
                }
                if (delta.tool_calls) {
                    for (const toolCall of delta.tool_calls) {
                        if (toolCall.id) {
                            toolCalls.push({
                                id: toolCall.id,
                                type: 'function',
                                function: {
                                    name: toolCall.function?.name || '',
                                    arguments: toolCall.function?.arguments || '',
                                },
                            });
                        }
                    }
                }
            }
            if (chunk.choices[0]?.finish_reason) {
                finishReason = chunk.choices[0].finish_reason;
            }
        }
        return {
            id: firstChunk.id,
            object: 'chat.completion',
            created: firstChunk.created,
            model: firstChunk.model,
            choices: [
                {
                    index: 0,
                    message: {
                        role: role,
                        content,
                        tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
                    },
                    finish_reason: finishReason,
                },
            ],
            usage: {
                prompt_tokens: 0,
                completion_tokens: 0,
                total_tokens: 0,
            },
        };
    }
    /**
     * Make a non-streaming chat completion request
     * @param request The chat completion request
     * @param options Optional request options
     * @returns The chat completion response
     */
    async chat(request, options = {}) {
        // Validate request
        if (!request.model || typeof request.model !== 'string') {
            throw new errors_js_1.ZaguanError('model is required and must be a non-empty string');
        }
        if (!Array.isArray(request.messages) || request.messages.length === 0) {
            throw new errors_js_1.ZaguanError('messages is required and must be a non-empty array');
        }
        const { headers } = this.createRequestHeaders(options);
        const timeoutMs = options.timeoutMs ?? this.timeoutMs ?? undefined;
        const httpOptions = {
            method: 'POST',
            headers,
            body: JSON.stringify(request),
            timeoutMs,
            signal: options.signal ?? undefined,
        };
        const response = await (0, http_js_1.makeHttpRequest)(`${this.baseUrl}/v1/chat/completions`, httpOptions, this.fetchImpl);
        return (0, http_js_1.handleHttpResponse)(response);
    }
    /**
     * Make a streaming chat completion request
     * @param request The chat completion request
     * @param options Optional request options
     * @returns An async iterable of chat chunks
     */
    async *chatStream(request, options = {}) {
        // Validate request
        if (!request.model || typeof request.model !== 'string') {
            throw new errors_js_1.ZaguanError('model is required and must be a non-empty string');
        }
        if (!Array.isArray(request.messages) || request.messages.length === 0) {
            throw new errors_js_1.ZaguanError('messages is required and must be a non-empty array');
        }
        // Create a streaming request by setting stream to true
        const streamingRequest = { ...request, stream: true };
        const { headers, requestId } = this.createRequestHeaders(options);
        const timeoutMs = options.timeoutMs ?? this.timeoutMs ?? undefined;
        const httpOptions = {
            method: 'POST',
            headers,
            body: JSON.stringify(streamingRequest),
            timeoutMs,
            signal: options.signal ?? undefined,
        };
        const response = await (0, http_js_1.makeHttpRequest)(`${this.baseUrl}/v1/chat/completions`, httpOptions, this.fetchImpl);
        // Handle HTTP errors
        if (!response.ok) {
            await (0, http_js_1.handleHttpResponse)(response);
            // handleHttpResponse will throw an error, so this line should never be reached
            return;
        }
        // Check if response has a body
        if (!response.body) {
            throw new errors_js_1.APIError(500, 'Response body is null', requestId);
        }
        // Create a reader for the response body
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        try {
            while (true) {
                // Check if the signal is aborted before reading
                if (options.signal?.aborted) {
                    throw new errors_js_1.ZaguanError('Request aborted');
                }
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }
                // Check if the signal is aborted after reading
                if (options.signal?.aborted) {
                    throw new errors_js_1.ZaguanError('Request aborted');
                }
                // Decode the chunk and add it to our buffer
                buffer += decoder.decode(value, { stream: true });
                // Process complete lines from the buffer
                let newlineIndex;
                while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
                    const line = buffer.slice(0, newlineIndex).trim();
                    buffer = buffer.slice(newlineIndex + 1);
                    // Skip empty lines
                    if (!line) {
                        continue;
                    }
                    // Skip lines that don't start with "data:"
                    if (!line.startsWith('data:')) {
                        continue;
                    }
                    // Extract the data part
                    const dataStr = line.slice(5).trim(); // Remove "data:" prefix
                    // Check for end of stream
                    if (dataStr === '[DONE]') {
                        return;
                    }
                    // Parse and yield the chunk
                    try {
                        const chunk = JSON.parse(dataStr);
                        yield chunk;
                    }
                    catch {
                        // Skip malformed chunks
                        // In a production environment, you might want to log this with a proper logger
                    }
                }
            }
        }
        catch (error) {
            // If the error is from aborting, re-throw it
            if (error instanceof Error && error.name === 'AbortError') {
                throw new errors_js_1.ZaguanError('Request aborted');
            }
            // Wrap network errors in a more descriptive error
            if (error instanceof Error) {
                throw new errors_js_1.ZaguanError(`Streaming error: ${error.message}`);
            }
            throw error;
        }
        finally {
            // Clean up the reader - use try-catch to prevent errors during cleanup
            try {
                reader.releaseLock();
            }
            catch {
                // Ignore errors during cleanup
            }
        }
    }
    /**
     * List available models
     * @param options Optional request options
     * @returns Array of model information
     */
    async listModels(options = {}) {
        const { headers } = this.createRequestHeaders(options);
        const timeoutMs = options.timeoutMs ?? this.timeoutMs ?? undefined;
        const httpOptions = {
            method: 'GET',
            headers,
            timeoutMs,
            signal: options.signal ?? undefined,
        };
        const response = await (0, http_js_1.makeHttpRequest)(`${this.baseUrl}/v1/models`, httpOptions, this.fetchImpl);
        const result = await (0, http_js_1.handleHttpResponse)(response);
        return result.data;
    }
    /**
     * Get model capabilities
     * @param options Optional request options
     * @returns Array of model capabilities
     */
    async getCapabilities(options = {}) {
        const { headers } = this.createRequestHeaders(options);
        const timeoutMs = options.timeoutMs ?? this.timeoutMs ?? undefined;
        const httpOptions = {
            method: 'GET',
            headers,
            timeoutMs,
            signal: options.signal ?? undefined,
        };
        const response = await (0, http_js_1.makeHttpRequest)(`${this.baseUrl}/v1/capabilities`, httpOptions, this.fetchImpl);
        return (0, http_js_1.handleHttpResponse)(response);
    }
    /**
     * Get model capabilities with filtering options
     * @param filter Filter options for capabilities
     * @param options Optional request options
     * @returns Array of filtered model capabilities
     */
    async getCapabilitiesWithFilter(filter, options = {}) {
        const { headers } = this.createRequestHeaders(options);
        // Build query string from filter options
        const queryParams = new URLSearchParams();
        if (filter.provider) {
            queryParams.append('provider', filter.provider);
        }
        if (filter.supportsVision !== undefined) {
            queryParams.append('supports_vision', filter.supportsVision.toString());
        }
        if (filter.supportsTools !== undefined) {
            queryParams.append('supports_tools', filter.supportsTools.toString());
        }
        if (filter.supportsReasoning !== undefined) {
            queryParams.append('supports_reasoning', filter.supportsReasoning.toString());
        }
        const queryString = queryParams.toString();
        const url = queryString
            ? `${this.baseUrl}/v1/capabilities?${queryString}`
            : `${this.baseUrl}/v1/capabilities`;
        const timeoutMs = options.timeoutMs ?? this.timeoutMs ?? undefined;
        const httpOptions = {
            method: 'GET',
            headers,
            timeoutMs,
            signal: options.signal ?? undefined,
        };
        const response = await (0, http_js_1.makeHttpRequest)(url, httpOptions, this.fetchImpl);
        return (0, http_js_1.handleHttpResponse)(response);
    }
    /**
     * Get credits balance
     * @param options Optional request options
     * @returns Credits balance information
     */
    async getCreditsBalance(options = {}) {
        const { headers } = this.createRequestHeaders(options);
        const timeoutMs = options.timeoutMs ?? this.timeoutMs ?? undefined;
        const httpOptions = {
            method: 'GET',
            headers,
            timeoutMs,
            signal: options.signal ?? undefined,
        };
        const response = await (0, http_js_1.makeHttpRequest)(`${this.baseUrl}/v1/credits/balance`, httpOptions, this.fetchImpl);
        return (0, http_js_1.handleHttpResponse)(response);
    }
    /**
     * Get credits history
     * @param options Optional query options for filtering history
     * @param requestOptions Optional request options
     * @returns Credits history with pagination
     */
    async getCreditsHistory(options = {}, requestOptions = {}) {
        const { headers } = this.createRequestHeaders(requestOptions);
        // Build query string from options
        const queryParams = new URLSearchParams();
        if (options.page !== undefined) {
            queryParams.append('page', options.page.toString());
        }
        if (options.page_size !== undefined) {
            queryParams.append('page_size', options.page_size.toString());
        }
        if (options.start_date) {
            queryParams.append('start_date', options.start_date);
        }
        if (options.end_date) {
            queryParams.append('end_date', options.end_date);
        }
        if (options.model) {
            queryParams.append('model', options.model);
        }
        if (options.provider) {
            queryParams.append('provider', options.provider);
        }
        const queryString = queryParams.toString();
        const url = queryString
            ? `${this.baseUrl}/v1/credits/history?${queryString}`
            : `${this.baseUrl}/v1/credits/history`;
        const timeoutMs = requestOptions.timeoutMs ?? this.timeoutMs ?? undefined;
        const httpOptions = {
            method: 'GET',
            headers,
            timeoutMs,
            signal: requestOptions.signal ?? undefined,
        };
        const response = await (0, http_js_1.makeHttpRequest)(url, httpOptions, this.fetchImpl);
        return (0, http_js_1.handleHttpResponse)(response);
    }
    /**
     * Get credits statistics
     * @param options Optional query options for filtering stats
     * @param requestOptions Optional request options
     * @returns Credits statistics with aggregations
     */
    async getCreditsStats(options = {}, requestOptions = {}) {
        const { headers } = this.createRequestHeaders(requestOptions);
        // Build query string from options
        const queryParams = new URLSearchParams();
        if (options.start_date) {
            queryParams.append('start_date', options.start_date);
        }
        if (options.end_date) {
            queryParams.append('end_date', options.end_date);
        }
        if (options.group_by) {
            queryParams.append('group_by', options.group_by);
        }
        if (options.model) {
            queryParams.append('model', options.model);
        }
        if (options.provider) {
            queryParams.append('provider', options.provider);
        }
        if (options.band) {
            queryParams.append('band', options.band);
        }
        const queryString = queryParams.toString();
        const url = queryString
            ? `${this.baseUrl}/v1/credits/stats?${queryString}`
            : `${this.baseUrl}/v1/credits/stats`;
        const timeoutMs = requestOptions.timeoutMs ?? this.timeoutMs ?? undefined;
        const httpOptions = {
            method: 'GET',
            headers,
            timeoutMs,
            signal: requestOptions.signal ?? undefined,
        };
        const response = await (0, http_js_1.makeHttpRequest)(url, httpOptions, this.fetchImpl);
        return (0, http_js_1.handleHttpResponse)(response);
    }
    // ============================================================================
    // AUDIO ENDPOINTS
    // ============================================================================
    /**
     * Transcribe audio to text
     * @param request Audio transcription request
     * @param options Optional request options
     * @returns Transcription response
     */
    async transcribeAudio(request, options = {}) {
        const { headers } = this.createRequestHeaders(options);
        const formData = new FormData();
        formData.append('file', request.file);
        formData.append('model', request.model);
        if (request.language) {
            formData.append('language', request.language);
        }
        if (request.prompt) {
            formData.append('prompt', request.prompt);
        }
        if (request.response_format) {
            formData.append('response_format', request.response_format);
        }
        if (request.temperature !== undefined) {
            formData.append('temperature', request.temperature.toString());
        }
        if (request.timestamp_granularities) {
            formData.append('timestamp_granularities[]', request.timestamp_granularities.join(','));
        }
        const timeoutMs = options.timeoutMs ?? this.timeoutMs ?? undefined;
        // Remove Content-Type header to let fetch set it with boundary
        const { 'Content-Type': _, ...headersWithoutContentType } = headers;
        const httpOptions = {
            method: 'POST',
            headers: headersWithoutContentType,
            body: formData,
            timeoutMs,
            signal: options.signal ?? undefined,
        };
        const response = await (0, http_js_1.makeHttpRequest)(`${this.baseUrl}/v1/audio/transcriptions`, httpOptions, this.fetchImpl);
        return (0, http_js_1.handleHttpResponse)(response);
    }
    /**
     * Translate audio to English text
     * @param request Audio translation request
     * @param options Optional request options
     * @returns Translation response
     */
    async translateAudio(request, options = {}) {
        const { headers } = this.createRequestHeaders(options);
        const formData = new FormData();
        formData.append('file', request.file);
        formData.append('model', request.model);
        if (request.prompt) {
            formData.append('prompt', request.prompt);
        }
        if (request.response_format) {
            formData.append('response_format', request.response_format);
        }
        if (request.temperature !== undefined) {
            formData.append('temperature', request.temperature.toString());
        }
        const timeoutMs = options.timeoutMs ?? this.timeoutMs ?? undefined;
        const { 'Content-Type': _, ...headersWithoutContentType } = headers;
        const httpOptions = {
            method: 'POST',
            headers: headersWithoutContentType,
            body: formData,
            timeoutMs,
            signal: options.signal ?? undefined,
        };
        const response = await (0, http_js_1.makeHttpRequest)(`${this.baseUrl}/v1/audio/translations`, httpOptions, this.fetchImpl);
        return (0, http_js_1.handleHttpResponse)(response);
    }
    /**
     * Generate speech from text
     * @param request Speech generation request
     * @param options Optional request options
     * @returns Audio data as ArrayBuffer
     */
    async generateSpeech(request, options = {}) {
        const { headers } = this.createRequestHeaders(options);
        const timeoutMs = options.timeoutMs ?? this.timeoutMs ?? undefined;
        const httpOptions = {
            method: 'POST',
            headers,
            body: JSON.stringify(request),
            timeoutMs,
            signal: options.signal ?? undefined,
        };
        const response = await (0, http_js_1.makeHttpRequest)(`${this.baseUrl}/v1/audio/speech`, httpOptions, this.fetchImpl);
        if (!response.ok) {
            await (0, http_js_1.handleHttpResponse)(response);
        }
        return response.arrayBuffer();
    }
    // ============================================================================
    // IMAGES ENDPOINTS
    // ============================================================================
    /**
     * Generate images from text prompt
     * @param request Image generation request
     * @param options Optional request options
     * @returns Image generation response
     */
    async generateImage(request, options = {}) {
        const { headers } = this.createRequestHeaders(options);
        const timeoutMs = options.timeoutMs ?? this.timeoutMs ?? undefined;
        const httpOptions = {
            method: 'POST',
            headers,
            body: JSON.stringify(request),
            timeoutMs,
            signal: options.signal ?? undefined,
        };
        const response = await (0, http_js_1.makeHttpRequest)(`${this.baseUrl}/v1/images/generations`, httpOptions, this.fetchImpl);
        return (0, http_js_1.handleHttpResponse)(response);
    }
    /**
     * Edit an image with a prompt
     * @param request Image edit request
     * @param options Optional request options
     * @returns Image generation response
     */
    async editImage(request, options = {}) {
        const { headers } = this.createRequestHeaders(options);
        const formData = new FormData();
        formData.append('image', request.image);
        formData.append('prompt', request.prompt);
        if (request.mask) {
            formData.append('mask', request.mask);
        }
        if (request.model) {
            formData.append('model', request.model);
        }
        if (request.n) {
            formData.append('n', request.n.toString());
        }
        if (request.size) {
            formData.append('size', request.size);
        }
        if (request.response_format) {
            formData.append('response_format', request.response_format);
        }
        if (request.user) {
            formData.append('user', request.user);
        }
        const timeoutMs = options.timeoutMs ?? this.timeoutMs ?? undefined;
        const { 'Content-Type': _, ...headersWithoutContentType } = headers;
        const httpOptions = {
            method: 'POST',
            headers: headersWithoutContentType,
            body: formData,
            timeoutMs,
            signal: options.signal ?? undefined,
        };
        const response = await (0, http_js_1.makeHttpRequest)(`${this.baseUrl}/v1/images/edits`, httpOptions, this.fetchImpl);
        return (0, http_js_1.handleHttpResponse)(response);
    }
    /**
     * Create variations of an image
     * @param request Image variation request
     * @param options Optional request options
     * @returns Image generation response
     */
    async createImageVariation(request, options = {}) {
        const { headers } = this.createRequestHeaders(options);
        const formData = new FormData();
        formData.append('image', request.image);
        if (request.model) {
            formData.append('model', request.model);
        }
        if (request.n) {
            formData.append('n', request.n.toString());
        }
        if (request.response_format) {
            formData.append('response_format', request.response_format);
        }
        if (request.size) {
            formData.append('size', request.size);
        }
        if (request.user) {
            formData.append('user', request.user);
        }
        const timeoutMs = options.timeoutMs ?? this.timeoutMs ?? undefined;
        const { 'Content-Type': _, ...headersWithoutContentType } = headers;
        const httpOptions = {
            method: 'POST',
            headers: headersWithoutContentType,
            body: formData,
            timeoutMs,
            signal: options.signal ?? undefined,
        };
        const response = await (0, http_js_1.makeHttpRequest)(`${this.baseUrl}/v1/images/variations`, httpOptions, this.fetchImpl);
        return (0, http_js_1.handleHttpResponse)(response);
    }
    // ============================================================================
    // EMBEDDINGS ENDPOINT
    // ============================================================================
    /**
     * Create embeddings for text
     * @param request Embeddings request
     * @param options Optional request options
     * @returns Embeddings response
     */
    async createEmbeddings(request, options = {}) {
        const { headers } = this.createRequestHeaders(options);
        const timeoutMs = options.timeoutMs ?? this.timeoutMs ?? undefined;
        const httpOptions = {
            method: 'POST',
            headers,
            body: JSON.stringify(request),
            timeoutMs,
            signal: options.signal ?? undefined,
        };
        const response = await (0, http_js_1.makeHttpRequest)(`${this.baseUrl}/v1/embeddings`, httpOptions, this.fetchImpl);
        return (0, http_js_1.handleHttpResponse)(response);
    }
    // ============================================================================
    // BATCHES ENDPOINTS
    // ============================================================================
    /**
     * Create a batch processing job
     * @param request Batch request
     * @param options Optional request options
     * @returns Batch object
     */
    async createBatch(request, options = {}) {
        const { headers } = this.createRequestHeaders(options);
        const timeoutMs = options.timeoutMs ?? this.timeoutMs ?? undefined;
        const httpOptions = {
            method: 'POST',
            headers,
            body: JSON.stringify(request),
            timeoutMs,
            signal: options.signal ?? undefined,
        };
        const response = await (0, http_js_1.makeHttpRequest)(`${this.baseUrl}/v1/batches`, httpOptions, this.fetchImpl);
        return (0, http_js_1.handleHttpResponse)(response);
    }
    /**
     * Retrieve a batch by ID
     * @param batchId Batch ID
     * @param options Optional request options
     * @returns Batch object
     */
    async retrieveBatch(batchId, options = {}) {
        const { headers } = this.createRequestHeaders(options);
        const timeoutMs = options.timeoutMs ?? this.timeoutMs ?? undefined;
        const httpOptions = {
            method: 'GET',
            headers,
            timeoutMs,
            signal: options.signal ?? undefined,
        };
        const response = await (0, http_js_1.makeHttpRequest)(`${this.baseUrl}/v1/batches/${batchId}`, httpOptions, this.fetchImpl);
        return (0, http_js_1.handleHttpResponse)(response);
    }
    /**
     * Cancel a batch
     * @param batchId Batch ID
     * @param options Optional request options
     * @returns Batch object
     */
    async cancelBatch(batchId, options = {}) {
        const { headers } = this.createRequestHeaders(options);
        const timeoutMs = options.timeoutMs ?? this.timeoutMs ?? undefined;
        const httpOptions = {
            method: 'POST',
            headers,
            timeoutMs,
            signal: options.signal ?? undefined,
        };
        const response = await (0, http_js_1.makeHttpRequest)(`${this.baseUrl}/v1/batches/${batchId}/cancel`, httpOptions, this.fetchImpl);
        return (0, http_js_1.handleHttpResponse)(response);
    }
    /**
     * List batches
     * @param options Optional request options
     * @returns Batch list response
     */
    async listBatches(options = {}) {
        const { headers } = this.createRequestHeaders(options);
        const timeoutMs = options.timeoutMs ?? this.timeoutMs ?? undefined;
        const httpOptions = {
            method: 'GET',
            headers,
            timeoutMs,
            signal: options.signal ?? undefined,
        };
        const response = await (0, http_js_1.makeHttpRequest)(`${this.baseUrl}/v1/batches`, httpOptions, this.fetchImpl);
        return (0, http_js_1.handleHttpResponse)(response);
    }
    // ============================================================================
    // ASSISTANTS ENDPOINTS
    // ============================================================================
    /**
     * Create an assistant
     * @param request Assistant request
     * @param options Optional request options
     * @returns Assistant object
     */
    async createAssistant(request, options = {}) {
        const { headers } = this.createRequestHeaders(options);
        const timeoutMs = options.timeoutMs ?? this.timeoutMs ?? undefined;
        const httpOptions = {
            method: 'POST',
            headers,
            body: JSON.stringify(request),
            timeoutMs,
            signal: options.signal ?? undefined,
        };
        const response = await (0, http_js_1.makeHttpRequest)(`${this.baseUrl}/v1/assistants`, httpOptions, this.fetchImpl);
        return (0, http_js_1.handleHttpResponse)(response);
    }
    /**
     * Retrieve an assistant by ID
     * @param assistantId Assistant ID
     * @param options Optional request options
     * @returns Assistant object
     */
    async retrieveAssistant(assistantId, options = {}) {
        const { headers } = this.createRequestHeaders(options);
        const timeoutMs = options.timeoutMs ?? this.timeoutMs ?? undefined;
        const httpOptions = {
            method: 'GET',
            headers,
            timeoutMs,
            signal: options.signal ?? undefined,
        };
        const response = await (0, http_js_1.makeHttpRequest)(`${this.baseUrl}/v1/assistants/${assistantId}`, httpOptions, this.fetchImpl);
        return (0, http_js_1.handleHttpResponse)(response);
    }
    /**
     * Update an assistant
     * @param assistantId Assistant ID
     * @param request Assistant request
     * @param options Optional request options
     * @returns Assistant object
     */
    async updateAssistant(assistantId, request, options = {}) {
        const { headers } = this.createRequestHeaders(options);
        const timeoutMs = options.timeoutMs ?? this.timeoutMs ?? undefined;
        const httpOptions = {
            method: 'POST',
            headers,
            body: JSON.stringify(request),
            timeoutMs,
            signal: options.signal ?? undefined,
        };
        const response = await (0, http_js_1.makeHttpRequest)(`${this.baseUrl}/v1/assistants/${assistantId}`, httpOptions, this.fetchImpl);
        return (0, http_js_1.handleHttpResponse)(response);
    }
    /**
     * Delete an assistant
     * @param assistantId Assistant ID
     * @param options Optional request options
     * @returns Deletion status
     */
    async deleteAssistant(assistantId, options = {}) {
        const { headers } = this.createRequestHeaders(options);
        const timeoutMs = options.timeoutMs ?? this.timeoutMs ?? undefined;
        const httpOptions = {
            method: 'DELETE',
            headers,
            timeoutMs,
            signal: options.signal ?? undefined,
        };
        const response = await (0, http_js_1.makeHttpRequest)(`${this.baseUrl}/v1/assistants/${assistantId}`, httpOptions, this.fetchImpl);
        return (0, http_js_1.handleHttpResponse)(response);
    }
    /**
     * Create a thread
     * @param request Thread request
     * @param options Optional request options
     * @returns Thread object
     */
    async createThread(request = {}, options = {}) {
        const { headers } = this.createRequestHeaders(options);
        const timeoutMs = options.timeoutMs ?? this.timeoutMs ?? undefined;
        const httpOptions = {
            method: 'POST',
            headers,
            body: JSON.stringify(request),
            timeoutMs,
            signal: options.signal ?? undefined,
        };
        const response = await (0, http_js_1.makeHttpRequest)(`${this.baseUrl}/v1/threads`, httpOptions, this.fetchImpl);
        return (0, http_js_1.handleHttpResponse)(response);
    }
    /**
     * Retrieve a thread by ID
     * @param threadId Thread ID
     * @param options Optional request options
     * @returns Thread object
     */
    async retrieveThread(threadId, options = {}) {
        const { headers } = this.createRequestHeaders(options);
        const timeoutMs = options.timeoutMs ?? this.timeoutMs ?? undefined;
        const httpOptions = {
            method: 'GET',
            headers,
            timeoutMs,
            signal: options.signal ?? undefined,
        };
        const response = await (0, http_js_1.makeHttpRequest)(`${this.baseUrl}/v1/threads/${threadId}`, httpOptions, this.fetchImpl);
        return (0, http_js_1.handleHttpResponse)(response);
    }
    /**
     * Delete a thread
     * @param threadId Thread ID
     * @param options Optional request options
     * @returns Deletion status
     */
    async deleteThread(threadId, options = {}) {
        const { headers } = this.createRequestHeaders(options);
        const timeoutMs = options.timeoutMs ?? this.timeoutMs ?? undefined;
        const httpOptions = {
            method: 'DELETE',
            headers,
            timeoutMs,
            signal: options.signal ?? undefined,
        };
        const response = await (0, http_js_1.makeHttpRequest)(`${this.baseUrl}/v1/threads/${threadId}`, httpOptions, this.fetchImpl);
        return (0, http_js_1.handleHttpResponse)(response);
    }
    /**
     * Create a run
     * @param threadId Thread ID
     * @param request Run request
     * @param options Optional request options
     * @returns Run object
     */
    async createRun(threadId, request, options = {}) {
        const { headers } = this.createRequestHeaders(options);
        const timeoutMs = options.timeoutMs ?? this.timeoutMs ?? undefined;
        const httpOptions = {
            method: 'POST',
            headers,
            body: JSON.stringify(request),
            timeoutMs,
            signal: options.signal ?? undefined,
        };
        const response = await (0, http_js_1.makeHttpRequest)(`${this.baseUrl}/v1/threads/${threadId}/runs`, httpOptions, this.fetchImpl);
        return (0, http_js_1.handleHttpResponse)(response);
    }
    /**
     * Retrieve a run
     * @param threadId Thread ID
     * @param runId Run ID
     * @param options Optional request options
     * @returns Run object
     */
    async retrieveRun(threadId, runId, options = {}) {
        const { headers } = this.createRequestHeaders(options);
        const timeoutMs = options.timeoutMs ?? this.timeoutMs ?? undefined;
        const httpOptions = {
            method: 'GET',
            headers,
            timeoutMs,
            signal: options.signal ?? undefined,
        };
        const response = await (0, http_js_1.makeHttpRequest)(`${this.baseUrl}/v1/threads/${threadId}/runs/${runId}`, httpOptions, this.fetchImpl);
        return (0, http_js_1.handleHttpResponse)(response);
    }
    /**
     * Cancel a run
     * @param threadId Thread ID
     * @param runId Run ID
     * @param options Optional request options
     * @returns Run object
     */
    async cancelRun(threadId, runId, options = {}) {
        const { headers } = this.createRequestHeaders(options);
        const timeoutMs = options.timeoutMs ?? this.timeoutMs ?? undefined;
        const httpOptions = {
            method: 'POST',
            headers,
            timeoutMs,
            signal: options.signal ?? undefined,
        };
        const response = await (0, http_js_1.makeHttpRequest)(`${this.baseUrl}/v1/threads/${threadId}/runs/${runId}/cancel`, httpOptions, this.fetchImpl);
        return (0, http_js_1.handleHttpResponse)(response);
    }
    // ============================================================================
    // FINE-TUNING ENDPOINTS
    // ============================================================================
    /**
     * Create a fine-tuning job
     * @param request Fine-tuning job request
     * @param options Optional request options
     * @returns Fine-tuning job object
     */
    async createFineTuningJob(request, options = {}) {
        const { headers } = this.createRequestHeaders(options);
        const timeoutMs = options.timeoutMs ?? this.timeoutMs ?? undefined;
        const httpOptions = {
            method: 'POST',
            headers,
            body: JSON.stringify(request),
            timeoutMs,
            signal: options.signal ?? undefined,
        };
        const response = await (0, http_js_1.makeHttpRequest)(`${this.baseUrl}/v1/fine_tuning/jobs`, httpOptions, this.fetchImpl);
        return (0, http_js_1.handleHttpResponse)(response);
    }
    /**
     * List fine-tuning jobs
     * @param options Optional request options
     * @returns Fine-tuning job list response
     */
    async listFineTuningJobs(options = {}) {
        const { headers } = this.createRequestHeaders(options);
        const timeoutMs = options.timeoutMs ?? this.timeoutMs ?? undefined;
        const httpOptions = {
            method: 'GET',
            headers,
            timeoutMs,
            signal: options.signal ?? undefined,
        };
        const response = await (0, http_js_1.makeHttpRequest)(`${this.baseUrl}/v1/fine_tuning/jobs`, httpOptions, this.fetchImpl);
        return (0, http_js_1.handleHttpResponse)(response);
    }
    /**
     * Retrieve a fine-tuning job
     * @param jobId Job ID
     * @param options Optional request options
     * @returns Fine-tuning job object
     */
    async retrieveFineTuningJob(jobId, options = {}) {
        const { headers } = this.createRequestHeaders(options);
        const timeoutMs = options.timeoutMs ?? this.timeoutMs ?? undefined;
        const httpOptions = {
            method: 'GET',
            headers,
            timeoutMs,
            signal: options.signal ?? undefined,
        };
        const response = await (0, http_js_1.makeHttpRequest)(`${this.baseUrl}/v1/fine_tuning/jobs/${jobId}`, httpOptions, this.fetchImpl);
        return (0, http_js_1.handleHttpResponse)(response);
    }
    /**
     * Cancel a fine-tuning job
     * @param jobId Job ID
     * @param options Optional request options
     * @returns Fine-tuning job object
     */
    async cancelFineTuningJob(jobId, options = {}) {
        const { headers } = this.createRequestHeaders(options);
        const timeoutMs = options.timeoutMs ?? this.timeoutMs ?? undefined;
        const httpOptions = {
            method: 'POST',
            headers,
            timeoutMs,
            signal: options.signal ?? undefined,
        };
        const response = await (0, http_js_1.makeHttpRequest)(`${this.baseUrl}/v1/fine_tuning/jobs/${jobId}/cancel`, httpOptions, this.fetchImpl);
        return (0, http_js_1.handleHttpResponse)(response);
    }
    /**
     * List fine-tuning job events
     * @param jobId Job ID
     * @param options Optional request options
     * @returns Array of fine-tuning job events
     */
    async listFineTuningEvents(jobId, options = {}) {
        const { headers } = this.createRequestHeaders(options);
        const timeoutMs = options.timeoutMs ?? this.timeoutMs ?? undefined;
        const httpOptions = {
            method: 'GET',
            headers,
            timeoutMs,
            signal: options.signal ?? undefined,
        };
        const response = await (0, http_js_1.makeHttpRequest)(`${this.baseUrl}/v1/fine_tuning/jobs/${jobId}/events`, httpOptions, this.fetchImpl);
        const result = await (0, http_js_1.handleHttpResponse)(response);
        return result.data;
    }
    // ============================================================================
    // MODERATIONS ENDPOINT
    // ============================================================================
    /**
     * Classify text for content moderation
     * @param request Moderation request
     * @param options Optional request options
     * @returns Moderation response
     */
    async createModeration(request, options = {}) {
        const { headers } = this.createRequestHeaders(options);
        const timeoutMs = options.timeoutMs ?? this.timeoutMs ?? undefined;
        const httpOptions = {
            method: 'POST',
            headers,
            body: JSON.stringify(request),
            timeoutMs,
            signal: options.signal ?? undefined,
        };
        const response = await (0, http_js_1.makeHttpRequest)(`${this.baseUrl}/v1/moderations`, httpOptions, this.fetchImpl);
        return (0, http_js_1.handleHttpResponse)(response);
    }
    /**
     * Create headers for a request
     *
     * @param options Request options
     * @returns Headers object and request ID
     */
    createRequestHeaders(options) {
        const requestId = options.requestId ?? (0, utils_js_1.generateUUID)();
        const headers = (0, utils_js_1.createHeaders)(this.apiKey, requestId, options.headers);
        return { headers, requestId };
    }
}
exports.ZaguanClient = ZaguanClient;
//# sourceMappingURL=client.js.map