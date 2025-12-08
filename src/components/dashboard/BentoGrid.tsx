import { cn } from "@/lib/utils";
import React from "react";

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

interface BentoItemProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12; // 12-column grid
  rowSpan?: 1 | 2 | 3 | 4;
}

/**
 * Bento Grid Container
 * Uses a 12-column grid for maximum flexibility on large screens.
 * Falls back to 1 column on mobile, 2 on tablet.
 *
 * Spacing System:
 * - dense: 16px gap (gap-4) - for tightly related cards
 * - normal: 24px gap (gap-6) - default card grouping
 */
export function BentoGrid({
  children,
  className,
  dense = false,
}: BentoGridProps & { dense?: boolean }) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 auto-rows-[minmax(180px,auto)]",
        dense ? "gap-4" : "gap-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Bento Grid Item
 * Wraps content in a grid cell with configurable spans.
 */
export function BentoItem({
  children,
  className,
  colSpan = 3,
  rowSpan = 1,
}: BentoItemProps) {
  // Map colSpan to Tailwind classes
  const colSpanClasses = {
    1: "lg:col-span-1",
    2: "lg:col-span-2",
    3: "lg:col-span-3",
    4: "lg:col-span-4",
    5: "lg:col-span-5",
    6: "lg:col-span-6",
    7: "lg:col-span-7",
    8: "lg:col-span-8",
    9: "lg:col-span-9",
    10: "lg:col-span-10",
    11: "lg:col-span-11",
    12: "lg:col-span-12",
  };

  const rowSpanClasses = {
    1: "lg:row-span-1",
    2: "lg:row-span-2",
    3: "lg:row-span-3",
    4: "lg:row-span-4",
  };

  return (
    <div
      className={cn(
        colSpanClasses[colSpan],
        rowSpanClasses[rowSpan],
        "flex flex-col",
        className,
      )}
    >
      {children}
    </div>
  );
}
