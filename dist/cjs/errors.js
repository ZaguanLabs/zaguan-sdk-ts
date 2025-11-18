"use strict";
/**
 * Error types for the Zaguán SDK
 *
 * This file contains the error classes that are used throughout the SDK
 * to provide structured error information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BandAccessDeniedError = exports.RateLimitError = exports.InsufficientCreditsError = exports.APIError = exports.ZaguanError = void 0;
/**
 * Base error class for all Zaguán SDK errors
 */
class ZaguanError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ZaguanError';
        // Ensure the error is properly captured in stack traces
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
exports.ZaguanError = ZaguanError;
/**
 * Error for API-related issues
 */
class APIError extends ZaguanError {
    constructor(statusCode, message, requestId) {
        super(message);
        this.name = 'APIError';
        this.statusCode = statusCode;
        this.requestId = requestId;
    }
}
exports.APIError = APIError;
/**
 * Error for insufficient credits
 */
class InsufficientCreditsError extends APIError {
    constructor(message, statusCode, requestId, creditsRequired, creditsRemaining, resetDate) {
        super(statusCode, message, requestId);
        this.name = 'InsufficientCreditsError';
        this.creditsRequired = creditsRequired;
        this.creditsRemaining = creditsRemaining;
        this.resetDate = resetDate;
    }
}
exports.InsufficientCreditsError = InsufficientCreditsError;
/**
 * Error for rate limiting
 */
class RateLimitError extends APIError {
    constructor(message, statusCode, requestId, retryAfter) {
        super(statusCode, message, requestId);
        this.name = 'RateLimitError';
        this.retryAfter = retryAfter;
    }
}
exports.RateLimitError = RateLimitError;
/**
 * Error for band access denied
 */
class BandAccessDeniedError extends APIError {
    constructor(message, statusCode, requestId, band, requiredTier, currentTier) {
        super(statusCode, message, requestId);
        this.name = 'BandAccessDeniedError';
        this.band = band;
        this.requiredTier = requiredTier;
        this.currentTier = currentTier;
    }
}
exports.BandAccessDeniedError = BandAccessDeniedError;
//# sourceMappingURL=errors.js.map