import { parentPort, workerData } from "node:worker_threads";
import { calculateFinancialProjections } from "./index";
import type {
  CalculationEngineInput,
  CalculationEngineOutput,
} from "./core/types";
import { serializeDecimals } from "./core/serialization";

type WorkerPayload = {
  input: CalculationEngineInput;
};

type WorkerResult =
  | {
      success: true;
      output: CalculationEngineOutput;
      calculationTimeMs: number;
    }
  | {
      success: false;
      error: string;
    };

/**
 * Send a message to the parent thread with explicit null check.
 * Throws if parentPort is not available, which will be caught and logged.
 */
function sendMessage(result: WorkerResult): void {
  if (!parentPort) {
    throw new Error("Worker parentPort is not available - cannot send result");
  }
  parentPort.postMessage(result);
}

/**
 * Send an error message to the parent thread.
 * Falls back to console.error if parentPort is not available.
 */
function sendError(message: string): void {
  const result: WorkerResult = {
    success: false,
    error: message,
  };

  if (parentPort) {
    parentPort.postMessage(result);
  } else {
    // Last resort: log to console (will be captured by worker error handlers)
    console.error(
      "[Worker] Cannot send error - parentPort unavailable:",
      message,
    );
  }
}

async function main() {
  const payload = workerData as WorkerPayload;
  try {
    const start = performance.now();
    const output = await calculateFinancialProjections(payload.input);
    const calculationTimeMs = performance.now() - start;

    // Serialize Decimal instances for Structured Clone Algorithm
    // Without this, Decimal objects become plain objects and lose their methods
    const serializedOutput = serializeDecimals<CalculationEngineOutput>(output);

    const result: WorkerResult = {
      success: true,
      output: serializedOutput,
      calculationTimeMs,
    };
    sendMessage(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown calculation error";
    sendError(message);
  }
}

// Run main with proper error handling for unhandled rejections
main().catch((error) => {
  const message =
    error instanceof Error ? error.message : "Unhandled worker error";
  console.error("[Worker] Unhandled error in main():", message);
  sendError(message);
});
