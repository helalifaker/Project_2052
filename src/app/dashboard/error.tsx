"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/states/ErrorState";

/**
 * Dashboard Error Boundary
 *
 * Catches errors specific to the dashboard page.
 *
 * Common dashboard errors:
 * - Failed to fetch dashboard metrics
 * - Chart rendering failures
 * - KPI calculation errors
 * - Data aggregation issues
 *
 * Recovery strategy:
 * - Reset triggers a full dashboard data refetch
 * - User can navigate back to proposals or home
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.group("Dashboard Error");
      console.error("Error:", error);
      console.error("Digest:", error.digest ?? "N/A");
      console.groupEnd();
    }

    // TODO: Track dashboard-specific errors
    // logErrorToService({
    //   error,
    //   digest: error.digest,
    //   context: "dashboard",
    //   page: "executive-dashboard",
    // });
  }, [error]);

  // Check if it's a data loading error
  const isDataError =
    error.message.includes("fetch") ||
    error.message.includes("load") ||
    error.message.includes("metrics");

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <ErrorState
        title={isDataError ? "Failed to Load Dashboard" : "Dashboard Error"}
        description={
          isDataError
            ? "We couldn't load the dashboard metrics. This might be a temporary issue with the data service."
            : "An error occurred while displaying the dashboard. Please try refreshing the page."
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
