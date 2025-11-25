/**
 * PHASE 2: CORE FINANCIAL ENGINE - DECIMAL CONSTANTS
 *
 * This file contains all pre-computed Decimal.js constants used throughout
 * the financial calculation engine. Pre-creating constants improves performance
 * by avoiding repeated object instantiation.
 *
 * All constants are created using the global Decimal.js configuration from
 * src/lib/decimal-config.ts (precision: 20, rounding: HALF_UP)
 */

import Decimal from "decimal.js";

// ============================================================================
// NUMERIC CONSTANTS
// ============================================================================

export const ZERO = new Decimal(0);
export const ONE = new Decimal(1);
export const NEGATIVE_ONE = new Decimal(-1);
export const TWO = new Decimal(2);
export const TEN = new Decimal(10);
export const HUNDRED = new Decimal(100);
export const THOUSAND = new Decimal(1000);
export const MILLION = new Decimal(1000000);

// ============================================================================
// PERCENTAGE CONSTANTS
// ============================================================================

export const ONE_PERCENT = new Decimal(0.01);
export const FIVE_PERCENT = new Decimal(0.05);
export const TEN_PERCENT = new Decimal(0.1);
export const TWENTY_PERCENT = new Decimal(0.2);
export const FIFTY_PERCENT = new Decimal(0.5);

// ============================================================================
// FINANCIAL RATE CONSTANTS (Default values - overridden by SystemConfig)
// ============================================================================

export const DEFAULT_ZAKAT_RATE = new Decimal(0.025); // 2.5%
export const DEFAULT_DEBT_INTEREST_RATE = new Decimal(0.05); // 5%
export const DEFAULT_DEPOSIT_INTEREST_RATE = new Decimal(0.02); // 2%
export const DEFAULT_MIN_CASH_BALANCE = new Decimal(1000000); // 1M SAR

// ============================================================================
// CALCULATION TOLERANCE CONSTANTS
// ============================================================================

// Balance sheet balancing tolerance (GAP 12)
export const BALANCE_SHEET_TOLERANCE = new Decimal(0.01); // $0.01

// Cash flow reconciliation tolerance
export const CASH_FLOW_TOLERANCE = new Decimal(0.01); // $0.01

// Circular solver convergence tolerance (GAP 11)
export const CONVERGENCE_TOLERANCE = new Decimal(0.01); // $0.01

// Excel validation tolerance
export const EXCEL_VALIDATION_TOLERANCE = new Decimal(100); // $100

// ============================================================================
// CIRCULAR SOLVER CONSTANTS (GAP 11)
// ============================================================================

export const DEFAULT_MAX_ITERATIONS = 100;
export const DEFAULT_RELAXATION_FACTOR = new Decimal(0.5); // For stability
export const MIN_CONVERGENCE_ITERATIONS = 2; // Minimum iterations before checking convergence

// ============================================================================
// DEPRECIATION CONSTANTS (GAP 1)
// ============================================================================

export const DECLINING_BALANCE_RATE_200 = new Decimal(2.0); // 200% declining balance
export const DECLINING_BALANCE_RATE_150 = new Decimal(1.5); // 150% declining balance

// ============================================================================
// WORKING CAPITAL RATIO DEFAULTS (GAP 2)
// ============================================================================

// Default ratios if not calculated from 2024
export const DEFAULT_AR_PERCENT = new Decimal(0.1); // 10% of revenue
export const DEFAULT_PREPAID_PERCENT = new Decimal(0.05); // 5% of OpEx
export const DEFAULT_AP_PERCENT = new Decimal(0.08); // 8% of OpEx
export const DEFAULT_ACCRUED_PERCENT = new Decimal(0.05); // 5% of OpEx
export const DEFAULT_DEFERRED_REVENUE_PERCENT = new Decimal(0.15); // 15% of revenue

// ============================================================================
// ENROLLMENT CONSTANTS (GAP 20)
// ============================================================================

export const MIN_STUDENTS = ZERO;
export const MAX_STUDENTS = new Decimal(10000); // Reasonable upper limit

// ============================================================================
// RENT MODEL CONSTANTS
// ============================================================================

// Fixed Escalation
export const DEFAULT_RENT_ESCALATION = new Decimal(0.03); // 3% annual escalation

// Revenue Share
export const MIN_REVENUE_SHARE_PERCENT = ZERO;
export const MAX_REVENUE_SHARE_PERCENT = ONE; // 100%

// ============================================================================
// YEAR RANGE CONSTANTS
// ============================================================================

export const HISTORICAL_START_YEAR = 2023;
export const HISTORICAL_END_YEAR = 2024;
export const TRANSITION_START_YEAR = 2025;
export const TRANSITION_END_YEAR = 2027;
export const DYNAMIC_START_YEAR = 2028;
export const DYNAMIC_END_YEAR = 2053;
export const TOTAL_PROJECTION_YEARS = 30; // 2024-2053

// ============================================================================
// VALIDATION CONSTANTS
// ============================================================================

export const MIN_COVERAGE_PERCENT = new Decimal(0.9); // 90% test coverage target

// ============================================================================
// PERFORMANCE CONSTANTS
// ============================================================================

export const TARGET_CALCULATION_TIME_MS = 1000; // <1 second for 30 years
export const TARGET_PER_YEAR_TIME_MS = 40; // ~40ms per year average

// ============================================================================
// HELPER FUNCTIONS FOR COMMON CONVERSIONS
// ============================================================================

/**
 * Convert a percentage to decimal (e.g., 5% -> 0.05)
 */
export function percentToDecimal(percent: Decimal): Decimal {
  return percent.dividedBy(HUNDRED);
}

/**
 * Convert a decimal to percentage (e.g., 0.05 -> 5%)
 */
export function decimalToPercent(decimal: Decimal): Decimal {
  return decimal.times(HUNDRED);
}

/**
 * Check if a value is effectively zero (within tolerance)
 */
export function isEffectivelyZero(
  value: Decimal,
  tolerance: Decimal = CONVERGENCE_TOLERANCE,
): boolean {
  return value.abs().lessThanOrEqualTo(tolerance);
}

/**
 * Check if two values are effectively equal (within tolerance)
 */
export function areEffectivelyEqual(
  a: Decimal,
  b: Decimal,
  tolerance: Decimal = CONVERGENCE_TOLERANCE,
): boolean {
  return a.minus(b).abs().lessThanOrEqualTo(tolerance);
}
