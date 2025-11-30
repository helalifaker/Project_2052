/**
 * Chart Components Index
 *
 * Centralized exports for all chart components.
 * Import from this file for clean, consistent imports.
 *
 * @example
 * ```tsx
 * import { BaseLineChart, BaseBarChart, CustomTooltip } from '@/components/charts';
 * ```
 */

// Base Chart Components
export { BaseLineChart } from './BaseLineChart';
export { BaseBarChart } from './BaseBarChart';
export { BaseAreaChart } from './BaseAreaChart';

// Tooltip Components
export {
  CustomTooltip,
  FinancialTooltip,
  PercentTooltip,
  NumberTooltip
} from './CustomTooltip';

// Loading States
export { ChartSkeleton } from './ChartSkeleton';

// Re-export types
export type { DataSeries } from './BaseLineChart';
export type { BarSeries } from './BaseBarChart';
export type { AreaSeries } from './BaseAreaChart';
