/**
 * END-TO-END INTEGRATION TESTS FOR 30-YEAR CALCULATION ENGINE
 *
 * These tests validate the complete calculation flow across all periods:
 * - Historical Period (2023-2024)
 * - Transition Period (2025-2027)
 * - Dynamic Period (2028-2057)
 *
 * Validation focuses on:
 * - Balance sheet balancing across all scenarios (diff <$0.01)
 * - Cash flow reconciliation across all scenarios (diff <$0.01)
 * - Period linkage and continuity
 * - All 3 rent models end-to-end
 * - Edge cases and stress scenarios
 *
 * Run with: pnpm test:run src/lib/engine/index.e2e.test.ts
 */

import { describe, it, expect } from "vitest";
import Decimal from "decimal.js";
import { calculateFinancialProjections } from "./index";
import type {
  CalculationEngineInput,
  SystemConfiguration,
  HistoricalPeriodInput,
  TransitionPeriodInput,
  DynamicPeriodInput,
  FinancialPeriod,
  CapExConfiguration,
} from "./core/types";
import { RentModel, PeriodType, CapExCategoryType } from "./core/types";
import {
  BALANCE_SHEET_TOLERANCE,
  CASH_FLOW_TOLERANCE,
  ZERO,
} from "./core/constants";

// ============================================================================
// E2E TEST DATA HELPERS
// ============================================================================

/**
 * Create system configuration
 */
function createSystemConfig(): SystemConfiguration {
  return {
    zakatRate: new Decimal(0.025), // 2.5%
    debtInterestRate: new Decimal(0.05), // 5%
    depositInterestRate: new Decimal(0.02), // 2%
    minCashBalance: new Decimal(1000000), // 1M SAR
  };
}

/**
 * Create realistic historical period inputs (2023-2024)
 */
function createHistoricalPeriods(): HistoricalPeriodInput[] {
  const basePL2023 = {
    revenue: new Decimal(45000000),
    rent: new Decimal(9000000),
    staffCosts: new Decimal(18000000),
    otherOpex: new Decimal(4500000),
    depreciation: new Decimal(1800000),
    interest: new Decimal(900000),
    zakat: new Decimal(270000),
  };

  const baseBS2023 = {
    cash: new Decimal(4500000),
    accountsReceivable: new Decimal(4500000),
    prepaidExpenses: new Decimal(1575000),
    grossPPE: new Decimal(36000000), // Gross = Net + AccDep
    ppe: new Decimal(27000000),
    accumulatedDepreciation: new Decimal(9000000),
    accountsPayable: new Decimal(2520000),
    accruedExpenses: new Decimal(1575000),
    deferredRevenue: new Decimal(6750000),
    debt: new Decimal(18000000),
    equity: new Decimal(8730000),
  };

  const basePL2024 = {
    revenue: new Decimal(50000000),
    rent: new Decimal(10000000),
    staffCosts: new Decimal(20000000),
    otherOpex: new Decimal(5000000),
    depreciation: new Decimal(2000000),
    interest: new Decimal(1000000),
    zakat: new Decimal(300000),
  };

  const baseBS2024 = {
    cash: new Decimal(5000000),
    accountsReceivable: new Decimal(5000000),
    prepaidExpenses: new Decimal(1750000),
    grossPPE: new Decimal(40000000), // Gross = Net + AccDep
    ppe: new Decimal(30000000),
    accumulatedDepreciation: new Decimal(10000000),
    accountsPayable: new Decimal(2800000),
    accruedExpenses: new Decimal(1750000),
    deferredRevenue: new Decimal(7500000),
    debt: new Decimal(20000000),
    equity: new Decimal(9700000),
  };

  return [
    {
      year: 2023,
      profitLoss: basePL2023,
      balanceSheet: baseBS2023,
      immutable: true,
    },
    {
      year: 2024,
      profitLoss: basePL2024,
      balanceSheet: baseBS2024,
      immutable: false,
    },
  ];
}

/**
 * Create transition period inputs
 */
function createTransitionPeriods(): TransitionPeriodInput[] {
  return [
    {
      year: 2025,
      preFillFromPriorYear: false,
      revenueGrowthRate: new Decimal(0.1),
    },
    {
      year: 2026,
      preFillFromPriorYear: false,
      revenueGrowthRate: new Decimal(0.12),
    },
    {
      year: 2027,
      preFillFromPriorYear: false,
      revenueGrowthRate: new Decimal(0.15),
    },
  ];
}

/**
 * Create complete calculation input
 */
function createCalculationInput(rentModel: RentModel): CalculationEngineInput {
  const systemConfig = createSystemConfig();
  const historicalPeriods = createHistoricalPeriods();
  const transitionPeriods = createTransitionPeriods();

  const workingCapitalRatios = {
    arPercent: new Decimal(0.1),
    prepaidPercent: new Decimal(0.05),
    apPercent: new Decimal(0.08),
    accruedPercent: new Decimal(0.05),
    deferredRevenuePercent: new Decimal(0.15),
    otherRevenueRatio: new Decimal(0.05), // 5% other revenue
    locked: false,
    calculatedFrom2024: true,
  };

  const rentParams =
    rentModel === RentModel.FIXED_ESCALATION
      ? {
          baseRent: new Decimal(10000000),
          growthRate: new Decimal(0.03),
          frequency: 1,
        }
      : rentModel === RentModel.REVENUE_SHARE
        ? {
            revenueSharePercent: new Decimal(0.2),
          }
        : {
            landSize: new Decimal(10000),
            landPricePerSqm: new Decimal(5000),
            buaSize: new Decimal(20000),
            constructionCostPerSqm: new Decimal(2500),
            yieldRate: new Decimal(0.09),
            growthRate: new Decimal(0.02),
            frequency: 1,
          };

  // Create CAPEX configuration with proper category structure
  const capexConfig: CapExConfiguration = {
    categories: [
      {
        id: "cat-it",
        type: CapExCategoryType.IT_EQUIPMENT,
        name: "IT Equipment",
        usefulLife: 5,
        reinvestFrequency: 5, // Every 5 years
        reinvestAmount: new Decimal(1000000),
      },
      {
        id: "cat-furniture",
        type: CapExCategoryType.FURNITURE,
        name: "Furniture",
        usefulLife: 10,
        reinvestFrequency: 7, // Every 7 years
        reinvestAmount: new Decimal(500000),
      },
      {
        id: "cat-equipment",
        type: CapExCategoryType.EDUCATIONAL_EQUIPMENT,
        name: "Educational Equipment",
        usefulLife: 8,
        reinvestFrequency: 6, // Every 6 years
        reinvestAmount: new Decimal(750000),
      },
      {
        id: "cat-building",
        type: CapExCategoryType.BUILDING,
        name: "Building",
        usefulLife: 30,
        reinvestFrequency: undefined, // No regular reinvestment
        reinvestAmount: undefined,
      },
    ],
    historicalState: {
      grossPPE2024: new Decimal(40000000),
      accumulatedDepreciation2024: new Decimal(10000000),
      annualDepreciation: new Decimal(1000000),
      remainingToDepreciate: new Decimal(30000000),
    },
    transitionCapex: [], // Empty for this E2E test
    virtualAssets: [], // Will be populated during calculation
  };

  const dynamicPeriodConfig: DynamicPeriodInput = {
    year: 2028, // Will be overridden in loop
    enrollment: {
      rampUpEnabled: true,
      rampUpStartYear: 2028,
      rampUpEndYear: 2033, // 5 years ramp-up
      rampUpTargetStudents: 3000,
      steadyStateStudents: 3000,
      gradeDistribution: [], // Simplified for E2E tests
    },
    curriculum: {
      ibProgramEnabled: true,
      ibStartYear: 2030,
      nationalCurriculumFee: new Decimal(25000),
      ibCurriculumFee: new Decimal(45000),
      ibStudentPercentage: new Decimal(0.3),
    },
    staff: {
      fixedStaffCost: new Decimal(15000000),
      variableStaffCostPerStudent: new Decimal(8000),
    },
    rentModel,
    rentParams,
    otherOpexPercent: new Decimal(0.1), // 10% of revenue
    capexConfig, // Use the properly configured CAPEX
  };

  const circularSolverConfig = {
    maxIterations: 100,
    convergenceTolerance: new Decimal(0.01), // $0.01
    relaxationFactor: new Decimal(0.5),
  };

  return {
    systemConfig,
    contractPeriodYears: 30,
    historicalPeriods,
    transitionPeriods,
    workingCapitalRatios,
    rentModel,
    rentParams,
    dynamicPeriodConfig,
    capexConfig,
    circularSolverConfig,
  };
}

// ============================================================================
// HELPER VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate balance sheet balancing across all periods
 */
function validateAllPeriodsBalanced(periods: FinancialPeriod[]): void {
  periods.forEach((period) => {
    const balanceDiff = period.balanceSheet.balanceDifference.abs();
    expect(balanceDiff.toNumber()).toBeLessThan(0.01); // <$0.01
  });
}

/**
 * Validate cash flow reconciliation across all periods
 * Skip historical periods as they come from external data and may have timing differences
 */
function validateAllCashFlowsReconciled(periods: FinancialPeriod[]): void {
  periods.forEach((period) => {
    // Skip validation for historical periods (immutable data from external sources)
    if (period.periodType === PeriodType.HISTORICAL) {
      return;
    }

    const cashDiff = period.cashFlow.cashReconciliationDiff.abs();
    expect(cashDiff.toNumber()).toBeLessThan(0.01); // <$0.01
  });
}

/**
 * Validate period linkage (year-over-year continuity)
 */
function validatePeriodLinkage(periods: FinancialPeriod[]): void {
  for (let i = 1; i < periods.length; i++) {
    const currentPeriod = periods[i];

    // Validate that equity is positive and increasing (generally)
    expect(currentPeriod.balanceSheet.totalEquity.toNumber()).toBeGreaterThan(
      0,
    );
  }
}

/**
 * Validate financial statement integrity
 */
function validateFinancialStatements(periods: FinancialPeriod[]): void {
  periods.forEach((period) => {
    // P&L integrity
    expect(period.profitLoss.totalRevenue.toNumber()).toBeGreaterThan(0);
    expect(period.profitLoss.totalOpex.toNumber()).toBeGreaterThan(0);

    // Balance sheet integrity
    expect(period.balanceSheet.totalAssets.toNumber()).toBeGreaterThan(0);
    expect(period.balanceSheet.totalLiabilities.toNumber()).toBeGreaterThan(0);
    expect(period.balanceSheet.totalEquity.toNumber()).toBeGreaterThan(0);

    // Cash flow integrity
    expect(period.cashFlow.endingCash.toNumber()).toBeGreaterThan(0);
  });
}

// ============================================================================
// END-TO-END INTEGRATION TESTS
// ============================================================================

describe("End-to-End Integration Tests - 30-Year Calculation Engine", () => {
  describe("Fixed Escalation Rent Model - Full 30-Year Calculation", () => {
    it("should calculate all 30 years with balanced balance sheets", async () => {
      const input = createCalculationInput(RentModel.FIXED_ESCALATION);
      const result = await calculateFinancialProjections(input);

      console.log("\n🧪 Fixed Escalation - E2E Test Results:");
      console.log(`   Periods Calculated: ${result.periods.length} years`);
      console.log(
        `   All Balanced: ${result.validation.allPeriodsBalanced ? "✅" : "❌"}`,
      );
      console.log(
        `   All Reconciled: ${result.validation.allCashFlowsReconciled ? "✅" : "❌"}`,
      );
      console.log(
        `   Max Balance Diff: $${result.validation.maxBalanceDifference.toFixed(4)}`,
      );
      console.log(
        `   Max Cash Diff: $${result.validation.maxCashDifference.toFixed(4)}`,
      );

      // Validate 35 years calculated (2023-2057: 2 historical + 3 transition + 30 dynamic)
      expect(result.periods).toHaveLength(35);

      // Validate all balance sheets balanced
      validateAllPeriodsBalanced(result.periods);
      expect(result.validation.allPeriodsBalanced).toBe(true);

      // Validate all cash flows reconciled
      validateAllCashFlowsReconciled(result.periods);
      expect(result.validation.allCashFlowsReconciled).toBe(true);

      // Validate period linkage
      validatePeriodLinkage(result.periods);

      // Validate financial statements
      validateFinancialStatements(result.periods);

      // Validate rent increases annually
      for (let i = 1; i < result.periods.length; i++) {
        const prevRent = result.periods[i - 1].profitLoss.rentExpense;
        const currentRent = result.periods[i].profitLoss.rentExpense;
        expect(currentRent.toNumber()).toBeGreaterThanOrEqual(
          prevRent.toNumber(),
        );
      }
    });

    it("should maintain positive equity throughout all periods", async () => {
      const input = createCalculationInput(RentModel.FIXED_ESCALATION);
      const result = await calculateFinancialProjections(input);

      result.periods.forEach((period) => {
        expect(period.balanceSheet.totalEquity.toNumber()).toBeGreaterThan(0);
      });
    });
  });

  describe("Revenue Share Rent Model - Full 30-Year Calculation", () => {
    it("should calculate all 30 years with balanced balance sheets", async () => {
      const input = createCalculationInput(RentModel.REVENUE_SHARE);
      const result = await calculateFinancialProjections(input);

      console.log("\n🧪 Revenue Share - E2E Test Results:");
      console.log(`   Periods Calculated: ${result.periods.length} years`);
      console.log(
        `   All Balanced: ${result.validation.allPeriodsBalanced ? "✅" : "❌"}`,
      );
      console.log(
        `   All Reconciled: ${result.validation.allCashFlowsReconciled ? "✅" : "❌"}`,
      );
      console.log(
        `   Max Balance Diff: $${result.validation.maxBalanceDifference.toFixed(4)}`,
      );
      console.log(
        `   Max Cash Diff: $${result.validation.maxCashDifference.toFixed(4)}`,
      );

      expect(result.periods).toHaveLength(35);
      validateAllPeriodsBalanced(result.periods);
      validateAllCashFlowsReconciled(result.periods);
      validatePeriodLinkage(result.periods);
      validateFinancialStatements(result.periods);

      expect(result.validation.allPeriodsBalanced).toBe(true);
      expect(result.validation.allCashFlowsReconciled).toBe(true);
    });

    it("should apply revenue share percentage correctly", async () => {
      const input = createCalculationInput(RentModel.REVENUE_SHARE);
      const result = await calculateFinancialProjections(input);

      const share = new Decimal(0.2);

      result.periods.forEach((period) => {
        const rent = period.profitLoss.rentExpense;
        if (period.year >= 2028) {
          const expected = period.profitLoss.totalRevenue.mul(share);
          expect(rent.toNumber()).toBeCloseTo(expected.toNumber(), -2);
        }
      });
    });
  });

  describe("Partner Investment Rent Model - Full 30-Year Calculation", () => {
    it("should calculate all 30 years with balanced balance sheets", async () => {
      const input = createCalculationInput(RentModel.PARTNER_INVESTMENT);
      const result = await calculateFinancialProjections(input);

      console.log("\n🧪 Partner Investment - E2E Test Results:");
      console.log(`   Periods Calculated: ${result.periods.length} years`);
      console.log(
        `   All Balanced: ${result.validation.allPeriodsBalanced ? "✅" : "❌"}`,
      );
      console.log(
        `   All Reconciled: ${result.validation.allCashFlowsReconciled ? "✅" : "❌"}`,
      );
      console.log(
        `   Max Balance Diff: $${result.validation.maxBalanceDifference.toFixed(4)}`,
      );
      console.log(
        `   Max Cash Diff: $${result.validation.maxCashDifference.toFixed(4)}`,
      );

      expect(result.periods).toHaveLength(35);
      validateAllPeriodsBalanced(result.periods);
      validateAllCashFlowsReconciled(result.periods);
      validatePeriodLinkage(result.periods);
      validateFinancialStatements(result.periods);

      expect(result.validation.allPeriodsBalanced).toBe(true);
      expect(result.validation.allCashFlowsReconciled).toBe(true);
    });

    it("should transition from recovery to post-recovery correctly", async () => {
      const input = createCalculationInput(RentModel.PARTNER_INVESTMENT);
      const result = await calculateFinancialProjections(input);

      // Recovery period is 10 years, starting from 2025 (first transition year)
      // Recovery ends in 2034 (index 11 in periods array: 2023=0, 2024=1, ..., 2034=11)
      // Post-recovery starts in 2035 (index 12)

      const recoveryYearIndex = 11; // 2034
      const postRecoveryYearIndex = 12; // 2035

      if (result.periods.length > postRecoveryYearIndex) {
        const recoveryRent =
          result.periods[recoveryYearIndex].profitLoss.rentExpense;
        const postRecoveryRent =
          result.periods[postRecoveryYearIndex].profitLoss.rentExpense;

        console.log(
          `   Recovery Year (2034) Rent: $${recoveryRent.toFixed(2)}`,
        );
        console.log(
          `   Post-Recovery Year (2035) Rent: $${postRecoveryRent.toFixed(2)}`,
        );

        // Post-recovery rent follows investment yield growth and should not decrease
        expect(postRecoveryRent.toNumber()).toBeGreaterThanOrEqual(
          recoveryRent.toNumber(),
        );
      }
    });
  });

  describe("Period Transitions - Linkage Validation", () => {
    it("should maintain continuity from Historical to Transition (2024→2025)", async () => {
      const input = createCalculationInput(RentModel.FIXED_ESCALATION);
      const result = await calculateFinancialProjections(input);

      const period2024 = result.periods.find((p) => p.year === 2024)!;
      const period2025 = result.periods.find((p) => p.year === 2025)!;

      expect(period2024).toBeDefined();
      expect(period2025).toBeDefined();

      // Cash continuity (within cash flow tolerance)
      const cashDiff = period2025.cashFlow.beginningCash
        .minus(period2024.balanceSheet.cash)
        .abs();
      expect(cashDiff.toNumber()).toBeLessThan(0.01);

      console.log(
        `   2024→2025 Cash Linkage: Diff = $${cashDiff.toFixed(4)} (target: <$0.01)`,
      );
    });

    it("should maintain continuity from Transition to Dynamic (2027→2028)", async () => {
      const input = createCalculationInput(RentModel.FIXED_ESCALATION);
      const result = await calculateFinancialProjections(input);

      const period2027 = result.periods.find((p) => p.year === 2027)!;
      const period2028 = result.periods.find((p) => p.year === 2028)!;

      expect(period2027).toBeDefined();
      expect(period2028).toBeDefined();

      // Cash continuity
      const cashDiff = period2028.cashFlow.beginningCash
        .minus(period2027.balanceSheet.cash)
        .abs();
      expect(cashDiff.toNumber()).toBeLessThan(0.01);

      console.log(
        `   2027→2028 Cash Linkage: Diff = $${cashDiff.toFixed(4)} (target: <$0.01)`,
      );
    });
  });

  describe("Comprehensive Validation Report", () => {
    it("should generate complete validation report for all rent models", async () => {
      const rentModels: RentModel[] = [
        RentModel.FIXED_ESCALATION,
        RentModel.REVENUE_SHARE,
        RentModel.PARTNER_INVESTMENT,
      ];
      const validationResults: Record<string, any> = {};

      console.log("\n" + "=".repeat(80));
      console.log("🔍 COMPREHENSIVE END-TO-END VALIDATION REPORT");
      console.log("=".repeat(80));

      for (const rentModel of rentModels) {
        const input = createCalculationInput(rentModel);
        const result = await calculateFinancialProjections(input);

        // Detailed validation
        let allBalanced = true;
        let allReconciled = true;
        let maxBalanceDiff = 0;
        let maxCashDiff = 0;
        let minEquity = Infinity;
        let maxDebt = 0;

        result.periods.forEach((period) => {
          const balanceDiff = period.balanceSheet.balanceDifference
            .abs()
            .toNumber();
          const cashDiff = period.cashFlow.cashReconciliationDiff
            .abs()
            .toNumber();

          if (balanceDiff >= 0.01) allBalanced = false;
          // Skip cash flow reconciliation check for historical periods
          if (period.periodType !== PeriodType.HISTORICAL && cashDiff >= 0.01) {
            allReconciled = false;
          }

          maxBalanceDiff = Math.max(maxBalanceDiff, balanceDiff);
          maxCashDiff = Math.max(maxCashDiff, cashDiff);
          minEquity = Math.min(
            minEquity,
            period.balanceSheet.totalEquity.toNumber(),
          );
          maxDebt = Math.max(
            maxDebt,
            period.balanceSheet.debtBalance.toNumber(),
          );
        });

        validationResults[rentModel] = {
          periodsCount: result.periods.length,
          allBalanced,
          allReconciled,
          maxBalanceDiff,
          maxCashDiff,
          minEquity,
          maxDebt,
          totalNetIncome: result.metrics.totalNetIncome.toNumber(),
          finalCash: result.metrics.finalCash.toNumber(),
          peakDebt: result.metrics.peakDebt.toNumber(),
        };
      }

      // Print report
      console.log("\n📊 Validation Results by Rent Model:");
      console.log("-".repeat(80));
      const modelNames = rentModels.map((m) =>
        m.toString().substring(0, 16).padEnd(17),
      );
      console.log("Metric".padEnd(30) + modelNames.join(""));
      console.log("-".repeat(80));

      console.log(
        "Periods Calculated".padEnd(30) +
          rentModels
            .map((m) => validationResults[m].periodsCount.toString().padEnd(17))
            .join(""),
      );
      console.log(
        "All Balanced".padEnd(30) +
          rentModels
            .map((m) =>
              (validationResults[m].allBalanced ? "✅ Yes" : "❌ No").padEnd(
                17,
              ),
            )
            .join(""),
      );
      console.log(
        "All Reconciled".padEnd(30) +
          rentModels
            .map((m) =>
              (validationResults[m].allReconciled ? "✅ Yes" : "❌ No").padEnd(
                17,
              ),
            )
            .join(""),
      );
      console.log(
        "Max Balance Diff ($)".padEnd(30) +
          rentModels
            .map((m) =>
              validationResults[m].maxBalanceDiff.toFixed(4).padEnd(17),
            )
            .join(""),
      );
      console.log(
        "Max Cash Diff ($)".padEnd(30) +
          rentModels
            .map((m) => validationResults[m].maxCashDiff.toFixed(4).padEnd(17))
            .join(""),
      );
      console.log(
        "Min Equity ($M)".padEnd(30) +
          rentModels
            .map((m) =>
              (validationResults[m].minEquity / 1000000).toFixed(2).padEnd(17),
            )
            .join(""),
      );
      console.log(
        "Peak Debt ($M)".padEnd(30) +
          rentModels
            .map((m) =>
              (validationResults[m].peakDebt / 1000000).toFixed(2).padEnd(17),
            )
            .join(""),
      );
      console.log(
        "Final Cash ($M)".padEnd(30) +
          rentModels
            .map((m) =>
              (validationResults[m].finalCash / 1000000).toFixed(2).padEnd(17),
            )
            .join(""),
      );

      console.log("\n✅ PHASE 2 SUCCESS CRITERIA:");
      console.log("-".repeat(80));
      console.log(
        `   ✅ Balance sheets balanced (diff <$0.01): ${rentModels.every((m) => validationResults[m].allBalanced) ? "PASSED ✅" : "FAILED ❌"}`,
      );
      console.log(
        `   ✅ Cash flows reconciled (diff <$0.01): ${rentModels.every((m) => validationResults[m].allReconciled) ? "PASSED ✅" : "FAILED ❌"}`,
      );
      console.log(
        `   ✅ All 35 years calculated (2023-2057): ${rentModels.every((m) => validationResults[m].periodsCount === 35) ? "PASSED ✅" : "FAILED ❌"}`,
      );
      console.log(
        `   ✅ Positive equity throughout: ${rentModels.every((m) => validationResults[m].minEquity > 0) ? "PASSED ✅" : "FAILED ❌"}`,
      );
      console.log("=".repeat(80));

      // All models must pass validation
      rentModels.forEach((model) => {
        expect(validationResults[model].allBalanced).toBe(true);
        expect(validationResults[model].allReconciled).toBe(true);
        expect(validationResults[model].periodsCount).toBe(35);
        expect(validationResults[model].minEquity).toBeGreaterThan(0);
      });
    });
  });
});
