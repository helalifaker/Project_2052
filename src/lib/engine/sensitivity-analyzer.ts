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
} from "./core/types";
import { calculateFinancialProjections } from "./index";
import { applyScenarioVariables } from "./scenario-modifier";
import type { ScenarioVariables } from "./scenario-modifier";

export type SensitivityVariable =
  | "enrollment"
  | "tuitionGrowth"
  | "cpi"
  | "rentEscalation"
  | "staffCosts"
  | "otherOpex";

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

  // Calculate baseline metric
  console.log(`📊 Calculating baseline for ${config.variable}...`);
  const baselineResult = await calculateFinancialProjections(baselineInput);
  const baselineMetricValue = extractMetric(baselineResult, config.metric);

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
    const scenarioVars = createScenarioForVariable(
      config.variable,
      value,
      100, // baseline for other variables
      100,
      100,
      100,
    );

    // Apply scenario and calculate
    const modifiedInput = applyScenarioVariables(baselineInput, scenarioVars);
    const result = await calculateFinancialProjections(modifiedInput);
    const metricValue = extractMetric(result, config.metric);

    const pointTimeMs = performance.now() - pointStartTime;

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

  const totalImpact = new Decimal(positiveDeviation)
    .minus(negativeDeviation)
    .abs()
    .toFixed(2);

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
    tuitionGrowthPercent: baselineTuitionGrowthDecimal.toNumber(),
    cpiPercent: baselineCpiDecimal.toNumber(),
    rentEscalationPercent: baselineRentEscalationDecimal.toNumber(),
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
        .toNumber();
      break;
    case "cpi":
      vars.cpiPercent = valueDecimal
        .div(100)
        .mul(baselineCpiDecimal)
        .toNumber();
      break;
    case "rentEscalation":
      vars.rentEscalationPercent = valueDecimal
        .div(100)
        .mul(baselineRentEscalationDecimal)
        .toNumber();
      break;
    case "staffCosts":
      // Staff costs would need different handling - placeholder
      vars.enrollmentPercent = valueDecimal.toNumber(); // Proxy via enrollment for now
      break;
    case "otherOpex":
      // Other opex would need different handling - placeholder
      vars.cpiPercent = valueDecimal
        .div(100)
        .mul(baselineCpiDecimal)
        .toNumber(); // Proxy via CPI for now
      break;
  }

  return vars;
}

/**
 * Extract a specific metric from calculation results
 */
function extractMetric(
  result: CalculationEngineOutput,
  metric: SensitivityMetric,
): string {
  const periods = result.periods;

  switch (metric) {
    case "totalRent": {
      const totalRent = periods.reduce(
        (sum, p) => sum.add(p.profitLoss.rentExpense),
        new Decimal(0),
      );
      return totalRent.toFixed(2);
    }

    case "ebitda": {
      const totalEbitda = periods.reduce(
        (sum, p) => sum.add(p.profitLoss.ebitda),
        new Decimal(0),
      );
      return totalEbitda.toFixed(2);
    }

    case "maxDebt": {
      const maxDebt = periods.reduce(
        (max, p) =>
          p.balanceSheet.debtBalance.greaterThan(max)
            ? p.balanceSheet.debtBalance
            : max,
        new Decimal(0),
      );
      return maxDebt.toFixed(2);
    }

    case "finalCash": {
      const finalCash = periods[periods.length - 1].balanceSheet.cash;
      return finalCash.toFixed(2);
    }

    case "npv":
      // TODO: Implement NPV calculation with discount rate
      return "0.00";

    case "irr":
      // TODO: Implement IRR calculation
      return "0.00";

    case "payback":
      // TODO: Implement payback period calculation
      return "0.00";

    default:
      return "0.00";
  }
}
