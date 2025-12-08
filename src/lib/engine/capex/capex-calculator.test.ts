/**
 * CAPEX CALCULATOR TESTS
 *
 * Tests the category-based capital expenditure calculations with:
 * - Historical depreciation continuation
 * - New asset depreciation (virtual assets)
 * - Auto-reinvestment by category frequency
 * - PPE tracking across all periods
 */

import { describe, it, expect } from "vitest";
import Decimal from "decimal.js";
import {
  calculateHistoricalDepreciation,
  updateHistoricalDepreciationState,
  calculateAssetDepreciation,
  calculateNewAssetDepreciation,
  isReinvestmentDue,
  calculateCapexSpending,
  createVirtualAsset,
  generateVirtualAssetsForYear,
  calculateCapexYearResult,
  generateCapexSchedule,
  validateCapexConfig,
  getReinvestmentSchedule,
} from "./capex-calculator";
import {
  CapExCategoryType,
  type CapExCategoryConfig,
  type CapExConfiguration,
  type CapExVirtualAsset,
  type HistoricalDepreciationState,
} from "@/lib/engine/core/types";
import { ZERO, ONE } from "@/lib/engine/core/constants";

// ============================================================================
// TEST HELPERS
// ============================================================================

const createMockHistoricalState = (
  overrides: Partial<HistoricalDepreciationState> = {},
): HistoricalDepreciationState => ({
  grossPPE2024: new Decimal(30000000),
  accumulatedDepreciation2024: new Decimal(10000000),
  annualDepreciation: new Decimal(2000000),
  remainingToDepreciate: new Decimal(20000000),
  ...overrides,
});

const createMockCategory = (
  type: CapExCategoryType,
  overrides: Partial<CapExCategoryConfig> = {},
): CapExCategoryConfig => ({
  id: `cat-${type}`,
  type,
  name: type.replace("_", " "),
  usefulLife: 5,
  ...overrides,
});

const createMockVirtualAsset = (
  categoryType: CapExCategoryType,
  purchaseYear: number,
  amount: Decimal,
  overrides: Partial<CapExVirtualAsset> = {},
): CapExVirtualAsset => ({
  id: `asset-${categoryType}-${purchaseYear}`,
  categoryType,
  purchaseYear,
  purchaseAmount: amount,
  usefulLife: 5,
  ...overrides,
});

const createMockCapexConfig = (
  overrides: Partial<CapExConfiguration> = {},
): CapExConfiguration => ({
  categories: [
    createMockCategory(CapExCategoryType.IT_EQUIPMENT, {
      usefulLife: 5,
      reinvestFrequency: 5,
      reinvestAmount: new Decimal(1000000),
    }),
    createMockCategory(CapExCategoryType.FURNITURE, {
      usefulLife: 10,
      reinvestFrequency: 10,
      reinvestAmount: new Decimal(500000),
    }),
    createMockCategory(CapExCategoryType.EDUCATIONAL_EQUIPMENT, {
      usefulLife: 7,
      reinvestFrequency: 7,
      reinvestAmount: new Decimal(750000),
    }),
    createMockCategory(CapExCategoryType.BUILDING, {
      usefulLife: 25,
      // No auto-reinvestment for building
    }),
  ],
  historicalState: createMockHistoricalState(),
  transitionCapex: [],
  virtualAssets: [],
  ...overrides,
});

describe("CAPEX Calculator", () => {
  // ============================================================================
  // HISTORICAL DEPRECIATION TESTS
  // ============================================================================

  describe("calculateHistoricalDepreciation", () => {
    it("should return annual depreciation when there is remaining amount", () => {
      const state = createMockHistoricalState({
        annualDepreciation: new Decimal(2000000),
        remainingToDepreciate: new Decimal(20000000),
      });

      const result = calculateHistoricalDepreciation(state, 2025);

      expect(result.toString()).toBe("2000000");
    });

    it("should return ZERO when nothing remains to depreciate", () => {
      const state = createMockHistoricalState({
        annualDepreciation: new Decimal(2000000),
        remainingToDepreciate: ZERO,
      });

      const result = calculateHistoricalDepreciation(state, 2025);

      expect(result.equals(ZERO)).toBe(true);
    });

    it("should return ZERO when remaining is negative", () => {
      const state = createMockHistoricalState({
        annualDepreciation: new Decimal(2000000),
        remainingToDepreciate: new Decimal(-1000),
      });

      const result = calculateHistoricalDepreciation(state, 2025);

      expect(result.equals(ZERO)).toBe(true);
    });

    it("should ignore year parameter (depreciation is constant)", () => {
      const state = createMockHistoricalState({
        annualDepreciation: new Decimal(2000000),
        remainingToDepreciate: new Decimal(20000000),
      });

      const result2025 = calculateHistoricalDepreciation(state, 2025);
      const result2040 = calculateHistoricalDepreciation(state, 2040);

      expect(result2025.equals(result2040)).toBe(true);
    });
  });

  describe("updateHistoricalDepreciationState", () => {
    it("should update accumulated depreciation correctly", () => {
      const state = createMockHistoricalState({
        grossPPE2024: new Decimal(30000000),
        accumulatedDepreciation2024: new Decimal(10000000),
        annualDepreciation: new Decimal(2000000),
        remainingToDepreciate: new Decimal(20000000),
      });

      const result = updateHistoricalDepreciationState(state);

      expect(result.accumulatedDepreciation2024.toString()).toBe("12000000"); // 10M + 2M
    });

    it("should update remaining to depreciate correctly", () => {
      const state = createMockHistoricalState({
        grossPPE2024: new Decimal(30000000),
        accumulatedDepreciation2024: new Decimal(10000000),
        annualDepreciation: new Decimal(2000000),
        remainingToDepreciate: new Decimal(20000000),
      });

      const result = updateHistoricalDepreciationState(state);

      // Remaining = Gross - NewAccumulated = 30M - 12M = 18M
      expect(result.remainingToDepreciate.toString()).toBe("18000000");
    });

    it("should set remaining to ZERO when fully depreciated", () => {
      const state = createMockHistoricalState({
        grossPPE2024: new Decimal(10000000),
        accumulatedDepreciation2024: new Decimal(9000000),
        annualDepreciation: new Decimal(2000000), // Will over-depreciate
        remainingToDepreciate: new Decimal(1000000),
      });

      const result = updateHistoricalDepreciationState(state);

      // 9M + 2M = 11M accumulated > 10M gross
      // Remaining = 10M - 11M = -1M -> clamped to ZERO
      expect(result.remainingToDepreciate.equals(ZERO)).toBe(true);
    });

    it("should preserve other state properties", () => {
      const state = createMockHistoricalState({
        grossPPE2024: new Decimal(30000000),
        annualDepreciation: new Decimal(2000000),
      });

      const result = updateHistoricalDepreciationState(state);

      expect(result.grossPPE2024.toString()).toBe("30000000");
      expect(result.annualDepreciation.toString()).toBe("2000000");
    });
  });

  // ============================================================================
  // VIRTUAL ASSET DEPRECIATION TESTS
  // ============================================================================

  describe("calculateAssetDepreciation", () => {
    it("should return ZERO before purchase year", () => {
      const asset = createMockVirtualAsset(
        CapExCategoryType.IT_EQUIPMENT,
        2030,
        new Decimal(1000000),
      );

      const result = calculateAssetDepreciation(asset, 2025);

      expect(result.equals(ZERO)).toBe(true);
    });

    it("should calculate depreciation in purchase year (age=0)", () => {
      const asset = createMockVirtualAsset(
        CapExCategoryType.IT_EQUIPMENT,
        2025,
        new Decimal(1000000),
        { usefulLife: 5 },
      );

      const result = calculateAssetDepreciation(asset, 2025);

      // Annual depreciation = 1,000,000 / 5 = 200,000
      expect(result.toString()).toBe("200000");
    });

    it("should calculate depreciation during useful life", () => {
      const asset = createMockVirtualAsset(
        CapExCategoryType.IT_EQUIPMENT,
        2025,
        new Decimal(1000000),
        { usefulLife: 5 },
      );

      const result = calculateAssetDepreciation(asset, 2027); // Age = 2

      expect(result.toString()).toBe("200000");
    });

    it("should return ZERO when fully depreciated", () => {
      const asset = createMockVirtualAsset(
        CapExCategoryType.IT_EQUIPMENT,
        2025,
        new Decimal(1000000),
        { usefulLife: 5 },
      );

      // Age = 5 (year 2030), fully depreciated
      const result = calculateAssetDepreciation(asset, 2030);

      expect(result.equals(ZERO)).toBe(true);
    });

    it("should return ZERO after useful life", () => {
      const asset = createMockVirtualAsset(
        CapExCategoryType.IT_EQUIPMENT,
        2025,
        new Decimal(1000000),
        { usefulLife: 5 },
      );

      // Age = 10 (year 2035), way past useful life
      const result = calculateAssetDepreciation(asset, 2035);

      expect(result.equals(ZERO)).toBe(true);
    });

    it("should handle last year of useful life", () => {
      const asset = createMockVirtualAsset(
        CapExCategoryType.IT_EQUIPMENT,
        2025,
        new Decimal(1000000),
        { usefulLife: 5 },
      );

      // Age = 4 (year 2029), last year of depreciation
      const result = calculateAssetDepreciation(asset, 2029);

      expect(result.toString()).toBe("200000");
    });
  });

  describe("calculateNewAssetDepreciation", () => {
    it("should return ZERO for empty asset list", () => {
      const result = calculateNewAssetDepreciation([], 2025);

      expect(result.total.equals(ZERO)).toBe(true);
      expect(result.byCategory.size).toBe(0);
    });

    it("should calculate total depreciation for multiple assets", () => {
      const assets = [
        createMockVirtualAsset(
          CapExCategoryType.IT_EQUIPMENT,
          2025,
          new Decimal(1000000),
          { usefulLife: 5 },
        ),
        createMockVirtualAsset(
          CapExCategoryType.FURNITURE,
          2025,
          new Decimal(500000),
          { usefulLife: 10 },
        ),
      ];

      const result = calculateNewAssetDepreciation(assets, 2025);

      // IT: 1,000,000 / 5 = 200,000
      // Furniture: 500,000 / 10 = 50,000
      // Total: 250,000
      expect(result.total.toString()).toBe("250000");
    });

    it("should group depreciation by category", () => {
      const assets = [
        createMockVirtualAsset(
          CapExCategoryType.IT_EQUIPMENT,
          2025,
          new Decimal(1000000),
          { usefulLife: 5 },
        ),
        createMockVirtualAsset(
          CapExCategoryType.IT_EQUIPMENT,
          2026,
          new Decimal(500000),
          { usefulLife: 5 },
        ),
        createMockVirtualAsset(
          CapExCategoryType.FURNITURE,
          2025,
          new Decimal(500000),
          { usefulLife: 10 },
        ),
      ];

      const result = calculateNewAssetDepreciation(assets, 2027);

      // IT 2025: 200,000 (age 2)
      // IT 2026: 100,000 (age 1)
      // Furniture 2025: 50,000 (age 2)
      expect(
        result.byCategory.get(CapExCategoryType.IT_EQUIPMENT)?.toString(),
      ).toBe("300000");
      expect(
        result.byCategory.get(CapExCategoryType.FURNITURE)?.toString(),
      ).toBe("50000");
    });

    it("should skip assets not yet purchased", () => {
      const assets = [
        createMockVirtualAsset(
          CapExCategoryType.IT_EQUIPMENT,
          2030,
          new Decimal(1000000),
          { usefulLife: 5 },
        ),
      ];

      const result = calculateNewAssetDepreciation(assets, 2025);

      expect(result.total.equals(ZERO)).toBe(true);
      expect(result.byCategory.size).toBe(0);
    });

    it("should skip fully depreciated assets", () => {
      const assets = [
        createMockVirtualAsset(
          CapExCategoryType.IT_EQUIPMENT,
          2020, // 5 years ago
          new Decimal(1000000),
          { usefulLife: 5 },
        ),
      ];

      const result = calculateNewAssetDepreciation(assets, 2026);

      expect(result.total.equals(ZERO)).toBe(true);
    });
  });

  // ============================================================================
  // REINVESTMENT TESTS
  // ============================================================================

  describe("isReinvestmentDue", () => {
    it("should return false when no frequency configured", () => {
      const category = createMockCategory(CapExCategoryType.BUILDING, {
        reinvestFrequency: undefined,
      });

      expect(isReinvestmentDue(category, 2030)).toBe(false);
    });

    it("should return false in base year", () => {
      const category = createMockCategory(CapExCategoryType.IT_EQUIPMENT, {
        reinvestFrequency: 5,
      });

      expect(isReinvestmentDue(category, 2028, 2028)).toBe(false);
    });

    it("should return false before base year", () => {
      const category = createMockCategory(CapExCategoryType.IT_EQUIPMENT, {
        reinvestFrequency: 5,
      });

      expect(isReinvestmentDue(category, 2027, 2028)).toBe(false);
    });

    it("should return true when years since start divisible by frequency", () => {
      const category = createMockCategory(CapExCategoryType.IT_EQUIPMENT, {
        reinvestFrequency: 5,
      });

      // 2033 - 2028 = 5, divisible by 5
      expect(isReinvestmentDue(category, 2033, 2028)).toBe(true);
      // 2038 - 2028 = 10, divisible by 5
      expect(isReinvestmentDue(category, 2038, 2028)).toBe(true);
    });

    it("should return false when not divisible by frequency", () => {
      const category = createMockCategory(CapExCategoryType.IT_EQUIPMENT, {
        reinvestFrequency: 5,
      });

      // 2030 - 2028 = 2, not divisible by 5
      expect(isReinvestmentDue(category, 2030, 2028)).toBe(false);
      // 2032 - 2028 = 4, not divisible by 5
      expect(isReinvestmentDue(category, 2032, 2028)).toBe(false);
    });

    it("should use category-specific reinvestStartYear when configured", () => {
      const category = createMockCategory(CapExCategoryType.IT_EQUIPMENT, {
        reinvestFrequency: 5,
        reinvestStartYear: 2030, // Category starts in 2030, not 2028
      });

      // 2033 - 2028 = 5, but we should use 2030 as start
      // So for 2033: years since 2030 = 3, not divisible by 5
      expect(isReinvestmentDue(category, 2033, 2028)).toBe(false);

      // 2035 - 2030 = 5, divisible by 5
      expect(isReinvestmentDue(category, 2035, 2028)).toBe(true);
    });

    it("should use default baseYear when category has no reinvestStartYear", () => {
      const category = createMockCategory(CapExCategoryType.IT_EQUIPMENT, {
        reinvestFrequency: 5,
        reinvestStartYear: undefined,
      });

      // Falls back to baseYear (2028)
      // 2033 - 2028 = 5, divisible by 5
      expect(isReinvestmentDue(category, 2033, 2028)).toBe(true);
    });
  });

  // ============================================================================
  // CAPEX SPENDING TESTS
  // ============================================================================

  describe("calculateCapexSpending", () => {
    describe("Historical Period", () => {
      it("should return ZERO spending for historical period", () => {
        const config = createMockCapexConfig();

        const result = calculateCapexSpending(2024, config, "historical");

        expect(result.total.equals(ZERO)).toBe(true);
        expect(result.byCategory.size).toBe(0);
      });
    });

    describe("Transition Period", () => {
      it("should return manual CAPEX entries for transition period", () => {
        const config = createMockCapexConfig({
          transitionCapex: [
            {
              categoryType: CapExCategoryType.IT_EQUIPMENT,
              year: 2025,
              amount: new Decimal(500000),
            },
            {
              categoryType: CapExCategoryType.FURNITURE,
              year: 2025,
              amount: new Decimal(300000),
            },
          ],
        });

        const result = calculateCapexSpending(2025, config, "transition");

        expect(result.total.toString()).toBe("800000");
        expect(
          result.byCategory.get(CapExCategoryType.IT_EQUIPMENT)?.toString(),
        ).toBe("500000");
        expect(
          result.byCategory.get(CapExCategoryType.FURNITURE)?.toString(),
        ).toBe("300000");
      });

      it("should only include entries for the specified year", () => {
        const config = createMockCapexConfig({
          transitionCapex: [
            {
              categoryType: CapExCategoryType.IT_EQUIPMENT,
              year: 2025,
              amount: new Decimal(500000),
            },
            {
              categoryType: CapExCategoryType.FURNITURE,
              year: 2026,
              amount: new Decimal(300000),
            },
          ],
        });

        const result = calculateCapexSpending(2025, config, "transition");

        expect(result.total.toString()).toBe("500000");
        expect(result.byCategory.has(CapExCategoryType.FURNITURE)).toBe(false);
      });

      it("should accumulate multiple entries for same category in same year", () => {
        const config = createMockCapexConfig({
          transitionCapex: [
            {
              categoryType: CapExCategoryType.IT_EQUIPMENT,
              year: 2025,
              amount: new Decimal(500000),
            },
            {
              categoryType: CapExCategoryType.IT_EQUIPMENT,
              year: 2025,
              amount: new Decimal(200000),
            },
          ],
        });

        const result = calculateCapexSpending(2025, config, "transition");

        expect(result.total.toString()).toBe("700000");
        expect(
          result.byCategory.get(CapExCategoryType.IT_EQUIPMENT)?.toString(),
        ).toBe("700000");
      });
    });

    describe("Dynamic Period", () => {
      it("should calculate auto-reinvestment based on category frequency", () => {
        const config = createMockCapexConfig({
          categories: [
            createMockCategory(CapExCategoryType.IT_EQUIPMENT, {
              reinvestFrequency: 5,
              reinvestAmount: new Decimal(1000000),
            }),
          ],
        });

        // 2033 = 5 years after 2028
        const result = calculateCapexSpending(2033, config, "dynamic");

        expect(result.total.toString()).toBe("1000000");
      });

      it("should return ZERO when no reinvestment due", () => {
        const config = createMockCapexConfig({
          categories: [
            createMockCategory(CapExCategoryType.IT_EQUIPMENT, {
              reinvestFrequency: 5,
              reinvestAmount: new Decimal(1000000),
            }),
          ],
        });

        // 2030 = 2 years after 2028, not divisible by 5
        const result = calculateCapexSpending(2030, config, "dynamic");

        expect(result.total.equals(ZERO)).toBe(true);
      });

      it("should skip categories without reinvestAmount", () => {
        const config = createMockCapexConfig({
          categories: [
            createMockCategory(CapExCategoryType.IT_EQUIPMENT, {
              reinvestFrequency: 5,
              reinvestAmount: undefined,
            }),
          ],
        });

        const result = calculateCapexSpending(2033, config, "dynamic");

        expect(result.total.equals(ZERO)).toBe(true);
      });

      it("should include manual virtual assets for current year", () => {
        const config = createMockCapexConfig({
          virtualAssets: [
            createMockVirtualAsset(
              CapExCategoryType.BUILDING,
              2030,
              new Decimal(5000000),
            ),
          ],
        });

        const result = calculateCapexSpending(2030, config, "dynamic");

        expect(result.total.toString()).toBe("5000000");
        expect(
          result.byCategory.get(CapExCategoryType.BUILDING)?.toString(),
        ).toBe("5000000");
      });

      it("should combine auto-reinvestment and manual assets", () => {
        const config = createMockCapexConfig({
          categories: [
            createMockCategory(CapExCategoryType.IT_EQUIPMENT, {
              reinvestFrequency: 5,
              reinvestAmount: new Decimal(1000000),
            }),
          ],
          virtualAssets: [
            createMockVirtualAsset(
              CapExCategoryType.BUILDING,
              2033,
              new Decimal(5000000),
            ),
          ],
        });

        const result = calculateCapexSpending(2033, config, "dynamic");

        expect(result.total.toString()).toBe("6000000"); // 1M + 5M
      });
    });

    describe("Unknown Period", () => {
      it("should return ZERO for unknown period type", () => {
        const config = createMockCapexConfig();

        // @ts-expect-error Testing invalid period type
        const result = calculateCapexSpending(2030, config, "unknown");

        expect(result.total.equals(ZERO)).toBe(true);
      });
    });
  });

  // ============================================================================
  // VIRTUAL ASSET CREATION TESTS
  // ============================================================================

  describe("createVirtualAsset", () => {
    it("should create a virtual asset with correct properties", () => {
      const asset = createVirtualAsset(
        CapExCategoryType.IT_EQUIPMENT,
        2025,
        new Decimal(1000000),
        5,
      );

      expect(asset.categoryType).toBe(CapExCategoryType.IT_EQUIPMENT);
      expect(asset.purchaseYear).toBe(2025);
      expect(asset.purchaseAmount.toString()).toBe("1000000");
      expect(asset.usefulLife).toBe(5);
      expect(asset.id).toContain("asset-IT_EQUIPMENT-2025");
    });

    it("should generate IDs with correct format", () => {
      const asset = createVirtualAsset(
        CapExCategoryType.IT_EQUIPMENT,
        2025,
        new Decimal(1000000),
        5,
      );

      // ID should follow pattern: asset-{categoryType}-{year}-{timestamp}
      expect(asset.id).toMatch(/^asset-IT_EQUIPMENT-2025-\d+$/);
    });
  });

  describe("generateVirtualAssetsForYear", () => {
    it("should generate assets for each category with spending", () => {
      const spending = new Map<CapExCategoryType, Decimal>([
        [CapExCategoryType.IT_EQUIPMENT, new Decimal(500000)],
        [CapExCategoryType.FURNITURE, new Decimal(300000)],
      ]);
      const config = createMockCapexConfig();

      const result = generateVirtualAssetsForYear(2025, spending, config);

      expect(result.length).toBe(2);
      expect(result[0].categoryType).toBe(CapExCategoryType.IT_EQUIPMENT);
      expect(result[0].purchaseAmount.toString()).toBe("500000");
      expect(result[1].categoryType).toBe(CapExCategoryType.FURNITURE);
      expect(result[1].purchaseAmount.toString()).toBe("300000");
    });

    it("should skip categories with ZERO spending", () => {
      const spending = new Map<CapExCategoryType, Decimal>([
        [CapExCategoryType.IT_EQUIPMENT, new Decimal(500000)],
        [CapExCategoryType.FURNITURE, ZERO],
      ]);
      const config = createMockCapexConfig();

      const result = generateVirtualAssetsForYear(2025, spending, config);

      expect(result.length).toBe(1);
      expect(result[0].categoryType).toBe(CapExCategoryType.IT_EQUIPMENT);
    });

    it("should skip unknown categories", () => {
      const spending = new Map<CapExCategoryType, Decimal>([
        ["UNKNOWN_CATEGORY" as CapExCategoryType, new Decimal(500000)],
      ]);
      const config = createMockCapexConfig({
        categories: [createMockCategory(CapExCategoryType.IT_EQUIPMENT)],
      });

      const result = generateVirtualAssetsForYear(2025, spending, config);

      expect(result.length).toBe(0);
    });

    it("should use category useful life for assets", () => {
      const spending = new Map<CapExCategoryType, Decimal>([
        [CapExCategoryType.IT_EQUIPMENT, new Decimal(500000)],
      ]);
      const config = createMockCapexConfig({
        categories: [
          createMockCategory(CapExCategoryType.IT_EQUIPMENT, { usefulLife: 7 }),
        ],
      });

      const result = generateVirtualAssetsForYear(2025, spending, config);

      expect(result[0].usefulLife).toBe(7);
    });

    it("should return empty array for empty spending map", () => {
      const spending = new Map<CapExCategoryType, Decimal>();
      const config = createMockCapexConfig();

      const result = generateVirtualAssetsForYear(2025, spending, config);

      expect(result.length).toBe(0);
    });
  });

  // ============================================================================
  // YEAR RESULT TESTS
  // ============================================================================

  describe("calculateCapexYearResult", () => {
    it("should calculate complete year result for historical period", () => {
      const config = createMockCapexConfig();

      const result = calculateCapexYearResult(
        2024,
        config,
        "historical",
        new Decimal(30000000), // Prior gross PPE
        new Decimal(10000000), // Prior accumulated depreciation
        config.historicalState,
      );

      expect(result.year).toBe(2024);
      expect(result.spending.equals(ZERO)).toBe(true); // No spending in historical
      expect(result.historicalDepreciation.toString()).toBe("2000000");
      expect(result.newAssetDepreciation.equals(ZERO)).toBe(true);
      expect(result.totalDepreciation.toString()).toBe("2000000");
    });

    it("should calculate complete year result for transition period", () => {
      const config = createMockCapexConfig({
        transitionCapex: [
          {
            categoryType: CapExCategoryType.IT_EQUIPMENT,
            year: 2025,
            amount: new Decimal(500000),
          },
        ],
      });

      const result = calculateCapexYearResult(
        2025,
        config,
        "transition",
        new Decimal(30000000),
        new Decimal(12000000),
        config.historicalState,
      );

      expect(result.spending.toString()).toBe("500000");
      expect(result.grossPPE.toString()).toBe("30500000"); // 30M + 500K
      expect(result.newAssets.length).toBe(1);
    });

    it("should track PPE correctly", () => {
      const config = createMockCapexConfig();

      const result = calculateCapexYearResult(
        2025,
        config,
        "transition",
        new Decimal(30000000), // Prior gross
        new Decimal(12000000), // Prior accumulated
        config.historicalState,
      );

      expect(result.grossPPE.toString()).toBe("30000000"); // No spending
      // Accumulated = prior + historical depreciation
      expect(result.accumulatedDepreciation.toString()).toBe("14000000");
      // Net = Gross - Accumulated
      expect(result.netPPE.toString()).toBe("16000000");
    });
  });

  // ============================================================================
  // FULL SCHEDULE TESTS
  // ============================================================================

  describe("generateCapexSchedule", () => {
    it("should generate schedule for all years", () => {
      const config = createMockCapexConfig();

      const schedule = generateCapexSchedule(config, 2053);

      // 2023-2053 = 31 years
      expect(schedule.size).toBe(31);
      expect(schedule.has(2023)).toBe(true);
      expect(schedule.has(2053)).toBe(true);
    });

    it("should handle historical period (2023-2024)", () => {
      const config = createMockCapexConfig();

      const schedule = generateCapexSchedule(config);

      const year2023 = schedule.get(2023);
      const year2024 = schedule.get(2024);

      expect(year2023?.spending.equals(ZERO)).toBe(true);
      expect(year2024?.spending.equals(ZERO)).toBe(true);
    });

    it("should handle transition period (2025-2027)", () => {
      const config = createMockCapexConfig({
        transitionCapex: [
          {
            categoryType: CapExCategoryType.IT_EQUIPMENT,
            year: 2025,
            amount: new Decimal(500000),
          },
          {
            categoryType: CapExCategoryType.FURNITURE,
            year: 2026,
            amount: new Decimal(300000),
          },
        ],
      });

      const schedule = generateCapexSchedule(config);

      expect(schedule.get(2025)?.spending.toString()).toBe("500000");
      expect(schedule.get(2026)?.spending.toString()).toBe("300000");
      expect(schedule.get(2027)?.spending.equals(ZERO)).toBe(true);
    });

    it("should handle dynamic period with auto-reinvestment", () => {
      const config = createMockCapexConfig({
        categories: [
          createMockCategory(CapExCategoryType.IT_EQUIPMENT, {
            reinvestFrequency: 5,
            reinvestAmount: new Decimal(1000000),
          }),
        ],
      });

      const schedule = generateCapexSchedule(config);

      // 2033 = 5 years after 2028
      expect(schedule.get(2033)?.spending.toString()).toBe("1000000");
      // 2038 = 10 years after 2028
      expect(schedule.get(2038)?.spending.toString()).toBe("1000000");
    });

    it("should use custom dynamic end year", () => {
      const config = createMockCapexConfig();

      const schedule25 = generateCapexSchedule(config, 2052);
      const schedule30 = generateCapexSchedule(config, 2057);

      // 25-year: 2023-2052 = 30 years
      expect(schedule25.size).toBe(30);
      expect(schedule25.has(2052)).toBe(true);
      expect(schedule25.has(2053)).toBe(false);

      // 30-year: 2023-2057 = 35 years
      expect(schedule30.size).toBe(35);
      expect(schedule30.has(2057)).toBe(true);
    });

    it("should carry forward virtual assets across years", () => {
      const config = createMockCapexConfig({
        transitionCapex: [
          {
            categoryType: CapExCategoryType.IT_EQUIPMENT,
            year: 2025,
            amount: new Decimal(1000000),
          },
        ],
        categories: [
          createMockCategory(CapExCategoryType.IT_EQUIPMENT, {
            usefulLife: 5,
          }),
        ],
      });

      const schedule = generateCapexSchedule(config);

      // Asset purchased in 2025, depreciation should appear in subsequent years
      expect(schedule.get(2026)?.newAssetDepreciation.greaterThan(ZERO)).toBe(
        true,
      );
      expect(schedule.get(2027)?.newAssetDepreciation.greaterThan(ZERO)).toBe(
        true,
      );
    });
  });

  // ============================================================================
  // VALIDATION TESTS
  // ============================================================================

  describe("validateCapexConfig", () => {
    it("should return empty array for valid config", () => {
      const config = createMockCapexConfig();

      const errors = validateCapexConfig(config);

      expect(errors.length).toBe(0);
    });

    it("should detect missing categories", () => {
      const config = createMockCapexConfig({
        categories: [],
      });

      const errors = validateCapexConfig(config);

      expect(errors).toContain("No CAPEX categories configured");
    });

    it("should detect invalid useful life", () => {
      const config = createMockCapexConfig({
        categories: [
          createMockCategory(CapExCategoryType.IT_EQUIPMENT, {
            usefulLife: 0,
          }),
        ],
      });

      const errors = validateCapexConfig(config);

      expect(errors.some((e) => e.includes("Invalid useful life"))).toBe(true);
    });

    it("should detect invalid useful life (negative)", () => {
      const config = createMockCapexConfig({
        categories: [
          createMockCategory(CapExCategoryType.IT_EQUIPMENT, {
            usefulLife: -5,
          }),
        ],
      });

      const errors = validateCapexConfig(config);

      expect(errors.some((e) => e.includes("Invalid useful life"))).toBe(true);
    });

    it("should allow zero reinvestment frequency (means no auto-reinvestment)", () => {
      // Note: 0 is falsy, so the validation is skipped (no reinvestment = no error)
      const config = createMockCapexConfig({
        categories: [
          createMockCategory(CapExCategoryType.IT_EQUIPMENT, {
            usefulLife: 5,
            reinvestFrequency: 0,
          }),
        ],
      });

      const errors = validateCapexConfig(config);

      // No error for frequency of 0 (means no auto-reinvestment)
      expect(errors.some((e) => e.includes("Reinvestment frequency"))).toBe(
        false,
      );
    });

    it("should detect invalid reinvestment frequency (negative)", () => {
      // Negative frequency is truthy but out of valid range
      const config = createMockCapexConfig({
        categories: [
          createMockCategory(CapExCategoryType.IT_EQUIPMENT, {
            usefulLife: 5,
            reinvestFrequency: -5,
          }),
        ],
      });

      const errors = validateCapexConfig(config);

      expect(
        errors.some((e) => e.includes("Reinvestment frequency must be 1-30")),
      ).toBe(true);
    });

    it("should detect invalid reinvestment frequency (too high)", () => {
      const config = createMockCapexConfig({
        categories: [
          createMockCategory(CapExCategoryType.IT_EQUIPMENT, {
            reinvestFrequency: 35,
          }),
        ],
      });

      const errors = validateCapexConfig(config);

      expect(
        errors.some((e) => e.includes("Reinvestment frequency must be 1-30")),
      ).toBe(true);
    });

    it("should detect non-positive reinvestment amount", () => {
      const config = createMockCapexConfig({
        categories: [
          createMockCategory(CapExCategoryType.IT_EQUIPMENT, {
            reinvestFrequency: 5,
            reinvestAmount: new Decimal(-1000),
          }),
        ],
      });

      const errors = validateCapexConfig(config);

      expect(
        errors.some((e) => e.includes("Reinvestment amount must be positive")),
      ).toBe(true);
    });

    it("should detect zero reinvestment amount", () => {
      const config = createMockCapexConfig({
        categories: [
          createMockCategory(CapExCategoryType.IT_EQUIPMENT, {
            reinvestFrequency: 5,
            reinvestAmount: ZERO,
          }),
        ],
      });

      const errors = validateCapexConfig(config);

      expect(
        errors.some((e) => e.includes("Reinvestment amount must be positive")),
      ).toBe(true);
    });

    it("should detect invalid historical state", () => {
      const config = createMockCapexConfig({
        historicalState: createMockHistoricalState({
          grossPPE2024: ZERO,
        }),
      });

      const errors = validateCapexConfig(config);

      expect(
        errors.some((e) => e.includes("Invalid historical depreciation state")),
      ).toBe(true);
    });

    it("should detect negative gross PPE in historical state", () => {
      const config = createMockCapexConfig({
        historicalState: createMockHistoricalState({
          grossPPE2024: new Decimal(-1000000),
        }),
      });

      const errors = validateCapexConfig(config);

      expect(
        errors.some((e) => e.includes("Invalid historical depreciation state")),
      ).toBe(true);
    });

    it("should allow valid reinvestment frequency of 1", () => {
      const config = createMockCapexConfig({
        categories: [
          createMockCategory(CapExCategoryType.IT_EQUIPMENT, {
            reinvestFrequency: 1,
            reinvestAmount: new Decimal(100000),
          }),
        ],
      });

      const errors = validateCapexConfig(config);

      expect(errors.some((e) => e.includes("Reinvestment frequency"))).toBe(
        false,
      );
    });

    it("should allow valid reinvestment frequency of 30", () => {
      const config = createMockCapexConfig({
        categories: [
          createMockCategory(CapExCategoryType.IT_EQUIPMENT, {
            reinvestFrequency: 30,
            reinvestAmount: new Decimal(100000),
          }),
        ],
      });

      const errors = validateCapexConfig(config);

      expect(errors.some((e) => e.includes("Reinvestment frequency"))).toBe(
        false,
      );
    });
  });

  // ============================================================================
  // REINVESTMENT SCHEDULE TESTS
  // ============================================================================

  describe("getReinvestmentSchedule", () => {
    it("should return empty map when no categories have reinvestment", () => {
      const config = createMockCapexConfig({
        categories: [
          createMockCategory(CapExCategoryType.BUILDING, {
            reinvestFrequency: undefined,
          }),
        ],
      });

      const schedule = getReinvestmentSchedule(config);

      expect(schedule.size).toBe(0);
    });

    it("should return reinvestment years for each category", () => {
      const config = createMockCapexConfig({
        categories: [
          createMockCategory(CapExCategoryType.IT_EQUIPMENT, {
            reinvestFrequency: 5,
            reinvestAmount: new Decimal(1000000),
          }),
        ],
      });

      const schedule = getReinvestmentSchedule(config, 2028, 2053);

      const itYears = schedule.get(CapExCategoryType.IT_EQUIPMENT);
      expect(itYears).toContain(2033); // 2028 + 5
      expect(itYears).toContain(2038); // 2028 + 10
      expect(itYears).toContain(2043); // 2028 + 15
      expect(itYears).toContain(2048); // 2028 + 20
      expect(itYears).toContain(2053); // 2028 + 25
    });

    it("should respect category-specific reinvestStartYear", () => {
      const config = createMockCapexConfig({
        categories: [
          createMockCategory(CapExCategoryType.IT_EQUIPMENT, {
            reinvestFrequency: 5,
            reinvestStartYear: 2030,
            reinvestAmount: new Decimal(1000000),
          }),
        ],
      });

      const schedule = getReinvestmentSchedule(config, 2028, 2053);

      const itYears = schedule.get(CapExCategoryType.IT_EQUIPMENT);
      expect(itYears).not.toContain(2033); // 2028 + 5, but starts from 2030
      expect(itYears).toContain(2035); // 2030 + 5
      expect(itYears).toContain(2040); // 2030 + 10
    });

    it("should handle multiple categories with different frequencies", () => {
      const config = createMockCapexConfig({
        categories: [
          createMockCategory(CapExCategoryType.IT_EQUIPMENT, {
            reinvestFrequency: 5,
            reinvestAmount: new Decimal(1000000),
          }),
          createMockCategory(CapExCategoryType.FURNITURE, {
            reinvestFrequency: 10,
            reinvestAmount: new Decimal(500000),
          }),
        ],
      });

      const schedule = getReinvestmentSchedule(config, 2028, 2053);

      const itYears = schedule.get(CapExCategoryType.IT_EQUIPMENT);
      const furnitureYears = schedule.get(CapExCategoryType.FURNITURE);

      expect(itYears?.length).toBeGreaterThan(furnitureYears?.length ?? 0);
      expect(furnitureYears).toContain(2038); // 2028 + 10
      expect(furnitureYears).toContain(2048); // 2028 + 20
    });

    it("should respect custom end year", () => {
      const config = createMockCapexConfig({
        categories: [
          createMockCategory(CapExCategoryType.IT_EQUIPMENT, {
            reinvestFrequency: 5,
            reinvestAmount: new Decimal(1000000),
          }),
        ],
      });

      const schedule = getReinvestmentSchedule(config, 2028, 2040);

      const itYears = schedule.get(CapExCategoryType.IT_EQUIPMENT);
      expect(itYears).toContain(2033);
      expect(itYears).toContain(2038);
      expect(itYears).not.toContain(2043);
    });
  });
});
