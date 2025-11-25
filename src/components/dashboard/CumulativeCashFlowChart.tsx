"use client";

import { Card } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  type TooltipProps,
} from "recharts";
import type { Payload } from "recharts/types/component/DefaultTooltipContent";
import { formatMillions } from "@/lib/utils/financial";

interface CashFlowData {
  proposalId: string;
  proposalName: string;
  developer: string;
  data: Array<{
    year: number;
    netCashFlow: number;
    cumulative: number;
  }>;
}

interface CumulativeCashFlowChartProps {
  data: CashFlowData[];
}

type ChartPoint = {
  year: number;
} & Record<string, number>;

const toNumber = (value: unknown): number => Number(value ?? 0);

type ChartTooltipProps = TooltipProps<number, string> & {
  payload?: Payload<number, string>[];
  label?: string | number;
};

const CustomTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg p-3 shadow-lg">
        <p className="font-semibold mb-2">Year {label}</p>
        {payload.map((entry, index) => {
          const value = toNumber(entry.value);
          const isPositive = value >= 0;
          return (
            <div
              key={String(entry.dataKey ?? entry.name ?? index)}
              className="flex items-center gap-2 text-sm"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="font-medium">
                {(entry.name ?? entry.dataKey ?? "Value").toString()}:
              </span>
              <span className={isPositive ? "text-green-600" : "text-red-600"}>
                {formatMillions(value * 1_000_000)}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

/**
 * Chart 3: Cumulative Cash Flow
 *
 * Area chart showing cumulative cash flow over time
 * Green zones for positive cash flow
 * Red zones for negative cash flow
 */
export function CumulativeCashFlowChart({
  data,
}: CumulativeCashFlowChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Cumulative Cash Flow</h3>
        <div className="h-[400px] flex items-center justify-center text-muted-foreground">
          <p>No cash flow data available</p>
        </div>
      </Card>
    );
  }

  // Get all unique years
  const allYears = Array.from(
    new Set(data.flatMap((p) => p.data.map((d) => d.year))),
  ).sort((a, b) => a - b);

  // Sample every 2 years for better readability
  const sampledYears = allYears.filter((_, idx) => idx % 2 === 0);

  // Create chart data
  const chartData: ChartPoint[] = sampledYears.map((year) => {
    const point: ChartPoint = { year };
    data.forEach((proposal) => {
      const yearData = proposal.data.find((d) => d.year === year);
      if (yearData) {
        point[proposal.proposalId] = yearData.cumulative / 1_000_000; // Convert to millions
      }
    });
    return point;
  });

  // Colors for different proposals
  const colors = [
    { stroke: "#3b82f6", fill: "#3b82f6" }, // blue
    { stroke: "#ef4444", fill: "#ef4444" }, // red
    { stroke: "#10b981", fill: "#10b981" }, // green
    { stroke: "#f59e0b", fill: "#f59e0b" }, // amber
    { stroke: "#8b5cf6", fill: "#8b5cf6" }, // violet
  ];

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Cumulative Cash Flow</h3>
          <p className="text-sm text-muted-foreground">
            Cumulative cash position over 30 years (positive = surplus, negative
            = deficit)
          </p>
        </div>

        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                {data.map((proposal, index) => (
                  <linearGradient
                    key={`gradient-${proposal.proposalId}`}
                    id={`gradient-${proposal.proposalId}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={colors[index % colors.length].fill}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={colors[index % colors.length].fill}
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="year"
                label={{ value: "Year", position: "insideBottom", offset: -5 }}
                className="text-xs"
              />
              <YAxis
                label={{
                  value: "Cumulative Cash (Millions SAR)",
                  angle: -90,
                  position: "insideLeft",
                }}
                className="text-xs"
                tickFormatter={(value) => `${value.toFixed(0)}M`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                formatter={(value) => {
                  const proposal = data.find((p) => p.proposalId === value);
                  return proposal ? proposal.proposalName : value;
                }}
              />
              <ReferenceLine
                y={0}
                stroke="#64748b"
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{ value: "Break-even", position: "right" }}
              />
              {data.map((proposal, index) => (
                <Area
                  key={proposal.proposalId}
                  type="monotone"
                  dataKey={proposal.proposalId}
                  stroke={colors[index % colors.length].stroke}
                  strokeWidth={2}
                  fill={`url(#gradient-${proposal.proposalId})`}
                  name={proposal.proposalName}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 pt-2 border-t">
          {data.map((proposal, index) => {
            const finalCash =
              proposal.data[proposal.data.length - 1]?.cumulative || 0;
            const isPositive = finalCash >= 0;
            return (
              <div
                key={proposal.proposalId}
                className="flex items-center gap-2"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: colors[index % colors.length].stroke,
                  }}
                />
                <span className="text-sm">
                  {proposal.proposalName}:{" "}
                  <span
                    className={`font-medium ${
                      isPositive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatMillions(finalCash)}
                  </span>
                </span>
              </div>
            );
          })}
        </div>

        {/* Info Box */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-semibold text-sm mb-2">Interpretation:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>
              <span className="text-green-600 font-semibold">
                Positive values
              </span>
              : Cash surplus (good financial health)
            </li>
            <li>
              <span className="text-red-600 font-semibold">
                Negative values
              </span>
              : Cash deficit (requires external financing)
            </li>
            <li>The break-even line shows when proposals turn cash-positive</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
