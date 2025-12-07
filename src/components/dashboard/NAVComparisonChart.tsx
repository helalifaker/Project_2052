"use client";

import React, { memo, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  LabelList,
} from "recharts";
import { formatMillions } from "@/lib/utils/financial";
import { Target } from "lucide-react";
import {
  chartColors,
  getProposalColor,
} from "@/lib/design-tokens/chart-colors";
import { getAxisProps, getGridProps } from "@/lib/design-tokens/chart-config";
import {
  ChartLegend,
  type ChartLegendItem,
} from "@/components/charts/ChartLegend";
import { ChartInsight } from "@/components/charts/ChartInsight";

interface NAVComparisonData {
  proposalId: string;
  proposalName: string;
  developer: string;
  nav: number;
  navPercentile: number;
  isWinner: boolean;
}

interface NAVComparisonChartProps {
  data: NAVComparisonData[];
}

/**
 * Custom Tooltip for NAV Comparison Chart
 */
interface NAVTooltipPayload {
  name: string;
  developer: string;
  nav: number;
  navRaw: number;
  rank: number;
  isWinner: boolean;
}

interface NAVTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: NAVTooltipPayload }>;
  sortedDataLength?: number;
}

function NAVCustomTooltip({
  active,
  payload,
  sortedDataLength = 0,
}: NAVTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isPositive = data.nav > 0;

    return (
      <div
        className="rounded-xl border p-3 shadow-floating"
        style={{
          backgroundColor: "hsl(var(--color-background))",
          borderColor: "hsl(24 6% 83%)",
          minWidth: "200px",
        }}
      >
        {/* Header */}
        <div className="mb-2 pb-2 border-b border-border">
          <p className="font-semibold text-sm">{data.name}</p>
          <p className="text-xs text-muted-foreground">{data.developer}</p>
        </div>

        {/* NAV Value */}
        <div className="space-y-1.5">
          <div className="flex justify-between gap-4 text-xs">
            <span className="text-muted-foreground">Net Annualized Value</span>
            <span
              className="font-semibold tabular-nums"
              style={{
                color: isPositive ? chartColors.positive : chartColors.negative,
              }}
            >
              {formatMillions(data.navRaw)}/yr
            </span>
          </div>

          <div className="flex justify-between gap-4 text-xs">
            <span className="text-muted-foreground">Rank</span>
            <span className="font-medium">
              #{data.rank} of {sortedDataLength}
            </span>
          </div>

          {/* Status indicator */}
          <div
            className="text-xs py-1.5 px-2 rounded text-center font-medium mt-2"
            style={{
              backgroundColor: isPositive
                ? "hsl(var(--color-financial-positive) / 0.1)"
                : "hsl(var(--color-financial-negative) / 0.1)",
              color: isPositive ? chartColors.positive : chartColors.negative,
            }}
          >
            {isPositive ? "✓ Value Creating" : "⚠ Value Destroying"}
          </div>
        </div>
      </div>
    );
  }
  return null;
}

/**
 * NAV Comparison Chart - Simplified & Consistent
 *
 * Net Annualized Value (NAV) = Annual EBITDA - Annual Rent
 * This is THE KEY METRIC for comparing proposals with different contract lengths
 *
 * Simplified horizontal bar chart matching the dashboard design system
 * Performance: Wrapped with memo and uses useMemo for derived data
 */
function NAVComparisonChartInner({ data }: NAVComparisonChartProps) {
  // Memoize derived data to prevent recalculation on every render
  const { sortedData, chartData, legendItems } = useMemo(() => {
    if (!data || data.length === 0) {
      return { sortedData: [], chartData: [], legendItems: [] };
    }

    // Sort by NAV descending and limit to top 6 for visual clarity
    const sortedData = [...data].sort((a, b) => b.nav - a.nav).slice(0, 6);

    // Transform data for display (convert to millions)
    const chartData = sortedData.map((item, index) => ({
      name: item.proposalName,
      developer: item.developer,
      nav: item.nav / 1_000_000,
      navRaw: item.nav,
      isWinner: index === 0, // First after sorting is winner
      rank: index + 1,
      percentile: item.navPercentile,
      proposalId: item.proposalId,
    }));

    // Build legend items
    const legendItems: ChartLegendItem[] = chartData.map((item, index) => ({
      id: item.proposalId,
      label: item.name,
      color: getProposalColor(index),
      value: formatMillions(item.navRaw),
      isWinner: item.isWinner,
      isPositive: item.nav > 0,
    }));

    return { sortedData, chartData, legendItems };
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <Target className="w-10 h-10 mb-2 opacity-20" />
        <p className="text-sm">No NAV data available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chart */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 60, left: 100, bottom: 5 }}
          >
            <CartesianGrid
              {...getGridProps({ horizontal: true, vertical: false })}
            />
            <XAxis
              {...getAxisProps("x")}
              type="number"
              tickFormatter={(value) => `${value.toFixed(0)}M`}
            />
            <YAxis
              {...getAxisProps("y")}
              type="category"
              dataKey="name"
              width={95}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              content={
                <NAVCustomTooltip sortedDataLength={sortedData.length} />
              }
              cursor={{ fill: "hsl(var(--muted) / 0.15)" }}
            />
            <ReferenceLine
              x={0}
              stroke={chartColors.axis}
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />
            <Bar dataKey="nav" radius={[0, 4, 4, 0]} barSize={24}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getProposalColor(index)}
                  opacity={entry.isWinner ? 1 : 0.85}
                />
              ))}
              <LabelList
                dataKey="nav"
                position="right"
                formatter={(value) => {
                  if (typeof value !== "number") return "";
                  return `${value.toFixed(1)}M`;
                }}
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  fill: "hsl(var(--foreground))",
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Unified Legend */}
      <ChartLegend items={legendItems} showValues compact />

      {/* Insight Message */}
      <ChartInsight message="💡 NAV = Annual value created. Higher is better; negative destroys value." />
    </div>
  );
}

// Memoize component to prevent re-renders when parent state changes but data hasn't
export const NAVComparisonChart = memo(NAVComparisonChartInner);
