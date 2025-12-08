/**
 * Timeout Utility
 *
 * Provides promise-based timeout wrapping for client-side operations.
 * Prevents UI hangs when external services (Supabase, APIs) are slow or unresponsive.
 */

/**
 * Custom error class for timeout errors
 */
export class TimeoutError extends Error {
  constructor(message: string = "Operation timed out") {
    super(message);
    this.name = "TimeoutError";
  }
}

/**
 * Default timeout duration for auth operations (10 seconds)
 * - Long enough for normal operations even on slow connections
 * - Short enough to provide feedback if something is wrong
 */
export const AUTH_TIMEOUT_MS = 10000;

/**
 * Default timeout duration for API calls (15 seconds)
 */
export const API_TIMEOUT_MS = 15000;

/**
 * Wraps a promise with a timeout.
 * If the promise doesn't resolve within the timeout, rejects with TimeoutError.
 *
 * @param promise - The promise to wrap
 * @param timeoutMs - Timeout duration in milliseconds (default: AUTH_TIMEOUT_MS)
 * @param errorMessage - Custom error message for timeout
 * @returns The resolved value of the promise, or throws TimeoutError
 *
 * @example
 * ```typescript
 * // Wrap a Supabase call with timeout
 * const result = await withTimeout(
 *   supabase.auth.getUser(),
 *   AUTH_TIMEOUT_MS,
 *   "Authentication check timed out"
 * );
 * ```
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = AUTH_TIMEOUT_MS,
  errorMessage: string = "Operation timed out. Please try again.",
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new TimeoutError(errorMessage));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    return result;
  } finally {
    // Always clear the timeout to prevent memory leaks
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

/**
 * Check if an error is a TimeoutError
 */
export function isTimeoutError(error: unknown): error is TimeoutError {
  return error instanceof TimeoutError;
}
