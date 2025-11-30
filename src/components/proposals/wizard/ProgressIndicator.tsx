"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  id: string;
  title: string;
  description?: string;
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep: number;
  completedSteps?: Set<number>;
  stepErrors?: Map<number, number>; // Map of step index to error count
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

/**
 * Enhanced Progress Indicator with error count badges
 * Shows visual progress through wizard steps with validation status
 */
export function ProgressIndicator({
  steps,
  currentStep,
  completedSteps = new Set(),
  stepErrors = new Map(),
  onStepClick,
  className,
}: ProgressIndicatorProps) {
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Progress Bar */}
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-primary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={currentStep + 1}
          aria-valuemin={1}
          aria-valuemax={steps.length}
          aria-label={`Step ${currentStep + 1} of ${steps.length}`}
        />
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between items-start gap-2 overflow-x-auto pb-2">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.has(index);
          const isCurrent = index === currentStep;
          const isPast = index < currentStep;
          const errorCount = stepErrors.get(index) || 0;
          const hasErrors = errorCount > 0;
          const isClickable = onStepClick && (isPast || isCompleted);

          return (
            <div
              key={step.id}
              className={cn(
                "flex-1 min-w-[100px] group",
                isClickable && "cursor-pointer"
              )}
              onClick={() => isClickable && onStepClick(index)}
              role={isClickable ? "button" : undefined}
              tabIndex={isClickable ? 0 : undefined}
              aria-label={`${step.title}${isCurrent ? " (current)" : ""}${hasErrors ? ` (${errorCount} errors)` : ""}`}
              onKeyDown={(e) => {
                if (isClickable && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  onStepClick(index);
                }
              }}
            >
              <div className="flex flex-col items-center text-center gap-2">
                {/* Step Circle */}
                <div className="relative">
                  <div
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300",
                      isCurrent &&
                        "border-primary bg-primary text-primary-foreground scale-110 ring-2 ring-primary/20",
                      isCompleted &&
                        !isCurrent &&
                        "border-primary bg-primary text-primary-foreground",
                      !isCurrent &&
                        !isCompleted &&
                        !hasErrors &&
                        "border-muted-foreground/30 bg-background text-muted-foreground",
                      hasErrors &&
                        !isCurrent &&
                        "border-financial-negative bg-financial-negative/10 text-financial-negative",
                      isClickable && "group-hover:scale-110 group-hover:ring-2 group-hover:ring-primary/20"
                    )}
                  >
                    {isCompleted && !isCurrent ? (
                      <Check className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <span className="text-xs font-semibold">{index + 1}</span>
                    )}
                  </div>

                  {/* Error Count Badge */}
                  {hasErrors && !isCurrent && (
                    <div
                      className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-financial-negative text-white rounded-full text-[10px] font-bold shadow-sm animate-checkmark"
                      role="status"
                      aria-label={`${errorCount} validation errors`}
                    >
                      {errorCount}
                    </div>
                  )}
                </div>

                {/* Step Label */}
                <div className="space-y-0.5">
                  <p
                    className={cn(
                      "text-xs font-medium transition-colors whitespace-nowrap",
                      isCurrent && "text-primary font-semibold",
                      isCompleted && !isCurrent && "text-primary",
                      !isCurrent && !isCompleted && "text-muted-foreground",
                      hasErrors && !isCurrent && "text-financial-negative"
                    )}
                  >
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-[10px] text-muted-foreground/70 whitespace-nowrap hidden sm:block">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
