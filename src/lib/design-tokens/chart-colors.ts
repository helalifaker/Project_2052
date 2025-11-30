/**
 * Chart Color Design Tokens
 *
 * Semantic color system for data visualization using CSS custom properties.
 * All colors reference the existing Sahara Twilight palette.
 *
 * Philosophy:
 * - Semantic naming (not hardcoded hex values)
 * - Automatic dark mode adaptation via CSS variables
 * - HSL format for easy color manipulation
 * - Consistent usage across 15+ chart components
 */

/**
 * Financial Semantic Colors
 * Using existing Sahara Twilight palette with semantic naming
 */
export const chartColors = {
  /**
   * Financial Trend Colors
   * For positive/negative value representation
   */
  positive: 'hsl(var(--color-financial-positive))',    // Sage green - gains
  negative: 'hsl(var(--color-financial-negative))',    // Terracotta - losses
  neutral: 'hsl(var(--color-financial-neutral))',      // Copper - neutral values
  warning: 'hsl(var(--color-financial-warning))',      // Amber - warnings

  /**
   * Multi-Series Colors
   * For charts with multiple data series (up to 4 series)
   */
  series: [
    'hsl(var(--color-chart-series-1))',    // Copper (primary)
    'hsl(var(--color-chart-series-2))',    // Sage (secondary)
    'hsl(var(--color-chart-series-3))',    // Blue-gray (tertiary)
    'hsl(var(--color-chart-series-4))',    // Purple (quaternary)
  ],

  /**
   * Grid & Axis Colors
   * For chart structure elements
   */
  grid: 'hsl(var(--color-chart-grid))',              // Stone-300 (light grid lines)
  axis: 'hsl(var(--color-chart-axis))',              // Stone-600 (axis lines/labels)

  /**
   * Background Colors
   * For chart canvas and containers
   */
  background: 'hsl(var(--color-background))',        // Adapts to theme
  cardBackground: 'hsl(var(--color-card))',          // Card background

  /**
   * Proposal Comparison Colors
   * For multi-proposal comparison charts
   */
  proposalA: 'hsl(var(--color-copper))',             // Copper
  proposalB: 'hsl(142 41% 38%)',                     // Twilight Blue (adjusted sage)
  proposalC: 'hsl(200 18% 46%)',                     // Blue-gray
  proposalD: 'hsl(280 40% 55%)',                     // Purple
  proposalE: 'hsl(15 66% 53%)',                      // Terracotta

  /**
   * Gradient Fills (for area charts)
   * Using positive/negative colors with opacity gradients
   */
  gradients: {
    positive: {
      start: 'hsl(var(--color-financial-positive) / 0.3)',
      end: 'hsl(var(--color-financial-positive) / 0.05)',
    },
    negative: {
      start: 'hsl(var(--color-financial-negative) / 0.3)',
      end: 'hsl(var(--color-financial-negative) / 0.05)',
    },
    neutral: {
      start: 'hsl(var(--color-copper) / 0.3)',
      end: 'hsl(var(--color-copper) / 0.05)',
    },
  },
} as const;

/**
 * Chart Color Mappings
 * Specific use cases for different chart types
 */
export const chartColorMappings = {
  /**
   * Rent Trajectory Chart
   */
  rentTrajectory: {
    primaryRent: chartColors.neutral,          // Copper for primary rent line
    historicalRent: chartColors.series[1],     // Sage for historical comparison
    projectedRent: chartColors.series[2],      // Blue-gray for projections
  },

  /**
   * NPV Sensitivity (Tornado Chart)
   */
  sensitivity: {
    positiveImpact: chartColors.positive,      // Sage for positive variables
    negativeImpact: chartColors.negative,      // Terracotta for negative variables
    baseline: chartColors.neutral,             // Copper for baseline
  },

  /**
   * Cost Breakdown Chart
   */
  costBreakdown: {
    rent: chartColors.neutral,                 // Copper for rent costs
    staff: chartColors.series[1],              // Sage for staff costs
    otherOpex: chartColors.series[2],          // Blue-gray for other OpEx
    capex: chartColors.series[3],              // Purple for CapEx
  },

  /**
   * Cash Flow Charts
   */
  cashFlow: {
    positive: chartColors.positive,            // Sage for positive cash flow
    negative: chartColors.negative,            // Terracotta for negative cash flow
    cumulative: chartColors.neutral,           // Copper for cumulative line
    gradient: chartColors.gradients.positive,  // Gradient fill for area
  },

  /**
   * Profitability Charts
   */
  profitability: {
    revenue: chartColors.positive,             // Sage for revenue
    costs: chartColors.negative,               // Terracotta for costs
    profit: chartColors.neutral,               // Copper for profit
    ebitda: chartColors.series[2],             // Blue-gray for EBITDA
  },
} as const;

/**
 * CSS Custom Property Definitions
 * For use in globals.css @theme section
 */
export const chartColorVars = {
  // Financial semantic colors
  '--color-financial-positive': 'var(--color-sage)',
  '--color-financial-negative': 'var(--color-terracotta)',
  '--color-financial-neutral': 'var(--color-copper)',
  '--color-financial-warning': '38 92% 50%',

  // Chart series colors (HSL values)
  '--color-chart-series-1': 'var(--color-copper)',
  '--color-chart-series-2': 'var(--color-sage)',
  '--color-chart-series-3': '200 18% 46%',   // Blue-gray-600
  '--color-chart-series-4': '280 40% 55%',   // Purple-500

  // Chart structure colors
  '--color-chart-grid': '24 6% 83%',         // Stone-300
  '--color-chart-axis': '24 6% 46%',         // Stone-600
} as const;

/**
 * Dark Mode Adjustments
 * Override values for dark theme
 */
export const chartColorVarsDark = {
  '--color-chart-grid': '24 6% 25%',         // Darker grid in dark mode
  '--color-chart-axis': '24 6% 60%',         // Lighter axis in dark mode
} as const;

/**
 * Helper: Get color by index for multi-series charts
 */
export function getSeriesColor(index: number): string {
  return chartColors.series[index % chartColors.series.length];
}

/**
 * Helper: Get proposal comparison color
 */
export function getProposalColor(proposalIndex: number): string {
  const colors = [
    chartColors.proposalA,
    chartColors.proposalB,
    chartColors.proposalC,
    chartColors.proposalD,
    chartColors.proposalE,
  ];
  return colors[proposalIndex % colors.length];
}

/**
 * Migration Guide
 *
 * Replace hardcoded hex values with semantic colors:
 *
 * Before:
 * <Line stroke="#a47b42" />                    // Hardcoded copper
 * <Line stroke="#16a34a" />                    // Hardcoded green
 * <CartesianGrid stroke="#e5e7eb" />           // Hardcoded gray
 *
 * After:
 * import { chartColors } from '@/lib/design-tokens/chart-colors';
 * <Line stroke={chartColors.neutral} />
 * <Line stroke={chartColors.positive} />
 * <CartesianGrid stroke={chartColors.grid} />
 *
 * Quick Reference: /src/lib/design-tokens/CHART_QUICK_REFERENCE.md
 * Full Migration Guide: /src/components/charts/MIGRATION_GUIDE.md
 */
