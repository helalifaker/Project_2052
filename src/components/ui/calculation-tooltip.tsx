"use client";

import * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  Info,
  Calculator,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

// Types for calculation breakdown
export interface CalculationStep {
  label: string;
  value: number;
  formula?: string;
  operation?: "add" | "subtract" | "multiply" | "divide" | "equals";
}

export interface CalculationBreakdown {
  result: number;
  formula: string;
  steps: CalculationStep[];
  unit?: string;
  precision?: number;
}

// Format number with appropriate suffix and precision
function formatValue(
  value: number,
  precision: number = 2,
  unit?: string,
): string {
  const absValue = Math.abs(value);
  let formatted: string;

  if (absValue >= 1000000000) {
    formatted = (value / 1000000000).toFixed(precision) + "B";
  } else if (absValue >= 1000000) {
    formatted = (value / 1000000).toFixed(precision) + "M";
  } else if (absValue >= 1000) {
    formatted = (value / 1000).toFixed(precision) + "K";
  } else {
    formatted = value.toFixed(precision);
  }

  if (unit) {
    return `${unit}${formatted}`;
  }
  return formatted;
}

// Operation icon component
function OperationIcon({
  operation,
}: {
  operation?: CalculationStep["operation"];
}) {
  const className = "h-3 w-3 text-muted-foreground";

  switch (operation) {
    case "add":
      return <span className={className}>+</span>;
    case "subtract":
      return <Minus className={className} />;
    case "multiply":
      return <span className={className}>&times;</span>;
    case "divide":
      return <span className={className}>&divide;</span>;
    case "equals":
      return <span className={className}>=</span>;
    default:
      return null;
  }
}

// Value trend indicator
interface TrendIndicatorProps {
  value: number;
  baseline?: number;
  className?: string;
}

export function TrendIndicator({
  value,
  baseline = 0,
  className,
}: TrendIndicatorProps) {
  const diff = value - baseline;
  const percentage = baseline !== 0 ? (diff / Math.abs(baseline)) * 100 : 0;

  if (Math.abs(percentage) < 0.01) {
    return (
      <span
        className={cn(
          "text-muted-foreground text-xs flex items-center gap-1",
          className,
        )}
      >
        <Minus className="h-3 w-3" /> No change
      </span>
    );
  }

  const isPositive = diff > 0;

  return (
    <span
      className={cn("text-xs flex items-center gap-1", className)}
      style={{
        color: isPositive
          ? "var(--financial-positive)"
          : "var(--financial-negative)",
      }}
    >
      {isPositive ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      {isPositive ? "+" : ""}
      {percentage.toFixed(1)}%
    </span>
  );
}

// Main Calculation Tooltip Component
interface CalculationTooltipProps {
  children: React.ReactNode;
  breakdown: CalculationBreakdown;
  showIcon?: boolean;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  className?: string;
}

export function CalculationTooltip({
  children,
  breakdown,
  showIcon = false,
  side = "top",
  align = "center",
  className,
}: CalculationTooltipProps) {
  const { result, formula, steps, unit = "$", precision = 2 } = breakdown;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex items-center gap-1 cursor-help",
              className,
            )}
          >
            {children}
            {showIcon && <Info className="h-3 w-3 text-muted-foreground" />}
          </span>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className="max-w-sm p-4 space-y-3"
        >
          {/* Formula header */}
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground border-b pb-2">
            <Calculator className="h-4 w-4" />
            <span>Calculation Breakdown</span>
          </div>

          {/* Formula */}
          <div className="bg-muted/50 rounded px-3 py-2 font-mono text-xs">
            {formula}
          </div>

          {/* Steps breakdown */}
          <div className="space-y-1">
            {steps.map((step, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center justify-between text-sm",
                  step.operation === "equals" &&
                    "border-t pt-1 mt-1 font-medium",
                )}
              >
                <span className="flex items-center gap-2">
                  <OperationIcon operation={step.operation} />
                  <span className="text-muted-foreground">{step.label}</span>
                </span>
                <span
                  className={cn(
                    "font-mono",
                    step.operation === "equals" && "text-primary font-semibold",
                  )}
                  style={
                    step.value < 0
                      ? { color: "var(--financial-negative)" }
                      : undefined
                  }
                >
                  {formatValue(step.value, precision, unit)}
                </span>
              </div>
            ))}
          </div>

          {/* Result */}
          <div className="flex items-center justify-between border-t pt-2">
            <span className="text-sm font-medium">Result</span>
            <span
              className="text-lg font-bold font-mono"
              style={{
                color:
                  result < 0
                    ? "var(--financial-negative)"
                    : "var(--financial-positive)",
              }}
            >
              {formatValue(result, precision, unit)}
            </span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Simple value tooltip for quick explanations
interface ValueTooltipProps {
  children: React.ReactNode;
  label: string;
  description?: string;
  formula?: string;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}

export function ValueTooltip({
  children,
  label,
  description,
  formula,
  side = "top",
  className,
}: ValueTooltipProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "cursor-help border-b border-dotted border-muted-foreground/50",
              className,
            )}
          >
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">{label}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {formula && (
              <p className="text-xs font-mono bg-muted/50 rounded px-2 py-1 mt-2">
                {formula}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Financial metric tooltip with comparison
interface FinancialMetricTooltipProps {
  children: React.ReactNode;
  label: string;
  currentValue: number;
  previousValue?: number;
  unit?: string;
  precision?: number;
  description?: string;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}

export function FinancialMetricTooltip({
  children,
  label,
  currentValue,
  previousValue,
  unit = "$",
  precision = 2,
  description,
  side = "top",
  className,
}: FinancialMetricTooltipProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn("cursor-help", className)}>{children}</span>
        </TooltipTrigger>
        <TooltipContent side={side} className="min-w-[200px]">
          <div className="space-y-2">
            <p className="font-medium border-b pb-1">{label}</p>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Current</span>
              <span className="font-mono font-medium">
                {formatValue(currentValue, precision, unit)}
              </span>
            </div>

            {previousValue !== undefined && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Previous
                  </span>
                  <span className="font-mono text-muted-foreground">
                    {formatValue(previousValue, precision, unit)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t">
                  <span className="text-sm text-muted-foreground">Change</span>
                  <TrendIndicator
                    value={currentValue}
                    baseline={previousValue}
                  />
                </div>
              </>
            )}

            {description && (
              <p className="text-xs text-muted-foreground pt-1 border-t">
                {description}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Wrapper for financial values with automatic tooltip
interface EnhancedFinancialValueProps {
  value: number;
  label: string;
  breakdown?: CalculationBreakdown;
  previousValue?: number;
  unit?: string;
  precision?: number;
  className?: string;
  valueClassName?: string;
}

export function EnhancedFinancialValue({
  value,
  label,
  breakdown,
  previousValue,
  unit = "$",
  precision = 2,
  className,
  valueClassName,
}: EnhancedFinancialValueProps) {
  const formattedValue = formatValue(value, precision, unit);

  // If we have a full breakdown, use the calculation tooltip
  if (breakdown) {
    return (
      <CalculationTooltip breakdown={breakdown} className={className}>
        <span
          className={cn("font-mono tabular-nums", valueClassName)}
          style={value < 0 ? { color: "var(--financial-negative)" } : undefined}
        >
          {formattedValue}
        </span>
      </CalculationTooltip>
    );
  }

  // Otherwise use the simpler financial metric tooltip
  return (
    <FinancialMetricTooltip
      label={label}
      currentValue={value}
      previousValue={previousValue}
      unit={unit}
      precision={precision}
      className={className}
    >
      <span
        className={cn("font-mono tabular-nums", valueClassName)}
        style={value < 0 ? { color: "var(--financial-negative)" } : undefined}
      >
        {formattedValue}
      </span>
    </FinancialMetricTooltip>
  );
}
