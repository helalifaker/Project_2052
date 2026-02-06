"use client";

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
  Label,
} from "recharts";
import { TrendingUp, Milestone } from "lucide-react";
import { formatMillions } from "@/lib/utils/financial";
import { chartColors } from "@/lib/design-tokens/chart-colors";
import { getGridProps, chartAnimation } from "@/lib/design-tokens/chart-config";

type DataPoint = {
  year: number;
  revenue: number;
  costs: number;
  netIncome: number;
};

type ProposalProfitabilityChartProps = {
  data: DataPoint[];
  contractEndYear: number;
  height?: number;
};

// Custom tooltip
const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number }>;
  label?: number;
}) => {
  if (!active || !payload || !payload.length) return null;

  const year = label;
  const revenue = payload.find((p) => p.dataKey === "revenue")?.value || 0;
  const costs = payload.find((p) => p.dataKey === "costs")?.value || 0;
  const netIncome = payload.find((p) => p.dataKey === "netIncome")?.value || 0;
  const margin = revenue > 0 ? ((netIncome / revenue) * 100).toFixed(1) : "0.0";

  // Determine phase
  let phase = "Dynamic";
  if (year && year <= 2024) phase = "Historical";
  else if (year && year <= 2027) phase = "Transition";

  return (
    <div className="bg-background/95 backdrop-blur-md border border-border/50 rounded-lg shadow-xl p-4 space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div className="font-semibold text-lg">{year}</div>
        <div className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
          {phase}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: "var(--atelier-chart-proposal-b)" }}
            ></div>
            <span className="text-muted-foreground">Revenue</span>
          </div>
          <span className="font-mono font-semibold">
            {formatMillions(revenue)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: "var(--financial-negative)" }}
            ></div>
            <span className="text-muted-foreground">Costs</span>
          </div>
          <span className="font-mono font-semibold">
            {formatMillions(costs)}
          </span>
        </div>

        <div className="h-px bg-border my-2"></div>

        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: "var(--financial-positive)" }}
            ></div>
            <span className="font-semibold">Net Income</span>
          </div>
          <span
            className="font-mono font-bold"
            style={{
              color:
                netIncome >= 0
                  ? "var(--financial-positive)"
                  : "var(--financial-negative)",
            }}
          >
            {formatMillions(netIncome)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-8 text-xs">
          <span className="text-muted-foreground">Profit Margin</span>
          <span
            className="font-mono"
            style={{
              color:
                parseFloat(margin) >= 0
                  ? "var(--financial-positive)"
                  : "var(--financial-negative)",
            }}
          >
            {margin}%
          </span>
        </div>
      </div>
    </div>
  );
};

export function ProposalProfitabilityChart({
  data,
  contractEndYear,
  height = 350,
}: ProposalProfitabilityChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          No profitability data available
        </div>
      </Card>
    );
  }

  // Find breakeven point
  const breakevenYear = data.find((d) => d.netIncome > 0)?.year;

  // Find peak profitability year
  const peakProfitYear = data.reduce((prev, current) =>
    current.netIncome > prev.netIncome ? current : prev,
  ).year;

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <TrendingUp
                className="h-5 w-5"
                style={{ color: "var(--financial-positive)" }}
              />
              Profitability Journey
            </h3>
            <p className="text-xs text-muted-foreground">
              Revenue, costs, and net income (2023-{contractEndYear})
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div
                className="h-2.5 w-6 rounded-full"
                style={{ backgroundColor: "var(--atelier-chart-proposal-b)" }}
              ></div>
              <span>Revenue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className="h-2.5 w-6 rounded-full"
                style={{ backgroundColor: "var(--financial-negative)" }}
              ></div>
              <span>Costs</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className="h-2.5 w-6 rounded-full"
                style={{ backgroundColor: "var(--financial-positive)" }}
              ></div>
              <span>Net Income</span>
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="grid grid-cols-2 gap-3 bg-muted/30 rounded-lg p-3">
          {breakevenYear && (
            <div className="flex items-center gap-2">
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "var(--atelier-ink-positive-soft)" }}
              >
                <TrendingUp
                  className="h-4 w-4"
                  style={{ color: "var(--financial-positive)" }}
                />
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground">
                  Breakeven
                </div>
                <div className="text-sm font-semibold">{breakevenYear}</div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--atelier-chart-proposal-a) 15%, transparent)",
              }}
            >
              <Milestone
                className="h-4 w-4"
                style={{ color: "var(--atelier-chart-proposal-a)" }}
              />
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground">
                Peak Profit
              </div>
              <div className="text-sm font-semibold">{peakProfitYear}</div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div style={{ height: `${height}px` }} role="img" aria-label={`Profitability journey chart showing revenue, costs, and net income from 2023 to ${contractEndYear}`}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 20, left: 10, bottom: 40 }}
            >
              <defs>
                <linearGradient
                  id="revenueGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={chartColors.neutral}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="100%"
                    stopColor={chartColors.neutral}
                    stopOpacity={0.1}
                  />
                </linearGradient>

                <linearGradient id="costsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={chartColors.negative}
                    stopOpacity={0.6}
                  />
                  <stop
                    offset="100%"
                    stopColor={chartColors.negative}
                    stopOpacity={0.05}
                  />
                </linearGradient>

                <linearGradient
                  id="netIncomeGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={chartColors.positive}
                    stopOpacity={0.7}
                  />
                  <stop
                    offset="100%"
                    stopColor={chartColors.positive}
                    stopOpacity={0.05}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid {...getGridProps()} />

              <XAxis
                dataKey="year"
                stroke={chartColors.axis}
                tick={{ fill: chartColors.axis, fontSize: 11 }}
                tickLine={{ stroke: chartColors.axis }}
              />

              <YAxis
                stroke={chartColors.axis}
                tick={{ fill: chartColors.axis, fontSize: 11 }}
                tickLine={{ stroke: chartColors.axis }}
                tickFormatter={(value) => `${(value / 1_000_000).toFixed(0)}M`}
              />

              <Tooltip content={<CustomTooltip />} />

              {/* Phase Indicators */}
              <ReferenceLine
                x={2024}
                stroke={chartColors.grid}
                strokeDasharray="5 5"
                strokeWidth={1}
                opacity={0.5}
              >
                <Label
                  value="Historical"
                  position="insideTopLeft"
                  fill={chartColors.axis}
                  fontSize={10}
                  offset={8}
                />
              </ReferenceLine>

              <ReferenceLine
                x={2027}
                stroke={chartColors.grid}
                strokeDasharray="5 5"
                strokeWidth={1}
                opacity={0.5}
              >
                <Label
                  value="Transition"
                  position="insideTopRight"
                  fill={chartColors.axis}
                  fontSize={10}
                  offset={8}
                />
              </ReferenceLine>

              <ReferenceLine
                x={2028}
                stroke={chartColors.proposalA}
                strokeWidth={2}
                opacity={0.7}
              >
                <Label
                  value="Contract Start"
                  position="top"
                  fill={chartColors.proposalA}
                  fontSize={11}
                  fontWeight="bold"
                  offset={12}
                />
              </ReferenceLine>

              <ReferenceLine
                x={contractEndYear}
                stroke={chartColors.proposalA}
                strokeWidth={2}
                opacity={0.7}
              >
                <Label
                  value="Contract End"
                  position="top"
                  fill={chartColors.proposalA}
                  fontSize={11}
                  fontWeight="bold"
                  offset={12}
                />
              </ReferenceLine>

              {/* Area Layers */}
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={chartColors.neutral}
                strokeWidth={2}
                fill="url(#revenueGradient)"
                animationDuration={chartAnimation.duration}
              />

              <Area
                type="monotone"
                dataKey="costs"
                stroke={chartColors.negative}
                strokeWidth={2}
                fill="url(#costsGradient)"
                animationDuration={chartAnimation.duration}
              />

              <Area
                type="monotone"
                dataKey="netIncome"
                stroke={chartColors.positive}
                strokeWidth={2}
                fill="url(#netIncomeGradient)"
                animationDuration={chartAnimation.duration}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
