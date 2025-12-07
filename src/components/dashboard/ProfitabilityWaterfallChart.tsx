"use client";

import React, { useMemo } from "react";
import { formatMillions } from "@/lib/utils/financial";
import { BaseBarChart } from "@/components/charts/BaseBarChart";
import {
  chartColors,
  chartColorMappings,
  getProposalColor,
} from "@/lib/design-tokens/chart-colors";
import {
  ChartLegend,
  type ChartLegendItem,
} from "@/components/charts/ChartLegend";
import { ChartInsight } from "@/components/charts/ChartInsight";

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
  // Simplify segments: combine into 5 main categories
  // Limit to 4 proposals for side-by-side comparison
  const simplifiedData = useMemo(() => {
    const limitedData = data ? data.slice(0, 4) : [];
    return limitedData.map((proposal) => {
      const segments = proposal.segments;

      // Extract key values
      const revenue = segments.find((s) => s.label === "Revenue")?.value || 0;
      const rent = segments.find((s) => s.label === "Rent")?.value || 0;
      const staff = segments.find((s) => s.label === "Staff")?.value || 0;
      const otherOpex =
        segments.find((s) => s.label === "Other OpEx")?.value || 0;
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
        proposalId: proposal.proposalId,
        proposalName: proposal.proposalName,
        segments: simplified,
        netIncome: proposal.netIncome,
        isWinner: proposal.isWinner,
      };
    });
  }, [data]);

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
      const dataPoint: Record<string, unknown> = {
        segment: label,
        segmentIndex,
      };

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

  // Helper to get bar fill color based on segment type
  const getBarColor = (type: "positive" | "negative" | "total") => {
    if (type === "positive") return chartColors.positive;
    if (type === "negative") return chartColors.negative;
    return chartColorMappings.profitability.ebitda;
  };

  // Build legend items
  const legendItems: ChartLegendItem[] = simplifiedData.map(
    (proposal, index) => ({
      id: proposal.proposalId,
      label: proposal.proposalName,
      color: getProposalColor(index),
      value: formatMillions(proposal.netIncome * 1_000_000),
      isWinner: proposal.isWinner,
      isPositive: proposal.netIncome > 0,
    }),
  );

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p className="text-sm">No profitability data available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chart */}
      <div className="flex-1 min-h-0">
        <BaseBarChart
          data={chartData}
          series={simplifiedData.map((proposal, index) => ({
            dataKey: `proposal${index}`,
            name: proposal.proposalName,
            color: chartColorMappings.profitability.ebitda,
            cellColors: chartData.map((entry) => {
              const type = entry[`proposal${index}_type`] as
                | "positive"
                | "negative"
                | "total";
              return getBarColor(type);
            }),
          }))}
          xAxisKey="segment"
          layout="horizontal"
          yAxisFormatter={(value) => `${value}M`}
          tooltipContent={
            <CustomWaterfallTooltip simplifiedData={simplifiedData} />
          }
          height={320}
          showLegend={false}
        />
      </div>

      {/* Unified Legend */}
      <ChartLegend items={legendItems} showValues compact />

      {/* Insight Message */}
      <ChartInsight message="💡 Shows how revenue flows through costs to net income." />
    </div>
  );
}

// Custom tooltip with segment type styling
interface TooltipDataItem {
  proposalName: string;
  segments: WaterfallSegment[];
  netIncome: number;
  isWinner: boolean;
}

const CustomWaterfallTooltip = ({
  active,
  payload,
  simplifiedData,
}: {
  active?: boolean;
  payload?: Array<{ payload: Record<string, unknown> }>;
  simplifiedData: TooltipDataItem[];
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <div
        className="rounded-xl border p-3 shadow-floating max-w-xs"
        style={{
          backgroundColor: "hsl(var(--color-background))",
          borderColor: "hsl(24 6% 83%)",
        }}
      >
        <p className="font-semibold text-sm mb-2 pb-2 border-b border-border">
          {data.segment as string}
        </p>
        <div className="space-y-2">
          {simplifiedData.map((proposal, index) => {
            const value = data[`proposal${index}`] as number | undefined;
            const cumulative = data[`proposal${index}_cumulative`] as
              | number
              | undefined;
            const type = data[`proposal${index}_type`] as
              | "positive"
              | "negative"
              | "total"
              | undefined;

            if (value === undefined) return null;

            const color =
              type === "positive"
                ? chartColors.positive
                : type === "negative"
                  ? chartColors.negative
                  : chartColorMappings.profitability.ebitda;

            return (
              <div key={index} className="text-xs">
                <p className="text-muted-foreground mb-0.5 font-medium">
                  {proposal.proposalName}
                </p>
                <div className="flex justify-between gap-3">
                  <span>Value:</span>
                  <span className="font-medium tabular-nums" style={{ color }}>
                    {formatMillions(value * 1_000_000)}
                  </span>
                </div>
                {cumulative !== undefined && (
                  <div className="flex justify-between gap-3 text-muted-foreground">
                    <span>Running:</span>
                    <span className="tabular-nums">
                      {formatMillions(cumulative * 1_000_000)}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};
