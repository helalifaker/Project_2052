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
import { Wallet, TrendingUp, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { formatMillions } from "@/lib/utils/financial";
import { chartColors } from "@/lib/design-tokens/chart-colors";
import { getGridProps, chartAnimation } from "@/lib/design-tokens/chart-config";

type DataPoint = {
  year: number;
  cash: number;
  operatingCF: number;
  investingCF: number;
  financingCF: number;
};

type ProposalCashFlowChartProps = {
  data: DataPoint[];
  contractEndYear: number;
  height?: number;
};

// Custom tooltip
const CashFlowTooltip = ({
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

  // Determine health zone
  let healthZone = "Healthy";
  let healthColor = "text-emerald-600";
  if (cash < dangerThreshold) {
    healthZone = "Danger";
    healthColor = "text-rose-600";
  } else if (cash < cautionThreshold) {
    healthZone = "Caution";
    healthColor = "text-amber-600";
  }

  return (
    <div className="bg-background/95 backdrop-blur-md border border-border/50 rounded-lg shadow-xl p-4 space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div className="font-semibold text-lg">{year}</div>
        <div className={`text-xs px-2 py-1 rounded-full bg-primary/10 ${healthColor} font-semibold`}>
          {healthZone}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-blue-600" />
            <span className="font-semibold">Cash Position</span>
          </div>
          <span className="font-mono font-bold text-blue-600">{formatMillions(cash)}</span>
        </div>

        <div className="h-px bg-border my-2"></div>

        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <ArrowUpCircle className="h-3 w-3 text-emerald-600" />
            <span className="text-muted-foreground text-xs">Operating CF</span>
          </div>
          <span className={`font-mono text-xs ${operatingCF >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {formatMillions(operatingCF)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <ArrowDownCircle className="h-3 w-3 text-rose-600" />
            <span className="text-muted-foreground text-xs">Investing CF</span>
          </div>
          <span className={`font-mono text-xs ${investingCF >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {formatMillions(investingCF)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3 w-3 text-violet-600" />
            <span className="text-muted-foreground text-xs">Financing CF</span>
          </div>
          <span className={`font-mono text-xs ${financingCF >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {formatMillions(financingCF)}
          </span>
        </div>
      </div>
    </div>
  );
};

export function ProposalCashFlowChart({
  data,
  contractEndYear,
  height = 350,
}: ProposalCashFlowChartProps) {
  const [viewMode, setViewMode] = useState<"cumulative" | "components">("cumulative");

  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          No cash flow data available
        </div>
      </Card>
    );
  }

  // Calculate health zones
  const avgCash = data.reduce((sum, d) => sum + d.cash, 0) / data.length;
  const dangerThreshold = avgCash * 0.3;
  const cautionThreshold = avgCash * 0.7;

  // Find key milestones
  const lowestCashYear = data.reduce((prev, current) =>
    current.cash < prev.cash ? current : prev
  ).year;

  const highestCashYear = data.reduce((prev, current) =>
    current.cash > prev.cash ? current : prev
  ).year;

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Wallet className="h-5 w-5 text-blue-600" />
              Cash Flow Analysis
            </h3>
            <p className="text-xs text-muted-foreground">
              Cash position and flows (2023-{contractEndYear})
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1.5">
            <Button
              variant={viewMode === "cumulative" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("cumulative")}
              className="h-8 text-xs"
            >
              Cumulative
            </Button>
            <Button
              variant={viewMode === "components" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("components")}
              className="h-8 text-xs"
            >
              Components
            </Button>
          </div>
        </div>

        {/* Key Insights */}
        <div className="grid grid-cols-2 gap-3 bg-muted/30 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-rose-500/10 flex items-center justify-center">
              <ArrowDownCircle className="h-4 w-4 text-rose-600" />
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground">Lowest Cash</div>
              <div className="text-sm font-semibold">{lowestCashYear}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground">Peak Cash</div>
              <div className="text-sm font-semibold">{highestCashYear}</div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div style={{ height: `${height}px` }}>
          {viewMode === "cumulative" ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 40 }}>
                <defs>
                  <linearGradient id="cashGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartColors.neutral} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={chartColors.neutral} stopOpacity={0.1} />
                  </linearGradient>
                </defs>

                <CartesianGrid {...getGridProps()} />

                <XAxis
                  dataKey="year"
                  stroke="#6b7280"
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  tickLine={{ stroke: "#6b7280" }}
                />

                <YAxis
                  stroke="#6b7280"
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  tickLine={{ stroke: "#6b7280" }}
                  tickFormatter={(value) => `${(value / 1_000_000).toFixed(0)}M`}
                />

                <Tooltip
                  content={
                    <CashFlowTooltip
                      dangerThreshold={dangerThreshold}
                      cautionThreshold={cautionThreshold}
                      data={data}
                    />
                  }
                />

                {/* Health Zone Lines */}
                <ReferenceLine
                  y={dangerThreshold}
                  stroke="#f43f5e"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                  opacity={0.5}
                >
                  <Label
                    value="Danger Zone"
                    position="insideTopLeft"
                    fill="#f43f5e"
                    fontSize={9}
                  />
                </ReferenceLine>

                <ReferenceLine
                  y={cautionThreshold}
                  stroke="#f59e0b"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                  opacity={0.5}
                >
                  <Label
                    value="Caution"
                    position="insideTopLeft"
                    fill="#f59e0b"
                    fontSize={9}
                  />
                </ReferenceLine>

                {/* Contract Markers */}
                <ReferenceLine
                  x={2028}
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  opacity={0.4}
                />

                <ReferenceLine
                  x={contractEndYear}
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  opacity={0.4}
                />

                <Area
                  type="monotone"
                  dataKey="cash"
                  stroke={chartColors.neutral}
                  strokeWidth={3}
                  fill="url(#cashGradient)"
                  animationDuration={chartAnimation.duration}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 40 }}>
                <CartesianGrid {...getGridProps()} />

                <XAxis
                  dataKey="year"
                  stroke="#6b7280"
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  tickLine={{ stroke: "#6b7280" }}
                />

                <YAxis
                  stroke="#6b7280"
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  tickLine={{ stroke: "#6b7280" }}
                  tickFormatter={(value) => `${(value / 1_000_000).toFixed(0)}M`}
                />

                <Tooltip
                  content={
                    <CashFlowTooltip
                      dangerThreshold={dangerThreshold}
                      cautionThreshold={cautionThreshold}
                      data={data}
                    />
                  }
                />

                <Legend
                  wrapperStyle={{ paddingTop: "15px", fontSize: "11px" }}
                  iconType="circle"
                />

                <ReferenceLine y={0} stroke="#6b7280" strokeWidth={1} />

                <Bar
                  dataKey="operatingCF"
                  fill={chartColors.positive}
                  name="Operating CF"
                  animationDuration={chartAnimation.duration}
                />
                <Bar
                  dataKey="investingCF"
                  fill={chartColors.negative}
                  name="Investing CF"
                  animationDuration={chartAnimation.duration}
                />
                <Bar
                  dataKey="financingCF"
                  fill={chartColors.series[3]}
                  name="Financing CF"
                  animationDuration={chartAnimation.duration}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </Card>
  );
}
