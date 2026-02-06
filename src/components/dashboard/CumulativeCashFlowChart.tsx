"use client";

import { memo, useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  type TooltipProps,
} from "recharts";
import type { Payload } from "recharts/types/component/DefaultTooltipContent";
import { formatMillions } from "@/lib/utils/financial";
import {
  getProposalColor,
  chartColors,
} from "@/lib/design-tokens/chart-colors";
import { getAxisProps, getGridProps } from "@/lib/design-tokens/chart-config";
import {
  ChartLegend,
  type ChartLegendItem,
} from "@/components/charts/ChartLegend";
import { ChartInsight } from "@/components/charts/ChartInsight";

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
      <div
        className="rounded-xl border p-3 shadow-floating"
        style={{
          backgroundColor: "hsl(var(--color-background))",
          borderColor: "hsl(24 6% 83%)",
          minWidth: "180px",
        }}
      >
        <div className="text-xs uppercase tracking-wider font-semibold mb-2 pb-2 border-b border-border">
          Year {label}
        </div>
        <div className="space-y-1.5">
          {payload.map((entry, index) => {
            const value = toNumber(entry.value);
            const isPositive = value >= 0;
            return (
              <div
                key={String(entry.dataKey ?? entry.name ?? index)}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {(entry.name ?? entry.dataKey ?? "Value").toString()}
                  </span>
                </div>
                <span
                  className="font-semibold tabular-nums text-xs"
                  style={{
                    color: isPositive
                      ? chartColors.positive
                      : chartColors.negative,
                  }}
                >
                  {formatMillions(value * 1_000_000)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

/**
 * Chart 3: Cumulative Cash Flow
 *
 * Area chart showing cumulative cash flow over time
 * Simplified to match dashboard design system
 *
 * Performance: Wrapped with memo and uses useMemo for derived data
 */
function CumulativeCashFlowChartInner({ data }: CumulativeCashFlowChartProps) {
  // Memoize derived data to prevent recalculation on every render
  const { chartData, winner, legendItems } = useMemo(() => {
    if (!data || data.length === 0) {
      return { chartData: [], winner: null, legendItems: [] };
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

    // Determine winner (highest final cumulative cash)
    const finalCashByProposal = data.map((p) => ({
      ...p,
      finalCash: p.data[p.data.length - 1]?.cumulative || 0,
    }));
    const winner = finalCashByProposal.reduce((best, curr) =>
      curr.finalCash > best.finalCash ? curr : best,
    );

    // Build legend items
    const legendItems: ChartLegendItem[] = data.map((proposal, index) => {
      const finalCash =
        proposal.data[proposal.data.length - 1]?.cumulative || 0;
      const isWinner = proposal.proposalId === winner.proposalId;
      return {
        id: proposal.proposalId,
        label: proposal.proposalName,
        color: getProposalColor(index),
        value: formatMillions(finalCash),
        isWinner,
        isPositive: finalCash >= 0,
      };
    });

    return { chartData, winner, legendItems };
  }, [data]);

  // Early return for empty data
  if (!data || data.length === 0 || !winner) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Cumulative Cash Flow</h3>
        <div className="h-[280px] flex items-center justify-center text-muted-foreground">
          <p>No cash flow data available</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chart */}
      <div className="flex-1 min-h-0" role="img" aria-label="Cumulative cash flow area chart showing cash position over 30 years for all proposals">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
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
                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.05} />
                  </linearGradient>
                );
              })}
            </defs>
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
            <ReferenceLine
              y={0}
              stroke={chartColors.axis}
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: "Break-even",
                position: "right",
                fill: "hsl(var(--muted-foreground))",
                fontSize: 10,
              }}
            />
            {data.map((proposal, index) => (
              <Area
                key={proposal.proposalId}
                type="monotone"
                dataKey={proposal.proposalId}
                stroke={getProposalColor(index)}
                strokeWidth={
                  proposal.proposalId === winner.proposalId ? 2.5 : 1.5
                }
                fill={`url(#gradient-${proposal.proposalId})`}
                name={proposal.proposalName}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Unified Legend */}
      <ChartLegend items={legendItems} showValues compact />

      {/* Insight Message */}
      <ChartInsight message="💡 Break-even line shows when proposals turn cash-positive." />
    </div>
  );
}

// Memoize component to prevent re-renders when parent state changes but data hasn't
export const CumulativeCashFlowChart = memo(CumulativeCashFlowChartInner);
