"use client";

import React from "react";
import { BaseBarChart } from "@/components/charts/BaseBarChart";
import {
  chartColors,
  getProposalColor,
} from "@/lib/design-tokens/chart-colors";
import { formatMillions } from "@/lib/utils/financial";

interface NAVComparisonData {
  proposalId: string;
  proposalName: string;
  developer: string;
  nav: number;
  isWinner: boolean;
}

interface NAVComparisonBarChartProps {
  data: NAVComparisonData[];
}

/**
 * Custom NAV Tooltip
 */
const NAVTooltip = ({
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
  const isPositive = data.nav > 0;

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
          <span>NAV</span>
          <span
            className="font-semibold tabular-nums"
            style={{
              color: isPositive ? chartColors.positive : chartColors.negative,
            }}
          >
            SAR {formatMillions(data.navRaw)}
          </span>
        </div>
        <p
          className="text-xs mt-2"
          style={{
            color: isPositive ? chartColors.positive : chartColors.negative,
          }}
        >
          {isPositive ? "✓ Positive NAV" : "⚠ Negative NAV"}
        </p>
      </div>
      {data.isWinner && (
        <p
          className="text-xs mt-2 flex items-center gap-1 font-medium"
          style={{ color: "hsl(var(--color-copper))" }}
        >
          ⭐ Highest NAV
        </p>
      )}
    </div>
  );
};

/**
 * NAV Comparison Bar Chart
 *
 * Horizontal bar chart comparing Net Annualized Value (NAV) across all proposals.
 * Uses design token system with positive/negative semantic colors.
 *
 * Features:
 * - Horizontal bars sorted by NAV descending
 * - Color-coded: positive (sage green), negative (terracotta/red)
 * - Winner highlighted with star icon
 * - Insights panel showing best/worst NAV
 * - Supports 2-5 proposals
 */
export function NAVComparisonBarChart({ data }: NAVComparisonBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px] text-muted-foreground">
        No NAV data available
      </div>
    );
  }

  // Sort by NAV descending
  const sortedData = [...data].sort((a, b) => b.nav - a.nav);

  // Limit to top 5 proposals
  const limitedData = sortedData.slice(0, 5);

  // Transform data for display (convert to millions)
  const chartData = limitedData.map((item) => ({
    name: item.proposalName,
    developer: item.developer,
    nav: item.nav / 1_000_000,
    navRaw: item.nav,
    isWinner: item.isWinner,
  }));

  // Calculate insights
  const bestNAV = limitedData[0];
  const worstNAV = limitedData[limitedData.length - 1];
  const range = bestNAV.nav - worstNAV.nav;
  const positiveCount = limitedData.filter((d) => d.nav > 0).length;
  const allNegative = limitedData.every((d) => d.nav < 0);

  // Generate cell colors based on positive/negative NAV
  const cellColors = chartData.map((entry) =>
    entry.nav > 0 ? chartColors.positive : chartColors.negative,
  );

  return (
    <div className="space-y-4">
      {/* Warning if all NAVs are negative */}
      {allNegative && (
        <div className="text-xs text-destructive bg-destructive/10 rounded-lg p-3 border border-destructive/20">
          <p className="flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <span>
              All proposals show negative NAV. Consider revising financial
              assumptions or negotiating better contract terms.
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
              dataKey: "nav",
              name: "NAV",
              cellColors,
            },
          ]}
          xAxisKey="name"
          layout="vertical"
          xAxisFormatter={(value) =>
            typeof value === "number" ? `${value.toFixed(1)}M` : String(value)
          }
          tooltipContent={<NAVTooltip />}
          showLegend={false}
          height={350}
        />
      </div>

      {/* Insights Panel */}
      <div className="grid grid-cols-4 gap-3 pt-2">
        <div className="text-center p-3 bg-muted/20 rounded-lg border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Best NAV</p>
          <p
            className="text-sm font-semibold truncate"
            title={bestNAV.proposalName}
          >
            {bestNAV.proposalName}
          </p>
          <p
            className="text-xs mt-1 tabular-nums font-medium"
            style={{
              color:
                bestNAV.nav > 0 ? chartColors.positive : chartColors.negative,
            }}
          >
            SAR {formatMillions(bestNAV.nav)}
          </p>
        </div>
        <div className="text-center p-3 bg-muted/20 rounded-lg border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Worst NAV</p>
          <p
            className="text-sm font-semibold truncate"
            title={worstNAV.proposalName}
          >
            {worstNAV.proposalName}
          </p>
          <p
            className="text-xs mt-1 tabular-nums font-medium"
            style={{
              color:
                worstNAV.nav < 0 ? chartColors.negative : chartColors.positive,
            }}
          >
            SAR {formatMillions(worstNAV.nav)}
          </p>
        </div>
        <div className="text-center p-3 bg-muted/20 rounded-lg border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Range</p>
          <p className="text-sm font-semibold">NAV Spread</p>
          <p className="text-xs text-muted-foreground mt-1 tabular-nums">
            SAR {formatMillions(range)}
          </p>
        </div>
        <div className="text-center p-3 bg-muted/20 rounded-lg border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Positive NAVs</p>
          <p className="text-sm font-semibold">
            {positiveCount} of {limitedData.length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {((positiveCount / limitedData.length) * 100).toFixed(0)}%
          </p>
        </div>
      </div>
    </div>
  );
}
