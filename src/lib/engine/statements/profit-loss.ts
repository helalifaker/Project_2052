/**
 * PHASE 2: FINANCIAL STATEMENTS - PROFIT & LOSS GENERATOR
 *
 * This module provides functions to generate Profit & Loss (P&L) statements
 * from calculated financial data.
 *
 * P&L Formula:
 * Revenue
 * - Rent
 * - Staff Costs
 * - Other OpEx
 * = EBITDA
 * - Depreciation
 * = EBIT
 * - Interest
 * = EBT
 * - Zakat (2.5% of EBT if positive)
 * = Net Income
 */

import Decimal from "decimal.js";
import type { ProfitLossStatement } from "../core/types";
import { add, subtract, multiply } from "../core/decimal-utils";
import { ZERO } from "../core/constants";
import { ZAKAT_RATE } from "../../decimal-config";

export type { ProfitLossStatement } from "../core/types";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Input data for P&L statement generation
 */
export interface ProfitLossInput {
  year: number;

  // Revenue
  tuitionRevenue: Decimal;
  otherRevenue: Decimal;

  // Operating Expenses
  rentExpense: Decimal;
  staffCosts: Decimal;
  otherOpex: Decimal;

  // Depreciation
  depreciation: Decimal;

  // Interest
  interestExpense: Decimal;
  interestIncome: Decimal;

  // Zakat (pre-calculated by circular solver)
  zakatExpense: Decimal;
}

// ============================================================================
// P&L GENERATION FUNCTIONS
// ============================================================================

/**
 * Generate a complete Profit & Loss statement
 *
 * This function calculates all P&L line items following the standard formula:
 * - Total Revenue = Tuition + Other
 * - Total OpEx = Rent + Staff + Other
 * - EBITDA = Revenue - OpEx
 * - EBIT = EBITDA - Depreciation
 * - EBT = EBIT - Net Interest
 * - Zakat = 2.5% of EBT (if positive)
 * - Net Income = EBT - Zakat
 *
 * @param input P&L input data
 * @returns Complete P&L statement
 */
export function generateProfitLossStatement(
  input: ProfitLossInput,
): ProfitLossStatement {
  // ==========================================================================
  // REVENUE
  // ==========================================================================

  const tuitionRevenue = input.tuitionRevenue;
  const otherRevenue = input.otherRevenue;
  const totalRevenue = add(tuitionRevenue, otherRevenue);

  // ==========================================================================
  // OPERATING EXPENSES
  // ==========================================================================

  const rentExpense = input.rentExpense;
  const staffCosts = input.staffCosts;
  const otherOpex = input.otherOpex;
  const totalOpex = add(add(rentExpense, staffCosts), otherOpex);

  // ==========================================================================
  // EBITDA
  // ==========================================================================

  const ebitda = subtract(totalRevenue, totalOpex);

  // ==========================================================================
  // DEPRECIATION & EBIT
  // ==========================================================================

  const depreciation = input.depreciation;
  const ebit = subtract(ebitda, depreciation);

  // ==========================================================================
  // INTEREST & EBT
  // ==========================================================================

  const interestExpense = input.interestExpense;
  const interestIncome = input.interestIncome;
  const netInterest = subtract(interestExpense, interestIncome);
  const ebt = subtract(ebit, netInterest);

  // ==========================================================================
  // ZAKAT
  // ==========================================================================

  // Zakat is pre-calculated by the circular solver using the formula:
  // (Equity - Non-Current Assets) × zakatRate
  const zakatExpense = input.zakatExpense;

  // ==========================================================================
  // NET INCOME
  // ==========================================================================

  const netIncome = subtract(ebt, zakatExpense);

  // ==========================================================================
  // RETURN STATEMENT
  // ==========================================================================

  return {
    year: input.year,

    // Revenue
    tuitionRevenue,
    otherRevenue,
    totalRevenue,

    // Operating Expenses
    rentExpense,
    staffCosts,
    otherOpex,
    totalOpex,

    // EBITDA
    ebitda,

    // Depreciation
    depreciation,

    // EBIT
    ebit,

    // Interest
    interestExpense,
    interestIncome,
    netInterest,

    // EBT
    ebt,

    // Zakat
    zakatExpense,

    // Net Income
    netIncome,
  };
}

/**
 * Validate a P&L statement for logical consistency
 *
 * Checks:
 * - Total Revenue = Tuition + Other
 * - Total OpEx = Rent + Staff + Other
 * - EBITDA = Revenue - OpEx
 * - EBIT = EBITDA - Depreciation
 * - Net Interest = Interest Expense - Interest Income
 * - EBT = EBIT - Net Interest
 * - Zakat = 2.5% of EBT (if positive) or 0 (if negative)
 * - Net Income = EBT - Zakat
 *
 * @param statement P&L statement to validate
 * @returns True if valid, false otherwise
 */
export function validateProfitLossStatement(
  statement: ProfitLossStatement,
): boolean {
  const tolerance = new Decimal(0.01); // $0.01 tolerance

  // Helper to check if two values are equal within tolerance
  const isEqual = (a: Decimal, b: Decimal): boolean =>
    a.minus(b).abs().lessThanOrEqualTo(tolerance);

  // Check Total Revenue
  const expectedTotalRevenue = add(
    statement.tuitionRevenue,
    statement.otherRevenue,
  );
  if (!isEqual(statement.totalRevenue, expectedTotalRevenue)) {
    console.error(
      `P&L Validation Error (Year ${statement.year}): Total Revenue mismatch`,
    );
    return false;
  }

  // Check Total OpEx
  const expectedTotalOpex = add(
    add(statement.rentExpense, statement.staffCosts),
    statement.otherOpex,
  );
  if (!isEqual(statement.totalOpex, expectedTotalOpex)) {
    console.error(
      `P&L Validation Error (Year ${statement.year}): Total OpEx mismatch`,
    );
    return false;
  }

  // Check EBITDA
  const expectedEbitda = subtract(statement.totalRevenue, statement.totalOpex);
  if (!isEqual(statement.ebitda, expectedEbitda)) {
    console.error(
      `P&L Validation Error (Year ${statement.year}): EBITDA mismatch`,
    );
    return false;
  }

  // Check EBIT
  const expectedEbit = subtract(statement.ebitda, statement.depreciation);
  if (!isEqual(statement.ebit, expectedEbit)) {
    console.error(
      `P&L Validation Error (Year ${statement.year}): EBIT mismatch`,
    );
    return false;
  }

  // Check Net Interest
  const expectedNetInterest = subtract(
    statement.interestExpense,
    statement.interestIncome,
  );
  if (!isEqual(statement.netInterest, expectedNetInterest)) {
    console.error(
      `P&L Validation Error (Year ${statement.year}): Net Interest mismatch`,
    );
    return false;
  }

  // Check EBT
  const expectedEbt = subtract(statement.ebit, statement.netInterest);
  if (!isEqual(statement.ebt, expectedEbt)) {
    console.error(
      `P&L Validation Error (Year ${statement.year}): EBT mismatch`,
    );
    return false;
  }

  // Check Zakat (must be non-negative)
  if (statement.zakatExpense.lessThan(ZERO)) {
    console.error(
      `P&L Validation Error (Year ${statement.year}): Zakat cannot be negative`,
    );
    return false;
  }

  // Check Net Income
  const expectedNetIncome = subtract(statement.ebt, statement.zakatExpense);
  if (!isEqual(statement.netIncome, expectedNetIncome)) {
    console.error(
      `P&L Validation Error (Year ${statement.year}): Net Income mismatch`,
    );
    return false;
  }

  return true;
}

/**
 * Create a simple P&L statement from minimal data
 *
 * Useful for quick calculations when you have basic revenue/expense data.
 *
 * @param year Year
 * @param revenue Total revenue
 * @param expenses Total operating expenses (excluding depreciation)
 * @param depreciation Depreciation expense
 * @param interestExpense Interest expense
 * @returns Basic P&L statement
 */
export function createSimpleProfitLoss(
  year: number,
  revenue: Decimal,
  expenses: Decimal,
  depreciation: Decimal,
  interestExpense: Decimal = ZERO,
  zakatExpense: Decimal = ZERO,
): ProfitLossStatement {
  return generateProfitLossStatement({
    year,
    tuitionRevenue: revenue,
    otherRevenue: ZERO,
    rentExpense: ZERO,
    staffCosts: ZERO,
    otherOpex: expenses,
    depreciation,
    interestExpense,
    interestIncome: ZERO,
    zakatExpense,
  });
}
