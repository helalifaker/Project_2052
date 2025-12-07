"use client";

import React from "react";
import { BaseBarChart } from "@/components/charts/BaseBarChart";
import { getProposalColor } from "@/lib/design-tokens/chart-colors";
import { formatMillions } from "@/lib/utils/financial";

interface EBITDAComparisonData {
  proposalId: string;
  proposalName: string;
  developer: string;
  avgEbitda: number;
  isWinner: boolean;
}

interface EBITDAComparisonChartProps {
  data: EBITDAComparisonData[];
}

/**
 * Custom EBITDA Tooltip
 */
const EBITDATooltip = ({
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

  return (
    <div
      className="rounded-xl border p-3 shadow-floating"
      style={{
        backgroundColor: "hsl(var(--color-background))",
        borderColor: "hsl(24 6% 83%)",
        minWidth: "200px",
      }}
    >
      <p className="font-semibold text-sm mb-1">{data.name}</p>
      <p className="text-xs text-muted-foreground mb-2">{data.developer}</p>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between gap-4">
          <span>Avg EBITDA</span>
          <span className="font-semibold tabular-nums">
            SAR {formatMillions(data.ebitdaRaw)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          30-year average operating performance
        </p>
      </div>
      {data.isWinner && (
        <p
          className="text-xs mt-2 flex items-center gap-1 font-medium"
          style={{ color: "hsl(var(--color-copper))" }}
        >
          ⭐ Best Performance
        </p>
      )}
    </div>
  );
};

/**
 * EBITDA Comparison Chart
 *
 * Vertical bar chart comparing Average EBITDA across all proposals.
 * Each proposal has a unique color from the proposal color palette.
 *
 * Features:
 * - Vertical bars with distinct colors per proposal
 * - Winner highlighted with star indicator
 * - Value labels on bars
 * - Insights panel showing best/worst EBITDA
 * - Supports 2-5 proposals
 */
export function EBITDAComparisonChart({ data }: EBITDAComparisonChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px] text-muted-foreground">
        No EBITDA data available
      </div>
    );
  }

  // Sort by EBITDA descending
  const sortedData = [...data].sort((a, b) => b.avgEbitda - a.avgEbitda);

  // Limit to top 5 proposals
  const limitedData = sortedData.slice(0, 5);

  // Transform data for display (convert to millions)
  const chartData = limitedData.map((item, index) => ({
    name: item.proposalName,
    developer: item.developer,
    ebitda: item.avgEbitda / 1_000_000,
    ebitdaRaw: item.avgEbitda,
    isWinner: item.isWinner,
    color: getProposalColor(index),
  }));

  // Calculate insights
  const bestEBITDA = limitedData[0];
  const worstEBITDA = limitedData[limitedData.length - 1];
  const range = bestEBITDA.avgEbitda - worstEBITDA.avgEbitda;
  const avgEBITDA =
    limitedData.reduce((sum, d) => sum + d.avgEbitda, 0) / limitedData.length;

  // Generate cell colors - each proposal gets its own color
  const cellColors = chartData.map((entry) => entry.color);

  return (
    <div className="space-y-4">
      {/* Chart */}
      <div className="h-[350px]">
        <BaseBarChart
          data={chartData}
          series={[
            {
              dataKey: "ebitda",
              name: "Avg EBITDA",
              cellColors,
            },
          ]}
          xAxisKey="name"
          layout="horizontal"
          yAxisFormatter={(value) =>
            typeof value === "number" ? `${value.toFixed(1)}M` : "0.0M"
          }
          tooltipContent={<EBITDATooltip />}
          showLegend={false}
          height={350}
        />
      </div>

      {/* Insights Panel */}
      <div className="grid grid-cols-4 gap-3 pt-2">
        <div className="text-center p-3 bg-muted/20 rounded-lg border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Best EBITDA</p>
          <p
            className="text-sm font-semibold truncate"
            title={bestEBITDA.proposalName}
          >
            {bestEBITDA.proposalName}
          </p>
          <p className="text-xs mt-1 tabular-nums font-medium text-foreground">
            SAR {formatMillions(bestEBITDA.avgEbitda)}
          </p>
        </div>
        <div className="text-center p-3 bg-muted/20 rounded-lg border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Worst EBITDA</p>
          <p
            className="text-sm font-semibold truncate"
            title={worstEBITDA.proposalName}
          >
            {worstEBITDA.proposalName}
          </p>
          <p className="text-xs mt-1 tabular-nums font-medium text-foreground">
            SAR {formatMillions(worstEBITDA.avgEbitda)}
          </p>
        </div>
        <div className="text-center p-3 bg-muted/20 rounded-lg border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Range</p>
          <p className="text-sm font-semibold">Performance Spread</p>
          <p className="text-xs text-muted-foreground mt-1 tabular-nums">
            SAR {formatMillions(range)}
          </p>
        </div>
        <div className="text-center p-3 bg-muted/20 rounded-lg border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Average</p>
          <p className="text-sm font-semibold">All Proposals</p>
          <p className="text-xs text-muted-foreground mt-1 tabular-nums">
            SAR {formatMillions(avgEBITDA)}
          </p>
        </div>
      </div>
    </div>
  );
}
