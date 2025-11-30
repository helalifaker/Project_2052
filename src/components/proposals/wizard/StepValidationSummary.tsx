"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ValidationError {
  field: string;
  message: string;
}

interface StepValidationSummaryProps {
  errors: ValidationError[];
  className?: string;
}

/**
 * Displays a summary of all validation errors for the current step
 * Appears at the top of the step form when there are errors
 */
export function StepValidationSummary({
  errors,
  className,
}: StepValidationSummaryProps) {
  if (errors.length === 0) {
    return null;
  }

  return (
    <Alert
      variant="destructive"
      className={cn("animate-slide-down", className)}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <AlertTriangle className="h-4 w-4" aria-hidden="true" />
      <AlertTitle>
        {errors.length === 1
          ? "1 field needs attention"
          : `${errors.length} fields need attention`}
      </AlertTitle>
      <AlertDescription className="mt-2">
        <ul className="list-disc list-inside space-y-1" role="list">
          {errors.map((error, index) => (
            <li key={index}>
              <span className="font-medium">{error.field}:</span> {error.message}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}

/**
 * Helper function to extract validation errors from React Hook Form errors object
 */
export function extractValidationErrors(
  errors: Record<string, { message?: string }>,
  fieldLabels: Record<string, string>
): ValidationError[] {
  return Object.entries(errors)
    .filter(([, error]) => error?.message)
    .map(([field, error]) => ({
      field: fieldLabels[field] || field,
      message: error.message || "Invalid value",
    }));
}
