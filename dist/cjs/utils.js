"use strict";
/**
 * Utility functions for the Zaguán SDK
 *
 * This file contains utility functions that are used throughout the SDK.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUUID = generateUUID;
exports.createHeaders = createHeaders;
/**
 * Generate a random UUID v4
 *
 * Uses crypto.randomUUID() when available (Node.js 14.17.0+, modern browsers),
 * falls back to a Math.random() based implementation for compatibility.
 *
 * @returns A random UUID v4 string
 */
function generateUUID() {
    // Use crypto.randomUUID() if available for better randomness
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback implementation using Math.random()
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
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
function createHeaders(apiKey, requestId, additionalHeaders) {
    return {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Request-Id': requestId,
        ...additionalHeaders,
    };
}
//# sourceMappingURL=utils.js.map