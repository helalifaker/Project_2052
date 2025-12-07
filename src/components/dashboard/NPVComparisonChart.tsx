"use client";

import React, { memo, useMemo } from "react";
import { BaseBarChart } from "@/components/charts/BaseBarChart";
import {
  chartColors,
  getProposalColor,
} from "@/lib/design-tokens/chart-colors";
import { formatMillions } from "@/lib/utils/financial";
import {
  ChartLegend,
  type ChartLegendItem,
} from "@/components/charts/ChartLegend";
import { ChartInsight } from "@/components/charts/ChartInsight";

interface NPVComparisonData {
  proposalId: string;
  proposalName: string;
  developer: string;
  npv: number;
  isWinner: boolean;
}

interface NPVComparisonChartProps {
  data: NPVComparisonData[];
}

/**
 * Custom NPV Tooltip
 */
const NPVTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    dataKey: string;
    color: string;
    payload: {
      name: string;
      developer: string;
      npv: number;
      npvRaw: number;
      isWinner: boolean;
      rank: number;
    };
  }>;
}) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0].payload;
  const isPositive = data.npv > 0;

  return (
    <div
      className="rounded-xl border p-3 shadow-floating"
      style={{
        backgroundColor: "hsl(var(--color-background))",
        borderColor: "hsl(24 6% 83%)",
        minWidth: "180px",
      }}
    >
      <div className="mb-2 pb-2 border-b border-border">
        <p className="font-semibold text-sm">{data.name}</p>
        <p className="text-xs text-muted-foreground">{data.developer}</p>
      </div>
      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">NPV</span>
          <span
            className="font-semibold tabular-nums"
            style={{
              color: isPositive ? chartColors.positive : chartColors.negative,
            }}
          >
            {formatMillions(data.npvRaw)}
          </span>
        </div>
        <div
          className="text-xs py-1.5 px-2 rounded text-center font-medium mt-2"
          style={{
            backgroundColor: isPositive
              ? "hsl(var(--color-financial-positive) / 0.1)"
              : "hsl(var(--color-financial-negative) / 0.1)",
            color: isPositive ? chartColors.positive : chartColors.negative,
          }}
        >
          {isPositive ? "✓ Profitable" : "⚠ Unprofitable"}
        </div>
      </div>
    </div>
  );
};

/**
 * NPV Comparison Chart
 *
 * Horizontal bar chart comparing NPV across all proposals
 * Simplified to match dashboard design system
 * Performance: Wrapped with memo and uses useMemo for derived data
 */
function NPVComparisonChartInner({ data }: NPVComparisonChartProps) {
  // Memoize derived data to prevent recalculation on every render
  const { chartData, cellColors, legendItems, allNegative } = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        chartData: [],
        cellColors: [],
        legendItems: [],
        allNegative: false,
      };
    }

    // Sort by NPV descending, limit to top 5
    const sortedData = [...data].sort((a, b) => b.npv - a.npv).slice(0, 5);
    const allNegative = sortedData.every((d) => d.npv < 0);

    // Transform data for display (convert to millions)
    const chartData = sortedData.map((item, index) => ({
      name: item.proposalName,
      developer: item.developer,
      npv: item.npv / 1_000_000,
      npvRaw: item.npv,
      isWinner: index === 0,
      rank: index + 1,
      proposalId: item.proposalId,
    }));

    // Generate cell colors based on positive/negative NPV
    const cellColors = chartData.map((entry) =>
      entry.npv > 0 ? chartColors.positive : chartColors.negative,
    );

    // Build legend items
    const legendItems: ChartLegendItem[] = chartData.map((item, index) => ({
      id: item.proposalId,
      label: item.name,
      color: getProposalColor(index),
      value: formatMillions(item.npvRaw),
      isWinner: item.isWinner,
      isPositive: item.npv > 0,
    }));

    return { chartData, cellColors, legendItems, allNegative };
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p className="text-sm">No NPV data available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Warning if all NPVs are negative */}
      {allNegative && (
        <div className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2 mb-2 border border-destructive/20 shrink-0">
          <span className="mr-1">⚠️</span>
          All proposals show negative NPV. Consider revising assumptions.
        </div>
      )}

      {/* Chart */}
      <div className="flex-1 min-h-0">
        <BaseBarChart
          data={chartData}
          series={[
            {
              dataKey: "npv",
              name: "NPV",
              cellColors,
            },
          ]}
          xAxisKey="name"
          layout="vertical"
          yAxisFormatter={(value) =>
            typeof value === "number" ? `${value.toFixed(1)}M` : "0.0M"
          }
          tooltipContent={<NPVTooltip />}
          showLegend={false}
          height={280}
        />
      </div>

      {/* Unified Legend */}
      <ChartLegend items={legendItems} showValues compact />

      {/* Insight Message */}
      <ChartInsight message="💡 NPV discounts future cash flows. Positive = profitable investment." />
    </div>
  );
}

// Memoize component to prevent re-renders when parent state changes but data hasn't
export const NPVComparisonChart = memo(NPVComparisonChartInner);
