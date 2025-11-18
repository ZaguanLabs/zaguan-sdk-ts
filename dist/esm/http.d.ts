/**
 * HTTP client utilities for the Zaguán SDK
 *
 * This file contains utilities for making HTTP requests to the Zaguán API.
 */
/**
 * Options for HTTP requests
 */
export interface HttpRequestOptions {
    /**
     * HTTP method (GET, POST, etc.)
     */
    method: string;
    /**
     * Request headers
     */
    headers: Record<string, string>;
    /**
     * Request body (for POST, PUT, etc.)
     */
    body?: string | FormData;
    /**
     * Abort signal for cancellation
     */
    signal?: AbortSignal;
    /**
     * Timeout in milliseconds
     */
    timeoutMs?: number;
}
/**
 * Response from an HTTP request
 */
export interface HttpResponse<T> {
    /**
     * The parsed response data
     */
    data: T;
    /**
     * HTTP status code
     */
    status: number;
    /**
     * Response headers
     */
    headers: Headers;
}
/**
 * Make an HTTP request with timeout support
 *
 * @param url The URL to request
 * @param options Request options
 * @param fetchImpl The fetch implementation to use
 * @returns The fetch Response object
 */
export declare function makeHttpRequest(url: string, options: HttpRequestOptions, fetchImpl: typeof fetch): Promise<Response>;
/**
 * Handle an HTTP response, parsing JSON and throwing appropriate errors
 *
 * @param response The fetch Response object
 * @returns The parsed response data
 */
export declare function handleHttpResponse<T>(response: Response): Promise<T>;
