/**
 * SENSITIVITY ANALYZER MODULE
 *
 * Runs sensitivity analysis by varying a single variable across a range
 * and measuring the impact on a selected metric.
 *
 * This module supports:
 * - Single variable analysis (one-at-a-time sensitivity)
 * - Tornado chart data generation (ranked by impact)
 * - Multiple data points across variable range
 */

import Decimal from "decimal.js";
import type {
  CalculationEngineInput,
  CalculationEngineOutput,
  FinancialPeriod,
} from "./core/types";
import { ZERO } from "./core/constants";
import { calculateIRR, calculateNPV } from "./core/decimal-utils";
import { calculateFinancialProjections } from "./index";
import { applyScenarioVariables } from "./scenario-modifier";
import type { ScenarioVariables } from "./scenario-modifier";

export type SensitivityVariable =
  | "enrollment"
  | "tuitionGrowth"
  | "cpi"
  | "rentEscalation"
  | "staffCosts"
  | "otherOpexPercent";

export type SensitivityMetric =
  | "npv"
  | "totalRent"
  | "ebitda"
  | "irr"
  | "payback"
  | "maxDebt"
  | "finalCash";

export interface SensitivityConfig {
  variable: SensitivityVariable;
  rangePercent: number; // e.g., 20 for ±20%
  dataPoints: number; // Number of points to calculate (e.g., 5)
  metric: SensitivityMetric;
}

export interface SensitivityDataPoint {
  variableValue: number; // The value of the variable (e.g., 80, 90, 100, 110, 120)
  variablePercent: number; // Percentage from baseline (e.g., -20, -10, 0, +10, +20)
  metricValue: string; // The calculated metric value
  calculationTimeMs: number;
}

export interface SensitivityResult {
  variable: SensitivityVariable;
  metric: SensitivityMetric;
  baselineMetricValue: string;
  dataPoints: SensitivityDataPoint[];
  totalTimeMs: number;
  impact: {
    // For tornado chart ranking
    positiveDeviation: string; // Metric value at +X%
    negativeDeviation: string; // Metric value at -X%
    totalImpact: string; // Absolute difference between positive and negative
  };
}

/**
 * Run sensitivity analysis for a single variable
 *
 * @param baselineInput - Original calculation input
 * @param config - Sensitivity analysis configuration
 * @returns Sensitivity analysis results with data points
 */
export async function runSensitivityAnalysis(
  baselineInput: CalculationEngineInput,
  config: SensitivityConfig,
): Promise<SensitivityResult> {
  const startTime = performance.now();
  const discountRate = baselineInput.systemConfig.debtInterestRate;

  // Calculate baseline metric
  console.log(`📊 Calculating baseline for ${config.variable}...`);
  const baselineResult = await calculateFinancialProjections(baselineInput);
  const baselineMetricValue = extractMetric(
    baselineResult,
    config.metric,
    discountRate,
  );

  // Generate range of values to test
  const rangeValues = generateRange(
    100,
    config.rangePercent,
    config.dataPoints,
  );

  // Run calculations for each point in the range
  const dataPoints: SensitivityDataPoint[] = [];

  for (const value of rangeValues) {
    const pointStartTime = performance.now();

    // Create scenario variables for this point
    // Extract actual baseline rates
    const baselineEnrollment = 100; // Enrollment is always relative to 100% baseline
    const baselineTuitionGrowth = baselineInput.dynamicPeriodConfig.curriculum.nationalTuitionGrowthRate?.toNumber() ?? 0;
    const baselineCpi = baselineInput.dynamicPeriodConfig.staff.cpiRate?.toNumber() ?? 0;

    // Extract rent growth based on model
    let baselineRentEscalation = 0;
    if (baselineInput.rentModel === "FIXED_ESCALATION" || baselineInput.rentModel === "PARTNER_INVESTMENT") {
      baselineRentEscalation = (baselineInput.rentParams as any).growthRate?.toNumber() ?? 0;
    }

    // Create scenario variables for this point
    const scenarioVars = createScenarioForVariable(
      config.variable,
      value,
      baselineEnrollment,
      baselineTuitionGrowth,
      baselineCpi,
      baselineRentEscalation,
    );

    // Apply scenario and calculate
    console.log(
      `  🔧 Applying scenario for ${config.variable}=${value}%...`,
    );
    const modifiedInput = applyScenarioVariables(baselineInput, scenarioVars);

    // Log key input values after scenario application
    console.log(
      `  📋 Modified input values for ${config.variable}=${value}%:`,
      {
        enrollment: {
          steadyState:
            modifiedInput.dynamicPeriodConfig.enrollment.steadyStateStudents,
          rampUpEnabled:
            modifiedInput.dynamicPeriodConfig.enrollment.rampUpEnabled,
          rampUpTarget:
            modifiedInput.dynamicPeriodConfig.enrollment.rampUpTargetStudents,
        },
        tuitionGrowth:
          modifiedInput.dynamicPeriodConfig.curriculum
            .nationalTuitionGrowthRate?.toString(),
        cpi: modifiedInput.dynamicPeriodConfig.staff.cpiRate?.toString(),
        rentModel: modifiedInput.rentModel,
      },
    );

    const result = await calculateFinancialProjections(modifiedInput);

    // Log result structure for debugging
    console.log(
      `  📊 Calculation result for ${config.variable}=${value}%:`,
      {
        periodsCount: result.periods.length,
        firstPeriodYear: result.periods[0]?.year,
        lastPeriodYear: result.periods[result.periods.length - 1]?.year,
        validationBalanced: result.validation.allPeriodsBalanced,
        validationReconciled: result.validation.allCashFlowsReconciled,
      },
    );

    // Log sample period values to check if calculations look reasonable
    if (result.periods.length > 0) {
      const samplePeriod = result.periods.find((p) => p.year === 2028);
      if (samplePeriod) {
        console.log(
          `  📊 Sample period 2028 for ${config.variable}=${value}%:`,
          {
            revenue: samplePeriod.profitLoss.totalRevenue?.toString(),
            rentExpense: samplePeriod.profitLoss.rentExpense?.toString(),
            ebitda: samplePeriod.profitLoss.ebitda?.toString(),
            students: "N/A", // Would need to calculate from enrollment config
          },
        );
      }
    }

    const metricValue = extractMetric(
      result,
      config.metric,
      modifiedInput.systemConfig.debtInterestRate,
    );

    const pointTimeMs = performance.now() - pointStartTime;

    // Log if metric value is suspicious
    if (metricValue === "0.00") {
      console.warn(
        `  ⚠️ Metric value is 0.00 for ${config.variable}=${value}% - check extractMetric logs above`,
      );
    }

    dataPoints.push({
      variableValue: value,
      variablePercent: value - 100,
      metricValue,
      calculationTimeMs: pointTimeMs,
    });

    console.log(
      `  ✓ ${config.variable}=${value}% → ${config.metric}=${metricValue} (${pointTimeMs.toFixed(0)}ms)`,
    );
  }

  // Calculate impact for tornado chart
  const positivePoint = dataPoints.find((p) => p.variablePercent > 0);
  const negativePoint = dataPoints.find((p) => p.variablePercent < 0);

  const positiveDeviation = positivePoint
    ? positivePoint.metricValue
    : baselineMetricValue;
  const negativeDeviation = negativePoint
    ? negativePoint.metricValue
    : baselineMetricValue;

  // Log impact calculation inputs
  console.log("📊 Impact calculation:", {
    baseline: baselineMetricValue,
    positivePoint: positivePoint
      ? {
        variablePercent: positivePoint.variablePercent,
        metricValue: positivePoint.metricValue,
      }
      : "not found",
    negativePoint: negativePoint
      ? {
        variablePercent: negativePoint.variablePercent,
        metricValue: negativePoint.metricValue,
      }
      : "not found",
    positiveDeviation,
    negativeDeviation,
  });

  // Validate that metric values are reasonable before calculating impact
  let posDev: Decimal;
  let negDev: Decimal;

  try {
    posDev = new Decimal(positiveDeviation);
  } catch (error) {
    console.error(
      "❌ Failed to parse positiveDeviation as Decimal:",
      positiveDeviation,
      error,
    );
    posDev = new Decimal(0);
  }

  try {
    negDev = new Decimal(negativeDeviation);
  } catch (error) {
    console.error(
      "❌ Failed to parse negativeDeviation as Decimal:",
      negativeDeviation,
      error,
    );
    negDev = new Decimal(0);
  }

  // Check for unreasonably large values (likely calculation error)
  const MAX_REASONABLE_VALUE = new Decimal(1e12); // 1 trillion
  if (
    posDev.abs().greaterThan(MAX_REASONABLE_VALUE) ||
    negDev.abs().greaterThan(MAX_REASONABLE_VALUE)
  ) {
    console.error(
      "⚠️ Suspiciously large metric values detected in sensitivity analysis:",
      {
        positiveDeviation: posDev.toString(),
        negativeDeviation: negDev.toString(),
        metric: config.metric,
      },
    );
  }

  // Check if values are zero when they shouldn't be
  if (
    posDev.isZero() &&
    negDev.isZero() &&
    !new Decimal(baselineMetricValue).isZero()
  ) {
    console.error(
      "❌ Both positive and negative deviations are zero but baseline is not!",
      {
        baseline: baselineMetricValue,
        dataPoints: dataPoints.map((dp) => ({
          variablePercent: dp.variablePercent,
          metricValue: dp.metricValue,
        })),
      },
    );
  }

  const totalImpact = posDev.minus(negDev).abs().toFixed(2);

  console.log("📊 Calculated impact:", {
    totalImpact,
    positiveDeviation: posDev.toString(),
    negativeDeviation: negDev.toString(),
  });

  const totalTimeMs = performance.now() - startTime;

  console.log(
    `✅ Sensitivity analysis complete: ${config.variable} → ${totalTimeMs.toFixed(0)}ms`,
  );

  return {
    variable: config.variable,
    metric: config.metric,
    baselineMetricValue,
    dataPoints,
    totalTimeMs,
    impact: {
      positiveDeviation,
      negativeDeviation,
      totalImpact,
    },
  };
}

/**
 * Run sensitivity analysis for multiple variables (for tornado chart)
 *
 * @param baselineInput - Original calculation input
 * @param variables - List of variables to analyze
 * @param rangePercent - Range for all variables
 * @param metric - Metric to measure
 * @returns Array of sensitivity results, sorted by impact (high to low)
 */
export async function runMultiVariableSensitivity(
  baselineInput: CalculationEngineInput,
  variables: SensitivityVariable[],
  rangePercent: number,
  metric: SensitivityMetric,
): Promise<SensitivityResult[]> {
  const results: SensitivityResult[] = [];

  for (const variable of variables) {
    const config: SensitivityConfig = {
      variable,
      rangePercent,
      dataPoints: 5, // -range, -range/2, 0, +range/2, +range
      metric,
    };

    const result = await runSensitivityAnalysis(baselineInput, config);
    results.push(result);
  }

  // Sort by total impact (descending) for tornado chart
  results.sort((a, b) => {
    const impactA = new Decimal(a.impact.totalImpact);
    const impactB = new Decimal(b.impact.totalImpact);
    return impactB.comparedTo(impactA);
  });

  return results;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate range of values to test
 *
 * @param baseline - Baseline value (typically 100)
 * @param rangePercent - Range as percentage (e.g., 20 for ±20%)
 * @param dataPoints - Number of points to generate
 * @returns Array of values to test
 */
function generateRange(
  baseline: number,
  rangePercent: number,
  dataPoints: number,
): number[] {
  const min = baseline - rangePercent;
  const max = baseline + rangePercent;

  const points: number[] = [];
  const step = (max - min) / (dataPoints - 1);

  for (let i = 0; i < dataPoints; i++) {
    points.push(min + step * i);
  }

  return points;
}

/**
 * Create scenario variables for a specific variable adjustment
 */
function createScenarioForVariable(
  variable: SensitivityVariable,
  value: Decimal.Value,
  baselineEnrollment: Decimal.Value,
  baselineTuitionGrowth: Decimal.Value,
  baselineCpi: Decimal.Value,
  baselineRentEscalation: Decimal.Value,
): ScenarioVariables {
  const valueDecimal = new Decimal(value);
  const baselineEnrollmentDecimal = new Decimal(baselineEnrollment);
  const baselineTuitionGrowthDecimal = new Decimal(baselineTuitionGrowth);
  const baselineCpiDecimal = new Decimal(baselineCpi);
  const baselineRentEscalationDecimal = new Decimal(baselineRentEscalation);

  const vars: ScenarioVariables = {
    enrollmentPercent: baselineEnrollmentDecimal.toNumber(),
    tuitionGrowthPercent: baselineTuitionGrowthDecimal.mul(100).toNumber(), // Convert to percentage (e.g., 0.05 -> 5.0)
    cpiPercent: baselineCpiDecimal.mul(100).toNumber(),                   // Convert to percentage (e.g., 0.02 -> 2.0)
    rentEscalationPercent: baselineRentEscalationDecimal.mul(100).toNumber(), // Convert to percentage (e.g., 0.05 -> 5.0)
  };

  // Adjust the target variable
  switch (variable) {
    case "enrollment":
      vars.enrollmentPercent = valueDecimal.toNumber();
      break;
    case "tuitionGrowth":
      vars.tuitionGrowthPercent = valueDecimal
        .div(100)
        .mul(baselineTuitionGrowthDecimal)
        .mul(100) // Convert to percentage (e.g., 0.055 -> 5.5)
        .toNumber();
      break;
    case "cpi":
      vars.cpiPercent = valueDecimal
        .div(100)
        .mul(baselineCpiDecimal)
        .mul(100) // Convert to percentage (e.g., 0.022 -> 2.2)
        .toNumber();
      break;
    case "rentEscalation":
      vars.rentEscalationPercent = valueDecimal
        .div(100)
        .mul(baselineRentEscalationDecimal)
        .mul(100) // Convert to percentage (e.g., 0.055 -> 5.5)
        .toNumber();
      break;
    case "staffCosts":
      // Staff costs would need different handling - placeholder
      vars.enrollmentPercent = valueDecimal.toNumber(); // Proxy via enrollment for now
      break;
    case "otherOpexPercent":
      // Other opex percentage - placeholder
      vars.cpiPercent = valueDecimal
        .div(100)
        .mul(baselineCpiDecimal)
        .mul(100) // Convert to percentage
        .toNumber(); // Proxy via CPI for now
      break;
  }

  return vars;
}

/**
 * Safely convert a value to Decimal, handling strings, numbers, and Decimal instances
 */
function toDecimalSafe(value: unknown, context: string): Decimal {
  if (value instanceof Decimal) {
    return value;
  }

  if (typeof value === "string") {
    try {
      const result = new Decimal(value);
      // Log if value seems suspicious (very large or very small)
      if (result.abs().greaterThan(new Decimal(1e12))) {
        console.warn(
          `⚠️ Large value converted in ${context}:`,
          value,
          "→",
          result.toString(),
        );
      }
      return result;
    } catch (error) {
      console.error(
        `❌ Failed to parse Decimal from string in ${context}:`,
        value,
        error,
      );
      return ZERO;
    }
  }

  if (typeof value === "number") {
    if (!isFinite(value)) {
      console.error(`❌ Non-finite number in ${context}:`, value);
      return ZERO;
    }
    const result = new Decimal(value);
    // Log if value seems suspicious
    if (result.abs().greaterThan(new Decimal(1e12))) {
      console.warn(
        `⚠️ Large number converted in ${context}:`,
        value,
        "→",
        result.toString(),
      );
    }
    return result;
  }

  // Handle null/undefined
  if (value === null || value === undefined) {
    console.warn(`⚠️ Null/undefined value in ${context}, using ZERO`);
    return ZERO;
  }

  console.error(
    `❌ Unexpected value type in ${context}:`,
    typeof value,
    value,
    "using ZERO",
  );
  return ZERO;
}

/**
 * Validate periods array structure and content
 * Returns warnings instead of hard failures - only fails if truly broken
 */
function validatePeriodsArray(periods: FinancialPeriod[], metric: SensitivityMetric): {
  isValid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];

  // Only fail if periods array is empty or null
  if (!periods || periods.length === 0) {
    return {
      isValid: false,
      warnings: ["Periods array is empty or null"],
    };
  }

  // Check array length (should be 31: 2023-2053) - warn but don't fail
  const expectedLength = 31;
  if (periods.length !== expectedLength) {
    warnings.push(
      `Periods array length is ${periods.length}, expected ${expectedLength} (2023-2053)`,
    );
  }

  // Check for duplicate years - warn but don't fail
  const years = periods.map((p) => p.year);
  const uniqueYears = new Set(years);
  if (years.length !== uniqueYears.size) {
    warnings.push(`Duplicate years found in periods array`);
  }

  // Validate each period structure - warn but don't fail
  const requiredFields: Record<string, string[]> = {
    ebitda: ["profitLoss", "ebitda"],
    totalRent: ["profitLoss", "rentExpense"],
    maxDebt: ["balanceSheet", "debtBalance"],
    finalCash: ["balanceSheet", "cash"],
  };

  const fieldsToCheck = requiredFields[metric] || [];

  for (let i = 0; i < periods.length; i++) {
    const period = periods[i];

    if (!period) {
      warnings.push(`Period at index ${i} is null or undefined`);
      continue;
    }

    if (typeof period.year !== "number") {
      warnings.push(`Period ${i} has invalid year: ${period.year}`);
    }

    // Check required fields for the metric - warn but don't fail
    if (fieldsToCheck.length > 0) {
      let current: unknown = period;
      for (const field of fieldsToCheck) {
        if (current && typeof current === "object" && field in current) {
          current = (current as Record<string, unknown>)[field];
        } else {
          warnings.push(
            `Period ${period.year} missing field path: ${fieldsToCheck.join(".")}`,
          );
          break;
        }
      }
    }
  }

  // Always valid if we got here (only empty array would fail)
  return {
    isValid: true,
    warnings,
  };
}

/**
 * Extract a specific metric from calculation results
 */
function extractMetric(
  result: CalculationEngineOutput,
  metric: SensitivityMetric,
  discountRate: Decimal,
): string {
  const periods = result.periods;

  // Validate periods array - only fail if truly broken (empty/null)
  const validation = validatePeriodsArray(periods, metric);
  if (!validation.isValid) {
    console.error("❌ Periods array validation failed:", validation.warnings);
    console.error("   Periods array length:", periods.length);
    console.error("   Sample periods:", periods.slice(0, 3).map((p) => ({
      year: p.year,
      hasProfitLoss: !!p.profitLoss,
      hasBalanceSheet: !!p.balanceSheet,
    })));
    return "0.00";
  }

  // Log warnings but continue processing
  if (validation.warnings.length > 0) {
    console.warn("⚠️ Periods array validation warnings:", validation.warnings);
  }

  // Log debugging info
  console.log(`📊 Extracting metric "${metric}" from ${periods.length} periods`);

  // Log sample period structure for debugging
  if (periods.length > 0) {
    const samplePeriod = periods[0];
    console.log("   Sample period structure:", {
      year: samplePeriod.year,
      hasProfitLoss: !!samplePeriod.profitLoss,
      hasBalanceSheet: !!samplePeriod.balanceSheet,
      hasCashFlow: !!samplePeriod.cashFlow,
      profitLossKeys: samplePeriod.profitLoss ? Object.keys(samplePeriod.profitLoss) : [],
    });
  }

  switch (metric) {
    case "totalRent": {
      const totalRent = periods.reduce(
        (sum, p) => {
          const rentExpense = toDecimalSafe(
            p.profitLoss?.rentExpense,
            `period ${p.year} rentExpense`,
          );
          return sum.add(rentExpense);
        },
        new Decimal(0),
      );

      // Validate result is reasonable - warn but still return value
      const MAX_REASONABLE_RENT = new Decimal(2e9); // 2 billion
      if (totalRent.abs().greaterThan(MAX_REASONABLE_RENT)) {
        console.warn(
          "⚠️ Total rent outside expected range:",
          totalRent.toString(),
          "Expected max ~1.5B for 30 years",
        );
      }

      // Only return "0.00" if truly invalid
      if (!totalRent.isFinite() || totalRent.isNaN()) {
        console.error("❌ Invalid total rent value (NaN or Infinity)");
        return "0.00";
      }

      console.log(`   Total rent calculated: ${totalRent.toString()}`);
      return totalRent.toFixed(2);
    }

    case "ebitda": {
      const MAX_REASONABLE_EBITDA_PER_YEAR = new Decimal(500e6); // 500M per year
      const MIN_REASONABLE_EBITDA_PER_YEAR = new Decimal(-100e6); // -100M per year
      const MAX_REASONABLE_TOTAL_EBITDA = new Decimal(15e9); // 15B for 30 years

      let totalEbitda = new Decimal(0);
      const suspiciousPeriods: Array<{ year: number; value: string }> = [];

      for (const period of periods) {
        const ebitda = toDecimalSafe(
          period.profitLoss?.ebitda,
          `period ${period.year} ebitda`,
        );

        // Validate per-year ebitda is reasonable - warn but continue
        if (
          ebitda.abs().greaterThan(MAX_REASONABLE_EBITDA_PER_YEAR) ||
          ebitda.lessThan(MIN_REASONABLE_EBITDA_PER_YEAR)
        ) {
          suspiciousPeriods.push({
            year: period.year,
            value: ebitda.toString(),
          });
          console.warn(
            `⚠️ EBITDA outside expected range in year ${period.year}: ${ebitda.toString()}`,
          );
        }

        totalEbitda = totalEbitda.add(ebitda);
      }

      // Log sample values for debugging
      if (periods.length > 0) {
        const sampleYears = [2023, 2024, 2028, 2030, 2050, 2053].filter((y) =>
          periods.some((p) => p.year === y),
        );
        console.log(
          "📊 Sample EBITDA values:",
          sampleYears.map((year) => {
            const period = periods.find((p) => p.year === year);
            return period
              ? {
                year,
                ebitda: toDecimalSafe(
                  period.profitLoss?.ebitda,
                  `sample ${year}`,
                ).toString(),
              }
              : null;
          }),
        );
      }

      // Validate total is reasonable - warn but still return value
      if (totalEbitda.abs().greaterThan(MAX_REASONABLE_TOTAL_EBITDA)) {
        console.warn(
          "⚠️ Total EBITDA outside expected range:",
          totalEbitda.toString(),
          "Expected max ~15B for 30 years",
        );
        if (suspiciousPeriods.length > 0) {
          console.warn("   Suspicious periods:", suspiciousPeriods);
        }
      }

      if (suspiciousPeriods.length > 0) {
        console.warn(
          `⚠️ Found ${suspiciousPeriods.length} periods with EBITDA outside expected range`,
        );
      }

      // Only return "0.00" if truly invalid
      if (!totalEbitda.isFinite() || totalEbitda.isNaN()) {
        console.error("❌ Invalid total EBITDA value (NaN or Infinity)");
        return "0.00";
      }

      console.log(`   Total EBITDA calculated: ${totalEbitda.toString()}`);
      return totalEbitda.toFixed(2);
    }

    case "maxDebt": {
      const maxDebt = periods.reduce(
        (max, p) => {
          const debtBalance = toDecimalSafe(
            p.balanceSheet?.debtBalance,
            `period ${p.year} debtBalance`,
          );
          return debtBalance.greaterThan(max) ? debtBalance : max;
        },
        new Decimal(0),
      );

      // Validate result is reasonable - warn but still return value
      const MAX_REASONABLE_DEBT = new Decimal(500e6); // 500M
      if (maxDebt.greaterThan(MAX_REASONABLE_DEBT)) {
        console.warn(
          "⚠️ Max debt outside expected range:",
          maxDebt.toString(),
          "Expected max ~500M",
        );
      }

      // Only return "0.00" if truly invalid
      if (!maxDebt.isFinite() || maxDebt.isNaN()) {
        console.error("❌ Invalid max debt value (NaN or Infinity)");
        return "0.00";
      }

      console.log(`   Max debt calculated: ${maxDebt.toString()}`);
      return maxDebt.toFixed(2);
    }

    case "finalCash": {
      const lastPeriod = periods[periods.length - 1];
      if (!lastPeriod) {
        console.error("❌ No periods available for finalCash");
        return "0.00";
      }

      const finalCash = toDecimalSafe(
        lastPeriod.balanceSheet?.cash,
        `final period ${lastPeriod.year} cash`,
      );

      // Validate result is reasonable - warn but still return value
      const MAX_REASONABLE_CASH = new Decimal(500e6); // 500M
      const MIN_REASONABLE_CASH = new Decimal(-100e6); // -100M
      if (
        finalCash.greaterThan(MAX_REASONABLE_CASH) ||
        finalCash.lessThan(MIN_REASONABLE_CASH)
      ) {
        console.warn(
          "⚠️ Final cash outside expected range:",
          finalCash.toString(),
        );
      }

      // Only return "0.00" if truly invalid
      if (!finalCash.isFinite() || finalCash.isNaN()) {
        console.error("❌ Invalid final cash value (NaN or Infinity)");
        return "0.00";
      }

      console.log(`   Final cash calculated: ${finalCash.toString()}`);
      return finalCash.toFixed(2);
    }

    case "npv": {
      const cashFlows = extractCashFlows(periods);
      const npv = calculateNPV(cashFlows, discountRate);

      // Validate NPV is reasonable - warn but still return value
      const MAX_REASONABLE_NPV = new Decimal(500e6); // 500M
      const MIN_REASONABLE_NPV = new Decimal(-500e6); // -500M
      if (npv.abs().greaterThan(MAX_REASONABLE_NPV)) {
        console.warn("⚠️ NPV outside expected range:", npv.toString());
      }

      // Only return "0.00" if truly invalid
      if (!npv.isFinite() || npv.isNaN()) {
        console.error("❌ Invalid NPV value (NaN or Infinity)");
        return "0.00";
      }

      console.log(`   NPV calculated: ${npv.toString()}`);
      return npv.toFixed(2);
    }

    case "irr": {
      const cashFlows = extractCashFlows(periods);
      const irr = calculateIRR(cashFlows);

      // Validate IRR is reasonable - warn but still return value
      if (irr) {
        const MAX_REASONABLE_IRR = new Decimal(0.5); // 50%
        const MIN_REASONABLE_IRR = new Decimal(-0.5); // -50%
        if (irr.abs().greaterThan(MAX_REASONABLE_IRR)) {
          console.warn("⚠️ IRR outside expected range:", irr.toString());
        }

        // Only return "0.000000" if truly invalid
        if (!irr.isFinite() || irr.isNaN()) {
          console.error("❌ Invalid IRR value (NaN or Infinity)");
          return "0.000000";
        }

        console.log(`   IRR calculated: ${irr.toString()}`);
        return irr.toFixed(6);
      }

      console.warn("⚠️ IRR calculation returned null");
      return "0.000000";
    }

    case "payback": {
      const cashFlows = extractCashFlows(periods);
      const payback = calculatePaybackPeriod(cashFlows);

      // Validate payback is reasonable - warn but still return value
      if (payback) {
        const MAX_REASONABLE_PAYBACK = new Decimal(30);
        if (payback.greaterThan(MAX_REASONABLE_PAYBACK)) {
          console.warn("⚠️ Payback period outside expected range:", payback.toString());
        }

        // Only return "0.00" if truly invalid
        if (!payback.isFinite() || payback.isNaN()) {
          console.error("❌ Invalid payback period value (NaN or Infinity)");
          return "0.00";
        }

        console.log(`   Payback period calculated: ${payback.toString()}`);
        return payback.toFixed(2);
      }

      console.warn("⚠️ Payback period calculation returned null");
      return "0.00";
    }

    default:
      return "0.00";
  }
}

function extractCashFlows(
  periods: CalculationEngineOutput["periods"],
): Decimal[] {
  return periods.map((period) => {
    const netChange = toDecimalSafe(
      period.cashFlow?.netChangeInCash,
      `period ${period.year} netChangeInCash`,
    );

    // Validate cash flow is reasonable - warn but still return value
    const MAX_REASONABLE_CASHFLOW = new Decimal(100e6); // 100M
    const MIN_REASONABLE_CASHFLOW = new Decimal(-100e6); // -100M
    if (
      netChange.abs().greaterThan(MAX_REASONABLE_CASHFLOW) &&
      period.year >= 2028 // Only warn for dynamic periods
    ) {
      console.warn(
        `⚠️ Cash flow outside expected range in year ${period.year}:`,
        netChange.toString(),
      );
    }

    // Only return ZERO if truly invalid
    if (!netChange.isFinite() || netChange.isNaN()) {
      console.error(
        `❌ Invalid cash flow value in year ${period.year} (NaN or Infinity)`,
      );
      return ZERO;
    }

    return netChange;
  });
}

function calculatePaybackPeriod(cashFlows: Decimal[]): Decimal | null {
  let cumulative = ZERO;

  for (let index = 0; index < cashFlows.length; index++) {
    const flow = cashFlows[index];
    const prior = cumulative;
    cumulative = cumulative.add(flow);

    if (cumulative.greaterThanOrEqualTo(ZERO)) {
      if (flow.equals(ZERO)) {
        return new Decimal(index);
      }

      const fractionOfYear = prior
        .abs()
        .dividedBy(flow.abs())
        .toDecimalPlaces(4);
      return new Decimal(index).add(fractionOfYear);
    }
  }

  return null;
}
