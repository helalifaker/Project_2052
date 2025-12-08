/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import { formatMillions } from "@/lib/utils/financial";
import {
  chartColors,
  getProposalColor,
} from "@/lib/design-tokens/chart-colors";
import {
  getAxisProps,
  getGridProps,
  chartSpacing,
} from "@/lib/design-tokens/chart-config";

interface CashFlowComparisonData {
  proposalId: string;
  proposalName: string;
  developer: string;
  data: Array<{ year: number; cumulative: number }>;
  breakevenYear: number | null;
  lowestCashYear: number;
  peakCashYear: number;
  finalCash: number;
  isWinner: boolean;
}

interface CashFlowComparisonChartProps {
  data: CashFlowComparisonData[];
}

// Custom tooltip with winner highlighting and health status
const CashFlowTooltip = ({
  active,
  payload,
  label,
  limitedData,
  cautionThreshold,
}: any) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg max-w-sm">
      <p className="font-semibold text-xs uppercase tracking-wider mb-2 pb-2 border-b border-border">
        Year {label}
      </p>
      <div className="space-y-1.5">
        {payload.map((entry: any, index: number) => {
          const value = entry.value;
          const proposalIndex = parseInt(entry.dataKey.replace("proposal", ""));
          const proposal = limitedData[proposalIndex];

          if (!proposal) return null;

          const isHealthy = value > cautionThreshold / 1_000_000;
          const isNegative = value < 0;

          return (
            <div
              key={index}
              className="flex justify-between items-center gap-4 text-xs"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="truncate max-w-[120px]">
                  {proposal.proposalName}
                </span>
                {proposal.isWinner && (
                  <span style={{ color: "var(--accent-gold)" }}>⭐</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="font-semibold tabular-nums"
                  style={{
                    color: isNegative
                      ? chartColors.negative
                      : isHealthy
                        ? chartColors.positive
                        : chartColors.warning,
                  }}
                >
                  SAR {formatMillions(value * 1_000_000)}
                </span>
                {isNegative && <span className="text-xs">⚠</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Cash Flow Comparison Chart
 *
 * Multi-line area chart comparing cumulative cash flow trajectories
 * Shows liquidity health zones and breakeven markers
 */
export function CashFlowComparisonChart({
  data,
}: CashFlowComparisonChartProps) {
  // Limit to 5 proposals (safe derivation)
  const limitedData = (data || []).slice(0, 5);

  // Transform data for Recharts (sample every 2 years)
  // Hook must run unconditionally
  const chartData = useMemo(() => {
    if (limitedData.length === 0) return [];

    // Get all unique years
    const years = limitedData[0]?.data.map((d) => d.year) || [];
    const sampledYears = years.filter((_, index) => index % 2 === 0);

    return sampledYears.map((year) => {
      const dataPoint: any = { year };

      limitedData.forEach((proposal, index) => {
        const yearData = proposal.data.find((d) => d.year === year);
        if (yearData) {
          dataPoint[`proposal${index}`] = yearData.cumulative / 1_000_000;
          dataPoint[`proposal${index}_name`] = proposal.proposalName;
          dataPoint[`proposal${index}_isWinner`] = proposal.isWinner;
        }
      });

      return dataPoint;
    });
  }, [limitedData]);

  // Early return if no data
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        No cash flow data available
      </div>
    );
  }

  // Calculate health zones
  const allCashValues = limitedData.flatMap((p) =>
    p.data.map((d) => d.cumulative),
  );
  const avgCash =
    allCashValues.reduce((a, b) => a + b, 0) / allCashValues.length;
  const cautionThreshold = avgCash * 0.3;

  // Find insights
  const negativeCashCount = limitedData.filter((p) =>
    p.data.some((d) => d.cumulative < 0),
  ).length;
  const earliestBreakeven = limitedData
    .filter((p) => p.breakevenYear !== null)
    .reduce(
      (min, p) => (p.breakevenYear! < min ? p.breakevenYear! : min),
      Infinity,
    );

  return (
    <div className="space-y-4">
      {/* Warning if negative cash detected */}
      {negativeCashCount > 0 && (
        <div
          className="text-xs rounded-lg p-3 border"
          style={{
            color: "var(--financial-warning)",
            backgroundColor: "var(--atelier-ink-warning-soft)",
            borderColor: "var(--financial-warning)",
          }}
        >
          <p className="flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <span>
              {negativeCashCount} proposal{negativeCashCount > 1 ? "s" : ""}{" "}
              experience negative cash flow periods. Review liquidity
              management.
            </span>
          </p>
        </div>
      )}

      {/* Chart */}
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={chartSpacing.margin}>
            <defs>
              {/* Area gradients for each proposal */}
              {limitedData.map((_, index) => {
                const color = getProposalColor(index);
                return (
                  <linearGradient
                    key={index}
                    id={`colorProposal${index}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.05} />
                  </linearGradient>
                );
              })}
            </defs>

            <CartesianGrid {...getGridProps()} />
            <XAxis {...getAxisProps("x")} dataKey="year" />
            <YAxis
              {...getAxisProps("y")}
              label={{
                value: "Cumulative Cash (SAR Millions)",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 12, fill: chartColors.axis },
              }}
            />
            <Tooltip
              content={
                <CashFlowTooltip
                  limitedData={limitedData}
                  cautionThreshold={cautionThreshold}
                />
              }
            />
            <Legend
              wrapperStyle={{ paddingTop: "10px" }}
              formatter={(value, _entry: unknown) => {
                const proposalIndex = value.replace("proposal", "");
                const proposal = limitedData[parseInt(proposalIndex)];
                if (!proposal) return value;

                return (
                  <span className="text-xs">
                    {proposal.proposalName}{" "}
                    {proposal.isWinner && (
                      <span style={{ color: "var(--accent-gold)" }}>⭐</span>
                    )}
                    <span className="text-muted-foreground ml-2">
                      ({formatMillions(proposal.finalCash)})
                    </span>
                  </span>
                );
              }}
            />

            {/* Breakeven reference line */}
            <ReferenceLine
              y={0}
              stroke={chartColors.axis}
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: "Breakeven",
                position: "insideTopRight",
                fill: chartColors.axis,
                fontSize: 11,
              }}
            />

            {/* Render areas for each proposal */}
            {limitedData.map((proposal, index) => (
              <Area
                key={index}
                type="monotone"
                dataKey={`proposal${index}`}
                stroke={getProposalColor(index)}
                strokeWidth={proposal.isWinner ? 3 : 2}
                fill={`url(#colorProposal${index})`}
                name={`proposal${index}`}
                dot={false}
                activeDot={{ r: 6 }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Insights Panel */}
      <div className="grid grid-cols-4 gap-3 pt-2">
        <div className="text-center p-3 bg-muted/20 rounded-lg border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">
            Earliest Breakeven
          </p>
          <p className="text-sm font-semibold">
            {earliestBreakeven !== Infinity ? earliestBreakeven : "N/A"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {earliestBreakeven !== Infinity ? "Years" : "—"}
          </p>
        </div>
        <div className="text-center p-3 bg-muted/20 rounded-lg border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Best Final Cash</p>
          <p className="text-sm font-semibold truncate">
            {limitedData.find((d) => d.isWinner)?.proposalName || "N/A"}
          </p>
          <p
            className="text-xs mt-1 tabular-nums font-medium"
            style={{ color: "var(--financial-positive)" }}
          >
            {limitedData.find((d) => d.isWinner)
              ? formatMillions(limitedData.find((d) => d.isWinner)!.finalCash)
              : "—"}
          </p>
        </div>
        <div className="text-center p-3 bg-muted/20 rounded-lg border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">
            Liquidity Warnings
          </p>
          <p className="text-sm font-semibold">{negativeCashCount} Proposals</p>
          <p className="text-xs text-muted-foreground mt-1">
            {negativeCashCount > 0 ? "Review Required" : "All Healthy"}
          </p>
        </div>
        <div className="text-center p-3 bg-muted/20 rounded-lg border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Comparing</p>
          <p className="text-sm font-semibold">
            {limitedData.length} Proposals
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {data.length > 5 && `(Top 5 of ${data.length})`}
          </p>
        </div>
      </div>
    </div>
  );
}
