/**
 * Financial Utility Functions
 *
 * CRITICAL: All financial amounts must display in Millions (M) with 2 decimals
 * As per GAP 8 and UI/UX Specifications
 */

import Decimal from "decimal.js";

/**
 * Format a number or Decimal value as Millions with 2 decimal places
 * @param value - The value to format (in SAR)
 * @returns Formatted string like "125.75 M"
 *
 * @example
 * formatMillions(125750000) // "125.75 M"
 * formatMillions(new Decimal(125750000)) // "125.75 M"
 * formatMillions(-5000000) // "(5.00 M)" - negative in parentheses
 */
export function formatMillions(
  value: number | Decimal | null | undefined,
): string {
  if (value === null || value === undefined) {
    return "0.00 M";
  }

  const num = value instanceof Decimal ? value.toNumber() : value;
  const millions = num / 1_000_000;
  const formatted = millions.toFixed(2);

  // Negative values in parentheses (accounting format)
  if (millions < 0) {
    return `(${Math.abs(millions).toFixed(2)} M)`;
  }

  return `${formatted} M`;
}

/**
 * Parse a millions-formatted string back to a number
 * @param str - String like "125.75 M" or "(5.00 M)"
 * @returns Number in SAR
 *
 * @example
 * parseMillions("125.75 M") // 125750000
 * parseMillions("(5.00 M)") // -5000000
 */
export function parseMillions(str: string): number {
  // Remove spaces and 'M'
  let cleaned = str.replace(/\s/g, "").replace("M", "");

  // Handle parentheses (negative)
  const isNegative = cleaned.includes("(");
  cleaned = cleaned.replace(/[()]/g, "");

  const num = parseFloat(cleaned);
  const result = num * 1_000_000;

  return isNegative ? -result : result;
}

/**
 * Get color class based on financial value (positive/negative/zero)
 * @param value - The value to check
 * @returns Tailwind color class
 */
export function getFinancialColorClass(value: number | Decimal): string {
  const num = value instanceof Decimal ? value.toNumber() : value;

  if (num > 0) {
    return "text-foreground"; // Standard text color for positive
  } else if (num < 0) {
    return "text-destructive"; // Red for negative (shadcn standard)
  } else {
    return "text-muted-foreground"; // Muted for zero
  }
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
 * Get year range preset
 */
export const YEAR_RANGES = {
  HISTORICAL: { start: 2023, end: 2024, label: "Historical" },
  TRANSITION: { start: 2025, end: 2027, label: "Transition" },
  EARLY_DYNAMIC: { start: 2028, end: 2032, label: "Early Dynamic" },
  LATE_DYNAMIC: { start: 2048, end: 2053, label: "Late Dynamic" },
  ALL: { start: 2023, end: 2053, label: "All Years" },
} as const;

export type YearRangeKey = keyof typeof YEAR_RANGES;
