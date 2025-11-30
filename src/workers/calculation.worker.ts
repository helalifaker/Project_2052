/**
 * Web Worker for Financial Calculations
 *
 * Runs the 30-year financial projection engine off the main thread
 * to prevent UI blocking during heavy calculations.
 *
 * Usage from main thread:
 * ```typescript
 * const worker = new Worker(new URL('./calculation.worker.ts', import.meta.url));
 * worker.postMessage({ type: 'calculate', payload: calculationInput });
 * worker.onmessage = (e) => {
 *   if (e.data.type === 'success') {
 *     console.log(e.data.result);
 *   } else if (e.data.type === 'error') {
 *     console.error(e.data.error);
 *   }
 * };
 * ```
 */

import { calculateFinancialProjections } from "@/lib/engine";
import type {
  CalculationEngineInput,
  CalculationEngineOutput,
} from "@/lib/engine/core/types";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Message sent from main thread to worker
 */
interface WorkerMessage {
  type: "calculate";
  payload: CalculationEngineInput;
}

/**
 * Success response sent from worker to main thread
 */
interface WorkerSuccessResponse {
  type: "success";
  result: CalculationEngineOutput;
}

/**
 * Error response sent from worker to main thread
 */
interface WorkerErrorResponse {
  type: "error";
  error: string;
  stack?: string;
}

/**
 * Union type for all worker responses
 */
type WorkerResponse = WorkerSuccessResponse | WorkerErrorResponse;

// ============================================================================
// MESSAGE HANDLER
// ============================================================================

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  // Validate message type
  if (!e.data || e.data.type !== "calculate") {
    self.postMessage({
      type: "error",
      error:
        'Invalid message type. Expected { type: "calculate", payload: CalculationEngineInput }',
    } as WorkerErrorResponse);
    return;
  }

  // Validate payload exists
  if (!e.data.payload) {
    self.postMessage({
      type: "error",
      error: "Missing calculation payload",
    } as WorkerErrorResponse);
    return;
  }

  try {
    console.log("🔧 Worker: Starting calculation...");
    const startTime = performance.now();

    // Execute the financial calculation engine
    const result = await calculateFinancialProjections(e.data.payload);

    const endTime = performance.now();
    console.log(
      `✅ Worker: Calculation completed in ${(endTime - startTime).toFixed(2)}ms`,
    );

    // Send success response
    self.postMessage({
      type: "success",
      result,
    } as WorkerSuccessResponse);
  } catch (error) {
    console.error("❌ Worker: Calculation failed:", error);

    // Extract error details
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    // Send error response
    self.postMessage({
      type: "error",
      error: errorMessage,
      stack: errorStack,
    } as WorkerErrorResponse);
  }
};

// ============================================================================
// EXPORTS (for type checking)
// ============================================================================

export type {
  WorkerMessage,
  WorkerResponse,
  WorkerSuccessResponse,
  WorkerErrorResponse,
};
