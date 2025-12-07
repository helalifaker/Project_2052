"use client";

import { cn } from "@/lib/utils";

/**
 * ChartInsight - Unified insight message component for all dashboard charts
 *
 * Provides a subtle, non-intrusive educational message below each chart.
 * Consistent styling ensures visual harmony across the dashboard.
 */

interface ChartInsightProps {
  /** The insight message to display (can include emoji at the start) */
  message: string;
  /** Additional CSS classes */
  className?: string;
}

export function ChartInsight({ message, className }: ChartInsightProps) {
  return (
    <div
      className={cn(
        "text-xs text-muted-foreground bg-muted/20 rounded-lg px-3 py-2 mt-3 shrink-0",
        className,
      )}
    >
      {message}
    </div>
  );
}
