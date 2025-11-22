import Decimal from "decimal.js";

/**
 * CRITICAL: ALL financial amounts display in millions with 2 decimals
 * Example: 125300000 → "125.30 M"
 */
export function formatMillions(value: Decimal): string {
  const millions = value.div(1_000_000);
  return `${millions.toFixed(2)} M`;
}

export function parseMillions(str: string): Decimal {
  // "125.30 M" → 125300000
  const num = parseFloat(str.replace(" M", ""));
  return new Decimal(num).times(1_000_000);
}
