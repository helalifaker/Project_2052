import { Worker } from "node:worker_threads";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type {
  CalculationEngineInput,
  CalculationEngineOutput,
} from "./core/types";

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

    const timeout = setTimeout(() => {
      worker.terminate();
      reject(new Error("Calculation worker timed out"));
    }, WORKER_TIMEOUT_MS);

    worker.once("message", (result: WorkerResult) => {
      clearTimeout(timeout);
      if (result.success) {
        resolve({
          output: result.output,
          calculationTimeMs: result.calculationTimeMs,
        });
      } else {
        reject(new Error(result.error));
      }
    });

    worker.once("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    worker.once("exit", (code) => {
      clearTimeout(timeout);
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}
