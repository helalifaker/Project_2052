"use client";

import { type TooltipProps } from "recharts";

export interface TransformedDataPoint {
  year: number;
  revenueM: number;
  netProfitM: number;
  revenueYoY: number | null;
  netProfitYoY: number | null;
  growthDifferential: number | null;
  profitMargin: number;
  ribbonTop: number | null;
  ribbonBottom: number | null;
  ribbonColor: string;
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  payload?: Array<{
    payload: TransformedDataPoint;
    [key: string]: unknown;
  }>;
}

export const GrowthVelocityTooltip = ({
  active,
  payload,
}: CustomTooltipProps) => {
  if (!active || !payload?.[0]) return null;

  const data = payload[0].payload as TransformedDataPoint;
  const isMarginExpanding =
    data.growthDifferential !== null && data.growthDifferential > 0;

  return (
    <div className="bg-background border-2 border-border rounded-xl p-4 shadow-2xl min-w-[280px]">
      {/* Year Header */}
      <div className="text-sm font-semibold text-foreground mb-3 pb-2 border-b border-border">
        Year: {data.year}
      </div>

      {/* Revenue Block */}
      <div className="space-y-1 mb-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            Revenue
          </span>
          <span
            className="text-sm font-bold tabular-nums"
            style={{ color: "var(--accent-gold)" }}
          >
            {data.revenueM.toFixed(1)}M
          </span>
        </div>
        {data.revenueYoY !== null && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">YoY Growth</span>
            <span
              className="text-xs font-semibold tabular-nums"
              style={{
                color:
                  data.revenueYoY > 0
                    ? "var(--financial-positive)"
                    : "var(--financial-negative)",
              }}
            >
              {data.revenueYoY > 0 ? "+" : ""}
              {data.revenueYoY.toFixed(1)}%
              {data.revenueYoY > 10 ? " ↑" : data.revenueYoY > 5 ? " ↗" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Net Profit Block */}
      <div className="space-y-1 mb-3 pb-3 border-b border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            Net Profit
          </span>
          <span
            className="text-sm font-bold tabular-nums"
            style={{ color: "var(--financial-positive)" }}
          >
            {data.netProfitM.toFixed(1)}M
          </span>
        </div>
        {data.netProfitYoY !== null && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">YoY Growth</span>
            <span
              className="text-xs font-semibold tabular-nums"
              style={{
                color:
                  data.netProfitYoY > 0
                    ? "var(--financial-positive)"
                    : "var(--financial-negative)",
              }}
            >
              {data.netProfitYoY > 0 ? "+" : ""}
              {data.netProfitYoY.toFixed(1)}%
              {data.netProfitYoY > 15
                ? " ↑↑"
                : data.netProfitYoY > 10
                  ? " ↑"
                  : data.netProfitYoY > 5
                    ? " ↗"
                    : ""}
            </span>
          </div>
        )}
      </div>

      {/* Profitability Analysis */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            Profit Margin
          </span>
          <span
            className="text-sm font-bold tabular-nums"
            style={{ color: "var(--atelier-chart-proposal-b)" }}
          >
            {data.profitMargin.toFixed(1)}%
          </span>
        </div>

        {data.growthDifferential !== null && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Growth Winner
              </span>
              <span className="text-xs font-semibold text-foreground">
                {data.growthDifferential > 0 ? "Net Profit" : "Revenue"}
              </span>
            </div>

            <div
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold"
              style={{
                backgroundColor: isMarginExpanding
                  ? "var(--atelier-ink-positive-soft)"
                  : "var(--atelier-ink-warning-soft)",
                color: isMarginExpanding
                  ? "var(--financial-positive)"
                  : "var(--financial-warning)",
              }}
            >
              <span>{isMarginExpanding ? "✓" : "⚠"}</span>
              <span>
                Margin {isMarginExpanding ? "Expanding" : "Compressing"}
              </span>
              <span className="ml-auto tabular-nums">
                {isMarginExpanding ? "+" : ""}
                {data.growthDifferential.toFixed(1)}pp
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
