"use client";

import { memo, useMemo } from "react";
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

export interface FinancialLineItem {
  id: string;
  label: string;
  values: Record<string, number>; // year -> value
  formula?: Record<string, string>; // year -> formula description (GAP 21)
  isSubtotal?: boolean;
  isTotal?: boolean;
  isHeader?: boolean;
  isGrandTotal?: boolean;
  indent?: number; // 0, 1, 2, 3
  isSectionStart?: boolean;
  isSectionEnd?: boolean;
}

export interface FinancialTableProps {
  title: string;
  years: number[]; // Array of years to display
  lineItems: FinancialLineItem[];
  className?: string;
  showTooltips?: boolean;
  highlightTotals?: boolean;
}

/**
 * Simple padding-only indentation (no lines)
 * Creates visual hierarchy through whitespace
 */
function getIndentPadding(indent: number = 0): string {
  const paddings: Record<number, string> = {
    0: "pl-3",
    1: "pl-6",
    2: "pl-9",
    3: "pl-12",
  };
  return paddings[indent] ?? paddings[0];
}

/**
 * Minimalist row styles - backgrounds only on totals
 * Typography creates hierarchy, not backgrounds
 */
function getRowStyles(item: FinancialLineItem): string {
  const baseHover = "hover:bg-[var(--financial-hover-row)] transition-colors duration-100";

  // Grand totals and totals get subtle background
  if (item.isGrandTotal || item.isTotal) {
    return cn(
      "bg-[var(--financial-total-bg)]",
      "border-t border-[var(--financial-border)]"
    );
  }

  // Subtotals: top border only, no background
  if (item.isSubtotal) {
    return cn(
      "border-t border-[var(--financial-border)]",
      baseHover
    );
  }

  // Headers: top border only
  if (item.isHeader) {
    return "border-t border-[var(--financial-border)]";
  }

  // Regular rows: simple hover only (no alternating)
  return baseHover;
}

/**
 * Typography-first label styles
 * Font weight and size create hierarchy, not colors
 */
function getLabelStyles(item: FinancialLineItem): string {
  const indent = getIndentPadding(item.indent);
  const basePadding = "py-2";

  if (item.isHeader) {
    return cn(indent, basePadding, "uppercase text-[10px] font-medium tracking-wider text-muted-foreground");
  }
  if (item.isGrandTotal) {
    return cn(indent, basePadding, "font-bold text-xs");
  }
  if (item.isTotal) {
    return cn(indent, basePadding, "font-semibold text-xs");
  }
  if (item.isSubtotal) {
    return cn(indent, basePadding, "font-medium text-xs");
  }
  return cn(indent, basePadding, "text-xs");
}

/**
 * Value cell styles
 */
function getValueStyles(item: FinancialLineItem): string {
  const base = "text-right font-mono tabular-nums min-w-[70px] px-3";

  if (item.isHeader) return cn(base, "py-2");
  if (item.isGrandTotal) return cn(base, "font-bold text-xs py-2");
  if (item.isTotal) return cn(base, "font-semibold text-xs py-2");
  if (item.isSubtotal) return cn(base, "font-medium text-xs py-2");

  return cn(base, "text-xs py-2");
}

/**
 * Period indicator - subtle top border color only (no text labels)
 */
function getPeriodBorderClass(year: number, years: number[]): string {
  // First year of Historical period
  if (year === 2023 && years.includes(2023)) {
    return "border-t-2 border-t-[var(--period-historical)]";
  }
  // First year of Transition period
  if (year === 2025 && years.includes(2025)) {
    return "border-t-2 border-t-[var(--period-transition)]";
  }
  // First year of Dynamic period (2028)
  if (year === 2028 && years.includes(2028)) {
    return "border-t-2 border-t-muted-foreground/30";
  }
  return "";
}

/**
 * MINIMALIST FINANCIAL TABLE
 *
 * Design philosophy:
 * - Typography creates hierarchy (font weight/size, not backgrounds)
 * - Whitespace creates structure (padding, not decorative lines)
 * - Subtle borders define sections
 * - Red for negatives only (no green, no muted)
 * - Simple row hover (no column/intersection highlighting)
 *
 * Inspired by Bloomberg Terminal aesthetics + Apple minimalism
 */
export const FinancialTable = memo(function FinancialTable({
  title,
  years,
  lineItems,
  className,
  showTooltips = true,
  highlightTotals: _highlightTotals = true,
}: FinancialTableProps) {
  // Memoize period data
  const yearData = useMemo(() => {
    return years.map((year) => ({
      year,
      periodBorder: getPeriodBorderClass(year, years),
      isPeriodEnd: year === 2024 || year === 2027,
    }));
  }, [years]);

  return (
    <div
      className={cn(
        // Minimalist card container
        "rounded-lg border border-[var(--financial-border)]",
        "bg-[var(--financial-card-bg)]",
        "overflow-hidden",
        className
      )}
    >
      {/* Clean header with SAR M badge */}
      <div className="border-b border-[var(--financial-border)] px-4 py-2.5 flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
          SAR M
        </span>
      </div>

      {/* Table with horizontal scroll */}
      <div className="overflow-x-auto">
        <TooltipProvider>
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-[var(--financial-card-bg)]">
              <TableRow className="border-b border-[var(--financial-border)]">
                {/* Sticky Line Item Column */}
                <TableHead
                  className={cn(
                    "w-[180px] min-w-[180px] sticky left-0 z-20",
                    "bg-[var(--financial-card-bg)]",
                    "border-r border-[var(--financial-border)]",
                    "font-medium text-xs py-2.5 px-3"
                  )}
                >
                  Line Item
                </TableHead>

                {/* Year Columns - subtle period borders */}
                {yearData.map(({ year, periodBorder, isPeriodEnd }) => (
                  <TableHead
                    key={year}
                    className={cn(
                      "text-center px-3 py-2.5",
                      "font-mono font-medium text-xs",
                      "min-w-[70px]",
                      // Period end separator
                      isPeriodEnd && "border-r border-r-[var(--financial-border)]",
                      // Subtle top border for period start
                      periodBorder
                    )}
                  >
                    {year}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {lineItems.map((item) => {
                return (
                  <TableRow
                    key={item.id}
                    className={getRowStyles(item)}
                  >
                    {/* Line Item Label */}
                    <TableCell
                      className={cn(
                        "sticky left-0 z-10",
                        "bg-[var(--financial-card-bg)]",
                        "border-r border-[var(--financial-border)]",
                        getLabelStyles(item),
                        // Match total background on sticky cell
                        (item.isGrandTotal || item.isTotal) && "bg-[var(--financial-total-bg)]"
                      )}
                    >
                      {item.label}
                    </TableCell>

                    {/* Year Values */}
                    {yearData.map(({ year, isPeriodEnd }) => {
                      const value = item.values[year];
                      const formula = item.formula?.[year];
                      const hasValue = value !== undefined && value !== null;

                      // Header rows don't have values
                      if (item.isHeader) {
                        return (
                          <TableCell
                            key={`${item.id}-${year}`}
                            className={cn(
                              getValueStyles(item),
                              isPeriodEnd && "border-r border-r-[var(--financial-border)]"
                            )}
                          >
                            <span className="text-muted-foreground/50">—</span>
                          </TableCell>
                        );
                      }

                      return (
                        <TableCell
                          key={`${item.id}-${year}`}
                          className={cn(
                            getValueStyles(item),
                            isPeriodEnd && "border-r border-r-[var(--financial-border)]"
                          )}
                        >
                          {hasValue ? (
                            showTooltips && formula ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span
                                    className={cn(
                                      "cursor-help",
                                      getFinancialColorClass(value)
                                    )}
                                  >
                                    {formatMillions(value)}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs">
                                  <p className="text-xs font-mono">{formula}</p>
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <span className={getFinancialColorClass(value)}>
                                {formatMillions(value)}
                              </span>
                            )
                          ) : (
                            <span className="text-muted-foreground/50">—</span>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TooltipProvider>
      </div>
    </div>
  );
});

/**
 * Compact version for comparison views
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
