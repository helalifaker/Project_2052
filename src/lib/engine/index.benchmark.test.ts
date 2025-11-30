/**
 * PERFORMANCE BENCHMARKS FOR 30-YEAR CALCULATION ENGINE
 *
 * This file tests the performance requirements for Phase 2:
 * - 30-year calculation completes in <1 second (target: <1000ms)
 * - Per-year calculation averages <40ms
 * - Circular solver converges in <100 iterations
 * - Typical convergence in <10 iterations per year
 *
 * Run with: pnpm vitest run src/lib/engine/index.benchmark.ts
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
} from "./core/types";
import { RentModel } from "./core/types";

// ============================================================================
// BENCHMARK TEST DATA HELPERS
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
    revenue: new Decimal(45000000), // 45M SAR
    rent: new Decimal(9000000), // 9M SAR
    staffCosts: new Decimal(18000000), // 18M SAR
    otherOpex: new Decimal(4500000), // 4.5M SAR
    depreciation: new Decimal(1800000), // 1.8M SAR
    interest: new Decimal(900000), // 900K SAR
    zakat: new Decimal(270000), // 270K SAR
  };

  const baseBS2023 = {
    cash: new Decimal(4500000), // 4.5M SAR
    accountsReceivable: new Decimal(4500000), // 10% of revenue
    prepaidExpenses: new Decimal(1575000), // 5% of opex
    grossPPE: new Decimal(36000000), // 36M SAR (gross = net + accDep)
    ppe: new Decimal(27000000), // 27M SAR (net)
    accumulatedDepreciation: new Decimal(9000000), // 9M SAR
    accountsPayable: new Decimal(2520000), // 8% of opex
    accruedExpenses: new Decimal(1575000), // 5% of opex
    deferredRevenue: new Decimal(6750000), // 15% of revenue
    debt: new Decimal(18000000), // 18M SAR
    equity: new Decimal(8730000), // Balancing figure
  };

  const basePL2024 = {
    revenue: new Decimal(50000000), // 50M SAR
    rent: new Decimal(10000000), // 10M SAR
    staffCosts: new Decimal(20000000), // 20M SAR
    otherOpex: new Decimal(5000000), // 5M SAR
    depreciation: new Decimal(2000000), // 2M SAR
    interest: new Decimal(1000000), // 1M SAR
    zakat: new Decimal(300000), // 300K SAR
  };

  const baseBS2024 = {
    cash: new Decimal(5000000), // 5M SAR
    accountsReceivable: new Decimal(5000000), // 10% of revenue
    prepaidExpenses: new Decimal(1750000), // 5% of opex
    grossPPE: new Decimal(40000000), // 40M SAR (gross = net + accDep)
    ppe: new Decimal(30000000), // 30M SAR (net)
    accumulatedDepreciation: new Decimal(10000000), // 10M SAR
    accountsPayable: new Decimal(2800000), // 8% of opex
    accruedExpenses: new Decimal(1750000), // 5% of opex
    deferredRevenue: new Decimal(7500000), // 15% of revenue
    debt: new Decimal(20000000), // 20M SAR
    equity: new Decimal(9700000), // Balancing figure
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
 * Create realistic transition period inputs (2025-2027)
 */
function createTransitionPeriods(): TransitionPeriodInput[] {
  return [
    {
      year: 2025,
      preFillFromPriorYear: false,
      revenueGrowthRate: new Decimal(0.1), // 10% growth
    },
    {
      year: 2026,
      preFillFromPriorYear: false,
      revenueGrowthRate: new Decimal(0.12), // 12% growth
    },
    {
      year: 2027,
      preFillFromPriorYear: false,
      revenueGrowthRate: new Decimal(0.15), // 15% growth
    },
  ];
}

/**
 * Create complete calculation engine input for benchmarking
 */
function createBenchmarkInput(rentModel: RentModel): CalculationEngineInput {
  const systemConfig = createSystemConfig();
  const historicalPeriods = createHistoricalPeriods();
  const transitionPeriods = createTransitionPeriods();

  // Working capital ratios from 2024
  const workingCapitalRatios = {
    arPercent: new Decimal(0.1), // 10%
    prepaidPercent: new Decimal(0.05), // 5%
    apPercent: new Decimal(0.08), // 8%
    accruedPercent: new Decimal(0.05), // 5%
    deferredRevenuePercent: new Decimal(0.15), // 15%
    otherRevenueRatio: new Decimal(0.05), // 5% other revenue
    locked: false,
    calculatedFrom2024: true,
  };

  // Rent model parameters
  const rentParams =
    rentModel === RentModel.FIXED_ESCALATION
      ? {
          baseRent: new Decimal(10000000), // 10M SAR
          growthRate: new Decimal(0.03), // 3% escalation
          frequency: 1,
        }
      : rentModel === RentModel.REVENUE_SHARE
        ? {
            revenueSharePercent: new Decimal(0.2), // 20% of revenue
          }
        : {
            // PARTNER_INVESTMENT
            landSize: new Decimal(10000),
            landPricePerSqm: new Decimal(5000),
            buaSize: new Decimal(20000),
            constructionCostPerSqm: new Decimal(2500),
            yieldRate: new Decimal(0.09),
            growthRate: new Decimal(0.02),
            frequency: 1,
          };

  // Dynamic period configuration (2028-2053)
  const dynamicPeriodConfig: DynamicPeriodInput = {
    year: 2028, // Will be overridden in loop
    enrollment: {
      rampUpEnabled: true,
      rampUpStartYear: 2028,
      rampUpEndYear: 2033, // 5 years ramp-up
      rampUpTargetStudents: 3000,
      steadyStateStudents: 3000,
      gradeDistribution: [], // Simplified for benchmarks
    },
    curriculum: {
      ibProgramEnabled: true,
      ibStartYear: 2030,
      nationalCurriculumFee: new Decimal(25000), // 25K SAR
      ibCurriculumFee: new Decimal(45000), // 45K SAR
      ibStudentPercentage: new Decimal(0.3), // 30% adopt IB
    },
    staff: {
      fixedStaffCost: new Decimal(15000000), // 15M SAR base
      variableStaffCostPerStudent: new Decimal(8000), // 8K per student
    },
    rentModel,
    rentParams,
    otherOpexPercent: new Decimal(0.10), // 10% of revenue
    capexConfig: {
      categories: [
        {
          id: "cat-building",
          type: "BUILDING" as const,
          name: "Building",
          usefulLife: 20,
          reinvestFrequency: 1,
          reinvestAmount: new Decimal(2500000),
          reinvestStartYear: 2028,
        },
      ],
      historicalState: {
        grossPPE2024: new Decimal(40000000),
        accumulatedDepreciation2024: new Decimal(10000000),
        annualDepreciation: new Decimal(1000000),
        remainingToDepreciate: new Decimal(30000000),
      },
      transitionCapex: [],
      virtualAssets: [],
    },
  };

  // CapEx configuration
  const capexConfig = {
    categories: [
      {
        id: "cat-building",
        type: "BUILDING" as const,
        name: "Building",
        usefulLife: 20,
        reinvestFrequency: 1,
        reinvestAmount: new Decimal(2500000),
        reinvestStartYear: 2028,
      },
    ],
    historicalState: {
      grossPPE2024: new Decimal(40000000),
      accumulatedDepreciation2024: new Decimal(10000000),
      annualDepreciation: new Decimal(1000000),
      remainingToDepreciate: new Decimal(30000000),
    },
    transitionCapex: [],
    virtualAssets: [],
  };

  const circularSolverConfig = {
    maxIterations: 100,
    convergenceTolerance: new Decimal(0.01), // $0.01
    relaxationFactor: new Decimal(0.5),
  };

  return {
    systemConfig,
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
// PERFORMANCE BENCHMARKS
// ============================================================================

describe("Performance Benchmarks - 30-Year Calculation Engine", () => {
  // Performance targets
  const MAX_TOTAL_TIME_MS = 1000; // <1 second for 30 years
  const MAX_AVG_TIME_PER_YEAR_MS = 40; // <40ms per year average
  const MAX_ITERATIONS_TOTAL = 100 * 30; // <100 iterations per year
  const TYPICAL_ITERATIONS_PER_YEAR = 10; // Typical: <10 iterations

  describe("Fixed Escalation Rent Model", () => {
    it("should complete 30-year calculation in <1 second", async () => {
      const input = createBenchmarkInput(RentModel.FIXED_ESCALATION);

      const startTime = performance.now();
      const result = await calculateFinancialProjections(input);
      const endTime = performance.now();

      const totalTimeMs = endTime - startTime;
      const avgTimePerYear = totalTimeMs / result.periods.length;

      console.log("\n📊 Fixed Escalation Rent Model - Performance Results:");
      console.log(
        `   Total Time: ${totalTimeMs.toFixed(2)}ms (target: <${MAX_TOTAL_TIME_MS}ms)`,
      );
      console.log(
        `   Avg Time/Year: ${avgTimePerYear.toFixed(2)}ms (target: <${MAX_AVG_TIME_PER_YEAR_MS}ms)`,
      );
      console.log(
        `   Total Iterations: ${result.performance.totalIterations} (target: <${MAX_ITERATIONS_TOTAL})`,
      );
      console.log(
        `   Avg Iterations/Year: ${result.performance.averageIterationsPerYear.toFixed(1)} (typical: <${TYPICAL_ITERATIONS_PER_YEAR})`,
      );
      console.log(`   Periods Calculated: ${result.periods.length} years`);

      // Performance assertions
      expect(totalTimeMs).toBeLessThan(MAX_TOTAL_TIME_MS);
      expect(avgTimePerYear).toBeLessThan(MAX_AVG_TIME_PER_YEAR_MS);
      expect(result.performance.totalIterations).toBeLessThan(
        MAX_ITERATIONS_TOTAL,
      );

      // Validate all periods calculated
      expect(result.periods).toHaveLength(31); // 2023-2053 = 31 years (including historical 2023)

      // Validate balance sheet balancing
      expect(result.validation.allPeriodsBalanced).toBe(true);
      expect(result.validation.allCashFlowsReconciled).toBe(true);
    });
  });

  describe("Revenue Share Rent Model", () => {
    it("should complete 30-year calculation in <1 second", async () => {
      const input = createBenchmarkInput(RentModel.REVENUE_SHARE);

      const startTime = performance.now();
      const result = await calculateFinancialProjections(input);
      const endTime = performance.now();

      const totalTimeMs = endTime - startTime;
      const avgTimePerYear = totalTimeMs / result.periods.length;

      console.log("\n📊 Revenue Share Rent Model - Performance Results:");
      console.log(
        `   Total Time: ${totalTimeMs.toFixed(2)}ms (target: <${MAX_TOTAL_TIME_MS}ms)`,
      );
      console.log(
        `   Avg Time/Year: ${avgTimePerYear.toFixed(2)}ms (target: <${MAX_AVG_TIME_PER_YEAR_MS}ms)`,
      );
      console.log(
        `   Total Iterations: ${result.performance.totalIterations} (target: <${MAX_ITERATIONS_TOTAL})`,
      );
      console.log(
        `   Avg Iterations/Year: ${result.performance.averageIterationsPerYear.toFixed(1)} (typical: <${TYPICAL_ITERATIONS_PER_YEAR})`,
      );
      console.log(`   Periods Calculated: ${result.periods.length} years`);

      // Performance assertions
      expect(totalTimeMs).toBeLessThan(MAX_TOTAL_TIME_MS);
      expect(avgTimePerYear).toBeLessThan(MAX_AVG_TIME_PER_YEAR_MS);
      expect(result.performance.totalIterations).toBeLessThan(
        MAX_ITERATIONS_TOTAL,
      );

      // Validate all periods calculated
      expect(result.periods).toHaveLength(31);

      // Validate balance sheet balancing
      expect(result.validation.allPeriodsBalanced).toBe(true);
      expect(result.validation.allCashFlowsReconciled).toBe(true);
    });
  });

  describe("Partner Investment Rent Model", () => {
    it("should complete 30-year calculation in <1 second", async () => {
      const input = createBenchmarkInput(RentModel.PARTNER_INVESTMENT);

      const startTime = performance.now();
      const result = await calculateFinancialProjections(input);
      const endTime = performance.now();

      const totalTimeMs = endTime - startTime;
      const avgTimePerYear = totalTimeMs / result.periods.length;

      console.log("\n📊 Partner Investment Rent Model - Performance Results:");
      console.log(
        `   Total Time: ${totalTimeMs.toFixed(2)}ms (target: <${MAX_TOTAL_TIME_MS}ms)`,
      );
      console.log(
        `   Avg Time/Year: ${avgTimePerYear.toFixed(2)}ms (target: <${MAX_AVG_TIME_PER_YEAR_MS}ms)`,
      );
      console.log(
        `   Total Iterations: ${result.performance.totalIterations} (target: <${MAX_ITERATIONS_TOTAL})`,
      );
      console.log(
        `   Avg Iterations/Year: ${result.performance.averageIterationsPerYear.toFixed(1)} (typical: <${TYPICAL_ITERATIONS_PER_YEAR})`,
      );
      console.log(`   Periods Calculated: ${result.periods.length} years`);

      // Performance assertions
      expect(totalTimeMs).toBeLessThan(MAX_TOTAL_TIME_MS);
      expect(avgTimePerYear).toBeLessThan(MAX_AVG_TIME_PER_YEAR_MS);
      expect(result.performance.totalIterations).toBeLessThan(
        MAX_ITERATIONS_TOTAL,
      );

      // Validate all periods calculated
      expect(result.periods).toHaveLength(31);

      // Validate balance sheet balancing
      expect(result.validation.allPeriodsBalanced).toBe(true);
      expect(result.validation.allCashFlowsReconciled).toBe(true);
    });
  });

  describe("Stress Test - Multiple Runs", () => {
    it("should maintain consistent performance across multiple runs", async () => {
      const input = createBenchmarkInput(RentModel.FIXED_ESCALATION);
      const runs = 5;
      const timings: number[] = [];

      console.log(`\n📊 Running ${runs} consecutive calculations...`);

      for (let i = 0; i < runs; i++) {
        const startTime = performance.now();
        await calculateFinancialProjections(input);
        const endTime = performance.now();
        timings.push(endTime - startTime);
      }

      const avgTime = timings.reduce((a, b) => a + b, 0) / runs;
      const maxTime = Math.max(...timings);
      const minTime = Math.min(...timings);

      console.log(`   Average Time: ${avgTime.toFixed(2)}ms`);
      console.log(`   Min Time: ${minTime.toFixed(2)}ms`);
      console.log(`   Max Time: ${maxTime.toFixed(2)}ms`);
      console.log(
        `   Std Dev: ${Math.sqrt(timings.map((t) => Math.pow(t - avgTime, 2)).reduce((a, b) => a + b, 0) / runs).toFixed(2)}ms`,
      );

      // All runs should be under target
      timings.forEach((time) => {
        expect(time).toBeLessThan(MAX_TOTAL_TIME_MS);
      });

      // Average should be well under target
      expect(avgTime).toBeLessThan(MAX_TOTAL_TIME_MS * 0.9); // 90% of target
    });
  });

  describe("Performance Summary Report", () => {
    it("should generate comprehensive performance report", async () => {
      const rentModels: RentModel[] = [
        RentModel.FIXED_ESCALATION,
        RentModel.REVENUE_SHARE,
        RentModel.PARTNER_INVESTMENT,
      ];
      const results: Record<string, any> = {};

      console.log("\n" + "=".repeat(80));
      console.log("🎯 COMPREHENSIVE PERFORMANCE BENCHMARK REPORT");
      console.log("=".repeat(80));

      for (const rentModel of rentModels) {
        const input = createBenchmarkInput(rentModel);
        const startTime = performance.now();
        const result = await calculateFinancialProjections(input);
        const endTime = performance.now();

        results[rentModel] = {
          totalTimeMs: endTime - startTime,
          avgTimePerYear: (endTime - startTime) / result.periods.length,
          totalIterations: result.performance.totalIterations,
          avgIterationsPerYear: result.performance.averageIterationsPerYear,
          periodsCount: result.periods.length,
          allBalanced: result.validation.allPeriodsBalanced,
          allReconciled: result.validation.allCashFlowsReconciled,
          maxBalanceDiff: result.validation.maxBalanceDifference.toNumber(),
          maxCashDiff: result.validation.maxCashDifference.toNumber(),
        };
      }

      console.log("\n📊 Performance Metrics by Rent Model:");
      console.log("-".repeat(80));
      console.log(
        "Metric".padEnd(30) + rentModels.map((m) => m.padEnd(20)).join(""),
      );
      console.log("-".repeat(80));

      console.log(
        "Total Time (ms)".padEnd(30) +
          rentModels
            .map((m) => results[m].totalTimeMs.toFixed(2).padEnd(20))
            .join(""),
      );
      console.log(
        "Avg Time/Year (ms)".padEnd(30) +
          rentModels
            .map((m) => results[m].avgTimePerYear.toFixed(2).padEnd(20))
            .join(""),
      );
      console.log(
        "Total Iterations".padEnd(30) +
          rentModels
            .map((m) => results[m].totalIterations.toString().padEnd(20))
            .join(""),
      );
      console.log(
        "Avg Iterations/Year".padEnd(30) +
          rentModels
            .map((m) => results[m].avgIterationsPerYear.toFixed(1).padEnd(20))
            .join(""),
      );
      console.log(
        "All Balanced".padEnd(30) +
          rentModels
            .map((m) =>
              (results[m].allBalanced ? "✅ Yes" : "❌ No").padEnd(20),
            )
            .join(""),
      );
      console.log(
        "All Reconciled".padEnd(30) +
          rentModels
            .map((m) =>
              (results[m].allReconciled ? "✅ Yes" : "❌ No").padEnd(20),
            )
            .join(""),
      );
      console.log(
        "Max Balance Diff".padEnd(30) +
          rentModels
            .map((m) => `$${results[m].maxBalanceDiff.toFixed(2)}`.padEnd(20))
            .join(""),
      );
      console.log(
        "Max Cash Diff".padEnd(30) +
          rentModels
            .map((m) => `$${results[m].maxCashDiff.toFixed(2)}`.padEnd(20))
            .join(""),
      );

      console.log("\n✅ SUCCESS CRITERIA VALIDATION:");
      console.log("-".repeat(80));
      console.log(
        `   ✅ 30-year calculation <1 second: ${rentModels.every((m) => results[m].totalTimeMs < MAX_TOTAL_TIME_MS) ? "PASSED" : "FAILED"}`,
      );
      console.log(
        `   ✅ Avg time per year <40ms: ${rentModels.every((m) => results[m].avgTimePerYear < MAX_AVG_TIME_PER_YEAR_MS) ? "PASSED" : "FAILED"}`,
      );
      console.log(
        `   ✅ Balance sheet balances (all): ${rentModels.every((m) => results[m].allBalanced) ? "PASSED" : "FAILED"}`,
      );
      console.log(
        `   ✅ Cash flow reconciles (all): ${rentModels.every((m) => results[m].allReconciled) ? "PASSED" : "FAILED"}`,
      );
      console.log(
        `   ✅ Max balance diff <$0.01: ${rentModels.every((m) => results[m].maxBalanceDiff < 0.01) ? "PASSED" : "FAILED"}`,
      );
      console.log(
        `   ✅ Max cash diff <$0.01: ${rentModels.every((m) => results[m].maxCashDiff < 0.01) ? "PASSED" : "FAILED"}`,
      );
      console.log("=".repeat(80));

      // All models should pass performance criteria
      rentModels.forEach((model) => {
        expect(results[model].totalTimeMs).toBeLessThan(MAX_TOTAL_TIME_MS);
        expect(results[model].allBalanced).toBe(true);
        expect(results[model].allReconciled).toBe(true);
      });
    });
  });
});
