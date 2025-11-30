"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { formatMillions, formatPercent } from "@/lib/utils/financial";
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
}

export function ComparisonMetricsTable({
  proposals,
  className,
}: ComparisonMetricsTableProps) {
  // Calculate baseline period for labels
  const baselinePeriod = proposals.length > 0
    ? (proposals[0].contractPeriodYears || 30)
    : 30;
  const finalYear = 2028 + baselinePeriod - 1;

  // Define metrics to compare
  const metricDefinitions: MetricDefinition[] = useMemo(
    () => [
      {
        id: "totalRent",
        label: `Total Rent (${baselinePeriod} Years)`,
        getValue: (p) => p.metrics?.totalRent ?? null,
        format: (v) => formatMillions(v),
        higherIsBetter: false, // Lower rent is better for school
        description: `Total rent paid over ${baselinePeriod} years`,
      },
      {
        id: "npv",
        label: "NPV",
        getValue: (p) => p.metrics?.npv ?? null,
        format: (v) => formatMillions(v),
        higherIsBetter: true,
        description: "Net Present Value of the deal",
      },
      {
        id: "contractNAV",
        label: "Net Annualized Value (NAV) ⭐",
        getValue: (p) => p.metrics?.contractNAV ?? null,
        format: (v) => formatMillions(v),
        higherIsBetter: true,
        description: "Annual EBITDA - Annual Rent (Key Decision Metric)",
      },
      {
        id: "contractEbitdaNPV",
        label: "EBITDA NPV",
        getValue: (p) => p.metrics?.contractEbitdaNPV ?? null,
        format: (v) => formatMillions(v),
        higherIsBetter: true,
        description: "Present Value of EBITDA over contract period",
      },
      {
        id: "contractNetTenantSurplus",
        label: "Net Tenant Surplus",
        getValue: (p) => p.metrics?.contractNetTenantSurplus ?? null,
        format: (v) => formatMillions(v),
        higherIsBetter: true,
        description: "EBITDA NPV - Rent NPV",
      },
      {
        id: "contractAnnualizedEbitda",
        label: "Annualized EBITDA",
        getValue: (p) => p.metrics?.contractAnnualizedEbitda ?? null,
        format: (v) => formatMillions(v),
        higherIsBetter: true,
        description: "Equivalent annual value of EBITDA NPV",
      },
      {
        id: "contractAnnualizedRent",
        label: "Annualized Rent",
        getValue: (p) => p.metrics?.contractAnnualizedRent ?? null,
        format: (v) => formatMillions(v),
        higherIsBetter: false,
        description: "Equivalent annual value of Rent NPV",
      },
      {
        id: "avgEbitda",
        label: "Avg EBITDA",
        getValue: (p) => p.metrics?.avgEbitda ?? p.metrics?.totalEbitda ?? null,
        format: (v) => formatMillions(v),
        higherIsBetter: true,
        description: `Average EBITDA over ${baselinePeriod} years`,
      },
      {
        id: "finalCash",
        label: "Final Cash",
        getValue: (p) => p.metrics?.finalCash ?? null,
        format: (v) => formatMillions(v),
        higherIsBetter: true,
        description: `Cash balance at end of Year ${finalYear}`,
      },
      {
        id: "maxDebt",
        label: "Peak Debt",
        getValue: (p) => p.metrics?.maxDebt ?? p.metrics?.peakDebt ?? null,
        format: (v) => formatMillions(v),
        higherIsBetter: false, // Lower debt is better
        description: "Maximum debt balance reached",
      },
      {
        id: "irr",
        label: "IRR",
        getValue: (p) => p.metrics?.irr ?? null,
        format: (v) => formatPercent(v, 2),
        higherIsBetter: true,
        description: "Internal Rate of Return",
      },
      {
        id: "paybackPeriod",
        label: "Payback Period",
        getValue: (p) => p.metrics?.paybackPeriod ?? null,
        format: (v) => `${v.toFixed(1)} years`,
        higherIsBetter: false, // Lower payback is better
        description: "Years until initial investment is recovered",
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
    <Card className={cn("overflow-hidden", className)}>
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Comparison Metrics</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Key financial metrics comparison across {proposals.length}{" "}
            proposals. Green checkmark indicates best value.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left py-3 px-4 font-semibold bg-muted/50">
                  Metric
                </th>
                {proposals.map((proposal) => (
                  <th
                    key={proposal.id}
                    className="text-center py-3 px-4 font-semibold bg-muted/50 min-w-[140px]"
                  >
                    <div className="space-y-1">
                      <div className="text-sm font-semibold">
                        {proposal.name}
                      </div>
                      <div className="text-xs font-normal text-muted-foreground">
                        {proposal.developer}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {proposal.rentModel}
                      </Badge>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metricDefinitions.map((metricDef, index) => {
                const winnerId = winners[metricDef.id];

                return (
                  <tr
                    key={metricDef.id}
                    className={cn(
                      "border-b border-border hover:bg-muted/30 transition-colors",
                      index % 2 === 0 ? "bg-background" : "bg-muted/10",
                    )}
                  >
                    <td className="py-3 px-4 font-medium">
                      <div className="flex items-center gap-2">
                        <span>{metricDef.label}</span>
                        {metricDef.description && (
                          <span
                            className="text-xs text-muted-foreground cursor-help"
                            title={metricDef.description}
                          >
                            ⓘ
                          </span>
                        )}
                      </div>
                    </td>
                    {proposals.map((proposal) => {
                      const value = metricDef.getValue(proposal);
                      const isWinner = winnerId === proposal.id;

                      return (
                        <td
                          key={proposal.id}
                          className={cn(
                            "py-3 px-4 text-center font-mono relative",
                            isWinner && "bg-green-50 dark:bg-green-950/20",
                          )}
                        >
                          <div className="flex items-center justify-center gap-2">
                            {isWinner && (
                              <div className="absolute left-2 top-1/2 -translate-y-1/2">
                                <div className="bg-green-500 rounded-full p-0.5">
                                  <Check className="h-3 w-3 text-white" />
                                </div>
                              </div>
                            )}
                            {value !== null ? (
                              <span
                                className={cn(
                                  "font-semibold",
                                  isWinner &&
                                    "text-green-700 dark:text-green-400",
                                )}
                              >
                                {metricDef.format(value)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="bg-green-500 rounded-full p-0.5">
              <Check className="h-2.5 w-2.5 text-white" />
            </div>
            <span>Best value for metric</span>
          </div>
          <span className="mx-2">•</span>
          <span>All financial amounts in Millions (M) SAR</span>
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
