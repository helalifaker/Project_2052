"use client";

import { memo } from "react";
import { formatMillions, getFinancialColorClass } from "@/lib/utils/financial";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

export interface FinancialLineItem {
  id: string;
  label: string;
  values: Record<string, number>; // year -> value
  formula?: Record<string, string>; // year -> formula description (GAP 21)
  isSubtotal?: boolean;
  isTotal?: boolean;
  isHeader?: boolean;
  indent?: number; // 0, 1, 2, etc.
}

export interface FinancialTableProps {
  title: string;
  years: number[]; // Array of years to display
  lineItems: FinancialLineItem[];
  className?: string;
  showTooltips?: boolean; // GAP 21: Formula tooltips
  highlightTotals?: boolean;
}

/**
 * PERFORMANCE OPTIMIZATION: Memoized FinancialTable Component
 *
 * This component is expensive to render due to:
 * - Large number of cells (30 years × 20+ line items = 600+ cells)
 * - Tooltip providers for each cell
 * - Financial value formatting
 *
 * React.memo() prevents re-renders when props haven't changed.
 * This is critical for parent components that re-render frequently.
 */
export const FinancialTable = memo(function FinancialTable({
  title,
  years,
  lineItems,
  className,
  showTooltips = true,
  highlightTotals = true,
}: FinancialTableProps) {
  return (
    <div className={cn("rounded-lg border bg-card", className)}>
      {/* Table Header */}
      <div className="border-b bg-muted/50 px-6 py-4">
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px] sticky left-0 bg-background">
                Line Item
              </TableHead>
              {years.map((year) => (
                <TableHead key={year} className="text-right font-mono">
                  {year}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {lineItems.map((item) => {
              const isSpecial =
                item.isSubtotal || item.isTotal || item.isHeader;
              const indentClass = item.indent
                ? `pl-${Math.min(item.indent * 4, 12)}`
                : "";

              return (
                <TableRow
                  key={item.id}
                  className={cn(
                    isSpecial && "bg-muted/30",
                    item.isTotal && highlightTotals && "font-bold bg-primary/5",
                  )}
                >
                  {/* Line Item Label */}
                  <TableCell
                    className={cn(
                      "sticky left-0 bg-background",
                      indentClass,
                      item.isSubtotal && "font-semibold",
                      item.isTotal && "font-bold",
                    )}
                  >
                    {item.label}
                  </TableCell>

                  {/* Year Values */}
                  {years.map((year) => {
                    const value = item.values[year];
                    const formula = item.formula?.[year];
                    const hasValue = value !== undefined && value !== null;

                    return (
                      <TableCell
                        key={`${item.id}-${year}`}
                        className={cn(
                          "text-right font-mono tabular-nums",
                          item.isSubtotal && "font-semibold",
                          item.isTotal && "font-bold",
                        )}
                      >
                        {hasValue ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center justify-end gap-1">
                                  <span
                                    className={cn(
                                      getFinancialColorClass(value),
                                    )}
                                  >
                                    {formatMillions(value)}
                                  </span>
                                  {showTooltips && formula && (
                                    <Info className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                  )}
                                </div>
                              </TooltipTrigger>
                              {showTooltips && formula && (
                                <TooltipContent side="top" className="max-w-xs">
                                  <p className="text-xs font-mono">{formula}</p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
});

/**
 * Compact version for comparison views
 * PERFORMANCE OPTIMIZATION: Also memoized
 */
export const FinancialTableCompact = memo(function FinancialTableCompact({
  title,
  years,
  lineItems,
  className,
}: Omit<FinancialTableProps, "showTooltips" | "highlightTotals">) {
  return (
    <FinancialTable
      title={title}
      years={years}
      lineItems={lineItems}
      className={className}
      showTooltips={false}
      highlightTotals={false}
    />
  );
});
