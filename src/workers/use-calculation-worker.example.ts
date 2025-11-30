/**
 * Example: How to use the calculation worker in a React component
 *
 * This file demonstrates the recommended pattern for using the calculation
 * worker to run 30-year financial projections off the main thread.
 *
 * DO NOT import this file directly - it's documentation/reference only.
 * Copy the pattern into your actual components.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import type {
  CalculationEngineInput,
  CalculationEngineOutput,
} from "@/lib/engine/core/types";
import type { WorkerMessage, WorkerResponse } from "./calculation.worker";

interface UseCalculationWorkerResult {
  calculate: (input: CalculationEngineInput) => void;
  result: CalculationEngineOutput | null;
  error: string | null;
  isCalculating: boolean;
}

/**
 * Example hook for using the calculation worker
 *
 * Usage in a component:
 * ```tsx
 * function ProposalCalculator() {
 *   const { calculate, result, error, isCalculating } = useCalculationWorker();
 *
 *   const handleCalculate = () => {
 *     calculate(calculationInput);
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleCalculate} disabled={isCalculating}>
 *         Calculate
 *       </button>
 *       {isCalculating && <div>Calculating...</div>}
 *       {error && <div>Error: {error}</div>}
 *       {result && <div>NPV: {result.metrics.npv?.toString()}</div>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useCalculationWorker(): UseCalculationWorkerResult {
  const workerRef = useRef<Worker | null>(null);
  const [result, setResult] = useState<CalculationEngineOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Initialize worker on mount
  useEffect(() => {
    // Create worker using Next.js worker syntax
    workerRef.current = new Worker(
      new URL("./calculation.worker.ts", import.meta.url),
      { type: "module" },
    );

    // Handle messages from worker
    workerRef.current.onmessage = (e: MessageEvent<WorkerResponse>) => {
      setIsCalculating(false);

      if (e.data.type === "success") {
        setResult(e.data.result);
        setError(null);
      } else if (e.data.type === "error") {
        setError(e.data.error);
        setResult(null);
        console.error("Worker error:", e.data.error);
        if (e.data.stack) {
          console.error("Stack trace:", e.data.stack);
        }
      }
    };

    // Handle worker errors
    workerRef.current.onerror = (errorEvent) => {
      setIsCalculating(false);
      setError(errorEvent.message || "Worker error occurred");
      setResult(null);
      console.error("Worker error event:", errorEvent);
    };

    // Cleanup worker on unmount
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  // Calculate function
  const calculate = useCallback((input: CalculationEngineInput) => {
    if (!workerRef.current) {
      setError("Worker not initialized");
      return;
    }

    setIsCalculating(true);
    setError(null);
    setResult(null);

    const message: WorkerMessage = {
      type: "calculate",
      payload: input,
    };

    workerRef.current.postMessage(message);
  }, []);

  return {
    calculate,
    result,
    error,
    isCalculating,
  };
}

/**
 * Alternative: Direct worker usage without a hook
 *
 * For one-time calculations or server components, you can use the worker directly:
 *
 * ```typescript
 * async function calculateProposal(input: CalculationEngineInput): Promise<CalculationEngineOutput> {
 *   return new Promise((resolve, reject) => {
 *     const worker = new Worker(
 *       new URL('./calculation.worker.ts', import.meta.url),
 *       { type: 'module' }
 *     );
 *
 *     worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
 *       worker.terminate();
 *       if (e.data.type === 'success') {
 *         resolve(e.data.result);
 *       } else {
 *         reject(new Error(e.data.error));
 *       }
 *     };
 *
 *     worker.onerror = (error) => {
 *       worker.terminate();
 *       reject(error);
 *     };
 *
 *     worker.postMessage({ type: 'calculate', payload: input } as WorkerMessage);
 *   });
 * }
 * ```
 */
