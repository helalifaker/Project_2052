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
 * Deep clone an object while preserving Decimal.js instances
 * This is safer than JSON serialization which can lose type information
 */
function deepCloneWithDecimals<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  // Preserve Decimal instances
  if (obj instanceof Decimal) {
    return new Decimal(obj) as T;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map((item) => deepCloneWithDecimals(item)) as T;
  }

  // Handle objects
  const cloned = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepCloneWithDecimals(obj[key]);
    }
  }

  return cloned;
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
  // Deep clone to avoid mutation - preserve Decimal instances
  const modifiedInput = deepCloneWithDecimals(baselineInput);

  // Log scenario application for debugging
  console.log("📊 Applying scenario variables:", {
    enrollmentPercent: variables.enrollmentPercent,
    tuitionGrowthPercent: variables.tuitionGrowthPercent,
    cpiPercent: variables.cpiPercent,
    rentEscalationPercent: variables.rentEscalationPercent,
  });

  // ============================================================================
  // 1. ENROLLMENT ADJUSTMENT
  // ============================================================================
  const enrollmentMultiplier = new Decimal(variables.enrollmentPercent).div(
    100,
  );

  // Log before values
  const beforeSteadyState =
    modifiedInput.dynamicPeriodConfig.enrollment.steadyStateStudents;
  const beforeRampUp = modifiedInput.dynamicPeriodConfig.enrollment
    .rampUpTargetStudents;

  // Adjust steady state students - keep in Decimal space
  const currentSteadyState = new Decimal(
    modifiedInput.dynamicPeriodConfig.enrollment.steadyStateStudents,
  );
  const newSteadyState = currentSteadyState.times(enrollmentMultiplier);
  modifiedInput.dynamicPeriodConfig.enrollment.steadyStateStudents =
    Math.round(newSteadyState.toNumber());

  // Adjust ramp-up target (if enabled) - keep in Decimal space
  if (modifiedInput.dynamicPeriodConfig.enrollment.rampUpEnabled) {
    const currentRampUp = new Decimal(
      modifiedInput.dynamicPeriodConfig.enrollment.rampUpTargetStudents,
    );
    const newRampUp = currentRampUp.times(enrollmentMultiplier);
    modifiedInput.dynamicPeriodConfig.enrollment.rampUpTargetStudents =
      Math.round(newRampUp.toNumber());
  }

  // Log after values and validate
  console.log("📊 Enrollment adjustment:", {
    multiplier: enrollmentMultiplier.toString(),
    steadyState: {
      before: beforeSteadyState,
      after: modifiedInput.dynamicPeriodConfig.enrollment.steadyStateStudents,
    },
    rampUp: modifiedInput.dynamicPeriodConfig.enrollment.rampUpEnabled
      ? {
        before: beforeRampUp,
        after:
          modifiedInput.dynamicPeriodConfig.enrollment.rampUpTargetStudents,
      }
      : "disabled",
  });

  // Validate enrollment values are reasonable
  if (
    modifiedInput.dynamicPeriodConfig.enrollment.steadyStateStudents > 100000
  ) {
    console.error(
      "❌ Suspicious enrollment value after scenario application:",
      modifiedInput.dynamicPeriodConfig.enrollment.steadyStateStudents,
    );
  }
  if (
    modifiedInput.dynamicPeriodConfig.enrollment.rampUpEnabled &&
    modifiedInput.dynamicPeriodConfig.enrollment.rampUpTargetStudents > 100000
  ) {
    console.error(
      "❌ Suspicious ramp-up target after scenario application:",
      modifiedInput.dynamicPeriodConfig.enrollment.rampUpTargetStudents,
    );
  }

  // ============================================================================
  // 2. TUITION GROWTH ADJUSTMENT
  // ============================================================================
  // Treat the slider value as the NEW absolute rate.
  // Example: Slider 5% -> New Rate 0.05

  const newNationalRate = new Decimal(variables.tuitionGrowthPercent).div(100);

  // Log before values
  const beforeNationalRate =
    modifiedInput.dynamicPeriodConfig.curriculum.nationalTuitionGrowthRate;

  // Set growth rates - preserve original frequency from baseline
  modifiedInput.dynamicPeriodConfig.curriculum.nationalTuitionGrowthRate =
    newNationalRate;
  // DO NOT override nationalTuitionGrowthFrequency - keep baseline value

  // Also set IB tuition growth rate if IB program is enabled
  if (modifiedInput.dynamicPeriodConfig.curriculum.ibProgramEnabled) {
    const beforeIBRate =
      modifiedInput.dynamicPeriodConfig.curriculum.ibTuitionGrowthRate;

    // For IB, we apply the same rate as National for simplicity in this scenario tool,
    // or we could apply a delta. Given the UI has one slider for "Tuition Growth",
    // applying it to both is the most intuitive behavior.
    const newIBRate = newNationalRate;

    modifiedInput.dynamicPeriodConfig.curriculum.ibTuitionGrowthRate =
      newIBRate;
    // DO NOT override ibTuitionGrowthFrequency - keep baseline value

    console.log("📊 Tuition growth adjustment:", {
      newRate: newNationalRate.toString(),
      national: {
        before: beforeNationalRate?.toString(),
        after: newNationalRate.toString(),
      },
      ib: {
        before: beforeIBRate?.toString(),
        after: newIBRate.toString(),
      },
    });
  } else {
    console.log("📊 Tuition growth adjustment:", {
      newRate: newNationalRate.toString(),
      national: {
        before: beforeNationalRate?.toString(),
        after: newNationalRate.toString(),
      },
      ib: "disabled",
    });
  }

  // Validate growth rate is reasonable (0-50%)
  if (newNationalRate.greaterThan(0.5) || newNationalRate.lessThan(0)) {
    console.warn(
      "⚠️ Tuition growth rate outside expected range:",
      newNationalRate.toString(),
    );
  }

  // ============================================================================
  // 3. RENT ESCALATION ADJUSTMENT
  // ============================================================================
  // Treat the slider value as the NEW absolute rate.
  // Example: Slider 5% -> New Rate 0.05

  const newRentRate = new Decimal(variables.rentEscalationPercent).div(100);

  if (modifiedInput.rentModel === RentModelEnum.FIXED_ESCALATION) {
    const rentParams = modifiedInput.rentParams as FixedRentParams;
    const beforeRate = rentParams.growthRate;

    rentParams.growthRate = newRentRate;

    // Also update dynamic period rent params
    const dynamicRentParams = modifiedInput.dynamicPeriodConfig
      .rentParams as FixedRentParams;
    dynamicRentParams.growthRate = newRentRate;

    console.log("📊 Rent escalation adjustment (FIXED_ESCALATION):", {
      newRate: newRentRate.toString(),
      before: beforeRate?.toString(),
      after: newRentRate.toString(),
    });
  } else if (modifiedInput.rentModel === RentModelEnum.PARTNER_INVESTMENT) {
    const rentParams = modifiedInput.rentParams as PartnerInvestmentParams;
    const beforeRate = rentParams.growthRate;

    rentParams.growthRate = newRentRate;

    // Also update dynamic period rent params
    const dynamicRentParams = modifiedInput.dynamicPeriodConfig
      .rentParams as PartnerInvestmentParams;
    dynamicRentParams.growthRate = newRentRate;

    console.log("📊 Rent escalation adjustment (PARTNER_INVESTMENT):", {
      newRate: newRentRate.toString(),
      before: beforeRate?.toString(),
      after: newRentRate.toString(),
    });
  } else {
    // REVENUE_SHARE - no growth rate adjustment needed
    console.log("📊 Rent escalation adjustment (REVENUE_SHARE):", {
      note: "Rent scales automatically with revenue, no growth rate adjustment",
    });
  }

  // Validate growth rate is reasonable (0-20%)
  // Only validate if we actually set a rate
  if (
    modifiedInput.rentModel === RentModelEnum.FIXED_ESCALATION ||
    modifiedInput.rentModel === RentModelEnum.PARTNER_INVESTMENT
  ) {
    if (newRentRate.greaterThan(0.2) || newRentRate.lessThan(0)) {
      console.warn(
        "⚠️ Rent escalation rate outside expected range:",
        newRentRate.toString(),
      );
    }
  }

  // ============================================================================
  // 4. CPI ADJUSTMENT (affects Staff Costs)
  // ============================================================================
  // Treat the slider value as the NEW absolute rate.
  // Example: Slider 2% -> New Rate 0.02

  const newCpiRate = new Decimal(variables.cpiPercent).div(100);

  // Log before value
  const beforeCpiRate = modifiedInput.dynamicPeriodConfig.staff.cpiRate;

  // Set CPI rate for staff cost calculation - preserve original frequency
  modifiedInput.dynamicPeriodConfig.staff.cpiRate = newCpiRate;
  // DO NOT override cpiFrequency - keep baseline value

  console.log("📊 CPI adjustment:", {
    newRate: newCpiRate.toString(),
    before: beforeCpiRate?.toString(),
    after: newCpiRate.toString(),
  });

  // Validate CPI rate is reasonable (0-10%)
  if (newCpiRate.greaterThan(0.1) || newCpiRate.lessThan(0)) {
    console.warn(
      "⚠️ CPI rate outside expected range:",
      newCpiRate.toString(),
    );
  }

  // Final validation summary
  console.log("✅ Scenario application complete:", {
    enrollment: modifiedInput.dynamicPeriodConfig.enrollment.steadyStateStudents,
    tuitionGrowth: modifiedInput.dynamicPeriodConfig.curriculum
      .nationalTuitionGrowthRate?.toString(),
    cpi: modifiedInput.dynamicPeriodConfig.staff.cpiRate?.toString(),
    rentModel: modifiedInput.rentModel,
  });

  return modifiedInput;
}

/**
 * Check if a field name should be converted to Decimal
 */
function shouldBeDecimal(key: string): boolean {
  const decimalPatterns = [
    "Rate",
    "Percent",
    "Fee",
    "Cost",
    "Opex",
    "Rent",
    "Amount",
    "Balance",
    "Interest",
    "Escalation",
    "Share",
    "Ratio",
    "Size",
    "Sqm",
    "Yield",
    "Salary",
    "Revenue",
    "Income",
    "Expense",
    "Price",
    "Value",
    "percentage",
    "baseRent",
    "growthRate",
    "revenueSharePercent",
    "yieldRate",
    "Tolerance",
    "Factor",
    // Balance sheet fields
    "cash",
    "ppe",
    "equity",
    "debt",
    "depreciation",
    "Receivable",
    "Payable",
    // P&L fields
    "zakat",
    "Tuition",
  ];
  return decimalPatterns.some(
    (pattern) =>
      key.includes(pattern) ||
      key.toLowerCase().includes(pattern.toLowerCase()),
  );
}

/**
 * Recursively reconstruct Decimal.js instances from serialized strings
 */
function reconstructDecimals(obj: unknown): void {
  if (!obj || typeof obj !== "object") return;

  // Handle arrays
  if (Array.isArray(obj)) {
    for (const item of obj) {
      if (typeof item === "object" && item !== null) {
        reconstructDecimals(item);
      }
    }
    return;
  }

  const record = obj as Record<string, unknown>;

  for (const key in record) {
    const value = record[key];

    // Check if value is a string that looks like a Decimal number
    if (typeof value === "string" && /^-?\d+(\.\d+)?$/.test(value)) {
      if (shouldBeDecimal(key)) {
        try {
          record[key] = new Decimal(value);
        } catch {
          // Keep as string if conversion fails
        }
      }
    } else if (typeof value === "number") {
      if (shouldBeDecimal(key)) {
        record[key] = new Decimal(value);
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
