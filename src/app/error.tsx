"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/states/ErrorState";
import {
  logError,
  classifyError,
  getUserFriendlyMessage,
  getSeverityFromType,
  isRecoverableError,
} from "@/lib/error-tracking";

/**
 * Root Error Boundary
 *
 * Catches errors in the root layout and all child routes that don't
 * have their own error boundaries.
 *
 * Features:
 * - Error classification and logging
 * - User-friendly error messages based on error type
 * - Reset functionality
 * - Development mode: Show full error details
 * - Production mode: Generic message + error tracking
 *
 * Error Types:
 * - Network errors (fetch failures)
 * - Calculation errors (financial engine)
 * - Permission errors (RBAC)
 * - Unknown errors (catch-all)
 */
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    const errorType = classifyError(error);
    const severity = getSeverityFromType(errorType);

    // Log error with context
    logError(error, {
      context: "root-error-boundary",
      severity,
      digest: error.digest,
      page: typeof window !== "undefined" ? window.location.pathname : undefined,
    });
  }, [error]);

  const errorType = classifyError(error);
  const errorConfig = getUserFriendlyMessage(errorType);
  const recoverable = isRecoverableError(errorType);

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <ErrorState
        title={errorConfig.title}
        description={errorConfig.description}
        error={error}
        reset={recoverable ? reset : undefined}
        size="full-page"
        showBackButton
        showHomeButton
        showDetails={process.env.NODE_ENV === "development"}
      />
    </div>
  );
}
