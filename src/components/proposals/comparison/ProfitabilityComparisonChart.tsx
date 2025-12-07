"use client";

import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";
import type { Payload } from "recharts/types/component/DefaultTooltipContent";
import { getProposalColor } from "@/lib/design-tokens/chart-colors";
import { formatMillions } from "@/lib/utils/financial";
import {
  getAxisProps,
  getGridProps,
  getTooltipProps,
  getLegendProps,
  chartSpacing,
  chartAnimation,
} from "@/lib/design-tokens/chart-config";

interface ProposalData {
  id: string;
  name: string;
  developer?: string;
  financials?: {
    years: Array<{
      year: number;
      netIncome?: number;
      ebitda?: number;
    }>;
  };
  isWinner?: boolean;
}

interface ProfitabilityComparisonChartProps {
  proposals: ProposalData[];
  winnerId?: string;
  metric?: "netIncome" | "ebitda"; // Which metric to display
  className?: string;
}

const toNumber = (value: unknown): number => Number(value ?? 0);

/**
 * Custom Profitability Tooltip
 */
const ProfitabilityTooltip = ({
  active,
  payload,
  label,
  metric,
}: TooltipProps<number, string> & {
  payload?: Payload<number, string>[];
  label?: string | number;
  metric?: "netIncome" | "ebitda";
}) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const metricLabel = metric === "ebitda" ? "EBITDA" : "Net Income";

  return (
    <div
      className="rounded-xl border p-3 shadow-floating"
      style={{
        backgroundColor: "hsl(var(--color-background))",
        borderColor: "hsl(24 6% 83%)",
        minWidth: "220px",
      }}
    >
      <p className="font-semibold text-sm mb-2">Year {label}</p>
      <div className="space-y-1.5">
        {payload.map((entry, index) => {
          const value = toNumber(entry.value);
          return (
            <div
              key={String(entry.dataKey ?? entry.name ?? index)}
              className="flex items-center justify-between gap-4 text-xs"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-muted-foreground">{entry.name}:</span>
              </div>
              <span className="font-mono font-semibold tabular-nums">
                {formatMillions(value * 1_000_000)}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">
        {metricLabel} progression over time
      </p>
    </div>
  );
};

/**
 * Profitability Comparison Chart
 *
 * Multi-series line chart showing Net Income or EBITDA progression over time.
 * Displays how each proposal's profitability evolves across the projection period.
 *
 * Features:
 * - Multiple colored lines (one per proposal)
 * - Winner has thicker line for emphasis
 * - Toggle between Net Income and EBITDA
 * - X-axis: Years (2025-2053/2057)
 * - Y-axis: Annual value in millions
 * - Clear legend with winner indicator
 * - Interactive tooltip showing all proposals
 * - Supports 2-5 proposals
 */
export function ProfitabilityComparisonChart({
  proposals,
  winnerId,
  metric = "netIncome",
  className,
}: ProfitabilityComparisonChartProps) {
  // Transform data for Recharts
  const chartData = useMemo(() => {
    if (!proposals || proposals.length === 0) return [];

    // Get all unique years from all proposals
    const allYears = new Set<number>();
    proposals.forEach((proposal) => {
      proposal.financials?.years?.forEach((y) => allYears.add(y.year));
    });

    const sortedYears = Array.from(allYears).sort((a, b) => a - b);

    // Create data points for each year
    return sortedYears.map((year) => {
      const dataPoint: any = { year };

      proposals.forEach((proposal) => {
        const yearData = proposal.financials?.years?.find(
          (y) => y.year === year,
        );
        const proposalLabel = proposal.developer || proposal.name;
        // Convert to millions for display
        const value =
          metric === "ebitda" ? yearData?.ebitda : yearData?.netIncome;
        dataPoint[proposalLabel] = value ? value / 1_000_000 : 0;
      });

      return dataPoint;
    });
  }, [proposals, metric]);

  // Get proposal labels
  const proposalLabels = useMemo(() => {
    return proposals.map((p) => p.developer || p.name);
  }, [proposals]);

  // Handle empty state
  if (!proposals || proposals.length === 0) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center h-[400px] text-muted-foreground border-2 border-dashed rounded-lg">
          No proposals selected
        </div>
      </div>
    );
  }

  // Find winner data
  const winnerProposal = proposals.find((p) => p.id === winnerId);
  const winnerLabel = winnerProposal
    ? winnerProposal.developer || winnerProposal.name
    : null;

  const metricLabel = metric === "ebitda" ? "EBITDA" : "Net Income";

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={chartSpacing.margin}>
          {/* Grid */}
          <CartesianGrid {...getGridProps()} />

          {/* X Axis */}
          <XAxis
            {...getAxisProps("x")}
            dataKey="year"
            label={{
              value: "Year",
              position: "insideBottom",
              offset: -5,
            }}
          />

          {/* Y Axis */}
          <YAxis
            {...getAxisProps("y")}
            label={{
              value: `${metricLabel} (Millions SAR)`,
              angle: -90,
              position: "insideLeft",
            }}
            tickFormatter={(value) => `${value.toFixed(0)}M`}
          />

          {/* Tooltip */}
          <Tooltip
            content={<ProfitabilityTooltip metric={metric} />}
            {...getTooltipProps()}
          />

          {/* Legend */}
          <Legend
            {...getLegendProps()}
            formatter={(value) => {
              const isWinner = value === winnerLabel;
              return (
                <span className={isWinner ? "font-bold" : ""}>
                  {value}
                  {isWinner && " ⭐"}
                </span>
              );
            }}
          />

          {/* Line series for each proposal */}
          {proposalLabels.map((label, index) => {
            const isWinner = label === winnerLabel;
            const color = getProposalColor(index);

            return (
              <Line
                key={label}
                type="monotone"
                dataKey={label}
                stroke={color}
                strokeWidth={isWinner ? 3 : 2}
                dot={false}
                name={label}
                animationDuration={chartAnimation.duration}
                animationEasing={chartAnimation.easing}
                activeDot={{
                  r: 6,
                  strokeWidth: 2,
                }}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
