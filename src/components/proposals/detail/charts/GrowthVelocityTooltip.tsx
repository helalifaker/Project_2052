"use client";

import { type TooltipProps } from "recharts";
import { formatMillions } from "@/lib/utils/financial";
import { cn } from "@/lib/utils";

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
    <div className="bg-white border-2 border-stone-200 rounded-xl p-4 shadow-2xl min-w-[280px]">
      {/* Year Header */}
      <div className="text-sm font-semibold text-stone-900 mb-3 pb-2 border-b border-stone-200">
        Year: {data.year}
      </div>

      {/* Revenue Block */}
      <div className="space-y-1 mb-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-stone-600">Revenue</span>
          <span className="text-sm font-bold text-[#c9a86c] tabular-nums">
            {data.revenueM.toFixed(1)}M
          </span>
        </div>
        {data.revenueYoY !== null && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500">YoY Growth</span>
            <span
              className={cn(
                "text-xs font-semibold tabular-nums",
                data.revenueYoY > 0 ? "text-[#2d7a4f]" : "text-[#b84233]",
              )}
            >
              {data.revenueYoY > 0 ? "+" : ""}
              {data.revenueYoY.toFixed(1)}%
              {data.revenueYoY > 10
                ? " ↑"
                : data.revenueYoY > 5
                  ? " ↗"
                  : ""}
            </span>
          </div>
        )}
      </div>

      {/* Net Profit Block */}
      <div className="space-y-1 mb-3 pb-3 border-b border-stone-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-stone-600">Net Profit</span>
          <span className="text-sm font-bold text-[#2d7a4f] tabular-nums">
            {data.netProfitM.toFixed(1)}M
          </span>
        </div>
        {data.netProfitYoY !== null && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500">YoY Growth</span>
            <span
              className={cn(
                "text-xs font-semibold tabular-nums",
                data.netProfitYoY > 0 ? "text-[#2d7a4f]" : "text-[#b84233]",
              )}
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
          <span className="text-xs font-medium text-stone-600">
            Profit Margin
          </span>
          <span className="text-sm font-bold text-[#4a7c96] tabular-nums">
            {data.profitMargin.toFixed(1)}%
          </span>
        </div>

        {data.growthDifferential !== null && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-500">Growth Winner</span>
              <span className="text-xs font-semibold text-stone-900">
                {data.growthDifferential > 0 ? "Net Profit" : "Revenue"}
              </span>
            </div>

            <div
              className={cn(
                "flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold",
                isMarginExpanding
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700",
              )}
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
