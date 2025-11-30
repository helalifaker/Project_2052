"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  getAxisProps,
  getGridProps,
  getTooltipProps,
  getLegendProps,
  chartSpacing,
  chartAnimation,
  chartResponsive,
  areaChartConfig,
} from "@/lib/design-tokens/chart-config";
import { getSeriesColor, chartColors } from "@/lib/design-tokens/chart-colors";
import { CustomTooltip } from "./CustomTooltip";

/**
 * Area Series Configuration
 *
 * Defines how each area in the chart should be rendered.
 */
export interface AreaSeries {
  /** Data key in the data object */
  dataKey: string;
  /** Display name for legend */
  name?: string;
  /** Area stroke color */
  stroke?: string;
  /** Area fill color (uses stroke with opacity if not specified) */
  fill?: string;
  /** Fill opacity (default: 0.6) */
  fillOpacity?: number;
  /** Stroke width */
  strokeWidth?: number;
  /** Stack ID for stacked areas */
  stackId?: string;
  /** Use gradient fill (creates automatic gradient from stroke color) */
  useGradient?: boolean;
}

/**
 * Base Area Chart Props
 *
 * All props for configuring the BaseAreaChart component.
 */
export interface BaseAreaChartProps {
  /** Chart data array */
  data: any[];
  /** Area series configuration */
  series: AreaSeries[];
  /** X-axis data key */
  xAxisKey: string;
  /** Optional X-axis label formatter */
  xAxisFormatter?: (value: any) => string;
  /** Optional Y-axis label formatter */
  yAxisFormatter?: (value: any) => string;
  /** Show legend (default: true for multiple series) */
  showLegend?: boolean;
  /** Show grid lines (default: true) */
  showGrid?: boolean;
  /** Chart height in pixels (default: 300) */
  height?: number;
  /** Custom tooltip component */
  tooltipContent?: React.ReactElement;
  /** Tooltip format type */
  tooltipFormat?: "millions" | "billions" | "percent" | "number";
  /** Additional className */
  className?: string;
}

/**
 * Base Area Chart Component
 *
 * Standardized area chart with design token styling.
 * Supports stacked areas, gradient fills, and custom opacity.
 *
 * Features:
 * - Automatic color assignment from design token palette
 * - Automatic gradient generation for fills
 * - Consistent typography, spacing, and animations
 * - Built-in responsive container
 * - Dark mode support
 * - Stacked area support
 *
 * @example
 * ```tsx
 * // Simple area chart
 * <BaseAreaChart
 *   data={cashFlowData}
 *   series={[
 *     { dataKey: "cumulative", name: "Cumulative Cash", useGradient: true },
 *   ]}
 *   xAxisKey="year"
 *   tooltipFormat="millions"
 * />
 *
 * // Stacked area chart
 * <BaseAreaChart
 *   data={revenueData}
 *   series={[
 *     { dataKey: "tuition", name: "Tuition", stackId: "1", useGradient: true },
 *     { dataKey: "fees", name: "Fees", stackId: "1", useGradient: true },
 *     { dataKey: "other", name: "Other", stackId: "1", useGradient: true },
 *   ]}
 *   xAxisKey="year"
 * />
 *
 * // Custom colors and opacity
 * <BaseAreaChart
 *   data={profitData}
 *   series={[
 *     {
 *       dataKey: "profit",
 *       stroke: chartColors.positive,
 *       fillOpacity: 0.3,
 *     },
 *   ]}
 *   xAxisKey="year"
 * />
 * ```
 *
 * **Performance:**
 * - Memoized to prevent unnecessary re-renders
 * - Gradient definitions created once per series
 * - Optimized for smooth animations
 */
export const BaseAreaChart = React.memo(function BaseAreaChart({
  data,
  series,
  xAxisKey,
  xAxisFormatter,
  yAxisFormatter,
  showLegend,
  showGrid = true,
  height = chartResponsive.defaultHeight,
  tooltipContent,
  tooltipFormat = "millions",
  className,
}: BaseAreaChartProps) {
  // Auto-enable legend for multiple series
  const displayLegend = showLegend !== undefined ? showLegend : series.length > 1;

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={chartSpacing.margin}>
          {/* Gradient Definitions */}
          <defs>
            {series.map((s, index) => {
              if (!s.useGradient) return null;
              const color = s.stroke || getSeriesColor(index);
              const gradientId = `gradient-${s.dataKey}`;

              return (
                <linearGradient
                  key={gradientId}
                  id={gradientId}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={color}
                    stopOpacity={s.fillOpacity || areaChartConfig.fillOpacity}
                  />
                  <stop offset="100%" stopColor={color} stopOpacity={0.05} />
                </linearGradient>
              );
            })}
          </defs>

          {/* Grid */}
          {showGrid && <CartesianGrid {...getGridProps()} />}

          {/* X Axis */}
          <XAxis
            {...getAxisProps("x")}
            dataKey={xAxisKey}
            tickFormatter={xAxisFormatter}
          />

          {/* Y Axis */}
          <YAxis {...getAxisProps("y")} tickFormatter={yAxisFormatter} />

          {/* Tooltip */}
          <Tooltip
            content={
              tooltipContent || <CustomTooltip format={tooltipFormat} />
            }
            {...getTooltipProps()}
          />

          {/* Legend */}
          {displayLegend && <Legend {...getLegendProps()} />}

          {/* Areas */}
          {series.map((s, index) => {
            const strokeColor = s.stroke || getSeriesColor(index);
            const fillColor = s.useGradient
              ? `url(#gradient-${s.dataKey})`
              : s.fill || strokeColor;

            return (
              <Area
                key={s.dataKey}
                dataKey={s.dataKey}
                name={s.name || s.dataKey}
                type={areaChartConfig.type}
                stroke={strokeColor}
                strokeWidth={s.strokeWidth || areaChartConfig.strokeWidth}
                fill={fillColor}
                fillOpacity={
                  s.useGradient ? 1 : (s.fillOpacity || areaChartConfig.fillOpacity)
                }
                stackId={s.stackId}
                animationDuration={chartAnimation.duration}
                animationEasing={chartAnimation.easing}
              />
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});
