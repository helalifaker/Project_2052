"use client";

import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ValidationFeedbackProps {
  error?: string;
  isValid?: boolean;
  isValidating?: boolean;
  className?: string;
}

/**
 * Visual validation feedback component
 * Shows error, success, or validating state with appropriate icons and colors
 */
export function ValidationFeedback({
  error,
  isValid,
  isValidating,
  className,
}: ValidationFeedbackProps) {
  if (isValidating) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 text-sm text-muted-foreground mt-1",
          className
        )}
        role="status"
        aria-live="polite"
      >
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
        <span>Validating...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 text-sm text-financial-negative mt-1 animate-shake",
          className
        )}
        role="alert"
        aria-live="assertive"
      >
        <AlertCircle className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
        <span>{error}</span>
      </div>
    );
  }

  if (isValid) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 text-sm text-financial-positive mt-1 animate-checkmark",
          className
        )}
        role="status"
        aria-live="polite"
      >
        <CheckCircle2 className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
        <span>Valid</span>
      </div>
    );
  }

  return null;
}

/**
 * Inline field icon indicator (appears in input suffix area)
 */
interface FieldStatusIconProps {
  error?: string;
  isValid?: boolean;
  isValidating?: boolean;
}

export function FieldStatusIcon({
  error,
  isValid,
  isValidating,
}: FieldStatusIconProps) {
  if (isValidating) {
    return (
      <Loader2
        className="h-4 w-4 text-muted-foreground animate-spin"
        aria-label="Validating"
      />
    );
  }

  if (error) {
    return (
      <AlertCircle
        className="h-4 w-4 text-financial-negative"
        aria-label="Error"
      />
    );
  }

  if (isValid) {
    return (
      <CheckCircle2
        className="h-4 w-4 text-financial-positive animate-checkmark"
        aria-label="Valid"
      />
    );
  }

  return null;
}
