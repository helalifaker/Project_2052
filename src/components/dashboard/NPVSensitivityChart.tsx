"use client";

import { memo, useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  type TooltipProps,
} from "recharts";
import type { Payload } from "recharts/types/component/DefaultTooltipContent";
import { formatMillions } from "@/lib/utils/financial";
import { chartColorMappings } from "@/lib/design-tokens/chart-colors";
import {
  getAxisProps,
  getGridProps,
  getTooltipProps,
  getLegendProps,
  chartAnimation,
} from "@/lib/design-tokens/chart-config";

interface SensitivityData {
  id: string;
  proposalName: string;
  developer: string | null;
  variable: string;
  metric: string;
  dataPoints: Array<{ variablePercent: number; metricValue: string }> | null;
}

interface NPVSensitivityChartProps {
  data: SensitivityData[];
}

type ProcessedDataPoint = {
  variable: string;
  proposal: string;
  negativeImpact: number;
  positiveImpact: number;
  totalRange: number;
};

type ChartTooltipProps = TooltipProps<number, string> & {
  payload?: Payload<number, string>[];
  label?: string | number;
};

const CustomTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload as ProcessedDataPoint | undefined;
    if (!data) return null;

    return (
      <div className="executive-tooltip">
        <p className="executive-tooltip-label">{label}</p>
        <p className="text-xs text-muted-foreground mb-3">{data.proposal}</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <span
              style={{ color: chartColorMappings.sensitivity.negativeImpact }}
            >
              Downside:
            </span>
            <span className="font-medium tabular-nums">
              {formatMillions(data.negativeImpact * 1_000_000)}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span
              style={{ color: chartColorMappings.sensitivity.positiveImpact }}
            >
              Upside:
            </span>
            <span className="font-medium tabular-nums">
              {formatMillions(data.positiveImpact * 1_000_000)}
            </span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between gap-4 font-semibold">
            <span>Total Range:</span>
            <span className="tabular-nums">
              {formatMillions(data.totalRange * 1_000_000)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

/**
 * Chart 4: NPV Sensitivity (Tornado Diagram)
 *
 * Shows sensitivity of NPV to key variables
 * Bars extend left/right from center showing positive/negative impact
 */
export const NPVSensitivityChart = memo(function NPVSensitivityChart({
  data,
}: NPVSensitivityChartProps) {
  // Process sensitivity data into tornado format (memoized for performance)
  const processedData: ProcessedDataPoint[] = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    return data
      .map((analysis) => {
        if (!analysis.dataPoints || !Array.isArray(analysis.dataPoints)) {
          return null;
        }

        // Get baseline (middle value)
        const sortedPoints = [...analysis.dataPoints].sort(
          (a, b) => a.variablePercent - b.variablePercent,
        );
        const baselineIndex = Math.floor(sortedPoints.length / 2);
        const baseline = parseFloat(
          sortedPoints[baselineIndex]?.metricValue || "0",
        );

        // Get min and max impacts
        const minPoint = sortedPoints[0];
        const maxPoint = sortedPoints[sortedPoints.length - 1];

        const minValue = parseFloat(minPoint?.metricValue || "0");
        const maxValue = parseFloat(maxPoint?.metricValue || "0");

        const negativeImpact = minValue - baseline;
        const positiveImpact = maxValue - baseline;

        return {
          variable: getVariableName(analysis.variable),
          proposal: analysis.proposalName,
          negativeImpact: negativeImpact / 1_000_000, // Convert to millions
          positiveImpact: positiveImpact / 1_000_000,
          totalRange: Math.abs(positiveImpact - negativeImpact) / 1_000_000,
        };
      })
      .filter(Boolean)
      .map((entry) => entry as ProcessedDataPoint)
      .sort((a, b) => b.totalRange - a.totalRange); // Sort by total impact range
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">NPV Sensitivity Analysis</h3>
        <div className="h-[400px] flex items-center justify-center text-muted-foreground">
          <p>No sensitivity analysis data available</p>
        </div>
      </Card>
    );
  }

  if (processedData.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">NPV Sensitivity Analysis</h3>
        <div className="h-[400px] flex items-center justify-center text-muted-foreground">
          <p>No valid sensitivity data to display</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={processedData}
            layout="vertical"
            margin={{ left: 120, right: 20 }}
          >
            {/* Minimal vertical grid only for tornado */}
            <CartesianGrid {...getGridProps()} horizontal={false} />
            <XAxis
              {...getAxisProps("x")}
              type="number"
              tickFormatter={(value) => `${value.toFixed(0)}M`}
            />
            <YAxis
              {...getAxisProps("y")}
              type="category"
              dataKey="variable"
              width={100}
            />
            <Tooltip content={<CustomTooltip />} {...getTooltipProps()} />
            <Legend {...getLegendProps()} />
            <Bar
              dataKey="negativeImpact"
              fill={chartColorMappings.sensitivity.negativeImpact}
              name="Downside Impact"
              stackId="stack"
              radius={[4, 0, 0, 4]}
              animationDuration={chartAnimation.duration}
              animationEasing={chartAnimation.easing}
            >
              {processedData.map((_, index) => (
                <Cell
                  key={`cell-neg-${index}`}
                  fill={chartColorMappings.sensitivity.negativeImpact}
                />
              ))}
            </Bar>
            <Bar
              dataKey="positiveImpact"
              fill={chartColorMappings.sensitivity.positiveImpact}
              name="Upside Impact"
              stackId="stack"
              radius={[0, 4, 4, 0]}
              animationDuration={chartAnimation.duration}
              animationEasing={chartAnimation.easing}
            >
              {processedData.map((_, index) => (
                <Cell
                  key={`cell-pos-${index}`}
                  fill={chartColorMappings.sensitivity.positiveImpact}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Insights with theme colors */}
      <div className="bg-accent/50 rounded-xl p-4 border border-border shrink-0">
        <h4 className="font-semibold text-sm mb-2">Key Insights:</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>
            <span className="font-semibold text-foreground">
              Most Sensitive Variable:{" "}
            </span>
            {processedData[0]?.variable || "N/A"} (highest impact range)
          </li>
          <li>
            <span
              style={{ color: chartColorMappings.sensitivity.positiveImpact }}
              className="font-semibold"
            >
              Sage bars
            </span>
            : Positive impact when variable increases
          </li>
          <li>
            <span
              style={{ color: chartColorMappings.sensitivity.negativeImpact }}
              className="font-semibold"
            >
              Terracotta bars
            </span>
            : Negative impact when variable decreases
          </li>
          <li>Longer bars indicate higher sensitivity to that variable</li>
        </ul>
      </div>
    </div>
  );
});

function getVariableName(variable: string): string {
  const names: Record<string, string> = {
    enrollment: "Enrollment",
    tuitionGrowth: "Tuition Growth",
    cpi: "CPI Inflation",
    rentEscalation: "Rent Escalation",
    staffCosts: "Staff Costs",
    otherOpexPercent: "Other OpEx",
  };
  return names[variable] || variable;
}
