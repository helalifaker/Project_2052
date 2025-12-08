"use client";

import { memo } from "react";
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
import { TrendingUp, TrendingDown, Milestone } from "lucide-react";
import { formatMillions } from "@/lib/utils/financial";
import { chartColors, chartColorVars } from "@/lib/design-tokens/chart-colors";
import { chartAnimationDurations } from "@/lib/design-tokens/chart-config";

type DataPoint = {
  year: number;
  revenue: number;
  costs: number;
  netIncome: number;
};

type ProfitabilityJourneyChartProps = {
  data: DataPoint[];
  contractEndYear: number;
};

// Custom tooltip with glass-morphism effect
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
        <div className="text-xs px-2 py-1 rounded-full bg-[var(--atelier-craft-gold-soft)] text-[var(--atelier-stone-900)]">
          {phase}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{
                backgroundColor: chartColorVars["--atelier-chart-proposal-a"],
              }}
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
              style={{
                backgroundColor: chartColorVars["--atelier-ink-negative"],
              }}
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
              style={{
                backgroundColor: chartColorVars["--atelier-ink-positive"],
              }}
            ></div>
            <span className="font-semibold">Net Income</span>
          </div>
          <span
            className="font-mono font-bold"
            style={{
              color:
                netIncome >= 0
                  ? chartColorVars["--atelier-ink-positive"]
                  : chartColorVars["--atelier-ink-negative"],
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
                  ? chartColorVars["--atelier-ink-positive"]
                  : chartColorVars["--atelier-ink-negative"],
            }}
          >
            {margin}%
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * The Profitability Journey - Advanced Multi-Dimensional Chart
 *
 * Visual Storytelling Features:
 * - Three layered gradient areas (Revenue, Costs, Net Income)
 * - Phase indicators for Historical/Transition/Dynamic periods
 * - Milestone markers for key inflection points
 * - Glass-morphism tooltips with detailed breakdowns
 * - Responsive grid with smart axis formatting
 */
export const ProfitabilityJourneyChart = memo(
  function ProfitabilityJourneyChart({
    data,
    contractEndYear,
  }: ProfitabilityJourneyChartProps) {
    if (!data || data.length === 0) {
      return (
        <Card className="p-6">
          <div className="text-center text-muted-foreground">
            No profitability data available
          </div>
        </Card>
      );
    }

    // Find breakeven point (first year where netIncome > 0)
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
              <h3 className="text-xl font-bold flex items-center gap-2">
                <TrendingUp
                  className="h-5 w-5"
                  style={{ color: chartColorVars["--atelier-ink-positive"] }}
                />
                The Profitability Journey
              </h3>
              <p className="text-sm text-muted-foreground">
                Revenue, costs, and net income trajectory across all periods
                (2023-{contractEndYear})
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-8 rounded-full"
                  style={{
                    backgroundColor:
                      chartColorVars["--atelier-chart-proposal-a"],
                  }}
                ></div>
                <span>Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-8 rounded-full"
                  style={{
                    backgroundColor: chartColorVars["--atelier-ink-negative"],
                  }}
                ></div>
                <span>Costs</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-8 rounded-full"
                  style={{
                    backgroundColor: chartColorVars["--atelier-ink-positive"],
                  }}
                ></div>
                <span>Net Income</span>
              </div>
            </div>
          </div>

          {/* Key Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-muted/30 rounded-lg p-4">
            {breakevenYear && (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[var(--atelier-ink-positive)]/10 flex items-center justify-center">
                  <TrendingUp
                    className="h-5 w-5"
                    style={{ color: chartColorVars["--atelier-ink-positive"] }}
                  />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">
                    Breakeven Year
                  </div>
                  <div className="font-semibold">{breakevenYear}</div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[var(--atelier-chart-proposal-a)]/10 flex items-center justify-center">
                <Milestone
                  className="h-5 w-5"
                  style={{
                    color: chartColorVars["--atelier-chart-proposal-a"],
                  }}
                />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">
                  Peak Profitability
                </div>
                <div className="font-semibold">{peakProfitYear}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[var(--atelier-chart-proposal-b)]/10 flex items-center justify-center">
                <TrendingDown
                  className="h-5 w-5"
                  style={{
                    color: chartColorVars["--atelier-chart-proposal-b"],
                  }}
                />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">
                  Contract Period
                </div>
                <div className="font-semibold">2028-{contractEndYear}</div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 30, left: 20, bottom: 60 }}
              >
                <defs>
                  {/* Revenue Gradient: Royal Violet (Atelier) */}
                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={chartColorVars["--atelier-chart-proposal-a"]}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="100%"
                      stopColor={chartColorVars["--atelier-chart-proposal-b"]}
                      stopOpacity={0.1}
                    />
                  </linearGradient>

                  {/* Costs Gradient: Burgundy (Atelier) */}
                  <linearGradient
                    id="costsGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={chartColorVars["--atelier-ink-negative"]}
                      stopOpacity={0.6}
                    />
                    <stop
                      offset="100%"
                      stopColor={chartColorVars["--atelier-ink-negative"]}
                      stopOpacity={0.05}
                    />
                  </linearGradient>

                  {/* Net Income Gradient: Forest Green (Atelier) */}
                  <linearGradient
                    id="netIncomeGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={chartColorVars["--atelier-ink-positive"]}
                      stopOpacity={0.7}
                    />
                    <stop
                      offset="100%"
                      stopColor={chartColorVars["--atelier-ink-positive"]}
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={chartColors.grid}
                  opacity={0.3}
                />

                <XAxis
                  dataKey="year"
                  stroke={chartColors.axis}
                  tick={{ fill: chartColors.axis, fontSize: 12 }}
                  tickLine={{ stroke: chartColors.axis }}
                />

                <YAxis
                  stroke={chartColors.axis}
                  tick={{ fill: chartColors.axis, fontSize: 12 }}
                  tickLine={{ stroke: chartColors.axis }}
                  tickFormatter={(value) =>
                    `${(value / 1_000_000).toFixed(0)}M`
                  }
                />

                <Tooltip content={<CustomTooltip />} />

                {/* Phase Indicators */}
                <ReferenceLine
                  x={2024}
                  stroke={chartColorVars["--atelier-stone-500"]}
                  strokeDasharray="5 5"
                  strokeWidth={1}
                  opacity={0.5}
                >
                  <Label
                    value="Historical"
                    position="insideTopLeft"
                    fill={chartColors.axis}
                    fontSize={11}
                    offset={10}
                  />
                </ReferenceLine>

                <ReferenceLine
                  x={2027}
                  stroke={chartColorVars["--atelier-stone-500"]}
                  strokeDasharray="5 5"
                  strokeWidth={1}
                  opacity={0.5}
                >
                  <Label
                    value="Transition"
                    position="insideTopRight"
                    fill={chartColors.axis}
                    fontSize={11}
                    offset={10}
                  />
                </ReferenceLine>

                <ReferenceLine
                  x={2028}
                  stroke={chartColorVars["--atelier-chart-proposal-a"]}
                  strokeWidth={2}
                  opacity={0.8}
                >
                  <Label
                    value="Contract Start"
                    position="top"
                    fill={chartColorVars["--atelier-chart-proposal-a"]}
                    fontSize={12}
                    fontWeight="bold"
                    offset={15}
                  />
                </ReferenceLine>

                <ReferenceLine
                  x={contractEndYear}
                  stroke={chartColorVars["--atelier-chart-proposal-a"]}
                  strokeWidth={2}
                  opacity={0.8}
                >
                  <Label
                    value="Contract End"
                    position="top"
                    fill={chartColorVars["--atelier-chart-proposal-a"]}
                    fontSize={12}
                    fontWeight="bold"
                    offset={15}
                  />
                </ReferenceLine>

                {/* Area Layers */}
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={chartColorVars["--atelier-chart-proposal-a"]}
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                  animationDuration={chartAnimationDurations.waterfall}
                />

                <Area
                  type="monotone"
                  dataKey="costs"
                  stroke={chartColorVars["--atelier-ink-negative"]}
                  strokeWidth={2}
                  fill="url(#costsGradient)"
                  animationDuration={chartAnimationDurations.waterfall}
                />

                <Area
                  type="monotone"
                  dataKey="netIncome"
                  stroke={chartColorVars["--atelier-ink-positive"]}
                  strokeWidth={2}
                  fill="url(#netIncomeGradient)"
                  animationDuration={chartAnimationDurations.waterfall}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    );
  },
);
