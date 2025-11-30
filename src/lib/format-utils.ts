import Decimal from "decimal.js";

/**
 * Safely converts any value to a number.
 * Returns 0 if the value is invalid, null, or undefined.
 */
export function safeNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return isNaN(value) ? 0 : value;
  if (value instanceof Decimal) return value.toNumber();
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  // Handle Prisma Decimal or other objects with toNumber
  if (typeof value === "object" && value !== null && "toNumber" in value) {
    try {
      return (value as { toNumber: () => number }).toNumber();
    } catch {
      return 0;
    }
  }
  return 0;
}

/**
 * Formats a number as currency (SAR).
 * e.g., 1000000 -> "1,000,000 SAR"
 */
export function formatCurrency(value: unknown, decimals = 0): string {
  const num = safeNumber(value);
  return (
    new Intl.NumberFormat("en-SA", {
      style: "decimal",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num) + " SAR"
  );
}

/**
 * Formats a number in Millions.
 * e.g., 1500000 -> "1.5M"
 */
export function formatMillions(value: unknown, decimals = 1): string {
  const num = safeNumber(value);
  if (num === 0) return "0.0M";
  return (num / 1_000_000).toFixed(decimals) + "M";
}

/**
 * Formats a number as a percentage.
 * e.g., 0.15 -> "15.0%"
 */
export function formatPercent(value: unknown, decimals = 1): string {
  const num = safeNumber(value);
  return (num * 100).toFixed(decimals) + "%";
}

/**
 * Formats a number with commas.
 * e.g., 1000 -> "1,000"
 */
export function formatNumber(value: unknown, decimals = 0): string {
  const num = safeNumber(value);
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}
