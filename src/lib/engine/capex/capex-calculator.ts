/**
 * CAPEX CALCULATOR
 *
 * Handles category-based capital expenditure calculations with two depreciation streams:
 * 1. Historical depreciation (2024 baseline continuing until fully amortized)
 * 2. New asset depreciation (from 2025+ investments with category-specific useful lives)
 *
 * Supports three periods:
 * - Historical (2023-2024): No new CAPEX, only depreciation continuation
 * - Transition (2025-2027): Manual CAPEX input by category
 * - Dynamic (2028-2053): Auto-reinvestment by category frequency
 */

import Decimal from "decimal.js";
import {
  CapExCategoryConfig,
  CapExCategoryType,
  CapExConfiguration,
  CapExTransitionEntry,
  CapExVirtualAsset,
  CapExYearResult,
  HistoricalDepreciationState,
} from "@/lib/engine/core/types";
import {
  ZERO,
  ONE,
} from "@/lib/engine/core/constants";
import {
  add,
  subtract,
  divide,
  multiply,
  isGreaterThan,
  isGreaterThanOrEqual,
  isLessThan,
  isLessThanOrEqual,
} from "@/lib/engine/core/decimal-utils";

// ============================================================================
// HISTORICAL DEPRECIATION
// ============================================================================

/**
 * Calculate historical depreciation for a year.
 *
 * Continues the 2024 depreciation amount each year until fully amortized.
 * Once accumulated depreciation reaches gross PPE, depreciation stops.
 *
 * @param state Current historical depreciation state
 * @param year Target year
 * @returns Depreciation expense for the year (0 if fully amortized)
 */
export function calculateHistoricalDepreciation(
  state: HistoricalDepreciationState,
  year: number
): Decimal {
  // If nothing remaining to depreciate, no depreciation
  if (isLessThanOrEqual(state.remainingToDepreciate, ZERO)) {
    return ZERO;
  }

  // Depreciate up to the remaining amount
  return state.annualDepreciation;
}

/**
 * Update historical depreciation state for next year.
 *
 * @param state Current state
 * @returns Updated state with accumulated depreciation increased
 */
export function updateHistoricalDepreciationState(
  state: HistoricalDepreciationState
): HistoricalDepreciationState {
  const newAccumulated = add(
    state.accumulatedDepreciation2024,
    state.annualDepreciation
  );
  const newRemaining = subtract(
    state.grossPPE2024,
    newAccumulated
  );

  return {
    ...state,
    accumulatedDepreciation2024: newAccumulated,
    remainingToDepreciate: isGreaterThan(newRemaining, ZERO) ? newRemaining : ZERO,
  };
}

// ============================================================================
// NEW ASSET DEPRECIATION (Virtual Assets)
// ============================================================================

/**
 * Calculate depreciation for a single virtual asset.
 *
 * Straight-line method:
 * - Depreciation starts in purchase year (age=0)
 * - Annual depreciation = purchaseAmount / usefulLife
 * - Stops when age >= usefulLife
 *
 * @param asset The virtual asset
 * @param year Target year
 * @returns Depreciation expense for this year
 */
export function calculateAssetDepreciation(
  asset: CapExVirtualAsset,
  year: number
): Decimal {
  const age = year - asset.purchaseYear;

  // Not purchased yet
  if (age < 0) {
    return ZERO;
  }

  // Fully depreciated (age >= usefulLife means no more depreciation)
  if (age >= asset.usefulLife) {
    return ZERO;
  }

  // Annual depreciation = purchaseAmount / usefulLife
  // Age 0 = purchase year, still depreciates
  return divide(asset.purchaseAmount, new Decimal(asset.usefulLife));
}

/**
 * Calculate total depreciation for all virtual assets in a year.
 *
 * @param virtualAssets Array of virtual assets
 * @param year Target year
 * @returns { total, byCategory } depreciation breakdown
 */
export function calculateNewAssetDepreciation(
  virtualAssets: CapExVirtualAsset[],
  year: number
): {
  total: Decimal;
  byCategory: Map<CapExCategoryType, Decimal>;
} {
  let total = ZERO;
  const byCategory = new Map<CapExCategoryType, Decimal>();

  for (const asset of virtualAssets) {
    const assetDepr = calculateAssetDepreciation(asset, year);
    if (isGreaterThan(assetDepr, ZERO)) {
      total = add(total, assetDepr);
      const categoryTotal = byCategory.get(asset.categoryType) || ZERO;
      byCategory.set(asset.categoryType, add(categoryTotal, assetDepr));
    }
  }

  return { total, byCategory };
}

// ============================================================================
// CAPEX SPENDING CALCULATION
// ============================================================================

/**
 * Check if reinvestment is due for a category in a given year.
 *
 * Uses category's reinvestStartYear if configured, otherwise defaults to 2028.
 * Triggers when: (year - startYear) % frequency === 0 AND year > startYear
 *
 * @param category Category configuration
 * @param year Target year
 * @param baseYear Fallback start year (default: 2028), used if category.reinvestStartYear is not set
 * @returns true if reinvestment is due this year
 */
export function isReinvestmentDue(
  category: CapExCategoryConfig,
  year: number,
  baseYear: number = 2028
): boolean {
  // No frequency configured = no auto-reinvestment
  if (!category.reinvestFrequency) {
    return false;
  }

  // Use category-specific start year if configured, otherwise fall back to baseYear
  const startYear = category.reinvestStartYear ?? baseYear;

  const yearsSinceStart = year - startYear;

  // Don't trigger before or in start year (year 0)
  if (yearsSinceStart <= 0) {
    return false;
  }

  // Check if divisible by frequency
  return yearsSinceStart % category.reinvestFrequency === 0;
}

/**
 * Calculate CAPEX spending for a year across all categories.
 *
 * Handles three periods:
 * - Historical (2023-2024): No new CAPEX
 * - Transition (2025-2027): Manual input per category
 * - Dynamic (2028-2053): Auto-reinvestment by frequency
 *
 * @param year Target year
 * @param config CAPEX configuration
 * @param period Period type: 'historical' | 'transition' | 'dynamic'
 * @returns { total, byCategory } CAPEX spending breakdown
 */
export function calculateCapexSpending(
  year: number,
  config: CapExConfiguration,
  period: "historical" | "transition" | "dynamic"
): {
  total: Decimal;
  byCategory: Map<CapExCategoryType, Decimal>;
} {
  const byCategory = new Map<CapExCategoryType, Decimal>();

  if (period === "historical") {
    // No new CAPEX in historical period
    return { total: ZERO, byCategory };
  }

  if (period === "transition") {
    // Manual CAPEX input
    let total = ZERO;
    for (const entry of config.transitionCapex) {
      if (entry.year === year) {
        const existing = byCategory.get(entry.categoryType) || ZERO;
        byCategory.set(entry.categoryType, add(existing, entry.amount));
        total = add(total, entry.amount);
      }
    }
    return { total, byCategory };
  }

  if (period === "dynamic") {
    let total = ZERO;

    // 1. Auto-reinvestment based on category frequency
    for (const category of config.categories) {
      if (isReinvestmentDue(category, year)) {
        if (category.reinvestAmount) {
          const existing = byCategory.get(category.type) || ZERO;
          byCategory.set(category.type, add(existing, category.reinvestAmount));
          total = add(total, category.reinvestAmount);
        }
      }
    }

    // 2. Manual items (virtual assets with purchaseYear === current year)
    // These are manual CAPEX items added for specific years (e.g., 2028 IT Equipment)
    for (const asset of config.virtualAssets) {
      if (asset.purchaseYear === year) {
        const existing = byCategory.get(asset.categoryType) || ZERO;
        byCategory.set(asset.categoryType, add(existing, asset.purchaseAmount));
        total = add(total, asset.purchaseAmount);
      }
    }

    return { total, byCategory };
  }

  return { total: ZERO, byCategory };
}

// ============================================================================
// VIRTUAL ASSET CREATION
// ============================================================================

/**
 * Create a virtual asset from CAPEX spending.
 *
 * @param categoryType Category type
 * @param year Purchase year
 * @param amount Purchase amount
 * @param usefulLife Category's useful life
 * @returns New virtual asset
 */
export function createVirtualAsset(
  categoryType: CapExCategoryType,
  year: number,
  amount: Decimal,
  usefulLife: number
): CapExVirtualAsset {
  return {
    id: `asset-${categoryType}-${year}-${Date.now()}`,
    categoryType,
    purchaseYear: year,
    purchaseAmount: amount,
    usefulLife,
  };
}

/**
 * Generate virtual assets for a given year based on CAPEX spending.
 *
 * @param year Target year
 * @param capexSpending CAPEX breakdown by category
 * @param config CAPEX configuration
 * @returns Array of new virtual assets created
 */
export function generateVirtualAssetsForYear(
  year: number,
  capexSpending: Map<CapExCategoryType, Decimal>,
  config: CapExConfiguration
): CapExVirtualAsset[] {
  const newAssets: CapExVirtualAsset[] = [];

  for (const [categoryType, amount] of capexSpending.entries()) {
    if (isGreaterThan(amount, ZERO)) {
      // Find category config to get useful life
      const category = config.categories.find((c) => c.type === categoryType);
      if (category) {
        const asset = createVirtualAsset(categoryType, year, amount, category.usefulLife);
        newAssets.push(asset);
      }
    }
  }

  return newAssets;
}

// ============================================================================
// COMBINED CAPEX YEAR RESULT
// ============================================================================

/**
 * Calculate complete CAPEX result for a year.
 *
 * Combines:
 * - Historical depreciation (if not fully amortized)
 * - New asset depreciation (from all virtual assets)
 * - CAPEX spending (creates new virtual assets)
 * - PPE tracking (Gross, Accumulated Depreciation, Net)
 *
 * @param year Target year
 * @param config CAPEX configuration
 * @param period Period type
 * @param priorGrossPPE Prior year Gross PPE
 * @param priorAccumulatedDepr Prior year Accumulated Depreciation
 * @param priorHistoricalState Prior historical depreciation state
 * @returns Complete CAPEX result for the year
 */
export function calculateCapexYearResult(
  year: number,
  config: CapExConfiguration,
  period: "historical" | "transition" | "dynamic",
  priorGrossPPE: Decimal,
  priorAccumulatedDepr: Decimal,
  priorHistoricalState: HistoricalDepreciationState
): CapExYearResult {
  // Step 1: Calculate historical depreciation
  const historicalDepr = calculateHistoricalDepreciation(
    priorHistoricalState,
    year
  );

  // Step 2: Calculate CAPEX spending
  const capexSpending = calculateCapexSpending(year, config, period);

  // Step 3: Generate virtual assets from CAPEX spending
  const newAssetsThisYear = generateVirtualAssetsForYear(
    year,
    capexSpending.byCategory,
    config
  );

  // Step 4: Calculate new asset depreciation
  const allVirtualAssets = [
    ...config.virtualAssets,
    ...newAssetsThisYear,
  ];
  const newAssetDepr = calculateNewAssetDepreciation(allVirtualAssets, year);

  // Step 5: Calculate PPE
  const totalDepreciation = add(historicalDepr, newAssetDepr.total);
  const grossPPE = add(priorGrossPPE, capexSpending.total);
  const accumulatedDepreciation = add(priorAccumulatedDepr, totalDepreciation);
  const netPPE = subtract(grossPPE, accumulatedDepreciation);

  return {
    year,
    spending: capexSpending.total,
    spendingByCategory: capexSpending.byCategory,
    historicalDepreciation: historicalDepr,
    newAssetDepreciation: newAssetDepr.total,
    totalDepreciation,
    grossPPE,
    accumulatedDepreciation,
    netPPE,
    newAssets: newAssetsThisYear,
  };
}

// ============================================================================
// FULL SCHEDULE GENERATION
// ============================================================================

/**
 * Generate complete CAPEX schedule for all 30 years (2023-2053).
 *
 * @param config Complete CAPEX configuration
 * @returns Map of year -> CapExYearResult
 */
export function generateCapexSchedule(
  config: CapExConfiguration,
  dynamicEndYear: number = 2057 // Variable based on contract period: 2052 for 25 years, 2057 for 30 years
): Map<number, CapExYearResult> {
  const results = new Map<number, CapExYearResult>();
  let currentGrossPPE = config.historicalState.grossPPE2024;
  let currentAccumulatedDepr = config.historicalState.accumulatedDepreciation2024;
  let currentHistoricalState = config.historicalState;
  let currentVirtualAssets = [...config.virtualAssets];

  // 2023-2024: Historical period
  for (let year = 2023; year <= 2024; year++) {
    const result = calculateCapexYearResult(
      year,
      { ...config, virtualAssets: currentVirtualAssets },
      "historical",
      currentGrossPPE,
      currentAccumulatedDepr,
      currentHistoricalState
    );

    results.set(year, result);

    // Update for next year
    currentGrossPPE = result.grossPPE;
    currentAccumulatedDepr = result.accumulatedDepreciation;
    currentHistoricalState = updateHistoricalDepreciationState(
      currentHistoricalState
    );
    currentVirtualAssets = [...currentVirtualAssets, ...result.newAssets];
  }

  // 2025-2027: Transition period
  for (let year = 2025; year <= 2027; year++) {
    const result = calculateCapexYearResult(
      year,
      { ...config, virtualAssets: currentVirtualAssets },
      "transition",
      currentGrossPPE,
      currentAccumulatedDepr,
      currentHistoricalState
    );

    results.set(year, result);

    // Update for next year
    currentGrossPPE = result.grossPPE;
    currentAccumulatedDepr = result.accumulatedDepreciation;
    currentHistoricalState = updateHistoricalDepreciationState(
      currentHistoricalState
    );
    currentVirtualAssets = [...currentVirtualAssets, ...result.newAssets];
  }

  // 2028-20XX: Dynamic period (variable end year)
  for (let year = 2028; year <= dynamicEndYear; year++) {
    const result = calculateCapexYearResult(
      year,
      { ...config, virtualAssets: currentVirtualAssets },
      "dynamic",
      currentGrossPPE,
      currentAccumulatedDepr,
      currentHistoricalState
    );

    results.set(year, result);

    // Update for next year
    currentGrossPPE = result.grossPPE;
    currentAccumulatedDepr = result.accumulatedDepreciation;
    currentHistoricalState = updateHistoricalDepreciationState(
      currentHistoricalState
    );
    currentVirtualAssets = [...currentVirtualAssets, ...result.newAssets];
  }

  return results;
}

// ============================================================================
// VALIDATION & HELPER FUNCTIONS
// ============================================================================

/**
 * Validate CAPEX configuration for common issues.
 *
 * @param config Configuration to validate
 * @returns Array of validation errors (empty if valid)
 */
export function validateCapexConfig(config: CapExConfiguration): string[] {
  const errors: string[] = [];

  // Check categories exist
  if (!config.categories || config.categories.length === 0) {
    errors.push("No CAPEX categories configured");
  }

  // Check each category
  for (const category of config.categories || []) {
    if (!category.usefulLife || category.usefulLife <= 0) {
      errors.push(`Category ${category.name}: Invalid useful life`);
    }

    if (
      category.reinvestFrequency &&
      (category.reinvestFrequency < 1 || category.reinvestFrequency > 30)
    ) {
      errors.push(
        `Category ${category.name}: Reinvestment frequency must be 1-30 years`
      );
    }

    if (
      category.reinvestAmount &&
      isLessThanOrEqual(category.reinvestAmount, ZERO)
    ) {
      errors.push(`Category ${category.name}: Reinvestment amount must be positive`);
    }
  }

  // Check historical state
  if (
    !config.historicalState ||
    isLessThanOrEqual(config.historicalState.grossPPE2024, ZERO)
  ) {
    errors.push("Invalid historical depreciation state");
  }

  return errors;
}

/**
 * Get all categories that will have reinvestments during dynamic period.
 *
 * Each category uses its own reinvestStartYear if configured.
 *
 * @param config CAPEX configuration
 * @param dynamicPeriodStart Dynamic period start year (default: 2028)
 * @param endYear Dynamic period end year (default: 2053)
 * @returns Map of category -> array of years when reinvestment occurs
 */
export function getReinvestmentSchedule(
  config: CapExConfiguration,
  dynamicPeriodStart: number = 2028,
  endYear: number = 2053
): Map<CapExCategoryType, number[]> {
  const schedule = new Map<CapExCategoryType, number[]>();

  for (const category of config.categories) {
    const years: number[] = [];
    // Use category-specific start year if configured
    const startYear = category.reinvestStartYear ?? dynamicPeriodStart;
    for (let year = startYear; year <= endYear; year++) {
      if (isReinvestmentDue(category, year, dynamicPeriodStart)) {
        years.push(year);
      }
    }
    if (years.length > 0) {
      schedule.set(category.type, years);
    }
  }

  return schedule;
}
