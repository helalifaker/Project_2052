"use client";

import { AlertCircle, RefreshCw, Home, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Error State Props
 */
interface ErrorStateProps {
  /** Error object or error message */
  error?: Error | string;
  /** Reset/retry function */
  reset?: () => void;
  /** Custom error title */
  title?: string;
  /** Custom error description */
  description?: string;
  /** Show error details (defaults to development mode only) */
  showDetails?: boolean;
  /** Show back button */
  showBackButton?: boolean;
  /** Show home button */
  showHomeButton?: boolean;
  /** Size variant */
  size?: "default" | "compact" | "full-page";
  /** Additional CSS classes */
  className?: string;
}

/**
 * Size configuration
 */
const sizeConfig = {
  compact: {
    container: "py-8 px-6",
    icon: "h-12 w-12",
    title: "text-lg",
    description: "text-sm",
    spacing: "space-y-3",
  },
  default: {
    container: "py-12 px-8",
    icon: "h-16 w-16",
    title: "text-xl",
    description: "text-base",
    spacing: "space-y-4",
  },
  "full-page": {
    container: "py-24 px-12 min-h-[60vh]",
    icon: "h-20 w-20",
    title: "text-2xl",
    description: "text-lg",
    spacing: "space-y-6",
  },
} as const;

/**
 * Extract error message from various error formats
 */
function getErrorMessage(error: Error | string | undefined): string {
  if (!error) return "An unexpected error occurred";
  if (typeof error === "string") return error;
  return error.message || "An unexpected error occurred";
}

/**
 * Get error stack trace (development only)
 */
function getErrorStack(error: Error | string | undefined): string | undefined {
  if (typeof error === "object" && error && "stack" in error) {
    return error.stack;
  }
  return undefined;
}

/**
 * Error State Component
 *
 * Friendly error boundary fallback with retry functionality.
 * Provides clear error messaging and recovery options.
 *
 * Features:
 * - Automatic error message extraction
 * - Retry/reset functionality
 * - Optional error details (dev mode)
 * - Navigation options (back, home)
 * - Three size variants
 * - Terracotta accent for error indication
 * - Smooth fade-in animation
 *
 * Design Details:
 * - Centered layout with balanced spacing
 * - Terracotta (--destructive) for error accent
 * - Elevation shadow on card variant
 * - Typography from design tokens
 * - Accessible error messaging
 *
 * @example
 * ```tsx
 * // Simple error state
 * <ErrorState
 *   error={error}
 *   reset={() => window.location.reload()}
 * />
 *
 * // Custom error message
 * <ErrorState
 *   title="Failed to load proposals"
 *   description="We couldn't fetch your lease proposals. Please try again."
 *   reset={refetch}
 * />
 *
 * // Full page error with navigation
 * <ErrorState
 *   error={error}
 *   reset={reset}
 *   size="full-page"
 *   showBackButton
 *   showHomeButton
 * />
 *
 * // Compact inline error
 * <ErrorState
 *   error="Failed to save changes"
 *   reset={handleRetry}
 *   size="compact"
 * />
 * ```
 */
export function ErrorState({
  error,
  reset,
  title,
  description,
  showDetails = process.env.NODE_ENV === "development",
  showBackButton = false,
  showHomeButton = false,
  size = "default",
  className,
}: ErrorStateProps) {
  const config = sizeConfig[size];
  const errorMessage = getErrorMessage(error);
  const errorStack = getErrorStack(error);

  const finalTitle = title || "Something went wrong";
  const finalDescription =
    description ||
    errorMessage ||
    "An unexpected error occurred. Please try again.";

  return (
    <div
      className={cn(
        "flex items-center justify-center w-full animate-fade-in",
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      <Card
        className={cn(
          "flex flex-col items-center text-center max-w-2xl",
          config.container
        )}
      >
        <div className={config.spacing}>
          {/* Error Icon */}
          <div className="flex justify-center">
            <div
              className={cn(
                "rounded-full bg-destructive/10 flex items-center justify-center",
                config.icon === "h-12 w-12" && "p-3",
                config.icon === "h-16 w-16" && "p-4",
                config.icon === "h-20 w-20" && "p-5"
              )}
            >
              <AlertCircle
                className={cn(config.icon, "text-destructive")}
                strokeWidth={1.5}
              />
            </div>
          </div>

          {/* Title */}
          <h3
            className={cn(
              config.title,
              "font-semibold tracking-tight text-foreground"
            )}
          >
            {finalTitle}
          </h3>

          {/* Description */}
          <p className={cn(config.description, "text-muted-foreground max-w-md")}>
            {finalDescription}
          </p>

          {/* Error Details (Development Only) */}
          {showDetails && errorStack && (
            <details className="text-left w-full mt-4">
              <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                Technical Details
              </summary>
              <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-auto max-h-48 text-left">
                <code className="text-destructive">{errorStack}</code>
              </pre>
            </details>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {reset && (
              <Button
                onClick={reset}
                variant="default"
                size={size === "compact" ? "sm" : "default"}
                className="w-full sm:w-auto gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            )}

            {showBackButton && (
              <Button
                onClick={() => window.history.back()}
                variant="outline"
                size={size === "compact" ? "sm" : "default"}
                className="w-full sm:w-auto gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Go Back
              </Button>
            )}

            {showHomeButton && (
              <Button
                onClick={() => (window.location.href = "/")}
                variant="ghost"
                size={size === "compact" ? "sm" : "default"}
                className="w-full sm:w-auto gap-2"
              >
                <Home className="h-4 w-4" />
                Home
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

/**
 * Preset Error States for Common Scenarios
 */
export const ErrorStates = {
  /**
   * Network Error
   */
  NetworkError: ({ reset }: { reset?: () => void }) => (
    <ErrorState
      title="Connection Error"
      description="Unable to reach the server. Please check your internet connection and try again."
      reset={reset}
    />
  ),

  /**
   * Not Found Error
   */
  NotFound: ({ resource = "page" }: { resource?: string }) => (
    <ErrorState
      title={`${resource.charAt(0).toUpperCase() + resource.slice(1)} Not Found`}
      description={`The ${resource} you're looking for doesn't exist or has been removed.`}
      showBackButton
      showHomeButton
    />
  ),

  /**
   * Permission Denied
   */
  PermissionDenied: () => (
    <ErrorState
      title="Access Denied"
      description="You don't have permission to access this resource. Contact your administrator if you believe this is an error."
      showBackButton
      showHomeButton
    />
  ),

  /**
   * Calculation Error
   */
  CalculationError: ({ reset }: { reset?: () => void }) => (
    <ErrorState
      title="Calculation Failed"
      description="Unable to complete the financial calculation. Please verify your input data and try again."
      reset={reset}
    />
  ),

  /**
   * Data Load Error
   */
  DataLoadError: ({ reset }: { reset?: () => void }) => (
    <ErrorState
      title="Failed to Load Data"
      description="We couldn't load the requested data. This might be a temporary issue."
      reset={reset}
    />
  ),

  /**
   * Generic Error (fallback)
   */
  Generic: ({ error, reset }: { error?: Error | string; reset?: () => void }) => (
    <ErrorState
      error={error}
      reset={reset}
      showBackButton
    />
  ),
};

/**
 * Error Boundary Component
 * Use this as a class component wrapper for React error boundaries
 */
export class ErrorBoundary extends Error {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
}
