/**
 * Format currency in Millions with M suffix
 * Examples: €1.2M, €-0.5M, €120.5M
 */
export function formatCurrency(value: number, decimals: number = 1): string {
  const millions = value / 1_000_000;
  const formatted = millions.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `€${formatted}M`;
}

/**
 * Format percentage
 * Examples: 12.5%, -3.2%, 0.0%
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format number with thousands separator
 * Examples: 1,234.5, -567.8
 */
export function formatNumber(value: number, decimals: number = 1): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format date to locale string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format date and time
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
