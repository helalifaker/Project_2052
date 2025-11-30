"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Size Variants (matching KPICard)
 */
type SkeletonSize = "compact" | "default" | "comfortable" | "hero";

/**
 * KPI Card Skeleton Props
 */
interface KPICardSkeletonProps {
  /** Size variant - must match KPICard size */
  size?: SkeletonSize;
  /** Show icon skeleton (default: true) */
  showIcon?: boolean;
  /** Show trend skeleton (default: false) */
  showTrend?: boolean;
  /** Show subtitle skeleton (default: false) */
  showSubtitle?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Size-dependent skeleton configuration
 * Matches KPICard sizeConfig dimensions
 */
const skeletonConfig = {
  compact: {
    padding: "p-4",
    titleWidth: "w-20",
    titleHeight: "h-3",
    valueWidth: "w-24",
    valueHeight: "h-6",
    subtitleWidth: "w-32",
    subtitleHeight: "h-3",
    iconSize: "h-8 w-8",
    trendWidth: "w-16",
    trendHeight: "h-3",
    spacing: "space-y-1",
  },
  default: {
    padding: "p-6",
    titleWidth: "w-24",
    titleHeight: "h-3",
    valueWidth: "w-32",
    valueHeight: "h-9",
    subtitleWidth: "w-40",
    subtitleHeight: "h-4",
    iconSize: "h-10 w-10",
    trendWidth: "w-20",
    trendHeight: "h-4",
    spacing: "space-y-2",
  },
  comfortable: {
    padding: "p-8",
    titleWidth: "w-28",
    titleHeight: "h-3",
    valueWidth: "w-48",
    valueHeight: "h-12",
    subtitleWidth: "w-48",
    subtitleHeight: "h-4",
    iconSize: "h-12 w-12",
    trendWidth: "w-24",
    trendHeight: "h-4",
    spacing: "space-y-3",
  },
  hero: {
    padding: "p-10",
    titleWidth: "w-32",
    titleHeight: "h-4",
    valueWidth: "w-56",
    valueHeight: "h-16",
    subtitleWidth: "w-56",
    subtitleHeight: "h-5",
    iconSize: "h-14 w-14",
    trendWidth: "w-28",
    trendHeight: "h-5",
    spacing: "space-y-4",
  },
} as const;

/**
 * KPI Card Skeleton Component
 *
 * Loading skeleton with premium shimmer animation.
 * Designed to match KPICard component dimensions exactly.
 *
 * Features:
 * - Size variants matching KPICard
 * - Smooth shimmer animation (animate-shimmer from globals.css)
 * - Optional elements (icon, trend, subtitle)
 * - Rounded corners matching design tokens
 *
 * @example
 * ```tsx
 * // Basic skeleton
 * <KPICardSkeleton />
 *
 * // Hero size with all elements
 * <KPICardSkeleton
 *   size="hero"
 *   showIcon
 *   showTrend
 *   showSubtitle
 * />
 *
 * // Grid of skeletons
 * <KPICardGrid>
 *   {Array.from({ length: 4 }).map((_, i) => (
 *     <KPICardSkeleton key={i} />
 *   ))}
 * </KPICardGrid>
 * ```
 */
export function KPICardSkeleton({
  size = "default",
  showIcon = true,
  showTrend = false,
  showSubtitle = false,
  className,
}: KPICardSkeletonProps) {
  const config = skeletonConfig[size];

  return (
    <Card className={cn("relative overflow-hidden", config.padding, className)}>
      <div className="flex items-start justify-between">
        <div className={cn("flex-1", config.spacing)}>
          {/* Title Skeleton */}
          <div
            className={cn(
              "animate-shimmer rounded bg-muted",
              config.titleWidth,
              config.titleHeight
            )}
          />

          {/* Value Skeleton */}
          <div
            className={cn(
              "animate-shimmer rounded bg-muted",
              config.valueWidth,
              config.valueHeight
            )}
          />

          {/* Subtitle Skeleton */}
          {showSubtitle && (
            <div
              className={cn(
                "animate-shimmer rounded bg-muted",
                config.subtitleWidth,
                config.subtitleHeight
              )}
            />
          )}

          {/* Trend Skeleton */}
          {showTrend && (
            <div
              className={cn(
                "animate-shimmer rounded bg-muted",
                config.trendWidth,
                config.trendHeight
              )}
            />
          )}
        </div>

        {/* Icon Skeleton */}
        {showIcon && (
          <div className="flex-shrink-0">
            <div
              className={cn(
                "animate-shimmer rounded-full bg-muted",
                config.iconSize
              )}
            />
          </div>
        )}
      </div>
    </Card>
  );
}

/**
 * KPI Card Grid Skeleton
 *
 * Pre-built grid of loading skeletons
 */
interface KPICardGridSkeletonProps {
  /** Number of skeleton cards to render */
  count?: number;
  /** Size of each skeleton */
  size?: SkeletonSize;
  /** Number of columns */
  columns?: 1 | 2 | 3 | 4;
  /** Grid gap size */
  gap?: "tight" | "default" | "relaxed";
  /** Show icons on all cards */
  showIcon?: boolean;
  /** Show trends on all cards */
  showTrend?: boolean;
  /** Show subtitles on all cards */
  showSubtitle?: boolean;
  className?: string;
}

export function KPICardGridSkeleton({
  count = 4,
  size = "default",
  columns,
  gap = "default",
  showIcon = true,
  showTrend = false,
  showSubtitle = false,
  className,
}: KPICardGridSkeletonProps) {
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
      {Array.from({ length: count }).map((_, i) => (
        <KPICardSkeleton
          key={i}
          size={size}
          showIcon={showIcon}
          showTrend={showTrend}
          showSubtitle={showSubtitle}
        />
      ))}
    </div>
  );
}
