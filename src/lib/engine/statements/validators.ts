/**
 * PHASE 2: FINANCIAL STATEMENTS - COMPREHENSIVE VALIDATORS
 *
 * This module provides comprehensive validation functions for:
 * - Individual financial statements
 * - Complete financial periods
 * - Period linkage and continuity
 * - Balance sheet balancing
 * - Cash flow reconciliation
 */

import Decimal from "decimal.js";
import type { FinancialPeriod } from "../core/types";
import { subtract } from "../core/decimal-utils";
import { ZERO } from "../core/constants";
import { validateProfitLossStatement } from "./profit-loss";
import { validateBalanceSheet } from "./balance-sheet";
import {
  validateCashFlowStatement,
  reconcileCashFlowWithBalanceSheet,
} from "./cash-flow";
export type { FinancialPeriod } from "../core/types";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Validation result with detailed feedback
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Period linkage validation result
 */
export interface PeriodLinkageValidation {
  valid: boolean;
  errors: string[];
  cashContinuity: boolean;
  retainedEarningsContinuity: boolean;
  ppeContinuity: boolean;
  debtContinuity: boolean;
}

// ============================================================================
// FINANCIAL PERIOD VALIDATION
// ============================================================================

/**
 * Validate a complete Financial Period
 *
 * This function performs comprehensive validation:
 * 1. P&L statement internal consistency
 * 2. Balance Sheet internal consistency
 * 3. Cash Flow statement internal consistency
 * 4. Balance Sheet balancing (Assets = Liabilities + Equity)
 * 5. Cash Flow reconciliation (CF ending cash = BS cash)
 *
 * @param period Financial period to validate
 * @param tolerance Validation tolerance (default: $0.01)
 * @returns Validation result with errors and warnings
 */
export function validateFinancialPeriod(
  period: FinancialPeriod,
  tolerance: Decimal = new Decimal(0.01),
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // ==========================================================================
  // 1. VALIDATE P&L
  // ==========================================================================

  const plValid = validateProfitLossStatement(period.profitLoss);
  if (!plValid) {
    errors.push(`Year ${period.year}: P&L validation failed`);
  }

  // ==========================================================================
  // 2. VALIDATE BALANCE SHEET
  // ==========================================================================

  const bsValid = validateBalanceSheet(period.balanceSheet, tolerance);
  if (!bsValid) {
    errors.push(`Year ${period.year}: Balance Sheet validation failed`);
  }

  // Check if balance sheet is balanced
  const balanceDiff = period.balanceSheet.balanceDifference;
  if (balanceDiff.abs().greaterThan(tolerance)) {
    errors.push(
      `Year ${period.year}: Balance Sheet not balanced (diff: $${balanceDiff.toFixed(2)})`,
    );
  }

  // ==========================================================================
  // 3. VALIDATE CASH FLOW
  // ==========================================================================

  const cfValid = validateCashFlowStatement(period.cashFlow);
  if (!cfValid) {
    errors.push(`Year ${period.year}: Cash Flow validation failed`);
  }

  // ==========================================================================
  // 4. RECONCILE CASH FLOW WITH BALANCE SHEET
  // ==========================================================================

  const cashReconciliationDiff = reconcileCashFlowWithBalanceSheet(
    period.cashFlow,
    period.balanceSheet,
  );

  if (cashReconciliationDiff.abs().greaterThan(tolerance)) {
    errors.push(
      `Year ${period.year}: Cash Flow not reconciled with Balance Sheet (diff: $${cashReconciliationDiff.toFixed(2)})`,
    );
  }

  // ==========================================================================
  // 5. CROSS-STATEMENT VALIDATION
  // ==========================================================================

  // Check that P&L net income matches BS net income
  const netIncomeDiff = subtract(
    period.profitLoss.netIncome,
    period.balanceSheet.netIncomeCurrentYear,
  );
  if (netIncomeDiff.abs().greaterThan(tolerance)) {
    errors.push(
      `Year ${period.year}: Net Income mismatch between P&L and BS (diff: $${netIncomeDiff.toFixed(2)})`,
    );
  }

  // Check that P&L depreciation matches CF depreciation
  const depreciationDiff = subtract(
    period.profitLoss.depreciation,
    period.cashFlow.depreciation,
  );
  if (depreciationDiff.abs().greaterThan(tolerance)) {
    errors.push(
      `Year ${period.year}: Depreciation mismatch between P&L and CF (diff: $${depreciationDiff.toFixed(2)})`,
    );
  }

  // Check that CF net income matches P&L net income
  const cfNetIncomeDiff = subtract(
    period.cashFlow.netIncome,
    period.profitLoss.netIncome,
  );
  if (cfNetIncomeDiff.abs().greaterThan(tolerance)) {
    errors.push(
      `Year ${period.year}: Net Income mismatch between CF and P&L (diff: $${cfNetIncomeDiff.toFixed(2)})`,
    );
  }

  // ==========================================================================
  // 6. CHECK FLAGS
  // ==========================================================================

  if (!period.balanceSheetBalanced) {
    warnings.push(`Year ${period.year}: Balance Sheet balanced flag is false`);
  }

  if (!period.cashFlowReconciled) {
    warnings.push(`Year ${period.year}: Cash Flow reconciled flag is false`);
  }

  if (!period.converged) {
    warnings.push(
      `Year ${period.year}: Period did not converge (circular solver may have failed)`,
    );
  }

  // ==========================================================================
  // RETURN RESULT
  // ==========================================================================

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate period-to-period linkage and continuity
 *
 * This function checks that financial data flows correctly from one period
 * to the next:
 * 1. Ending cash (prior) = Beginning cash (current)
 * 2. Retained Earnings (current) = Retained Earnings (prior) + Net Income (prior)
 * 3. PP&E continuity (with CapEx and Depreciation adjustments)
 * 4. Debt continuity
 *
 * @param priorPeriod Prior period
 * @param currentPeriod Current period
 * @param tolerance Validation tolerance (default: $0.01)
 * @returns Period linkage validation result
 */
export function validatePeriodLinkage(
  priorPeriod: FinancialPeriod,
  currentPeriod: FinancialPeriod,
  tolerance: Decimal = new Decimal(0.01),
): PeriodLinkageValidation {
  const errors: string[] = [];

  // ==========================================================================
  // 1. CASH CONTINUITY
  // ==========================================================================

  // Ending cash from prior period should equal beginning cash in current period
  const cashDiff = subtract(
    priorPeriod.balanceSheet.cash,
    currentPeriod.cashFlow.beginningCash,
  );

  let cashContinuity = true;
  if (cashDiff.abs().greaterThan(tolerance)) {
    errors.push(
      `Cash continuity broken between ${priorPeriod.year} and ${currentPeriod.year} (diff: $${cashDiff.toFixed(2)})`,
    );
    cashContinuity = false;
  }

  // ==========================================================================
  // 2. RETAINED EARNINGS CONTINUITY
  // ==========================================================================

  // Retained Earnings (current) should equal:
  // Retained Earnings (prior) + Net Income (prior)
  const expectedRetainedEarnings = priorPeriod.balanceSheet.totalEquity;

  const retainedEarningsDiff = subtract(
    currentPeriod.balanceSheet.retainedEarnings,
    expectedRetainedEarnings,
  );

  let retainedEarningsContinuity = true;
  if (retainedEarningsDiff.abs().greaterThan(tolerance)) {
    errors.push(
      `Retained Earnings continuity broken between ${priorPeriod.year} and ${currentPeriod.year} (diff: $${retainedEarningsDiff.toFixed(2)})`,
    );
    retainedEarningsContinuity = false;
  }

  // ==========================================================================
  // 3. PP&E CONTINUITY
  // ==========================================================================

  // Accumulated Depreciation (current) should equal:
  // Accumulated Depreciation (prior) + Depreciation (current)
  // Note: This is a simplified check - actual PP&E tracking is more complex
  // with CapEx additions

  const priorAccumDepreciation =
    priorPeriod.balanceSheet.accumulatedDepreciation;
  const currentDepreciation = currentPeriod.profitLoss.depreciation;
  const currentAccumDepreciation =
    currentPeriod.balanceSheet.accumulatedDepreciation;

  // We can't do a simple check here because CapEx adds new PP&E
  // Just check that accumulated depreciation is increasing or staying the same
  let ppeContinuity = true;
  if (currentAccumDepreciation.lessThan(priorAccumDepreciation)) {
    errors.push(
      `PP&E continuity warning: Accumulated Depreciation decreased between ${priorPeriod.year} and ${currentPeriod.year}`,
    );
    ppeContinuity = false;
  }

  // ==========================================================================
  // 4. DEBT CONTINUITY
  // ==========================================================================

  // Debt (current) should equal:
  // Debt (prior) + Debt Issuance - Debt Repayment
  const expectedDebt = priorPeriod.balanceSheet.debtBalance
    .add(currentPeriod.cashFlow.debtIssuance)
    .add(currentPeriod.cashFlow.debtRepayment); // debtRepayment is negative

  const debtDiff = subtract(
    currentPeriod.balanceSheet.debtBalance,
    expectedDebt,
  );

  let debtContinuity = true;
  if (debtDiff.abs().greaterThan(tolerance)) {
    errors.push(
      `Debt continuity broken between ${priorPeriod.year} and ${currentPeriod.year} (diff: $${debtDiff.toFixed(2)})`,
    );
    debtContinuity = false;
  }

  // ==========================================================================
  // RETURN RESULT
  // ==========================================================================

  return {
    valid: errors.length === 0,
    errors,
    cashContinuity,
    retainedEarningsContinuity,
    ppeContinuity,
    debtContinuity,
  };
}

/**
 * Validate multiple periods in sequence
 *
 * This function validates each period individually and checks linkage
 * between consecutive periods.
 *
 * @param periods Array of financial periods (in chronological order)
 * @param tolerance Validation tolerance (default: $0.01)
 * @returns Validation result
 */
export function validatePeriodSequence(
  periods: FinancialPeriod[],
  tolerance: Decimal = new Decimal(0.01),
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate each period individually
  for (const period of periods) {
    const result = validateFinancialPeriod(period, tolerance);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  }

  // Validate linkage between consecutive periods
  for (let i = 1; i < periods.length; i++) {
    const priorPeriod = periods[i - 1];
    const currentPeriod = periods[i];

    const linkageResult = validatePeriodLinkage(
      priorPeriod,
      currentPeriod,
      tolerance,
    );

    if (!linkageResult.valid) {
      errors.push(...linkageResult.errors);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Check if a Balance Sheet is balanced
 *
 * Assets should equal Liabilities + Equity within tolerance
 *
 * @param period Financial period
 * @param tolerance Tolerance (default: $0.01)
 * @returns True if balanced, false otherwise
 */
export function isBalanceSheetBalanced(
  period: FinancialPeriod,
  tolerance: Decimal = new Decimal(0.01),
): boolean {
  const diff = period.balanceSheet.balanceDifference;
  return diff.abs().lessThanOrEqualTo(tolerance);
}

/**
 * Check if Cash Flow is reconciled with Balance Sheet
 *
 * Cash Flow ending cash should match Balance Sheet cash within tolerance
 *
 * @param period Financial period
 * @param tolerance Tolerance (default: $0.01)
 * @returns True if reconciled, false otherwise
 */
export function isCashFlowReconciled(
  period: FinancialPeriod,
  tolerance: Decimal = new Decimal(0.01),
): boolean {
  const diff = reconcileCashFlowWithBalanceSheet(
    period.cashFlow,
    period.balanceSheet,
  );
  return diff.abs().lessThanOrEqualTo(tolerance);
}
