/**
 * Request ID Tracking for Error Correlation
 *
 * Generates and attaches unique request IDs to API responses for debugging.
 * When users report errors, the request ID helps trace the specific request in logs.
 */

import { NextResponse } from "next/server";

/**
 * Generate a unique request ID
 *
 * Format: req_<timestamp>_<random>
 * Example: req_1734567890123_abc123
 */
export function generateRequestId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `req_${timestamp}_${random}`;
}

/**
 * Extract request ID from headers or generate new one
 *
 * Checks for existing request ID in common header names:
 * - X-Request-ID
 * - X-Correlation-ID
 * - Request-Id
 */
export function getOrCreateRequestId(request: Request): string {
  const existingId =
    request.headers.get("X-Request-ID") ||
    request.headers.get("X-Correlation-ID") ||
    request.headers.get("Request-Id");

  return existingId || generateRequestId();
}

/**
 * Create error response with request ID for debugging
 *
 * @param error - Error message to return
 * @param status - HTTP status code
 * @param requestId - Request ID for correlation
 * @param details - Optional additional details for debugging
 */
export function createErrorResponse(
  error: string,
  status: number,
  requestId: string,
  details?: Record<string, unknown>,
): NextResponse {
  const body: Record<string, unknown> = {
    error,
    requestId,
    timestamp: new Date().toISOString(),
  };

  if (details && Object.keys(details).length > 0) {
    body.details = details;
  }

  // Log the error with request ID for server-side correlation
  console.error(`[${requestId}] API Error (${status}):`, error, details || "");

  return NextResponse.json(body, {
    status,
    headers: {
      "X-Request-ID": requestId,
    },
  });
}

/**
 * Create success response with request ID
 *
 * @param data - Response data
 * @param requestId - Request ID for correlation
 * @param status - HTTP status code (default: 200)
 */
export function createSuccessResponse<T>(
  data: T,
  requestId: string,
  status: number = 200,
): NextResponse {
  return NextResponse.json(data, {
    status,
    headers: {
      "X-Request-ID": requestId,
    },
  });
}

/**
 * Standard error codes for consistent API responses
 */
export const ErrorCodes = {
  // Authentication errors (401)
  UNAUTHORIZED: "UNAUTHORIZED",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  INVALID_TOKEN: "INVALID_TOKEN",

  // Authorization errors (403)
  FORBIDDEN: "FORBIDDEN",
  INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",

  // Not found errors (404)
  NOT_FOUND: "NOT_FOUND",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  PROPOSAL_NOT_FOUND: "PROPOSAL_NOT_FOUND",
  NEGOTIATION_NOT_FOUND: "NEGOTIATION_NOT_FOUND",

  // Validation errors (400)
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_INPUT: "INVALID_INPUT",
  MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD",

  // Conflict errors (409)
  CONFLICT: "CONFLICT",
  DUPLICATE_ENTRY: "DUPLICATE_ENTRY",
  CONCURRENT_MODIFICATION: "CONCURRENT_MODIFICATION",

  // Server errors (500)
  INTERNAL_ERROR: "INTERNAL_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  CALCULATION_ERROR: "CALCULATION_ERROR",
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",

  // Rate limiting (429)
  RATE_LIMITED: "RATE_LIMITED",

  // Timeout errors (504)
  TIMEOUT: "TIMEOUT",
  DATABASE_TIMEOUT: "DATABASE_TIMEOUT",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

/**
 * Create a structured error response with code and message
 */
export function createStructuredError(
  code: ErrorCode,
  message: string,
  status: number,
  requestId: string,
  details?: Record<string, unknown>,
): NextResponse {
  return createErrorResponse(message, status, requestId, {
    code,
    ...details,
  });
}
