"use client";

import React, { useMemo } from "react";
import { formatMillions } from "@/lib/utils/financial";
import { BaseBarChart } from "@/components/charts/BaseBarChart";
import { chartColors, chartColorMappings } from "@/lib/design-tokens/chart-colors";

interface WaterfallSegment {
  label: string;
  value: number;
  type: "positive" | "negative" | "total";
  cumulative: number;
}

interface ProfitabilityWaterfallData {
  proposalId: string;
  proposalName: string;
  segments: WaterfallSegment[];
  netIncome: number;
  isWinner: boolean;
}

interface ProfitabilityWaterfallChartProps {
  data: ProfitabilityWaterfallData[];
}

/**
 * Profitability Waterfall Chart (Simplified)
 *
 * Waterfall/bridge chart showing average annual revenue flows to net income
 * Simplified to 5 segments for clarity
 * Values averaged across contract period for fair comparison
 */
export function ProfitabilityWaterfallChart({
  data,
}: ProfitabilityWaterfallChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[500px] text-muted-foreground">
        No profitability data available
      </div>
    );
  }

  // Limit to 4 proposals for side-by-side comparison
  const limitedData = data.slice(0, 4);

  // Simplify segments: combine into 5 main categories
  const simplifiedData = useMemo(() => {
    return limitedData.map((proposal) => {
      const segments = proposal.segments;

      // Extract key values
      const revenue = segments.find((s) => s.label === "Revenue")?.value || 0;
      const rent = segments.find((s) => s.label === "Rent")?.value || 0;
      const staff = segments.find((s) => s.label === "Staff")?.value || 0;
      const otherOpex = segments.find((s) => s.label === "Other OpEx")?.value || 0;
      const ebitda = segments.find((s) => s.label === "EBITDA")?.value || 0;
      const depreciation =
        segments.find((s) => s.label === "Depreciation")?.value || 0;
      const interestNet =
        segments.find((s) => s.label === "Interest (Net)")?.value || 0;
      const zakat = segments.find((s) => s.label === "Zakat")?.value || 0;

      // Combine operating costs
      const operatingCosts = rent + staff + otherOpex;

      // Combine other deductions
      const otherDeductions = depreciation + zakat + Math.abs(interestNet);

      // Build simplified segments
      const simplified: WaterfallSegment[] = [
        {
          label: "Revenue",
          value: revenue,
          type: "positive",
          cumulative: revenue,
        },
        {
          label: "Operating Costs",
          value: operatingCosts,
          type: "negative",
          cumulative: revenue - operatingCosts,
        },
        {
          label: "EBITDA",
          value: ebitda,
          type: "total",
          cumulative: revenue - operatingCosts,
        },
        {
          label: "Other Deductions",
          value: otherDeductions,
          type: "negative",
          cumulative: revenue - operatingCosts - otherDeductions,
        },
        {
          label: "Net Income",
          value: proposal.netIncome,
          type: "total",
          cumulative: proposal.netIncome,
        },
      ];

      return {
        proposalName: proposal.proposalName,
        segments: simplified,
        netIncome: proposal.netIncome,
        isWinner: proposal.isWinner,
      };
    });
  }, [limitedData]);

  // Transform for Recharts - create stacked data
  const chartData = useMemo(() => {
    const allSegmentLabels = [
      "Revenue",
      "Operating Costs",
      "EBITDA",
      "Other Deductions",
      "Net Income",
    ];

    return allSegmentLabels.map((label, segmentIndex) => {
      const dataPoint: any = { segment: label, segmentIndex };

      simplifiedData.forEach((proposal, proposalIndex) => {
        const segment = proposal.segments[segmentIndex];
        if (segment) {
          dataPoint[`proposal${proposalIndex}`] = segment.value;
          dataPoint[`proposal${proposalIndex}_cumulative`] = segment.cumulative;
          dataPoint[`proposal${proposalIndex}_type`] = segment.type;
          dataPoint[`proposal${proposalIndex}_name`] = proposal.proposalName;
        }
      });

      return dataPoint;
    });
  }, [simplifiedData]);

  // Custom tooltip with segment type styling
  const CustomWaterfallTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg max-w-xs">
          <p className="font-semibold text-sm mb-2">{data.segment}</p>
          <div className="space-y-1.5">
            {simplifiedData.map((proposal, index) => {
              const value = data[`proposal${index}`];
              const cumulative = data[`proposal${index}_cumulative`];
              const type = data[`proposal${index}_type`];

              if (value === undefined) return null;

              const color =
                type === "positive"
                  ? chartColors.positive
                  : type === "negative"
                  ? chartColors.negative
                  : chartColorMappings.profitability.ebitda;

              return (
                <div key={index} className="text-xs">
                  <p className="text-muted-foreground mb-0.5">
                    {proposal.proposalName}
                  </p>
                  <div className="flex justify-between gap-3">
                    <span>Value:</span>
                    <span
                      className="font-medium tabular-nums"
                      style={{ color }}
                    >
                      {formatMillions(value * 1_000_000)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3 text-muted-foreground">
                    <span>Running:</span>
                    <span className="tabular-nums">
                      {formatMillions(cumulative * 1_000_000)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  // Helper to get bar fill color based on segment type
  const getBarColor = (type: "positive" | "negative" | "total") => {
    if (type === "positive") return chartColors.positive;
    if (type === "negative") return chartColors.negative;
    return chartColorMappings.profitability.ebitda;
  };

  return (
    <div className="space-y-4">
      {/* Explanatory Note */}
      <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3 border border-border/50">
        <p className="flex items-center gap-2">
          <span className="text-base">💡</span>
          <span>
            Average annual profitability waterfall showing how revenue flows through costs to net income.
            Values averaged across contract period for fair comparison between 25Y and 30Y contracts.
          </span>
        </p>
      </div>

      {/* Chart - Using custom implementation for waterfall-specific behavior */}
      <div className="h-[500px]">
        <BaseBarChart
          data={chartData}
          series={simplifiedData.map((proposal, index) => ({
            dataKey: `proposal${index}`,
            name: proposal.proposalName,
            color: chartColorMappings.profitability.ebitda,
            cellColors: chartData.map((entry) => {
              const type = entry[`proposal${index}_type`];
              return getBarColor(type);
            }),
          }))}
          xAxisKey="segment"
          yAxisFormatter={(value) => `${value}M`}
          tooltipContent={<CustomWaterfallTooltip />}
          height={500}
          showLegend
        />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 pt-2">
        <div className="text-center p-3 bg-muted/20 rounded-lg border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Most Profitable</p>
          <p className="text-sm font-semibold">
            {simplifiedData.find((d) => d.isWinner)?.proposalName || "N/A"}
          </p>
          <p
            className="text-xs mt-1 tabular-nums font-medium"
            style={{ color: chartColors.positive }}
          >
            {simplifiedData.find((d) => d.isWinner)
              ? formatMillions(
                  simplifiedData.find((d) => d.isWinner)!.netIncome * 1_000_000
                )
              : "—"}
          </p>
        </div>
        <div className="text-center p-3 bg-muted/20 rounded-lg border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Segments</p>
          <p className="text-sm font-semibold">Simplified View</p>
          <p className="text-xs text-muted-foreground mt-1">5 Categories</p>
        </div>
        <div className="text-center p-3 bg-muted/20 rounded-lg border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Comparing</p>
          <p className="text-sm font-semibold">
            {simplifiedData.length} Proposals
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {data.length > 4 && `(Top 4 of ${data.length})`}
          </p>
        </div>
      </div>
    </div>
  );
}
