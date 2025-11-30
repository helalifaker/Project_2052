/**
 * PHASE 2: CAPEX DEPRECIATION ENGINE - UNIT TESTS
 *
 * Comprehensive test suite for the CapEx depreciation engine (GAP 1).
 *
 * Test Coverage:
 * - Asset depreciation calculations
 * - Straight-line depreciation
 * - Asset pool management (OLD vs NEW)
 * - Accumulated depreciation tracking
 * - Net book value calculation
 * - Fully depreciated asset detection
 * - Multi-year depreciation schedules
 * - PP&E tracking
 *
 * @module capex/depreciation.test
 */

import { describe, it, expect } from "vitest";
import { Decimal as D } from "decimal.js";
import {
  calculateAssetDepreciation,
  calculateTotalDepreciation,
  generateDepreciationSchedule,
  calculatePPETracker,
  validateCapExConfig,
} from "./depreciation";
import type { CapExAsset, CapExConfiguration } from "../core/types";
import { DepreciationMethod } from "../core/types";
import { ZERO } from "../core/constants";

// ============================================================================
// TEST FIXTURES
// ============================================================================

const mockAssetBuilding: CapExAsset = {
  id: "asset-building-1",
  assetName: "School Building",
  purchaseYear: 2023,
  purchaseAmount: new D(10000000),
  usefulLife: 20,
  depreciationMethod: DepreciationMethod.STRAIGHT_LINE,
  accumulatedDepreciation: ZERO,
  netBookValue: new D(10000000),
  fullyDepreciated: false,
};

const mockAssetEquipment: CapExAsset = {
  id: "asset-equipment-1",
  assetName: "Lab Equipment",
  purchaseYear: 2025,
  purchaseAmount: new D(2000000),
  usefulLife: 10,
  depreciationMethod: DepreciationMethod.STRAIGHT_LINE,
  accumulatedDepreciation: ZERO,
  netBookValue: new D(2000000),
  fullyDepreciated: false,
};

const mockAssetOld: CapExAsset = {
  id: "asset-old-1",
  assetName: "Old Furniture",
  purchaseYear: 2015,
  purchaseAmount: new D(500000),
  usefulLife: 10,
  depreciationMethod: DepreciationMethod.STRAIGHT_LINE,
  accumulatedDepreciation: new D(500000),
  netBookValue: ZERO,
  fullyDepreciated: true,
};

// ============================================================================
// ASSET DEPRECIATION TESTS
// ============================================================================

describe("Asset Depreciation Calculation", () => {
  it("should calculate straight-line depreciation correctly", () => {
    const state = calculateAssetDepreciation(mockAssetBuilding, 2023);

    // Year 1: 10,000,000 / 20 = 500,000 per year
    expect(state.year).toBe(2023);
    expect(state.age).toBe(1);
    expect(state.depreciationExpense.toString()).toBe("500000");
    expect(state.fullyDepreciated).toBe(false);
  });

  it("should track accumulated depreciation over time", () => {
    // Year 1
    const state2023 = calculateAssetDepreciation(mockAssetBuilding, 2023);
    expect(state2023.accumulatedDepreciation.toString()).toBe("500000");
    expect(state2023.netBookValue.toString()).toBe("9500000");

    // Year 2 (with prior accumulated depreciation)
    const state2024 = calculateAssetDepreciation(
      mockAssetBuilding,
      2024,
      state2023.accumulatedDepreciation,
    );
    expect(state2024.accumulatedDepreciation.toString()).toBe("1000000");
    expect(state2024.netBookValue.toString()).toBe("9000000");

    // Year 3
    const state2025 = calculateAssetDepreciation(
      mockAssetBuilding,
      2025,
      state2024.accumulatedDepreciation,
    );
    expect(state2025.accumulatedDepreciation.toString()).toBe("1500000");
    expect(state2025.netBookValue.toString()).toBe("8500000");
  });

  it("should return zero depreciation before purchase year", () => {
    const state = calculateAssetDepreciation(mockAssetEquipment, 2024);

    expect(state.age).toBe(0);
    expect(state.depreciationExpense.toString()).toBe("0");
    expect(state.accumulatedDepreciation.toString()).toBe("0");
    expect(state.netBookValue.toString()).toBe("2000000");
  });

  it("should detect fully depreciated assets", () => {
    // Asset purchased in 2023, useful life 20 years, check year 2043 (21 years later)
    const state = calculateAssetDepreciation(mockAssetBuilding, 2043);

    expect(state.age).toBe(21);
    expect(state.depreciationExpense.toString()).toBe("0");
    expect(state.fullyDepreciated).toBe(true);
    expect(state.netBookValue.toString()).toBe("0");
  });

  it("should cap accumulated depreciation at purchase amount", () => {
    // Manually create asset with high prior accumulated depreciation
    const asset: CapExAsset = {
      ...mockAssetBuilding,
      usefulLife: 5, // Shorter life
    };

    let priorAccumulated = ZERO;
    for (let year = 2023; year <= 2030; year++) {
      const state = calculateAssetDepreciation(asset, year, priorAccumulated);
      priorAccumulated = state.accumulatedDepreciation;

      // Accumulated should never exceed purchase amount
      expect(
        state.accumulatedDepreciation.lessThanOrEqualTo(asset.purchaseAmount),
      ).toBe(true);

      // Net book value should never be negative
      expect(state.netBookValue.greaterThanOrEqualTo(ZERO)).toBe(true);
    }
  });

  it("should handle already fully depreciated assets", () => {
    const state = calculateAssetDepreciation(mockAssetOld, 2028);

    expect(state.depreciationExpense.toString()).toBe("0");
    expect(state.fullyDepreciated).toBe(true);
    expect(state.netBookValue.toString()).toBe("0");
  });
});

// ============================================================================
// ASSET POOL DEPRECIATION TESTS
// ============================================================================

describe("Asset Pool Depreciation", () => {
  it("should calculate total depreciation for multiple assets", () => {
    const config: CapExConfiguration = {
      autoReinvestEnabled: false,
      existingAssets: [mockAssetBuilding, mockAssetEquipment],
      newAssets: [],
    };

    const result = calculateTotalDepreciation(config, 2025);

    // Building: 500,000 + Equipment: 200,000 = 700,000
    expect(result.year).toBe(2025);
    expect(result.oldAssetsDepreciation.toString()).toBe("700000");
    expect(result.newAssetsDepreciation.toString()).toBe("0");
    expect(result.totalDepreciation.toString()).toBe("700000");
    expect(result.assetStates).toHaveLength(2);
  });

  it("should separate OLD and NEW asset pools", () => {
    const config: CapExConfiguration = {
      autoReinvestEnabled: false,
      existingAssets: [mockAssetBuilding], // OLD pool
      newAssets: [mockAssetEquipment], // NEW pool
    };

    const result = calculateTotalDepreciation(config, 2025);

    expect(result.oldAssetsDepreciation.toString()).toBe("500000"); // Building
    expect(result.newAssetsDepreciation.toString()).toBe("200000"); // Equipment
    expect(result.totalDepreciation.toString()).toBe("700000");
  });

  it("should use prior asset states for continuity", () => {
    const config: CapExConfiguration = {
      autoReinvestEnabled: false,
      existingAssets: [mockAssetBuilding],
      newAssets: [],
    };

    // Year 1
    const result2023 = calculateTotalDepreciation(config, 2023);
    expect(result2023.assetStates[0].accumulatedDepreciation.toString()).toBe(
      "500000",
    );

    // Year 2 with prior states
    const result2024 = calculateTotalDepreciation(
      config,
      2024,
      result2023.assetStates,
    );
    expect(result2024.assetStates[0].accumulatedDepreciation.toString()).toBe(
      "1000000",
    );

    // Year 3 with prior states
    const result2025 = calculateTotalDepreciation(
      config,
      2025,
      result2024.assetStates,
    );
    expect(result2025.assetStates[0].accumulatedDepreciation.toString()).toBe(
      "1500000",
    );
  });

  it("should handle empty asset pools", () => {
    const config: CapExConfiguration = {
      autoReinvestEnabled: false,
      existingAssets: [],
      newAssets: [],
    };

    const result = calculateTotalDepreciation(config, 2025);

    expect(result.totalDepreciation.toString()).toBe("0");
    expect(result.assetStates).toHaveLength(0);
  });
});

// ============================================================================
// MULTI-YEAR DEPRECIATION SCHEDULE TESTS
// ============================================================================

describe("Multi-Year Depreciation Schedule", () => {
  it("should generate complete depreciation schedule", () => {
    const config: CapExConfiguration = {
      autoReinvestEnabled: false,
      existingAssets: [mockAssetBuilding],
      newAssets: [],
    };

    const schedule = generateDepreciationSchedule(config, 2023, 2027);

    expect(schedule).toHaveLength(5); // 5 years

    // Verify each year
    schedule.forEach((result, index) => {
      expect(result.year).toBe(2023 + index);
      expect(result.totalDepreciation.toString()).toBe("500000"); // Constant depreciation
    });
  });

  it("should show decreasing total depreciation as assets become fully depreciated", () => {
    const shortLifeAsset: CapExAsset = {
      id: "asset-short-1",
      assetName: "Short Life Asset",
      purchaseYear: 2023,
      purchaseAmount: new D(1000000),
      usefulLife: 3, // Only 3 years
      depreciationMethod: DepreciationMethod.STRAIGHT_LINE,
      accumulatedDepreciation: ZERO,
      netBookValue: new D(1000000),
      fullyDepreciated: false,
    };

    const config: CapExConfiguration = {
      autoReinvestEnabled: false,
      existingAssets: [shortLifeAsset],
      newAssets: [],
    };

    const schedule = generateDepreciationSchedule(config, 2023, 2027);

    // Years 1-3: Full depreciation (333,333.33 per year)
    expect(schedule[0].totalDepreciation.toFixed(2)).toBe("333333.33");
    expect(schedule[1].totalDepreciation.toFixed(2)).toBe("333333.33");
    expect(schedule[2].totalDepreciation.toFixed(2)).toBe("333333.33");

    // Years 4-5: Asset fully depreciated (0)
    expect(schedule[3].totalDepreciation.toString()).toBe("0");
    expect(schedule[4].totalDepreciation.toString()).toBe("0");
  });

  it("should handle assets purchased in future years", () => {
    const futureAsset: CapExAsset = {
      id: "asset-future-1",
      assetName: "Future Asset",
      purchaseYear: 2026, // Purchased in future
      purchaseAmount: new D(2000000),
      usefulLife: 10,
      depreciationMethod: DepreciationMethod.STRAIGHT_LINE,
      accumulatedDepreciation: ZERO,
      netBookValue: new D(2000000),
      fullyDepreciated: false,
    };

    const config: CapExConfiguration = {
      autoReinvestEnabled: false,
      existingAssets: [futureAsset],
      newAssets: [],
    };

    const schedule = generateDepreciationSchedule(config, 2023, 2028);

    // 2023-2025: No depreciation (asset not purchased yet)
    expect(schedule[0].totalDepreciation.toString()).toBe("0"); // 2023
    expect(schedule[1].totalDepreciation.toString()).toBe("0"); // 2024
    expect(schedule[2].totalDepreciation.toString()).toBe("0"); // 2025

    // 2026-2028: Depreciation starts (200,000 per year)
    expect(schedule[3].totalDepreciation.toString()).toBe("200000"); // 2026
    expect(schedule[4].totalDepreciation.toString()).toBe("200000"); // 2027
    expect(schedule[5].totalDepreciation.toString()).toBe("200000"); // 2028
  });
});

// ============================================================================
// PP&E TRACKER TESTS
// ============================================================================

describe("PP&E Tracker", () => {
  it("should track PP&E correctly", () => {
    const config: CapExConfiguration = {
      autoReinvestEnabled: false,
      existingAssets: [mockAssetBuilding],
      newAssets: [],
    };

    const depResult = calculateTotalDepreciation(config, 2025);
    const ppeTracker = calculatePPETracker(
      depResult,
      new D(10000000), // Prior gross PP&E
      new D(500000), // New CapEx spending
    );

    expect(ppeTracker.year).toBe(2025);
    expect(ppeTracker.grossPPE.toString()).toBe("10500000"); // 10M + 500K
    expect(ppeTracker.activeAssets).toBe(1);
    expect(ppeTracker.fullyDepreciatedAssets).toBe(0);
  });

  it("should calculate net PP&E correctly", () => {
    const config: CapExConfiguration = {
      autoReinvestEnabled: false,
      existingAssets: [mockAssetBuilding],
      newAssets: [],
    };

    // Generate schedule for 3 years
    const schedule = generateDepreciationSchedule(config, 2023, 2025);

    const grossPPE = new D(10000000); // Initial
    const trackers = schedule.map((depResult) => {
      const tracker = calculatePPETracker(depResult, grossPPE, ZERO);
      return tracker;
    });

    // Year 1: Net PP&E = 10,000,000 - 500,000 = 9,500,000
    expect(trackers[0].netPPE.toString()).toBe("9500000");

    // Year 2: Net PP&E = 10,000,000 - 1,000,000 = 9,000,000
    expect(trackers[1].netPPE.toString()).toBe("9000000");

    // Year 3: Net PP&E = 10,000,000 - 1,500,000 = 8,500,000
    expect(trackers[2].netPPE.toString()).toBe("8500000");
  });

  it("should count active vs fully depreciated assets", () => {
    const config: CapExConfiguration = {
      autoReinvestEnabled: false,
      existingAssets: [mockAssetBuilding, mockAssetOld],
      newAssets: [],
    };

    const depResult = calculateTotalDepreciation(config, 2025);
    const ppeTracker = calculatePPETracker(depResult, new D(10500000), ZERO);

    expect(ppeTracker.activeAssets).toBe(1); // Building
    expect(ppeTracker.fullyDepreciatedAssets).toBe(1); // Old asset
  });
});

// ============================================================================
// VALIDATION TESTS
// ============================================================================

describe("CapEx Configuration Validation", () => {
  it("should validate correct configuration", () => {
    const validConfig: CapExConfiguration = {
      autoReinvestEnabled: false,
      existingAssets: [mockAssetBuilding],
      newAssets: [],
    };

    const validation = validateCapExConfig(validConfig);
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it("should detect invalid asset configurations", () => {
    const invalidAsset: CapExAsset = {
      id: "invalid-1",
      assetName: "Invalid Asset",
      purchaseYear: 2023,
      purchaseAmount: new D(-1000000), // Invalid: negative
      usefulLife: -5, // Invalid: negative
      depreciationMethod: DepreciationMethod.STRAIGHT_LINE,
      accumulatedDepreciation: new D(2000000), // Invalid: exceeds purchase
      netBookValue: ZERO,
      fullyDepreciated: false,
    };

    const config: CapExConfiguration = {
      autoReinvestEnabled: false,
      existingAssets: [invalidAsset],
      newAssets: [],
    };

    const validation = validateCapExConfig(config);
    expect(validation.valid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
  });

  it("should detect invalid auto-reinvestment configuration", () => {
    const config: CapExConfiguration = {
      autoReinvestEnabled: true, // Enabled
      // But no reinvest amount or percentage specified
      existingAssets: [mockAssetBuilding],
      newAssets: [],
    };

    const validation = validateCapExConfig(config);
    expect(validation.valid).toBe(false);
    expect(validation.errors.some((e) => e.includes("Auto-reinvestment"))).toBe(
      true,
    );
  });

  it("should validate purchase year range", () => {
    const invalidAsset: CapExAsset = {
      ...mockAssetBuilding,
      purchaseYear: 2060, // Invalid: too far in future
    };

    const config: CapExConfiguration = {
      autoReinvestEnabled: false,
      existingAssets: [invalidAsset],
      newAssets: [],
    };

    const validation = validateCapExConfig(config);
    expect(validation.valid).toBe(false);
    expect(
      validation.errors.some((e) => e.includes("Invalid purchase year")),
    ).toBe(true);
  });
});

// ============================================================================
// EDGE CASE TESTS
// ============================================================================

describe("Edge Cases", () => {
  it("should handle asset with 1-year useful life", () => {
    const oneYearAsset: CapExAsset = {
      id: "one-year-1",
      assetName: "One Year Asset",
      purchaseYear: 2023,
      purchaseAmount: new D(1000000),
      usefulLife: 1,
      depreciationMethod: DepreciationMethod.STRAIGHT_LINE,
      accumulatedDepreciation: ZERO,
      netBookValue: new D(1000000),
      fullyDepreciated: false,
    };

    const state2023 = calculateAssetDepreciation(oneYearAsset, 2023);
    expect(state2023.depreciationExpense.toString()).toBe("1000000");
    expect(state2023.fullyDepreciated).toBe(false);

    const state2024 = calculateAssetDepreciation(
      oneYearAsset,
      2024,
      state2023.accumulatedDepreciation,
    );
    expect(state2024.depreciationExpense.toString()).toBe("0");
    expect(state2024.fullyDepreciated).toBe(true);
  });

  it("should handle very long useful life", () => {
    const longLifeAsset: CapExAsset = {
      id: "long-life-1",
      assetName: "100 Year Asset",
      purchaseYear: 2023,
      purchaseAmount: new D(100000000),
      usefulLife: 100,
      depreciationMethod: DepreciationMethod.STRAIGHT_LINE,
      accumulatedDepreciation: ZERO,
      netBookValue: new D(100000000),
      fullyDepreciated: false,
    };

    const state = calculateAssetDepreciation(longLifeAsset, 2023);

    // 100,000,000 / 100 = 1,000,000 per year
    expect(state.depreciationExpense.toString()).toBe("1000000");
  });

  it("should handle zero-value net PP&E gracefully", () => {
    const config: CapExConfiguration = {
      autoReinvestEnabled: false,
      existingAssets: [mockAssetOld], // Fully depreciated
      newAssets: [],
    };

    const depResult = calculateTotalDepreciation(config, 2025);
    const ppeTracker = calculatePPETracker(depResult, new D(500000), ZERO);

    // Net PP&E should be zero or very close
    expect(ppeTracker.netPPE.lessThanOrEqualTo(new D(0.01))).toBe(true);
  });

  it("should validate invalid new assets", () => {
    const invalidNewAsset: CapExAsset = {
      id: "invalid-new-1",
      assetName: "Invalid New Asset",
      purchaseYear: 2026,
      purchaseAmount: new D(-500000), // Invalid: negative
      usefulLife: -10, // Invalid: negative
      depreciationMethod: DepreciationMethod.STRAIGHT_LINE,
      accumulatedDepreciation: ZERO,
      netBookValue: ZERO,
      fullyDepreciated: false,
    };

    const config: CapExConfiguration = {
      autoReinvestEnabled: false,
      existingAssets: [],
      newAssets: [invalidNewAsset], // Test NEW assets validation
    };

    const validation = validateCapExConfig(config);
    expect(validation.valid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
  });

  it("should detect invalid reinvest frequency", () => {
    const config: CapExConfiguration = {
      autoReinvestEnabled: true,
      reinvestAmount: new D(1000000), // Has amount
      reinvestFrequency: -1, // Invalid: negative frequency
      existingAssets: [],
      newAssets: [],
    };

    const validation = validateCapExConfig(config);
    expect(validation.valid).toBe(false);
    expect(validation.errors.some((e) => e.includes("frequency"))).toBe(true);
  });

  it("should detect declining balance without depreciation rate", () => {
    const decliningAsset: CapExAsset = {
      id: "declining-1",
      assetName: "Declining Balance Asset",
      purchaseYear: 2023,
      purchaseAmount: new D(1000000),
      usefulLife: 10,
      depreciationMethod: DepreciationMethod.DECLINING_BALANCE,
      // Missing depreciationRate - this is required for declining balance
      accumulatedDepreciation: ZERO,
      netBookValue: new D(1000000),
      fullyDepreciated: false,
    };

    const config: CapExConfiguration = {
      autoReinvestEnabled: false,
      existingAssets: [decliningAsset],
      newAssets: [],
    };

    const validation = validateCapExConfig(config);
    expect(validation.valid).toBe(false);
    expect(validation.errors.some((e) => e.includes("Declining balance"))).toBe(
      true,
    );
  });

  it("should handle declining balance depreciation method", () => {
    const decliningAsset: CapExAsset = {
      id: "declining-1",
      assetName: "Declining Balance Asset",
      purchaseYear: 2023,
      purchaseAmount: new D(1000000),
      usefulLife: 10,
      depreciationMethod: DepreciationMethod.DECLINING_BALANCE,
      depreciationRate: new D(0.2), // 20% rate
      accumulatedDepreciation: ZERO,
      netBookValue: new D(1000000),
      fullyDepreciated: false,
    };

    // Currently returns ZERO as declining balance is a future enhancement
    const state = calculateAssetDepreciation(decliningAsset, 2023);
    expect(state.depreciationExpense.toString()).toBe("0");
  });

  it("should handle unknown depreciation method gracefully", () => {
    const unknownMethodAsset: CapExAsset = {
      id: "unknown-1",
      assetName: "Unknown Method Asset",
      purchaseYear: 2023,
      purchaseAmount: new D(1000000),
      usefulLife: 10,
      depreciationMethod: "UNKNOWN_METHOD" as DepreciationMethod,
      accumulatedDepreciation: ZERO,
      netBookValue: new D(1000000),
      fullyDepreciated: false,
    };

    // Should default to zero depreciation for unknown method
    const state = calculateAssetDepreciation(unknownMethodAsset, 2023);
    expect(state.depreciationExpense.toString()).toBe("0");
  });

  it("should validate valid auto-reinvestment with percent", () => {
    const config: CapExConfiguration = {
      autoReinvestEnabled: true,
      reinvestAmountPercent: new D(0.05), // 5% of revenue
      reinvestFrequency: 1,
      existingAssets: [],
      newAssets: [],
    };

    const validation = validateCapExConfig(config);
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it("should handle assets purchased before 2023", () => {
    const oldPurchaseAsset: CapExAsset = {
      id: "old-purchase-1",
      assetName: "Very Old Asset",
      purchaseYear: 2020, // Before valid range
      purchaseAmount: new D(1000000),
      usefulLife: 10,
      depreciationMethod: DepreciationMethod.STRAIGHT_LINE,
      accumulatedDepreciation: ZERO,
      netBookValue: new D(1000000),
      fullyDepreciated: false,
    };

    const config: CapExConfiguration = {
      autoReinvestEnabled: false,
      existingAssets: [oldPurchaseAsset],
      newAssets: [],
    };

    const validation = validateCapExConfig(config);
    expect(validation.valid).toBe(false);
    expect(
      validation.errors.some((e) => e.includes("Invalid purchase year")),
    ).toBe(true);
  });
});
