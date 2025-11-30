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
        <div className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
          {phase}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-gradient-to-r from-blue-500 to-violet-500"></div>
            <span className="text-muted-foreground">Revenue</span>
          </div>
          <span className="font-mono font-semibold">
            {formatMillions(revenue)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-gradient-to-r from-rose-500 to-rose-600"></div>
            <span className="text-muted-foreground">Costs</span>
          </div>
          <span className="font-mono font-semibold">
            {formatMillions(costs)}
          </span>
        </div>

        <div className="h-px bg-border my-2"></div>

        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"></div>
            <span className="font-semibold">Net Income</span>
          </div>
          <span
            className={`font-mono font-bold ${netIncome >= 0 ? "text-emerald-600" : "text-rose-600"}`}
          >
            {formatMillions(netIncome)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-8 text-xs">
          <span className="text-muted-foreground">Profit Margin</span>
          <span
            className={`font-mono ${parseFloat(margin) >= 0 ? "text-emerald-600" : "text-rose-600"}`}
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
                <TrendingUp className="h-5 w-5 text-emerald-600" />
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
                <div className="h-3 w-8 rounded-full bg-gradient-to-r from-blue-500 to-violet-500"></div>
                <span>Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-8 rounded-full bg-gradient-to-r from-rose-500 to-rose-600"></div>
                <span>Costs</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-8 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"></div>
                <span>Net Income</span>
              </div>
            </div>
          </div>

          {/* Key Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-muted/30 rounded-lg p-4">
            {breakevenYear && (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
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
              <div className="h-10 w-10 rounded-full bg-violet-500/10 flex items-center justify-center">
                <Milestone className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">
                  Peak Profitability
                </div>
                <div className="font-semibold">{peakProfitYear}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-blue-600" />
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
                  {/* Revenue Gradient: Blue → Violet */}
                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1} />
                  </linearGradient>

                  {/* Costs Gradient: Rose */}
                  <linearGradient
                    id="costsGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.6} />
                    <stop
                      offset="100%"
                      stopColor="#f43f5e"
                      stopOpacity={0.05}
                    />
                  </linearGradient>

                  {/* Net Income Gradient: Emerald */}
                  <linearGradient
                    id="netIncomeGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.7} />
                    <stop
                      offset="100%"
                      stopColor="#10b981"
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  opacity={0.3}
                />

                <XAxis
                  dataKey="year"
                  stroke="#6b7280"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  tickLine={{ stroke: "#6b7280" }}
                />

                <YAxis
                  stroke="#6b7280"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  tickLine={{ stroke: "#6b7280" }}
                  tickFormatter={(value) =>
                    `${(value / 1_000_000).toFixed(0)}M`
                  }
                />

                <Tooltip content={<CustomTooltip />} />

                {/* Phase Indicators */}
                <ReferenceLine
                  x={2024}
                  stroke="#9ca3af"
                  strokeDasharray="5 5"
                  strokeWidth={1}
                  opacity={0.5}
                >
                  <Label
                    value="Historical"
                    position="insideTopLeft"
                    fill="#6b7280"
                    fontSize={11}
                    offset={10}
                  />
                </ReferenceLine>

                <ReferenceLine
                  x={2027}
                  stroke="#9ca3af"
                  strokeDasharray="5 5"
                  strokeWidth={1}
                  opacity={0.5}
                >
                  <Label
                    value="Transition"
                    position="insideTopRight"
                    fill="#6b7280"
                    fontSize={11}
                    offset={10}
                  />
                </ReferenceLine>

                <ReferenceLine
                  x={2028}
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  opacity={0.8}
                >
                  <Label
                    value="Contract Start"
                    position="top"
                    fill="#8b5cf6"
                    fontSize={12}
                    fontWeight="bold"
                    offset={15}
                  />
                </ReferenceLine>

                <ReferenceLine
                  x={contractEndYear}
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  opacity={0.8}
                >
                  <Label
                    value="Contract End"
                    position="top"
                    fill="#8b5cf6"
                    fontSize={12}
                    fontWeight="bold"
                    offset={15}
                  />
                </ReferenceLine>

                {/* Area Layers */}
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                  animationDuration={1500}
                />

                <Area
                  type="monotone"
                  dataKey="costs"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fill="url(#costsGradient)"
                  animationDuration={1500}
                />

                <Area
                  type="monotone"
                  dataKey="netIncome"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#netIncomeGradient)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    );
  },
);
