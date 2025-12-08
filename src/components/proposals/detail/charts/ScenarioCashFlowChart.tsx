"use client";

import { BaseLineChart } from "@/components/charts/BaseLineChart";
import { chartColors } from "@/lib/design-tokens/chart-colors";

interface ChartDataPoint {
  year: number;
  baseline: number;
  scenario: number;
}

interface ScenarioCashFlowChartProps {
  data: ChartDataPoint[];
  isLoading?: boolean;
}

/**
 * Scenario Cash Flow Chart
 *
 * Compares baseline vs scenario cash flow over the 30-year projection.
 * - Baseline shown as dashed gray line
 * - Scenario shown as solid blue line
 * - Zero reference line for break-even visualization
 */
export function ScenarioCashFlowChart({
  data,
  isLoading,
}: ScenarioCashFlowChartProps) {
  if (isLoading) {
    return (
      <div className="h-[280px] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Calculating...
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[280px] flex items-center justify-center text-muted-foreground">
        <p>No data available</p>
      </div>
    );
  }

  // Sample every 2 years for readability
  const sampledData = data
    .filter((_, idx) => idx % 2 === 0)
    .map((d) => ({
      year: d.year,
      baseline: d.baseline / 1_000_000, // Convert to millions
      scenario: d.scenario / 1_000_000,
    }));

  return (
    <div className="h-[280px]">
      <BaseLineChart
        data={sampledData}
        series={[
          {
            dataKey: "baseline",
            name: "Baseline",
            color: chartColors.series[2], // Blue-gray
            strokeWidth: 2,
            strokeDasharray: "5 5",
          },
          {
            dataKey: "scenario",
            name: "Scenario",
            color: chartColors.neutral, // Copper for primary scenario
            strokeWidth: 2,
          },
        ]}
        xAxisKey="year"
        xAxisFormatter={(value) => `'${String(value).slice(-2)}`}
        yAxisFormatter={(value) => `${Number(value).toFixed(0)}M`}
        tooltipFormat="millions"
        height={280}
        showLegend={true}
        showGrid={true}
      />
    </div>
  );
}
