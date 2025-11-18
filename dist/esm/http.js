/**
 * HTTP client utilities for the Zaguán SDK
 *
 * This file contains utilities for making HTTP requests to the Zaguán API.
 */
import { APIError, InsufficientCreditsError, RateLimitError, BandAccessDeniedError } from './errors.js';
/**
 * Make an HTTP request with timeout support
 *
 * @param url The URL to request
 * @param options Request options
 * @param fetchImpl The fetch implementation to use
 * @returns The fetch Response object
 */
export async function makeHttpRequest(url, options, fetchImpl) {
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
            signal: finalSignal
        });
        return response;
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
export async function handleHttpResponse(response) {
    const requestId = response.headers.get('X-Request-Id') || undefined;
    if (response.ok) {
        // Try to parse JSON, but handle cases where there's no body
        try {
            const text = await response.text();
            return text ? JSON.parse(text) : {};
        }
        catch (_) {
            // If we can't parse JSON, return empty object
            // The error is intentionally ignored as indicated by the underscore
            return {};
        }
    }
    // Handle error responses
    let errorData = {};
    try {
        const text = await response.text();
        errorData = text ? JSON.parse(text) : {};
    }
    catch (_) {
        // Ignore parsing errors
        // The error is intentionally ignored as indicated by the underscore
    }
    const errorMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
    // Map specific error types
    switch (response.status) {
        case 401:
        case 403:
            throw new APIError(response.status, errorMessage, requestId);
        case 429:
            const retryAfter = response.headers.get('Retry-After');
            throw new RateLimitError(errorMessage, response.status, requestId, retryAfter ? parseInt(retryAfter, 10) : undefined);
        case 402: // Assuming 402 is used for insufficient credits
            throw new InsufficientCreditsError(errorMessage, response.status, requestId, errorData.error?.credits_required, errorData.error?.credits_remaining, errorData.error?.reset_date);
        case 403: // Assuming 403 is also used for band access denied
            if (errorData.error?.type === 'band_access_denied') {
                throw new BandAccessDeniedError(errorMessage, response.status, requestId, errorData.error?.band, errorData.error?.required_tier, errorData.error?.current_tier);
            }
            throw new APIError(response.status, errorMessage, requestId);
        default:
            throw new APIError(response.status, errorMessage, requestId);
    }
}
//# sourceMappingURL=http.js.map