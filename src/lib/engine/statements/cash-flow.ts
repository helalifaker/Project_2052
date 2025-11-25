/**
 * PHASE 2: FINANCIAL STATEMENTS - CASH FLOW GENERATOR
 *
 * This module provides functions to generate Cash Flow statements
 * using the Indirect Method.
 *
 * Cash Flow Formula (Indirect Method):
 *
 * CFO = Net Income
 *     + Depreciation
 *     - Δ AR
 *     - Δ Prepaid
 *     + Δ AP
 *     + Δ Accrued
 *     + Δ Deferred Revenue
 *
 * CFI = - CapEx
 *
 * CFF = Debt Issuance - Debt Repayment
 *
 * Δ Cash = CFO + CFI + CFF
 *
 * GAP 13: Cash Flow (Indirect Method) - Already implemented in period calculators,
 * this module provides reusable generator functions.
 */

import Decimal from "decimal.js";
import type {
  CashFlowStatement,
  ProfitLossStatement,
  BalanceSheet,
} from "../core/types";
import { add, subtract } from "../core/decimal-utils";
import { ZERO } from "../core/constants";
export type { CashFlowStatement } from "../core/types";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Input data for Cash Flow statement generation (Indirect Method)
 */
export interface CashFlowInput {
  year: number;

  // From P&L
  netIncome: Decimal;
  depreciation: Decimal;

  // Working Capital Changes (current period - prior period)
  changeInAR: Decimal; // Negative = increase in AR (use of cash)
  changeInPrepaid: Decimal; // Negative = increase in Prepaid (use of cash)
  changeInAP: Decimal; // Positive = increase in AP (source of cash)
  changeInAccrued: Decimal; // Positive = increase in Accrued (source of cash)
  changeInDeferredRevenue: Decimal; // Positive = increase in Deferred (source of cash)

  // Investing Activities
  capex: Decimal; // Negative = purchase (use of cash)

  // Financing Activities
  debtIssuance: Decimal; // Positive = new debt (source of cash)
  debtRepayment: Decimal; // Negative = debt paydown (use of cash)

  // Beginning Cash
  beginningCash: Decimal;
}

/**
 * Helper structure for working capital changes calculation
 */
export interface WorkingCapitalChanges {
  changeInAR: Decimal;
  changeInPrepaid: Decimal;
  changeInAP: Decimal;
  changeInAccrued: Decimal;
  changeInDeferredRevenue: Decimal;
}

// ============================================================================
// CASH FLOW GENERATION FUNCTIONS
// ============================================================================

/**
 * Generate a complete Cash Flow statement using the Indirect Method
 *
 * This function calculates all cash flow line items:
 * - Cash Flow from Operations (CFO)
 * - Cash Flow from Investing (CFI)
 * - Cash Flow from Financing (CFF)
 * - Net Change in Cash
 * - Ending Cash
 *
 * The indirect method starts with Net Income and adjusts for:
 * - Non-cash items (depreciation)
 * - Changes in working capital
 *
 * @param input Cash flow input data
 * @returns Complete Cash Flow statement
 */
export function generateCashFlowStatement(
  input: CashFlowInput,
): CashFlowStatement {
  // ==========================================================================
  // CASH FLOW FROM OPERATIONS (CFO)
  // ==========================================================================

  const netIncome = input.netIncome;
  const depreciation = input.depreciation;

  // Working Capital Changes
  // Note: Increases in assets (AR, Prepaid) are uses of cash (negative)
  //       Increases in liabilities (AP, Accrued, Deferred) are sources of cash (positive)
  const changeInAR = input.changeInAR; // Negative impact
  const changeInPrepaid = input.changeInPrepaid; // Negative impact
  const changeInAP = input.changeInAP; // Positive impact
  const changeInAccrued = input.changeInAccrued; // Positive impact
  const changeInDeferredRevenue = input.changeInDeferredRevenue; // Positive impact

  // CFO = Net Income + Depreciation - Δ AR - Δ Prepaid + Δ AP + Δ Accrued + Δ Deferred
  let cfo = netIncome;
  cfo = add(cfo, depreciation); // Add back non-cash depreciation
  cfo = subtract(cfo, changeInAR); // Subtract increase in AR
  cfo = subtract(cfo, changeInPrepaid); // Subtract increase in Prepaid
  cfo = add(cfo, changeInAP); // Add increase in AP
  cfo = add(cfo, changeInAccrued); // Add increase in Accrued
  cfo = add(cfo, changeInDeferredRevenue); // Add increase in Deferred

  const cashFlowFromOperations = cfo;

  // ==========================================================================
  // CASH FLOW FROM INVESTING (CFI)
  // ==========================================================================

  const capex = input.capex; // Negative value = use of cash

  // CFI = -CapEx
  const cashFlowFromInvesting = capex; // Already negative

  // ==========================================================================
  // CASH FLOW FROM FINANCING (CFF)
  // ==========================================================================

  const debtIssuance = input.debtIssuance; // Positive = source of cash
  const debtRepayment = input.debtRepayment; // Negative = use of cash

  // CFF = Debt Issuance - Debt Repayment
  const cashFlowFromFinancing = add(debtIssuance, debtRepayment);

  // ==========================================================================
  // NET CHANGE IN CASH
  // ==========================================================================

  // Δ Cash = CFO + CFI + CFF
  const netChangeInCash = add(
    add(cashFlowFromOperations, cashFlowFromInvesting),
    cashFlowFromFinancing,
  );

  // ==========================================================================
  // ENDING CASH
  // ==========================================================================

  const beginningCash = input.beginningCash;
  const endingCash = add(beginningCash, netChangeInCash);

  // ==========================================================================
  // VALIDATION
  // ==========================================================================

  // This will be set to zero here; actual reconciliation happens when
  // comparing to Balance Sheet cash
  const cashReconciliationDiff = ZERO;

  // ==========================================================================
  // RETURN STATEMENT
  // ==========================================================================

  return {
    year: input.year,

    // Cash Flow from Operations
    netIncome,
    depreciation,
    changeInAR,
    changeInPrepaid,
    changeInAP,
    changeInAccrued,
    changeInDeferredRevenue,
    cashFlowFromOperations,

    // Cash Flow from Investing
    capex,
    cashFlowFromInvesting,

    // Cash Flow from Financing
    debtIssuance,
    debtRepayment,
    cashFlowFromFinancing,

    // Net Change in Cash
    netChangeInCash,

    // Beginning and Ending Cash
    beginningCash,
    endingCash,

    // Validation
    cashReconciliationDiff,
  };
}

/**
 * Calculate working capital changes from current and prior Balance Sheets
 *
 * This is a helper function to compute the changes in working capital accounts
 * needed for the cash flow statement.
 *
 * Changes are calculated as: Current Period - Prior Period
 *
 * @param currentBS Current period Balance Sheet
 * @param priorBS Prior period Balance Sheet
 * @returns Working capital changes
 */
export function calculateWorkingCapitalChanges(
  currentBS: BalanceSheet,
  priorBS: BalanceSheet,
): WorkingCapitalChanges {
  return {
    changeInAR: subtract(
      currentBS.accountsReceivable,
      priorBS.accountsReceivable,
    ),
    changeInPrepaid: subtract(
      currentBS.prepaidExpenses,
      priorBS.prepaidExpenses,
    ),
    changeInAP: subtract(currentBS.accountsPayable, priorBS.accountsPayable),
    changeInAccrued: subtract(
      currentBS.accruedExpenses,
      priorBS.accruedExpenses,
    ),
    changeInDeferredRevenue: subtract(
      currentBS.deferredRevenue,
      priorBS.deferredRevenue,
    ),
  };
}

/**
 * Calculate debt change for financing activities
 *
 * Determines debt issuance (positive) or repayment (negative) based on
 * current and prior debt balances.
 *
 * Δ Debt = Current Debt - Prior Debt
 * - If positive: Debt Issuance
 * - If negative: Debt Repayment
 *
 * @param currentDebt Current period debt balance
 * @param priorDebt Prior period debt balance
 * @returns Object with debtIssuance and debtRepayment
 */
export function calculateDebtChange(
  currentDebt: Decimal,
  priorDebt: Decimal,
): { debtIssuance: Decimal; debtRepayment: Decimal } {
  const debtChange = subtract(currentDebt, priorDebt);

  if (debtChange.greaterThanOrEqualTo(ZERO)) {
    // Debt increased = issuance
    return {
      debtIssuance: debtChange,
      debtRepayment: ZERO,
    };
  } else {
    // Debt decreased = repayment
    return {
      debtIssuance: ZERO,
      debtRepayment: debtChange, // Already negative
    };
  }
}

/**
 * Validate a Cash Flow statement for logical consistency
 *
 * Checks:
 * - CFO = Net Income + Depreciation - Δ AR - Δ Prepaid + Δ AP + Δ Accrued + Δ Deferred
 * - CFI = -CapEx
 * - CFF = Debt Issuance - Debt Repayment
 * - Net Change = CFO + CFI + CFF
 * - Ending Cash = Beginning Cash + Net Change
 *
 * @param statement Cash Flow statement to validate
 * @returns True if valid, false otherwise
 */
export function validateCashFlowStatement(
  statement: CashFlowStatement,
): boolean {
  const tolerance = new Decimal(0.01); // $0.01 tolerance

  // Helper to check if two values are equal within tolerance
  const isEqual = (a: Decimal, b: Decimal): boolean =>
    a.minus(b).abs().lessThanOrEqualTo(tolerance);

  // Check CFO calculation
  let expectedCFO = statement.netIncome;
  expectedCFO = add(expectedCFO, statement.depreciation);
  expectedCFO = subtract(expectedCFO, statement.changeInAR);
  expectedCFO = subtract(expectedCFO, statement.changeInPrepaid);
  expectedCFO = add(expectedCFO, statement.changeInAP);
  expectedCFO = add(expectedCFO, statement.changeInAccrued);
  expectedCFO = add(expectedCFO, statement.changeInDeferredRevenue);

  if (!isEqual(statement.cashFlowFromOperations, expectedCFO)) {
    console.error(`CF Validation Error (Year ${statement.year}): CFO mismatch`);
    return false;
  }

  // Check CFI calculation
  const expectedCFI = statement.capex; // Already negative
  if (!isEqual(statement.cashFlowFromInvesting, expectedCFI)) {
    console.error(`CF Validation Error (Year ${statement.year}): CFI mismatch`);
    return false;
  }

  // Check CFF calculation
  const expectedCFF = add(statement.debtIssuance, statement.debtRepayment);
  if (!isEqual(statement.cashFlowFromFinancing, expectedCFF)) {
    console.error(`CF Validation Error (Year ${statement.year}): CFF mismatch`);
    return false;
  }

  // Check Net Change in Cash
  const expectedNetChange = add(
    add(statement.cashFlowFromOperations, statement.cashFlowFromInvesting),
    statement.cashFlowFromFinancing,
  );
  if (!isEqual(statement.netChangeInCash, expectedNetChange)) {
    console.error(
      `CF Validation Error (Year ${statement.year}): Net Change in Cash mismatch`,
    );
    return false;
  }

  // Check Ending Cash
  const expectedEndingCash = add(
    statement.beginningCash,
    statement.netChangeInCash,
  );
  if (!isEqual(statement.endingCash, expectedEndingCash)) {
    console.error(
      `CF Validation Error (Year ${statement.year}): Ending Cash mismatch`,
    );
    return false;
  }

  return true;
}

/**
 * Reconcile Cash Flow ending cash with Balance Sheet cash
 *
 * This function checks if the ending cash from the Cash Flow statement
 * matches the cash on the Balance Sheet. They should be equal.
 *
 * @param cashFlow Cash Flow statement
 * @param balanceSheet Balance Sheet
 * @returns Reconciliation difference (should be ~$0)
 */
export function reconcileCashFlowWithBalanceSheet(
  cashFlow: CashFlowStatement,
  balanceSheet: BalanceSheet,
): Decimal {
  return subtract(cashFlow.endingCash, balanceSheet.cash);
}

/**
 * Create a Cash Flow statement from P&L and Balance Sheet data
 *
 * This is a convenience function that automatically calculates working capital
 * changes and debt changes from the statements.
 *
 * @param year Year
 * @param profitLoss P&L statement
 * @param currentBS Current period Balance Sheet
 * @param priorBS Prior period Balance Sheet
 * @param capex CapEx for the period (negative value)
 * @returns Complete Cash Flow statement
 */
export function createCashFlowFromStatements(
  year: number,
  profitLoss: ProfitLossStatement,
  currentBS: BalanceSheet,
  priorBS: BalanceSheet,
  capex: Decimal,
): CashFlowStatement {
  // Calculate working capital changes
  const wcChanges = calculateWorkingCapitalChanges(currentBS, priorBS);

  // Calculate debt change
  const debtChange = calculateDebtChange(
    currentBS.debtBalance,
    priorBS.debtBalance,
  );

  // Generate cash flow statement
  return generateCashFlowStatement({
    year,
    netIncome: profitLoss.netIncome,
    depreciation: profitLoss.depreciation,
    changeInAR: wcChanges.changeInAR,
    changeInPrepaid: wcChanges.changeInPrepaid,
    changeInAP: wcChanges.changeInAP,
    changeInAccrued: wcChanges.changeInAccrued,
    changeInDeferredRevenue: wcChanges.changeInDeferredRevenue,
    capex,
    debtIssuance: debtChange.debtIssuance,
    debtRepayment: debtChange.debtRepayment,
    beginningCash: priorBS.cash,
  });
}
