"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  LabelList,
} from "recharts";
import { formatMillions } from "@/lib/utils/financial";
import { TrendingUp, Award, Target } from "lucide-react";
import { chartColors } from "@/lib/design-tokens/chart-colors";
import { getAxisProps, getGridProps } from "@/lib/design-tokens/chart-config";

interface NAVComparisonData {
  proposalId: string;
  proposalName: string;
  developer: string;
  nav: number;
  navPercentile: number;
  isWinner: boolean;
}

interface NAVComparisonChartProps {
  data: NAVComparisonData[];
}

/**
 * Custom Tooltip for NAV Comparison Chart
 */
interface NAVTooltipPayload {
  name: string;
  developer: string;
  nav: number;
  navRaw: number;
  rank: number;
}

interface NAVTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: NAVTooltipPayload }>;
  sortedDataLength?: number;
}

function NAVCustomTooltip({
  active,
  payload,
  sortedDataLength = 0,
}: NAVTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isPositive = data.nav > 0;

    return (
      <div className="bg-background/98 backdrop-blur-md border-2 border-border rounded-xl p-4 shadow-2xl min-w-[280px]">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <p className="font-bold text-base mb-1">{data.name}</p>
            <p className="text-xs text-muted-foreground">{data.developer}</p>
          </div>
          {data.rank === 1 && (
            <Award className="w-6 h-6 text-amber-500 flex-shrink-0" />
          )}
        </div>

        <div className="space-y-3">
          {/* NAV Value */}
          <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
            <p className="text-xs text-muted-foreground mb-1">
              Net Annualized Value
            </p>
            <p
              className="text-2xl font-bold tabular-nums"
              style={{
                color: isPositive ? chartColors.positive : chartColors.negative,
              }}
            >
              {formatMillions(data.navRaw)}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                /year
              </span>
            </p>
          </div>

          {/* Rank Badge */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Rank</span>
            <span className="font-semibold">
              #{data.rank} of {sortedDataLength}
            </span>
          </div>

          {/* Status */}
          <div
            className="text-xs py-2 px-3 rounded-lg text-center font-medium"
            style={{
              backgroundColor: isPositive
                ? `${chartColors.positive.replace("hsl(", "hsl(").replace(")", " / 0.15)")}`
                : `${chartColors.negative.replace("hsl(", "hsl(").replace(")", " / 0.15)")}`,
              color: isPositive ? chartColors.positive : chartColors.negative,
            }}
          >
            {isPositive ? "✓ Value Creating" : "⚠ Value Destroying"}
          </div>

          {data.rank === 1 && (
            <div className="border-t border-border pt-3 mt-3">
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-2">
                <Award className="w-4 h-4" />
                Highest Value Proposal
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
}

/**
 * NAV Comparison Chart - Executive Decision Support
 *
 * Net Annualized Value (NAV) = Annual EBITDA - Annual Rent
 * This is THE KEY METRIC for comparing proposals with different contract lengths
 *
 * A horizontal bar chart with dramatic visual hierarchy showing which proposal
 * delivers the most value per year over the contract period
 */
export function NAVComparisonChart({ data }: NAVComparisonChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
        <Target className="w-12 h-12 mb-3 opacity-20" />
        <p>No NAV data available</p>
        <p className="text-xs mt-1">
          Calculate proposals to see NAV comparison
        </p>
      </div>
    );
  }

  // Sort by NAV descending and limit to top 6 for visual clarity
  const sortedData = [...data].sort((a, b) => b.nav - a.nav).slice(0, 6);

  // Transform data for display (convert to millions)
  const chartData = sortedData.map((item, index) => ({
    name: item.proposalName,
    developer: item.developer,
    nav: item.nav / 1_000_000,
    navRaw: item.nav,
    isWinner: item.isWinner,
    rank: index + 1,
    percentile: item.navPercentile,
  }));

  // Calculate insights
  const winner = sortedData[0];
  const secondBest = sortedData[1];
  const avgNAV =
    sortedData.reduce((sum, d) => sum + d.nav, 0) / sortedData.length;
  const range = winner.nav - sortedData[sortedData.length - 1].nav;
  const positiveCount = sortedData.filter((d) => d.nav > 0).length;
  const leadMargin = secondBest
    ? ((winner.nav - secondBest.nav) / winner.nav) * 100
    : 0;

  // Determine color based on NAV value and rank
  const getBarColor = (item: (typeof chartData)[0]) => {
    if (item.rank === 1) {
      // Winner: Gold (Solid for better visibility)
      return chartColors.warning; // amber
    } else if (item.rank === 2) {
      // Second: Silver (Solid)
      return chartColors.axis; // slate-400
    } else if (item.nav > 0) {
      // Positive: Green
      return chartColors.positive;
    } else {
      // Negative: Red
      return chartColors.negative;
    }
  };

  return (
    <div className="space-y-5">
      {/* Hero Metric - Winner Spotlight */}
      <div className="relative overflow-hidden rounded-xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-amber-500/20 border-2 border-amber-500/40">
              <Award className="w-7 h-7 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Best Value Proposal
              </p>
              <p className="text-xl font-bold mb-1">{winner.proposalName}</p>
              <p className="text-sm text-muted-foreground">
                {winner.developer}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-1">NAV per Year</p>
            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
              {formatMillions(winner.nav)}
            </p>
            {secondBest && leadMargin > 0 && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                +{leadMargin.toFixed(1)}% ahead of 2nd place
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[380px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 80, left: 130, bottom: 10 }}
          >
            <defs>
              {/* Gradients removed for better visibility as requested */}
            </defs>

            <CartesianGrid
              {...getGridProps({ horizontal: true, vertical: false })}
            />
            <XAxis
              {...getAxisProps("x")}
              type="number"
              label={{
                value: "Net Annualized Value (SAR Millions/Year)",
                position: "insideBottom",
                offset: -5,
                style: {
                  fontSize: 13,
                  fontWeight: 600,
                  fill: "hsl(var(--foreground))",
                },
              }}
            />
            <YAxis
              {...getAxisProps("y")}
              type="category"
              dataKey="name"
              width={120}
            />
            <Tooltip
              content={
                <NAVCustomTooltip sortedDataLength={sortedData.length} />
              }
              cursor={{ fill: "hsl(var(--muted) / 0.15)" }}
            />
            <ReferenceLine
              x={0}
              stroke={chartColors.axis}
              strokeDasharray="5 5"
              strokeWidth={2}
            />
            <Bar dataKey="nav" radius={[0, 6, 6, 0]} barSize={32}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getBarColor(entry)}
                  opacity={
                    entry.rank === 1 ? 1 : entry.rank === 2 ? 0.95 : 0.85
                  }
                  stroke={entry.rank <= 2 ? "hsl(var(--border))" : "none"}
                  strokeWidth={entry.rank <= 2 ? 2 : 0}
                />
              ))}
              <LabelList
                dataKey="nav"
                position="right"
                formatter={(value) => {
                  if (value === undefined || value === null || value === false)
                    return "";
                  const num =
                    typeof value === "number"
                      ? value
                      : parseFloat(String(value));
                  return `${num.toFixed(1)}M`;
                }}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  fill: "hsl(var(--foreground))",
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-4 gap-3">
        <div className="text-center p-4 bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-lg border border-amber-500/30">
          <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground mb-1">Winner</p>
          <p className="text-sm font-bold truncate" title={winner.proposalName}>
            {winner.proposalName}
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 tabular-nums font-semibold">
            {formatMillions(winner.nav)}/yr
          </p>
        </div>

        <div className="text-center p-4 bg-muted/20 rounded-lg border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Average NAV</p>
          <p className="text-sm font-semibold">All Proposals</p>
          <p className="text-xs text-muted-foreground mt-1 tabular-nums">
            {formatMillions(avgNAV)}/yr
          </p>
        </div>

        <div className="text-center p-4 bg-muted/20 rounded-lg border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Value Spread</p>
          <p className="text-sm font-semibold">Range</p>
          <p className="text-xs text-muted-foreground mt-1 tabular-nums">
            {formatMillions(range)}/yr
          </p>
        </div>

        <div className="text-center p-4 bg-muted/20 rounded-lg border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Value Creating</p>
          <p className="text-sm font-semibold">
            {positiveCount} of {sortedData.length}
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            {((positiveCount / sortedData.length) * 100).toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Explanation Note */}
      <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3 border border-border/50">
        <p className="flex items-start gap-2">
          <span className="text-base flex-shrink-0">💡</span>
          <span>
            <strong className="text-foreground">
              NAV (Net Annualized Value)
            </strong>{" "}
            is the most important metric for comparing proposals with different
            contract lengths. It shows the net value created per year: higher is
            always better. Positive NAV means the proposal creates value;
            negative means it destroys value.
          </span>
        </p>
      </div>
    </div>
  );
}
