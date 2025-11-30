"use client";

import { memo } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { FinancialValue } from "./FinancialValue";

/**
 * Size Variants
 * Maps to design token typography scales
 */
type KPICardSize = "compact" | "default" | "comfortable" | "hero";

/**
 * Value Display Options
 */
interface ValueConfig {
  /** Raw value - can be string for formatted values or number for auto-formatting */
  value: string | number | React.ReactNode;
  /** Type for auto-formatting (only used when value is a number) */
  type?: "currency" | "percent" | "number";
  /** Color mode for value display */
  colorMode?: "auto" | "positive" | "negative" | "neutral";
}

/**
 * Trend Indicator
 */
interface TrendConfig {
  /** Trend percentage value (e.g., 12.5 for +12.5%) */
  value: number;
  /** Optional label (e.g., "vs last month") */
  label?: string;
  /** Show icon (default: true) */
  showIcon?: boolean;
}

/**
 * Unified KPI Card Props
 */
interface KPICardProps {
  /** Card title/label */
  title: string;
  /** Value configuration - supports multiple formats */
  value: string | number | React.ReactNode | ValueConfig;
  /** Optional subtitle/description text */
  subtitle?: string;
  /** Optional icon */
  icon?: LucideIcon;
  /** Optional trend indicator */
  trend?: TrendConfig;
  /** Size variant - affects padding, typography, icon size */
  size?: KPICardSize;
  /** Custom accent color (hex or hsl) - overrides default copper */
  accentColor?: string;
  /** Show hover effects (default: true) */
  interactive?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Size-dependent styling configuration
 */
const sizeConfig = {
  compact: {
    padding: "p-4",
    titleSize: "text-[10px] uppercase tracking-[0.15em]",
    valueSize: "text-xl",
    valueWeight: "font-normal",
    subtitleSize: "text-xs",
    iconContainer: "h-8 w-8",
    iconSize: "h-4 w-4",
    trendSize: "text-xs",
    spacing: "space-y-1",
  },
  default: {
    padding: "p-6",
    titleSize: "text-[11px] uppercase tracking-[0.15em]",
    valueSize: "text-3xl",
    valueWeight: "font-light",
    subtitleSize: "text-sm",
    iconContainer: "h-10 w-10",
    iconSize: "h-5 w-5",
    trendSize: "text-sm",
    spacing: "space-y-2",
  },
  comfortable: {
    padding: "p-8",
    titleSize: "text-xs uppercase tracking-[0.2em]",
    valueSize: "text-4xl lg:text-5xl",
    valueWeight: "font-light",
    subtitleSize: "text-sm",
    iconContainer: "h-12 w-12",
    iconSize: "h-6 w-6",
    trendSize: "text-sm",
    spacing: "space-y-3",
  },
  hero: {
    padding: "p-10",
    titleSize: "text-xs uppercase tracking-[0.25em]",
    valueSize: "text-5xl lg:text-6xl",
    valueWeight: "font-extralight",
    subtitleSize: "text-base",
    iconContainer: "h-14 w-14",
    iconSize: "h-7 w-7",
    trendSize: "text-base",
    spacing: "space-y-4",
  },
} as const;

/**
 * Unified KPI Card Component
 *
 * A single, flexible KPI card that replaces:
 * - KPICard (standard dashboard)
 * - ExecutiveKPICard (executive demo)
 * - MetricCard (proposal detail)
 *
 * Features:
 * - 4 size variants (compact, default, comfortable, hero)
 * - Executive luxury typography (light weights for large values)
 * - Automatic value formatting or custom rendering
 * - Optional trend indicators with icons
 * - Configurable accent colors
 * - Premium hover effects and micro-interactions
 * - Design token-based styling
 *
 * @example
 * ```tsx
 * // Simple usage with auto-formatting
 * <KPICard
 *   title="Total Revenue"
 *   value={{ value: 125300000, type: "currency" }}
 *   icon={DollarSign}
 * />
 *
 * // Custom formatted value
 * <KPICard
 *   title="Net Profit"
 *   value="SAR 45.2M"
 *   size="hero"
 *   trend={{ value: 12.5, label: "vs last month" }}
 * />
 *
 * // Executive dashboard with custom accent
 * <KPICard
 *   title="Active Proposals"
 *   value={24}
 *   size="comfortable"
 *   accentColor="hsl(142 41% 38%)"
 * />
 * ```
 */
export const KPICard = memo(function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  size = "default",
  accentColor,
  interactive = true,
  className,
}: KPICardProps) {
  const config = sizeConfig[size];

  // Parse value configuration
  const valueConfig: ValueConfig =
    typeof value === "object" && value !== null && "value" in value
      ? (value as ValueConfig)
      : { value };

  // Render value based on configuration
  const renderValue = () => {
    const val = valueConfig.value;

    // If it's a React node, render directly
    if (typeof val !== "string" && typeof val !== "number") {
      return val;
    }

    // If it's a number and we have a type, use FinancialValue
    if (typeof val === "number" && valueConfig.type) {
      // Map colorMode to FinancialValue's supported values
      const mappedColorMode =
        valueConfig.colorMode === "auto" || valueConfig.colorMode === "negative"
          ? valueConfig.colorMode
          : "auto";

      return (
        <FinancialValue
          value={val}
          type={valueConfig.type}
          colorMode={mappedColorMode}
          size="xl"
          className={cn(
            config.valueSize,
            config.valueWeight,
            "tracking-tight tabular-nums",
          )}
        />
      );
    }

    // Otherwise, render as-is with typography
    return (
      <span
        className={cn(
          config.valueSize,
          config.valueWeight,
          "tracking-tight tabular-nums",
        )}
      >
        {val}
      </span>
    );
  };

  // Determine trend icon
  const TrendIcon = trend
    ? trend.value > 0
      ? TrendingUp
      : trend.value < 0
        ? TrendingDown
        : Minus
    : null;

  // Accent color style (defaults to copper)
  const accentStyle = accentColor
    ? ({ "--card-accent": accentColor } as React.CSSProperties)
    : undefined;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300",
        config.padding,
        interactive && "hover-lift cursor-default",
        interactive &&
          accentColor &&
          "hover:border-[var(--card-accent)] focus-within:border-[var(--card-accent)]",
        interactive &&
          !accentColor &&
          "hover:border-copper focus-within:border-copper",
        className,
      )}
      style={accentStyle}
    >
      <div className="flex items-start justify-between">
        <div className={cn("flex-1", config.spacing)}>
          {/* Title/Label */}
          <p
            className={cn(
              config.titleSize,
              "font-medium text-muted-foreground",
            )}
          >
            {title}
          </p>

          {/* Value */}
          <div className="animate-count-up">{renderValue()}</div>

          {/* Subtitle */}
          {subtitle && (
            <p
              className={cn(
                config.subtitleSize,
                "text-muted-foreground max-w-[90%]",
              )}
            >
              {subtitle}
            </p>
          )}

          {/* Trend Indicator */}
          {trend && (
            <div
              className={cn(
                "flex items-center gap-2",
                config.trendSize,
                trend.value > 0 && "text-financial-positive",
                trend.value < 0 && "text-financial-negative",
                trend.value === 0 && "text-muted-foreground",
              )}
            >
              {trend.showIcon !== false && TrendIcon && (
                <TrendIcon className="h-4 w-4" />
              )}
              <span className="font-medium tabular-nums">
                {trend.value > 0 ? "+" : ""}
                {trend.value}%
              </span>
              {trend.label && (
                <span className="text-muted-foreground">{trend.label}</span>
              )}
            </div>
          )}
        </div>

        {/* Icon */}
        {Icon && (
          <div className="flex-shrink-0">
            <div
              className={cn(
                config.iconContainer,
                "rounded-full flex items-center justify-center transition-all duration-300",
                accentColor
                  ? "bg-[var(--card-accent)]/10 group-hover:bg-[var(--card-accent)]/15"
                  : "bg-copper/10 group-hover:bg-copper/15",
              )}
            >
              <Icon
                className={cn(
                  config.iconSize,
                  "transition-colors duration-300",
                  accentColor ? "text-[var(--card-accent)]" : "text-copper",
                )}
              />
            </div>
          </div>
        )}
      </div>

      {/* Subtle accent line on hover (comfortable and hero sizes only) */}
      {interactive && (size === "comfortable" || size === "hero") && (
        <div
          className={cn(
            "absolute bottom-0 left-8 right-8 h-px",
            "scale-x-0 group-hover:scale-x-100",
            "transition-transform duration-500 origin-left",
            accentColor ? "bg-[var(--card-accent)]" : "bg-copper",
          )}
        />
      )}
    </Card>
  );
});

/**
 * KPI Card Grid
 *
 * Responsive grid wrapper for consistent KPI card layouts
 */
interface KPICardGridProps {
  children: React.ReactNode;
  /** Number of columns (defaults to responsive: 1/2/4) */
  columns?: 1 | 2 | 3 | 4;
  /** Grid gap size */
  gap?: "tight" | "default" | "relaxed";
  className?: string;
}

export const KPICardGrid = memo(function KPICardGrid({
  children,
  columns,
  gap = "default",
  className,
}: KPICardGridProps) {
  const gapClass = {
    tight: "gap-4",
    default: "gap-6",
    relaxed: "gap-8",
  }[gap];

  const columnClass = columns
    ? {
        1: "grid-cols-1",
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
      }[columns]
    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"; // Default responsive

  return (
    <div className={cn("grid", columnClass, gapClass, className)}>
      {children}
    </div>
  );
});
