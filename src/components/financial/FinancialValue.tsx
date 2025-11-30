"use client";

import { cn } from "@/lib/utils";
import {
  formatMillions,
  formatPercent,
  getFinancialColorClass,
} from "@/lib/utils/financial";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Decimal from "decimal.js";

interface FinancialValueProps {
  value: number | Decimal | null | undefined;
  formula?: string;
  className?: string;
  showColor?: boolean;
  monospace?: boolean;
  type?: "currency" | "percent" | "number";
  colorMode?: "auto" | "negative"; // Simplified: auto (red for negatives) or force negative
  size?: "sm" | "md" | "lg" | "xl";
}

export function FinancialValue({
  value,
  formula,
  className,
  showColor = true,
  monospace = true,
  type = "currency",
  colorMode = "auto",
  size = "md",
}: FinancialValueProps) {
  // Format based on type
  let formatted: string;
  switch (type) {
    case "percent":
      formatted = formatPercent(value ?? 0);
      break;
    case "number":
      formatted = (value ?? 0).toString();
      break;
    case "currency":
    default:
      formatted = formatMillions(value);
      break;
  }

  // Determine color class - minimalist: red for negatives only
  let colorClass = "";
  if (showColor) {
    if (colorMode === "auto") {
      colorClass = getFinancialColorClass(value ?? 0);
    } else if (colorMode === "negative") {
      colorClass = "text-red-700 dark:text-red-400";
    }
  }

  // Size classes - improved for better readability
  const sizeClasses = {
    sm: "text-xs tracking-tight",
    md: "text-sm leading-tight",
    lg: "text-base",
    xl: "text-xl font-semibold tracking-tight",
  };

  const content = (
    <span
      className={cn(
        "inline-block text-right",
        monospace && "font-mono tabular-nums",
        colorClass,
        sizeClasses[size],
        className,
      )}
    >
      {formatted}
    </span>
  );

  if (formula) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="text-sm">
              <div className="font-semibold mb-1">Calculation:</div>
              <div className="font-mono text-xs">{formula}</div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}
