/**
 * Chart Configuration Design Tokens
 *
 * Centralized configuration for all Recharts components.
 * Ensures consistent typography, colors, spacing, and styling across 15+ charts.
 *
 * Philosophy:
 * - Single source of truth for chart styling
 * - Theme-aware (adapts to light/dark mode)
 * - DRY principle (no repeated configuration)
 * - Easy to maintain and update
 */

import { chartColors } from './chart-colors';
import { typography } from './typography';

/**
 * Chart Typography Configuration
 * Consistent font sizes and weights across all chart elements
 */
export const chartTypography = {
  /**
   * Axis Labels
   * Used for X and Y axis tick labels
   */
  axis: {
    fontSize: 11,                                    // 0.6875rem
    fontWeight: 500,                                 // medium
    fontFamily: 'var(--font-geist-sans)',
    fill: 'hsl(var(--color-chart-axis))',
    letterSpacing: '0.01em',
  },

  /**
   * Legend Items
   * Used for chart legend labels
   */
  legend: {
    fontSize: 12,                                    // 0.75rem
    fontWeight: 500,                                 // medium
    fontFamily: 'var(--font-geist-sans)',
    fill: 'hsl(24 6% 46%)',                         // stone-600
    letterSpacing: '0.01em',
  },

  /**
   * Tooltip Content
   * Used for tooltip text
   */
  tooltip: {
    fontSize: 13,                                    // 0.8125rem
    fontWeight: 500,                                 // medium
    fontFamily: 'var(--font-geist-sans)',
  },

  /**
   * Data Labels
   * Used for labels directly on chart elements
   */
  label: {
    fontSize: 12,                                    // 0.75rem
    fontWeight: 600,                                 // semibold
    fontFamily: 'var(--font-geist-sans)',
    letterSpacing: '0.02em',
  },
} as const;

/**
 * Chart Spacing Configuration
 * Margins and gaps for chart containers
 */
export const chartSpacing = {
  /**
   * Default Margins
   * Standard margins for most charts
   */
  margin: {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10,
  },

  /**
   * Margins with Legend
   * Extra bottom space when legend is present
   */
  marginWithLegend: {
    top: 10,
    right: 10,
    bottom: 30,
    left: 10,
  },

  /**
   * Margins for Charts with Labels
   * Extra space for data labels
   */
  marginWithLabels: {
    top: 20,
    right: 20,
    bottom: 10,
    left: 10,
  },

  /**
   * Bar Chart Spacing
   */
  barCategoryGap: '20%',    // Gap between bar groups
  barGap: 4,                // Gap between bars in same group

  /**
   * Line/Area Chart Spacing
   */
  strokeWidth: 2,           // Default line width
  activeDotRadius: 4,       // Active dot size on hover
  dotRadius: 3,             // Regular dot size
} as const;

/**
 * Grid Configuration
 * Cartesian grid styling
 */
export const chartGrid = {
  stroke: chartColors.grid,
  strokeDasharray: '3 3',      // Dashed lines (3px dash, 3px gap)
  strokeWidth: 1,
  horizontal: true,
  vertical: false,             // Only horizontal grid lines by default
} as const;

/**
 * Axis Configuration
 * X and Y axis styling
 */
export const chartAxis = {
  stroke: chartColors.axis,
  strokeWidth: 1,
  tick: chartTypography.axis,
  tickLine: {
    stroke: chartColors.axis,
  },
  axisLine: {
    stroke: chartColors.axis,
  },
  interval: 'preserveStartEnd' as const,
} as const;

/**
 * Tooltip Configuration
 * Styling for chart tooltips
 */
export const chartTooltipStyle = {
  backgroundColor: 'hsl(var(--color-background))',
  border: '1px solid hsl(24 6% 83%)',             // stone-300
  borderRadius: '12px',
  padding: '12px',
  boxShadow: '0 4px 6px -1px hsl(24 10% 10% / 0.12), 0 2px 4px -2px hsl(24 10% 10% / 0.08)',
  fontSize: chartTypography.tooltip.fontSize,
  fontWeight: chartTypography.tooltip.fontWeight,
  fontFamily: chartTypography.tooltip.fontFamily,
} as const;

/**
 * Tooltip Content Style
 * Internal content styling for tooltips
 */
export const chartTooltipContentStyle = {
  labelStyle: {
    color: 'hsl(var(--color-foreground))',
    fontWeight: 600,
    marginBottom: '4px',
  },
  itemStyle: {
    color: 'hsl(var(--color-foreground))',
  },
} as const;

/**
 * Legend Configuration
 * Styling for chart legends
 */
export const chartLegendStyle = {
  fontSize: chartTypography.legend.fontSize,
  fontWeight: chartTypography.legend.fontWeight,
  fontFamily: chartTypography.legend.fontFamily,
  fill: chartTypography.legend.fill,
  iconType: 'circle' as const,
  iconSize: 8,
  wrapperStyle: {
    paddingTop: '16px',
  },
} as const;

/**
 * Animation Configuration
 * Consistent animations across all charts
 */
export const chartAnimation = {
  duration: 500,                    // 500ms animation duration
  easing: 'ease-out' as const,      // Ease-out easing function
  isAnimationActive: true,          // Enable animations
  animationBegin: 0,                // Start immediately
} as const;

/**
 * Responsive Configuration
 * Breakpoints and responsive behavior
 */
export const chartResponsive = {
  minHeight: 200,                   // Minimum chart height
  defaultHeight: 300,               // Default chart height
  largeHeight: 400,                 // Large chart height
  aspectRatio: 16 / 9,              // Default aspect ratio
} as const;

/**
 * Line Chart Configuration
 * Pre-configured settings for line charts
 */
export const lineChartConfig = {
  type: 'monotone' as const,        // Smooth curves
  strokeWidth: chartSpacing.strokeWidth,
  dot: false,                       // Hide dots by default
  activeDot: {
    r: chartSpacing.activeDotRadius,
    strokeWidth: 2,
  },
  animationDuration: chartAnimation.duration,
  animationEasing: chartAnimation.easing,
} as const;

/**
 * Bar Chart Configuration
 * Pre-configured settings for bar charts
 */
export const barChartConfig = {
  barCategoryGap: chartSpacing.barCategoryGap,
  barGap: chartSpacing.barGap,
  animationDuration: chartAnimation.duration,
  animationEasing: chartAnimation.easing,
} as const;

/**
 * Area Chart Configuration
 * Pre-configured settings for area charts
 */
export const areaChartConfig = {
  type: 'monotone' as const,
  strokeWidth: chartSpacing.strokeWidth,
  fillOpacity: 0.6,                 // Semi-transparent fill
  animationDuration: chartAnimation.duration,
  animationEasing: chartAnimation.easing,
} as const;

/**
 * Pie Chart Configuration
 * Pre-configured settings for pie charts
 */
export const pieChartConfig = {
  innerRadius: '60%',               // Donut chart (60% inner radius)
  outerRadius: '80%',
  paddingAngle: 2,                  // Gap between slices
  animationDuration: chartAnimation.duration,
  animationEasing: chartAnimation.easing,
  labelLine: false,                 // No label lines by default
} as const;

/**
 * Helper: Create axis props
 * Generates complete axis configuration
 */
export function getAxisProps(type: 'x' | 'y' = 'x') {
  return {
    ...chartAxis,
    axisLine: type === 'x' ? chartAxis.axisLine : { stroke: 'none' },
    tickLine: chartAxis.tickLine,
  };
}

/**
 * Helper: Create grid props
 * Generates complete grid configuration
 */
export function getGridProps(options?: { vertical?: boolean; horizontal?: boolean }) {
  return {
    ...chartGrid,
    horizontal: options?.horizontal ?? chartGrid.horizontal,
    vertical: options?.vertical ?? chartGrid.vertical,
  };
}

/**
 * Helper: Create tooltip props
 * Generates complete tooltip configuration
 */
export function getTooltipProps() {
  return {
    contentStyle: chartTooltipStyle,
    labelStyle: chartTooltipContentStyle.labelStyle,
    itemStyle: chartTooltipContentStyle.itemStyle,
    cursor: { fill: 'hsl(var(--color-muted) / 0.1)' },
  };
}

/**
 * Helper: Create legend props
 * Generates complete legend configuration
 */
export function getLegendProps() {
  return {
    ...chartLegendStyle,
  };
}

/**
 * Migration Example
 *
 * Before (inconsistent, hardcoded):
 * ```tsx
 * <XAxis
 *   tick={{ fontSize: 12 }}
 *   stroke="#9ca3af"
 *   tickLine={{ stroke: "#9ca3af" }}
 * />
 * <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
 * <Tooltip />
 * ```
 *
 * After (consistent, theme-aware):
 * ```tsx
 * import { getAxisProps, getGridProps, getTooltipProps } from '@/lib/design-tokens/chart-config';
 *
 * <XAxis {...getAxisProps('x')} />
 * <CartesianGrid {...getGridProps()} />
 * <Tooltip {...getTooltipProps()} />
 * ```
 *
 * Quick Reference: /src/lib/design-tokens/CHART_QUICK_REFERENCE.md
 * Full Migration Guide: /src/components/charts/MIGRATION_GUIDE.md
 */
