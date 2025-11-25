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
  type TooltipProps,
} from "recharts";
import type { Payload } from "recharts/types/component/DefaultTooltipContent";
import { formatMillions } from "@/lib/utils/financial";

interface CostBreakdownData {
  proposalId: string;
  proposalName: string;
  developer: string;
  rent: string;
  staff: string;
  otherOpex: string;
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

const toNumber = (value: unknown): number => Number(value ?? 0);

type ChartTooltipProps = TooltipProps<number, string> & {
  payload?: Payload<number, string>[];
  label?: string | number;
};

const CustomTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (active && payload && payload.length) {
    const total = payload.reduce(
      (sum: number, entry: Payload<number, string>) =>
        sum + toNumber(entry.value),
      0,
    );
    return (
      <div className="bg-background border rounded-lg p-3 shadow-lg">
        <p className="font-semibold mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div
            key={String(entry.dataKey ?? entry.name ?? index)}
            className="flex items-center justify-between gap-4 text-sm"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span>{entry.name}:</span>
            </div>
            <span className="font-medium">
              {formatMillions(toNumber(entry.value) * 1_000_000)}
            </span>
          </div>
        ))}
        <div className="border-t mt-2 pt-2 flex justify-between text-sm font-semibold">
          <span>Total:</span>
          <span>{formatMillions(total * 1_000_000)}</span>
        </div>
      </div>
    );
  }
  return null;
};

/**
 * Chart 2: Cost Breakdown
 *
 * Stacked bar chart showing breakdown of costs:
 * - Rent
 * - Staff Costs
 * - Other OpEx
 *
 * PERFORMANCE OPTIMIZATION:
 * - React.memo() to prevent re-renders
 * - useMemo() for expensive chart data transformation
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
      "Other OpEx": parseFloat(proposal.otherOpex) / 1_000_000,
    }));
  }, [data]);

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
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Cost Breakdown by Proposal</h3>
          <p className="text-sm text-muted-foreground">
            Total 30-year costs split by category (Rent, Staff, Other OpEx)
          </p>
        </div>

        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                className="text-xs"
              />
              <YAxis
                label={{
                  value: "Cost (Millions SAR)",
                  angle: -90,
                  position: "insideLeft",
                }}
                className="text-xs"
                tickFormatter={(value) => `${value.toFixed(0)}M`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: "20px" }} />
              <Bar dataKey="Rent" stackId="a" fill="#3b82f6" />
              <Bar dataKey="Staff" stackId="a" fill="#10b981" />
              <Bar dataKey="Other OpEx" stackId="a" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-3 gap-4 pt-2 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-[#3b82f6]" />
              <span className="text-sm font-medium">Rent</span>
            </div>
            <p className="text-lg font-bold">
              {formatMillions(
                chartData.reduce((sum, d) => sum + d.Rent, 0) * 1_000_000,
              )}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-[#10b981]" />
              <span className="text-sm font-medium">Staff</span>
            </div>
            <p className="text-lg font-bold">
              {formatMillions(
                chartData.reduce((sum, d) => sum + d.Staff, 0) * 1_000_000,
              )}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
              <span className="text-sm font-medium">Other OpEx</span>
            </div>
            <p className="text-lg font-bold">
              {formatMillions(
                chartData.reduce((sum, d) => sum + d["Other OpEx"], 0) *
                  1_000_000,
              )}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
});
