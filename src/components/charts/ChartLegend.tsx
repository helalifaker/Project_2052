"use client";

import { cn } from "@/lib/utils";
import { chartColors } from "@/lib/design-tokens/chart-colors";

/**
 * ChartLegend - Unified legend component for all dashboard charts
 *
 * Provides consistent legend styling across line, bar, area, and waterfall charts.
 * Supports optional value display and winner highlighting.
 */

export interface ChartLegendItem {
  /** Unique identifier for the legend item */
  id: string;
  /** Display label (e.g., proposal name) */
  label: string;
  /** Color for the legend dot */
  color: string;
  /** Optional value to display (e.g., "SAR 20.2M") */
  value?: string;
  /** Whether this item is the winner/best performer */
  isWinner?: boolean;
  /** Whether the value is positive (for semantic coloring) */
  isPositive?: boolean;
}

interface ChartLegendProps {
  /** Array of legend items to display */
  items: ChartLegendItem[];
  /** Show values alongside labels */
  showValues?: boolean;
  /** Compact mode for smaller charts */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function ChartLegend({
  items,
  showValues = false,
  compact = false,
  className,
}: ChartLegendProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-wrap gap-x-5 gap-y-2 pt-3 border-t border-border/40 shrink-0",
        compact && "gap-x-3 gap-y-1.5 pt-2",
        className,
      )}
    >
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-2">
          {/* Color indicator dot */}
          <div
            className={cn(
              "rounded-full shrink-0",
              compact ? "w-2 h-2" : "w-2.5 h-2.5",
            )}
            style={{ backgroundColor: item.color }}
          />

          {/* Label with optional winner indicator */}
          <span
            className={cn(
              "text-xs",
              item.isWinner
                ? "font-semibold text-foreground"
                : "text-muted-foreground",
            )}
          >
            {item.label}
            {item.isWinner && " ★"}
          </span>

          {/* Optional value display */}
          {showValues && item.value && (
            <span
              className="text-xs font-medium tabular-nums"
              style={{
                color:
                  item.isPositive === undefined
                    ? "inherit"
                    : item.isPositive
                      ? chartColors.positive
                      : chartColors.negative,
              }}
            >
              {item.value}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
