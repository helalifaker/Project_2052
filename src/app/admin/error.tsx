"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/states/ErrorState";

/**
 * Admin Panel Error Boundary
 *
 * Catches errors in the admin section.
 *
 * Common admin errors:
 * - Permission denied (non-admin users)
 * - Configuration update failures
 * - Historical data import errors
 * - System settings errors
 *
 * Recovery strategy:
 * - Reset triggers data refetch
 * - Permission errors show contact admin message
 * - Critical config errors suggest data validation
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.group("Admin Panel Error");
      console.error("Error:", error);
      console.error("Digest:", error.digest);
      console.groupEnd();
    }

    // TODO: Track admin errors with high priority
    // logErrorToService({
    //   error,
    //   digest: error.digest,
    //   context: "admin-panel",
    //   severity: "high",
    //   page: window.location.pathname,
    // });
  }, [error]);

  const errorType = classifyAdminError(error);
  const errorConfig = getAdminErrorConfig(errorType);

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <ErrorState
        title={errorConfig.title}
        description={errorConfig.description}
        error={error}
        reset={errorType !== "permission" ? reset : undefined}
        size="full-page"
        showBackButton
        showHomeButton={errorType === "permission"}
        showDetails={process.env.NODE_ENV === "development"}
      />
    </div>
  );
}

/**
 * Classify admin-specific errors
 */
function classifyAdminError(error: Error): AdminErrorType {
  const message = error.message.toLowerCase();

  // Permission errors
  if (
    message.includes("permission") ||
    message.includes("unauthorized") ||
    message.includes("forbidden") ||
    message.includes("admin") ||
    message.includes("rbac")
  ) {
    return "permission";
  }

  // Configuration errors
  if (
    message.includes("config") ||
    message.includes("settings") ||
    message.includes("validation")
  ) {
    return "configuration";
  }

  // Data import errors
  if (
    message.includes("import") ||
    message.includes("upload") ||
    message.includes("parse")
  ) {
    return "import";
  }

  // Database errors
  if (
    message.includes("database") ||
    message.includes("query") ||
    message.includes("prisma")
  ) {
    return "database";
  }

  return "unknown";
}

/**
 * Get error configuration for admin errors
 */
function getAdminErrorConfig(type: AdminErrorType): {
  title: string;
  description: string;
} {
  switch (type) {
    case "permission":
      return {
        title: "Admin Access Required",
        description:
          "You don't have administrator permissions to access this section. Contact your system administrator if you need access.",
      };

    case "configuration":
      return {
        title: "Configuration Error",
        description:
          "Unable to update system configuration. Please verify your input data meets all validation requirements and try again.",
      };

    case "import":
      return {
        title: "Import Failed",
        description:
          "Unable to import the data file. Please check the file format, ensure all required fields are present, and try again.",
      };

    case "database":
      return {
        title: "Database Error",
        description:
          "Unable to save changes to the database. This might be a temporary issue. Please try again in a moment.",
      };

    case "unknown":
    default:
      return {
        title: "Admin Panel Error",
        description:
          "An unexpected error occurred in the admin panel. Please try refreshing the page or contact support if the problem persists.",
      };
  }
}

/**
 * Admin error types
 */
type AdminErrorType =
  | "permission"
  | "configuration"
  | "import"
  | "database"
  | "unknown";
