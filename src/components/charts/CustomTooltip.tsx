"use client";

import React from "react";
import { chartTooltipStyle, chartTypography } from "@/lib/design-tokens/chart-config";
import { formatMillions } from "@/lib/utils/financial";

/**
 * Tooltip Value Formatter Type
 */
type TooltipFormatter = (value: number, name: string, props: any) => string | [string, string];

/**
 * Custom Tooltip Props
 *
 * Props for the CustomTooltip component used by Recharts.
 */
export interface CustomTooltipProps {
  /** Tooltip active state (provided by Recharts) */
  active?: boolean;
  /** Payload data (provided by Recharts) */
  payload?: Array<{
    value: number;
    name: string;
    dataKey: string;
    color: string;
    payload: any;
  }>;
  /** Label (provided by Recharts) */
  label?: string | number;
  /** Optional label formatter */
  labelFormatter?: (label: string | number) => string;
  /** Optional value formatter */
  valueFormatter?: TooltipFormatter;
  /** Show color indicators (default: true) */
  showColorIndicators?: boolean;
  /** Currency symbol (default: "SAR") */
  currency?: string;
  /** Number format type */
  format?: "millions" | "billions" | "percent" | "number";
}

/**
 * Custom Tooltip Component
 *
 * Standardized tooltip for all Recharts components.
 * Uses design tokens for consistent styling across the application.
 *
 * Features:
 * - Design token-based styling
 * - Automatic value formatting (millions, billions, percent)
 * - Color indicators for multi-series data
 * - Dark mode support
 * - Customizable formatters
 *
 * @example
 * ```tsx
 * <LineChart data={data}>
 *   <Tooltip content={<CustomTooltip format="millions" />} />
 * </LineChart>
 * ```
 *
 * **Performance:**
 * - Memoized to prevent re-renders on inactive state
 * - Efficiently handles multiple payload items
 */
export const CustomTooltip = React.memo(function CustomTooltip({
  active,
  payload,
  label,
  labelFormatter,
  valueFormatter,
  showColorIndicators = true,
  currency = "SAR",
  format = "millions",
}: CustomTooltipProps) {
  // Don't render if inactive or no data
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  // Format label
  const formattedLabel = labelFormatter
    ? labelFormatter(label!)
    : typeof label === "number"
      ? label.toString()
      : label;

  // Default value formatter based on format type
  const defaultValueFormatter: TooltipFormatter = (value: number) => {
    switch (format) {
      case "millions":
        return `${currency} ${formatMillions(value)}`;
      case "billions":
        return `${currency} ${(value / 1_000_000_000).toFixed(2)}B`;
      case "percent":
        return `${value.toFixed(1)}%`;
      case "number":
        return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
      default:
        return value.toString();
    }
  };

  const formatter = valueFormatter || defaultValueFormatter;

  return (
    <div
      style={{
        ...chartTooltipStyle,
        minWidth: "160px",
      }}
    >
      {/* Label */}
      {formattedLabel && (
        <div
          className="text-xs uppercase tracking-wider font-semibold mb-2 pb-2 border-b border-border"
          style={{
            color: "hsl(var(--color-foreground))",
            fontSize: `${chartTypography.tooltip.fontSize}px`,
          }}
        >
          {formattedLabel}
        </div>
      )}

      {/* Values */}
      <div className="space-y-1.5">
        {payload.map((entry, index) => {
          const formattedValue = formatter(entry.value, entry.name, entry);
          const displayValue = Array.isArray(formattedValue)
            ? formattedValue[0]
            : formattedValue;
          const displayName = Array.isArray(formattedValue)
            ? formattedValue[1] || entry.name
            : entry.name;

          return (
            <div
              key={`tooltip-item-${index}`}
              className="flex items-center justify-between gap-3"
            >
              {/* Name with color indicator */}
              <div className="flex items-center gap-2">
                {showColorIndicators && (
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: entry.color }}
                  />
                )}
                <span
                  className="text-xs text-muted-foreground"
                  style={{ fontSize: `${chartTypography.tooltip.fontSize}px` }}
                >
                  {displayName}
                </span>
              </div>

              {/* Value */}
              <span
                className="font-semibold tabular-nums text-xs"
                style={{
                  color: "hsl(var(--color-foreground))",
                  fontSize: `${chartTypography.tooltip.fontSize}px`,
                }}
              >
                {displayValue}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

/**
 * Financial Tooltip
 *
 * Pre-configured tooltip for financial charts (millions format)
 */
export function FinancialTooltip(props: Omit<CustomTooltipProps, "format">) {
  return <CustomTooltip {...props} format="millions" />;
}

/**
 * Percent Tooltip
 *
 * Pre-configured tooltip for percentage charts
 */
export function PercentTooltip(props: Omit<CustomTooltipProps, "format">) {
  return <CustomTooltip {...props} format="percent" />;
}

/**
 * Number Tooltip
 *
 * Pre-configured tooltip for count/number charts
 */
export function NumberTooltip(props: Omit<CustomTooltipProps, "format">) {
  return <CustomTooltip {...props} format="number" />;
}
