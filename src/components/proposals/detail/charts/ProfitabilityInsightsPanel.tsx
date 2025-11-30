"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  ReferenceLine,
} from "recharts";
import { cn } from "@/lib/utils";
import type { TransformedDataPoint } from "./GrowthVelocityTooltip";

interface ProfitabilityInsightsPanelProps {
  data: TransformedDataPoint[];
}

interface InsightData {
  revenueCagr: number;
  netProfitCagr: number;
  revenueTrend: "strong" | "moderate" | "weak";
  netProfitTrend: "strong" | "moderate" | "weak";
  startMargin: number;
  endMargin: number;
  avgMargin: number;
  peakMargin: number;
  peakYear: number;
  profitWinYears: number;
  profitWinRate: string;
  strongestPeriod: { label: string; change: number } | null;
  warningPeriod: { label: string; change: number } | null;
  breakEvenYear: number | null;
}

function calculateInsights(data: TransformedDataPoint[]): InsightData {
  const firstPoint = data[0];
  const lastPoint = data[data.length - 1];
  const years = data.length;

  // CAGR calculations
  const revenueCagr =
    (Math.pow(lastPoint.revenueM / firstPoint.revenueM, 1 / years) - 1) * 100;

  const netProfitCagr =
    (Math.pow(lastPoint.netProfitM / firstPoint.netProfitM, 1 / years) - 1) *
    100;

  // Margin analysis
  const margins = data.map((d) => d.profitMargin);
  const avgMargin = margins.reduce((a, b) => a + b, 0) / margins.length;
  const peakMargin = Math.max(...margins);
  const peakYear = data[margins.indexOf(peakMargin)].year;

  // Profit win rate
  const profitWinYears = data.filter(
    (d) => d.growthDifferential !== null && d.growthDifferential > 0,
  ).length;
  const profitWinRate = ((profitWinYears / years) * 100).toFixed(0);

  // Strongest growth period (5-year windows)
  let strongestPeriod: { label: string; change: number } | null = null;
  let maxMarginChange = 0;

  for (let i = 0; i <= data.length - 5; i++) {
    const windowChange = data[i + 4].profitMargin - data[i].profitMargin;
    if (windowChange > maxMarginChange) {
      maxMarginChange = windowChange;
      strongestPeriod = {
        label: `${data[i].year}-${data[i + 4].year}`,
        change: windowChange,
      };
    }
  }

  // Warning period (margin compression)
  let warningPeriod: { label: string; change: number } | null = null;
  let maxCompression = 0;

  for (let i = 0; i <= data.length - 3; i++) {
    const windowChange = data[i + 2].profitMargin - data[i].profitMargin;
    if (windowChange < maxCompression) {
      maxCompression = windowChange;
      warningPeriod = {
        label: `${data[i].year}-${data[i + 2].year}`,
        change: windowChange,
      };
    }
  }

  // Break-even year (first year of positive profit)
  const breakEvenYear = data.find((d) => d.netProfitM > 0)?.year || null;

  return {
    revenueCagr,
    netProfitCagr,
    revenueTrend: revenueCagr > 10 ? "strong" : revenueCagr > 5 ? "moderate" : "weak",
    netProfitTrend: netProfitCagr > 15 ? "strong" : netProfitCagr > 8 ? "moderate" : "weak",
    startMargin: firstPoint.profitMargin,
    endMargin: lastPoint.profitMargin,
    avgMargin,
    peakMargin,
    peakYear,
    profitWinYears,
    profitWinRate,
    strongestPeriod,
    warningPeriod,
    breakEvenYear,
  };
}

const MetricCard = ({
  label,
  value,
  trend,
  color,
}: {
  label: string;
  value: number;
  trend: "strong" | "moderate" | "weak";
  color: string;
}) => {
  const trendIcons = {
    strong: "↑↑",
    moderate: "↑",
    weak: "↗",
  };

  return (
    <div className="bg-white rounded-xl p-3 border border-stone-200">
      <div className="text-xs text-stone-500 mb-1">{label}</div>
      <div className="flex items-baseline justify-between">
        <span
          className="text-2xl font-bold tabular-nums"
          style={{ color }}
        >
          {value.toFixed(1)}%
        </span>
        <span className="text-lg">{trendIcons[trend]}</span>
      </div>
    </div>
  );
};

const InsightBullet = ({
  icon,
  text,
  positive,
}: {
  icon: string;
  text: string;
  positive: boolean;
}) => (
  <li className="flex items-start gap-2">
    <span className="text-base flex-shrink-0">{icon}</span>
    <span
      className={cn(
        "flex-1 leading-relaxed",
        positive ? "text-stone-700" : "text-amber-700",
      )}
    >
      {text}
    </span>
  </li>
);

export function ProfitabilityInsightsPanel({
  data,
}: ProfitabilityInsightsPanelProps) {
  const insights = useMemo(() => calculateInsights(data), [data]);

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-stone-50 to-stone-100 rounded-2xl border border-stone-200">
      {/* Key Metrics */}
      <section>
        <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">
          Growth Performance
        </h3>
        <div className="grid grid-cols-1 gap-3">
          <MetricCard
            label="Revenue CAGR"
            value={insights.revenueCagr}
            trend={insights.revenueTrend}
            color="#c9a86c"
          />
          <MetricCard
            label="Net Profit CAGR"
            value={insights.netProfitCagr}
            trend={insights.netProfitTrend}
            color="#2d7a4f"
          />

          {/* Winner Indicator */}
          <div
            className={cn(
              "p-3 rounded-xl text-sm font-semibold flex items-center gap-2",
              insights.netProfitCagr > insights.revenueCagr
                ? "bg-emerald-100 text-emerald-800"
                : "bg-amber-100 text-amber-800",
            )}
          >
            <span className="text-lg">
              {insights.netProfitCagr > insights.revenueCagr ? "🏆" : "⚠️"}
            </span>
            <span>
              {insights.netProfitCagr > insights.revenueCagr
                ? "Profit growing faster"
                : "Revenue leading growth"}
            </span>
            <span className="ml-auto tabular-nums">
              +
              {Math.abs(insights.netProfitCagr - insights.revenueCagr).toFixed(
                1,
              )}
              pp
            </span>
          </div>
        </div>
      </section>

      {/* Profit Margin Evolution */}
      <section>
        <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">
          Margin Evolution
        </h3>
        <div className="bg-white rounded-xl p-4 border border-stone-200">
          {/* Mini Sparkline */}
          <ResponsiveContainer width="100%" height={60}>
            <LineChart data={data}>
              <Line
                type="monotone"
                dataKey="profitMargin"
                stroke="#4a7c96"
                strokeWidth={2}
                dot={false}
              />
              <ReferenceLine
                y={insights.avgMargin}
                stroke="#6b6760"
                strokeDasharray="3 3"
                strokeWidth={1}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Margin Stats */}
          <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div>
              <dt className="text-xs text-stone-500">Start</dt>
              <dd className="text-sm font-bold text-stone-900 tabular-nums">
                {insights.startMargin.toFixed(1)}%
              </dd>
            </div>
            <div>
              <dt className="text-xs text-stone-500">Latest</dt>
              <dd className="text-sm font-bold text-[#4a7c96] tabular-nums">
                {insights.endMargin.toFixed(1)}%
              </dd>
            </div>
            <div>
              <dt className="text-xs text-stone-500">Peak</dt>
              <dd className="text-sm font-bold text-[#2d7a4f] tabular-nums">
                {insights.peakMargin.toFixed(1)}%
              </dd>
            </div>
          </dl>

          {/* Change Indicator */}
          <div
            className={cn(
              "mt-3 text-center text-xs font-semibold py-1.5 rounded-lg",
              insights.endMargin > insights.startMargin
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700",
            )}
          >
            {insights.endMargin > insights.startMargin
              ? `+${(insights.endMargin - insights.startMargin).toFixed(1)}pp improvement`
              : `${(insights.endMargin - insights.startMargin).toFixed(1)}pp decline`}
          </div>
        </div>
      </section>

      {/* Growth Analysis Insights */}
      <section>
        <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">
          Key Findings
        </h3>
        <ul className="space-y-2 text-sm text-stone-700">
          <InsightBullet
            icon="📈"
            text={`Profit outpaced revenue in ${insights.profitWinYears} of ${data.length} years (${insights.profitWinRate}%)`}
            positive={Number(insights.profitWinRate) > 50}
          />

          {insights.strongestPeriod && (
            <InsightBullet
              icon="🔥"
              text={`Strongest margin growth: ${insights.strongestPeriod.label} (+${insights.strongestPeriod.change.toFixed(1)}pp)`}
              positive={true}
            />
          )}

          {insights.warningPeriod && (
            <InsightBullet
              icon="⚠️"
              text={`Caution period: ${insights.warningPeriod.label} (margin compression)`}
              positive={false}
            />
          )}

          {insights.breakEvenYear && (
            <InsightBullet
              icon="✓"
              text={`Profitability achieved: Year ${insights.breakEvenYear}`}
              positive={true}
            />
          )}
        </ul>
      </section>
    </div>
  );
}
