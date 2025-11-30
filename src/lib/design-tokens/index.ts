/**
 * Design Tokens - Central Export
 *
 * Week 1 UI/UX Transformation Foundation
 * Executive Luxury aesthetic with Sahara Twilight theme
 *
 * Import everything from one place:
 * import { typography, spacing, chartColors } from '@/lib/design-tokens';
 */

export { typography, getTypographyClass, typographyVars } from './typography';
export { spacing, componentPadding, semanticSpacing, borderRadius, componentRadius, spacingVars } from './spacing';
export { chartColors, chartColorMappings, chartColorVars, chartColorVarsDark, getSeriesColor, getProposalColor } from './chart-colors';
export {
  chartTypography,
  chartSpacing,
  chartGrid,
  chartAxis,
  chartTooltipStyle,
  chartLegendStyle,
  chartAnimation,
  chartResponsive,
  lineChartConfig,
  barChartConfig,
  areaChartConfig,
  pieChartConfig,
  getAxisProps,
  getGridProps,
  getTooltipProps,
  getLegendProps,
} from './chart-config';
export { shadows, shadowsDark, componentShadows, shadowVars, shadowVarsDark, getComponentShadow } from './elevation';
