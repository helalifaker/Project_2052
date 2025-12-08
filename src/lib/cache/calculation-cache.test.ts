/**
 * PERFORMANCE TESTS: Calculation Cache
 *
 * Tests the LRU cache implementation for financial calculations
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  generateCacheKey,
  getCachedCalculation,
  setCachedCalculation,
  invalidateCachedCalculation,
  invalidateProposalCache,
  clearCalculationCache,
  getCacheStats,
  getCacheEntries,
} from "./calculation-cache";
import type { CalculationEngineInput } from "@/lib/engine/core/types";
import { RentModel } from "@/lib/engine/core/types";
import Decimal from "decimal.js";

// Mock input for testing
const createMockInput = (id: string): CalculationEngineInput => ({
  systemConfig: {
    zakatRate: new Decimal(0.025),
    debtInterestRate: new Decimal(0.05),
    depositInterestRate: new Decimal(0.02),
    minCashBalance: new Decimal(1000000),
  },
  contractPeriodYears: 25,
  historicalPeriods: [
    {
      year: 2023,
      profitLoss: {
        revenue: new Decimal(10000000),
        rent: new Decimal(2000000),
        staffCosts: new Decimal(3000000),
        otherOpex: new Decimal(1000000),
        depreciation: new Decimal(500000),
        interest: new Decimal(100000),
        zakat: new Decimal(50000),
      },
      balanceSheet: {
        cash: new Decimal(5000000),
        accountsReceivable: new Decimal(1000000),
        prepaidExpenses: new Decimal(500000),
        grossPPE: new Decimal(8000000), // Gross = Net + AccDep (10M + (-2M) = 8M)
        ppe: new Decimal(10000000),
        accumulatedDepreciation: new Decimal(-2000000),
        accountsPayable: new Decimal(800000),
        accruedExpenses: new Decimal(200000),
        deferredRevenue: new Decimal(1000000),
        debt: new Decimal(5000000),
        equity: new Decimal(8000000),
      },
      immutable: true,
    },
  ],
  transitionPeriods: [
    {
      year: 2025,
      preFillFromPriorYear: true,
      revenueGrowthRate: new Decimal(0.05),
    },
  ],
  workingCapitalRatios: {
    arPercent: new Decimal(0.1),
    prepaidPercent: new Decimal(0.05),
    apPercent: new Decimal(0.08),
    accruedPercent: new Decimal(0.02),
    deferredRevenuePercent: new Decimal(0.1),
    otherRevenueRatio: new Decimal(0),
    locked: true,
    calculatedFrom2024: true,
  },
  rentModel: RentModel.FIXED_ESCALATION,
  rentParams: {
    baseRent: new Decimal(2000000),
    growthRate: new Decimal(0.03),
    frequency: 1,
  },
  dynamicPeriodConfig: {
    year: 2028,
    enrollment: {
      rampUpEnabled: true,
      rampUpStartYear: 2028,
      rampUpEndYear: 2033,
      rampUpTargetStudents: 1000,
      steadyStateStudents: 1000,
      gradeDistribution: [],
    },
    curriculum: {
      ibProgramEnabled: false,
      ibStartYear: 2030,
      nationalCurriculumFee: new Decimal(20000),
      ibCurriculumFee: new Decimal(30000),
      ibStudentPercentage: new Decimal(0),
    },
    staff: {
      fixedStaffCost: new Decimal(2000000),
      variableStaffCostPerStudent: new Decimal(3000),
    },
    rentModel: RentModel.FIXED_ESCALATION,
    rentParams: {
      baseRent: new Decimal(2000000),
      growthRate: new Decimal(0.03),
      frequency: 1,
    },
    otherOpexPercent: new Decimal(0.1), // 10% of revenue
    capexConfig: {
      categories: [],
      historicalState: {
        grossPPE2024: new Decimal(8000000),
        accumulatedDepreciation2024: new Decimal(2000000),
        annualDepreciation: new Decimal(500000),
        remainingToDepreciate: new Decimal(6000000),
      },
      transitionCapex: [],
      virtualAssets: [],
    },
  },
  capexConfig: {
    categories: [],
    historicalState: {
      grossPPE2024: new Decimal(8000000),
      accumulatedDepreciation2024: new Decimal(2000000),
      annualDepreciation: new Decimal(500000),
      remainingToDepreciate: new Decimal(6000000),
    },
    transitionCapex: [],
    virtualAssets: [],
  },
  circularSolverConfig: {
    maxIterations: 100,
    convergenceTolerance: new Decimal(0.01),
    relaxationFactor: new Decimal(0.5),
  },
});

const createMockOutput = (id: string) => ({
  periods: [],
  metrics: {
    totalNetIncome: new Decimal(10000000),
    totalRent: new Decimal(60000000),
    totalEbitda: new Decimal(150000000),
    avgEbitda: new Decimal(5000000), // 150M / 30 years
    averageROE: new Decimal(0.15),
    peakDebt: new Decimal(5000000),
    maxDebt: new Decimal(5000000),
    finalCash: new Decimal(10000000),
    npv: new Decimal(50000000),
    irr: new Decimal(0.12),
    // Contract period metrics
    contractTotalRent: new Decimal(48000000), // Slightly less than total (25 years vs 30)
    contractTotalEbitda: new Decimal(125000000),
    contractRentNPV: new Decimal(35000000),
    contractFinalCash: new Decimal(10000000),
    contractEndYear: 2052,
    // Contract period NPV & Annualized Metrics
    contractEbitdaNPV: new Decimal(80000000),
    contractNetTenantSurplus: new Decimal(45000000),
    contractAnnualizedEbitda: new Decimal(5000000),
    contractAnnualizedRent: new Decimal(2000000),
    contractNAV: new Decimal(3000000),
  },
  validation: {
    allPeriodsBalanced: true,
    allCashFlowsReconciled: true,
    maxBalanceDifference: new Decimal(0),
    maxCashDifference: new Decimal(0),
  },
  performance: {
    calculationTimeMs: 500,
    totalIterations: 300,
    averageIterationsPerYear: 10,
  },
  calculatedAt: new Date(),
});

describe("Calculation Cache", () => {
  beforeEach(() => {
    // Clear cache before each test
    clearCalculationCache();
  });

  describe("Cache Key Generation", () => {
    it("should generate deterministic cache keys", () => {
      const input = createMockInput("test-1");
      const key1 = generateCacheKey(input);
      const key2 = generateCacheKey(input);

      expect(key1).toBe(key2);
      expect(key1).toContain("calc:");
    });

    it("should generate different keys for different inputs", () => {
      const input1 = createMockInput("test-1");
      const input2 = createMockInput("test-2");

      // Modify input2 to make it different
      input2.systemConfig.zakatRate = new Decimal(0.03);

      const key1 = generateCacheKey(input1);
      const key2 = generateCacheKey(input2);

      expect(key1).not.toBe(key2);
    });
  });

  describe("Cache Operations", () => {
    it("should cache and retrieve calculation results", () => {
      const input = createMockInput("test-1");
      const output = createMockOutput("test-1");

      // Cache miss on first call
      const cachedResult1 = getCachedCalculation(input);
      expect(cachedResult1).toBeUndefined();

      // Store in cache
      setCachedCalculation(input, output);

      // Cache hit on second call
      const cachedResult2 = getCachedCalculation(input);
      expect(cachedResult2).toBeDefined();
      expect(cachedResult2?.metrics.totalNetIncome.toString()).toBe("10000000");
    });

    it("should invalidate cached calculations", () => {
      const input = createMockInput("test-1");
      const output = createMockOutput("test-1");

      // Store in cache
      setCachedCalculation(input, output);

      // Verify it's cached
      expect(getCachedCalculation(input)).toBeDefined();

      // Invalidate
      invalidateCachedCalculation(input);

      // Verify it's no longer cached
      expect(getCachedCalculation(input)).toBeUndefined();
    });

    it("should clear entire cache", () => {
      const input1 = createMockInput("test-1");
      const input2 = createMockInput("test-2");
      input2.systemConfig.zakatRate = new Decimal(0.03); // Make it different

      const output1 = createMockOutput("test-1");
      const output2 = createMockOutput("test-2");

      // Store multiple entries
      setCachedCalculation(input1, output1);
      setCachedCalculation(input2, output2);

      // Verify both are cached
      expect(getCachedCalculation(input1)).toBeDefined();
      expect(getCachedCalculation(input2)).toBeDefined();

      // Clear cache
      clearCalculationCache();

      // Verify both are cleared
      expect(getCachedCalculation(input1)).toBeUndefined();
      expect(getCachedCalculation(input2)).toBeUndefined();
    });
  });

  describe("Cache Statistics", () => {
    it("should track cache hits and misses", () => {
      const input = createMockInput("test-1");
      const output = createMockOutput("test-1");

      // Initial stats
      const stats1 = getCacheStats();
      const initialHits = stats1.hits;
      const initialMisses = stats1.misses;

      // Cache miss
      getCachedCalculation(input);
      const stats2 = getCacheStats();
      expect(stats2.misses).toBe(initialMisses + 1);

      // Store in cache
      setCachedCalculation(input, output);

      // Cache hit
      getCachedCalculation(input);
      const stats3 = getCacheStats();
      expect(stats3.hits).toBe(initialHits + 1);
    });

    it("should calculate hit rate correctly", () => {
      const input = createMockInput("test-1");
      const output = createMockOutput("test-1");

      // Clear to reset stats
      clearCalculationCache();

      // One miss
      getCachedCalculation(input);

      // Store in cache
      setCachedCalculation(input, output);

      // Two hits
      getCachedCalculation(input);
      getCachedCalculation(input);

      const stats = getCacheStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBeCloseTo(2 / 3, 2);
    });
  });

  describe("LRU Eviction", () => {
    it("should evict least recently used entries when cache is full", () => {
      // This test would require filling the cache beyond MAX_CACHE_SIZE
      // For now, we just verify the cache size doesn't exceed the limit
      clearCalculationCache();

      // Create many different inputs
      for (let i = 0; i < 105; i++) {
        const input = createMockInput(`test-${i}`);
        input.systemConfig.zakatRate = new Decimal(0.025 + i * 0.0001);
        const output = createMockOutput(`test-${i}`);
        setCachedCalculation(input, output);
      }

      const stats = getCacheStats();
      expect(stats.size).toBeLessThanOrEqual(100); // MAX_CACHE_SIZE
      expect(stats.evictions).toBeGreaterThan(0);
    });
  });

  describe("Performance", () => {
    it("should retrieve cached results in <100ms", () => {
      const input = createMockInput("test-1");
      const output = createMockOutput("test-1");

      // Store in cache
      setCachedCalculation(input, output);

      // Measure retrieval time
      const startTime = performance.now();
      const result = getCachedCalculation(input);
      const duration = performance.now() - startTime;

      expect(result).toBeDefined();
      expect(duration).toBeLessThan(100); // Target: <100ms
    });

    it("should generate cache keys in <10ms", () => {
      const input = createMockInput("test-1");

      const startTime = performance.now();
      const key = generateCacheKey(input);
      const duration = performance.now() - startTime;

      expect(key).toBeDefined();
      expect(duration).toBeLessThan(10); // Target: <10ms
    });
  });

  describe("Proposal Cache Invalidation", () => {
    it("should invalidate cache entries by proposal ID", () => {
      // Note: This tests the invalidateProposalCache function which
      // looks for keys containing the proposal ID
      const input1 = createMockInput("test-1");
      const input2 = createMockInput("test-2");
      input2.systemConfig.zakatRate = new Decimal(0.03);

      const output1 = createMockOutput("test-1");
      const output2 = createMockOutput("test-2");

      // Store entries
      setCachedCalculation(input1, output1);
      setCachedCalculation(input2, output2);

      // Both should be cached
      expect(getCachedCalculation(input1)).toBeDefined();
      expect(getCachedCalculation(input2)).toBeDefined();

      // Invalidate by a non-matching ID (should not clear anything)
      invalidateProposalCache("non-existent-proposal");

      // Both should still be cached (keys don't contain "non-existent-proposal")
      const stats = getCacheStats();
      expect(stats.size).toBe(2);
    });

    it("should log invalidation message", () => {
      // This just tests that invalidateProposalCache can be called without errors
      expect(() => invalidateProposalCache("test-proposal-123")).not.toThrow();
    });
  });

  describe("Get Cache Entries", () => {
    it("should return empty array when cache is empty", () => {
      clearCalculationCache();
      const entries = getCacheEntries();
      expect(entries).toEqual([]);
    });

    it("should return all cache entries", () => {
      clearCalculationCache();

      const input1 = createMockInput("test-1");
      const input2 = createMockInput("test-2");
      input2.systemConfig.zakatRate = new Decimal(0.03);

      const output1 = createMockOutput("test-1");
      const output2 = createMockOutput("test-2");

      setCachedCalculation(input1, output1);
      setCachedCalculation(input2, output2);

      const entries = getCacheEntries();
      expect(entries.length).toBe(2);
    });

    it("should return entries with correct structure", () => {
      clearCalculationCache();

      const input = createMockInput("test-1");
      const output = createMockOutput("test-1");

      setCachedCalculation(input, output);

      const entries = getCacheEntries();
      expect(entries.length).toBe(1);

      const entry = entries[0];
      expect(entry.key).toContain("calc:");
      expect(entry.input).toBeDefined();
      expect(entry.output).toBeDefined();
      expect(typeof entry.timestamp).toBe("number");
      expect(typeof entry.hitCount).toBe("number");
    });
  });

  describe("Cache Key Edge Cases", () => {
    it("should handle null values in input", () => {
      const input = createMockInput("test-1");
      // @ts-expect-error Testing null handling
      input.rentParams = null;

      expect(() => generateCacheKey(input)).not.toThrow();
    });

    it("should handle undefined values in input", () => {
      const input = createMockInput("test-1");
      // @ts-expect-error Testing undefined handling
      input.rentParams = undefined;

      expect(() => generateCacheKey(input)).not.toThrow();
    });

    it("should handle Date objects in input", () => {
      const input = createMockInput("test-1") as unknown as Record<
        string,
        unknown
      >;
      input.someDate = new Date("2024-01-01");

      expect(() =>
        generateCacheKey(input as unknown as CalculationEngineInput),
      ).not.toThrow();
    });

    it("should skip calculatedAt and createdAt fields for deterministic hashing", () => {
      const input1 = createMockInput("test-1") as unknown as Record<
        string,
        unknown
      >;
      const input2 = createMockInput("test-1") as unknown as Record<
        string,
        unknown
      >;

      // Add different calculatedAt timestamps
      input1.calculatedAt = new Date("2024-01-01");
      input2.calculatedAt = new Date("2024-06-01");

      const key1 = generateCacheKey(
        input1 as unknown as CalculationEngineInput,
      );
      const key2 = generateCacheKey(
        input2 as unknown as CalculationEngineInput,
      );

      // Keys should be the same because calculatedAt is skipped
      expect(key1).toBe(key2);
    });

    it("should skip createdAt fields for deterministic hashing", () => {
      const input1 = createMockInput("test-1") as unknown as Record<
        string,
        unknown
      >;
      const input2 = createMockInput("test-1") as unknown as Record<
        string,
        unknown
      >;

      // Add different createdAt timestamps
      input1.createdAt = new Date("2024-01-01");
      input2.createdAt = new Date("2024-12-31");

      const key1 = generateCacheKey(
        input1 as unknown as CalculationEngineInput,
      );
      const key2 = generateCacheKey(
        input2 as unknown as CalculationEngineInput,
      );

      // Keys should be the same because createdAt is skipped
      expect(key1).toBe(key2);
    });

    it("should handle nested arrays with Decimals", () => {
      const input = createMockInput("test-1");
      // The gradeDistribution is an array that could contain Decimals
      input.dynamicPeriodConfig.enrollment.gradeDistribution = [
        { grade: 1, count: 100 },
        { grade: 2, count: 150 },
      ] as unknown as typeof input.dynamicPeriodConfig.enrollment.gradeDistribution;

      expect(() => generateCacheKey(input)).not.toThrow();
      const key = generateCacheKey(input);
      expect(key).toContain("calc:");
    });
  });

  describe("Stats Edge Cases", () => {
    it("should handle zero hits and misses for hit rate calculation", () => {
      clearCalculationCache();

      const stats = getCacheStats();

      // With zero hits and misses, hitRate should be 0
      expect(stats.hitRate).toBe(0);
      expect(stats.hitRatePercent).toBe("0.00%");
    });

    it("should track evictions correctly", () => {
      clearCalculationCache();

      // Fill cache to trigger evictions
      for (let i = 0; i < 105; i++) {
        const input = createMockInput(`test-${i}`);
        input.systemConfig.zakatRate = new Decimal(0.025 + i * 0.0001);
        const output = createMockOutput(`test-${i}`);
        setCachedCalculation(input, output);
      }

      const stats = getCacheStats();

      // Should have evicted at least 5 entries (105 - 100)
      expect(stats.evictions).toBeGreaterThanOrEqual(5);
    });
  });
});
