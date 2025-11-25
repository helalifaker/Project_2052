/**
 * PHASE 2: CORE FINANCIAL ENGINE - DECIMAL UTILITIES
 *
 * This file provides safe arithmetic operations using Decimal.js.
 * All financial calculations MUST use these utilities to ensure precision
 * and avoid floating-point errors that could cause balance sheet imbalances.
 *
 * Key principles:
 * - Never use JavaScript's native +, -, *, / operators on Decimals
 * - Always use these wrapper functions
 * - Handle edge cases (division by zero, negative square roots, etc.)
 * - Maintain immutability (all operations return new Decimal instances)
 */

import Decimal from "decimal.js";
import { ZERO, ONE, NEGATIVE_ONE } from "./constants";
import type { DecimalInput } from "./types";

// ============================================================================
// BASIC ARITHMETIC OPERATIONS
// ============================================================================

/**
 * Safe addition: a + b
 */
export function add(a: Decimal, b: Decimal): Decimal {
  return a.plus(b);
}

/**
 * Safe subtraction: a - b
 */
export function subtract(a: Decimal, b: Decimal): Decimal {
  return a.minus(b);
}

/**
 * Safe multiplication: a * b
 */
export function multiply(a: Decimal, b: Decimal): Decimal {
  return a.times(b);
}

/**
 * Safe division: a / b
 * @throws Error if b is zero
 */
export function divide(a: Decimal, b: Decimal): Decimal {
  if (b.isZero()) {
    throw new Error("Division by zero");
  }
  return a.dividedBy(b);
}

/**
 * Safe division with default: a / b, returns defaultValue if b is zero
 */
export function divideSafe(
  a: Decimal,
  b: Decimal,
  defaultValue: Decimal = ZERO,
): Decimal {
  if (b.isZero()) {
    return defaultValue;
  }
  return a.dividedBy(b);
}

/**
 * Absolute value: |a|
 */
export function abs(a: Decimal): Decimal {
  return a.abs();
}

/**
 * Negate: -a
 */
export function negate(a: Decimal): Decimal {
  return a.negated();
}

/**
 * Power: a^b
 */
export function power(a: Decimal, b: number | Decimal): Decimal {
  return a.pow(b);
}

/**
 * Square root: √a
 * @throws Error if a is negative
 */
export function sqrt(a: Decimal): Decimal {
  if (a.isNegative()) {
    throw new Error("Cannot take square root of negative number");
  }
  return a.sqrt();
}

// ============================================================================
// COMPARISON OPERATIONS
// ============================================================================

/**
 * Check if a > b
 */
export function isGreaterThan(a: Decimal, b: Decimal): boolean {
  return a.greaterThan(b);
}

/**
 * Check if a >= b
 */
export function isGreaterThanOrEqual(a: Decimal, b: Decimal): boolean {
  return a.greaterThanOrEqualTo(b);
}

/**
 * Check if a < b
 */
export function isLessThan(a: Decimal, b: Decimal): boolean {
  return a.lessThan(b);
}

/**
 * Check if a <= b
 */
export function isLessThanOrEqual(a: Decimal, b: Decimal): boolean {
  return a.lessThanOrEqualTo(b);
}

/**
 * Check if a == b (exact equality)
 */
export function isEqual(a: Decimal, b: Decimal): boolean {
  return a.equals(b);
}

/**
 * Check if a is zero
 */
export function isZero(a: Decimal): boolean {
  return a.isZero();
}

/**
 * Check if a is positive (> 0)
 */
export function isPositive(a: Decimal): boolean {
  return a.greaterThan(ZERO);
}

/**
 * Check if a is negative (< 0)
 */
export function isNegative(a: Decimal): boolean {
  return a.lessThan(ZERO);
}

// ============================================================================
// AGGREGATE OPERATIONS
// ============================================================================

/**
 * Sum an array of Decimals
 */
export function sum(values: Decimal[]): Decimal {
  return values.reduce((acc, val) => add(acc, val), ZERO);
}

/**
 * Average of an array of Decimals
 */
export function average(values: Decimal[]): Decimal {
  if (values.length === 0) {
    return ZERO;
  }
  return divide(sum(values), new Decimal(values.length));
}

/**
 * Maximum of an array of Decimals
 */
export function max(...values: Decimal[]): Decimal {
  if (values.length === 0) {
    throw new Error("Cannot find max of empty array");
  }
  return Decimal.max(...values);
}

/**
 * Minimum of an array of Decimals
 */
export function min(...values: Decimal[]): Decimal {
  if (values.length === 0) {
    throw new Error("Cannot find min of empty array");
  }
  return Decimal.min(...values);
}

// ============================================================================
// FINANCIAL OPERATIONS
// ============================================================================

/**
 * Calculate percentage: value * (percent / 100)
 * Example: percentageOf(1000, 5) = 50 (5% of 1000)
 */
export function percentageOf(value: Decimal, percent: Decimal): Decimal {
  return multiply(value, divide(percent, new Decimal(100)));
}

/**
 * Apply growth rate: value * (1 + rate)
 * Example: applyGrowth(1000, 0.05) = 1050 (5% growth)
 */
export function applyGrowth(value: Decimal, rate: Decimal): Decimal {
  return multiply(value, add(ONE, rate));
}

/**
 * Calculate compound growth: value * (1 + rate)^periods
 * Example: compoundGrowth(1000, 0.05, 3) = 1157.625 (5% growth for 3 periods)
 */
export function compoundGrowth(
  value: Decimal,
  rate: Decimal,
  periods: number,
): Decimal {
  return multiply(value, power(add(ONE, rate), periods));
}

/**
 * Calculate depreciation (straight-line): cost / usefulLife
 */
export function straightLineDepreciation(
  cost: Decimal,
  usefulLife: number,
): Decimal {
  if (usefulLife <= 0) {
    throw new Error("Useful life must be positive");
  }
  return divide(cost, new Decimal(usefulLife));
}

/**
 * Calculate depreciation (declining balance): nbv * rate
 */
export function decliningBalanceDepreciation(
  netBookValue: Decimal,
  rate: Decimal,
): Decimal {
  return multiply(netBookValue, rate);
}

/**
 * Calculate interest: principal * rate
 * Example: calculateInterest(10000, 0.05) = 500
 */
export function calculateInterest(principal: Decimal, rate: Decimal): Decimal {
  return multiply(principal, rate);
}

/**
 * Calculate Zakat based on (Equity - Non-Current Assets) × Rate
 *
 * Per 04_FINANCIAL_RULES.md Section 1.9:
 * - Zakat Base = Equity - Non-Current Assets (Net Working Capital approach)
 * - Zakat = Zakat Base × Zakat Rate (e.g., 2.5% for Saudi Arabia)
 * - If Zakat Base ≤ 0, then Zakat = 0
 *
 * @param equity - Total equity from balance sheet
 * @param nonCurrentAssets - Non-current assets (primarily fixed assets NBV)
 * @param zakatRate - Zakat rate (e.g., 0.025 for 2.5%)
 * @returns Zakat expense
 */
export function calculateZakat(
  equity: Decimal,
  nonCurrentAssets: Decimal,
  zakatRate: Decimal,
): Decimal {
  const zakatBase = subtract(equity, nonCurrentAssets);
  if (isLessThanOrEqual(zakatBase, ZERO)) {
    return ZERO;
  }
  return multiply(zakatBase, zakatRate);
}

/**
 * Round to nearest cent (2 decimal places)
 */
export function roundToNearest(value: Decimal, decimals: number = 2): Decimal {
  return value.toDecimalPlaces(decimals, Decimal.ROUND_HALF_UP);
}

/**
 * Ensure minimum value: max(value, minimum)
 */
export function ensureMinimum(value: Decimal, minimum: Decimal): Decimal {
  return max(value, minimum);
}

/**
 * Ensure maximum value: min(value, maximum)
 */
export function ensureMaximum(value: Decimal, maximum: Decimal): Decimal {
  return min(value, maximum);
}

/**
 * Clamp value between min and max
 */
export function clamp(
  value: Decimal,
  minimum: Decimal,
  maximum: Decimal,
): Decimal {
  return min(max(value, minimum), maximum);
}

// ============================================================================
// CONVERSION UTILITIES
// ============================================================================

/**
 * Convert various inputs to Decimal
 */
export function toDecimal(value: DecimalInput): Decimal {
  if (value instanceof Decimal) {
    return value;
  }
  return new Decimal(value);
}

/**
 * Convert Decimal to number (use with caution - may lose precision!)
 */
export function toNumber(value: Decimal): number {
  return value.toNumber();
}

/**
 * Convert Decimal to string with fixed decimal places
 */
export function toFixed(value: Decimal, decimals: number = 2): string {
  return value.toFixed(decimals);
}

/**
 * Format Decimal as currency (SAR)
 */
export function formatCurrency(value: Decimal, decimals: number = 2): string {
  return `SAR ${value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

/**
 * Format Decimal as percentage
 */
export function formatPercent(value: Decimal, decimals: number = 2): string {
  return `${multiply(value, new Decimal(100)).toFixed(decimals)}%`;
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate that value is within range [min, max]
 */
export function isInRange(
  value: Decimal,
  minimum: Decimal,
  maximum: Decimal,
): boolean {
  return (
    isGreaterThanOrEqual(value, minimum) && isLessThanOrEqual(value, maximum)
  );
}

/**
 * Validate that value is non-negative
 */
export function isNonNegative(value: Decimal): boolean {
  return isGreaterThanOrEqual(value, ZERO);
}

/**
 * Validate that value is strictly positive
 */
export function isStrictlyPositive(value: Decimal): boolean {
  return isGreaterThan(value, ZERO);
}

/**
 * Check if value is within tolerance of target
 */
export function isWithinTolerance(
  value: Decimal,
  target: Decimal,
  tolerance: Decimal,
): boolean {
  return abs(subtract(value, target)).lessThanOrEqualTo(tolerance);
}

// ============================================================================
// ARRAY UTILITIES FOR FINANCIAL CALCULATIONS
// ============================================================================

/**
 * Calculate Net Present Value (NPV)
 * @param cashFlows Array of cash flows (index 0 = year 0)
 * @param discountRate Discount rate (e.g., 0.1 for 10%)
 */
export function calculateNPV(
  cashFlows: Decimal[],
  discountRate: Decimal,
): Decimal {
  return cashFlows.reduce((npv, cashFlow, index) => {
    const discountFactor = power(add(ONE, discountRate), index);
    return add(npv, divide(cashFlow, discountFactor));
  }, ZERO);
}

/**
 * Calculate Internal Rate of Return (IRR) using Newton-Raphson method
 * @param cashFlows Array of cash flows (index 0 = initial investment, typically negative)
 * @param guess Initial guess for IRR (default 0.1 = 10%)
 * @param maxIterations Maximum iterations for convergence
 * @param tolerance Convergence tolerance
 */
export function calculateIRR(
  cashFlows: Decimal[],
  guess: Decimal = new Decimal(0.1),
  maxIterations: number = 100,
  tolerance: Decimal = new Decimal(0.0001),
): Decimal | null {
  let rate = guess;

  for (let i = 0; i < maxIterations; i++) {
    const npv = calculateNPV(cashFlows, rate);

    // Calculate derivative (NPV')
    const derivative = cashFlows.reduce((sum, cashFlow, index) => {
      if (index === 0) return sum;
      const discountFactor = power(add(ONE, rate), index + 1);
      return subtract(
        sum,
        divide(multiply(cashFlow, new Decimal(index)), discountFactor),
      );
    }, ZERO);

    if (abs(derivative).lessThan(tolerance)) {
      return null; // Cannot converge
    }

    const newRate = subtract(rate, divide(npv, derivative));

    if (abs(subtract(newRate, rate)).lessThan(tolerance)) {
      return newRate; // Converged
    }

    rate = newRate;
  }

  return null; // Did not converge
}

/**
 * Calculate Return on Equity (ROE): Net Income / Equity
 */
export function calculateROE(netIncome: Decimal, equity: Decimal): Decimal {
  return divideSafe(netIncome, equity, ZERO);
}

/**
 * Calculate Debt-to-Equity Ratio: Debt / Equity
 */
export function calculateDebtToEquity(debt: Decimal, equity: Decimal): Decimal {
  return divideSafe(debt, equity, ZERO);
}
