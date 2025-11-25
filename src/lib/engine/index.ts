/**
 * PHASE 2: CORE FINANCIAL ENGINE - MAIN ORCHESTRATOR
 *
 * This is the entry point for the 30-year financial calculation engine.
 * It orchestrates the calculation flow across three distinct periods:
 *
 * 1. HISTORICAL (2023-2024): Uses actual historical data
 * 2. TRANSITION (2025-2027): Bridges historical to dynamic with projections
 * 3. DYNAMIC (2028-2053): Full projection with enrollment, curriculum, rent models
 *
 * The orchestrator ensures:
 * - Period continuity (balance sheet linkage between years)
 * - Circular dependency resolution (Interest ↔ Zakat ↔ Debt)
 * - Balance sheet balancing via debt plug
 * - Cash flow reconciliation
 * - Performance (<1 second for 30 years)
 */

import type {
  CalculationEngineInput,
  CalculationEngineOutput,
  FinancialPeriod,
  ValidationResult,
} from "./core/types";
import { PeriodType } from "./core/types";
import {
  ZERO,
  HISTORICAL_START_YEAR,
  HISTORICAL_END_YEAR,
  TRANSITION_START_YEAR,
  TRANSITION_END_YEAR,
  DYNAMIC_START_YEAR,
  DYNAMIC_END_YEAR,
  BALANCE_SHEET_TOLERANCE,
  CASH_FLOW_TOLERANCE,
} from "./core/constants";
import {
  max,
  abs,
  subtract,
  sum,
  divide,
  isWithinTolerance,
} from "./core/decimal-utils";
import Decimal from "decimal.js";

// Period calculators
import { calculateHistoricalPeriod } from "./periods/historical";
import { calculateTransitionPeriod } from "./periods/transition";
import { calculateDynamicPeriod } from "./periods/dynamic";

// Validators
import {
  validateFinancialPeriod,
  validatePeriodSequence,
} from "./statements/validators";

// ============================================================================
// MAIN CALCULATION ENGINE
// ============================================================================

/**
 * Calculate 30-year financial projections (2024-2053)
 *
 * This is the main entry point for the financial calculation engine.
 * It processes:
 * - 2 years of historical data (2023-2024)
 * - 3 years of transition period (2025-2027)
 * - 26 years of dynamic projections (2028-2053)
 *
 * @param input Complete configuration for all periods
 * @returns Complete financial projections with validation results
 */
export async function calculateFinancialProjections(
  input: CalculationEngineInput,
): Promise<CalculationEngineOutput> {
  const startTime = performance.now();
  const allPeriods: FinancialPeriod[] = [];
  let totalIterations = 0;

  try {
    // ========================================================================
    // PHASE 1: HISTORICAL PERIOD (2023-2024)
    // ========================================================================
    console.log("📊 Calculating Historical Period (2023-2024)...");

    for (const historicalInput of input.historicalPeriods) {
      const previousPeriod =
        allPeriods.length > 0 ? allPeriods[allPeriods.length - 1] : undefined;

      const period = calculateHistoricalPeriod(
        historicalInput,
        input.systemConfig,
        previousPeriod,
      );

      allPeriods.push(period);
      totalIterations += period.iterationsRequired || 0;

      console.log(`  ✓ Year ${historicalInput.year} calculated`);
    }

    // ========================================================================
    // PHASE 2: TRANSITION PERIOD (2025-2027)
    // ========================================================================
    console.log("📊 Calculating Transition Period (2025-2027)...");

    // Get working capital ratios from the last historical period (2024)
    const workingCapitalRatios = input.workingCapitalRatios;

    for (const transitionInput of input.transitionPeriods) {
      const previousPeriod = allPeriods[allPeriods.length - 1];

      const period = calculateTransitionPeriod(
        transitionInput,
        input.systemConfig,
        previousPeriod,
        workingCapitalRatios,
        input.rentModel,
        input.rentParams,
      );

      allPeriods.push(period);
      totalIterations += period.iterationsRequired || 0;

      console.log(`  ✓ Year ${transitionInput.year} calculated`);
    }

    // ========================================================================
    // PHASE 3: DYNAMIC PERIOD (2028-2053)
    // ========================================================================
    console.log("📊 Calculating Dynamic Period (2028-2053)...");

    for (let year = DYNAMIC_START_YEAR; year <= DYNAMIC_END_YEAR; year++) {
      const previousPeriod = allPeriods[allPeriods.length - 1];

      // Create dynamic period input for this year
      const dynamicInput = {
        year,
        enrollment: input.dynamicPeriodConfig.enrollment,
        curriculum: input.dynamicPeriodConfig.curriculum,
        staff: input.dynamicPeriodConfig.staff,
        rentModel: input.rentModel,
        rentParams: input.rentParams,
        otherOpex: input.dynamicPeriodConfig.otherOpex,
        capexConfig: input.capexConfig,
      };

      const period = calculateDynamicPeriod(
        dynamicInput,
        previousPeriod,
        input.systemConfig,
        workingCapitalRatios,
      );

      allPeriods.push(period);
      totalIterations += period.iterationsRequired || 0;

      if (year % 5 === 0) {
        console.log(`  ✓ Year ${year} calculated`);
      }
    }

    console.log(`✅ All periods calculated (${allPeriods.length} years)`);

    // ========================================================================
    // VALIDATION
    // ========================================================================
    console.log("🔍 Validating results...");

    const validation = validateResults(allPeriods);

    // ========================================================================
    // METRICS CALCULATION
    // ========================================================================
    console.log("📈 Calculating summary metrics...");

    const metrics = calculateMetrics(allPeriods);

    // ========================================================================
    // PERFORMANCE METRICS
    // ========================================================================
    const endTime = performance.now();
    const calculationTimeMs = endTime - startTime;
    const averageIterationsPerYear = totalIterations / allPeriods.length;

    console.log(
      `⚡ Calculation completed in ${calculationTimeMs.toFixed(2)}ms`,
    );
    console.log(
      `   Average iterations per year: ${averageIterationsPerYear.toFixed(1)}`,
    );

    // ========================================================================
    // RETURN RESULTS
    // ========================================================================
    return {
      periods: allPeriods,
      metrics,
      validation,
      performance: {
        calculationTimeMs,
        totalIterations,
        averageIterationsPerYear,
      },
      calculatedAt: new Date(),
    };
  } catch (error) {
    console.error("❌ Calculation failed:", error);
    throw error;
  }
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate all financial periods
 */
function validateResults(
  periods: FinancialPeriod[],
): CalculationEngineOutput["validation"] {
  let allPeriodsBalanced = true;
  let allCashFlowsReconciled = true;
  let maxBalanceDifference = ZERO;
  let maxCashDifference = ZERO;

  for (const period of periods) {
    // Check balance sheet balancing
    const balanceDiff = abs(period.balanceSheet.balanceDifference);
    maxBalanceDifference = max(maxBalanceDifference, balanceDiff);

    if (!isWithinTolerance(balanceDiff, ZERO, BALANCE_SHEET_TOLERANCE)) {
      allPeriodsBalanced = false;
      console.warn(
        `⚠️  Year ${period.year}: Balance sheet not balanced (diff: ${balanceDiff.toFixed(2)})`,
      );
    }

    // Check cash flow reconciliation (skip historical periods - they come from external data)
    const cashDiff = abs(period.cashFlow.cashReconciliationDiff);
    maxCashDifference = max(maxCashDifference, cashDiff);

    if (
      period.periodType !== PeriodType.HISTORICAL &&
      !isWithinTolerance(cashDiff, ZERO, CASH_FLOW_TOLERANCE)
    ) {
      allCashFlowsReconciled = false;
      console.warn(
        `⚠️  Year ${period.year}: Cash flow not reconciled (diff: ${cashDiff.toFixed(2)})`,
      );
    }
  }

  const result = {
    allPeriodsBalanced,
    allCashFlowsReconciled,
    maxBalanceDifference,
    maxCashDifference,
  };

  if (allPeriodsBalanced && allCashFlowsReconciled) {
    console.log("✅ All validations passed");
  } else {
    console.warn("⚠️  Some validations failed - review warnings above");
  }

  return result;
}

/**
 * Calculate summary metrics across all periods
 */
function calculateMetrics(
  periods: FinancialPeriod[],
): CalculationEngineOutput["metrics"] {
  const netIncomes = periods.map((p) => p.profitLoss.netIncome);
  const totalNetIncome = sum(netIncomes);

  // Calculate average ROE
  const roes = periods.map((p) => {
    const equity = p.balanceSheet.totalEquity;
    const netIncome = p.profitLoss.netIncome;
    return equity.greaterThan(ZERO) ? divide(netIncome, equity) : ZERO;
  });
  const averageROE = divide(sum(roes), new Decimal(roes.length));

  // Find peak debt
  const debts = periods.map((p) => p.balanceSheet.debtBalance);
  const peakDebt = max(...debts);

  // Final cash balance
  const finalCash = periods[periods.length - 1].balanceSheet.cash;

  // TODO: Calculate NPV and IRR (optional)
  // These require discount rate and cash flow extraction

  return {
    totalNetIncome,
    averageROE,
    peakDebt,
    finalCash,
    npv: undefined,
    irr: undefined,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export { calculateFinancialProjections as default };
export type { CalculationEngineInput, CalculationEngineOutput };
