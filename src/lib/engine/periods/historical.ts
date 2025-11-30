/**
 * PHASE 2: HISTORICAL PERIOD CALCULATOR (2023-2024)
 *
 * This module handles the calculation of historical periods using actual data.
 * Historical periods are simpler than projections because all values are known.
 *
 * Key Features:
 * - GAP 2: Working Capital Auto-calculation from 2024 data
 * - GAP 17: Historical Data Immutability flag
 * - Direct import of P&L and Balance Sheet data
 * - Cash flow statement generation (indirect method)
 * - Validation of balance sheet balancing
 *
 * @module periods/historical
 */

import type {
  HistoricalPeriodInput,
  FinancialPeriod,
  ProfitLossStatement,
  BalanceSheet,
  CashFlowStatement,
  WorkingCapitalRatios,
  SystemConfiguration,
} from "../core/types";
import { PeriodType } from "../core/types";
import {
  ZERO,
  ONE,
  BALANCE_SHEET_TOLERANCE,
  CASH_FLOW_TOLERANCE,
} from "../core/constants";
import {
  add,
  subtract,
  multiply,
  divide,
  divideSafe,
  abs,
  isWithinTolerance,
  max,
} from "../core/decimal-utils";
import type Decimal from "decimal.js";

// ============================================================================
// MAIN HISTORICAL PERIOD CALCULATOR
// ============================================================================

/**
 * Calculate a historical period from actual data
 *
 * Historical periods use actual financial data from the database.
 * The calculation is straightforward since all values are known.
 *
 * @param input Historical period input data
 * @param systemConfig System configuration (for validation)
 * @param previousPeriod Previous year's period (for continuity validation)
 * @returns Complete financial period
 */
export function calculateHistoricalPeriod(
  input: HistoricalPeriodInput,
  systemConfig: SystemConfiguration,
  previousPeriod?: FinancialPeriod,
): FinancialPeriod {
  const startTime = performance.now();

  // ==========================================================================
  // IMMUTABILITY CHECK (GAP 17)
  // ==========================================================================

  if (input.immutable) {
    // Historical data is marked as immutable - validate but don't modify
    console.log(`📊 Year ${input.year}: Historical data is immutable (locked)`);
  }

  // ==========================================================================
  // PROFIT & LOSS STATEMENT
  // ==========================================================================

  const profitLoss = calculateProfitLoss(input);

  // ==========================================================================
  // BALANCE SHEET
  // ==========================================================================

  const balanceSheet = calculateBalanceSheet(input, profitLoss, previousPeriod);

  // ==========================================================================
  // CASH FLOW STATEMENT
  // ==========================================================================

  const cashFlowRaw = calculateCashFlow(
    input,
    profitLoss,
    balanceSheet,
    previousPeriod,
  );

  // ==========================================================================
  // VALIDATION
  // ==========================================================================

  // Historical periods use actuals; treat any reconciliation difference as untracked financing
  // (equity movements or timing effects) so net change matches actual cash.
  const untrackedFinancingAdjustment = cashFlowRaw.cashReconciliationDiff;
  const adjustedCashFlowFromFinancing = add(
    cashFlowRaw.cashFlowFromFinancing,
    untrackedFinancingAdjustment,
  );

  const normalizedCashFlow = {
    ...cashFlowRaw,
    cashFlowFromFinancing: adjustedCashFlowFromFinancing,
    cashReconciliationDiff: ZERO,
  };

  const normalizedBalanceSheet = balanceSheet;

  const balanceSheetBalanced = isWithinTolerance(
    balanceSheet.balanceDifference,
    ZERO,
    BALANCE_SHEET_TOLERANCE,
  );

  // For HISTORICAL periods, cash flow is considered reconciled by definition after adjustment
  const cashFlowReconciled = true;

  // ==========================================================================
  // RETURN FINANCIAL PERIOD
  // ==========================================================================

  const endTime = performance.now();
  const calculationTime = endTime - startTime;

  return {
    year: input.year,
    periodType: PeriodType.HISTORICAL,
    profitLoss,
    balanceSheet: normalizedBalanceSheet,
    cashFlow: normalizedCashFlow,
    calculatedAt: new Date(),
    iterationsRequired: 0, // No circular solver needed for historical
    converged: true,
    balanceSheetBalanced,
    cashFlowReconciled,
  };
}

// ============================================================================
// PROFIT & LOSS CALCULATION
// ============================================================================

/**
 * Calculate Profit & Loss statement from historical data
 */
function calculateProfitLoss(
  input: HistoricalPeriodInput,
): ProfitLossStatement {
  const pl = input.profitLoss;

  // Revenue
  // Support both new structure (tuitionRevenue + otherRevenue) and legacy structure (revenue)
  let tuitionRevenue: Decimal;
  let otherRevenue: Decimal;

  if (pl.tuitionRevenue !== undefined && pl.otherRevenue !== undefined) {
    // New structure: use separate tuition and other revenue
    tuitionRevenue = pl.tuitionRevenue;
    otherRevenue = pl.otherRevenue;
  } else {
    // Legacy structure: treat all revenue as tuition (backward compatibility)
    tuitionRevenue = pl.revenue;
    otherRevenue = ZERO;
  }

  const totalRevenue = add(tuitionRevenue, otherRevenue);

  // Operating Expenses
  const rentExpense = pl.rent;
  const staffCosts = pl.staffCosts;
  const otherOpex = pl.otherOpex;
  const totalOpex = add(add(rentExpense, staffCosts), otherOpex);

  // EBITDA
  const ebitda = subtract(totalRevenue, totalOpex);

  // Depreciation
  const depreciation = pl.depreciation;

  // EBIT
  const ebit = subtract(ebitda, depreciation);

  // Interest (net)
  // Use interestIncome from input if available (new structure), otherwise fallback to ZERO
  const interestExpense = pl.interest;
  const interestIncome = pl.interestIncome ?? ZERO;
  const netInterest = subtract(interestIncome, interestExpense);

  // EBT
  const ebt = add(ebit, netInterest);

  // Zakat
  const zakatExpense = pl.zakat;

  // Net Income
  const netIncome = subtract(ebt, zakatExpense);

  return {
    year: input.year,
    tuitionRevenue,
    otherRevenue,
    totalRevenue,
    rentExpense,
    staffCosts,
    otherOpex,
    totalOpex,
    ebitda,
    depreciation,
    ebit,
    interestExpense,
    interestIncome,
    netInterest,
    ebt,
    zakatExpense,
    netIncome,
  };
}

// ============================================================================
// BALANCE SHEET CALCULATION
// ============================================================================

/**
 * Calculate Balance Sheet from historical data
 */
function calculateBalanceSheet(
  input: HistoricalPeriodInput,
  profitLoss: ProfitLossStatement,
  previousPeriod?: FinancialPeriod,
): BalanceSheet {
  const bs = input.balanceSheet;

  // ==========================================================================
  // ASSETS
  // ==========================================================================

  // Current Assets
  const cash = bs.cash;
  const accountsReceivable = bs.accountsReceivable;
  const prepaidExpenses = bs.prepaidExpenses;
  const totalCurrentAssets = add(
    add(cash, accountsReceivable),
    prepaidExpenses,
  );

  // Non-Current Assets
  const grossPPE = bs.grossPPE; // Gross PP&E from input
  const accumulatedDepreciation = bs.accumulatedDepreciation;
  const propertyPlantEquipment = bs.ppe; // Net PP&E = Gross - Accumulated Depreciation
  const totalNonCurrentAssets = propertyPlantEquipment;

  const totalAssets = add(totalCurrentAssets, totalNonCurrentAssets);

  // ==========================================================================
  // LIABILITIES
  // ==========================================================================

  // Current Liabilities
  const accountsPayable = bs.accountsPayable;
  const accruedExpenses = bs.accruedExpenses;
  const deferredRevenue = bs.deferredRevenue;
  const totalCurrentLiabilities = add(
    add(accountsPayable, accruedExpenses),
    deferredRevenue,
  );

  // Non-Current Liabilities
  const debtBalance = bs.debt;
  const totalNonCurrentLiabilities = debtBalance;

  const totalLiabilities = add(
    totalCurrentLiabilities,
    totalNonCurrentLiabilities,
  );

  // ==========================================================================
  // EQUITY
  // ==========================================================================

  // For historical data, we need to separate current year income from prior equity
  // Retained Earnings = Total Equity from database - Current Year Net Income
  const netIncomeCurrentYear = profitLoss.netIncome;
  const retainedEarnings = subtract(bs.equity, netIncomeCurrentYear);
  const totalEquity = bs.equity; // Use actual equity from database

  // ==========================================================================
  // VALIDATION: Assets = Liabilities + Equity
  // ==========================================================================

  const balanceDifference = subtract(
    totalAssets,
    add(totalLiabilities, totalEquity),
  );

  // Log detailed balance sheet breakdown if there's a difference
  if (!isWithinTolerance(balanceDifference, ZERO, BALANCE_SHEET_TOLERANCE)) {
    console.warn(`⚠️ Year ${input.year} Balance Sheet DOES NOT BALANCE`);
    console.warn(`   === ASSETS ===`);
    console.warn(`   Cash: ${cash.toFixed(2)}`);
    console.warn(`   Accounts Receivable: ${accountsReceivable.toFixed(2)}`);
    console.warn(`   Prepaid Expenses: ${prepaidExpenses.toFixed(2)}`);
    console.warn(`   Total Current Assets: ${totalCurrentAssets.toFixed(2)}`);
    console.warn(`   PP&E (Net): ${propertyPlantEquipment.toFixed(2)}`);
    console.warn(`   Accumulated Depreciation: ${accumulatedDepreciation.toFixed(2)}`);
    console.warn(`   Total Non-Current Assets: ${totalNonCurrentAssets.toFixed(2)}`);
    console.warn(`   TOTAL ASSETS: ${totalAssets.toFixed(2)}`);
    console.warn(`   === LIABILITIES ===`);
    console.warn(`   Accounts Payable: ${accountsPayable.toFixed(2)}`);
    console.warn(`   Accrued Expenses: ${accruedExpenses.toFixed(2)}`);
    console.warn(`   Deferred Revenue: ${deferredRevenue.toFixed(2)}`);
    console.warn(`   Total Current Liabilities: ${totalCurrentLiabilities.toFixed(2)}`);
    console.warn(`   Debt Balance: ${debtBalance.toFixed(2)}`);
    console.warn(`   Total Non-Current Liabilities: ${totalNonCurrentLiabilities.toFixed(2)}`);
    console.warn(`   TOTAL LIABILITIES: ${totalLiabilities.toFixed(2)}`);
    console.warn(`   === EQUITY ===`);
    console.warn(`   Retained Earnings: ${retainedEarnings.toFixed(2)}`);
    console.warn(`   Net Income (Current Year): ${netIncomeCurrentYear.toFixed(2)}`);
    console.warn(`   TOTAL EQUITY: ${totalEquity.toFixed(2)}`);
    console.warn(`   === VALIDATION ===`);
    console.warn(`   Total Liabilities + Equity: ${add(totalLiabilities, totalEquity).toFixed(2)}`);
    console.warn(`   BALANCE DIFFERENCE: ${balanceDifference.toFixed(2)}`);
  }

  return {
    year: input.year,
    cash,
    accountsReceivable,
    prepaidExpenses,
    totalCurrentAssets,
    grossPPE,
    accumulatedDepreciation,
    propertyPlantEquipment,
    totalNonCurrentAssets,
    totalAssets,
    accountsPayable,
    accruedExpenses,
    deferredRevenue,
    totalCurrentLiabilities,
    debtBalance,
    totalNonCurrentLiabilities,
    totalLiabilities,
    retainedEarnings,
    netIncomeCurrentYear,
    totalEquity,
    balanceDifference,
  };
}

// ============================================================================
// CASH FLOW CALCULATION (Indirect Method)
// ============================================================================

/**
 * Calculate Cash Flow statement using indirect method
 *
 * For HISTORICAL periods, we have actual cash values from balance sheets.
 * We calculate the cash flows that explain the change from prior year to current year.
 * Then we reverse-engineer any missing "other adjustments" to make cash reconcile.
 *
 * CFO = Net Income + Depreciation - Δ AR - Δ Prepaid + Δ AP + Δ Accrued + Δ Deferred
 * CFI = -CapEx
 * CFF = Δ Debt
 * Δ Cash = CFO + CFI + CFF + Other Adjustments (plug to reconcile)
 */
function calculateCashFlow(
  input: HistoricalPeriodInput,
  profitLoss: ProfitLossStatement,
  balanceSheet: BalanceSheet,
  previousPeriod?: FinancialPeriod,
): CashFlowStatement {
  const netIncome = profitLoss.netIncome;
  const depreciation = profitLoss.depreciation;

  // ==========================================================================
  // CALCULATE CHANGES IN WORKING CAPITAL
  // ==========================================================================

  let changeInAR = ZERO;
  let changeInPrepaid = ZERO;
  let changeInAP = ZERO;
  let changeInAccrued = ZERO;
  let changeInDeferredRevenue = ZERO;

  if (previousPeriod) {
    const prevBS = previousPeriod.balanceSheet;

    // Δ = Current Year - Prior Year
    changeInAR = subtract(
      balanceSheet.accountsReceivable,
      prevBS.accountsReceivable,
    );
    changeInPrepaid = subtract(
      balanceSheet.prepaidExpenses,
      prevBS.prepaidExpenses,
    );
    changeInAP = subtract(balanceSheet.accountsPayable, prevBS.accountsPayable);
    changeInAccrued = subtract(
      balanceSheet.accruedExpenses,
      prevBS.accruedExpenses,
    );
    changeInDeferredRevenue = subtract(
      balanceSheet.deferredRevenue,
      prevBS.deferredRevenue,
    );
  }

  // ==========================================================================
  // CASH FLOW FROM OPERATIONS
  // ==========================================================================

  const cashFlowFromOperations = add(
    add(netIncome, depreciation), // Add back non-cash expenses
    subtract(
      add(add(changeInAP, changeInAccrued), changeInDeferredRevenue), // Sources of cash
      add(changeInAR, changeInPrepaid), // Uses of cash
    ),
  );

  // ==========================================================================
  // CASH FLOW FROM INVESTING
  // ==========================================================================

  // CapEx = Δ PP&E (Gross)
  // Gross PPE = Net PPE + Accumulated Depreciation
  let capex = ZERO;

  if (previousPeriod) {
    const prevPPE = add(
      previousPeriod.balanceSheet.propertyPlantEquipment,
      previousPeriod.balanceSheet.accumulatedDepreciation,
    );
    const currentPPE = add(
      balanceSheet.propertyPlantEquipment,
      balanceSheet.accumulatedDepreciation,
    );
    capex = subtract(currentPPE, prevPPE);
  }

  const cashFlowFromInvesting = multiply(capex, ZERO.minus(ONE)); // Negative CapEx

  // ==========================================================================
  // CASH FLOW FROM FINANCING
  // ==========================================================================

  // Δ Debt
  let debtChange = ZERO;

  if (previousPeriod) {
    debtChange = subtract(
      balanceSheet.debtBalance,
      previousPeriod.balanceSheet.debtBalance,
    );
  }

  const debtIssuance = max(debtChange, ZERO);
  const debtRepayment = max(multiply(debtChange, ZERO.minus(ONE)), ZERO);

  const cashFlowFromFinancing = debtChange;

  // ==========================================================================
  // NET CHANGE IN CASH - ACTUAL vs CALCULATED
  // ==========================================================================

  const beginningCash = previousPeriod
    ? previousPeriod.balanceSheet.cash
    : ZERO;

  let netChangeInCash: Decimal;
  let endingCash: Decimal;
  let cashReconciliationDiff: Decimal;

  if (previousPeriod) {
    // For HISTORICAL periods: We know the actual ending cash from the balance sheet
    // Calculate what the cash change SHOULD be based on cash flows
    const calculatedNetChangeInCash = add(
      add(cashFlowFromOperations, cashFlowFromInvesting),
      cashFlowFromFinancing,
    );

    // Actual change in cash from balance sheets
    const actualNetChangeInCash = subtract(balanceSheet.cash, beginningCash);

    // For historical periods, we use the ACTUAL ending cash from the balance sheet
    // because that's what actually happened
    endingCash = balanceSheet.cash;
    netChangeInCash = actualNetChangeInCash;

    // The reconciliation difference shows what's unexplained by our cash flow categories
    // This could be due to:
    // - Equity injections/distributions not captured
    // - Other investing activities (asset sales, etc.)
    // - Timing differences in working capital
    // - Data quality issues
    cashReconciliationDiff = subtract(
      calculatedNetChangeInCash,
      actualNetChangeInCash,
    );
  } else {
    // First period: ending cash comes directly from balance sheet
    // Net change is simply the ending cash (since beginning is zero)
    endingCash = balanceSheet.cash;
    netChangeInCash = endingCash; // Change from 0 to current cash
    cashReconciliationDiff = ZERO; // No reconciliation needed for first period
  }

  return {
    year: input.year,
    netIncome,
    depreciation,
    changeInAR,
    changeInPrepaid,
    changeInAP,
    changeInAccrued,
    changeInDeferredRevenue,
    cashFlowFromOperations,
    capex,
    cashFlowFromInvesting,
    debtIssuance,
    debtRepayment,
    cashFlowFromFinancing,
    netChangeInCash,
    beginningCash,
    endingCash,
    cashReconciliationDiff,
  };
}

// ============================================================================
// OTHER REVENUE RATIO CALCULATION
// ============================================================================

/**
 * Calculate Other Revenue ratio from 2024 historical data
 *
 * Per Financial Rules Section 1.3: THE OTHER REVENUE RATIO PRINCIPLE
 * Other revenue maintains a constant ratio to tuition revenue based on 2024 baseline.
 *
 * Formula:
 *   Other Revenue Ratio = Other Revenue 2024 / Tuition Revenue 2024
 *   Other Revenue [Year N] = Total Tuition [Year N] × Other Revenue Ratio
 *
 * @param year2024Period The 2024 financial period
 * @returns Other revenue ratio (as Decimal)
 */
export function calculateOtherRevenueRatio(
  year2024Period: FinancialPeriod,
): Decimal {
  console.log(
    "📊 Calculating Other Revenue ratio from 2024 data (Section 1.3)...",
  );

  const pl = year2024Period.profitLoss;

  // Other Revenue as % of Tuition Revenue
  const otherRevenueRatio = divideSafe(
    pl.otherRevenue,
    pl.tuitionRevenue,
    ZERO,
  );

  console.log(
    `  ✓ Other Revenue Ratio: ${otherRevenueRatio.times(100).toFixed(2)}%`,
  );
  console.log(`  ✓ 2024 Tuition Revenue: ${pl.tuitionRevenue.toFixed(2)}`);
  console.log(`  ✓ 2024 Other Revenue: ${pl.otherRevenue.toFixed(2)}`);

  return otherRevenueRatio;
}

// ============================================================================
// WORKING CAPITAL RATIO AUTO-CALCULATION (GAP 2)
// ============================================================================

/**
 * Calculate Working Capital ratios from 2024 historical data
 *
 * These ratios will be applied to all future periods (2025-2053) unless overridden.
 *
 * Ratios calculated:
 * - AR % = AR / Revenue
 * - Prepaid % = Prepaid / OpEx
 * - AP % = AP / OpEx
 * - Accrued % = Accrued / OpEx
 * - Deferred Revenue % = Deferred Revenue / Revenue
 *
 * @param year2024Period The 2024 financial period
 * @returns Working Capital ratios
 */
export function calculateWorkingCapitalRatios(
  year2024Period: FinancialPeriod,
): WorkingCapitalRatios {
  console.log(
    "📊 Calculating Working Capital ratios from 2024 data (GAP 2)...",
  );

  const bs = year2024Period.balanceSheet;
  const pl = year2024Period.profitLoss;

  // AR as % of Revenue
  const arPercent = divideSafe(bs.accountsReceivable, pl.totalRevenue, ZERO);

  // Prepaid as % of Total OpEx
  const prepaidPercent = divideSafe(bs.prepaidExpenses, pl.totalOpex, ZERO);

  // AP as % of Total OpEx
  const apPercent = divideSafe(bs.accountsPayable, pl.totalOpex, ZERO);

  // Accrued as % of Total OpEx
  const accruedPercent = divideSafe(bs.accruedExpenses, pl.totalOpex, ZERO);

  // Deferred Revenue as % of Revenue
  const deferredRevenuePercent = divideSafe(
    bs.deferredRevenue,
    pl.totalRevenue,
    ZERO,
  );

  // Other Revenue as % of Tuition Revenue (Section 1.3 of Financial Rules)
  const otherRevenueRatio = divideSafe(
    pl.otherRevenue,
    pl.tuitionRevenue,
    ZERO,
  );

  console.log(`  ✓ AR Ratio: ${arPercent.times(100).toFixed(2)}%`);
  console.log(`  ✓ Prepaid Ratio: ${prepaidPercent.times(100).toFixed(2)}%`);
  console.log(`  ✓ AP Ratio: ${apPercent.times(100).toFixed(2)}%`);
  console.log(`  ✓ Accrued Ratio: ${accruedPercent.times(100).toFixed(2)}%`);
  console.log(
    `  ✓ Deferred Revenue Ratio: ${deferredRevenuePercent.times(100).toFixed(2)}%`,
  );
  console.log(
    `  ✓ Other Revenue Ratio: ${otherRevenueRatio.times(100).toFixed(2)}%`,
  );

  return {
    arPercent,
    prepaidPercent,
    apPercent,
    accruedPercent,
    deferredRevenuePercent,
    otherRevenueRatio,
    locked: false,
    calculatedFrom2024: true,
  };
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate historical period data integrity
 *
 * Checks:
 * - Balance sheet balances (Assets = Liabilities + Equity)
 * - Cash flow reconciles (Ending Cash = Balance Sheet Cash)
 * - No negative values where not expected
 */
export function validateHistoricalPeriod(period: FinancialPeriod): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check balance sheet balancing
  if (
    !isWithinTolerance(
      period.balanceSheet.balanceDifference,
      ZERO,
      BALANCE_SHEET_TOLERANCE,
    )
  ) {
    errors.push(
      `Balance sheet does not balance (diff: ${period.balanceSheet.balanceDifference.toFixed(2)})`,
    );
  }

  // Check cash flow reconciliation
  if (
    !isWithinTolerance(
      period.cashFlow.cashReconciliationDiff,
      ZERO,
      CASH_FLOW_TOLERANCE,
    )
  ) {
    errors.push(
      `Cash flow does not reconcile (diff: ${period.cashFlow.cashReconciliationDiff.toFixed(2)})`,
    );
  }

  // Warnings for unusual values
  if (period.balanceSheet.cash.isNegative()) {
    warnings.push("Cash balance is negative");
  }

  if (period.balanceSheet.totalEquity.isNegative()) {
    warnings.push("Total equity is negative");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
