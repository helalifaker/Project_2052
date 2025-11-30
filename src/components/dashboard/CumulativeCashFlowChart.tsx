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
import { getProposalColor, chartColors } from "@/lib/design-tokens/chart-colors";
import { getAxisProps, getGridProps } from "@/lib/design-tokens/chart-config";

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
      <div className="executive-tooltip">
        <p className="executive-tooltip-label">Year {label}</p>
        {payload.map((entry, index) => {
          const value = toNumber(entry.value);
          const isPositive = value >= 0;
          return (
            <div
              key={String(entry.dataKey ?? entry.name ?? index)}
              className="flex items-center gap-2 text-sm mb-1"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">
                {(entry.name ?? entry.dataKey ?? "Value").toString()}:
              </span>
              <span
                className="font-medium tabular-nums"
                style={{ color: isPositive ? chartColors.positive : chartColors.negative }}
              >
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

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              {data.map((proposal, index) => {
                const color = getProposalColor(index);
                return (
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
                      stopColor={color}
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor={color}
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                );
              })}
            </defs>
            {/* Minimal horizontal grid */}
            <CartesianGrid {...getGridProps()} />
            <XAxis
              {...getAxisProps("x")}
              dataKey="year"
              tickFormatter={(value) => value.toString()}
            />
            <YAxis
              {...getAxisProps("y")}
              tickFormatter={(value) => `${value.toFixed(0)}M`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              formatter={(value) => {
                const proposal = data.find((p) => p.proposalId === value);
                return <span className="text-sm text-foreground">{proposal ? proposal.proposalName : value}</span>;
              }}
            />
            <ReferenceLine
              y={0}
              stroke={chartColors.axis}
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: "Break-even",
                position: "right",
                fill: "hsl(var(--muted-foreground))",
                fontSize: 12,
              }}
            />
            {data.map((proposal, index) => (
              <Area
                key={proposal.proposalId}
                type="monotone"
                dataKey={proposal.proposalId}
                stroke={getProposalColor(index)}
                strokeWidth={2}
                fill={`url(#gradient-${proposal.proposalId})`}
                name={proposal.proposalName}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend with theme colors */}
      <div className="flex flex-wrap gap-4 pt-4 border-t border-border shrink-0">
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
                  backgroundColor: getProposalColor(index),
                }}
              />
              <span className="text-sm">
                {proposal.proposalName}:{" "}
                <span
                  className="font-medium tabular-nums"
                  style={{ color: isPositive ? chartColors.positive : chartColors.negative }}
                >
                  {formatMillions(finalCash)}
                </span>
              </span>
            </div>
          );
        })}
      </div>

      {/* Info Box with theme colors */}
      <div className="bg-accent/50 rounded-xl p-4 border border-border shrink-0">
        <h4 className="font-semibold text-sm mb-2">Interpretation:</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>
            <span style={{ color: chartColors.positive }} className="font-semibold">
              Positive values
            </span>
            : Cash surplus (good financial health)
          </li>
          <li>
            <span style={{ color: chartColors.negative }} className="font-semibold">
              Negative values
            </span>
            : Cash deficit (requires external financing)
          </li>
          <li>The break-even line shows when proposals turn cash-positive</li>
        </ul>
      </div>
    </div>
  );
}
