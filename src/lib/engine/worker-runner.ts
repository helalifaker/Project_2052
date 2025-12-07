import { Worker } from "node:worker_threads";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type {
  CalculationEngineInput,
  CalculationEngineOutput,
} from "./core/types";
import { deserializeDecimals } from "./core/serialization";

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKER_PATH = path.join(__dirname, "worker-thread.js");
const WORKER_TIMEOUT_MS = 30_000;

export async function runCalculationInWorker(
  input: CalculationEngineInput,
): Promise<{ output: CalculationEngineOutput; calculationTimeMs: number }> {
  const start = performance.now();
  const payload: WorkerPayload = { input };

  return new Promise((resolve, reject) => {
    const worker = new Worker(WORKER_PATH, {
      workerData: payload,
    });

    // Track whether we've received a response to handle edge cases
    let messageReceived = false;
    let isSettled = false;

    const timeout = setTimeout(() => {
      if (!isSettled) {
        isSettled = true;
        worker.terminate();
        reject(new Error("Calculation worker timed out"));
      }
    }, WORKER_TIMEOUT_MS);

    worker.once("message", (result: WorkerResult) => {
      if (isSettled) return;
      isSettled = true;
      messageReceived = true;
      clearTimeout(timeout);

      if (result.success) {
        // Deserialize Decimal instances from worker output
        // Worker serializes Decimals as { __decimal: '123.45' } for Structured Clone Algorithm
        const deserializedOutput = deserializeDecimals<CalculationEngineOutput>(
          result.output,
        );
        resolve({
          output: deserializedOutput,
          calculationTimeMs: result.calculationTimeMs,
        });
      } else {
        reject(new Error(result.error));
      }
    });

    worker.once("error", (error) => {
      if (isSettled) return;
      isSettled = true;
      clearTimeout(timeout);
      reject(error);
    });

    worker.once("exit", (code) => {
      clearTimeout(timeout);
      if (isSettled) return;
      isSettled = true;

      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      } else if (!messageReceived) {
        // Worker exited cleanly but never sent a message - this is a bug
        reject(
          new Error(
            "Worker exited without sending result (possible parentPort issue)",
          ),
        );
      }
      // If code === 0 and message was received, already resolved via message handler
    });
  });
}
