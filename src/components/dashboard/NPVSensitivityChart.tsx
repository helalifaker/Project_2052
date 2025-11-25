"use client";

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
      <div className="bg-background border rounded-lg p-3 shadow-lg">
        <p className="font-semibold mb-2">{label}</p>
        <p className="text-xs text-muted-foreground mb-2">{data.proposal}</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-red-600">Downside:</span>
            <span className="font-medium">
              {formatMillions(data.negativeImpact * 1_000_000)}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-green-600">Upside:</span>
            <span className="font-medium">
              {formatMillions(data.positiveImpact * 1_000_000)}
            </span>
          </div>
          <div className="border-t pt-1 flex justify-between gap-4 font-semibold">
            <span>Total Range:</span>
            <span>{formatMillions(data.totalRange * 1_000_000)}</span>
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
export function NPVSensitivityChart({ data }: NPVSensitivityChartProps) {
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

  // Process sensitivity data into tornado format
  const processedData: ProcessedDataPoint[] = data
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
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">
            NPV Sensitivity Analysis (Tornado)
          </h3>
          <p className="text-sm text-muted-foreground">
            Impact of key variables on NPV (ranked by total impact range)
          </p>
        </div>

        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={processedData}
              layout="vertical"
              margin={{ left: 120, right: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                type="number"
                label={{
                  value: "Impact on NPV (Millions SAR)",
                  position: "insideBottom",
                  offset: -5,
                }}
                className="text-xs"
                tickFormatter={(value) => `${value.toFixed(0)}M`}
              />
              <YAxis
                type="category"
                dataKey="variable"
                width={100}
                className="text-xs"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="negativeImpact"
                fill="#ef4444"
                name="Downside Impact"
                stackId="stack"
              >
                {processedData.map((_, index) => (
                  <Cell key={`cell-neg-${index}`} fill="#ef4444" />
                ))}
              </Bar>
              <Bar
                dataKey="positiveImpact"
                fill="#10b981"
                name="Upside Impact"
                stackId="stack"
              >
                {processedData.map((_, index) => (
                  <Cell key={`cell-pos-${index}`} fill="#10b981" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Insights */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-semibold text-sm mb-2">Key Insights:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>
              <span className="font-semibold">Most Sensitive Variable: </span>
              {processedData[0]?.variable || "N/A"} (highest impact range)
            </li>
            <li>
              <span className="text-green-600 font-semibold">Green bars</span>:
              Positive impact when variable increases
            </li>
            <li>
              <span className="text-red-600 font-semibold">Red bars</span>:
              Negative impact when variable decreases
            </li>
            <li>Longer bars indicate higher sensitivity to that variable</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}

function getVariableName(variable: string): string {
  const names: Record<string, string> = {
    enrollment: "Enrollment",
    tuitionGrowth: "Tuition Growth",
    cpi: "CPI Inflation",
    rentEscalation: "Rent Escalation",
    staffCosts: "Staff Costs",
    otherOpex: "Other OpEx",
  };
  return names[variable] || variable;
}
