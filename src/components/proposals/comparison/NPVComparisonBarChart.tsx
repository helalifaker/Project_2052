"use client";

import React from "react";
import { BaseBarChart } from "@/components/charts/BaseBarChart";
import { chartColors } from "@/lib/design-tokens/chart-colors";
import { formatMillions } from "@/lib/utils/financial";

interface NPVComparisonData {
  proposalId: string;
  proposalName: string;
  developer: string;
  npv: number;
  isWinner: boolean;
}

interface NPVComparisonBarChartProps {
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
    payload: any;
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
      <p className="font-semibold text-sm mb-1">{data.name}</p>
      <p className="text-xs text-muted-foreground mb-2">{data.developer}</p>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between gap-4">
          <span>NPV</span>
          <span
            className="font-semibold tabular-nums"
            style={{
              color: isPositive ? chartColors.positive : chartColors.negative,
            }}
          >
            SAR {formatMillions(data.npvRaw)}
          </span>
        </div>
        <p
          className="text-xs mt-2"
          style={{
            color: isPositive ? chartColors.positive : chartColors.negative,
          }}
        >
          {isPositive ? "✓ Profitable" : "⚠ Unprofitable"}
        </p>
      </div>
      {data.isWinner && (
        <p
          className="text-xs mt-2 flex items-center gap-1 font-medium"
          style={{ color: "hsl(var(--color-copper))" }}
        >
          ⭐ Highest NPV
        </p>
      )}
    </div>
  );
};

/**
 * NPV Comparison Bar Chart
 *
 * Horizontal bar chart comparing Net Present Value (NPV) across all proposals.
 * Uses design token system with positive/negative semantic colors.
 *
 * Features:
 * - Horizontal bars sorted by NPV descending
 * - Color-coded: positive (sage green), negative (terracotta/red)
 * - Winner highlighted with star icon
 * - Insights panel showing best/worst NPV
 * - Supports 2-5 proposals
 */
export function NPVComparisonBarChart({ data }: NPVComparisonBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px] text-muted-foreground">
        No NPV data available
      </div>
    );
  }

  // Sort by NPV descending
  const sortedData = [...data].sort((a, b) => b.npv - a.npv);

  // Limit to top 5 proposals
  const limitedData = sortedData.slice(0, 5);

  // Transform data for display (convert to millions)
  const chartData = limitedData.map((item) => ({
    name: item.proposalName,
    developer: item.developer,
    npv: item.npv / 1_000_000,
    npvRaw: item.npv,
    isWinner: item.isWinner,
  }));

  // Calculate insights
  const bestNPV = limitedData[0];
  const worstNPV = limitedData[limitedData.length - 1];
  const range = bestNPV.npv - worstNPV.npv;
  const profitableCount = limitedData.filter((d) => d.npv > 0).length;
  const allNegative = limitedData.every((d) => d.npv < 0);

  // Generate cell colors based on positive/negative NPV
  const cellColors = chartData.map((entry) =>
    entry.npv > 0 ? chartColors.positive : chartColors.negative,
  );

  return (
    <div className="space-y-4">
      {/* Warning if all NPVs are negative */}
      {allNegative && (
        <div className="text-xs text-destructive bg-destructive/10 rounded-lg p-3 border border-destructive/20">
          <p className="flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <span>
              All proposals show negative NPV. Consider revising financial
              assumptions or negotiating better terms.
            </span>
          </p>
        </div>
      )}

      {/* Chart */}
      <div className="h-[350px]">
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
          xAxisFormatter={(value) =>
            typeof value === "number" ? `${value.toFixed(1)}M` : String(value)
          }
          tooltipContent={<NPVTooltip />}
          showLegend={false}
          height={350}
        />
      </div>

      {/* Insights Panel */}
      <div className="grid grid-cols-4 gap-3 pt-2">
        <div className="text-center p-3 bg-muted/20 rounded-lg border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Best NPV</p>
          <p
            className="text-sm font-semibold truncate"
            title={bestNPV.proposalName}
          >
            {bestNPV.proposalName}
          </p>
          <p
            className="text-xs mt-1 tabular-nums font-medium"
            style={{
              color:
                bestNPV.npv > 0 ? chartColors.positive : chartColors.negative,
            }}
          >
            SAR {formatMillions(bestNPV.npv)}
          </p>
        </div>
        <div className="text-center p-3 bg-muted/20 rounded-lg border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Worst NPV</p>
          <p
            className="text-sm font-semibold truncate"
            title={worstNPV.proposalName}
          >
            {worstNPV.proposalName}
          </p>
          <p
            className="text-xs mt-1 tabular-nums font-medium"
            style={{
              color:
                worstNPV.npv < 0 ? chartColors.negative : chartColors.positive,
            }}
          >
            SAR {formatMillions(worstNPV.npv)}
          </p>
        </div>
        <div className="text-center p-3 bg-muted/20 rounded-lg border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Range</p>
          <p className="text-sm font-semibold">NPV Spread</p>
          <p className="text-xs text-muted-foreground mt-1 tabular-nums">
            SAR {formatMillions(range)}
          </p>
        </div>
        <div className="text-center p-3 bg-muted/20 rounded-lg border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Profitable</p>
          <p className="text-sm font-semibold">
            {profitableCount} of {limitedData.length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {((profitableCount / limitedData.length) * 100).toFixed(0)}%
          </p>
        </div>
      </div>
    </div>
  );
}
