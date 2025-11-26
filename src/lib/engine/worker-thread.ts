import { parentPort, workerData } from "node:worker_threads";
import { calculateFinancialProjections } from "./index";
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

async function main() {
  const payload = workerData as WorkerPayload;
  try {
    const start = performance.now();
    const output = await calculateFinancialProjections(payload.input);
    const calculationTimeMs = performance.now() - start;

    const result: WorkerResult = {
      success: true,
      output,
      calculationTimeMs,
    };
    parentPort?.postMessage(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown calculation error";
    const result: WorkerResult = {
      success: false,
      error: message,
    };
    parentPort?.postMessage(result);
  }
}

void main();
