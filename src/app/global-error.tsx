"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/states/ErrorState";
import { logError } from "@/lib/error-tracking";

/**
 * Global Error Boundary
 *
 * Catches all unhandled errors at the root level.
 * This is the last line of defense for error handling.
 *
 * Features:
 * - Error logging (console in dev, analytics placeholder in prod)
 * - User-friendly error display
 * - Full page reset functionality
 * - Proper HTML structure required by Next.js
 *
 * Note: global-error.tsx must include <html> and <body> tags
 * as it replaces the root layout when activated.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log critical error
    logError(error, {
      context: "global-error-boundary",
      severity: "critical",
      digest: error.digest,
      page: typeof window !== "undefined" ? window.location.pathname : undefined,
    });
  }, [error]);

  return (
    <html lang="en">
      <body className="font-sans antialiased bg-background">
        <div className="min-h-screen flex items-center justify-center p-4">
          <ErrorState
            title="Application Error"
            description="We encountered an unexpected error. Our team has been notified. Please try refreshing the page."
            error={error}
            reset={reset}
            size="full-page"
            showHomeButton
            showDetails={process.env.NODE_ENV === "development"}
          />
        </div>
      </body>
    </html>
  );
}
