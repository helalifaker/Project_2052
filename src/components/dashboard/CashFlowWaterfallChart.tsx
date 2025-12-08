"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Label,
  Legend,
} from "recharts";
import {
  Wallet,
  TrendingUp,
  ArrowDownCircle,
  ArrowUpCircle,
  Flag,
} from "lucide-react";
import { formatMillions } from "@/lib/utils/financial";
import { chartColors, chartColorVars } from "@/lib/design-tokens/chart-colors";
import { chartAnimationDurations } from "@/lib/design-tokens/chart-config";

type DataPoint = {
  year: number;
  cash: number;
  operatingCF: number;
  investingCF: number;
  financingCF: number;
};

type CashFlowWaterfallChartProps = {
  data: DataPoint[];
  contractEndYear: number;
};

// Custom tooltip with cash flow analysis
const CashFlowCustomTooltip = ({
  active,
  payload,
  label,
  dangerThreshold,
  cautionThreshold,
  data,
}: {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number }>;
  label?: number;
  dangerThreshold: number;
  cautionThreshold: number;
  data: DataPoint[];
}) => {
  if (!active || !payload || !payload.length) return null;

  const year = label;
  const point = data.find((d) => d.year === year);
  if (!point) return null;

  const { cash, operatingCF, investingCF, financingCF } = point;

  // Determine health zone with Atelier colors
  let healthZone = "Healthy";
  let healthColor: string = chartColorVars["--atelier-ink-positive"];
  if (cash < dangerThreshold) {
    healthZone = "Danger";
    healthColor = chartColorVars["--atelier-ink-negative"];
  } else if (cash < cautionThreshold) {
    healthZone = "Caution";
    healthColor = chartColorVars["--atelier-ink-warning"];
  }

  return (
    <div className="bg-background/95 backdrop-blur-md border border-border/50 rounded-lg shadow-xl p-4 space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div className="font-semibold text-lg">{year}</div>
        <div
          className="text-xs px-2 py-1 rounded-full bg-primary/10 font-semibold"
          style={{ color: healthColor }}
        >
          {healthZone}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <Wallet
              className="h-4 w-4"
              style={{ color: chartColorVars["--atelier-chart-proposal-b"] }}
            />
            <span className="font-semibold">Cash Position</span>
          </div>
          <span
            className="font-mono font-bold"
            style={{ color: chartColorVars["--atelier-chart-proposal-b"] }}
          >
            {formatMillions(cash)}
          </span>
        </div>

        <div className="h-px bg-border my-2"></div>

        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <ArrowUpCircle
              className="h-3 w-3"
              style={{ color: chartColorVars["--atelier-ink-positive"] }}
            />
            <span className="text-muted-foreground">Operating CF</span>
          </div>
          <span
            className="font-mono text-xs"
            style={{
              color:
                operatingCF >= 0
                  ? chartColorVars["--atelier-ink-positive"]
                  : chartColorVars["--atelier-ink-negative"],
            }}
          >
            {formatMillions(operatingCF)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <ArrowDownCircle
              className="h-3 w-3"
              style={{ color: chartColorVars["--atelier-ink-negative"] }}
            />
            <span className="text-muted-foreground">Investing CF</span>
          </div>
          <span
            className="font-mono text-xs"
            style={{
              color:
                investingCF >= 0
                  ? chartColorVars["--atelier-ink-positive"]
                  : chartColorVars["--atelier-ink-negative"],
            }}
          >
            {formatMillions(investingCF)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <TrendingUp
              className="h-3 w-3"
              style={{ color: chartColorVars["--atelier-chart-proposal-a"] }}
            />
            <span className="text-muted-foreground">Financing CF</span>
          </div>
          <span
            className="font-mono text-xs"
            style={{
              color:
                financingCF >= 0
                  ? chartColorVars["--atelier-ink-positive"]
                  : chartColorVars["--atelier-ink-negative"],
            }}
          >
            {formatMillions(financingCF)}
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * The Cash Flow Story - Advanced Waterfall/Area Chart
 *
 * Visual Storytelling Features:
 * - Toggle between cumulative area and component waterfall views
 * - Health zones (danger/caution/healthy) for cash position
 * - Component breakdown (Operating/Investing/Financing)
 * - Milestone markers for critical cash events
 * - Glass-morphism tooltips with detailed analysis
 */
export function CashFlowWaterfallChart({
  data,
  contractEndYear,
}: CashFlowWaterfallChartProps) {
  const [viewMode, setViewMode] = useState<"cumulative" | "components">(
    "cumulative",
  );

  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          No cash flow data available
        </div>
      </Card>
    );
  }

  // Calculate health zones based on cash position
  const avgCash = data.reduce((sum, d) => sum + d.cash, 0) / data.length;
  const dangerThreshold = avgCash * 0.3; // Below 30% of average is danger
  const cautionThreshold = avgCash * 0.7; // 30-70% is caution

  // Find key milestones
  const lowestCashYear = data.reduce((prev, current) =>
    current.cash < prev.cash ? current : prev,
  ).year;

  const highestCashYear = data.reduce((prev, current) =>
    current.cash > prev.cash ? current : prev,
  ).year;

  // Find first year with positive cash
  const firstPositiveCashYear = data.find((d) => d.cash > 0)?.year;

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Wallet
                className="h-5 w-5"
                style={{ color: chartColorVars["--atelier-chart-proposal-b"] }}
              />
              The Cash Flow Story
            </h3>
            <p className="text-sm text-muted-foreground">
              Cash position and component cash flows across all periods (2023-
              {contractEndYear})
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "cumulative" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("cumulative")}
            >
              Cumulative
            </Button>
            <Button
              variant={viewMode === "components" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("components")}
            >
              Components
            </Button>
          </div>
        </div>

        {/* Key Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-muted/30 rounded-lg p-4">
          {firstPositiveCashYear && (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[var(--atelier-ink-positive)]/10 flex items-center justify-center">
                <TrendingUp
                  className="h-5 w-5"
                  style={{ color: chartColorVars["--atelier-ink-positive"] }}
                />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">
                  First Positive Cash
                </div>
                <div className="font-semibold">{firstPositiveCashYear}</div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[var(--atelier-ink-negative)]/10 flex items-center justify-center">
              <ArrowDownCircle
                className="h-5 w-5"
                style={{ color: chartColorVars["--atelier-ink-negative"] }}
              />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">
                Lowest Cash Year
              </div>
              <div className="font-semibold">{lowestCashYear}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[var(--atelier-chart-proposal-b)]/10 flex items-center justify-center">
              <Flag
                className="h-5 w-5"
                style={{ color: chartColorVars["--atelier-chart-proposal-b"] }}
              />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">
                Peak Cash Year
              </div>
              <div className="font-semibold">{highestCashYear}</div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[500px]">
          {viewMode === "cumulative" ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 30, left: 20, bottom: 60 }}
              >
                <defs>
                  {/* Cash Gradient: Ocean Teal (Atelier) */}
                  <linearGradient id="cashGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={chartColorVars["--atelier-chart-proposal-b"]}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="100%"
                      stopColor={chartColorVars["--atelier-chart-proposal-b"]}
                      stopOpacity={0.1}
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

                <Tooltip
                  content={
                    <CashFlowCustomTooltip
                      dangerThreshold={dangerThreshold}
                      cautionThreshold={cautionThreshold}
                      data={data}
                    />
                  }
                />

                {/* Health Zone Indicators */}
                <ReferenceLine
                  y={dangerThreshold}
                  stroke={chartColorVars["--atelier-ink-negative"]}
                  strokeDasharray="3 3"
                  strokeWidth={1}
                  opacity={0.5}
                >
                  <Label
                    value="Danger Zone"
                    position="insideTopLeft"
                    fill={chartColorVars["--atelier-ink-negative"]}
                    fontSize={10}
                  />
                </ReferenceLine>

                <ReferenceLine
                  y={cautionThreshold}
                  stroke={chartColorVars["--atelier-ink-warning"]}
                  strokeDasharray="3 3"
                  strokeWidth={1}
                  opacity={0.5}
                >
                  <Label
                    value="Caution Zone"
                    position="insideTopLeft"
                    fill={chartColorVars["--atelier-ink-warning"]}
                    fontSize={10}
                  />
                </ReferenceLine>

                {/* Contract Period Markers */}
                <ReferenceLine
                  x={2028}
                  stroke={chartColorVars["--atelier-chart-proposal-a"]}
                  strokeWidth={2}
                  opacity={0.5}
                >
                  <Label
                    value="Contract Start"
                    position="top"
                    fill={chartColorVars["--atelier-chart-proposal-a"]}
                    fontSize={11}
                    offset={10}
                  />
                </ReferenceLine>

                <ReferenceLine
                  x={contractEndYear}
                  stroke={chartColorVars["--atelier-chart-proposal-a"]}
                  strokeWidth={2}
                  opacity={0.5}
                >
                  <Label
                    value="Contract End"
                    position="top"
                    fill={chartColorVars["--atelier-chart-proposal-a"]}
                    fontSize={11}
                    offset={10}
                  />
                </ReferenceLine>

                {/* Cash Area */}
                <Area
                  type="monotone"
                  dataKey="cash"
                  stroke={chartColorVars["--atelier-chart-proposal-b"]}
                  strokeWidth={3}
                  fill="url(#cashGradient)"
                  animationDuration={chartAnimationDurations.waterfall}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 10, right: 30, left: 20, bottom: 60 }}
              >
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

                <Tooltip
                  content={
                    <CashFlowCustomTooltip
                      dangerThreshold={dangerThreshold}
                      cautionThreshold={cautionThreshold}
                      data={data}
                    />
                  }
                />

                <Legend
                  wrapperStyle={{ paddingTop: "20px" }}
                  iconType="circle"
                />

                {/* Zero Line */}
                <ReferenceLine
                  y={0}
                  stroke={chartColors.axis}
                  strokeWidth={1}
                />

                {/* Contract Period Markers */}
                <ReferenceLine
                  x={2028}
                  stroke={chartColorVars["--atelier-chart-proposal-a"]}
                  strokeWidth={2}
                  opacity={0.5}
                />

                <ReferenceLine
                  x={contractEndYear}
                  stroke={chartColorVars["--atelier-chart-proposal-a"]}
                  strokeWidth={2}
                  opacity={0.5}
                />

                {/* Cash Flow Components */}
                <Bar
                  dataKey="operatingCF"
                  fill={chartColorVars["--atelier-ink-positive"]}
                  name="Operating CF"
                  animationDuration={chartAnimationDurations.waterfall}
                />
                <Bar
                  dataKey="investingCF"
                  fill={chartColorVars["--atelier-ink-negative"]}
                  name="Investing CF"
                  animationDuration={chartAnimationDurations.waterfall}
                />
                <Bar
                  dataKey="financingCF"
                  fill={chartColorVars["--atelier-chart-proposal-a"]}
                  name="Financing CF"
                  animationDuration={chartAnimationDurations.waterfall}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </Card>
  );
}
