"use client";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { KPICardGridSkeleton } from "@/components/financial/KPICardSkeleton";

/**
 * Page Skeleton Variants
 */
type PageSkeletonVariant = "dashboard" | "detail" | "list";

/**
 * Page Skeleton Props
 */
interface PageSkeletonProps {
  /** Layout variant determines structure */
  variant?: PageSkeletonVariant;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Dashboard Skeleton
 * KPI cards grid + chart placeholders
 */
function DashboardSkeleton() {
  return (
    <div className="animate-fade-in space-y-8">
      {/* KPI Cards Grid */}
      <KPICardGridSkeleton count={4} showIcon showTrend />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-6 overflow-hidden">
            {/* Chart Title */}
            <div className="mb-6 space-y-2">
              <div className="h-5 w-48 bg-muted animate-shimmer rounded" />
              <div className="h-3 w-32 bg-muted animate-shimmer rounded" />
            </div>

            {/* Chart Body */}
            <div className="h-64 bg-muted animate-shimmer rounded" />
          </Card>
        ))}
      </div>
    </div>
  );
}

/**
 * Detail Skeleton
 * Header + tabs + content sections
 */
function DetailSkeleton() {
  return (
    <div className="animate-fade-in space-y-6">
      {/* Header Skeleton */}
      <Card className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1 space-y-3">
            <div className="h-8 w-64 bg-muted animate-shimmer rounded" />
            <div className="h-4 w-48 bg-muted animate-shimmer rounded" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-24 bg-muted animate-shimmer rounded" />
            <div className="h-10 w-24 bg-muted animate-shimmer rounded" />
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-20 bg-muted animate-shimmer rounded" />
              <div className="h-7 w-full bg-muted animate-shimmer rounded" />
            </div>
          ))}
        </div>
      </Card>

      {/* Tabs Skeleton */}
      <div className="flex gap-4 border-b border-border">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-10 w-24 bg-muted animate-shimmer rounded-t"
          />
        ))}
      </div>

      {/* Content Skeleton */}
      <Card className="p-8">
        <div className="space-y-6">
          <div className="h-6 w-40 bg-muted animate-shimmer rounded" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-muted animate-shimmer rounded" />
            <div className="h-4 w-5/6 bg-muted animate-shimmer rounded" />
            <div className="h-4 w-4/6 bg-muted animate-shimmer rounded" />
          </div>
          <div className="h-96 bg-muted animate-shimmer rounded" />
        </div>
      </Card>
    </div>
  );
}

/**
 * List Skeleton
 * Table with rows
 */
function ListSkeleton() {
  return (
    <div className="animate-fade-in space-y-6">
      {/* Header with search/filters */}
      <div className="flex items-center justify-between">
        <div className="h-10 w-64 bg-muted animate-shimmer rounded" />
        <div className="flex gap-3">
          <div className="h-10 w-32 bg-muted animate-shimmer rounded" />
          <div className="h-10 w-24 bg-muted animate-shimmer rounded" />
        </div>
      </div>

      {/* Table Skeleton */}
      <Card className="overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-5 gap-4 p-4 border-b border-border bg-muted/50">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 bg-muted animate-shimmer rounded" />
          ))}
        </div>

        {/* Table Rows */}
        {Array.from({ length: 8 }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid grid-cols-5 gap-4 p-4 border-b border-border last:border-0"
          >
            {Array.from({ length: 5 }).map((_, colIndex) => (
              <div
                key={colIndex}
                className={cn(
                  "h-5 bg-muted animate-shimmer rounded",
                  colIndex === 0 ? "w-3/4" : "w-full"
                )}
              />
            ))}
          </div>
        ))}
      </Card>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-4 w-32 bg-muted animate-shimmer rounded" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-10 w-10 bg-muted animate-shimmer rounded"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Page Skeleton Component
 *
 * Full-page loading state with variant-based layouts.
 * Uses premium shimmer animations and design token spacing.
 *
 * Features:
 * - Three layout variants (dashboard, detail, list)
 * - Smooth fade-in animation
 * - Shimmer effect on all skeleton elements
 * - Responsive grid layouts
 * - Matches component structure of real pages
 *
 * Design Details:
 * - Uses elevation shadows from design tokens
 * - Copper-tinted shimmer animation
 * - Consistent spacing with 4px base unit
 * - Rounded corners matching design system
 *
 * @example
 * ```tsx
 * // Dashboard loading
 * <PageSkeleton variant="dashboard" />
 *
 * // Proposal detail loading
 * <PageSkeleton variant="detail" />
 *
 * // List/table loading
 * <PageSkeleton variant="list" />
 * ```
 */
export function PageSkeleton({
  variant = "dashboard",
  className,
}: PageSkeletonProps) {
  const skeletonMap = {
    dashboard: <DashboardSkeleton />,
    detail: <DetailSkeleton />,
    list: <ListSkeleton />,
  };

  return <div className={cn("w-full", className)}>{skeletonMap[variant]}</div>;
}

/**
 * Individual skeleton building blocks for custom compositions
 */
export const SkeletonBlocks = {
  /**
   * KPI Card Grid Skeleton
   */
  KPIGrid: KPICardGridSkeleton,

  /**
   * Chart Skeleton
   */
  Chart: ({ className }: { className?: string }) => (
    <Card className={cn("p-6 overflow-hidden", className)}>
      <div className="mb-6 space-y-2">
        <div className="h-5 w-48 bg-muted animate-shimmer rounded" />
        <div className="h-3 w-32 bg-muted animate-shimmer rounded" />
      </div>
      <div className="h-64 bg-muted animate-shimmer rounded" />
    </Card>
  ),

  /**
   * Table Skeleton
   */
  Table: ({
    rows = 5,
    columns = 4,
    className,
  }: {
    rows?: number;
    columns?: number;
    className?: string;
  }) => (
    <Card className={cn("overflow-hidden", className)}>
      {/* Header */}
      <div
        className="grid gap-4 p-4 border-b border-border bg-muted/50"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 bg-muted animate-shimmer rounded" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid gap-4 p-4 border-b border-border last:border-0"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className="h-5 bg-muted animate-shimmer rounded"
            />
          ))}
        </div>
      ))}
    </Card>
  ),

  /**
   * Text Skeleton Lines
   */
  Text: ({
    lines = 3,
    className,
  }: {
    lines?: number;
    className?: string;
  }) => (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-4 bg-muted animate-shimmer rounded",
            i === lines - 1 ? "w-4/6" : "w-full"
          )}
        />
      ))}
    </div>
  ),
};
