"use client";

import React from "react";
import {
  LineChart,
  Line,
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
} from "@/lib/design-tokens/chart-config";
import { getSeriesColor } from "@/lib/design-tokens/chart-colors";
import { CustomTooltip } from "./CustomTooltip";

/**
 * Data Series Configuration
 *
 * Defines how each line in the chart should be rendered.
 */
export interface DataSeries {
  /** Data key in the data object */
  dataKey: string;
  /** Display name for legend */
  name?: string;
  /** Line color (defaults to series colors from design tokens) */
  color?: string;
  /** Line stroke width (default: 2px from design tokens) */
  strokeWidth?: number;
  /** Show dots on data points (default: false) */
  dot?: boolean;
  /** Stroke dash array for dashed lines (e.g., "5 5") */
  strokeDasharray?: string;
}

/**
 * Base Line Chart Props
 *
 * All props for configuring the BaseLineChart component.
 */
export interface BaseLineChartProps {
  /** Chart data array */
  data: any[];
  /** Data series configuration */
  series: DataSeries[];
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
 * Base Line Chart Component
 *
 * Standardized line chart with design token styling.
 * All Recharts configuration uses centralized design tokens.
 *
 * **Performance:**
 * - Memoized to prevent unnecessary re-renders
 * - Uses shallow comparison on props
 * - Optimized for datasets up to 1000 points
 *
 * **Features:**
 * - Automatic color assignment from design token palette
 * - Consistent typography, spacing, and animations
 * - Built-in responsive container
 * - Dark mode support via CSS variables
 * - Customizable tooltips with standard formatting
 *
 * **Design Tokens:**
 * - Colors: `@/lib/design-tokens/chart-colors`
 * - Config: `@/lib/design-tokens/chart-config`
 *
 * @example
 * ```tsx
 * // Simple line chart
 * <BaseLineChart
 *   data={rentData}
 *   series={[
 *     { dataKey: "rent", name: "Monthly Rent" },
 *     { dataKey: "projected", name: "Projected", strokeDasharray: "5 5" },
 *   ]}
 *   xAxisKey="year"
 *   tooltipFormat="millions"
 * />
 *
 * // Multi-series with custom colors
 * <BaseLineChart
 *   data={comparisonData}
 *   series={[
 *     { dataKey: "proposal1", name: "Proposal A", color: chartColors.proposalA },
 *     { dataKey: "proposal2", name: "Proposal B", color: chartColors.proposalB },
 *   ]}
 *   xAxisKey="year"
 *   showLegend
 * />
 * ```
 */
export const BaseLineChart = React.memo(function BaseLineChart({
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
}: BaseLineChartProps) {
  // Auto-enable legend for multiple series
  const displayLegend = showLegend !== undefined ? showLegend : series.length > 1;

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={chartSpacing.margin}>
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

          {/* Lines */}
          {series.map((s, index) => (
            <Line
              key={s.dataKey}
              dataKey={s.dataKey}
              name={s.name || s.dataKey}
              stroke={s.color || getSeriesColor(index)}
              strokeWidth={s.strokeWidth || chartSpacing.strokeWidth}
              dot={s.dot !== undefined ? s.dot : false}
              strokeDasharray={s.strokeDasharray}
              type="monotone"
              activeDot={{
                r: chartSpacing.activeDotRadius,
                strokeWidth: 2,
              }}
              animationDuration={chartAnimation.duration}
              animationEasing={chartAnimation.easing}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});
