/**
 * SCENARIO MODIFIER MODULE
 *
 * Modifies calculation engine inputs based on scenario variables.
 * This enables real-time "what-if" analysis by adjusting key assumptions.
 *
 * Scenario Variables:
 * - enrollmentPercent: Multiplier for student enrollment (100 = baseline)
 * - cpiPercent: Annual CPI growth rate (affects opex inflation)
 * - tuitionGrowthPercent: Annual tuition fee growth rate
 * - rentEscalationPercent: Annual rent escalation rate (for fixed rent model)
 */

import Decimal from "decimal.js";
import type {
  CalculationEngineInput,
  EnrollmentConfig,
  CurriculumConfig,
  FixedRentParams,
  PartnerInvestmentParams,
  RentModel,
  RevenueShareParams,
} from "./core/types";
import { RentModel as RentModelEnum } from "./core/types";

export interface ScenarioVariables {
  enrollmentPercent: number; // 50-150 (%)
  cpiPercent: number; // 0-10 (% annual growth)
  tuitionGrowthPercent: number; // 0-15 (% annual growth)
  rentEscalationPercent: number; // 0-10 (% annual escalation)
}

export interface BaselineMetrics {
  enrollment: EnrollmentConfig;
  curriculum: CurriculumConfig;
  rentModel: RentModel;
  rentParams: FixedRentParams | RevenueShareParams | PartnerInvestmentParams;
}

/**
 * Apply scenario variables to calculation engine input
 *
 * This function modifies the input configuration based on scenario slider values
 * without mutating the original baseline data.
 *
 * @param baselineInput - Original calculation input from proposal
 * @param variables - Scenario variables from sliders
 * @returns Modified calculation input for scenario analysis
 */
export function applyScenarioVariables(
  baselineInput: CalculationEngineInput,
  variables: ScenarioVariables,
): CalculationEngineInput {
  // Deep clone to avoid mutation
  const modifiedInput: CalculationEngineInput = JSON.parse(
    JSON.stringify(baselineInput, (key, value) => {
      // Handle Decimal.js serialization
      if (value && typeof value === "object" && value.d !== undefined) {
        return value.toString();
      }
      return value;
    }),
  );

  // Reconstruct Decimal values
  reconstructDecimals(modifiedInput);

  // ============================================================================
  // 1. ENROLLMENT ADJUSTMENT
  // ============================================================================
  const enrollmentMultiplier = new Decimal(variables.enrollmentPercent).div(
    100,
  );

  // Adjust steady state students
  modifiedInput.dynamicPeriodConfig.enrollment.steadyStateStudents = Math.round(
    modifiedInput.dynamicPeriodConfig.enrollment.steadyStateStudents *
      enrollmentMultiplier.toNumber(),
  );

  // Adjust ramp-up target (if enabled)
  if (modifiedInput.dynamicPeriodConfig.enrollment.rampUpEnabled) {
    modifiedInput.dynamicPeriodConfig.enrollment.rampUpTargetStudents =
      Math.round(
        modifiedInput.dynamicPeriodConfig.enrollment.rampUpTargetStudents *
          enrollmentMultiplier.toNumber(),
      );
  }

  // ============================================================================
  // 2. TUITION GROWTH ADJUSTMENT
  // ============================================================================
  // Note: The baseline has fixed tuition fees. To apply growth, we need to
  // create a compound growth factor that will be applied during calculation.
  // This is handled implicitly by adjusting the base fees in dynamic config.

  const tuitionGrowthRate = new Decimal(variables.tuitionGrowthPercent).div(
    100,
  );
  const baseYear = modifiedInput.dynamicPeriodConfig.year;

  // Calculate compounded growth from base year
  // For simplicity, we'll apply the growth rate directly to the curriculum fees
  // The calculation engine will use these as starting points

  modifiedInput.dynamicPeriodConfig.curriculum.nationalCurriculumFee =
    new Decimal(
      modifiedInput.dynamicPeriodConfig.curriculum.nationalCurriculumFee,
    ).mul(new Decimal(1).add(tuitionGrowthRate));

  modifiedInput.dynamicPeriodConfig.curriculum.ibCurriculumFee = new Decimal(
    modifiedInput.dynamicPeriodConfig.curriculum.ibCurriculumFee,
  ).mul(new Decimal(1).add(tuitionGrowthRate));

  // ============================================================================
  // 3. RENT ESCALATION ADJUSTMENT (Fixed Rent Model only)
  // ============================================================================
  if (modifiedInput.rentModel === RentModelEnum.FIXED_ESCALATION) {
    const rentParams = modifiedInput.rentParams as FixedRentParams;
    rentParams.growthRate = new Decimal(variables.rentEscalationPercent).div(
      100,
    );

    // Also update dynamic period rent params
    const dynamicRentParams = modifiedInput.dynamicPeriodConfig
      .rentParams as FixedRentParams;
    dynamicRentParams.growthRate = new Decimal(
      variables.rentEscalationPercent,
    ).div(100);
  }

  // ============================================================================
  // 4. CPI ADJUSTMENT (affects OpEx inflation)
  // ============================================================================
  // CPI affects operating expenses growth. We can model this by adjusting
  // the otherOpex with a compound growth factor.
  // For simplicity, apply a single-year adjustment to the base otherOpex

  const cpiGrowthRate = new Decimal(variables.cpiPercent).div(100);

  // Apply CPI growth to other operating expenses
  modifiedInput.dynamicPeriodConfig.otherOpex = new Decimal(
    modifiedInput.dynamicPeriodConfig.otherOpex,
  ).mul(new Decimal(1).add(cpiGrowthRate));

  return modifiedInput;
}

/**
 * Recursively reconstruct Decimal.js instances from serialized strings
 */
function reconstructDecimals(obj: unknown): void {
  if (!obj || typeof obj !== "object") return;

  const record = obj as Record<string, unknown>;

  for (const key in record) {
    const value = record[key];

    // Check if value is a string that looks like a Decimal number
    if (typeof value === "string" && /^-?\d+(\.\d+)?$/.test(value)) {
      // Check if the key name suggests it should be a Decimal
      if (
        key.includes("Rate") ||
        key.includes("Percent") ||
        key.includes("Fee") ||
        key.includes("Cost") ||
        key.includes("Opex") ||
        key.includes("Rent") ||
        key.includes("Amount") ||
        key.includes("Balance") ||
        key.includes("Interest") ||
        key.includes("Escalation") ||
        key.includes("Share") ||
        key.includes("Ratio")
      ) {
        try {
          record[key] = new Decimal(value);
        } catch (e) {
          // Keep as string if conversion fails
        }
      }
    } else if (value && typeof value === "object") {
      reconstructDecimals(value);
    }
  }
}

/**
 * Extract baseline metrics from a proposal for comparison
 */
export function extractBaselineMetrics(
  baselineInput: CalculationEngineInput,
): BaselineMetrics {
  return {
    enrollment: baselineInput.dynamicPeriodConfig.enrollment,
    curriculum: baselineInput.dynamicPeriodConfig.curriculum,
    rentModel: baselineInput.rentModel,
    rentParams: baselineInput.rentParams,
  };
}

/**
 * Calculate the difference between scenario and baseline as percentages
 */
export function calculateMetricChange(
  baselineValue: Decimal,
  scenarioValue: Decimal,
): {
  absolute: Decimal;
  percent: Decimal;
} {
  const absolute = scenarioValue.minus(baselineValue);
  const percent = baselineValue.isZero()
    ? new Decimal(0)
    : absolute.div(baselineValue).mul(100);

  return { absolute, percent };
}
