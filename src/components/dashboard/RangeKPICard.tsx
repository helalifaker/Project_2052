"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import {
  ExecutiveCard,
  ExecutiveCardContent,
} from "@/components/ui/executive-card";
import { formatMillions } from "@/lib/utils/financial";

interface RangeKPICardProps {
  title: string;
  minValue: number;
  maxValue: number;
  minLabel?: string;
  maxLabel?: string;
  unit: "millions" | "percentage" | "years";
  icon?: LucideIcon;
  direction: "higher-better" | "lower-better";
  className?: string;
  size?: "default" | "compact" | "ultra-compact";
}

/**
 * Range KPI Card
 *
 * Displays min-max range for comparison metrics
 * Shows spread/variation between proposals with visual indicator
 *
 * Following Executive Luxury design:
 * - Premium whitespace and typography
 * - Visual range indicator bar
 * - Color-coded spread assessment
 * - Direction-aware formatting
 */
export const RangeKPICard = memo(function RangeKPICard({
  title,
  minValue,
  maxValue,
  minLabel,
  maxLabel,
  unit,
  icon: Icon,
  direction,
  className,
  size = "default",
}: RangeKPICardProps) {
  // Calculate range and spread
  const range = maxValue - minValue;
  const spreadPercent = minValue !== 0 ? (range / Math.abs(minValue)) * 100 : 0;

  // Format values based on unit
  const formatValue = (value: number): string => {
    if (unit === "millions") {
      return formatMillions(value);
    } else if (unit === "percentage") {
      return `${value.toFixed(1)}%`;
    } else {
      return `${value.toFixed(0)}Y`;
    }
  };

  const formattedMin = formatValue(minValue);
  const formattedMax = formatValue(maxValue);
  const formattedRange = formatValue(range);

  // Determine spread color (narrow is good, wide is concerning)
  const getSpreadColor = (): string => {
    if (spreadPercent < 20) return "var(--executive-positive)"; // Narrow spread - good
    if (spreadPercent < 50) return "var(--executive-warning)"; // Moderate spread
    return "var(--executive-negative)"; // Wide spread - concerning
  };

  const spreadColor = getSpreadColor();

  // Visual indicator: show min and max positions
  const minPosition = 0; // Always starts at left
  const maxPosition = 100; // Always ends at right

  return (
    <ExecutiveCard
      size={size}
      className={cn(
        "group relative transition-all duration-500 hover:border-[var(--executive-accent)]",
        className,
      )}
    >
      <ExecutiveCardContent
        className={cn(
          size === "ultra-compact"
            ? "p-3"
            : size === "compact"
              ? "p-4"
              : "p-5 lg:p-6",
        )}
      >
        {/* Optional icon - subtle, top right */}
        {Icon && (
          <div className="absolute top-5 right-5 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
            <Icon
              className="w-6 h-6"
              style={{ color: "var(--executive-accent)" }}
            />
          </div>
        )}

        {/* Label */}
        <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--executive-text-secondary)] mb-3">
          {title}
        </p>

        {/* Range Display - Min to Max */}
        <div className="space-y-3">
          {/* Min - Max Values */}
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "font-light tracking-tight tabular-nums text-[var(--executive-text)]",
                size === "ultra-compact" ? "text-xl" : "text-2xl lg:text-3xl",
              )}
            >
              {formattedMin}
            </div>
            <div className="text-lg text-[var(--executive-text-tertiary)] font-light">
              —
            </div>
            <div
              className={cn(
                "font-light tracking-tight tabular-nums text-[var(--executive-text)]",
                size === "ultra-compact" ? "text-xl" : "text-2xl lg:text-3xl",
              )}
            >
              {formattedMax}
            </div>
          </div>

          {/* Visual Range Indicator Bar */}
          <div className="relative h-1.5 bg-[var(--executive-bg-secondary)] rounded-full overflow-hidden">
            {/* Full range bar */}
            <div
              className="absolute top-0 left-0 h-full rounded-full transition-all duration-300"
              style={{
                width: "100%",
                background: `linear-gradient(to right, ${spreadColor}, ${spreadColor})`,
                opacity: 0.3,
              }}
            />
            {/* Min marker */}
            <div
              className="absolute top-0 w-1 h-full rounded-l-full"
              style={{
                left: `${minPosition}%`,
                backgroundColor: spreadColor,
              }}
            />
            {/* Max marker */}
            <div
              className="absolute top-0 w-1 h-full rounded-r-full"
              style={{
                left: `${maxPosition - 1}%`,
                backgroundColor: spreadColor,
              }}
            />
          </div>

          {/* Range Stats */}
          <div className="flex items-center justify-between text-xs">
            {/* Range Amount */}
            <div className="flex items-center gap-1.5">
              <span className="text-[var(--executive-text-tertiary)]">
                Range:
              </span>
              <span className="text-[var(--executive-text-secondary)] font-medium tabular-nums">
                {formattedRange}
              </span>
            </div>

            {/* Spread Percentage */}
            <div className="flex items-center gap-1.5">
              <span className="text-[var(--executive-text-tertiary)]">
                Spread:
              </span>
              <span
                className="font-medium tabular-nums"
                style={{ color: spreadColor }}
              >
                {spreadPercent.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Optional Labels (Min/Max winners) */}
          {(minLabel || maxLabel) && (
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider pt-1">
              {minLabel && (
                <div
                  className="text-[var(--executive-text-tertiary)]"
                  title={`Best: ${minLabel}`}
                >
                  {direction === "lower-better" ? "✓" : ""} {minLabel}
                </div>
              )}
              {maxLabel && (
                <div
                  className="text-[var(--executive-text-tertiary)]"
                  title={`Best: ${maxLabel}`}
                >
                  {direction === "higher-better" ? "✓" : ""} {maxLabel}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Subtle accent line on hover */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background:
              "linear-gradient(to right, transparent, var(--executive-accent), transparent)",
          }}
        />
      </ExecutiveCardContent>
    </ExecutiveCard>
  );
});
