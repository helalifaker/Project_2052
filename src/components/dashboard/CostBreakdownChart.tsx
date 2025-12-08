"use client";

import { memo, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { BaseBarChart } from "@/components/charts/BaseBarChart";
import { chartColorMappings } from "@/lib/design-tokens/chart-colors";
import { formatMillions } from "@/lib/utils/financial";

interface CostBreakdownData {
  proposalId: string;
  proposalName: string;
  developer: string;
  rent: string;
  staff: string;
  otherOpexPercent: string;
}

interface CostBreakdownChartProps {
  data: CostBreakdownData[];
}

type CostBreakdownDatum = {
  name: string;
  developer: string;
  Rent: number;
  Staff: number;
  "Other OpEx": number;
};

/**
 * Chart 2: Cost Breakdown
 *
 * Stacked bar chart showing breakdown of costs:
 * - Rent (Copper)
 * - Staff Costs (Sage)
 * - Other OpEx (Blue-gray)
 *
 * PERFORMANCE OPTIMIZATION:
 * - React.memo() to prevent re-renders
 * - useMemo() for expensive chart data transformation
 * - Uses BaseBarChart with design tokens for consistency
 */
export const CostBreakdownChart = memo(function CostBreakdownChart({
  data,
}: CostBreakdownChartProps) {
  // PERFORMANCE: Memoize chart data transformation
  const chartData = useMemo<CostBreakdownDatum[]>(() => {
    if (!data || data.length === 0) return [];

    return data.map((proposal) => ({
      name: proposal.proposalName,
      developer: proposal.developer,
      Rent: parseFloat(proposal.rent) / 1_000_000,
      Staff: parseFloat(proposal.staff) / 1_000_000,
      "Other OpEx": parseFloat(proposal.otherOpexPercent) / 1_000_000,
    }));
  }, [data]);

  // PERFORMANCE: Memoize summary statistics
  const summaryStats = useMemo(() => {
    if (chartData.length === 0) return { rent: 0, staff: 0, otherOpex: 0 };

    return {
      rent: chartData.reduce((sum, d) => sum + d.Rent, 0) * 1_000_000,
      staff: chartData.reduce((sum, d) => sum + d.Staff, 0) * 1_000_000,
      otherOpex:
        chartData.reduce((sum, d) => sum + d["Other OpEx"], 0) * 1_000_000,
    };
  }, [chartData]);

  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Cost Breakdown by Proposal
        </h3>
        <div className="h-[400px] flex items-center justify-center text-muted-foreground">
          <p>No cost data available</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex-1 min-h-[300px]">
        <BaseBarChart
          data={chartData}
          series={[
            {
              dataKey: "Rent",
              name: "Rent",
              color: chartColorMappings.costBreakdown.rent,
              stackId: "a",
            },
            {
              dataKey: "Staff",
              name: "Staff",
              color: chartColorMappings.costBreakdown.staff,
              stackId: "a",
            },
            {
              dataKey: "Other OpEx",
              name: "Other OpEx",
              color: chartColorMappings.costBreakdown.otherOpex,
              stackId: "a",
            },
          ]}
          xAxisKey="name"
          yAxisFormatter={(value) => `${Number(value).toFixed(0)}M`}
          tooltipFormat="millions"
          showLegend={true}
          showGrid={true}
          height={300}
        />
      </div>

      {/* Summary Statistics with design token colors */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border shrink-0">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: chartColorMappings.costBreakdown.rent }}
            />
            <span className="text-sm font-medium">Rent</span>
          </div>
          <p className="text-lg font-bold tabular-nums">
            {formatMillions(summaryStats.rent)}
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: chartColorMappings.costBreakdown.staff,
              }}
            />
            <span className="text-sm font-medium">Staff</span>
          </div>
          <p className="text-lg font-bold tabular-nums">
            {formatMillions(summaryStats.staff)}
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: chartColorMappings.costBreakdown.otherOpex,
              }}
            />
            <span className="text-sm font-medium">Other OpEx</span>
          </div>
          <p className="text-lg font-bold tabular-nums">
            {formatMillions(summaryStats.otherOpex)}
          </p>
        </div>
      </div>
    </div>
  );
});
