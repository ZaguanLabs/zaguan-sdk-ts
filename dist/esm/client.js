/**
 * Main client for the Zaguán SDK
 *
 * This file contains the main client class that provides access to all Zaguán API endpoints.
 */
import { ZaguanError, APIError } from './errors.js';
import { generateUUID, createHeaders } from './utils.js';
import { makeHttpRequest, handleHttpResponse } from './http.js';
/**
 * Main client class for interacting with the Zaguán API
 */
export class ZaguanClient {
    /**
     * Create a new Zaguán client
     * @param config Configuration for the client
     */
    constructor(config) {
        this.baseUrl = config.baseUrl.replace(/\/$/, ""); // Remove trailing slash
        this.apiKey = config.apiKey;
        this.timeoutMs = config.timeoutMs;
        this.fetchImpl = config.fetch ?? fetch;
    }
    /**
     * Make a non-streaming chat completion request
     * @param request The chat completion request
     * @param options Optional request options
     * @returns The chat completion response
     */
    async chat(request, options = {}) {
        const { headers } = this.createRequestHeaders(options);
        const timeoutMs = options.timeoutMs ?? this.timeoutMs ?? undefined;
        const httpOptions = {
            method: 'POST',
            headers,
            body: JSON.stringify(request),
            timeoutMs,
            signal: options.signal ?? undefined
        };
        const response = await makeHttpRequest(`${this.baseUrl}/v1/chat/completions`, httpOptions, this.fetchImpl);
        return handleHttpResponse(response);
    }
    /**
     * Make a streaming chat completion request
     * @param request The chat completion request
     * @param options Optional request options
     * @returns An async iterable of chat chunks
     */
    async *chatStream(request, options = {}) {
        // Create a streaming request by setting stream to true
        const streamingRequest = { ...request, stream: true };
        const { headers, requestId } = this.createRequestHeaders(options);
        const timeoutMs = options.timeoutMs ?? this.timeoutMs ?? undefined;
        const httpOptions = {
            method: 'POST',
            headers,
            body: JSON.stringify(streamingRequest),
            timeoutMs,
            signal: options.signal ?? undefined
        };
        const response = await makeHttpRequest(`${this.baseUrl}/v1/chat/completions`, httpOptions, this.fetchImpl);
        // Handle HTTP errors
        if (!response.ok) {
            await handleHttpResponse(response);
            // handleHttpResponse will throw an error, so this line should never be reached
            return;
        }
        // Check if response has a body
        if (!response.body) {
            throw new APIError(500, 'Response body is null', requestId);
        }
        // Create a reader for the response body
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        try {
            while (true) {
                // Check if the signal is aborted before reading
                if (options.signal?.aborted) {
                    throw new ZaguanError('Request aborted');
                }
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }
                // Check if the signal is aborted after reading
                if (options.signal?.aborted) {
                    throw new ZaguanError('Request aborted');
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
                    catch (_err) {
                        // Skip malformed chunks
                        // In a production environment, you might want to log this with a proper logger
                        // For now, we're just ignoring the error as indicated by the underscore prefix
                    }
                }
            }
        }
        catch (error) {
            // If the error is from aborting, re-throw it
            if (error instanceof Error && error.name === 'AbortError') {
                throw new ZaguanError('Request aborted');
            }
            throw error;
        }
        finally {
            // Clean up the reader
            reader.releaseLock();
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
            signal: options.signal ?? undefined
        };
        const response = await makeHttpRequest(`${this.baseUrl}/v1/models`, httpOptions, this.fetchImpl);
        const result = await handleHttpResponse(response);
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
            signal: options.signal ?? undefined
        };
        const response = await makeHttpRequest(`${this.baseUrl}/v1/capabilities`, httpOptions, this.fetchImpl);
        return handleHttpResponse(response);
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
            signal: options.signal ?? undefined
        };
        const response = await makeHttpRequest(url, httpOptions, this.fetchImpl);
        return handleHttpResponse(response);
    }
    /**
     * Create headers for a request
     *
     * @param options Request options
     * @returns Headers object and request ID
     */
    createRequestHeaders(options) {
        const requestId = options.requestId ?? generateUUID();
        const headers = createHeaders(this.apiKey, requestId, options.headers);
        return { headers, requestId };
    }
}
//# sourceMappingURL=client.js.map