/**
 * PHASE 2: PP&E TRACKER MODULE
 *
 * This module provides comprehensive tracking of Property, Plant & Equipment (PP&E)
 * over the 30-year projection period.
 *
 * Key Features:
 * - Track gross PP&E (total purchase amounts)
 * - Track accumulated depreciation
 * - Calculate net PP&E (Net Book Value)
 * - Monitor asset lifecycle (active vs fully depreciated)
 * - Track CapEx spending by period
 *
 * @module capex/ppe-tracker
 */

import type { CapExAsset, CapExConfiguration } from "../core/types";
import { ZERO } from "../core/constants";
import { add, subtract, max } from "../core/decimal-utils";
import type Decimal from "decimal.js";
import { Decimal as D } from "decimal.js";
import {
  calculateTotalDepreciation,
  type TotalDepreciationResult,
  type AssetDepreciationState,
} from "./depreciation";

// ============================================================================
// PP&E STATE TRACKING
// ============================================================================

/**
 * Complete PP&E state for a single year.
 */
export interface PPEState {
  year: number;

  // Gross PP&E (Cost)
  grossPPE: Decimal; // Total purchase amount of all assets

  // Depreciation
  accumulatedDepreciation: Decimal; // Total accumulated depreciation
  depreciationExpense: Decimal; // Current year depreciation

  // Net PP&E
  netPPE: Decimal; // Gross PP&E - Accumulated Depreciation

  // CapEx tracking
  capexSpending: Decimal; // New CapEx spending this year
  cumulativeCapex: Decimal; // Total CapEx since inception

  // Asset counts
  totalAssets: number;
  activeAssets: number; // Assets still depreciating
  fullyDepreciatedAssets: number; // Assets fully depreciated

  // Asset states (detailed)
  assetStates: AssetDepreciationState[];
}

/**
 * Multi-year PP&E projection.
 */
export interface PPEProjection {
  startYear: number;
  endYear: number;
  yearlyStates: PPEState[];

  // Summary statistics
  totalCapexSpending: Decimal;
  peakGrossPPE: Decimal;
  peakNetPPE: Decimal;
  averageAnnualDepreciation: Decimal;
}

// ============================================================================
// PP&E CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate complete PP&E state for a single year.
 *
 * @param year - Calculation year
 * @param config - CapEx configuration
 * @param priorState - Prior year PP&E state (undefined for first year)
 * @param newCapexSpending - New CapEx spending this year
 * @returns Complete PP&E state for this year
 *
 * @example
 * const state = calculatePPEState(2025, config, priorState, new D(500000));
 * console.log(`Net PP&E: ${state.netPPE}`);
 */
export function calculatePPEState(
  year: number,
  config: CapExConfiguration,
  priorState: PPEState | undefined,
  newCapexSpending: Decimal,
): PPEState {
  // Calculate depreciation for all assets
  const depreciationResult = calculateTotalDepreciation(
    config,
    year,
    priorState?.assetStates,
  );

  // Calculate gross PP&E (prior gross + new spending)
  const priorGrossPPE = priorState?.grossPPE || ZERO;
  const grossPPE = add(priorGrossPPE, newCapexSpending);

  // Accumulated depreciation from asset states
  const accumulatedDepreciation = depreciationResult.assetStates.reduce(
    (sum, state) => add(sum, state.accumulatedDepreciation),
    ZERO,
  );

  // Net PP&E
  const netPPE = max(subtract(grossPPE, accumulatedDepreciation), ZERO);

  // Cumulative CapEx
  const priorCumulativeCapex = priorState?.cumulativeCapex || ZERO;
  const cumulativeCapex = add(priorCumulativeCapex, newCapexSpending);

  // Asset counts
  const fullyDepreciatedAssets = depreciationResult.assetStates.filter(
    (s) => s.fullyDepreciated,
  ).length;
  const totalAssets = depreciationResult.assetStates.length;
  const activeAssets = totalAssets - fullyDepreciatedAssets;

  return {
    year,
    grossPPE,
    accumulatedDepreciation,
    depreciationExpense: depreciationResult.totalDepreciation,
    netPPE,
    capexSpending: newCapexSpending,
    cumulativeCapex,
    totalAssets,
    activeAssets,
    fullyDepreciatedAssets,
    assetStates: depreciationResult.assetStates,
  };
}

/**
 * Generate a multi-year PP&E projection.
 *
 * @param config - CapEx configuration
 * @param startYear - First year of projection
 * @param endYear - Last year of projection
 * @param capexSchedule - Map of year to CapEx spending amount
 * @returns Complete PP&E projection
 *
 * @example
 * const capexSchedule = new Map([
 *   [2025, new D(500000)],
 *   [2028, new D(1000000)],
 * ]);
 *
 * const projection = generatePPEProjection(config, 2023, 2053, capexSchedule);
 * console.log(`Total CapEx: ${projection.totalCapexSpending}`);
 */
export function generatePPEProjection(
  config: CapExConfiguration,
  startYear: number,
  endYear: number,
  capexSchedule: Map<number, Decimal>,
): PPEProjection {
  const yearlyStates: PPEState[] = [];
  let priorState: PPEState | undefined;

  // Generate state for each year
  for (let year = startYear; year <= endYear; year++) {
    const newCapexSpending = capexSchedule.get(year) || ZERO;
    const state = calculatePPEState(year, config, priorState, newCapexSpending);
    yearlyStates.push(state);
    priorState = state;
  }

  // Calculate summary statistics
  const totalCapexSpending = yearlyStates.reduce(
    (sum, state) => add(sum, state.capexSpending),
    ZERO,
  );

  const peakGrossPPE = yearlyStates.reduce(
    (peak, state) => max(peak, state.grossPPE),
    ZERO,
  );

  const peakNetPPE = yearlyStates.reduce(
    (peak, state) => max(peak, state.netPPE),
    ZERO,
  );

  const totalDepreciation = yearlyStates.reduce(
    (sum, state) => add(sum, state.depreciationExpense),
    ZERO,
  );

  const yearsCount = yearlyStates.length;
  const averageAnnualDepreciation =
    yearsCount > 0 ? totalDepreciation.div(yearsCount) : ZERO;

  return {
    startYear,
    endYear,
    yearlyStates,
    totalCapexSpending,
    peakGrossPPE,
    peakNetPPE,
    averageAnnualDepreciation,
  };
}

// ============================================================================
// AUTO-REINVESTMENT LOGIC
// ============================================================================

/**
 * Calculate auto-reinvestment amount for a given year.
 *
 * Supports:
 * - Fixed amount reinvestment
 * - Revenue-based reinvestment
 * - Periodic reinvestment (every N years)
 *
 * @param year - Calculation year
 * @param config - CapEx configuration
 * @param totalRevenue - Total revenue for the year (for % based)
 * @returns CapEx spending amount for this year
 *
 * @example
 * const capex = calculateAutoReinvestment(2030, config, new D(20000000));
 * // Returns reinvestment amount if applicable, otherwise ZERO
 */
export function calculateAutoReinvestment(
  year: number,
  config: CapExConfiguration,
  totalRevenue: Decimal,
): Decimal {
  // Auto-reinvestment not enabled
  if (!config.autoReinvestEnabled) {
    return ZERO;
  }

  // Check if this is a reinvestment year (based on frequency)
  if (config.reinvestFrequency) {
    const baseYear = config.existingAssets[0]?.purchaseYear || year;
    const yearsElapsed = year - baseYear;

    // Only reinvest on frequency intervals
    if (yearsElapsed % config.reinvestFrequency !== 0) {
      return ZERO;
    }
  }

  // Fixed amount reinvestment
  if (config.reinvestAmount) {
    return config.reinvestAmount;
  }

  // Revenue-based reinvestment
  if (config.reinvestAmountPercent) {
    return totalRevenue.mul(config.reinvestAmountPercent);
  }

  return ZERO;
}

// ============================================================================
// PP&E ANALYSIS & REPORTING
// ============================================================================

/**
 * Analyze PP&E health and provide insights.
 */
export interface PPEAnalysis {
  year: number;

  // Ratios
  depreciationRate: Decimal; // Depreciation / Gross PP&E
  netPPERatio: Decimal; // Net PP&E / Gross PP&E (newness indicator)

  // Asset age
  averageAssetAge: number; // Average age of active assets
  oldestAssetAge: number;
  newestAssetAge: number;

  // Health indicators
  fullyDepreciatedPercent: Decimal; // % of assets fully depreciated
  needsReinvestment: boolean; // Flag if most assets are old
}

/**
 * Analyze PP&E state for a given year.
 *
 * @param state - PP&E state to analyze
 * @returns Analysis results with health indicators
 */
export function analyzePPEState(state: PPEState): PPEAnalysis {
  // Calculate depreciation rate
  const depreciationRate = state.grossPPE.greaterThan(ZERO)
    ? state.depreciationExpense.div(state.grossPPE)
    : ZERO;

  // Calculate net PP&E ratio (indicator of asset newness)
  const netPPERatio = state.grossPPE.greaterThan(ZERO)
    ? state.netPPE.div(state.grossPPE)
    : ZERO;

  // Calculate average asset age (active assets only)
  const activeAssetStates = state.assetStates.filter(
    (s) => !s.fullyDepreciated,
  );
  const totalAge = activeAssetStates.reduce((sum, s) => sum + s.age, 0);
  const averageAssetAge =
    activeAssetStates.length > 0
      ? Math.round(totalAge / activeAssetStates.length)
      : 0;

  // Find oldest and newest assets
  const ages = activeAssetStates.map((s) => s.age);
  const oldestAssetAge = ages.length > 0 ? Math.max(...ages) : 0;
  const newestAssetAge = ages.length > 0 ? Math.min(...ages) : 0;

  // Calculate fully depreciated percentage
  const fullyDepreciatedPercent =
    state.totalAssets > 0
      ? new D(state.fullyDepreciatedAssets).div(state.totalAssets)
      : ZERO;

  // Check if reinvestment is needed (e.g., >50% of assets fully depreciated)
  const needsReinvestment = fullyDepreciatedPercent.greaterThan(new D(0.5));

  return {
    year: state.year,
    depreciationRate,
    netPPERatio,
    averageAssetAge,
    oldestAssetAge,
    newestAssetAge,
    fullyDepreciatedPercent,
    needsReinvestment,
  };
}

/**
 * Export all functions for testing and external use.
 */
export const ppeTrackerExports = {
  calculatePPEState,
  generatePPEProjection,
  calculateAutoReinvestment,
  analyzePPEState,
};
