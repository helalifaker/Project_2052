/**
 * Period Constants
 *
 * Centralized year and period constants for the financial projection system.
 * Re-exports core constants from the engine and adds UI-specific helpers.
 *
 * The projection system has three periods:
 * - Historical: 2023-2024 (actual data)
 * - Transition: 2025-2027 (bridge period)
 * - Dynamic: 2028-2052/2057 (full projections based on contract length)
 */

// Re-export core year constants from engine
export {
  HISTORICAL_START_YEAR,
  HISTORICAL_END_YEAR,
  TRANSITION_START_YEAR,
  TRANSITION_END_YEAR,
  DYNAMIC_START_YEAR,
  getDynamicEndYear,
  getTotalPeriodCount,
} from "@/lib/engine/core/constants";

// ============================================================================
// PERIOD LABELS (for UI display)
// ============================================================================

/**
 * Human-readable labels for period display
 */
export const PERIOD_LABELS = {
  historical: "Historical",
  transition: "Transition",
  dynamic: "Dynamic",
} as const;

/**
 * Period descriptions for tooltips and help text
 */
export const PERIOD_DESCRIPTIONS = {
  historical: "Actual financial data from 2023-2024",
  transition: "Bridge period assumptions for 2025-2027",
  dynamic: "Full projections based on proposal parameters",
} as const;

/**
 * Year range display strings
 */
export const PERIOD_YEAR_RANGES = {
  historical: "2023 - 2024",
  transition: "2025 - 2027",
  /** Dynamic period depends on contract length - use getDynamicYearRange() */
} as const;

// ============================================================================
// DEFAULT YEARS FOR FORMS
// ============================================================================

/**
 * Default ramp-up end year (5-year ramp from 2028 to 2032)
 */
export const DEFAULT_RAMP_UP_END_YEAR = 2032;

/**
 * Default IB program start year
 */
export const DEFAULT_IB_START_YEAR = 2028;

/**
 * Contract period options
 */
export const CONTRACT_PERIOD_OPTIONS = [25, 30] as const;

/**
 * Default contract period in years
 */
export const DEFAULT_CONTRACT_PERIOD_YEARS = 30;

// ============================================================================
// YEAR RANGE HELPERS
// ============================================================================

/**
 * Get the dynamic period year range string based on contract length
 * @param contractPeriodYears - 25 or 30 years
 * @returns String like "2028 - 2052" or "2028 - 2057"
 */
export function getDynamicYearRange(contractPeriodYears: 25 | 30 = 30): string {
  const endYear = 2028 + contractPeriodYears - 1;
  return `2028 - ${endYear}`;
}

/**
 * Get all period year range strings
 * @param contractPeriodYears - 25 or 30 years
 */
export function getAllPeriodYearRanges(contractPeriodYears: 25 | 30 = 30) {
  return {
    historical: PERIOD_YEAR_RANGES.historical,
    transition: PERIOD_YEAR_RANGES.transition,
    dynamic: getDynamicYearRange(contractPeriodYears),
  };
}

/**
 * Historical years as array for iteration
 */
export const HISTORICAL_YEARS = [2023, 2024] as const;

/**
 * Transition years as array for iteration
 */
export const TRANSITION_YEARS = [2025, 2026, 2027] as const;

/**
 * Get dynamic years as array based on contract length
 * @param contractPeriodYears - 25 or 30 years
 * @returns Array of years from 2028 to end year
 */
export function getDynamicYears(contractPeriodYears: 25 | 30 = 30): number[] {
  const endYear = 2028 + contractPeriodYears - 1;
  const years: number[] = [];
  for (let year = 2028; year <= endYear; year++) {
    years.push(year);
  }
  return years;
}

/**
 * Get all projection years as array
 * @param contractPeriodYears - 25 or 30 years
 * @returns Array of all years from 2023 to contract end
 */
export function getAllProjectionYears(
  contractPeriodYears: 25 | 30 = 30,
): number[] {
  return [
    ...HISTORICAL_YEARS,
    ...TRANSITION_YEARS,
    ...getDynamicYears(contractPeriodYears),
  ];
}

// ============================================================================
// YEAR RANGE PRESETS (for chart filters)
// ============================================================================

/**
 * Preset year ranges for chart filtering
 */
export const YEAR_RANGE_PRESETS = {
  /** First 10 years from historical start */
  firstDecade: { start: 2023, end: 2033, label: "First 10 Years" },
  /** Full projection period for 25-year contract */
  full25Year: { start: 2023, end: 2052, label: "Full 25-Year" },
  /** Full projection period for 30-year contract */
  full30Year: { start: 2023, end: 2057, label: "Full 30-Year" },
} as const;

/**
 * Get year range preset options based on contract length
 * @param contractPeriodYears - 25 or 30 years
 */
export function getYearRangeOptions(contractPeriodYears: 25 | 30 = 30) {
  const endYear = 2028 + contractPeriodYears - 1;
  return [
    { value: "decade", label: "First 10 Years", start: 2023, end: 2033 },
    {
      value: "full",
      label: `Full ${contractPeriodYears}-Year`,
      start: 2023,
      end: endYear,
    },
    { value: "custom", label: "Custom Range", start: 2023, end: endYear },
  ];
}
