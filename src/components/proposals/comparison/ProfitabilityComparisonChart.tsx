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
  // Create a mapping of proposal ID to display label
  // This ensures unique data keys while showing meaningful labels
  const proposalMeta = useMemo(() => {
    return proposals.map((p, index) => ({
      id: p.id,
      dataKey: p.id, // Use ID as the unique data key
      label: p.developer || p.name, // Display label for legend/tooltip
      index,
    }));
  }, [proposals]);

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
      const dataPoint: Record<string, number> = { year };

      proposals.forEach((proposal) => {
        const yearData = proposal.financials?.years?.find(
          (y) => y.year === year,
        );
        // Use proposal ID as the unique data key to avoid collisions
        const value =
          metric === "ebitda" ? yearData?.ebitda : yearData?.netIncome;
        dataPoint[proposal.id] = value ? value / 1_000_000 : 0;
      });

      return dataPoint;
    });
  }, [proposals, metric]);

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

  const metricLabel = metric === "ebitda" ? "EBITDA" : "Net Income";

  return (
    <div className={className} role="img" aria-label="Profitability comparison line chart showing net income or EBITDA progression over time for selected proposals">
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
              // Find the proposal meta by matching the display label
              const meta = proposalMeta.find((m) => m.label === value);
              const isWinner = meta?.id === winnerId;
              return (
                <span className={isWinner ? "font-bold" : ""}>
                  {value}
                  {isWinner && " ⭐"}
                </span>
              );
            }}
          />

          {/* Line series for each proposal */}
          {proposalMeta.map((meta) => {
            const isWinner = meta.id === winnerId;
            const color = getProposalColor(meta.index);

            return (
              <Line
                key={meta.id} // Use unique ID as React key
                type="monotone"
                dataKey={meta.dataKey} // Use ID as data key to avoid collisions
                stroke={color}
                strokeWidth={isWinner ? 3 : 2}
                dot={false}
                name={meta.label} // Display label shown in legend/tooltip
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
