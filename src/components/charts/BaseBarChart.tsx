"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  getAxisProps,
  getGridProps,
  getTooltipProps,
  getLegendProps,
  chartSpacing,
  chartAnimation,
  chartResponsive,
} from "@/lib/design-tokens/chart-config";
import { getSeriesColor } from "@/lib/design-tokens/chart-colors";
import { CustomTooltip } from "./CustomTooltip";

/**
 * Bar Series Configuration
 *
 * Defines how each bar series in the chart should be rendered.
 */
export interface BarSeries {
  /** Data key in the data object */
  dataKey: string;
  /** Display name for legend */
  name?: string;
  /** Bar color (defaults to series colors) */
  color?: string;
  /** Stack ID for stacked bars */
  stackId?: string;
  /** Custom cell colors (for individual bar coloring) */
  cellColors?: string[];
}

/**
 * Base Bar Chart Props
 *
 * All props for configuring the BaseBarChart component.
 */
export interface BaseBarChartProps {
  /** Chart data array */
  data: any[];
  /** Bar series configuration */
  series: BarSeries[];
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
  /** Chart orientation (default: "vertical") */
  layout?: "vertical" | "horizontal";
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
 * Base Bar Chart Component
 *
 * Standardized bar chart with design token styling.
 * Supports stacked bars, horizontal/vertical layouts, and custom cell colors.
 *
 * Features:
 * - Automatic color assignment from design token palette
 * - Consistent typography, spacing, and animations
 * - Built-in responsive container
 * - Dark mode support
 * - Stacked bar support
 * - Individual bar coloring via cellColors
 *
 * @example
 * ```tsx
 * // Simple bar chart
 * <BaseBarChart
 *   data={costData}
 *   series={[
 *     { dataKey: "rent", name: "Rent" },
 *     { dataKey: "staff", name: "Staff" },
 *   ]}
 *   xAxisKey="year"
 *   tooltipFormat="millions"
 * />
 *
 * // Stacked bar chart
 * <BaseBarChart
 *   data={costData}
 *   series={[
 *     { dataKey: "rent", name: "Rent", stackId: "a" },
 *     { dataKey: "staff", name: "Staff", stackId: "a" },
 *     { dataKey: "other", name: "Other", stackId: "a" },
 *   ]}
 *   xAxisKey="year"
 * />
 *
 * // Custom cell colors (e.g., positive/negative bars)
 * <BaseBarChart
 *   data={cashFlowData}
 *   series={[
 *     {
 *       dataKey: "netCashFlow",
 *       cellColors: cashFlowData.map(d =>
 *         d.netCashFlow >= 0 ? chartColors.positive : chartColors.negative
 *       ),
 *     },
 *   ]}
 *   xAxisKey="year"
 * />
 * ```
 *
 * **Performance:**
 * - Memoized to prevent unnecessary re-renders
 * - Optimized for datasets up to 500 bars
 * - Efficient cell coloring with React keys
 */
export const BaseBarChart = React.memo(function BaseBarChart({
  data,
  series,
  xAxisKey,
  xAxisFormatter,
  yAxisFormatter,
  showLegend,
  showGrid = true,
  layout = "vertical",
  height = chartResponsive.defaultHeight,
  tooltipContent,
  tooltipFormat = "millions",
  className,
}: BaseBarChartProps) {
  // Auto-enable legend for multiple series
  const displayLegend = showLegend !== undefined ? showLegend : series.length > 1;

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={chartSpacing.margin}
          layout={layout}
          barCategoryGap={chartSpacing.barCategoryGap}
          barGap={chartSpacing.barGap}
        >
          {/* Grid */}
          {showGrid && <CartesianGrid {...getGridProps()} />}

          {/* X Axis */}
          <XAxis
            {...getAxisProps("x")}
            dataKey={layout === "vertical" ? xAxisKey : undefined}
            type={layout === "vertical" ? "category" : "number"}
            tickFormatter={xAxisFormatter}
          />

          {/* Y Axis */}
          <YAxis
            {...getAxisProps("y")}
            dataKey={layout === "horizontal" ? xAxisKey : undefined}
            type={layout === "horizontal" ? "category" : "number"}
            tickFormatter={yAxisFormatter}
          />

          {/* Tooltip */}
          <Tooltip
            content={
              tooltipContent || <CustomTooltip format={tooltipFormat} />
            }
            {...getTooltipProps()}
          />

          {/* Legend */}
          {displayLegend && <Legend {...getLegendProps()} />}

          {/* Bars */}
          {series.map((s, index) => (
            <Bar
              key={s.dataKey}
              dataKey={s.dataKey}
              name={s.name || s.dataKey}
              fill={s.color || getSeriesColor(index)}
              stackId={s.stackId}
              animationDuration={chartAnimation.duration}
              animationEasing={chartAnimation.easing}
              radius={[4, 4, 0, 0]} // Rounded top corners
            >
              {/* Individual cell colors (if provided) */}
              {s.cellColors &&
                data.map((_, cellIndex) => (
                  <Cell
                    key={`cell-${cellIndex}`}
                    fill={s.cellColors![cellIndex]}
                  />
                ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});
