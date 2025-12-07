/**
 * CALCULATION UTILITIES
 *
 * Helper functions for running financial calculations with proper
 * timeout protection and error handling.
 */

import type { CalculationEngineInput, CalculationEngineOutput } from "./types";
import { calculateFinancialProjections } from "../index";

/**
 * Default timeout for calculation operations (25 seconds).
 * This is slightly less than the worker timeout (30s) to ensure clean errors.
 */
export const CALCULATION_TIMEOUT_MS = 25_000;

/**
 * Custom error class for calculation timeouts.
 * Allows API routes to distinguish timeout errors from other errors.
 */
export class CalculationTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(
      `Financial calculation timed out after ${timeoutMs}ms. ` +
        `This may indicate a complex scenario or system overload.`,
    );
    this.name = "CalculationTimeoutError";
  }
}

/**
 * Run financial projections with timeout protection.
 *
 * Prevents API routes from hanging indefinitely if the calculation
 * takes too long or encounters an issue that prevents completion.
 *
 * @param input - Calculation engine input configuration
 * @param timeoutMs - Optional custom timeout (default: 25 seconds)
 * @returns Promise resolving to calculation output
 * @throws CalculationTimeoutError if timeout exceeded
 */
export async function calculateWithTimeout(
  input: CalculationEngineInput,
  timeoutMs: number = CALCULATION_TIMEOUT_MS,
): Promise<CalculationEngineOutput> {
  let timeoutId: NodeJS.Timeout | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new CalculationTimeoutError(timeoutMs));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([
      calculateFinancialProjections(input),
      timeoutPromise,
    ]);
    return result;
  } finally {
    // Always clear the timeout to prevent memory leaks
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}
