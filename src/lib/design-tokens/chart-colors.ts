/**
 * Chart Color Design Tokens — Atelier Edition
 *
 * Semantic color system for data visualization using CSS custom properties.
 * Updated to use the Atelier luxury design system palette.
 *
 * Philosophy:
 * - Semantic naming (not hardcoded hex values)
 * - Automatic dark mode adaptation via CSS variables
 * - Consistent usage across 15+ chart components
 * - Royal palette for proposals: Violet, Teal, Gold
 */

/**
 * Financial Semantic Colors
 * Using Atelier palette with semantic naming
 */
export const chartColors = {
  /**
   * Financial Trend Colors
   * For positive/negative value representation
   * Atelier: Forest green for gains, Burgundy for losses
   */
  positive: "var(--atelier-ink-positive)", // Forest green #2D6A4F - gains
  negative: "var(--atelier-ink-negative)", // Burgundy #9B2C2C - losses
  neutral: "var(--atelier-craft-gold)", // Craft gold #B8860B - neutral values
  warning: "var(--atelier-ink-warning)", // Deep amber #92400E - warnings

  /**
   * Multi-Series Colors
   * For charts with multiple data series (up to 6 series)
   * Uses Atelier chart variables from globals.css
   */
  series: [
    "var(--atelier-chart-proposal-a)", // Royal Violet #7C3AED
    "var(--atelier-chart-proposal-b)", // Ocean Teal #0891B2
    "var(--atelier-chart-proposal-c)", // Burnished Gold #CA8A04
    "var(--atelier-chart-series-4)", // Rose #BE185D
    "var(--atelier-chart-series-5)", // Indigo #4F46E5
    "var(--atelier-chart-series-6)", // Emerald #059669
  ],

  /**
   * Grid & Axis Colors
   * For chart structure elements - Atelier stone palette
   */
  grid: "var(--atelier-stone-200)", // Subtle grid lines
  axis: "var(--atelier-stone-500)", // Axis lines/labels

  /**
   * Background Colors
   * For chart canvas and containers
   */
  background: "var(--atelier-ivory-canvas)", // Adapts to theme
  cardBackground: "var(--atelier-ivory-paper)", // Card background

  /**
   * Proposal Comparison Colors — Atelier Royal Palette
   * For multi-proposal comparison charts
   */
  proposalA: "var(--atelier-chart-proposal-a)", // Royal Violet #7C3AED
  proposalB: "var(--atelier-chart-proposal-b)", // Ocean Teal #0891B2
  proposalC: "var(--atelier-chart-proposal-c)", // Burnished Gold #CA8A04
  proposalD: "var(--atelier-chart-series-4)", // Rose #BE185D
  proposalE: "var(--atelier-chart-series-5)", // Indigo #4F46E5

  /**
   * Gradient Fills (for area charts)
   * Using Atelier colors with opacity gradients
   */
  gradients: {
    positive: {
      start: "color-mix(in srgb, var(--atelier-ink-positive) 30%, transparent)",
      end: "color-mix(in srgb, var(--atelier-ink-positive) 5%, transparent)",
    },
    negative: {
      start: "color-mix(in srgb, var(--atelier-ink-negative) 30%, transparent)",
      end: "color-mix(in srgb, var(--atelier-ink-negative) 5%, transparent)",
    },
    neutral: {
      start: "color-mix(in srgb, var(--atelier-craft-gold) 30%, transparent)",
      end: "color-mix(in srgb, var(--atelier-craft-gold) 5%, transparent)",
    },
    proposalA: {
      start:
        "color-mix(in srgb, var(--atelier-chart-proposal-a) 30%, transparent)",
      end: "color-mix(in srgb, var(--atelier-chart-proposal-a) 5%, transparent)",
    },
    proposalB: {
      start:
        "color-mix(in srgb, var(--atelier-chart-proposal-b) 30%, transparent)",
      end: "color-mix(in srgb, var(--atelier-chart-proposal-b) 5%, transparent)",
    },
    proposalC: {
      start:
        "color-mix(in srgb, var(--atelier-chart-proposal-c) 30%, transparent)",
      end: "color-mix(in srgb, var(--atelier-chart-proposal-c) 5%, transparent)",
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
    primaryRent: chartColors.neutral, // Copper for primary rent line
    historicalRent: chartColors.series[1], // Sage for historical comparison
    projectedRent: chartColors.series[2], // Blue-gray for projections
  },

  /**
   * NPV Sensitivity (Tornado Chart)
   */
  sensitivity: {
    positiveImpact: chartColors.positive, // Sage for positive variables
    negativeImpact: chartColors.negative, // Terracotta for negative variables
    baseline: chartColors.neutral, // Copper for baseline
  },

  /**
   * Cost Breakdown Chart
   */
  costBreakdown: {
    rent: chartColors.neutral, // Copper for rent costs
    staff: chartColors.series[1], // Sage for staff costs
    otherOpex: chartColors.series[2], // Blue-gray for other OpEx
    capex: chartColors.series[3], // Purple for CapEx
  },

  /**
   * Cash Flow Charts
   */
  cashFlow: {
    positive: chartColors.positive, // Sage for positive cash flow
    negative: chartColors.negative, // Terracotta for negative cash flow
    cumulative: chartColors.neutral, // Copper for cumulative line
    gradient: chartColors.gradients.positive, // Gradient fill for area
  },

  /**
   * Profitability Charts
   */
  profitability: {
    revenue: chartColors.positive, // Sage for revenue
    costs: chartColors.negative, // Terracotta for costs
    profit: chartColors.neutral, // Copper for profit
    ebitda: chartColors.series[2], // Blue-gray for EBITDA
  },
} as const;

/**
 * Atelier CSS Custom Property Definitions
 * These are already defined in globals.css under the Atelier system
 * This export documents the values for reference
 */
export const chartColorVars = {
  // Atelier financial semantic colors
  "--atelier-ink-positive": "#2D6A4F", // Forest green - gains
  "--atelier-ink-negative": "#9B2C2C", // Burgundy - losses
  "--atelier-ink-warning": "#92400E", // Deep amber - warnings
  "--atelier-craft-gold": "#B8860B", // Craft gold - neutral

  // Atelier chart proposal colors - Royal Palette
  "--atelier-chart-proposal-a": "#7C3AED", // Royal Violet
  "--atelier-chart-proposal-b": "#0891B2", // Ocean Teal
  "--atelier-chart-proposal-c": "#CA8A04", // Burnished Gold

  // Extended series colors
  "--atelier-chart-series-4": "#BE185D", // Rose
  "--atelier-chart-series-5": "#4F46E5", // Indigo
  "--atelier-chart-series-6": "#059669", // Emerald

  // Chart structure colors - Atelier stone palette
  "--atelier-stone-200": "#E7E5E4", // Subtle grid (light)
  "--atelier-stone-500": "#78716C", // Axis labels (light)
} as const;

/**
 * Dark Mode Adjustments
 * Atelier obsidian palette for dark theme
 */
export const chartColorVarsDark = {
  // Luminous variants for dark mode
  "--atelier-ink-positive": "#34D399", // Luminous emerald
  "--atelier-ink-negative": "#F87171", // Luminous coral
  "--atelier-ink-warning": "#FBBF24", // Luminous amber

  // Brighter chart colors for dark backgrounds
  "--atelier-chart-proposal-a": "#A78BFA", // Lighter violet
  "--atelier-chart-proposal-b": "#22D3EE", // Lighter cyan
  "--atelier-chart-proposal-c": "#FACC15", // Lighter gold

  // Stone palette inverts for dark mode
  "--atelier-stone-200": "#44403C", // Grid in dark mode
  "--atelier-stone-500": "#A8A29E", // Axis labels in dark mode
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
 * Migration Guide — Atelier Edition
 *
 * Replace hardcoded hex values with Atelier semantic colors:
 *
 * Before:
 * <Line stroke="#8b5cf6" />                    // Hardcoded purple
 * <Line stroke="#10b981" />                    // Hardcoded green
 * <Line stroke="#f43f5e" />                    // Hardcoded red
 * <CartesianGrid stroke="#e5e7eb" />           // Hardcoded gray
 *
 * After:
 * import { chartColors } from '@/lib/design-tokens/chart-colors';
 * <Line stroke={chartColors.proposalA} />       // Royal Violet
 * <Line stroke={chartColors.positive} />        // Forest green
 * <Line stroke={chartColors.negative} />        // Burgundy
 * <CartesianGrid stroke={chartColors.grid} />   // Atelier stone-200
 *
 * Proposal Colors:
 * - proposalA: Royal Violet (#7C3AED) - Primary proposal
 * - proposalB: Ocean Teal (#0891B2) - Secondary proposal
 * - proposalC: Burnished Gold (#CA8A04) - Tertiary proposal
 *
 * Financial Colors:
 * - positive: Forest green (#2D6A4F) - Gains, profits
 * - negative: Burgundy (#9B2C2C) - Losses, costs
 * - warning: Deep amber (#92400E) - Warnings
 * - neutral: Craft gold (#B8860B) - Neutral values
 *
 * Quick Reference: /src/lib/design-tokens/CHART_QUICK_REFERENCE.md
 * Full Migration Guide: /src/components/charts/MIGRATION_GUIDE.md
 */
