"use client";

import React, { memo } from "react";
import { formatMillions } from "@/lib/utils/financial";
import { BaseBarChart } from "@/components/charts/BaseBarChart";
import {
  chartColorMappings,
  chartColors,
} from "@/lib/design-tokens/chart-colors";

interface AverageCostData {
  proposalId: string;
  proposalName: string;
  developer: string;
  contractPeriodYears: number;
  avgAnnualRent: number;
  avgAnnualStaff: number;
  avgAnnualOther: number;
  totalAvgAnnual: number;
  isWinner: boolean;
}

interface AverageAnnualCostChartProps {
  data: AverageCostData[];
}

interface ChartDataPoint {
  name: string;
  developer: string;
  contractYears: number;
  rent: number;
  staff: number;
  other: number;
  total: number;
  isWinner: boolean;
}

// Custom tooltip component - defined outside render to prevent recreation
const CustomCostTooltip = memo(function CustomCostTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartDataPoint }>;
}) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
        <p className="font-semibold text-sm mb-2">{data.name}</p>
        <p className="text-xs text-muted-foreground mb-2">
          {data.developer} - {data.contractYears}Y Contract
        </p>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between gap-4">
            <span className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: chartColorMappings.costBreakdown.rent,
                }}
              />
              Rent
            </span>
            <span className="font-medium tabular-nums">
              {formatMillions(data.rent * 1_000_000)}/yr
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: chartColorMappings.costBreakdown.staff,
                }}
              />
              Staff
            </span>
            <span className="font-medium tabular-nums">
              {formatMillions(data.staff * 1_000_000)}/yr
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: chartColorMappings.costBreakdown.otherOpex,
                }}
              />
              Other OpEx
            </span>
            <span className="font-medium tabular-nums">
              {formatMillions(data.other * 1_000_000)}/yr
            </span>
          </div>
          <div className="border-t border-border pt-1 mt-1 flex justify-between gap-4">
            <span className="font-semibold">Total</span>
            <span className="font-semibold tabular-nums">
              {formatMillions(data.total * 1_000_000)}/yr
            </span>
          </div>
        </div>
        {data.isWinner && (
          <p
            className="text-xs mt-2 flex items-center gap-1"
            style={{ color: chartColors.positive }}
          >
            Lowest Cost
          </p>
        )}
      </div>
    );
  }
  return null;
});

/**
 * Average Annual Cost Chart
 *
 * Stacked bar chart showing fair cost comparison across proposals
 * Accounts for different contract periods (25Y vs 30Y)
 */
export const AverageAnnualCostChart = memo(function AverageAnnualCostChart({
  data,
}: AverageAnnualCostChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        No cost data available
      </div>
    );
  }

  // Limit to top 5 proposals by lowest total cost
  const limitedData = [...data]
    .sort((a, b) => a.totalAvgAnnual - b.totalAvgAnnual)
    .slice(0, 5);

  // Transform data for Recharts (convert to millions)
  const chartData = limitedData.map((item) => ({
    name: item.proposalName,
    developer: item.developer,
    contractYears: item.contractPeriodYears,
    rent: item.avgAnnualRent / 1_000_000,
    staff: item.avgAnnualStaff / 1_000_000,
    other: item.avgAnnualOther / 1_000_000,
    total: item.totalAvgAnnual / 1_000_000,
    isWinner: item.isWinner,
  }));

  // Find winner and summary stats
  const winner = limitedData.find((d) => d.isWinner);
  const avgTotal =
    limitedData.reduce((sum, d) => sum + d.totalAvgAnnual, 0) /
    limitedData.length;

  return (
    <div className="space-y-4">
      {/* Explanatory Note */}
      <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3 border border-border/50">
        <p className="flex items-center gap-2">
          <span className="text-base">Info:</span>
          <span>
            Costs averaged over contract period for fair comparison between
            different contract lengths (25Y vs 30Y)
          </span>
        </p>
      </div>

      {/* Chart */}
      <div className="h-[400px]">
        <BaseBarChart
          data={chartData}
          series={[
            {
              dataKey: "rent",
              name: "Rent",
              color: chartColorMappings.costBreakdown.rent,
              stackId: "a",
            },
            {
              dataKey: "staff",
              name: "Staff Costs",
              color: chartColorMappings.costBreakdown.staff,
              stackId: "a",
            },
            {
              dataKey: "other",
              name: "Other OpEx",
              color: chartColorMappings.costBreakdown.otherOpex,
              stackId: "a",
              cellColors: chartData.map((entry) =>
                entry.isWinner
                  ? chartColorMappings.costBreakdown.otherOpex
                  : `${chartColorMappings.costBreakdown.otherOpex}dd`,
              ),
            },
          ]}
          xAxisKey="name"
          yAxisFormatter={(value) => `${value}M`}
          tooltipContent={<CustomCostTooltip />}
          height={400}
          showLegend
        />
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-3 gap-4 pt-2">
        <div className="text-center p-3 bg-muted/20 rounded-lg border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Lowest Cost</p>
          <p className="text-sm font-semibold">
            {winner?.proposalName || "N/A"}
          </p>
          <p className="text-xs text-muted-foreground mt-1 tabular-nums">
            {winner ? formatMillions(winner.totalAvgAnnual) + "/yr" : "-"}
          </p>
        </div>
        <div className="text-center p-3 bg-muted/20 rounded-lg border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Average</p>
          <p className="text-sm font-semibold">All Proposals</p>
          <p className="text-xs text-muted-foreground mt-1 tabular-nums">
            {formatMillions(avgTotal)}/yr
          </p>
        </div>
        <div className="text-center p-3 bg-muted/20 rounded-lg border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Comparing</p>
          <p className="text-sm font-semibold">
            {limitedData.length} Proposals
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {data.length > 5 && `(Top 5 of ${data.length})`}
          </p>
        </div>
      </div>
    </div>
  );
});
