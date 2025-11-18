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
export declare function generateUUID(): string;
/**
 * Create headers for an API request
 *
 * @param apiKey The API key for authentication
 * @param requestId The request ID
 * @param additionalHeaders Any additional headers to include
 * @returns The headers object
 */
export declare function createHeaders(apiKey: string, requestId: string, additionalHeaders?: Record<string, string>): Record<string, string>;
