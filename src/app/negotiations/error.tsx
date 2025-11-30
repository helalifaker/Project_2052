"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/states/ErrorState";

/**
 * Negotiations Error Boundary
 *
 * Catches errors on the negotiations/war room page.
 *
 * Common errors:
 * - Failed to load proposals for comparison
 * - Comparison calculation errors
 * - Chart rendering failures
 * - Side-by-side analysis errors
 *
 * Recovery strategy:
 * - Reset triggers data refetch and comparison recalculation
 * - User can navigate back to proposals list
 */
export default function NegotiationsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.group("Negotiations/War Room Error");
      console.error("Error:", error);
      console.error("Digest:", error.digest);
      console.groupEnd();
    }

    // TODO: Track negotiations errors
    // logErrorToService({
    //   error,
    //   digest: error.digest,
    //   context: "negotiations-war-room",
    //   page: "/negotiations",
    // });
  }, [error]);

  const isComparisonError =
    error.message.toLowerCase().includes("comparison") ||
    error.message.toLowerCase().includes("calculate");

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <ErrorState
        title={
          isComparisonError
            ? "Comparison Failed"
            : "Failed to Load Negotiations"
        }
        description={
          isComparisonError
            ? "Unable to compare the selected proposals. Please verify that all proposals have valid calculations and try again."
            : "We couldn't load the negotiations interface. Please check your connection and try again."
        }
        error={error}
        reset={reset}
        size="full-page"
        showBackButton
        showHomeButton
        showDetails={process.env.NODE_ENV === "development"}
      />
    </div>
  );
}
