"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { SegmentIndicator } from "./segment-indicator";

/**
 * Floating Metric - Hero KPIs that demand attention
 * Part of the Atelier Edition design system
 */
interface FloatingMetricProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Financial value to display */
  value: string | React.ReactNode;
  /** Label above the value */
  label: string;
  /** Optional subtitle below value */
  subtitle?: string;
  /** Trend indicator */
  trend?: {
    value: number;
    label?: string;
  };
  /** Center the content */
  centered?: boolean;
}

const FloatingMetric = React.forwardRef<HTMLDivElement, FloatingMetricProps>(
  (
    { className, value, label, subtitle, trend, centered = true, ...props },
    ref,
  ) => {
    const isPositive = trend && trend.value >= 0;

    return (
      <div
        ref={ref}
        data-slot="floating-metric"
        className={cn("floating-metric", centered && "text-center", className)}
        {...props}
      >
        <p className="atelier-label-uppercase mb-4">{label}</p>

        <div className="atelier-financial-hero">{value}</div>

        {subtitle && (
          <p className="mt-4 text-sm text-[var(--atelier-stone-500)]">
            {subtitle}
          </p>
        )}

        {trend && (
          <div className="mt-4 inline-flex">
            <SegmentIndicator
              variant={isPositive ? "positive" : "negative"}
              pulse
            >
              <span className="atelier-tabular font-medium">
                {isPositive ? "+" : ""}
                {trend.value.toFixed(1)}%
              </span>
              {trend.label && <span className="opacity-70">{trend.label}</span>}
            </SegmentIndicator>
          </div>
        )}
      </div>
    );
  },
);
FloatingMetric.displayName = "FloatingMetric";

export { FloatingMetric };
export type { FloatingMetricProps };
