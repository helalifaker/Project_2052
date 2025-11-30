/**
 * PHASE 2: TRANSITION PERIOD CALCULATOR (2025-2027)
 *
 * This module handles the calculation of transition periods between historical
 * data and full dynamic projections.
 *
 * Key Features:
 * - GAP 19: Pre-fill logic from prior year
 * - Ratio-based revenue and expense projections
 * - Period linkage (2024→2025)
 * - Rent model integration (Fixed, Revenue Share, Partner Investment)
 * - Working capital ratio application from 2024
 * - CapEx and depreciation tracking
 *
 * @module periods/transition
 */

import type {
  TransitionPeriodInput,
  FinancialPeriod,
  ProfitLossStatement,
  BalanceSheet,
  CashFlowStatement,
  WorkingCapitalRatios,
  SystemConfiguration,
  RentModel,
  FixedRentParams,
  RevenueShareParams,
  PartnerInvestmentParams,
  CapExConfiguration,
  HistoricalDepreciationState,
  CapExVirtualAsset,
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
  min,
} from "../core/decimal-utils";
import Decimal from "decimal.js";
import {
  calculateCapexYearResult,
  updateHistoricalDepreciationState,
} from "../capex/capex-calculator";

// ============================================================================
// MAIN TRANSITION PERIOD CALCULATOR
// ============================================================================

/**
 * Calculate a transition period with projections and pre-fill logic
 *
 * Transition periods bridge historical data and dynamic projections.
 * They use ratio-based projections and can pre-fill from prior years.
 *
 * @param input Transition period input data
 * @param systemConfig System configuration
 * @param previousPeriod Previous year's period (required for transition)
 * @param workingCapitalRatios Working capital ratios from 2024
 * @param rentModel Rent model to use
 * @param rentParams Parameters for the selected rent model
 * @param capexConfig CAPEX configuration (optional for backward compatibility)
 * @param historicalDepreciationState Historical depreciation state (optional for backward compatibility)
 * @param virtualAssets Virtual assets accumulated from prior periods (optional for backward compatibility)
 * @returns Complete financial period
 */
export function calculateTransitionPeriod(
  input: TransitionPeriodInput,
  systemConfig: SystemConfiguration,
  previousPeriod: FinancialPeriod,
  workingCapitalRatios: WorkingCapitalRatios,
  _rentModel: RentModel,
  _rentParams: FixedRentParams | RevenueShareParams | PartnerInvestmentParams,
  capexConfig?: CapExConfiguration,
  historicalDepreciationState?: HistoricalDepreciationState,
  virtualAssets?: CapExVirtualAsset[],
): FinancialPeriod {
  const startTime = performance.now();

  // ==========================================================================
  // PRE-FILL LOGIC (GAP 19)
  // ==========================================================================

  const projectedData = applyPreFillLogic(input, previousPeriod);

  // ==========================================================================
  // CAPEX CALCULATION (moved before P&L to avoid scope issues)
  // ==========================================================================

  let depreciation = previousPeriod.profitLoss.depreciation;
  let capexYearResult = undefined;

  if (capexConfig && historicalDepreciationState) {
    const priorGrossPPE = previousPeriod.balanceSheet.grossPPE;
    const priorAccumulatedDepr = previousPeriod.balanceSheet.accumulatedDepreciation;

    capexYearResult = calculateCapexYearResult(
      input.year,
      capexConfig,
      "transition",
      priorGrossPPE,
      priorAccumulatedDepr,
      historicalDepreciationState,
    );

    // Use depreciation from CAPEX calculation
    depreciation = capexYearResult.totalDepreciation;
  }

  // ==========================================================================
  // PROFIT & LOSS STATEMENT
  // ==========================================================================

  const profitLoss = calculateProfitLoss(
    input,
    projectedData,
    systemConfig,
    previousPeriod,
    workingCapitalRatios,
    depreciation,
  );

  // ==========================================================================
  // CASH FLOW STATEMENT (Calculate first to get ending cash)
  // ==========================================================================

  // First pass: Calculate cash flow changes without full balance sheet
  const cashFlowChanges = calculateCashFlowChanges(
    input,
    profitLoss,
    previousPeriod,
    workingCapitalRatios,
    capexYearResult,
  );

  // ==========================================================================
  // BALANCE SHEET (Using calculated ending cash)
  // ==========================================================================

  const balanceSheet = calculateBalanceSheet(
    input,
    profitLoss,
    previousPeriod,
    workingCapitalRatios,
    cashFlowChanges.endingCash,
    capexYearResult,
  );

  // ==========================================================================
  // CASH FLOW STATEMENT (Final pass with complete balance sheet)
  // ==========================================================================

  const cashFlow = buildCashFlowStatement(
    input,
    profitLoss,
    balanceSheet,
    previousPeriod,
    cashFlowChanges,
  );

  // ==========================================================================
  // VALIDATION
  // ==========================================================================

  const balanceSheetBalanced = isWithinTolerance(
    balanceSheet.balanceDifference,
    ZERO,
    BALANCE_SHEET_TOLERANCE,
  );

  const cashFlowReconciled = isWithinTolerance(
    cashFlow.cashReconciliationDiff,
    ZERO,
    CASH_FLOW_TOLERANCE,
  );

  if (!balanceSheetBalanced) {
    console.warn(
      `⚠️  Year ${input.year}: Balance sheet not balanced (diff: ${balanceSheet.balanceDifference.toFixed(2)})`,
    );
  }

  if (!cashFlowReconciled) {
    console.warn(
      `⚠️  Year ${input.year}: Cash flow not reconciled (diff: ${cashFlow.cashReconciliationDiff.toFixed(2)})`,
    );
  }

  // ==========================================================================
  // RETURN FINANCIAL PERIOD
  // ==========================================================================

  const endTime = performance.now();
  const calculationTime = endTime - startTime;

  // Store CAPEX result on period for engine to accumulate assets
  const returnPeriod = {
    year: input.year,
    periodType: PeriodType.TRANSITION,
    profitLoss,
    balanceSheet,
    cashFlow,
    calculatedAt: new Date(),
    iterationsRequired: 0, // Circular solver will be added in Week 4
    converged: true,
    balanceSheetBalanced,
    cashFlowReconciled,
    ...(capexYearResult && { capexResult: capexYearResult }),
  } as any;

  return returnPeriod;
}

// ============================================================================
// PRE-FILL LOGIC (GAP 19)
// ============================================================================

interface ProjectedData {
  revenue: Decimal;
  staffCostsRatio: Decimal;
  otherOpex: Decimal;
}

/**
 * Apply pre-fill logic from prior year
 *
 * GAP 19: If preFillFromPriorYear is enabled, use prior year values as baseline
 * and apply growth rates. Otherwise, use manual inputs.
 */
function applyPreFillLogic(
  input: TransitionPeriodInput,
  previousPeriod: FinancialPeriod,
): ProjectedData {
  if (input.preFillFromPriorYear) {
    console.log(
      `📋 Year ${input.year}: Pre-filling from prior year (GAP 19)...`,
    );

    // If student/tuition provided, override growth approach
    if (input.numberOfStudents && input.averageTuitionPerStudent) {
      const revenue = input.averageTuitionPerStudent.times(
        input.numberOfStudents,
      );
      const priorTotalRevenue = previousPeriod.profitLoss.totalRevenue;
      const priorStaffCosts = previousPeriod.profitLoss.staffCosts;
      const staffCostsRatio = divideSafe(
        priorStaffCosts,
        priorTotalRevenue,
        ZERO,
      );
      // Carry forward Other OpEx from previous period
      const otherOpex = previousPeriod.profitLoss.otherOpex;

      return {
        revenue,
        staffCostsRatio,
        otherOpex,
      };
    }

    // Use tuition revenue only for growth calculation (not total revenue)
    const priorTuitionRevenue = previousPeriod.profitLoss.tuitionRevenue;
    const growthRate = input.revenueGrowthRate || ZERO;

    // Revenue = Prior Tuition Revenue × (1 + Growth Rate)
    const revenue = multiply(priorTuitionRevenue, add(ONE, growthRate));

    // Staff costs as ratio of total revenue (from prior year)
    const priorStaffCosts = previousPeriod.profitLoss.staffCosts;
    const priorTotalRevenue = previousPeriod.profitLoss.totalRevenue;
    const staffCostsRatio = divideSafe(
      priorStaffCosts,
      priorTotalRevenue,
      ZERO,
    );

    // Carry forward Other OpEx from previous period
    const otherOpex = previousPeriod.profitLoss.otherOpex;

    console.log(
      `  ✓ Revenue: ${revenue.toFixed(2)} (Growth: ${growthRate.times(100).toFixed(2)}%)`,
    );
    console.log(
      `  ✓ Staff Costs Ratio: ${staffCostsRatio.times(100).toFixed(2)}%`,
    );
    console.log(`  ✓ Other OpEx: ${otherOpex.toFixed(2)}`);

    return {
      revenue,
      staffCostsRatio,
      otherOpex,
    };
  } else {
    console.log(`📋 Year ${input.year}: Using manual inputs (no pre-fill)...`);

    if (input.numberOfStudents && input.averageTuitionPerStudent) {
      const revenue = input.averageTuitionPerStudent.times(
        input.numberOfStudents,
      );
      const priorTotalRevenue = previousPeriod.profitLoss.totalRevenue;
      const staffCostsRatio =
        input.staffCostsRatio ||
        divideSafe(
          previousPeriod.profitLoss.staffCosts,
          priorTotalRevenue,
          ZERO,
        );
      // Carry forward Other OpEx from previous period
      const otherOpex = previousPeriod.profitLoss.otherOpex;

      return {
        revenue,
        staffCostsRatio,
        otherOpex,
      };
    }

    // Use manual growth inputs from TransitionPeriodInput
    const priorTuitionRevenue = previousPeriod.profitLoss.tuitionRevenue;
    const growthRate = input.revenueGrowthRate || ZERO;
    const revenue = multiply(priorTuitionRevenue, add(ONE, growthRate));

    const priorTotalRevenue = previousPeriod.profitLoss.totalRevenue;
    const staffCostsRatio =
      input.staffCostsRatio ||
      divideSafe(previousPeriod.profitLoss.staffCosts, priorTotalRevenue, ZERO);

    // Carry forward Other OpEx from previous period
    const otherOpex = previousPeriod.profitLoss.otherOpex;

    return {
      revenue,
      staffCostsRatio,
      otherOpex,
    };
  }
}

// ============================================================================
// PROFIT & LOSS CALCULATION
// ============================================================================

/**
 * Calculate Profit & Loss statement for transition period
 */
function calculateProfitLoss(
  input: TransitionPeriodInput,
  projectedData: ProjectedData,
  systemConfig: SystemConfiguration,
  previousPeriod: FinancialPeriod,
  workingCapitalRatios: WorkingCapitalRatios,
  depreciation: Decimal,
): ProfitLossStatement {
  // ==========================================================================
  // REVENUE
  // ==========================================================================

  let tuitionRevenue = projectedData.revenue;
  if (input.numberOfStudents && input.averageTuitionPerStudent) {
    tuitionRevenue = input.averageTuitionPerStudent.times(
      input.numberOfStudents,
    );
  }

  // Calculate Other Revenue using 2024 baseline ratio (Section 1.3 of Financial Rules)
  // Other Revenue = Tuition Revenue × Other Revenue Ratio
  const otherRevenue = multiply(
    tuitionRevenue,
    workingCapitalRatios.otherRevenueRatio,
  );

  const totalRevenue = add(tuitionRevenue, otherRevenue);

  // ==========================================================================
  // RENT EXPENSE (transition uses simple growth from 2024 base)
  // ==========================================================================

  const rentExpense = calculateTransitionRent(input, previousPeriod);

  // ==========================================================================
  // STAFF COSTS (ratio-based)
  // ==========================================================================

  const staffCosts = multiply(totalRevenue, projectedData.staffCostsRatio);

  // ==========================================================================
  // OTHER OPEX
  // ==========================================================================

  const otherOpex = projectedData.otherOpex;

  // ==========================================================================
  // TOTAL OPEX & EBITDA
  // ==========================================================================

  const totalOpex = add(add(rentExpense, staffCosts), otherOpex);
  const ebitda = subtract(totalRevenue, totalOpex);

  // ==========================================================================
  // DEPRECIATION (passed as parameter from main function)
  // ==========================================================================

  // depreciation is passed as parameter from main function
  // It's either from CAPEX calculation or carried forward from prior year

  // ==========================================================================
  // EBIT
  // ==========================================================================

  const ebit = subtract(ebitda, depreciation);

  // ==========================================================================
  // INTEREST (simplified - circular solver will be added in Week 4)
  // ==========================================================================

  // For now, estimate interest based on prior year debt
  const estimatedDebt = previousPeriod.balanceSheet.debtBalance;
  const interestExpense = multiply(
    estimatedDebt,
    systemConfig.debtInterestRate,
  );

  // Interest income on cash (simplified)
  // Aligned with dynamic period logic (no minCashBalance subtraction)
  const interestIncome = multiply(
    previousPeriod.balanceSheet.cash,
    systemConfig.depositInterestRate,
  );

  const netInterest = subtract(interestIncome, interestExpense);

  // ==========================================================================
  // EBT
  // ==========================================================================

  const ebt = add(ebit, netInterest);

  // ==========================================================================
  // ZAKAT (Saudi Arabian Formula - 3-Tier Approach)
  // ==========================================================================

  // Tier 1: Try asset-based calculation (Equity - Non-Current Assets) × 2.5%
  // Tier 2: If Tier 1 ≤ 0, use profit-based calculation (EBT × 2.5%)
  // Tier 3: If both negative, Zakat = 0
  //
  // Using previous period's balance sheet as approximation (until circular solver integration)
  const prevEquity = previousPeriod.balanceSheet.totalEquity;
  const prevNonCurrentAssets = previousPeriod.balanceSheet.totalNonCurrentAssets;
  const zakatBase = subtract(prevEquity, prevNonCurrentAssets);

  let zakatExpense: Decimal;
  if (zakatBase.greaterThan(ZERO)) {
    // Tier 1: Positive net assets
    zakatExpense = multiply(zakatBase, systemConfig.zakatRate);
  } else {
    // Tier 2: Negative net assets, check profitability
    if (ebt.greaterThan(ZERO)) {
      zakatExpense = multiply(ebt, systemConfig.zakatRate);
    } else {
      // Tier 3: Both negative
      zakatExpense = ZERO;
    }
  }

  // ==========================================================================
  // NET INCOME
  // ==========================================================================

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
// RENT CALCULATION (Transition: growth from 2024 base, no rent models)
// ============================================================================

function calculateTransitionRent(
  input: TransitionPeriodInput,
  previousPeriod: FinancialPeriod,
): Decimal {
  const baseRent = previousPeriod.profitLoss.rentExpense;
  const growthRate = input.rentGrowthPercent ?? ZERO;
  const growthFactor = add(ONE, growthRate);
  return multiply(baseRent, growthFactor);
}

// ============================================================================
// CASH FLOW CHANGES CALCULATION (First Pass)
// ============================================================================

interface CashFlowChanges {
  accountsReceivable: Decimal;
  prepaidExpenses: Decimal;
  accountsPayable: Decimal;
  accruedExpenses: Decimal;
  deferredRevenue: Decimal;
  changeInAR: Decimal;
  changeInPrepaid: Decimal;
  changeInAP: Decimal;
  changeInAccrued: Decimal;
  changeInDeferredRevenue: Decimal;
  capex: Decimal;
  cashFlowFromOperations: Decimal;
  cashFlowFromInvesting: Decimal;
  debtChange: Decimal;
  cashFlowFromFinancing: Decimal;
  netChangeInCash: Decimal;
  endingCash: Decimal;
}

/**
 * Calculate cash flow changes to determine ending cash
 * This is calculated BEFORE the full balance sheet to avoid circular dependency
 */
function calculateCashFlowChanges(
  input: TransitionPeriodInput,
  profitLoss: ProfitLossStatement,
  previousPeriod: FinancialPeriod,
  workingCapitalRatios: WorkingCapitalRatios,
  capexYearResult?: any,
): CashFlowChanges {
  // ==========================================================================
  // PROJECTED BALANCE SHEET ITEMS (using WC ratios)
  // ==========================================================================

  const accountsReceivable = multiply(
    profitLoss.totalRevenue,
    workingCapitalRatios.arPercent,
  );

  const prepaidExpenses = multiply(
    profitLoss.totalOpex,
    workingCapitalRatios.prepaidPercent,
  );

  const accountsPayable = multiply(
    profitLoss.totalOpex,
    workingCapitalRatios.apPercent,
  );

  const accruedExpenses = multiply(
    profitLoss.totalOpex,
    workingCapitalRatios.accruedPercent,
  );

  const deferredRevenue = multiply(
    profitLoss.totalRevenue,
    workingCapitalRatios.deferredRevenuePercent,
  );

  // ==========================================================================
  // CHANGES IN WORKING CAPITAL
  // ==========================================================================

  const prevBS = previousPeriod.balanceSheet;

  const changeInAR = subtract(accountsReceivable, prevBS.accountsReceivable);
  const changeInPrepaid = subtract(prepaidExpenses, prevBS.prepaidExpenses);
  const changeInAP = subtract(accountsPayable, prevBS.accountsPayable);
  const changeInAccrued = subtract(accruedExpenses, prevBS.accruedExpenses);
  const changeInDeferredRevenue = subtract(
    deferredRevenue,
    prevBS.deferredRevenue,
  );

  // ==========================================================================
  // CASH FLOW FROM OPERATIONS
  // ==========================================================================

  const netIncome = profitLoss.netIncome;
  const depreciation = profitLoss.depreciation;

  const cashFlowFromOperations = add(
    add(netIncome, depreciation),
    subtract(
      add(add(changeInAP, changeInAccrued), changeInDeferredRevenue),
      add(changeInAR, changeInPrepaid),
    ),
  );

  // ==========================================================================
  // CASH FLOW FROM INVESTING
  // ==========================================================================

  // CapEx = Change in Gross PP&E (negative cash outflow)
  let capex: Decimal;
  if (capexYearResult) {
    // Use CAPEX spending from CAPEX calculation
    capex = multiply(capexYearResult.spending, new Decimal(-1));
  } else {
    // Legacy path: no new capital expenditures
    capex = ZERO;
  }

  const cashFlowFromInvesting = capex;

  // ==========================================================================
  // CASH FLOW FROM FINANCING (Debt changes)
  // ==========================================================================

  // Calculate required debt based on balance sheet identity
  // First, calculate non-cash assets
  const totalCurrentAssetsExcludingCash = add(
    accountsReceivable,
    prepaidExpenses,
  );

  // Calculate Net PP&E for debt calculation
  // Prior period now stores grossPPE directly
  const priorGrossPPE = prevBS.grossPPE;
  const priorAccumDepreciation = prevBS.accumulatedDepreciation;

  // No new CapEx in transition period
  const currentGrossPPE = priorGrossPPE;
  const projectedAccumDepreciation = add(priorAccumDepreciation, depreciation);
  const netPPE = subtract(currentGrossPPE, projectedAccumDepreciation);

  const totalNonCurrentAssets = netPPE;
  const totalAssetsExcludingCash = add(
    totalCurrentAssetsExcludingCash,
    totalNonCurrentAssets,
  );

  // Calculate liabilities (excluding debt)
  const totalCurrentLiabilities = add(
    add(accountsPayable, accruedExpenses),
    deferredRevenue,
  );

  // Calculate equity
  const retainedEarnings = prevBS.totalEquity;
  const totalEquity = add(retainedEarnings, netIncome);

  // Calculate ending cash from operations and investing
  const beginningCash = prevBS.cash;
  const cashBeforeFinancing = add(
    beginningCash,
    add(cashFlowFromOperations, cashFlowFromInvesting),
  );

  // Calculate debt needed to balance (or use excess cash)
  // Assets = Liabilities + Equity
  // Cash + Non-Cash Assets = Current Liabilities + Debt + Equity
  // Debt = Cash + Non-Cash Assets - Current Liabilities - Equity

  // We want: Total Assets = Total Liabilities + Equity
  // Cash + Non-Cash Assets = Current Liabilities + Debt + Equity
  // Therefore: Debt = Cash + Non-Cash Assets - Current Liabilities - Equity

  // But we also know: Cash = Beginning Cash + CFO + CFI + CFF
  // And: CFF = Debt Change

  // So: Ending Cash = Beginning Cash + CFO + CFI + Debt Change

  // From balance sheet: Debt = (Cash + Non-Cash Assets) - Current Liabilities - Equity
  // Substituting Cash: Debt = (Beginning Cash + CFO + CFI + Debt Change + Non-Cash Assets) - Current Liabilities - Equity
  // Debt = Beginning Cash + CFO + CFI + Debt Change + Non-Cash Assets - Current Liabilities - Equity
  // Debt = Beginning Cash + CFO + CFI + Non-Cash Assets - Current Liabilities - Equity + Debt Change
  // Debt - Debt Change = Beginning Cash + CFO + CFI + Non-Cash Assets - Current Liabilities - Equity
  // Prior Debt = Beginning Cash + CFO + CFI + Non-Cash Assets - Current Liabilities - Equity

  // Solving for Debt:
  // Debt = (Cash Before Financing + Non-Cash Assets) - Current Liabilities - Equity
  const requiredDebt = max(
    subtract(
      add(cashBeforeFinancing, totalAssetsExcludingCash),
      add(totalCurrentLiabilities, totalEquity),
    ),
    ZERO,
  );

  const debtChange = subtract(requiredDebt, prevBS.debtBalance);
  const cashFlowFromFinancing = debtChange;

  // ==========================================================================
  // NET CHANGE IN CASH & ENDING CASH
  // ==========================================================================

  const netChangeInCash = add(
    add(cashFlowFromOperations, cashFlowFromInvesting),
    cashFlowFromFinancing,
  );

  const endingCash = add(beginningCash, netChangeInCash);

  return {
    accountsReceivable,
    prepaidExpenses,
    accountsPayable,
    accruedExpenses,
    deferredRevenue,
    changeInAR,
    changeInPrepaid,
    changeInAP,
    changeInAccrued,
    changeInDeferredRevenue,
    capex,
    cashFlowFromOperations,
    cashFlowFromInvesting,
    debtChange,
    cashFlowFromFinancing,
    netChangeInCash,
    endingCash,
  };
}

// ============================================================================
// BALANCE SHEET CALCULATION
// ============================================================================

/**
 * Calculate Balance Sheet for transition period
 *
 * Uses working capital ratios from 2024 to project BS line items
 * Uses pre-calculated ending cash to avoid circular dependency
 */
function calculateBalanceSheet(
  input: TransitionPeriodInput,
  profitLoss: ProfitLossStatement,
  previousPeriod: FinancialPeriod,
  workingCapitalRatios: WorkingCapitalRatios,
  endingCash: Decimal,
  capexYearResult?: any,
): BalanceSheet {
  // ==========================================================================
  // CURRENT ASSETS (using WC ratios)
  // ==========================================================================

  // AR = Revenue × AR %
  const accountsReceivable = multiply(
    profitLoss.totalRevenue,
    workingCapitalRatios.arPercent,
  );

  // Prepaid = Total OpEx × Prepaid %
  const prepaidExpenses = multiply(
    profitLoss.totalOpex,
    workingCapitalRatios.prepaidPercent,
  );

  // Use pre-calculated ending cash from cash flow
  const cash = endingCash;

  const totalCurrentAssets = add(
    add(cash, accountsReceivable),
    prepaidExpenses,
  );

  // ==========================================================================
  // NON-CURRENT ASSETS
  // ==========================================================================

  // PP&E accounting:
  let grossPPE: Decimal;
  let accumulatedDepreciation: Decimal;
  let propertyPlantEquipment: Decimal;

  if (capexYearResult) {
    // Use PPE from CAPEX calculation (already includes this year's CAPEX and depreciation)
    grossPPE = capexYearResult.grossPPE;
    accumulatedDepreciation = capexYearResult.accumulatedDepreciation;
    propertyPlantEquipment = capexYearResult.netPPE;
  } else {
    // Legacy path: no CAPEX config provided
    const priorGrossPPE = previousPeriod.balanceSheet.grossPPE;
    const priorAccumDepreciation =
      previousPeriod.balanceSheet.accumulatedDepreciation;

    // For transition period without CAPEX config, assume no new CapEx
    const capexSpending = ZERO;
    grossPPE = add(priorGrossPPE, capexSpending);

    // Accumulated Depreciation grows each period
    accumulatedDepreciation = add(
      priorAccumDepreciation,
      profitLoss.depreciation,
    );

    // Net PP&E = Gross PP&E - Accumulated Depreciation
    propertyPlantEquipment = subtract(grossPPE, accumulatedDepreciation);
  }
  const totalNonCurrentAssets = propertyPlantEquipment;

  const totalAssets = add(totalCurrentAssets, totalNonCurrentAssets);

  // ==========================================================================
  // CURRENT LIABILITIES (using WC ratios)
  // ==========================================================================

  // AP = Total OpEx × AP %
  const accountsPayable = multiply(
    profitLoss.totalOpex,
    workingCapitalRatios.apPercent,
  );

  // Accrued = Total OpEx × Accrued %
  const accruedExpenses = multiply(
    profitLoss.totalOpex,
    workingCapitalRatios.accruedPercent,
  );

  // Deferred Revenue = Revenue × Deferred %
  const deferredRevenue = multiply(
    profitLoss.totalRevenue,
    workingCapitalRatios.deferredRevenuePercent,
  );

  const totalCurrentLiabilities = add(
    add(accountsPayable, accruedExpenses),
    deferredRevenue,
  );

  // ==========================================================================
  // EQUITY
  // ==========================================================================

  const netIncomeCurrentYear = profitLoss.netIncome;
  const retainedEarnings = previousPeriod.balanceSheet.totalEquity;
  const totalEquity = add(retainedEarnings, netIncomeCurrentYear);

  // ==========================================================================
  // NON-CURRENT LIABILITIES (PLUG to balance)
  // ==========================================================================

  // Debt = Assets - Current Liabilities - Equity
  // This is the PLUG to make balance sheet balance
  const debtBalance = max(
    subtract(totalAssets, add(totalCurrentLiabilities, totalEquity)),
    ZERO,
  );

  const totalNonCurrentLiabilities = debtBalance;
  const totalLiabilities = add(
    totalCurrentLiabilities,
    totalNonCurrentLiabilities,
  );

  // ==========================================================================
  // VALIDATION
  // ==========================================================================

  const balanceDifference = subtract(
    totalAssets,
    add(totalLiabilities, totalEquity),
  );

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
// CASH FLOW STATEMENT BUILDER (Final Pass)
// ============================================================================

/**
 * Build final Cash Flow statement using pre-calculated changes and final balance sheet
 * This ensures cash flow reconciles with the balance sheet
 */
function buildCashFlowStatement(
  input: TransitionPeriodInput,
  profitLoss: ProfitLossStatement,
  balanceSheet: BalanceSheet,
  previousPeriod: FinancialPeriod,
  cashFlowChanges: CashFlowChanges,
): CashFlowStatement {
  const netIncome = profitLoss.netIncome;
  const depreciation = profitLoss.depreciation;

  // Use pre-calculated working capital changes
  const changeInAR = cashFlowChanges.changeInAR;
  const changeInPrepaid = cashFlowChanges.changeInPrepaid;
  const changeInAP = cashFlowChanges.changeInAP;
  const changeInAccrued = cashFlowChanges.changeInAccrued;
  const changeInDeferredRevenue = cashFlowChanges.changeInDeferredRevenue;

  // Use pre-calculated cash flows
  const cashFlowFromOperations = cashFlowChanges.cashFlowFromOperations;
  const capex = cashFlowChanges.capex;
  const cashFlowFromInvesting = cashFlowChanges.cashFlowFromInvesting;

  // Calculate debt issuance/repayment from balance sheet
  const prevBS = previousPeriod.balanceSheet;
  const debtChange = subtract(balanceSheet.debtBalance, prevBS.debtBalance);
  const debtIssuance = max(debtChange, ZERO);
  const debtRepayment = max(multiply(debtChange, ZERO.minus(ONE)), ZERO);
  const cashFlowFromFinancing = debtChange;

  // Cash reconciliation
  const beginningCash = prevBS.cash;
  const netChangeInCash = add(
    add(cashFlowFromOperations, cashFlowFromInvesting),
    cashFlowFromFinancing,
  );
  const endingCash = add(beginningCash, netChangeInCash);

  // Validation: ending cash should match balance sheet cash
  const cashReconciliationDiff = subtract(endingCash, balanceSheet.cash);

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
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate transition period data integrity
 */
export function validateTransitionPeriod(period: FinancialPeriod): {
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

  if (period.profitLoss.netIncome.isNegative()) {
    warnings.push("Net income is negative");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate period linkage between years
 *
 * Ensures continuity from 2024 → 2025 and between transition years
 */
export function validatePeriodLinkage(
  currentPeriod: FinancialPeriod,
  previousPeriod: FinancialPeriod,
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check that years are sequential
  if (currentPeriod.year !== previousPeriod.year + 1) {
    errors.push(
      `Years are not sequential: ${previousPeriod.year} -> ${currentPeriod.year}`,
    );
  }

  // Check that equity continuity is maintained
  // Current Beginning Equity should = Prior Ending Equity
  const priorEndingEquity = previousPeriod.balanceSheet.totalEquity;
  const currentBeginningEquity = currentPeriod.balanceSheet.retainedEarnings;

  if (
    !isWithinTolerance(
      currentBeginningEquity,
      priorEndingEquity,
      BALANCE_SHEET_TOLERANCE,
    )
  ) {
    errors.push(
      `Equity linkage broken: Prior ending (${priorEndingEquity.toFixed(2)}) ≠ Current beginning (${currentBeginningEquity.toFixed(2)})`,
    );
  }

  // Check cash flow linkage
  const priorEndingCash = previousPeriod.balanceSheet.cash;
  const currentBeginningCash = currentPeriod.cashFlow.beginningCash;

  if (
    !isWithinTolerance(
      currentBeginningCash,
      priorEndingCash,
      CASH_FLOW_TOLERANCE,
    )
  ) {
    errors.push(
      `Cash linkage broken: Prior ending (${priorEndingCash.toFixed(2)}) ≠ Current beginning (${currentBeginningCash.toFixed(2)})`,
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
