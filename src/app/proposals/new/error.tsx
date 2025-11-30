"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/states/ErrorState";

/**
 * Proposal Creation Error Boundary
 *
 * Catches errors during proposal creation wizard.
 *
 * Common errors:
 * - Form validation failures
 * - Calculation engine errors
 * - Failed to save draft
 * - API submission errors
 * - Wizard step navigation errors
 *
 * Recovery strategy:
 * - Reset clears form and restarts wizard
 * - Data preservation: Form data might be lost on reset
 * - User can navigate back to proposals list
 */
export default function ProposalNewError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.group("Proposal Creation Error");
      console.error("Error:", error);
      console.error("Digest:", error.digest);
      console.groupEnd();
    }

    // TODO: Track proposal creation errors
    // logErrorToService({
    //   error,
    //   digest: error.digest,
    //   context: "proposal-creation",
    //   page: "/proposals/new",
    // });
  }, [error]);

  const errorType = classifyCreationError(error);
  const errorConfig = getCreationErrorConfig(errorType);

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <ErrorState
        title={errorConfig.title}
        description={errorConfig.description}
        error={error}
        reset={reset}
        size="full-page"
        showBackButton
        showHomeButton={errorType === "submission"}
        showDetails={process.env.NODE_ENV === "development"}
      />
    </div>
  );
}

/**
 * Classify proposal creation errors
 */
function classifyCreationError(error: Error): CreationErrorType {
  const message = error.message.toLowerCase();

  // Validation errors
  if (
    message.includes("validation") ||
    message.includes("required") ||
    message.includes("invalid")
  ) {
    return "validation";
  }

  // Calculation errors
  if (
    message.includes("calculation") ||
    message.includes("financial") ||
    message.includes("decimal")
  ) {
    return "calculation";
  }

  // Submission/API errors
  if (
    message.includes("submit") ||
    message.includes("save") ||
    message.includes("create") ||
    message.includes("api")
  ) {
    return "submission";
  }

  // Form errors
  if (message.includes("form") || message.includes("wizard")) {
    return "form";
  }

  return "unknown";
}

/**
 * Get error configuration for creation errors
 */
function getCreationErrorConfig(type: CreationErrorType): {
  title: string;
  description: string;
} {
  switch (type) {
    case "validation":
      return {
        title: "Validation Error",
        description:
          "Some required fields are missing or invalid. Please review your input and ensure all fields are filled correctly.",
      };

    case "calculation":
      return {
        title: "Calculation Failed",
        description:
          "Unable to calculate the financial projection with the provided data. Please verify all numeric inputs and try again.",
      };

    case "submission":
      return {
        title: "Failed to Create Proposal",
        description:
          "We couldn't save your proposal. Your data might not be lost. Please try again or contact support if the problem persists.",
      };

    case "form":
      return {
        title: "Form Error",
        description:
          "An error occurred in the proposal creation wizard. Please try refreshing the page and starting over.",
      };

    case "unknown":
    default:
      return {
        title: "Creation Error",
        description:
          "An unexpected error occurred while creating the proposal. Please try again or return to the proposals list.",
      };
  }
}

/**
 * Creation error types
 */
type CreationErrorType =
  | "validation"
  | "calculation"
  | "submission"
  | "form"
  | "unknown";
