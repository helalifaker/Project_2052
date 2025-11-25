/**
 * CIRCULAR DEPENDENCY SOLVER
 *
 * Solves circular dependencies between Debt, Interest, Zakat, and Net Income.
 *
 * The Problem:
 * - Interest Expense depends on Debt Balance
 * - Zakat depends on EBT (which depends on Interest)
 * - Net Income depends on Zakat
 * - Debt Balance depends on cash shortfall (which depends on Net Income)
 *
 * The Solution:
 * Fixed-point iteration with relaxation factor for stability.
 *
 * GAP Coverage:
 * - GAP 11: Circular Dependency Solver
 * - GAP 14: Minimum Cash Balance (if cash < min, issue debt)
 * - GAP 16: Bank Deposit Interest (excess cash earns interest)
 *
 * @module solvers/circular
 */

import Decimal from "decimal.js";
import { ZERO, ONE } from "../core/constants";
import {
  add,
  subtract,
  multiply,
  max,
  min,
  abs,
  isGreaterThan,
  isLessThan,
} from "../core/decimal-utils";
import type {
  CircularSolverConfig,
  CircularSolverResult,
  SystemConfiguration,
  FinancialPeriod,
  WorkingCapitalRatios,
} from "../core/types";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Input to the circular solver.
 * Contains all the components needed to calculate debt, interest, and zakat.
 */
export interface CircularSolverInput {
  // Prior year balances
  priorPeriod: FinancialPeriod | null; // null for first year

  // Current year income statement components (already calculated)
  revenue: Decimal; // Total revenue
  rentExpense: Decimal; // Rent expense
  staffCosts: Decimal; // Staff costs
  otherOpEx: Decimal; // Other operating expenses
  depreciation: Decimal; // Depreciation expense
  ebit: Decimal; // EBIT (before interest)

  // Current year balance sheet components (already calculated)
  accountsReceivable: Decimal;
  prepaidExpenses: Decimal;
  grossPPE: Decimal;
  accumulatedDepreciation: Decimal;
  accountsPayable: Decimal;
  accruedExpenses: Decimal;
  deferredRevenue: Decimal;

  // Current year cash flow components
  capex: Decimal; // Capital expenditures (negative for cash outflow)

  // System configuration
  systemConfig: SystemConfiguration;

  // Solver configuration
  solverConfig: CircularSolverConfig;

  // Working capital ratios (for validation)
  wcRatios: WorkingCapitalRatios;

  // Year for debugging
  year: number;
}

/**
 * Intermediate calculation state during iteration.
 */
interface IterationState {
  // Estimates (updated each iteration)
  debtEstimate: Decimal;

  // Calculated values
  interestExpense: Decimal;
  interestIncome: Decimal;
  netInterest: Decimal;
  ebt: Decimal;
  zakat: Decimal;
  netIncome: Decimal;

  // Cash flow statement
  operatingCashFlow: Decimal;
  investingCashFlow: Decimal;
  financingCashFlow: Decimal;
  netCashFlow: Decimal;
  cash: Decimal;

  // Balance sheet
  totalAssets: Decimal;
  totalCurrentLiabilities: Decimal;
  equity: Decimal;
  requiredDebt: Decimal;

  // Cash calculation
  excessCash: Decimal;

  // Convergence
  debtDifference: Decimal;
}

// ============================================================================
// MAIN SOLVER FUNCTION
// ============================================================================

/**
 * Solves circular dependencies for a single year.
 *
 * Uses fixed-point iteration with relaxation to converge on:
 * - Debt balance
 * - Interest expense/income
 * - Zakat expense
 *
 * @param input - All components needed for circular calculation
 * @returns Solver result with converged values
 */
export function solveCircularDependencies(
  input: CircularSolverInput,
): CircularSolverResult {
  const {
    priorPeriod,
    revenue,
    rentExpense,
    staffCosts,
    otherOpEx,
    depreciation,
    ebit,
    accountsReceivable,
    prepaidExpenses,
    grossPPE,
    accumulatedDepreciation,
    accountsPayable,
    accruedExpenses,
    deferredRevenue,
    capex,
    systemConfig,
    solverConfig,
    year,
  } = input;

  // Extract configuration
  const { zakatRate, debtInterestRate, depositInterestRate, minCashBalance } =
    systemConfig;
  const { maxIterations, convergenceTolerance, relaxationFactor } =
    solverConfig;

  // Use relaxation factor if provided, otherwise default to 0.5
  const relax = relaxationFactor ?? new Decimal(0.5);

  // Initial guess: debt from prior year (or zero for first year)
  let debtEstimate = priorPeriod?.balanceSheet?.debtBalance ?? ZERO;

  // Iteration loop
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    // Calculate iteration state
    const state = calculateIterationState({
      debtEstimate,
      priorPeriod,
      revenue,
      rentExpense,
      staffCosts,
      otherOpEx,
      depreciation,
      ebit,
      accountsReceivable,
      prepaidExpenses,
      grossPPE,
      accumulatedDepreciation,
      accountsPayable,
      accruedExpenses,
      deferredRevenue,
      capex,
      zakatRate,
      debtInterestRate,
      depositInterestRate,
      minCashBalance,
    });

    // Check convergence
    if (isLessThan(state.debtDifference, convergenceTolerance)) {
      // Converged!
      return {
        converged: true,
        iterations: iteration + 1,
        finalDifference: state.debtDifference,
        interestExpense: state.interestExpense,
        interestIncome: state.interestIncome,
        netInterest: state.netInterest,
        zakatExpense: state.zakat,
        debtBalance: state.requiredDebt,
        ebt: state.ebt,
        netIncome: state.netIncome,
        cash: state.cash,
      };
    }

    // Update estimate with relaxation for stability
    // new_estimate = old_estimate * relax + new_value * (1 - relax)
    debtEstimate = add(
      multiply(debtEstimate, relax),
      multiply(state.requiredDebt, subtract(ONE, relax)),
    );
  }

  // Did not converge within max iterations
  // Return last state but mark as not converged
  const finalState = calculateIterationState({
    debtEstimate,
    priorPeriod,
    revenue,
    rentExpense,
    staffCosts,
    otherOpEx,
    depreciation,
    ebit,
    accountsReceivable,
    prepaidExpenses,
    grossPPE,
    accumulatedDepreciation,
    accountsPayable,
    accruedExpenses,
    deferredRevenue,
    capex,
    zakatRate,
    debtInterestRate,
    depositInterestRate,
    minCashBalance,
  });

  return {
    converged: false,
    iterations: maxIterations,
    finalDifference: finalState.debtDifference,
    interestExpense: finalState.interestExpense,
    interestIncome: finalState.interestIncome,
    netInterest: finalState.netInterest,
    zakatExpense: finalState.zakat,
    debtBalance: finalState.requiredDebt,
    ebt: finalState.ebt,
    netIncome: finalState.netIncome,
    cash: finalState.cash,
  };
}

// ============================================================================
// ITERATION STATE CALCULATION
// ============================================================================

/**
 * Calculates all dependent values for a given debt estimate.
 *
 * This is the core of the fixed-point iteration.
 *
 * Steps:
 * 1. Calculate cash using cash flow statement (indirect method)
 * 2. Calculate interest income based on excess cash (GAP 16)
 * 3. Calculate interest expense (debt × rate)
 * 4. Calculate EBT (EBIT + net interest)
 * 5. Calculate Zakat (2.5% of positive EBT)
 * 6. Calculate Net Income (EBT - Zakat)
 * 7. Recalculate cash flow with correct net income
 * 8. Calculate balance sheet and required debt (PLUG)
 * 9. Check if more debt needed for minimum cash (GAP 14)
 * 10. Calculate difference from estimate
 */
function calculateIterationState(params: {
  debtEstimate: Decimal;
  priorPeriod: FinancialPeriod | null;
  revenue: Decimal;
  rentExpense: Decimal;
  staffCosts: Decimal;
  otherOpEx: Decimal;
  depreciation: Decimal;
  ebit: Decimal;
  accountsReceivable: Decimal;
  prepaidExpenses: Decimal;
  grossPPE: Decimal;
  accumulatedDepreciation: Decimal;
  accountsPayable: Decimal;
  accruedExpenses: Decimal;
  deferredRevenue: Decimal;
  capex: Decimal;
  zakatRate: Decimal;
  debtInterestRate: Decimal;
  depositInterestRate: Decimal;
  minCashBalance: Decimal;
}): IterationState {
  const {
    debtEstimate,
    priorPeriod,
    revenue,
    rentExpense,
    staffCosts,
    otherOpEx,
    depreciation,
    ebit,
    accountsReceivable,
    prepaidExpenses,
    grossPPE,
    accumulatedDepreciation,
    accountsPayable,
    accruedExpenses,
    deferredRevenue,
    capex,
    zakatRate,
    debtInterestRate,
    depositInterestRate,
    minCashBalance,
  } = params;

  // Get prior year values
  const priorCash = priorPeriod?.balanceSheet?.cash ?? ZERO;
  const priorDebt = priorPeriod?.balanceSheet?.debtBalance ?? ZERO;
  const priorAR = priorPeriod?.balanceSheet?.accountsReceivable ?? ZERO;
  const priorPrepaid = priorPeriod?.balanceSheet?.prepaidExpenses ?? ZERO;
  const priorAP = priorPeriod?.balanceSheet?.accountsPayable ?? ZERO;
  const priorAccrued = priorPeriod?.balanceSheet?.accruedExpenses ?? ZERO;
  const priorDeferred = priorPeriod?.balanceSheet?.deferredRevenue ?? ZERO;
  const priorEquity = priorPeriod?.balanceSheet?.totalEquity ?? ZERO;

  // Step 1: Calculate interest expense based on AVERAGE debt (opening + closing) / 2
  // For first iteration, we use estimate for closing debt
  const averageDebt = priorDebt.plus(debtEstimate).dividedBy(2);
  const interestExpense = multiply(averageDebt, debtInterestRate);

  // Step 2: Estimate interest income (we'll refine this after calculating cash)
  // Use AVERAGE cash (opening + closing) / 2
  // For first iteration, we use prior cash for opening, estimate closing
  const priorExcessCash = max(ZERO, subtract(priorCash, minCashBalance));
  let interestIncome = multiply(priorExcessCash, depositInterestRate);

  // Step 3: Calculate EBT (first pass)
  let netInterest = subtract(interestIncome, interestExpense);
  let ebt = add(ebit, netInterest);

  // Step 4: Calculate Net Income (first pass - without zakat yet)
  // We need this to calculate equity for zakat calculation
  let netIncome = ebt; // Temporary value

  // Step 5: Calculate Equity and Zakat based on (Equity - Non-Current Assets) × Rate
  // Per 04_FINANCIAL_RULES.md Section 1.9
  const netPPEForZakat = subtract(grossPPE, accumulatedDepreciation);
  const equityForZakat = add(priorEquity, netIncome); // Using temporary netIncome
  const zakatBase = subtract(equityForZakat, netPPEForZakat);
  let zakat = zakatBase.lessThanOrEqualTo(ZERO)
    ? ZERO
    : multiply(zakatBase, zakatRate);

  // Step 6: Recalculate Net Income with zakat
  netIncome = subtract(ebt, zakat);

  // Step 6: Calculate cash flow (indirect method)
  // Operating Cash Flow
  const cfoNetIncome = netIncome;
  const cfoDepreciation = depreciation; // Add back (non-cash)
  const cfoARDecrease = subtract(priorAR, accountsReceivable); // - for increase, + for decrease
  const cfoPrepaidDecrease = subtract(priorPrepaid, prepaidExpenses);
  const cfoAPIncrease = subtract(accountsPayable, priorAP); // + for increase
  const cfoAccruedIncrease = subtract(accruedExpenses, priorAccrued);
  const cfoDeferredIncrease = subtract(deferredRevenue, priorDeferred);

  let operatingCashFlow = add(
    add(
      add(
        add(
          add(add(cfoNetIncome, cfoDepreciation), cfoARDecrease),
          cfoPrepaidDecrease,
        ),
        cfoAPIncrease,
      ),
      cfoAccruedIncrease,
    ),
    cfoDeferredIncrease,
  );

  // Investing Cash Flow
  const investingCashFlow = capex; // Already negative

  // Financing Cash Flow
  const debtChange = subtract(debtEstimate, priorDebt);
  const financingCashFlow = debtChange; // Positive for issuance, negative for repayment

  // Net Cash Flow
  let netCashFlow = add(
    add(operatingCashFlow, investingCashFlow),
    financingCashFlow,
  );

  // Ending Cash (calculated value BEFORE enforcing minimum)
  let calculatedCash = add(priorCash, netCashFlow);

  // Step 7: Calculate interest income using AVERAGE of calculated cash (GAP 16)
  // IMPORTANT: Use the calculated cash (before floor) to avoid artificial interest income
  // Per 04_FINANCIAL_RULES.md Section 1.9: Use average of opening and closing cash
  const averageCash = priorCash.plus(calculatedCash).dividedBy(2);
  const averageExcessCash = max(ZERO, subtract(averageCash, minCashBalance));
  interestIncome = multiply(averageExcessCash, depositInterestRate);

  // Step 8: Enforce minimum cash requirement (GAP 14)
  // If cash < minimum, set it to minimum (but don't use this for interest calculation)
  let cash = max(minCashBalance, calculatedCash);

  // Step 9: Recalculate EBT, Zakat, and Net Income with refined interest income
  netInterest = subtract(interestIncome, interestExpense);
  ebt = add(ebit, netInterest);

  // Recalculate zakat using correct formula: (Equity - Non-Current Assets) × Rate
  // First calculate temporary netIncome without zakat
  const tempNetIncome = ebt;
  const tempEquity = add(priorEquity, tempNetIncome);
  const tempNetPPE = subtract(grossPPE, accumulatedDepreciation);
  const tempZakatBase = subtract(tempEquity, tempNetPPE);
  zakat = tempZakatBase.lessThanOrEqualTo(ZERO)
    ? ZERO
    : multiply(tempZakatBase, zakatRate);

  netIncome = subtract(ebt, zakat);

  // Step 10: Recalculate cash flow with refined net income
  operatingCashFlow = add(
    add(
      add(
        add(
          add(add(netIncome, cfoDepreciation), cfoARDecrease),
          cfoPrepaidDecrease,
        ),
        cfoAPIncrease,
      ),
      cfoAccruedIncrease,
    ),
    cfoDeferredIncrease,
  );
  netCashFlow = add(
    add(operatingCashFlow, investingCashFlow),
    financingCashFlow,
  );

  // Recalculate ending cash and enforce minimum
  calculatedCash = add(priorCash, netCashFlow);
  cash = max(minCashBalance, calculatedCash);

  // Step 11: Calculate balance sheet components
  const equity = add(priorEquity, netIncome);
  const netPPE = subtract(grossPPE, accumulatedDepreciation);
  const totalCurrentAssets = add(
    add(cash, accountsReceivable),
    prepaidExpenses,
  );
  const totalAssets = add(totalCurrentAssets, netPPE);
  const totalCurrentLiabilities = add(
    add(accountsPayable, accruedExpenses),
    deferredRevenue,
  );

  // Step 12: Calculate required debt to balance (PLUG)
  // Assets = Liabilities + Equity
  // Debt = Assets - Current Liabilities - Equity
  const requiredDebt = max(
    ZERO,
    subtract(subtract(totalAssets, totalCurrentLiabilities), equity),
  );

  // Step 13: Calculate convergence difference
  const debtDifference = abs(subtract(requiredDebt, debtEstimate));

  // Calculate final excess cash for reporting
  const excessCash = max(ZERO, subtract(cash, minCashBalance));

  return {
    debtEstimate,
    interestExpense,
    interestIncome,
    netInterest,
    ebt,
    zakat,
    netIncome,
    operatingCashFlow,
    investingCashFlow,
    financingCashFlow,
    netCashFlow,
    cash,
    totalAssets,
    totalCurrentLiabilities,
    equity,
    requiredDebt,
    excessCash,
    debtDifference,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculates interest income based on cash balance and minimum cash requirement.
 *
 * GAP 16: Bank Deposit Interest
 * - If cash > minimum, excess earns interest at deposit rate
 * - If cash <= minimum, no interest income
 *
 * @param cash - Current cash balance
 * @param minCashBalance - Minimum required cash (GAP 14)
 * @param depositInterestRate - Annual deposit interest rate
 * @returns Interest income for the year
 */
export function calculateInterestIncome(
  cash: Decimal,
  minCashBalance: Decimal,
  depositInterestRate: Decimal,
): Decimal {
  const excessCash = max(ZERO, subtract(cash, minCashBalance));
  return multiply(excessCash, depositInterestRate);
}

/**
 * Calculates interest expense based on debt balance and interest rate.
 *
 * @param debt - Current debt balance
 * @param debtInterestRate - Annual debt interest rate
 * @returns Interest expense for the year
 */
export function calculateInterestExpense(
  debt: Decimal,
  debtInterestRate: Decimal,
): Decimal {
  return multiply(debt, debtInterestRate);
}

/**
 * Calculates zakat expense based on (Equity - Non-Current Assets) and zakat rate.
 *
 * Per 04_FINANCIAL_RULES.md Section 1.9:
 * - Zakat Base = Equity - Non-Current Assets (Net Working Capital approach)
 * - Zakat = Zakat Base × Zakat Rate (e.g., 2.5% for Saudi Arabia)
 * - If Zakat Base ≤ 0, then Zakat = 0
 *
 * @param equity - Total equity from balance sheet
 * @param nonCurrentAssets - Non-current assets (primarily fixed assets NBV)
 * @param zakatRate - Zakat rate (e.g., 0.025 for 2.5%)
 * @returns Zakat expense for the year
 */
export function calculateZakat(
  equity: Decimal,
  nonCurrentAssets: Decimal,
  zakatRate: Decimal,
): Decimal {
  const zakatBase = subtract(equity, nonCurrentAssets);

  // If zakat base is zero or negative, no zakat payable
  if (zakatBase.lessThanOrEqualTo(ZERO)) {
    return ZERO;
  }

  return multiply(zakatBase, zakatRate);
}

/**
 * Checks if cash balance meets minimum requirement.
 *
 * GAP 14: Minimum Cash Balance
 * - If cash < minimum, debt should be issued to bring it back up
 * - This is handled by the balance sheet plug mechanism
 *
 * @param cash - Current cash balance
 * @param minCashBalance - Minimum required cash
 * @returns True if cash meets minimum, false otherwise
 */
export function meetsMinimumCash(
  cash: Decimal,
  minCashBalance: Decimal,
): boolean {
  return isGreaterThan(cash, minCashBalance) || cash.equals(minCashBalance);
}
