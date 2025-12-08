"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Fragment } from "react";
import { formatMillions } from "@/lib/utils/financial";
import { cn } from "@/lib/utils";

/**
 * Comparison Metrics Table
 *
 * Track 4B: Proposal Comparison - Metrics Matrix
 *
 * Features:
 * - Comparison matrix table with key metrics
 * - Winner highlighting (green checkmark for best metric)
 * - Metrics: Total Rent, NPV, EBITDA, Cash, Debt, IRR, Payback
 * - Color coding for positive/negative values
 * - Responsive table layout
 */

export interface ProposalMetrics {
  id: string;
  name: string;
  developer?: string;
  rentModel: string;
  contractPeriodYears?: number; // 25 or 30
  metrics?: {
    totalRent?: number;
    npv?: number;
    totalEbitda?: number;
    avgEbitda?: number;
    finalCash?: number;
    maxDebt?: number;
    peakDebt?: number;
    irr?: number;
    paybackPeriod?: number;
    // NAV & Annualized Metrics
    contractEbitdaNPV?: number;
    contractNetTenantSurplus?: number;
    contractAnnualizedEbitda?: number;
    contractAnnualizedRent?: number;
    contractNAV?: number;
  };
}

interface ComparisonMetricsTableProps {
  proposals: ProposalMetrics[];
  className?: string;
}

interface MetricDefinition {
  id: string;
  label: string;
  getValue: (p: ProposalMetrics) => number | null;
  format: (value: number) => string;
  higherIsBetter: boolean;
  description?: string;
  group: "decision" | "cash" | "rent" | "profitability";
}

// Group labels for section headers
const GROUP_LABELS: Record<MetricDefinition["group"], string> = {
  decision: "Decision Metrics",
  cash: "Cash Position",
  rent: "Rent Analysis",
  profitability: "Profitability",
};

// Group accent colors for visual hierarchy
const GROUP_ACCENTS: Record<MetricDefinition["group"], string> = {
  decision: "border-l-emerald-500",
  cash: "border-l-blue-500",
  rent: "border-l-amber-500",
  profitability: "border-l-violet-500",
};

/**
 * Safely parse a metric value to a number.
 * Handles: number, string (from JSON), Decimal-like objects, null/undefined
 *
 * IMPORTANT: Metrics are stored as strings in the database JSON (e.g., "-20200000").
 * Direct comparison with > or < on strings yields incorrect results for negative numbers.
 */
function parseMetricValue(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  }
  // Handle Decimal-like objects (from Decimal.js)
  if (typeof value === "object" && "toNumber" in value) {
    return (value as { toNumber: () => number }).toNumber();
  }
  return null;
}

export function ComparisonMetricsTable({
  proposals,
  className,
}: ComparisonMetricsTableProps) {
  // Calculate baseline period for labels
  const baselinePeriod =
    proposals.length > 0 ? proposals[0].contractPeriodYears || 30 : 30;
  const finalYear = 2028 + baselinePeriod - 1;

  // Define metrics to compare - grouped logically
  const metricDefinitions: MetricDefinition[] = useMemo(
    () => [
      // === PRIMARY DECISION METRICS ===
      {
        id: "contractNAV",
        label: "Net Annualized Value (NAV) ⭐",
        getValue: (p) => parseMetricValue(p.metrics?.contractNAV),
        format: (v) => formatMillions(v),
        higherIsBetter: true,
        description: "Annual EBITDA - Annual Rent (Key Decision Metric)",
        group: "decision",
      },
      {
        id: "npv",
        label: "NPV",
        getValue: (p) => parseMetricValue(p.metrics?.npv),
        format: (v) => formatMillions(v),
        higherIsBetter: true,
        description: "Net Present Value of the deal",
        group: "decision",
      },
      {
        id: "contractEbitdaNPV",
        label: "EBITDA NPV",
        getValue: (p) => parseMetricValue(p.metrics?.contractEbitdaNPV),
        format: (v) => formatMillions(v),
        higherIsBetter: true,
        description: "Present Value of EBITDA over contract period",
        group: "decision",
      },
      // === CASH POSITION ===
      {
        id: "finalCash",
        label: "Final Cash",
        getValue: (p) => parseMetricValue(p.metrics?.finalCash),
        format: (v) => formatMillions(v),
        higherIsBetter: true,
        description: `Cash balance at end of Year ${finalYear}`,
        group: "cash",
      },
      {
        id: "maxDebt",
        label: "Peak Debt",
        getValue: (p) =>
          parseMetricValue(p.metrics?.maxDebt) ??
          parseMetricValue(p.metrics?.peakDebt),
        format: (v) => formatMillions(v),
        higherIsBetter: false,
        description: "Maximum debt balance reached",
        group: "cash",
      },
      // === RENT ANALYSIS ===
      {
        id: "totalRent",
        label: `Total Rent (${baselinePeriod} Years)`,
        getValue: (p) => parseMetricValue(p.metrics?.totalRent),
        format: (v) => formatMillions(v),
        higherIsBetter: false,
        description: `Total rent paid over ${baselinePeriod} years`,
        group: "rent",
      },
      {
        id: "contractAnnualizedRent",
        label: "Annualized Rent",
        getValue: (p) => parseMetricValue(p.metrics?.contractAnnualizedRent),
        format: (v) => formatMillions(v),
        higherIsBetter: false,
        description: "Equivalent annual value of Rent NPV",
        group: "rent",
      },
      // === PROFITABILITY ===
      {
        id: "avgEbitda",
        label: "Avg EBITDA",
        getValue: (p) => {
          // Try to get avgEbitda directly from metrics
          const avgEbitda = parseMetricValue(p.metrics?.avgEbitda);
          if (avgEbitda !== null) return avgEbitda;

          // Fallback: compute from totalEbitda if avgEbitda is missing (legacy proposals)
          const totalEbitda = parseMetricValue(p.metrics?.totalEbitda);
          if (totalEbitda !== null) {
            // Period count = contractPeriodYears + 5 (2 historical + 3 transition years)
            const periodCount = (p.contractPeriodYears || 30) + 5;
            return totalEbitda / periodCount;
          }
          return null;
        },
        format: (v) => formatMillions(v),
        higherIsBetter: true,
        description: `Average EBITDA over ${baselinePeriod} years`,
        group: "profitability",
      },
      {
        id: "contractAnnualizedEbitda",
        label: "Annualized EBITDA",
        getValue: (p) => parseMetricValue(p.metrics?.contractAnnualizedEbitda),
        format: (v) => formatMillions(v),
        higherIsBetter: true,
        description: "Equivalent annual value of EBITDA NPV",
        group: "profitability",
      },
      {
        id: "contractNetTenantSurplus",
        label: "Net Tenant Surplus",
        getValue: (p) => parseMetricValue(p.metrics?.contractNetTenantSurplus),
        format: (v) => formatMillions(v),
        higherIsBetter: true,
        description: "EBITDA NPV - Rent NPV",
        group: "profitability",
      },
    ],
    [baselinePeriod, finalYear],
  );

  // Calculate winners for each metric
  const winners = useMemo(() => {
    const winnerMap: Record<string, string | null> = {};

    metricDefinitions.forEach((metricDef) => {
      let bestValue: number | null = null;
      let bestProposalId: string | null = null;

      proposals.forEach((proposal) => {
        const value = metricDef.getValue(proposal);
        if (value === null) return;

        const isBetter =
          bestValue === null ||
          (metricDef.higherIsBetter ? value > bestValue : value < bestValue);

        if (isBetter) {
          bestValue = value;
          bestProposalId = proposal.id;
        }
      });

      winnerMap[metricDef.id] = bestProposalId;
    });

    return winnerMap;
  }, [proposals, metricDefinitions]);

  // Handle empty state
  if (!proposals || proposals.length === 0) {
    return (
      <Card className={cn("p-6", className)}>
        <h3 className="text-lg font-semibold mb-4">Comparison Metrics</h3>
        <div className="h-40 flex items-center justify-center border-2 border-dashed rounded-md text-muted-foreground">
          No proposals selected
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden border-0 shadow-sm", className)}>
      <div className="p-6 pb-4">
        <h3 className="text-lg font-semibold tracking-tight">
          Comparison Metrics
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Key financial metrics across {proposals.length} proposals
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-y border-border/50 bg-muted/30">
              <th className="text-left py-4 px-6 text-xs font-medium uppercase tracking-wider text-muted-foreground w-[200px]">
                Metric
              </th>
              {proposals.map((proposal, index) => (
                <th
                  key={proposal.id}
                  className={cn(
                    "text-center py-4 px-4 min-w-[160px]",
                    index === 0 && "bg-emerald-500/5",
                  )}
                >
                  <div className="space-y-0.5">
                    <div className="text-sm font-semibold text-foreground">
                      {proposal.name}
                    </div>
                    {proposal.developer && (
                      <div className="text-xs text-muted-foreground">
                        {proposal.developer}
                      </div>
                    )}
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mt-1">
                      {proposal.rentModel?.replace("_", " ")}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metricDefinitions.map((metricDef, index) => {
              const winnerId = winners[metricDef.id];
              const prevGroup =
                index > 0 ? metricDefinitions[index - 1].group : null;
              const isNewGroup = metricDef.group !== prevGroup;

              return (
                <Fragment key={metricDef.id}>
                  {/* Group Header Row - Subtle divider with accent */}
                  {isNewGroup && (
                    <tr>
                      <td
                        colSpan={proposals.length + 1}
                        className={cn(
                          "py-3 px-6 text-[11px] font-semibold uppercase tracking-widest",
                          "text-muted-foreground/80 bg-muted/20",
                          "border-l-2",
                          GROUP_ACCENTS[metricDef.group],
                          index > 0 && "border-t border-border/30",
                        )}
                      >
                        {GROUP_LABELS[metricDef.group]}
                      </td>
                    </tr>
                  )}
                  {/* Metric Row - Clean and spacious */}
                  <tr
                    className={cn(
                      "group transition-colors",
                      "hover:bg-muted/40",
                      index % 2 === 0 ? "bg-transparent" : "bg-muted/10",
                    )}
                  >
                    <td
                      className={cn(
                        "py-3.5 px-6 text-sm",
                        "border-l-2",
                        GROUP_ACCENTS[metricDef.group],
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground/90">
                          {metricDef.label}
                        </span>
                        {metricDef.description && (
                          <span
                            className="text-muted-foreground/50 cursor-help hover:text-muted-foreground transition-colors"
                            title={metricDef.description}
                          >
                            ⓘ
                          </span>
                        )}
                      </div>
                    </td>
                    {proposals.map((proposal, colIndex) => {
                      const value = metricDef.getValue(proposal);
                      const isWinner = winnerId === proposal.id;
                      const isNegative = value !== null && value < 0;

                      return (
                        <td
                          key={proposal.id}
                          className={cn(
                            "py-3.5 px-4 text-center relative",
                            colIndex === 0 && "bg-emerald-500/[0.03]",
                          )}
                        >
                          <div className="flex items-center justify-center gap-2">
                            {value !== null ? (
                              <span
                                className={cn(
                                  "tabular-nums text-sm",
                                  isWinner
                                    ? "font-semibold text-emerald-600 dark:text-emerald-400"
                                    : isNegative
                                      ? "text-muted-foreground"
                                      : "text-foreground/80",
                                )}
                              >
                                {metricDef.format(value)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground/40 text-sm">
                                —
                              </span>
                            )}
                            {isWinner && (
                              <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend - Clean footer */}
      <div className="px-6 py-4 border-t border-border/30 bg-muted/10">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              <span>Best value</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-emerald-500/10 rounded-sm border border-emerald-500/20" />
              <span>Baseline proposal</span>
            </div>
          </div>
          <span className="text-muted-foreground/60">
            Values in Millions (M) SAR
          </span>
        </div>
      </div>
    </Card>
  );
}

/**
 * Example usage:
 *
 * <ComparisonMetricsTable
 *   proposals={[
 *     {
 *       id: "1",
 *       name: "Proposal A",
 *       developer: "Developer A",
 *       rentModel: "Fixed",
 *       metrics: {
 *         totalRent: 150000000,
 *         npv: 50000000,
 *         avgEbitda: 15000000,
 *         finalCash: 25000000,
 *         maxDebt: 30000000,
 *         irr: 0.12,
 *         paybackPeriod: 8.5
 *       }
 *     },
 *     // ... more proposals
 *   ]}
 * />
 */
