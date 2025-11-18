/**
 * Error types for the Zaguán SDK
 *
 * This file contains the error classes that are used throughout the SDK
 * to provide structured error information.
 */
/**
 * Base error class for all Zaguán SDK errors
 */
export class ZaguanError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ZaguanError';
    }
}
/**
 * Error for API-related issues
 */
export class APIError extends ZaguanError {
    constructor(statusCode, message, requestId) {
        super(message);
        this.name = 'APIError';
        this.statusCode = statusCode;
        this.requestId = requestId;
    }
}
/**
 * Error for insufficient credits
 */
export class InsufficientCreditsError extends APIError {
    constructor(message, statusCode, requestId, creditsRequired, creditsRemaining, resetDate) {
        super(statusCode, message, requestId);
        this.name = 'InsufficientCreditsError';
        this.creditsRequired = creditsRequired;
        this.creditsRemaining = creditsRemaining;
        this.resetDate = resetDate;
    }
}
/**
 * Error for rate limiting
 */
export class RateLimitError extends APIError {
    constructor(message, statusCode, requestId, retryAfter) {
        super(statusCode, message, requestId);
        this.name = 'RateLimitError';
        this.retryAfter = retryAfter;
    }
}
/**
 * Error for band access denied
 */
export class BandAccessDeniedError extends APIError {
    constructor(message, statusCode, requestId, band, requiredTier, currentTier) {
        super(statusCode, message, requestId);
        this.name = 'BandAccessDeniedError';
        this.band = band;
        this.requiredTier = requiredTier;
        this.currentTier = currentTier;
    }
}
//# sourceMappingURL=errors.js.map