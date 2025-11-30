/**
 * PHASE 2: FINANCIAL STATEMENTS - BALANCE SHEET GENERATOR
 *
 * This module provides functions to generate Balance Sheet statements
 * from calculated financial data.
 *
 * Balance Sheet Formula:
 * ASSETS = LIABILITIES + EQUITY
 *
 * Assets:
 * - Cash
 * - Accounts Receivable
 * - Prepaid Expenses
 * - PP&E (Net)
 *
 * Liabilities:
 * - Accounts Payable
 * - Accrued Expenses
 * - Deferred Revenue
 * - Debt (PLUG to balance)
 *
 * Equity:
 * - Prior Equity + Net Income
 *
 * GAP 12: Balance Sheet Plug
 * If Assets ≠ Liabilities + Equity, the difference is plugged to Debt
 * to force the balance sheet to balance.
 */

import Decimal from "decimal.js";
import type { BalanceSheet, ProfitLossStatement } from "../core/types";
export type { BalanceSheet } from "../core/types";
import { add, subtract } from "../core/decimal-utils";
import { ZERO } from "../core/constants";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Input data for Balance Sheet generation
 */
export interface BalanceSheetInput {
  year: number;

  // Current Assets
  cash: Decimal;
  accountsReceivable: Decimal;
  prepaidExpenses: Decimal;

  // Non-Current Assets
  grossPPE: Decimal; // Gross PP&E (total cost of assets)
  accumulatedDepreciation: Decimal;

  // Current Liabilities
  accountsPayable: Decimal;
  accruedExpenses: Decimal;
  deferredRevenue: Decimal;

  // Non-Current Liabilities
  debtBalance?: Decimal; // Optional - will be calculated as plug if not provided

  // Equity
  retainedEarnings: Decimal; // Prior period retained earnings
  netIncomeCurrentYear: Decimal; // From P&L
}

/**
 * Options for Balance Sheet generation
 */
export interface BalanceSheetOptions {
  /**
   * If true, debt will be calculated as a plug to balance the sheet (GAP 12)
   * Default: true
   */
  useDebtPlug?: boolean;

  /**
   * If provided, debt balance will be set to this value (overrides plug)
   */
  fixedDebtBalance?: Decimal;

  /**
   * Tolerance for balance sheet balancing ($)
   * Default: $0.01
   */
  balanceTolerance?: Decimal;
}

// ============================================================================
// BALANCE SHEET GENERATION FUNCTIONS
// ============================================================================

/**
 * Generate a complete Balance Sheet statement
 *
 * This function calculates all balance sheet line items and ensures:
 * - Assets = Liabilities + Equity
 *
 * If useDebtPlug is true (default), debt is calculated as:
 * Debt = Total Assets - (Current Liabilities + Equity)
 *
 * This ensures the balance sheet always balances (GAP 12).
 *
 * @param input Balance sheet input data
 * @param options Generation options
 * @returns Complete Balance Sheet
 */
export function generateBalanceSheet(
  input: BalanceSheetInput,
  options: BalanceSheetOptions = {},
): BalanceSheet {
  const { useDebtPlug = true, fixedDebtBalance, balanceTolerance } = options;

  // ==========================================================================
  // ASSETS
  // ==========================================================================

  // Current Assets
  const cash = input.cash;
  const accountsReceivable = input.accountsReceivable;
  const prepaidExpenses = input.prepaidExpenses;
  const totalCurrentAssets = add(
    add(cash, accountsReceivable),
    prepaidExpenses,
  );

  // Non-Current Assets (PP&E Net = Gross PP&E - Accumulated Depreciation)
  const grossPPE = input.grossPPE;
  const accumulatedDepreciation = input.accumulatedDepreciation;
  const propertyPlantEquipment = subtract(grossPPE, accumulatedDepreciation);
  const totalNonCurrentAssets = propertyPlantEquipment;

  const totalAssets = add(totalCurrentAssets, totalNonCurrentAssets);

  // ==========================================================================
  // LIABILITIES
  // ==========================================================================

  // Current Liabilities
  const accountsPayable = input.accountsPayable;
  const accruedExpenses = input.accruedExpenses;
  const deferredRevenue = input.deferredRevenue;
  const totalCurrentLiabilities = add(
    add(accountsPayable, accruedExpenses),
    deferredRevenue,
  );

  // ==========================================================================
  // EQUITY
  // ==========================================================================

  const retainedEarnings = input.retainedEarnings;
  const netIncomeCurrentYear = input.netIncomeCurrentYear;
  const totalEquity = add(retainedEarnings, netIncomeCurrentYear);

  // ==========================================================================
  // DEBT CALCULATION (GAP 12: Balance Sheet Plug)
  // ==========================================================================

  let debtBalance: Decimal;

  if (fixedDebtBalance !== undefined) {
    // Use fixed debt balance (no plug)
    debtBalance = fixedDebtBalance;
  } else if (useDebtPlug) {
    // Calculate debt as plug to balance the sheet (GAP 12)
    // Debt = Total Assets - Current Liabilities - Equity
    debtBalance = subtract(
      subtract(totalAssets, totalCurrentLiabilities),
      totalEquity,
    );

    // Ensure debt is not negative (can't have negative debt)
    if (debtBalance.lessThan(ZERO)) {
      console.warn(
        `⚠️  Year ${input.year}: Calculated debt plug is negative (${debtBalance.toFixed(2)}). Setting to zero.`,
      );
      debtBalance = ZERO;
    }
  } else {
    // Use provided debt balance or zero
    debtBalance = input.debtBalance || ZERO;
  }

  // Non-Current Liabilities
  const totalNonCurrentLiabilities = debtBalance;

  // Total Liabilities
  const totalLiabilities = add(
    totalCurrentLiabilities,
    totalNonCurrentLiabilities,
  );

  // ==========================================================================
  // BALANCE VALIDATION
  // ==========================================================================

  // Check if Assets = Liabilities + Equity
  const balanceDifference = subtract(
    totalAssets,
    add(totalLiabilities, totalEquity),
  );

  // ==========================================================================
  // RETURN STATEMENT
  // ==========================================================================

  return {
    year: input.year,

    // ASSETS
    // Current Assets
    cash,
    accountsReceivable,
    prepaidExpenses,
    totalCurrentAssets,

    // Non-Current Assets
    grossPPE,
    accumulatedDepreciation,
    propertyPlantEquipment,
    totalNonCurrentAssets,

    totalAssets,

    // LIABILITIES
    // Current Liabilities
    accountsPayable,
    accruedExpenses,
    deferredRevenue,
    totalCurrentLiabilities,

    // Non-Current Liabilities
    debtBalance,
    totalNonCurrentLiabilities,

    totalLiabilities,

    // EQUITY
    retainedEarnings,
    netIncomeCurrentYear,
    totalEquity,

    // Validation
    balanceDifference,
  };
}

/**
 * Validate a Balance Sheet for logical consistency
 *
 * Checks:
 * - Total Current Assets = Cash + AR + Prepaid
 * - Net PP&E = Gross PP&E - Accumulated Depreciation
 * - Total Assets = Current Assets + Non-Current Assets
 * - Total Current Liabilities = AP + Accrued + Deferred
 * - Total Liabilities = Current Liabilities + Debt
 * - Total Equity = Retained Earnings + Net Income
 * - Assets = Liabilities + Equity (within tolerance)
 *
 * @param statement Balance Sheet to validate
 * @param tolerance Balance tolerance (default: $0.01)
 * @returns True if valid, false otherwise
 */
export function validateBalanceSheet(
  statement: BalanceSheet,
  tolerance: Decimal = new Decimal(0.01),
): boolean {
  // Helper to check if two values are equal within tolerance
  const isEqual = (a: Decimal, b: Decimal): boolean =>
    a.minus(b).abs().lessThanOrEqualTo(tolerance);

  // Check Total Current Assets
  const expectedTotalCurrentAssets = add(
    add(statement.cash, statement.accountsReceivable),
    statement.prepaidExpenses,
  );
  if (!isEqual(statement.totalCurrentAssets, expectedTotalCurrentAssets)) {
    console.error(
      `BS Validation Error (Year ${statement.year}): Total Current Assets mismatch`,
    );
    return false;
  }

  // Check Total Non-Current Assets
  if (
    !isEqual(statement.totalNonCurrentAssets, statement.propertyPlantEquipment)
  ) {
    console.error(
      `BS Validation Error (Year ${statement.year}): Total Non-Current Assets mismatch`,
    );
    return false;
  }

  // Check Total Assets
  const expectedTotalAssets = add(
    statement.totalCurrentAssets,
    statement.totalNonCurrentAssets,
  );
  if (!isEqual(statement.totalAssets, expectedTotalAssets)) {
    console.error(
      `BS Validation Error (Year ${statement.year}): Total Assets mismatch`,
    );
    return false;
  }

  // Check Total Current Liabilities
  const expectedTotalCurrentLiabilities = add(
    add(statement.accountsPayable, statement.accruedExpenses),
    statement.deferredRevenue,
  );
  if (
    !isEqual(statement.totalCurrentLiabilities, expectedTotalCurrentLiabilities)
  ) {
    console.error(
      `BS Validation Error (Year ${statement.year}): Total Current Liabilities mismatch`,
    );
    return false;
  }

  // Check Total Non-Current Liabilities
  if (!isEqual(statement.totalNonCurrentLiabilities, statement.debtBalance)) {
    console.error(
      `BS Validation Error (Year ${statement.year}): Total Non-Current Liabilities mismatch`,
    );
    return false;
  }

  // Check Total Liabilities
  const expectedTotalLiabilities = add(
    statement.totalCurrentLiabilities,
    statement.totalNonCurrentLiabilities,
  );
  if (!isEqual(statement.totalLiabilities, expectedTotalLiabilities)) {
    console.error(
      `BS Validation Error (Year ${statement.year}): Total Liabilities mismatch`,
    );
    return false;
  }

  // Check Total Equity
  const expectedTotalEquity = add(
    statement.retainedEarnings,
    statement.netIncomeCurrentYear,
  );
  if (!isEqual(statement.totalEquity, expectedTotalEquity)) {
    console.error(
      `BS Validation Error (Year ${statement.year}): Total Equity mismatch`,
    );
    return false;
  }

  // Check Balance Sheet Equation: Assets = Liabilities + Equity
  const expectedTotal = add(statement.totalLiabilities, statement.totalEquity);
  if (!isEqual(statement.totalAssets, expectedTotal)) {
    console.error(
      `BS Validation Error (Year ${statement.year}): Assets ≠ Liabilities + Equity (diff: ${statement.balanceDifference.toFixed(2)})`,
    );
    return false;
  }

  // Check that balanceDifference is within tolerance
  if (!isEqual(statement.balanceDifference, ZERO)) {
    console.error(
      `BS Validation Error (Year ${statement.year}): Balance difference exceeds tolerance (${statement.balanceDifference.toFixed(2)})`,
    );
    return false;
  }

  return true;
}

/**
 * Calculate the debt plug amount needed to balance the sheet
 *
 * This is a helper function to determine what debt balance is needed
 * to make Assets = Liabilities + Equity
 *
 * Debt Plug = Total Assets - Current Liabilities - Equity
 *
 * @param totalAssets Total assets
 * @param currentLiabilities Total current liabilities
 * @param equity Total equity
 * @returns Debt balance needed to balance the sheet (GAP 12)
 */
export function calculateDebtPlug(
  totalAssets: Decimal,
  currentLiabilities: Decimal,
  equity: Decimal,
): Decimal {
  const plug = subtract(subtract(totalAssets, currentLiabilities), equity);

  // Return max(plug, 0) - debt can't be negative
  return plug.greaterThanOrEqualTo(ZERO) ? plug : ZERO;
}

/**
 * Update retained earnings based on prior period
 *
 * Retained Earnings (current) = Retained Earnings (prior) + Net Income (prior)
 *
 * @param priorRetainedEarnings Retained earnings from prior period
 * @param priorNetIncome Net income from prior period
 * @returns Updated retained earnings
 */
export function updateRetainedEarnings(
  priorRetainedEarnings: Decimal,
  priorNetIncome: Decimal,
): Decimal {
  return add(priorRetainedEarnings, priorNetIncome);
}
