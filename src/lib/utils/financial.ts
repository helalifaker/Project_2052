/**
 * Financial Utility Functions
 *
 * CRITICAL: All financial amounts must display in Millions (M) with 2 decimals
 * As per GAP 8 and UI/UX Specifications
 */

import Decimal from "decimal.js";

/**
 * Format a number or Decimal value as Millions with 1 decimal place
 * @param value - The value to format (in SAR)
 * @returns Formatted string like "125.8" (no M suffix - shown in badge)
 *
 * @example
 * formatMillions(125750000) // "125.8"
 * formatMillions(new Decimal(125750000)) // "125.8"
 * formatMillions(-5000000) // "(5.0)" - negative in parentheses
 */
export function formatMillions(
  value: number | Decimal | null | undefined,
): string {
  if (value === null || value === undefined) {
    return "0.0";
  }

  const num = value instanceof Decimal ? value.toNumber() : value;
  const millions = num / 1_000_000;
  const formatted = millions.toFixed(1);

  // Negative values in parentheses (accounting format)
  if (millions < 0) {
    return `(${Math.abs(millions).toFixed(1)})`;
  }

  return formatted;
}

/**
 * Parse a millions-formatted string back to a number
 * @param str - String like "125.8" or "(5.0)"
 * @returns Number in SAR
 *
 * @example
 * parseMillions("125.8") // 125800000
 * parseMillions("(5.0)") // -5000000
 */
export function parseMillions(str: string): number {
  // Remove spaces and 'M' (for backwards compatibility)
  let cleaned = str.replace(/\s/g, "").replace("M", "");

  // Handle parentheses (negative)
  const isNegative = cleaned.includes("(");
  cleaned = cleaned.replace(/[()]/g, "");

  const num = parseFloat(cleaned);
  const result = num * 1_000_000;

  return isNegative ? -result : result;
}

/**
 * Get color class based on financial value
 * Minimalist approach: Red for negatives only, standard foreground for everything else
 * @param value - The value to check
 * @returns Tailwind color class
 */
export function getFinancialColorClass(value: number | Decimal): string {
  const num = value instanceof Decimal ? value.toNumber() : value;

  // Red for negatives only, standard foreground for positive and zero
  if (num < 0) {
    return "text-red-700 dark:text-red-400";
  }
  return "text-foreground";
}

/**
 * Format percentage with appropriate decimal places
 * @param value - Percentage value (e.g., 0.08 for 8%)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string like "8.0%"
 */
export function formatPercent(
  value: number | Decimal,
  decimals: number = 1,
): string {
  const num = value instanceof Decimal ? value.toNumber() : value;
  const percent = num * 100;
  return `${percent.toFixed(decimals)}%`;
}

/**
 * Format year range for financial tables
 * @param startYear - Start year
 * @param endYear - End year
 * @returns Formatted string like "2023-2024"
 */
export function formatYearRange(startYear: number, endYear: number): string {
  return `${startYear}-${endYear}`;
}

/**
 * Get year range presets based on dynamic period end year
 * @param dynamicEndYear - End year for dynamic period (2052 for 25 years, 2057 for 30 years)
 * @returns Year range presets for historical, transition, early/late dynamic periods
 */
export function getYearRanges(dynamicEndYear: number = 2057) {
  const dynamicStartYear = 2028;
  const earlyDynamicEnd = dynamicStartYear + 4; // First 5 years
  const lateDynamicStart = dynamicEndYear - 5;  // Last 5 years

  return {
    HISTORICAL: { start: 2023, end: 2024, label: "Historical" },
    TRANSITION: { start: 2025, end: 2027, label: "Transition" },
    EARLY_DYNAMIC: { start: dynamicStartYear, end: earlyDynamicEnd, label: "Early Dynamic" },
    LATE_DYNAMIC: { start: lateDynamicStart, end: dynamicEndYear, label: "Late Dynamic" },
    ALL: { start: 2023, end: dynamicEndYear, label: "All Years" },
  } as const;
}

/**
 * Legacy constant for backward compatibility (defaults to 30-year period)
 * @deprecated Use getYearRanges() instead for dynamic period support
 */
export const YEAR_RANGES = getYearRanges(2057);

export type YearRangeKey = keyof ReturnType<typeof getYearRanges>;

/**
 * Calculate Net Present Value (NPV)
 * @param cashFlows - Array of net cash flows (ordered by year)
 * @param discountRate - Discount rate as a decimal (e.g., 0.08 for 8%)
 * @returns NPV as a Decimal
 */
export function calculateNPV(
  cashFlows: Array<Decimal.Value>,
  discountRate: Decimal.Value,
): Decimal {
  const rate = new Decimal(discountRate);

  return cashFlows.reduce<Decimal>((npv, cf, index) => {
    const cashFlow = new Decimal(cf);
    const discountFactor = rate.plus(1).pow(index);
    return npv.plus(cashFlow.dividedBy(discountFactor));
  }, new Decimal(0));
}

/**
 * Calculate Internal Rate of Return (IRR)
 * Uses Newton-Raphson method for approximation
 * @param cashFlows - Array of net cash flows
 * @returns IRR as a percentage (e.g., 12.5 for 12.5%)
 */
export function calculateIRR(
  cashFlows: Array<Decimal.Value>,
  initialGuess: Decimal.Value = 0.1,
  maxIterations = 100,
  tolerance: Decimal.Value = 0.00001,
): Decimal | null {
  let rate = new Decimal(initialGuess);
  const tol = new Decimal(tolerance);

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    const npv = calculateNPV(cashFlows, rate);

    // Derivative of NPV with respect to rate
    const derivative = cashFlows.reduce<Decimal>((sum, cf, index) => {
      if (index === 0) return sum;
      const t = new Decimal(index);
      const cashFlow = new Decimal(cf);
      const discountFactor = rate.plus(1).pow(index + 1);
      return sum.minus(cashFlow.mul(t).dividedBy(discountFactor));
    }, new Decimal(0));

    if (derivative.abs().lessThan(tol)) {
      return null;
    }

    const newRate = rate.minus(npv.dividedBy(derivative));

    if (newRate.minus(rate).abs().lessThan(tol)) {
      return newRate;
    }

    rate = newRate;
  }

  return null;
}
