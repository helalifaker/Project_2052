/**
 * PHASE 2: FINANCIAL STATEMENTS MODULE - PUBLIC API
 *
 * This module exports all financial statement generators and validators.
 *
 * Provides:
 * - P&L statement generation and validation
 * - Balance Sheet generation and validation (with GAP 12 debt plug)
 * - Cash Flow statement generation and validation (indirect method)
 * - Comprehensive validation functions
 */

// ============================================================================
// PROFIT & LOSS
// ============================================================================

export {
  generateProfitLossStatement,
  validateProfitLossStatement,
  createSimpleProfitLoss,
  type ProfitLossInput,
} from "./profit-loss";

// ============================================================================
// BALANCE SHEET
// ============================================================================

export {
  generateBalanceSheet,
  validateBalanceSheet,
  calculateDebtPlug,
  updateRetainedEarnings,
  type BalanceSheetInput,
  type BalanceSheetOptions,
} from "./balance-sheet";

// ============================================================================
// CASH FLOW
// ============================================================================

export {
  generateCashFlowStatement,
  validateCashFlowStatement,
  calculateWorkingCapitalChanges,
  calculateDebtChange,
  reconcileCashFlowWithBalanceSheet,
  createCashFlowFromStatements,
  type CashFlowInput,
  type WorkingCapitalChanges,
} from "./cash-flow";

// ============================================================================
// COMPREHENSIVE VALIDATORS
// ============================================================================

export {
  validateFinancialPeriod,
  validatePeriodLinkage,
  type ValidationResult,
  type PeriodLinkageValidation,
} from "./validators";
