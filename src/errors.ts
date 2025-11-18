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
  constructor(message: string) {
    super(message);
    this.name = 'ZaguanError';
  }
}

/**
 * Error for API-related issues
 */
export class APIError extends ZaguanError {
  readonly statusCode: number;
  readonly requestId?: string;

  constructor(statusCode: number, message: string, requestId?: string) {
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
  readonly creditsRequired?: number;
  readonly creditsRemaining?: number;
  readonly resetDate?: string;

  constructor(
    message: string,
    statusCode: number,
    requestId?: string,
    creditsRequired?: number,
    creditsRemaining?: number,
    resetDate?: string
  ) {
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
  readonly retryAfter?: number;

  constructor(
    message: string,
    statusCode: number,
    requestId?: string,
    retryAfter?: number
  ) {
    super(statusCode, message, requestId);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Error for band access denied
 */
export class BandAccessDeniedError extends APIError {
  readonly band?: string;
  readonly requiredTier?: string;
  readonly currentTier?: string;

  constructor(
    message: string,
    statusCode: number,
    requestId?: string,
    band?: string,
    requiredTier?: string,
    currentTier?: string
  ) {
    super(statusCode, message, requestId);
    this.name = 'BandAccessDeniedError';
    this.band = band;
    this.requiredTier = requiredTier;
    this.currentTier = currentTier;
  }
}
