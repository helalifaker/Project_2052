"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/states/ErrorState";

/**
 * Proposal Detail Error Boundary
 *
 * Catches errors on individual proposal detail pages.
 *
 * Common errors:
 * - Proposal not found (404)
 * - Failed to load proposal data
 * - Calculation engine failures
 * - Tab rendering errors (Overview, Scenarios, Sensitivity, etc.)
 * - Chart/visualization errors
 * - Scenario/sensitivity analysis failures
 *
 * Recovery strategy:
 * - Reset triggers proposal data refetch + recalculation
 * - User can navigate back to proposals list
 * - Critical errors: Suggest contacting support
 */
export default function ProposalDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.group("Proposal Detail Error");
      console.error("Error:", error);
      console.error("Digest:", error.digest);
      console.groupEnd();
    }

    // TODO: Track proposal detail errors with proposal ID if available
    // logErrorToService({
    //   error,
    //   digest: error.digest,
    //   context: "proposal-detail",
    //   page: window.location.pathname,
    // });
  }, [error]);

  const errorType = classifyProposalError(error);
  const errorConfig = getProposalErrorConfig(errorType);

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <ErrorState
        title={errorConfig.title}
        description={errorConfig.description}
        error={error}
        reset={reset}
        size="full-page"
        showBackButton
        showHomeButton={errorType === "not-found"}
        showDetails={process.env.NODE_ENV === "development"}
      />
    </div>
  );
}

/**
 * Classify proposal-specific errors
 */
function classifyProposalError(error: Error): ProposalErrorType {
  const message = error.message.toLowerCase();

  // Not found errors
  if (
    message.includes("not found") ||
    message.includes("404") ||
    message.includes("does not exist")
  ) {
    return "not-found";
  }

  // Calculation errors
  if (
    message.includes("calculation") ||
    message.includes("circular") ||
    message.includes("solver") ||
    message.includes("decimal") ||
    message.includes("financial")
  ) {
    return "calculation";
  }

  // Scenario/sensitivity errors
  if (
    message.includes("scenario") ||
    message.includes("sensitivity") ||
    message.includes("analysis")
  ) {
    return "analysis";
  }

  // Chart/visualization errors
  if (
    message.includes("chart") ||
    message.includes("visualization") ||
    message.includes("render")
  ) {
    return "visualization";
  }

  // Data loading errors
  if (
    message.includes("fetch") ||
    message.includes("load") ||
    message.includes("query")
  ) {
    return "data-load";
  }

  return "unknown";
}

/**
 * Get error configuration for proposal errors
 */
function getProposalErrorConfig(type: ProposalErrorType): {
  title: string;
  description: string;
} {
  switch (type) {
    case "not-found":
      return {
        title: "Proposal Not Found",
        description:
          "The proposal you're looking for doesn't exist or has been deleted. Please check the URL or return to the proposals list.",
      };

    case "calculation":
      return {
        title: "Calculation Failed",
        description:
          "Unable to calculate the 30-year financial projection. Please verify the proposal data is complete and try again. If the issue persists, contact support.",
      };

    case "analysis":
      return {
        title: "Analysis Failed",
        description:
          "Unable to complete scenario or sensitivity analysis. Please check your input parameters and try again.",
      };

    case "visualization":
      return {
        title: "Display Error",
        description:
          "Unable to render charts or visualizations. This might be a temporary issue. Please refresh the page.",
      };

    case "data-load":
      return {
        title: "Failed to Load Proposal",
        description:
          "We couldn't load the proposal data. This might be a connection issue or the proposal might not exist.",
      };

    case "unknown":
    default:
      return {
        title: "Proposal Error",
        description:
          "An unexpected error occurred while viewing this proposal. Please try refreshing the page or contact support if the problem persists.",
      };
  }
}

/**
 * Proposal error types
 */
type ProposalErrorType =
  | "not-found"
  | "calculation"
  | "analysis"
  | "visualization"
  | "data-load"
  | "unknown";
