/**
 * Error Tracking and Logging Utilities
 *
 * Centralized error logging for error boundaries and error handling.
 * Provides consistent error tracking across the application.
 *
 * Features:
 * - Development: Console logging with context
 * - Production: Ready for integration with error tracking services
 * - Error classification and severity levels
 * - Contextual information capture
 *
 * Usage:
 * ```typescript
 * import { logError, ErrorContext } from '@/lib/error-tracking';
 *
 * logError(error, {
 *   context: 'proposal-calculation',
 *   severity: 'high',
 *   additionalData: { proposalId: '123' }
 * });
 * ```
 */

/**
 * Error severity levels
 */
export type ErrorSeverity = "low" | "medium" | "high" | "critical";

/**
 * Error context information
 */
export interface ErrorContext {
  /** Where the error occurred (e.g., 'proposal-detail', 'dashboard') */
  context: string;
  /** Error severity level */
  severity?: ErrorSeverity;
  /** Page URL or route where error occurred */
  page?: string;
  /** Error digest from Next.js */
  digest?: string;
  /** User ID if available */
  userId?: string;
  /** Additional contextual data */
  additionalData?: Record<string, unknown>;
  /** User-friendly error message override */
  userMessage?: string;
}

/**
 * Log error to appropriate service based on environment
 */
export function logError(
  error: Error | string,
  context?: ErrorContext
): void {
  const errorObj = typeof error === "string" ? new Error(error) : error;
  const errorContext: ErrorContext = {
    context: context?.context || "unknown",
    severity: context?.severity || "medium",
    page: context?.page || (typeof window !== "undefined" ? window.location.pathname : undefined),
    digest: context?.digest,
    userId: context?.userId,
    additionalData: context?.additionalData,
    userMessage: context?.userMessage,
  };

  // Development: Console logging
  if (process.env.NODE_ENV === "development") {
    logToConsole(errorObj, errorContext);
  }

  // Production: Send to error tracking service
  if (process.env.NODE_ENV === "production") {
    logToService(errorObj, errorContext);
  }
}

/**
 * Log to console in development mode
 */
function logToConsole(error: Error, context: ErrorContext): void {
  const severity = context.severity || "medium";
  const style = getSeverityStyle(severity);

  console.group(`%c${severity.toUpperCase()} Error: ${context.context}`, style);
  console.error("Error:", error);
  console.log("Context:", {
    page: context.page,
    digest: context.digest,
    userId: context.userId,
    additionalData: context.additionalData,
  });
  if (error.stack) {
    console.log("Stack trace:", error.stack);
  }
  console.groupEnd();
}

/**
 * Get console style based on severity
 */
function getSeverityStyle(severity: ErrorSeverity): string {
  switch (severity) {
    case "critical":
      return "color: white; background-color: #DC2626; font-weight: bold; padding: 2px 6px; border-radius: 3px;";
    case "high":
      return "color: white; background-color: #EA580C; font-weight: bold; padding: 2px 6px; border-radius: 3px;";
    case "medium":
      return "color: white; background-color: #F59E0B; font-weight: bold; padding: 2px 6px; border-radius: 3px;";
    case "low":
      return "color: white; background-color: #3B82F6; font-weight: bold; padding: 2px 6px; border-radius: 3px;";
  }
}

/**
 * Log to error tracking service in production
 * TODO: Integrate with Sentry, LogRocket, or other error tracking service
 */
function logToService(error: Error, context: ErrorContext): void {
  // Example integration with Sentry:
  // if (typeof window !== 'undefined' && window.Sentry) {
  //   window.Sentry.captureException(error, {
  //     level: mapSeverityToSentryLevel(context.severity),
  //     tags: {
  //       context: context.context,
  //       page: context.page,
  //     },
  //     extra: {
  //       digest: context.digest,
  //       additionalData: context.additionalData,
  //     },
  //     user: context.userId ? { id: context.userId } : undefined,
  //   });
  // }

  // For now, just log to console in production as well
  // Remove this once proper error tracking is set up
  console.error("[Production Error]", {
    error: error.message,
    context,
    stack: error.stack,
  });
}

/**
 * Map our severity levels to Sentry severity levels
 */
// function mapSeverityToSentryLevel(severity?: ErrorSeverity): 'fatal' | 'error' | 'warning' | 'info' {
//   switch (severity) {
//     case 'critical':
//       return 'fatal';
//     case 'high':
//       return 'error';
//     case 'medium':
//       return 'warning';
//     case 'low':
//       return 'info';
//     default:
//       return 'error';
//   }
// }

/**
 * Classify error type based on error message
 */
export function classifyError(error: Error): ErrorType {
  const message = error.message.toLowerCase();

  if (
    message.includes("fetch") ||
    message.includes("network") ||
    message.includes("failed to fetch")
  ) {
    return "network";
  }

  if (
    message.includes("permission") ||
    message.includes("unauthorized") ||
    message.includes("forbidden")
  ) {
    return "permission";
  }

  if (
    message.includes("calculation") ||
    message.includes("decimal") ||
    message.includes("financial")
  ) {
    return "calculation";
  }

  if (
    message.includes("validation") ||
    message.includes("invalid") ||
    message.includes("required")
  ) {
    return "validation";
  }

  if (
    message.includes("database") ||
    message.includes("prisma") ||
    message.includes("query")
  ) {
    return "database";
  }

  if (message.includes("not found") || message.includes("404")) {
    return "not-found";
  }

  return "unknown";
}

/**
 * Error types
 */
export type ErrorType =
  | "network"
  | "permission"
  | "calculation"
  | "validation"
  | "database"
  | "not-found"
  | "unknown";

/**
 * Get user-friendly error message based on error type
 */
export function getUserFriendlyMessage(errorType: ErrorType): {
  title: string;
  description: string;
} {
  switch (errorType) {
    case "network":
      return {
        title: "Connection Error",
        description:
          "Unable to reach the server. Please check your internet connection and try again.",
      };

    case "permission":
      return {
        title: "Access Denied",
        description:
          "You don't have permission to access this resource. Contact your administrator if you believe this is an error.",
      };

    case "calculation":
      return {
        title: "Calculation Failed",
        description:
          "Unable to complete the financial calculation. Please verify your input data and try again.",
      };

    case "validation":
      return {
        title: "Validation Error",
        description:
          "Some required fields are missing or invalid. Please review your input and try again.",
      };

    case "database":
      return {
        title: "Database Error",
        description:
          "Unable to access the database. This might be a temporary issue. Please try again.",
      };

    case "not-found":
      return {
        title: "Not Found",
        description:
          "The resource you're looking for doesn't exist or has been removed.",
      };

    case "unknown":
    default:
      return {
        title: "Something Went Wrong",
        description:
          "We encountered an unexpected error. Please try again or contact support if the problem persists.",
      };
  }
}

/**
 * Check if error is recoverable (user can retry)
 */
export function isRecoverableError(errorType: ErrorType): boolean {
  return [
    "network",
    "calculation",
    "validation",
    "database",
    "unknown",
  ].includes(errorType);
}

/**
 * Get severity level based on error type
 */
export function getSeverityFromType(errorType: ErrorType): ErrorSeverity {
  switch (errorType) {
    case "calculation":
    case "database":
      return "high";
    case "permission":
    case "not-found":
      return "medium";
    case "network":
    case "validation":
      return "low";
    case "unknown":
    default:
      return "medium";
  }
}
