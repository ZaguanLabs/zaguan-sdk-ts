/**
 * Error types for the Zaguán SDK
 *
 * This file contains the error classes that are used throughout the SDK
 * to provide structured error information.
 */
/**
 * Base error class for all Zaguán SDK errors
 */
export declare class ZaguanError extends Error {
    constructor(message: string);
}
/**
 * Error for API-related issues
 */
export declare class APIError extends ZaguanError {
    readonly statusCode: number;
    readonly requestId?: string;
    constructor(statusCode: number, message: string, requestId?: string);
}
/**
 * Error for insufficient credits
 */
export declare class InsufficientCreditsError extends APIError {
    readonly creditsRequired?: number;
    readonly creditsRemaining?: number;
    readonly resetDate?: string;
    constructor(message: string, statusCode: number, requestId?: string, creditsRequired?: number, creditsRemaining?: number, resetDate?: string);
}
/**
 * Error for rate limiting
 */
export declare class RateLimitError extends APIError {
    readonly retryAfter?: number;
    constructor(message: string, statusCode: number, requestId?: string, retryAfter?: number);
}
/**
 * Error for band access denied
 */
export declare class BandAccessDeniedError extends APIError {
    readonly band?: string;
    readonly requiredTier?: string;
    readonly currentTier?: string;
    constructor(message: string, statusCode: number, requestId?: string, band?: string, requiredTier?: string, currentTier?: string);
}
