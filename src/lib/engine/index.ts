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
  getDynamicEndYear,
  getTotalPeriodCount,
  BALANCE_SHEET_TOLERANCE,
  CASH_FLOW_TOLERANCE,
} from "./core/constants";
import {
  max,
  abs,
  subtract,
  sum,
  divide,
  add,
  multiply,
  calculateNPV,
  calculateAnnualizationFactor,
  calculateIRR,
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

// CAPEX Calculator
import {
  calculateCapexYearResult,
  updateHistoricalDepreciationState,
  validateCapexConfig,
} from "./capex/capex-calculator";
import type {
  CapExConfiguration,
  HistoricalDepreciationState,
  CapExYearResult,
} from "./core/types";

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

  // Calculate period boundaries based on contract period configuration
  const dynamicEndYear = getDynamicEndYear(input.contractPeriodYears);
  const expectedPeriodCount = getTotalPeriodCount(input.contractPeriodYears);

  console.log("🎯 Starting Financial Calculation Engine...");
  console.log(
    `📅 Projection Period: ${HISTORICAL_START_YEAR}-${dynamicEndYear}`,
  );
  console.log(
    `   Historical: ${HISTORICAL_START_YEAR}-${HISTORICAL_END_YEAR} (2 periods)`,
  );
  console.log(
    `   Transition: ${TRANSITION_START_YEAR}-${TRANSITION_END_YEAR} (3 periods)`,
  );
  console.log(
    `   Dynamic: ${DYNAMIC_START_YEAR}-${dynamicEndYear} (${input.contractPeriodYears} periods)`,
  );
  console.log(`   Total: ${expectedPeriodCount} periods`);

  try {
    // ========================================================================
    // PHASE 0: INITIALIZE CAPEX CONFIGURATION
    // ========================================================================
    console.log("📊 Initializing CAPEX Configuration...");

    // Validate CAPEX config
    const capexValidationErrors = validateCapexConfig(input.capexConfig);
    if (capexValidationErrors.length > 0) {
      console.error("❌ CAPEX Configuration Errors:");
      capexValidationErrors.forEach((err) => console.error(`   - ${err}`));
      throw new Error("Invalid CAPEX configuration");
    }

    // Initialize historical depreciation state from 2024 data
    // These values come from the first historical period in input
    let historicalDepreciationState: HistoricalDepreciationState = {
      grossPPE2024: input.capexConfig.historicalState.grossPPE2024,
      accumulatedDepreciation2024:
        input.capexConfig.historicalState.accumulatedDepreciation2024,
      annualDepreciation: input.capexConfig.historicalState.annualDepreciation,
      remainingToDepreciate: subtract(
        input.capexConfig.historicalState.grossPPE2024,
        input.capexConfig.historicalState.accumulatedDepreciation2024,
      ),
    };

    console.log(`  ✓ Historical Depreciation Initialized`);
    console.log(
      `    - Gross PPE 2024: ${historicalDepreciationState.grossPPE2024.toFixed(2)}`,
    );
    console.log(
      `    - Annual Depreciation: ${historicalDepreciationState.annualDepreciation.toFixed(2)}`,
    );
    console.log(
      `    - Remaining: ${historicalDepreciationState.remainingToDepreciate.toFixed(2)}`,
    );

    // Track all virtual assets across periods
    let allVirtualAssets = [...input.capexConfig.virtualAssets];

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

      // Update historical depreciation state for next year
      historicalDepreciationState = updateHistoricalDepreciationState(
        historicalDepreciationState,
      );

      console.log(`  ✓ Year ${historicalInput.year} calculated`);
      console.log(
        `    - Remaining to Depreciate: ${historicalDepreciationState.remainingToDepreciate.toFixed(2)}`,
      );
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
        input.capexConfig, // Add this parameter
        historicalDepreciationState, // Add this parameter
        allVirtualAssets, // Add this parameter
      );

      allPeriods.push(period);
      totalIterations += period.iterationsRequired || 0;

      // Update state for next year (after period calculation)
      historicalDepreciationState = updateHistoricalDepreciationState(
        historicalDepreciationState,
      );

      // Accumulate virtual assets (transition period can create new ones)
      if ((period as any).capexResult) {
        allVirtualAssets = [
          ...allVirtualAssets,
          ...(period as any).capexResult.newAssets,
        ];
      }

      console.log(`  ✓ Year ${transitionInput.year} calculated`);
    }

    // ========================================================================
    // PHASE 3: DYNAMIC PERIOD (variable: 2028-2052 or 2028-2057)
    // ========================================================================
    console.log(
      `📊 Calculating Dynamic Period (${DYNAMIC_START_YEAR}-${dynamicEndYear})...`,
    );

    for (let year = DYNAMIC_START_YEAR; year <= dynamicEndYear; year++) {
      const previousPeriod = allPeriods[allPeriods.length - 1];

      // Create dynamic period input for this year
      const dynamicInput = {
        year,
        enrollment: input.dynamicPeriodConfig.enrollment,
        curriculum: input.dynamicPeriodConfig.curriculum,
        staff: input.dynamicPeriodConfig.staff,
        rentModel: input.rentModel,
        rentParams: input.rentParams,
        otherOpexPercent: input.dynamicPeriodConfig.otherOpexPercent,
        capexConfig: {
          ...input.dynamicPeriodConfig.capexConfig,
          virtualAssets: allVirtualAssets, // Pass accumulated assets
        },
      };

      const period = calculateDynamicPeriod(
        dynamicInput,
        previousPeriod,
        input.systemConfig,
        workingCapitalRatios,
        historicalDepreciationState, // Add this parameter
        allVirtualAssets, // Add this parameter
      );

      allPeriods.push(period);
      totalIterations += period.iterationsRequired || 0;

      // Update state for next year
      historicalDepreciationState = updateHistoricalDepreciationState(
        historicalDepreciationState,
      );

      // Accumulate virtual assets created this year
      if ((period as any).capexResult) {
        allVirtualAssets = [
          ...allVirtualAssets,
          ...(period as any).capexResult.newAssets,
        ];
      }

      if (year % 5 === 0 || year === dynamicEndYear) {
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

    const metrics = calculateMetrics(allPeriods, input);

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
  input: CalculationEngineInput,
): CalculationEngineOutput["metrics"] {
  // Validate periods array
  if (!periods || periods.length === 0) {
    console.error("❌ calculateMetrics: Empty periods array");
    throw new Error("Cannot calculate metrics: no periods provided");
  }

  // Validate expected length (variable based on contract period)
  const expectedLength = getTotalPeriodCount(input.contractPeriodYears);
  const dynamicEndYear = getDynamicEndYear(input.contractPeriodYears);
  if (periods.length !== expectedLength) {
    console.warn(
      `⚠️ calculateMetrics: Expected ${expectedLength} periods (${HISTORICAL_START_YEAR}-${dynamicEndYear}), got ${periods.length}`,
    );
  }

  // Validate each period has required fields
  for (const period of periods) {
    if (!period.profitLoss || !period.balanceSheet || !period.cashFlow) {
      console.error(
        `❌ calculateMetrics: Period ${period.year} missing required statements`,
      );
      throw new Error(`Invalid period structure for year ${period.year}`);
    }
  }

  const netIncomes = periods.map((p) => p.profitLoss.netIncome);
  const totalNetIncome = sum(netIncomes);

  // Calculate total rent across all periods
  const rents = periods.map((p) => p.profitLoss.rentExpense);
  const totalRent = sum(rents);

  // Calculate total EBITDA across all periods
  const ebitdas = periods.map((p) => p.profitLoss.ebitda);
  const totalEbitda = sum(ebitdas);

  // Calculate average EBITDA per year
  const avgEbitda = divide(totalEbitda, new Decimal(periods.length));

  // Validate totalEbitda is reasonable (scaled based on contract period length)
  // Base ranges: -3B to +15B for 30 years, scaled proportionally for 25 years
  const yearsMultiplier = new Decimal(
    input.contractPeriodYears || 30,
  ).dividedBy(30);
  const MAX_REASONABLE_TOTAL_EBITDA = new Decimal(15e9).times(yearsMultiplier); // 15B * (25/30 or 30/30)
  const MIN_REASONABLE_TOTAL_EBITDA = new Decimal(-3e9).times(yearsMultiplier); // -3B * (25/30 or 30/30)
  if (
    totalEbitda.greaterThan(MAX_REASONABLE_TOTAL_EBITDA) ||
    totalEbitda.lessThan(MIN_REASONABLE_TOTAL_EBITDA)
  ) {
    console.warn(
      `⚠️ calculateMetrics: Total EBITDA outside expected range for ${input.contractPeriodYears || 30}-year period:`,
      totalEbitda.toString(),
      `(expected between ${MIN_REASONABLE_TOTAL_EBITDA.toString()} and ${MAX_REASONABLE_TOTAL_EBITDA.toString()})`,
    );
  }

  // ========================================================================
  // CONTRACT PERIOD METRICS (2028 onward only)
  // ========================================================================
  const contractStartYear = 2028;
  const contractPeriodYears = input.contractPeriodYears || 30;
  const contractEndYear = contractStartYear + contractPeriodYears - 1;

  // Filter to contract period only (2028 to contractEndYear)
  const contractPeriods = periods.filter(
    (p) => p.year >= contractStartYear && p.year <= contractEndYear,
  );

  // Calculate contract period rent
  const contractRents = contractPeriods.map((p) => p.profitLoss.rentExpense);
  const contractTotalRent = sum(contractRents);

  // Calculate contract period EBITDA
  const contractEbitdas = contractPeriods.map((p) => p.profitLoss.ebitda);
  const contractTotalEbitda = sum(contractEbitdas);

  // Calculate contract period NPV (rent as negative cash flows)
  const contractRentCashFlows = contractRents.map((r) => r.neg());
  // Use admin discount rate for NPV calculations (matches overview page)
  const discountRate =
    input.systemConfig.discountRate ??
    input.systemConfig.wacc ??
    input.systemConfig.debtInterestRate;
  const contractRentNPV = calculateNPV(contractRentCashFlows, discountRate);

  // Final cash at end of contract period
  const contractFinalCash =
    contractPeriods.length > 0
      ? contractPeriods[contractPeriods.length - 1].balanceSheet.cash
      : ZERO;

  // ========================================================================
  // CONTRACT PERIOD NPV & ANNUALIZED METRICS (Equivalent Annual Value)
  // ========================================================================

  // Calculate EBITDA NPV (EBITDA as positive cash flows)
  const contractEbitdaCashFlows = contractEbitdas; // Already calculated above
  const contractEbitdaNPV = calculateNPV(contractEbitdaCashFlows, discountRate);

  // Calculate Net Tenant Surplus (EBITDA NPV - Rent NPV)
  // Note: contractRentNPV is negative (costs), so we subtract its absolute value
  const contractNetTenantSurplus = subtract(
    contractEbitdaNPV,
    contractRentNPV.abs(),
  );

  // Calculate Annualization Factor: r / (1 - (1 + r)^(-n))
  // This converts NPV to Equivalent Annual Value (EAV) for fair comparison
  const annualizationFactor = calculateAnnualizationFactor(
    discountRate,
    contractPeriodYears,
  );

  // Calculate Annualized EBITDA
  const contractAnnualizedEbitda = multiply(
    contractEbitdaNPV,
    annualizationFactor,
  );

  // Calculate Annualized Rent (absolute value)
  const contractAnnualizedRent = multiply(
    contractRentNPV.abs(),
    annualizationFactor,
  );

  // Calculate Net Annualized Value (NAV) - KEY DECISION METRIC
  // NAV = Annualized EBITDA - Annualized Rent
  // Higher NAV = better proposal for the school (tenant)
  const contractNAV = subtract(
    contractAnnualizedEbitda,
    contractAnnualizedRent,
  );

  // Calculate average ROE
  const roeNumerator = sum(netIncomes);
  const roeDenominator = sum(periods.map((p) => p.balanceSheet.totalEquity));
  const averageROE =
    roeDenominator.greaterThan(ZERO) && roeDenominator.abs().greaterThan(ZERO)
      ? divide(roeNumerator, roeDenominator)
      : ZERO;

  // Find peak debt (maxDebt)
  const debts = periods.map((p) => p.balanceSheet.debtBalance);
  const peakDebt = max(...debts);
  const maxDebt = peakDebt; // Alias for UI compatibility

  // Final cash balance (all periods)
  const finalCash = periods[periods.length - 1].balanceSheet.cash;

  const cashFlows = periods.map((p) => p.cashFlow.netChangeInCash);
  const npv = calculateNPV(cashFlows, discountRate);
  const irr = calculateIRR(cashFlows);
  const paybackPeriod = calculatePaybackPeriod(cashFlows);

  return {
    // Full period metrics (2023-2053 or 2023-2048 for 25-year contracts)
    totalNetIncome,
    totalRent,
    totalEbitda,
    avgEbitda,
    averageROE,
    peakDebt,
    maxDebt,
    finalCash,
    npv,
    irr,
    paybackPeriod,

    // Contract period metrics (2028-contractEndYear) - for ProposalCard
    contractTotalRent,
    contractTotalEbitda,
    contractRentNPV,
    contractFinalCash,
    contractEndYear,

    // Contract period NPV & Annualized Metrics (EAV) - for comparison
    contractEbitdaNPV,
    contractNetTenantSurplus,
    contractAnnualizedEbitda,
    contractAnnualizedRent,
    contractNAV,
  };
}

function calculatePaybackPeriod(cashFlows: Decimal[]): Decimal | null {
  let cumulative = ZERO;

  for (let yearIndex = 0; yearIndex < cashFlows.length; yearIndex++) {
    const flow = cashFlows[yearIndex];
    const priorCumulative = cumulative;
    cumulative = add(cumulative, flow);

    if (cumulative.greaterThanOrEqualTo(ZERO)) {
      if (flow.equals(ZERO)) {
        return new Decimal(yearIndex);
      }

      // Linear interpolation within the year for fractional payback timing
      const fractionOfYear = priorCumulative
        .abs()
        .dividedBy(flow.abs())
        .toDecimalPlaces(4);
      return new Decimal(yearIndex).add(fractionOfYear);
    }
  }

  return null; // Payback not achieved within modeled periods
}

// ============================================================================
// EXPORTS
// ============================================================================

export { calculateFinancialProjections as default };
export type { CalculationEngineInput, CalculationEngineOutput };

// Re-export convergence stats for performance monitoring
export {
  getConvergenceStats,
  resetConvergenceStats,
  type SolverConvergenceStats,
} from "./solvers/circular";
