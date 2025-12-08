/**
 * Chart Skeleton Component
 *
 * Loading skeletons for chart components with shimmer animation.
 * Matches chart dimensions and provides visual feedback during data loading.
 *
 * Features:
 * - Type-specific skeleton layouts (line, bar, area)
 * - Shimmer animation using .animate-shimmer utility
 * - Axis placeholders with tick marks
 * - Design token alignment for sizing and spacing
 * - Dark mode support via CSS variables
 */

import { chartResponsive } from "@/lib/design-tokens/chart-config";
import { componentRadius } from "@/lib/design-tokens/spacing";

type ChartType = "line" | "bar" | "area";

interface ChartSkeletonProps {
  /**
   * Chart type skeleton to display
   * @default 'line'
   */
  type?: ChartType;

  /**
   * Chart height in pixels
   * @default 300
   */
  height?: number;

  /**
   * Additional className
   */
  className?: string;
}

/**
 * Skeleton Component - Shimmer-animated placeholder
 */
function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-shimmer bg-gradient-to-r from-muted via-muted to-muted/70 ${className}`}
    />
  );
}

/**
 * Axis Tick Marks - Left Y-axis and Bottom X-axis
 */
function AxisTicks() {
  return (
    <>
      {/* Y-axis tick marks (left side) */}
      <div className="absolute left-0 top-4 bottom-16 w-10 flex flex-col justify-between px-2">
        {[...Array(5)].map((_, i) => (
          <div key={`y-tick-${i}`} className="flex items-center gap-1">
            <div className="w-1 h-px bg-muted" />
            <Skeleton className="w-6 h-3 rounded-sm" />
          </div>
        ))}
      </div>

      {/* X-axis tick marks (bottom) */}
      <div className="absolute bottom-4 left-10 right-2 h-6 flex justify-between px-2">
        {[...Array(6)].map((_, i) => (
          <div key={`x-tick-${i}`} className="flex flex-col items-center gap-1">
            <div className="w-px h-1 bg-muted" />
            <Skeleton className="w-8 h-3 rounded-sm" />
          </div>
        ))}
      </div>
    </>
  );
}

/**
 * Line Chart Skeleton
 * Shows 3-4 wavy horizontal lines with shimmer
 */
function LineChartSkeleton() {
  return (
    <div className="relative h-full pt-8 pb-20 pl-12 pr-2">
      <AxisTicks />

      {/* Data lines - wavy pattern */}
      <div className="h-full flex flex-col justify-between">
        {/* Line 1 - top */}
        <div className="flex items-center gap-1">
          <Skeleton className="flex-1 h-1 rounded-full opacity-75" />
          <Skeleton className="w-1 h-3 rounded" />
          <Skeleton className="flex-1 h-1 rounded-full opacity-75" />
        </div>

        {/* Line 2 - upper-middle */}
        <div className="flex items-center gap-1">
          <Skeleton className="flex-1 h-1 rounded-full opacity-60" />
          <Skeleton className="w-1 h-2 rounded" />
          <Skeleton className="flex-1 h-1 rounded-full opacity-60" />
        </div>

        {/* Line 3 - middle */}
        <div className="flex items-center gap-1">
          <Skeleton className="flex-1 h-1 rounded-full opacity-70" />
          <Skeleton className="w-1 h-3 rounded" />
          <Skeleton className="flex-1 h-1 rounded-full opacity-70" />
        </div>

        {/* Line 4 - lower-middle */}
        <div className="flex items-center gap-1">
          <Skeleton className="flex-1 h-1 rounded-full opacity-65" />
          <Skeleton className="w-1 h-2 rounded" />
          <Skeleton className="flex-1 h-1 rounded-full opacity-65" />
        </div>

        {/* Line 5 - bottom */}
        <div className="flex items-center gap-1">
          <Skeleton className="flex-1 h-1 rounded-full opacity-55" />
          <Skeleton className="w-1 h-1 rounded" />
          <Skeleton className="flex-1 h-1 rounded-full opacity-55" />
        </div>
      </div>
    </div>
  );
}

/**
 * Bar Chart Skeleton
 * Shows 5-6 rectangular bars with gaps
 */
function BarChartSkeleton() {
  return (
    <div className="relative h-full pt-4 pb-20 pl-12 pr-2">
      <AxisTicks />

      {/* Bar groups */}
      <div className="h-full flex items-flex-end justify-between gap-2 pb-2">
        {[...Array(6)].map((_, i) => {
          // Varying heights for visual interest
          const heights = [
            "h-1/3",
            "h-1/2",
            "h-2/3",
            "h-3/4",
            "h-1/2",
            "h-1/3",
          ];
          return (
            <div
              key={`bar-${i}`}
              className="flex-1 flex flex-col items-center justify-end"
            >
              {/* Single bar */}
              <Skeleton
                className={`w-full ${heights[i]} rounded-t opacity-70`}
              />
              {/* Spacing below bar */}
              <div className="h-2" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Area Chart Skeleton
 * Shows smooth curve shape filled with shimmer
 */
function AreaChartSkeleton() {
  return (
    <div className="relative h-full pt-8 pb-20 pl-12 pr-2">
      <AxisTicks />

      {/* Area shape - SVG for smooth curves */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 400 300"
        preserveAspectRatio="none"
      >
        {/* Defs for gradient */}
        <defs>
          <linearGradient
            id="skeleton-gradient"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop
              offset="0%"
              stopColor="hsl(var(--color-muted))"
              stopOpacity="0.3"
            />
            <stop
              offset="100%"
              stopColor="hsl(var(--color-muted))"
              stopOpacity="0.05"
            />
          </linearGradient>
        </defs>

        {/* Smooth area curve */}
        <path
          d="M 0,80 Q 100,40 200,60 T 400,100 L 400,300 L 0,300 Z"
          fill="url(#skeleton-gradient)"
          className="animate-shimmer"
        />

        {/* Top line (outline) */}
        <path
          d="M 0,80 Q 100,40 200,60 T 400,100"
          stroke="hsl(var(--color-muted))"
          strokeWidth="2"
          fill="none"
          className="opacity-50 animate-shimmer"
        />
      </svg>

      {/* Axis lines overlay */}
      <div className="absolute bottom-0 left-12 right-0 h-px bg-gradient-to-r from-muted to-transparent" />
    </div>
  );
}

/**
 * Chart Skeleton Component
 *
 * Displays a loading skeleton that matches the dimensions of the specified chart type.
 * Uses shimmer animation for visual feedback.
 *
 * @example
 * ```tsx
 * // Line chart skeleton (default)
 * <ChartSkeleton />
 *
 * // Bar chart with custom height
 * <ChartSkeleton type="bar" height={400} />
 *
 * // Area chart
 * <ChartSkeleton type="area" height={350} />
 * ```
 */
export function ChartSkeleton({
  type = "line",
  height = chartResponsive.defaultHeight,
  className = "",
}: ChartSkeletonProps) {
  const componentClass = `
    relative bg-card border border-border rounded-${componentRadius.card}
    overflow-hidden ${className}
  `.trim();

  return (
    <div className={componentClass} style={{ height: `${height}px` }}>
      {/* Background shimmer */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/5 to-transparent pointer-events-none" />

      {/* Chart-specific skeleton */}
      <div className="relative w-full h-full">
        {type === "line" && <LineChartSkeleton />}
        {type === "bar" && <BarChartSkeleton />}
        {type === "area" && <AreaChartSkeleton />}
      </div>
    </div>
  );
}

export default ChartSkeleton;
