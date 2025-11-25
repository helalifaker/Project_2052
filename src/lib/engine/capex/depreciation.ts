/**
 * PHASE 2: CAPEX DEPRECIATION ENGINE (GAP 1)
 *
 * This module implements the depreciation calculation engine for PP&E assets.
 *
 * Key Features:
 * - GAP 1: Comprehensive depreciation tracking
 * - Straight-line depreciation method
 * - Asset pool management (OLD vs NEW assets)
 * - Accumulated depreciation tracking
 * - Net book value calculation
 * - Fully depreciated asset detection
 *
 * Asset Pools:
 * - OLD Pool: Assets from Historical period (2023-2024)
 * - NEW Pool: Assets acquired from Transition/Dynamic periods (2025+)
 *
 * @module capex/depreciation
 */

import type { CapExAsset, CapExConfiguration } from "../core/types";
import { DepreciationMethod } from "../core/types";
import { ZERO } from "../core/constants";
import {
  add,
  subtract,
  multiply,
  divide,
  min,
  max,
} from "../core/decimal-utils";
import type Decimal from "decimal.js";
import { Decimal as D } from "decimal.js";

// ============================================================================
// ASSET DEPRECIATION STATE
// ============================================================================

/**
 * Represents the depreciation state of an asset for a specific year.
 */
export interface AssetDepreciationState {
  assetId: string;
  // eslint-disable-next-line no-restricted-syntax -- year is an identifier, not a financial value
  year: number;
  // eslint-disable-next-line no-restricted-syntax -- age is a count, not a financial value
  age: number; // Years since purchase
  depreciationExpense: Decimal; // Depreciation for this year
  accumulatedDepreciation: Decimal; // Total depreciation to date
  netBookValue: Decimal; // Remaining value
  fullyDepreciated: boolean;
}

/**
 * Represents the total depreciation for all assets in a year.
 */
export interface TotalDepreciationResult {
  // eslint-disable-next-line no-restricted-syntax -- year is an identifier, not a financial value
  year: number;
  oldAssetsDepreciation: Decimal;
  newAssetsDepreciation: Decimal;
  totalDepreciation: Decimal;
  assetStates: AssetDepreciationState[];
}

// ============================================================================
// DEPRECIATION CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate depreciation expense for a single asset for a given year.
 *
 * Supports:
 * - Straight-line depreciation
 * - Declining balance (future enhancement)
 *
 * @param asset - The asset to depreciate
 * @param year - The calculation year
 * @param priorAccumulatedDepreciation - Accumulated depreciation from prior year
 * @returns Depreciation state for this year
 *
 * @example
 * const asset: CapExAsset = {
 *   id: "asset-1",
 *   assetName: "Building",
 *   purchaseYear: 2023,
 *   purchaseAmount: new D(10000000),
 *   usefulLife: 20,
 *   depreciationMethod: DepreciationMethod.STRAIGHT_LINE,
 *   accumulatedDepreciation: new D(500000),
 *   netBookValue: new D(9500000),
 *   fullyDepreciated: false,
 * };
 *
 * const state = calculateAssetDepreciation(asset, 2025, new D(1000000));
 * // Result: 500,000 depreciation expense for 2025
 */
export function calculateAssetDepreciation(
  asset: CapExAsset,
  // eslint-disable-next-line no-restricted-syntax -- year is an identifier, not a financial value
  year: number,
  priorAccumulatedDepreciation?: Decimal,
): AssetDepreciationState {
  // Asset not yet purchased - no depreciation
  if (year < asset.purchaseYear) {
    return {
      assetId: asset.id,
      year,
      age: 0,
      depreciationExpense: ZERO,
      accumulatedDepreciation: ZERO,
      netBookValue: asset.purchaseAmount,
      fullyDepreciated: false,
    };
  }

  // Calculate asset age (starts at 1 in purchase year)
  const age = year - asset.purchaseYear + 1;

  // Asset exceeded useful life - fully depreciated
  if (age > asset.usefulLife) {
    return {
      assetId: asset.id,
      year,
      age,
      depreciationExpense: ZERO,
      accumulatedDepreciation: asset.purchaseAmount,
      netBookValue: ZERO,
      fullyDepreciated: true,
    };
  }

  // Calculate depreciation based on method
  let depreciationExpense: Decimal;

  switch (asset.depreciationMethod) {
    case DepreciationMethod.STRAIGHT_LINE:
      depreciationExpense = calculateStraightLineDepreciation(asset);
      break;

    case DepreciationMethod.DECLINING_BALANCE:
      // Future enhancement
      depreciationExpense = ZERO;
      break;

    default:
      depreciationExpense = ZERO;
  }

  // Calculate accumulated depreciation
  const accumulatedDepreciation = priorAccumulatedDepreciation
    ? add(priorAccumulatedDepreciation, depreciationExpense)
    : multiply(depreciationExpense, new D(age));

  // Ensure accumulated depreciation doesn't exceed purchase amount
  const cappedAccumulatedDepreciation = min(
    accumulatedDepreciation,
    asset.purchaseAmount,
  );

  // Calculate net book value
  const netBookValue = max(
    subtract(asset.purchaseAmount, cappedAccumulatedDepreciation),
    ZERO,
  );

  // Check if fully depreciated (age exceeds useful life)
  // Note: An asset is marked fully depreciated only AFTER its useful life completes,
  // not during the final year when net book value reaches zero
  const fullyDepreciated = age > asset.usefulLife;

  return {
    assetId: asset.id,
    year,
    age,
    depreciationExpense,
    accumulatedDepreciation: cappedAccumulatedDepreciation,
    netBookValue,
    fullyDepreciated,
  };
}

/**
 * Calculate straight-line depreciation for an asset.
 *
 * Formula: Annual Depreciation = Purchase Amount / Useful Life
 *
 * @param asset - The asset to depreciate
 * @returns Annual depreciation expense
 */
function calculateStraightLineDepreciation(asset: CapExAsset): Decimal {
  if (asset.usefulLife <= 0) {
    throw new Error(
      `Invalid useful life for asset ${asset.id}: ${asset.usefulLife}`,
    );
  }

  return divide(asset.purchaseAmount, new D(asset.usefulLife));
}

/**
 * Calculate declining balance depreciation (future enhancement).
 *
 * Formula: Annual Depreciation = Net Book Value × Depreciation Rate
 *
 * @param asset - The asset to depreciate
 * @param netBookValue - Current net book value
 * @returns Annual depreciation expense
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function calculateDecliningBalanceDepreciation(
  asset: CapExAsset,
  netBookValue: Decimal,
): Decimal {
  if (!asset.depreciationRate) {
    throw new Error(`Depreciation rate not specified for asset ${asset.id}`);
  }

  return multiply(netBookValue, asset.depreciationRate);
}

// ============================================================================
// ASSET POOL DEPRECIATION
// ============================================================================

/**
 * Calculate total depreciation for all assets in a configuration for a given year.
 *
 * Separates OLD assets (historical) from NEW assets (transition/dynamic).
 *
 * @param config - CapEx configuration with asset pools
 * @param year - The calculation year
 * @param priorAssetStates - Optional: Asset states from prior year for continuity
 * @returns Total depreciation result with breakdown by pool
 *
 * @example
 * const config: CapExConfiguration = {
 *   autoReinvestEnabled: false,
 *   existingAssets: [oldAsset1, oldAsset2],
 *   newAssets: [newAsset1],
 * };
 *
 * const result = calculateTotalDepreciation(config, 2025);
 * console.log(result.totalDepreciation); // Total depreciation expense
 */
export function calculateTotalDepreciation(
  config: CapExConfiguration,
  // eslint-disable-next-line no-restricted-syntax -- year is an identifier, not a financial value
  year: number,
  priorAssetStates?: AssetDepreciationState[],
): TotalDepreciationResult {
  const assetStates: AssetDepreciationState[] = [];
  let oldAssetsDepreciation = ZERO;
  let newAssetsDepreciation = ZERO;

  // Helper to get prior accumulated depreciation for an asset
  const getPriorAccumulated = (assetId: string): Decimal | undefined => {
    if (!priorAssetStates) return undefined;
    const priorState = priorAssetStates.find((s) => s.assetId === assetId);
    return priorState?.accumulatedDepreciation;
  };

  // Depreciate OLD assets (from historical period)
  for (const asset of config.existingAssets) {
    const priorAccumulated = getPriorAccumulated(asset.id);
    const state = calculateAssetDepreciation(asset, year, priorAccumulated);
    assetStates.push(state);
    oldAssetsDepreciation = add(
      oldAssetsDepreciation,
      state.depreciationExpense,
    );
  }

  // Depreciate NEW assets (from transition/dynamic periods)
  for (const asset of config.newAssets) {
    const priorAccumulated = getPriorAccumulated(asset.id);
    const state = calculateAssetDepreciation(asset, year, priorAccumulated);
    assetStates.push(state);
    newAssetsDepreciation = add(
      newAssetsDepreciation,
      state.depreciationExpense,
    );
  }

  const totalDepreciation = add(oldAssetsDepreciation, newAssetsDepreciation);

  return {
    year,
    oldAssetsDepreciation,
    newAssetsDepreciation,
    totalDepreciation,
    assetStates,
  };
}

// ============================================================================
// MULTI-YEAR DEPRECIATION SCHEDULE
// ============================================================================

/**
 * Generate a multi-year depreciation schedule for all assets.
 *
 * Useful for projections and validation.
 *
 * @param config - CapEx configuration
 * @param startYear - First year of projection
 * @param endYear - Last year of projection
 * @returns Array of depreciation results by year
 *
 * @example
 * const schedule = generateDepreciationSchedule(config, 2023, 2053);
 * schedule.forEach(result => {
 *   console.log(`${result.year}: $${result.totalDepreciation}`);
 * });
 */
export function generateDepreciationSchedule(
  config: CapExConfiguration,
  // eslint-disable-next-line no-restricted-syntax -- year parameters are identifiers, not financial values
  startYear: number,
  // eslint-disable-next-line no-restricted-syntax -- year parameters are identifiers, not financial values
  endYear: number,
): TotalDepreciationResult[] {
  const schedule: TotalDepreciationResult[] = [];
  let priorAssetStates: AssetDepreciationState[] | undefined;

  for (let year = startYear; year <= endYear; year++) {
    const result = calculateTotalDepreciation(config, year, priorAssetStates);
    schedule.push(result);
    priorAssetStates = result.assetStates;
  }

  return schedule;
}

// ============================================================================
// PP&E TRACKING
// ============================================================================

/**
 * Track PP&E and accumulated depreciation over time.
 */
export interface PPETracker {
  // eslint-disable-next-line no-restricted-syntax -- year is an identifier, not a financial value
  year: number;
  grossPPE: Decimal; // Total purchase amount
  accumulatedDepreciation: Decimal; // Total accumulated depreciation
  netPPE: Decimal; // Gross PP&E - Accumulated Depreciation
  // eslint-disable-next-line no-restricted-syntax -- count is not a financial value
  activeAssets: number; // Number of assets still depreciating
  // eslint-disable-next-line no-restricted-syntax -- count is not a financial value
  fullyDepreciatedAssets: number; // Number of fully depreciated assets
}

/**
 * Calculate PP&E tracker state for a given year.
 *
 * @param depreciationResult - Depreciation result for the year
 * @param priorGrossPPE - Gross PP&E from prior year
 * @param newCapexSpending - New CapEx spending this year
 * @returns PP&E tracker state
 */
export function calculatePPETracker(
  depreciationResult: TotalDepreciationResult,
  priorGrossPPE: Decimal,
  newCapexSpending: Decimal,
): PPETracker {
  // Update gross PP&E with new spending
  const grossPPE = add(priorGrossPPE, newCapexSpending);

  // Sum accumulated depreciation from all assets
  const accumulatedDepreciation = depreciationResult.assetStates.reduce(
    (sum, state) => add(sum, state.accumulatedDepreciation),
    ZERO,
  );

  // Calculate net PP&E
  const netPPE = subtract(grossPPE, accumulatedDepreciation);

  // Count active vs fully depreciated assets
  const fullyDepreciatedAssets = depreciationResult.assetStates.filter(
    (s) => s.fullyDepreciated,
  ).length;
  const activeAssets =
    depreciationResult.assetStates.length - fullyDepreciatedAssets;

  return {
    year: depreciationResult.year,
    grossPPE,
    accumulatedDepreciation,
    netPPE: max(netPPE, ZERO),
    activeAssets,
    fullyDepreciatedAssets,
  };
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate CapEx configuration for consistency.
 */
export function validateCapExConfig(config: CapExConfiguration): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate existing assets
  for (const asset of config.existingAssets) {
    const assetErrors = validateAsset(asset);
    errors.push(...assetErrors);
  }

  // Validate new assets
  for (const asset of config.newAssets) {
    const assetErrors = validateAsset(asset);
    errors.push(...assetErrors);
  }

  // Validate auto-reinvestment
  if (config.autoReinvestEnabled) {
    if (!config.reinvestAmount && !config.reinvestAmountPercent) {
      errors.push("Auto-reinvestment enabled but no amount specified");
    }
    if (config.reinvestFrequency && config.reinvestFrequency <= 0) {
      errors.push("Reinvest frequency must be positive");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate a single asset for consistency.
 */
function validateAsset(asset: CapExAsset): string[] {
  const errors: string[] = [];

  if (asset.purchaseAmount.lessThanOrEqualTo(ZERO)) {
    errors.push(`Asset ${asset.id}: Purchase amount must be positive`);
  }

  if (asset.usefulLife <= 0) {
    errors.push(`Asset ${asset.id}: Useful life must be positive`);
  }

  if (asset.purchaseYear < 2023 || asset.purchaseYear > 2053) {
    errors.push(
      `Asset ${asset.id}: Invalid purchase year ${asset.purchaseYear}`,
    );
  }

  if (
    asset.depreciationMethod === DepreciationMethod.DECLINING_BALANCE &&
    !asset.depreciationRate
  ) {
    errors.push(
      `Asset ${asset.id}: Declining balance requires depreciation rate`,
    );
  }

  if (asset.accumulatedDepreciation.greaterThan(asset.purchaseAmount)) {
    errors.push(
      `Asset ${asset.id}: Accumulated depreciation exceeds purchase amount`,
    );
  }

  return errors;
}

/**
 * Export all functions for testing and external use.
 */
export const depreciationExports = {
  calculateAssetDepreciation,
  calculateTotalDepreciation,
  generateDepreciationSchedule,
  calculatePPETracker,
  validateCapExConfig,
};
