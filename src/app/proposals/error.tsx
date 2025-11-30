"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/states/ErrorState";

/**
 * Proposals List Error Boundary
 *
 * Catches errors on the proposals listing page.
 *
 * Common errors:
 * - Failed to fetch proposals
 * - Filtering/sorting errors
 * - Search failures
 * - Deletion errors
 *
 * Recovery strategy:
 * - Reset triggers proposals refetch
 * - User can navigate to dashboard or create new proposal
 */
export default function ProposalsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.group("Proposals List Error");
      console.error("Error:", error);
      console.error("Digest:", error.digest);
      console.groupEnd();
    }

    // TODO: Track proposals list errors
    // logErrorToService({
    //   error,
    //   digest: error.digest,
    //   context: "proposals-list",
    //   page: "/proposals",
    // });
  }, [error]);

  const isFetchError =
    error.message.includes("fetch") || error.message.includes("load");

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <ErrorState
        title={isFetchError ? "Failed to Load Proposals" : "Proposals Error"}
        description={
          isFetchError
            ? "We couldn't load your lease proposals. Please check your connection and try again."
            : "An error occurred while displaying proposals. Please try refreshing the page."
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
