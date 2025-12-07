"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatMillions } from "@/lib/utils/financial";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export type ProposalSummary = {
  id: string;
  name: string;
  developer: string | null;
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
    // NAV & Annualized Metrics
    contractEbitdaNPV?: number;
    contractNetTenantSurplus?: number;
    contractAnnualizedEbitda?: number;
    contractAnnualizedRent?: number;
    contractNAV?: number;
  };
};

interface ComparisonTableProps {
  proposals: ProposalSummary[];
  deltaMode: boolean;
}

/**
 * Safely parse a metric value to a number.
 * Handles: number, string (from JSON), Decimal-like objects, null/undefined
 *
 * IMPORTANT: Metrics are stored as strings in the database JSON (e.g., "-20200000").
 * Direct comparison with > or < on strings yields incorrect results for negative numbers.
 */
function parseMetricValue(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  // Handle Decimal-like objects (from Decimal.js)
  if (typeof value === "object" && "toNumber" in value) {
    return (value as { toNumber: () => number }).toNumber();
  }
  return 0;
}

export function ComparisonTable({
  proposals,
  deltaMode,
}: ComparisonTableProps) {
  if (proposals.length === 0) return null;

  const baseline = proposals[0];

  // Detect period mismatches
  const baselinePeriod = baseline.contractPeriodYears || 30;
  const hasPeriodMismatch = proposals.some(
    (p) => (p.contractPeriodYears || 30) !== baselinePeriod,
  );

  // Helper to get values and determine winner
  const getRowData = (
    key: keyof NonNullable<ProposalSummary["metrics"]>,
    direction: "high" | "low", // high is better (NPV) or low is better (Rent)
  ) => {
    // Parse all values to ensure numeric comparison (not string comparison)
    const values = proposals.map((p) => parseMetricValue(p.metrics?.[key]));
    const bestValue =
      direction === "high" ? Math.max(...values) : Math.min(...values);

    return proposals.map((p, index) => {
      const val = parseMetricValue(p.metrics?.[key]);
      const isBaseline = index === 0;
      const isWinner = val === bestValue;

      let displayValue = "";
      let isPositive = false; // for delta coloring

      if (deltaMode && !isBaseline) {
        const baselineVal = parseMetricValue(baseline.metrics?.[key]);
        const diff = val - baselineVal;
        displayValue = (diff > 0 ? "+" : "") + formatMillions(diff);
        isPositive = diff > 0;
      } else {
        displayValue = formatMillions(val);
      }

      return {
        value: val,
        displayValue,
        isWinner,
        isPositive, // used for delta color
        isBaseline,
      };
    });
  };

  const rentData = getRowData("totalRent", "low");
  const npvData = getRowData("npv", "high");
  const ebitdaData = getRowData("totalEbitda", "high");
  const cashData = getRowData("finalCash", "high");

  const renderCell = (
    data: {
      value: number;
      displayValue: string;
      isWinner: boolean;
      isPositive: boolean;
      isBaseline: boolean;
    },
    inverseColor: boolean = false, // if true, positive delta is BAD (e.g. higher rent)
  ) => {
    if (deltaMode && !data.isBaseline) {
      // Delta Styling
      const isGood = inverseColor ? !data.isPositive : data.isPositive;
      const colorClass = isGood ? "text-emerald-400" : "text-red-400";
      return (
        <span className={cn("font-mono font-bold", colorClass)}>
          {data.displayValue}
        </span>
      );
    }

    // Normal Styling
    return (
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "font-mono",
            data.isWinner && "text-emerald-400 font-bold",
          )}
        >
          {data.displayValue}
        </span>
        {data.isWinner && !deltaMode && (
          <Check className="h-3 w-3 text-emerald-400" />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Period Mismatch Warning */}
      {hasPeriodMismatch && (
        <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
          <div className="flex items-start gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="space-y-1 flex-1">
              <p className="text-sm font-semibold text-amber-200">
                Mixed Contract Periods Detected
              </p>
              <p className="text-sm text-amber-100/80">
                You are comparing proposals with different contract periods (
                {proposals
                  .map((p) => p.contractPeriodYears || 30)
                  .filter((v, i, a) => a.indexOf(v) === i)
                  .join(" vs ")}{" "}
                years). Cumulative metrics (Total Rent, Total EBITDA, Final
                Cash) are not directly comparable across different time
                horizons. Consider comparing proposals with the same contract
                period for accurate analysis.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border bg-muted/50">
              <TableHead className="w-[200px] font-semibold">Metric</TableHead>
              {proposals.map((p, i) => (
                <TableHead
                  key={p.id}
                  className={cn(
                    "min-w-[150px]",
                    i === 0 && "text-primary font-bold",
                  )}
                >
                  <div className="flex flex-col space-y-1">
                    <span>{p.name}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {i === 0 ? "(Baseline)" : p.rentModel}
                    </span>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Total Rent (Lower is better) */}
            <TableRow className="hover:bg-muted/30 border-border">
              <TableCell className="font-medium">
                Total Rent ({baselinePeriod}Y)
              </TableCell>
              {rentData.map((d, i) => (
                <TableCell key={i}>{renderCell(d, true)}</TableCell>
              ))}
            </TableRow>

            {/* NPV (Higher is better) */}
            <TableRow className="hover:bg-muted/30 border-border">
              <TableCell className="font-medium">NPV</TableCell>
              {npvData.map((d, i) => (
                <TableCell key={i}>{renderCell(d, false)}</TableCell>
              ))}
            </TableRow>

            {/* EBITDA (Higher is better) */}
            <TableRow className="hover:bg-muted/30 border-border">
              <TableCell className="font-medium">Total EBITDA</TableCell>
              {ebitdaData.map((d, i) => (
                <TableCell key={i}>{renderCell(d, false)}</TableCell>
              ))}
            </TableRow>

            {/* Final Cash (Higher is better) */}
            <TableRow className="hover:bg-muted/30 border-border">
              <TableCell className="font-medium">Final Cash</TableCell>
              {cashData.map((d, i) => (
                <TableCell key={i}>{renderCell(d, false)}</TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
