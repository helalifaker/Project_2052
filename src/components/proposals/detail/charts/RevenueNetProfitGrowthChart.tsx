"use client";

import { useMemo, useState } from "react";
import Decimal from "decimal.js";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceDot,
} from "recharts";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  GrowthVelocityTooltip,
  type TransformedDataPoint,
} from "./GrowthVelocityTooltip";
import { ProfitabilityInsightsPanel } from "./ProfitabilityInsightsPanel";
import { chartColors } from "@/lib/design-tokens/chart-colors";
import { getGridProps, getAxisProps } from "@/lib/design-tokens/chart-config";

interface RevenueNetProfitGrowthChartProps {
  data: Array<{
    year: number;
    revenue: Decimal;
    netProfit: Decimal;
  }>;
  proposalId: string;
  proposalName: string;
  className?: string;
}

interface AccelerationMarker {
  year: number;
  type: "accelerating" | "decelerating";
  magnitude: number;
}

// Transform raw data to chart-ready format
function transformData(
  rawData: Array<{ year: number; revenue: Decimal; netProfit: Decimal }>,
): TransformedDataPoint[] {
  return rawData.map((point, index) => {
    // Convert to millions for display
    const revenueM = point.revenue.dividedBy(1_000_000).toNumber();
    const netProfitM = point.netProfit.dividedBy(1_000_000).toNumber();

    // Calculate YoY growth rates
    let revenueYoY: number | null = null;
    let netProfitYoY: number | null = null;

    if (index > 0) {
      const prevRevenue = rawData[index - 1].revenue;
      const prevNetProfit = rawData[index - 1].netProfit;

      if (prevRevenue.greaterThan(0)) {
        revenueYoY = point.revenue
          .minus(prevRevenue)
          .dividedBy(prevRevenue)
          .times(100)
          .toNumber();
      }

      if (prevNetProfit.abs().greaterThan(0)) {
        netProfitYoY = point.netProfit
          .minus(prevNetProfit)
          .dividedBy(prevNetProfit.abs())
          .times(100)
          .toNumber();
      }
    }

    // Calculate growth differential
    let growthDifferential: number | null = null;
    if (revenueYoY !== null && netProfitYoY !== null) {
      growthDifferential = netProfitYoY - revenueYoY;
    }

    // Calculate profit margin
    const profitMargin = point.revenue.greaterThan(0)
      ? point.netProfit.dividedBy(point.revenue).times(100).toNumber()
      : 0;

    // Velocity ribbon bounds
    let ribbonTop: number | null = null;
    let ribbonBottom: number | null = null;
    let ribbonColor = "#2d7a4f";

    if (revenueYoY !== null && netProfitYoY !== null) {
      ribbonTop = Math.max(revenueYoY, netProfitYoY);
      ribbonBottom = Math.min(revenueYoY, netProfitYoY);

      // Color logic using design tokens
      if (netProfitYoY > revenueYoY) {
        ribbonColor = chartColors.positive; // Sage - profit winning
      } else if (netProfitYoY < 0) {
        ribbonColor = chartColors.negative; // Terracotta - profit declining
      } else {
        ribbonColor = chartColors.neutral; // Copper - revenue winning
      }
    }

    return {
      year: point.year,
      revenueM,
      netProfitM,
      revenueYoY,
      netProfitYoY,
      growthDifferential,
      profitMargin,
      ribbonTop,
      ribbonBottom,
      ribbonColor,
    };
  });
}

// Calculate acceleration markers (where growth is speeding up or slowing down)
function calculateAcceleration(
  data: TransformedDataPoint[],
): AccelerationMarker[] {
  const markers: AccelerationMarker[] = [];

  for (let i = 2; i < data.length; i++) {
    const currentGrowth = data[i].netProfitYoY;
    const previousGrowth = data[i - 1].netProfitYoY;

    if (currentGrowth === null || previousGrowth === null) continue;

    const acceleration = currentGrowth - previousGrowth;

    // Only mark significant changes (>5% change in growth rate)
    if (Math.abs(acceleration) >= 5) {
      markers.push({
        year: data[i].year,
        type: acceleration > 0 ? "accelerating" : "decelerating",
        magnitude: Math.abs(acceleration),
      });
    }
  }

  return markers;
}

const TIME_RANGES = [
  { label: "All 30 Years", value: "all", start: 2023, end: 2053 },
  { label: "First Decade", value: "2023-2033", start: 2023, end: 2033 },
  { label: "Mid Period", value: "2033-2043", start: 2033, end: 2043 },
  { label: "Final Decade", value: "2043-2053", start: 2043, end: 2053 },
];

export function RevenueNetProfitGrowthChart({
  data,
  proposalName,
  className,
}: RevenueNetProfitGrowthChartProps) {
  const [selectedRange, setSelectedRange] = useState<string>("all");
  const [showGrowthRates, setShowGrowthRates] = useState(true);
  const [showAcceleration, setShowAcceleration] = useState(false);
  const [activeMetrics, setActiveMetrics] = useState<string[]>([
    "revenue",
    "netProfit",
  ]);

  // Transform data
  const chartData = useMemo(() => transformData(data), [data]);

  // Filter by time range
  const filteredData = useMemo(() => {
    if (selectedRange === "all") return chartData;
    const range = TIME_RANGES.find((r) => r.value === selectedRange);
    if (!range) return chartData;
    return chartData.filter(
      (d) => d.year >= range.start && d.year <= range.end,
    );
  }, [chartData, selectedRange]);

  // Use all data points (no sampling) for accurate YoY display
  const displayData = filteredData;

  // Calculate acceleration markers
  const accelerationMarkers = useMemo(
    () => calculateAcceleration(filteredData),
    [filteredData],
  );

  const toggleMetric = (metric: string) => {
    if (activeMetrics.includes(metric)) {
      // Don't allow deselecting all metrics
      if (activeMetrics.length > 1) {
        setActiveMetrics(activeMetrics.filter((m) => m !== metric));
      }
    } else {
      setActiveMetrics([...activeMetrics, metric]);
    }
  };

  // Calculate insights for ARIA label
  const firstPoint = filteredData[0];
  const lastPoint = filteredData[filteredData.length - 1];
  const revenueCagr = firstPoint && lastPoint
    ? ((Math.pow(lastPoint.revenueM / firstPoint.revenueM, 1 / filteredData.length) - 1) * 100).toFixed(1)
    : "0";
  const netProfitCagr = firstPoint && lastPoint
    ? ((Math.pow(lastPoint.netProfitM / firstPoint.netProfitM, 1 / filteredData.length) - 1) * 100).toFixed(1)
    : "0";
  const isProfitLeading = Number(netProfitCagr) > Number(revenueCagr);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Controls Bar */}
      <div
        className="flex flex-wrap items-center justify-between gap-4 p-4 bg-stone-50 rounded-xl border border-stone-200"
        role="toolbar"
        aria-label="Chart controls"
      >
        {/* Time Range Selector */}
        <div className="flex flex-wrap gap-2" role="group" aria-label="Time range selection">
          {TIME_RANGES.map((range) => (
            <button
              key={range.value}
              onClick={() => setSelectedRange(range.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedRange(range.value);
                }
              }}
              aria-label={`Show ${range.label}`}
              aria-pressed={selectedRange === range.value}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                selectedRange === range.value
                  ? "bg-copper text-white shadow-md"
                  : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200",
              )}
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Toggle Controls */}
        <div className="flex gap-2" role="group" aria-label="Chart display options">
          <button
            onClick={() => setShowGrowthRates(!showGrowthRates)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setShowGrowthRates(!showGrowthRates);
              }
            }}
            aria-label={`${showGrowthRates ? "Hide" : "Show"} year-over-year growth rates overlay`}
            aria-pressed={showGrowthRates}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              showGrowthRates
                ? "bg-[#4a7c96] text-white"
                : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-100",
            )}
          >
            {showGrowthRates ? "Hide" : "Show"} Growth Rates
          </button>
          <button
            onClick={() => setShowAcceleration(!showAcceleration)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setShowAcceleration(!showAcceleration);
              }
            }}
            aria-label={`${showAcceleration ? "Hide" : "Show"} growth acceleration markers`}
            aria-pressed={showAcceleration}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              showAcceleration
                ? "bg-[#4a7c96] text-white"
                : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-100",
            )}
          >
            {showAcceleration ? "Hide" : "Show"} Acceleration
          </button>
        </div>
      </div>

      {/* Main Chart + Insights Layout */}
      <div className="grid lg:grid-cols-[1fr_350px] gap-6">
        {/* Chart Container */}
        <Card className="p-6">
          <div>
            <h3 className="text-lg font-semibold text-stone-900 mb-1">
              Revenue vs Net Profit Growth Analysis
            </h3>
            <p className="text-sm text-stone-600 mb-4">{proposalName}</p>
          </div>

          <div
            className="h-[300px] sm:h-[350px] lg:h-[450px]"
            role="img"
            aria-label={`Revenue vs Net Profit growth chart for ${proposalName}. Revenue CAGR: ${revenueCagr}%. Net Profit CAGR: ${netProfitCagr}%. ${isProfitLeading ? "Profit is growing faster than revenue, indicating margin expansion." : "Revenue is growing faster than profit, indicating margin compression."}`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={displayData}>
                {/* Gradients */}
                <defs>
                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={chartColors.neutral} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={chartColors.neutral} stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient
                    id="netProfitGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={chartColors.positive} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={chartColors.positive} stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient
                    id="velocityGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={chartColors.positive} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={chartColors.positive} stopOpacity={0.05} />
                  </linearGradient>
                </defs>

                {/* Grid */}
                <CartesianGrid {...getGridProps()} />

                {/* Axes */}
                <XAxis
                  dataKey="year"
                  stroke="#6b6760"
                  tick={{ fill: "#6b6760", fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: "#e7e5e4" }}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#6b6760"
                  tick={{ fill: "#6b6760", fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: "#e7e5e4" }}
                  tickFormatter={(value) => `${value}M`}
                  label={{
                    value: "SAR (Millions)",
                    angle: -90,
                    position: "insideLeft",
                    style: { fill: "#6b6760", fontSize: 12, fontWeight: 500 },
                  }}
                />

                {showGrowthRates && (
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#6b6760"
                    tick={{ fill: "#6b6760", fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: "#e7e5e4" }}
                    tickFormatter={(value) => `${value}%`}
                    label={{
                      value: "YoY Growth %",
                      angle: 90,
                      position: "insideRight",
                      style: { fill: "#6b6760", fontSize: 11, fontWeight: 500 },
                    }}
                  />
                )}

                {/* Velocity Ribbon (Growth Differential Area) */}
                {showGrowthRates && (
                  <>
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="ribbonTop"
                      stroke="none"
                      fill="url(#velocityGradient)"
                      fillOpacity={0.2}
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="ribbonBottom"
                      stroke="none"
                      fill="url(#velocityGradient)"
                      fillOpacity={0.2}
                    />
                  </>
                )}

                {/* Revenue Area + Line */}
                {activeMetrics.includes("revenue") && (
                  <>
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenueM"
                      stroke="none"
                      fill="url(#revenueGradient)"
                      fillOpacity={1}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenueM"
                      stroke={chartColors.neutral}
                      strokeWidth={3}
                      dot={false}
                      activeDot={{
                        r: 6,
                        fill: chartColors.neutral,
                        stroke: "#fff",
                        strokeWidth: 2,
                      }}
                    />
                  </>
                )}

                {/* Net Profit Area + Line */}
                {activeMetrics.includes("netProfit") && (
                  <>
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="netProfitM"
                      stroke="none"
                      fill="url(#netProfitGradient)"
                      fillOpacity={1}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="netProfitM"
                      stroke={chartColors.positive}
                      strokeWidth={3}
                      dot={false}
                      activeDot={{
                        r: 6,
                        fill: chartColors.positive,
                        stroke: "#fff",
                        strokeWidth: 2,
                      }}
                    />
                  </>
                )}

                {/* YoY Growth Rate Lines (Dashed) */}
                {showGrowthRates && (
                  <>
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="revenueYoY"
                      stroke={chartColors.neutral}
                      strokeWidth={2}
                      strokeDasharray="4 2"
                      dot={false}
                      opacity={0.5}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="netProfitYoY"
                      stroke={chartColors.positive}
                      strokeWidth={2}
                      strokeDasharray="4 2"
                      dot={false}
                      opacity={0.5}
                    />

                    {/* Zero Growth Reference Line */}
                    <ReferenceLine
                      yAxisId="right"
                      y={0}
                      stroke="#6b6760"
                      strokeWidth={1}
                      strokeOpacity={0.5}
                    />
                  </>
                )}

                {/* Acceleration Markers */}
                {showAcceleration &&
                  accelerationMarkers.map((marker) => {
                    const dataPoint = filteredData.find(
                      (d) => d.year === marker.year,
                    );
                    if (!dataPoint) return null;
                    return (
                      <ReferenceDot
                        key={marker.year}
                        yAxisId="left"
                        x={marker.year}
                        y={dataPoint.netProfitM}
                        r={6}
                        fill={
                          marker.type === "accelerating"
                            ? chartColors.positive
                            : chartColors.negative
                        }
                        stroke="#faf9f7"
                        strokeWidth={2}
                      />
                    );
                  })}

                {/* Tooltip */}
                <Tooltip content={<GrowthVelocityTooltip />} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Metric Toggle Buttons */}
          <div className="flex items-center justify-center gap-3 mt-4" role="group" aria-label="Metric visibility controls">
            <button
              onClick={() => toggleMetric("revenue")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleMetric("revenue");
                }
              }}
              aria-label="Toggle revenue metric visibility"
              aria-pressed={activeMetrics.includes("revenue")}
              disabled={activeMetrics.includes("revenue") && activeMetrics.length === 1}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                activeMetrics.includes("revenue")
                  ? "bg-copper text-white shadow-md"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200",
              )}
            >
              <div className="w-3 h-3 rounded-full bg-current" />
              Revenue
            </button>
            <button
              onClick={() => toggleMetric("netProfit")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleMetric("netProfit");
                }
              }}
              aria-label="Toggle net profit metric visibility"
              aria-pressed={activeMetrics.includes("netProfit")}
              disabled={activeMetrics.includes("netProfit") && activeMetrics.length === 1}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                activeMetrics.includes("netProfit")
                  ? "bg-sage text-white shadow-md"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200",
              )}
            >
              <div className="w-3 h-3 rounded-full bg-current" />
              Net Profit
            </button>
          </div>

          {/* Accessible Data Table Alternative */}
          <details className="mt-6 border-t border-stone-200 pt-4">
            <summary className="text-sm font-medium text-stone-700 cursor-pointer hover:text-stone-900 mb-4">
              View data table (accessible alternative)
            </summary>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-stone-200">
                <thead>
                  <tr className="bg-stone-100">
                    <th className="px-3 py-2 text-left border-b border-stone-200">Year</th>
                    <th className="px-3 py-2 text-right border-b border-stone-200">Revenue (M SAR)</th>
                    <th className="px-3 py-2 text-right border-b border-stone-200">Revenue YoY%</th>
                    <th className="px-3 py-2 text-right border-b border-stone-200">Net Profit (M SAR)</th>
                    <th className="px-3 py-2 text-right border-b border-stone-200">Net Profit YoY%</th>
                    <th className="px-3 py-2 text-right border-b border-stone-200">Profit Margin%</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row) => (
                    <tr key={row.year} className="border-b border-stone-200 hover:bg-stone-50">
                      <td className="px-3 py-2 font-medium">{row.year}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{row.revenueM.toFixed(1)}</td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {row.revenueYoY !== null ? `${row.revenueYoY > 0 ? "+" : ""}${row.revenueYoY.toFixed(1)}%` : "—"}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">{row.netProfitM.toFixed(1)}</td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {row.netProfitYoY !== null ? `${row.netProfitYoY > 0 ? "+" : ""}${row.netProfitYoY.toFixed(1)}%` : "—"}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">{row.profitMargin.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </Card>

        {/* Insights Panel */}
        <ProfitabilityInsightsPanel data={filteredData} />
      </div>
    </div>
  );
}
