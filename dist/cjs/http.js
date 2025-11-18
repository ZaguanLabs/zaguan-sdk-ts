"use strict";
/**
 * HTTP client utilities for the Zaguán SDK
 *
 * This file contains utilities for making HTTP requests to the Zaguán API.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeHttpRequest = makeHttpRequest;
exports.handleHttpResponse = handleHttpResponse;
const errors_js_1 = require("./errors.js");
/**
 * Make an HTTP request with timeout support
 *
 * @param url The URL to request
 * @param options Request options
 * @param fetchImpl The fetch implementation to use
 * @returns The fetch Response object
 */
async function makeHttpRequest(url, options, fetchImpl) {
    // Create AbortController for timeout support
    const controller = new AbortController();
    const { signal } = controller;
    // Set up timeout if specified
    let timeoutId;
    if (options.timeoutMs) {
        timeoutId = setTimeout(() => controller.abort(), options.timeoutMs);
    }
    try {
        // Merge signal with any existing signal
        let finalSignal;
        if (options.signal) {
            // Create a new AbortController that aborts when either signal aborts
            const combinedController = new AbortController();
            const combinedSignal = combinedController.signal;
            options.signal.addEventListener('abort', () => combinedController.abort());
            signal.addEventListener('abort', () => combinedController.abort());
            finalSignal = combinedSignal;
        }
        else {
            finalSignal = signal;
        }
        // Make the request
        const response = await fetchImpl(url, {
            method: options.method,
            headers: options.headers,
            body: options.body ?? null,
            signal: finalSignal,
        });
        return response;
    }
    catch (error) {
        // Provide clearer error message for timeout
        if (error instanceof Error &&
            error.name === 'AbortError' &&
            options.timeoutMs) {
            throw new Error(`Request timeout after ${options.timeoutMs}ms`);
        }
        throw error;
    }
    finally {
        // Clean up timeout
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
    }
}
/**
 * Handle an HTTP response, parsing JSON and throwing appropriate errors
 *
 * @param response The fetch Response object
 * @returns The parsed response data
 */
async function handleHttpResponse(response) {
    const requestId = response.headers.get('X-Request-Id') || undefined;
    if (response.ok) {
        // Try to parse JSON, but handle cases where there's no body
        try {
            const text = await response.text();
            return text ? JSON.parse(text) : {};
        }
        catch {
            // If we can't parse JSON, return empty object
            return {};
        }
    }
    // Handle error responses
    let errorData = {};
    try {
        const text = await response.text();
        errorData = text ? JSON.parse(text) : {};
    }
    catch {
        // Ignore parsing errors - we'll use default error message
    }
    // Type guard for error data structure
    const isErrorData = (data) => {
        return typeof data === 'object' && data !== null;
    };
    const parsedErrorData = isErrorData(errorData) ? errorData : {};
    const errorMessage = parsedErrorData.error?.message
        ? String(parsedErrorData.error.message)
        : `HTTP ${response.status}: ${response.statusText}`;
    // Map specific error types
    switch (response.status) {
        case 401:
            throw new errors_js_1.APIError(response.status, errorMessage, requestId);
        case 403:
            // Check if this is a band access denied error
            if (parsedErrorData.error?.type === 'band_access_denied') {
                const errorDetails = parsedErrorData.error;
                throw new errors_js_1.BandAccessDeniedError(errorMessage, response.status, requestId, typeof errorDetails.band === 'string' ? errorDetails.band : undefined, typeof errorDetails.required_tier === 'string'
                    ? errorDetails.required_tier
                    : undefined, typeof errorDetails.current_tier === 'string'
                    ? errorDetails.current_tier
                    : undefined);
            }
            throw new errors_js_1.APIError(response.status, errorMessage, requestId);
        case 429:
            const retryAfter = response.headers.get('Retry-After');
            throw new errors_js_1.RateLimitError(errorMessage, response.status, requestId, retryAfter ? parseInt(retryAfter, 10) : undefined);
        case 402: // Payment required - insufficient credits
            const errorDetails = parsedErrorData.error;
            throw new errors_js_1.InsufficientCreditsError(errorMessage, response.status, requestId, typeof errorDetails?.credits_required === 'number'
                ? errorDetails.credits_required
                : undefined, typeof errorDetails?.credits_remaining === 'number'
                ? errorDetails.credits_remaining
                : undefined, typeof errorDetails?.reset_date === 'string'
                ? errorDetails.reset_date
                : undefined);
        default:
            throw new errors_js_1.APIError(response.status, errorMessage, requestId);
    }
}
//# sourceMappingURL=http.js.map