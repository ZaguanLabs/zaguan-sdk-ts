/**
 * Utility functions for the Zaguán SDK
 *
 * This file contains utility functions that are used throughout the SDK.
 */
/**
 * Generate a random UUID v4
 *
 * This is a simple implementation of UUID v4 generation for use in request IDs.
 *
 * @returns A random UUID v4 string
 */
export function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
/**
 * Create headers for an API request
 *
 * @param apiKey The API key for authentication
 * @param requestId The request ID
 * @param additionalHeaders Any additional headers to include
 * @returns The headers object
 */
export function createHeaders(apiKey, requestId, additionalHeaders) {
    return {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Request-Id': requestId,
        ...additionalHeaders
    };
}
//# sourceMappingURL=utils.js.map