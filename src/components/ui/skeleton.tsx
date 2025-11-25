"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Shimmer } from "@/components/ui/motion";

// Base skeleton component
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  animate?: boolean;
}

export function Skeleton({
  className,
  animate = true,
  ...props
}: SkeletonProps) {
  if (animate) {
    return <Shimmer className={cn("h-4 w-full", className)} {...props} />;
  }

  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

// Card Skeleton
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border bg-card p-6 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-4 w-40" />
    </div>
  );
}

// KPI Card Skeleton
export function KPICardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border bg-card p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-5 rounded" />
      </div>
      <Skeleton className="h-8 w-32 mb-2" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

// Table Skeleton
interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  className,
}: TableSkeletonProps) {
  return (
    <div className={cn("rounded-lg border", className)}>
      {/* Header */}
      <div className="border-b bg-muted/50 p-4">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={`header-${i}`} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className="flex gap-4 p-4 border-b last:border-b-0"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${colIndex}`}
              className={cn("h-4 flex-1", colIndex === 0 && "max-w-32")}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Chart Skeleton
interface ChartSkeletonProps {
  type?: "line" | "bar" | "pie";
  className?: string;
}

export function ChartSkeleton({
  type = "line",
  className,
}: ChartSkeletonProps) {
  // Generate random heights once using useState with lazy initializer to avoid calling Math.random during render
  const [lineHeights] = React.useState(() =>
    Array.from({ length: 8 }).map(() => 20 + Math.random() * 80),
  );
  const [barHeights] = React.useState(() =>
    Array.from({ length: 6 }).map(() => 30 + Math.random() * 70),
  );

  if (type === "pie") {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <Skeleton className="h-48 w-48 rounded-full" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-4 p-4", className)}>
      {/* Y-axis labels */}
      <div className="flex gap-4">
        <div className="w-12 space-y-8">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
        </div>
        {/* Chart area */}
        <div className="flex-1 relative h-48">
          {type === "line" ? (
            <div className="absolute inset-0 flex items-end justify-between gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={`point-${i}`}
                  className="flex-1 flex items-end justify-center"
                >
                  <Skeleton
                    className="w-full"
                    style={{
                      height: `${lineHeights[i]}%`,
                      borderRadius: "4px 4px 0 0",
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="absolute inset-0 flex items-end justify-around gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton
                  key={`bar-${i}`}
                  className="w-12"
                  style={{
                    height: `${barHeights[i]}%`,
                    borderRadius: "4px 4px 0 0",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      {/* X-axis labels */}
      <div className="flex gap-4 pl-16">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={`label-${i}`} className="h-3 flex-1" />
        ))}
      </div>
    </div>
  );
}

// Form Skeleton
interface FormSkeletonProps {
  fields?: number;
  className?: string;
}

export function FormSkeleton({ fields = 4, className }: FormSkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={`field-${i}`} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex gap-4 pt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}

// Proposal Card Skeleton
export function ProposalCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border bg-card p-6 space-y-4", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}

// Financial Table Skeleton
export function FinancialTableSkeleton({ className }: { className?: string }) {
  const years = 6;
  const rows = 8;

  return (
    <div className={cn("rounded-lg border overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-muted/50 border-b">
        <div className="flex">
          <div className="w-48 p-3 border-r">
            <Skeleton className="h-4 w-24" />
          </div>
          {Array.from({ length: years }).map((_, i) => (
            <div
              key={`year-${i}`}
              className="flex-1 p-3 text-center border-r last:border-r-0"
            >
              <Skeleton className="h-4 w-12 mx-auto" />
            </div>
          ))}
        </div>
      </div>
      {/* Body */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex border-b last:border-b-0">
          <div className="w-48 p-3 border-r bg-muted/20">
            <Skeleton className="h-4 w-32" />
          </div>
          {Array.from({ length: years }).map((_, colIndex) => (
            <div
              key={`cell-${rowIndex}-${colIndex}`}
              className="flex-1 p-3 text-right border-r last:border-r-0"
            >
              <Skeleton className="h-4 w-16 ml-auto" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// Dashboard Grid Skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <KPICardSkeleton key={`kpi-${i}`} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border bg-card">
          <div className="p-4 border-b">
            <Skeleton className="h-5 w-40" />
          </div>
          <ChartSkeleton type="line" />
        </div>
        <div className="rounded-lg border bg-card">
          <div className="p-4 border-b">
            <Skeleton className="h-5 w-40" />
          </div>
          <ChartSkeleton type="bar" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <div className="p-4 border-b flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
        <TableSkeleton rows={5} columns={5} />
      </div>
    </div>
  );
}

// Proposals List Skeleton
export function ProposalsListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <ProposalCardSkeleton key={`proposal-${i}`} />
        ))}
      </div>
    </div>
  );
}
