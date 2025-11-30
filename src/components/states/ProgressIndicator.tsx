"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Progress Step
 */
interface ProgressStep {
  /** Step label */
  label: string;
  /** Optional description */
  description?: string;
  /** Optional custom status (overrides automatic calculation) */
  status?: "completed" | "current" | "upcoming";
}

/**
 * Progress Indicator Props
 */
interface ProgressIndicatorProps {
  /** Array of step configurations */
  steps: ProgressStep[];
  /** Current active step index (0-based) */
  currentStep: number;
  /** Variant style */
  variant?: "default" | "compact" | "detailed";
  /** Orientation */
  orientation?: "horizontal" | "vertical";
  /** Show step numbers */
  showNumbers?: boolean;
  /** Show connecting lines */
  showConnectors?: boolean;
  /** Click handler for steps (make steps clickable) */
  onStepClick?: (stepIndex: number) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Determine step status based on current step
 */
function getStepStatus(
  stepIndex: number,
  currentStep: number,
  customStatus?: "completed" | "current" | "upcoming"
): "completed" | "current" | "upcoming" {
  if (customStatus) return customStatus;
  if (stepIndex < currentStep) return "completed";
  if (stepIndex === currentStep) return "current";
  return "upcoming";
}

/**
 * Progress Indicator Component
 *
 * Visual step-by-step progress tracker for multi-step flows.
 * Commonly used in wizards, onboarding, and multi-page forms.
 *
 * Features:
 * - Horizontal and vertical orientations
 * - Copper accent for completed/current steps
 * - Animated transitions between steps
 * - Optional clickable steps for navigation
 * - Three display variants (default, compact, detailed)
 * - Responsive (stacks on mobile for horizontal variant)
 * - Accessible with proper ARIA labels
 *
 * Design Details:
 * - Copper (--primary) for completed steps
 * - Copper-500 ring for current step
 * - Muted colors for upcoming steps
 * - Smooth color transitions
 * - Typography from design tokens
 *
 * @example
 * ```tsx
 * // Basic usage (proposal wizard)
 * <ProgressIndicator
 *   steps={[
 *     { label: "Basics", description: "Proposal details" },
 *     { label: "Program", description: "Student & curriculum" },
 *     { label: "Financials", description: "Costs & rent" },
 *     { label: "Review", description: "Confirm & submit" },
 *   ]}
 *   currentStep={1}
 * />
 *
 * // Compact variant
 * <ProgressIndicator
 *   steps={steps}
 *   currentStep={2}
 *   variant="compact"
 * />
 *
 * // Clickable steps
 * <ProgressIndicator
 *   steps={steps}
 *   currentStep={currentStep}
 *   onStepClick={(index) => setCurrentStep(index)}
 * />
 *
 * // Vertical orientation
 * <ProgressIndicator
 *   steps={steps}
 *   currentStep={1}
 *   orientation="vertical"
 * />
 * ```
 */
export function ProgressIndicator({
  steps,
  currentStep,
  variant = "default",
  orientation = "horizontal",
  showNumbers = true,
  showConnectors = true,
  onStepClick,
  className,
}: ProgressIndicatorProps) {
  const isHorizontal = orientation === "horizontal";
  const isClickable = !!onStepClick;

  return (
    <nav
      aria-label="Progress"
      className={cn(
        "w-full",
        isHorizontal ? "flex items-start" : "flex flex-col",
        className
      )}
    >
      <ol
        className={cn(
          "flex w-full",
          isHorizontal
            ? "flex-row items-start justify-between"
            : "flex-col space-y-4"
        )}
      >
        {steps.map((step, index) => {
          const status = getStepStatus(index, currentStep, step.status);
          const isCompleted = status === "completed";
          const isCurrent = status === "current";
          const isUpcoming = status === "upcoming";
          const isLast = index === steps.length - 1;

          return (
            <li
              key={index}
              className={cn(
                "relative",
                isHorizontal ? "flex-1" : "flex items-start gap-4"
              )}
            >
              {/* Connector Line (between steps) */}
              {!isLast && showConnectors && isHorizontal && (
                <div
                  className={cn(
                    "absolute top-5 left-1/2 -ml-px h-0.5 w-full transition-colors duration-500",
                    isCompleted || isCurrent
                      ? "bg-primary"
                      : "bg-border"
                  )}
                  aria-hidden="true"
                />
              )}

              {/* Step Content */}
              <div
                className={cn(
                  "flex items-start gap-3",
                  isHorizontal && "flex-col items-center text-center",
                  isClickable && "cursor-pointer group",
                  "relative z-10"
                )}
                onClick={
                  isClickable ? () => onStepClick(index) : undefined
                }
                role={isClickable ? "button" : undefined}
                tabIndex={isClickable ? 0 : undefined}
                aria-current={isCurrent ? "step" : undefined}
                onKeyDown={
                  isClickable
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onStepClick(index);
                        }
                      }
                    : undefined
                }
              >
                {/* Step Circle/Number */}
                <div className="flex-shrink-0">
                  <div
                    className={cn(
                      "flex items-center justify-center rounded-full transition-all duration-300",
                      variant === "compact" ? "h-8 w-8" : "h-10 w-10",
                      isCompleted &&
                        "bg-primary text-primary-foreground",
                      isCurrent &&
                        "bg-background border-2 border-primary text-primary ring-4 ring-primary/20",
                      isUpcoming &&
                        "bg-muted border-2 border-border text-muted-foreground",
                      isClickable &&
                        !isCurrent &&
                        "group-hover:border-primary group-hover:text-primary"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" strokeWidth={2.5} />
                    ) : showNumbers ? (
                      <span
                        className={cn(
                          "font-medium",
                          variant === "compact" ? "text-sm" : "text-base"
                        )}
                      >
                        {index + 1}
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Vertical Connector */}
                {!isLast && showConnectors && !isHorizontal && (
                  <div
                    className={cn(
                      "absolute left-5 top-10 -ml-px h-full w-0.5 transition-colors duration-500",
                      isCompleted || isCurrent
                        ? "bg-primary"
                        : "bg-border"
                    )}
                    aria-hidden="true"
                  />
                )}

                {/* Step Text */}
                {variant !== "compact" && (
                  <div
                    className={cn(
                      "flex-1",
                      isHorizontal && "mt-3"
                    )}
                  >
                    <p
                      className={cn(
                        "text-sm font-medium transition-colors duration-300",
                        isCurrent && "text-primary",
                        isCompleted && "text-foreground",
                        isUpcoming && "text-muted-foreground",
                        isClickable &&
                          !isCurrent &&
                          "group-hover:text-primary"
                      )}
                    >
                      {step.label}
                    </p>

                    {step.description && variant === "detailed" && (
                      <p
                        className={cn(
                          "mt-1 text-xs transition-colors duration-300",
                          isCurrent && "text-muted-foreground",
                          (isCompleted || isUpcoming) && "text-muted-foreground/70"
                        )}
                      >
                        {step.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Compact Progress Bar (alternative minimal variant)
 */
export function ProgressBar({
  current,
  total,
  showLabel = true,
  className,
}: {
  current: number;
  total: number;
  showLabel?: boolean;
  className?: string;
}) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className={cn("w-full space-y-2", className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Step {current} of {total}
          </span>
          <span className="font-medium text-primary">{percentage}%</span>
        </div>
      )}

      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={total}
        />
      </div>
    </div>
  );
}

/**
 * Preset Progress Indicators for Common Flows
 */
export const ProgressIndicators = {
  /**
   * Proposal Wizard (7 steps)
   */
  ProposalWizard: ({
    currentStep,
    onStepClick,
  }: {
    currentStep: number;
    onStepClick?: (step: number) => void;
  }) => (
    <ProgressIndicator
      steps={[
        { label: "Basics", description: "Proposal details" },
        { label: "Program", description: "Students & curriculum" },
        { label: "Dynamic Setup", description: "Growth projections" },
        { label: "Transition", description: "2025-2027 setup" },
        { label: "Rent Model", description: "Lease structure" },
        { label: "CapEx", description: "Capital expenditures" },
        { label: "Review", description: "Confirm & calculate" },
      ]}
      currentStep={currentStep}
      onStepClick={onStepClick}
      variant="detailed"
    />
  ),

  /**
   * Onboarding Flow (4 steps)
   */
  Onboarding: ({
    currentStep,
  }: {
    currentStep: number;
  }) => (
    <ProgressIndicator
      steps={[
        { label: "Welcome" },
        { label: "Setup" },
        { label: "Configuration" },
        { label: "Complete" },
      ]}
      currentStep={currentStep}
      variant="compact"
    />
  ),
};
