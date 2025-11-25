/**
 * Unit Tests for Transition Period Calculator
 *
 * Tests cover:
 * - Transition period calculation (2025-2027)
 * - Pre-fill logic (GAP 19)
 * - Ratio-based revenue and expense projections
 * - Period linkage (2024→2025)
 * - All 3 rent models (Fixed, Revenue Share, Partner Investment)
 * - Working capital ratio application
 * - Balance sheet balancing
 * - Cash flow reconciliation
 * - Validation and edge cases
 */

import { describe, it, expect, vi } from "vitest";
import Decimal from "decimal.js";
import {
  calculateTransitionPeriod,
  validateTransitionPeriod,
  validatePeriodLinkage,
} from "./transition";
import { calculateHistoricalPeriod } from "./historical";
import type {
  TransitionPeriodInput,
  SystemConfiguration,
  FinancialPeriod,
  WorkingCapitalRatios,
  FixedRentParams,
  RevenueShareParams,
  PartnerInvestmentParams,
  HistoricalPeriodInput,
} from "../core/types";
import { PeriodType, RentModel } from "../core/types";
import { ZERO } from "../core/constants";

// ============================================================================
// TEST DATA HELPERS
// ============================================================================

/**
 * Create a sample system configuration
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
 * Create sample working capital ratios (from 2024)
 */
function createWorkingCapitalRatios(): WorkingCapitalRatios {
  return {
    arPercent: new Decimal(0.1), // 10% of revenue
    prepaidPercent: new Decimal(0.05), // 5% of opex
    apPercent: new Decimal(0.08), // 8% of opex
    accruedPercent: new Decimal(0.05), // 5% of opex
    deferredRevenuePercent: new Decimal(0.15), // 15% of revenue
    otherRevenueRatio: new Decimal(0.1), // 10% of tuition revenue (Section 1.3)
    locked: false,
    calculatedFrom2024: true,
  };
}

/**
 * Create a sample historical period (2024) to use as previous period
 */
function createPreviousPeriod2024(): FinancialPeriod {
  const input: HistoricalPeriodInput = {
    year: 2024,
    profitLoss: {
      // Use new structure with separate tuition and other revenue
      tuitionRevenue: new Decimal(50000000), // 50M SAR tuition
      otherRevenue: new Decimal(5000000), // 5M SAR other (10% of tuition)
      revenue: new Decimal(55000000), // 55M SAR total (for backward compatibility)
      rent: new Decimal(10000000), // 10M SAR
      staffCosts: new Decimal(20000000), // 20M SAR
      otherOpex: new Decimal(5000000), // 5M SAR
      depreciation: new Decimal(2000000), // 2M SAR
      interest: new Decimal(1000000), // 1M SAR
      zakat: new Decimal(300000), // 300K SAR
    },
    balanceSheet: {
      cash: new Decimal(5000000), // 5M SAR
      accountsReceivable: new Decimal(5500000), // 5.5M SAR (10% of 55M total revenue)
      prepaidExpenses: new Decimal(1750000), // 1.75M SAR
      ppe: new Decimal(30000000), // 30M SAR (net)
      accumulatedDepreciation: new Decimal(10000000), // 10M SAR
      accountsPayable: new Decimal(2800000), // 2.8M SAR
      accruedExpenses: new Decimal(1750000), // 1.75M SAR
      deferredRevenue: new Decimal(8250000), // 8.25M SAR (15% of 55M total revenue)
      debt: new Decimal(20000000), // 20M SAR
      equity: new Decimal(9450000), // 9.45M SAR (Assets 42.25M - Liabilities 32.8M)
    },
    immutable: false,
  };

  return calculateHistoricalPeriod(input, createSystemConfig());
}

/**
 * Create sample fixed rent parameters
 */
function createFixedRentParams(): FixedRentParams {
  return {
    baseRent: new Decimal(10000000), // 10M SAR starting rent
    growthRate: new Decimal(0.03), // 3% escalation
    frequency: 1,
  };
}

/**
 * Create sample revenue share rent parameters
 */
function createRevenueShareParams(): RevenueShareParams {
  return {
    revenueSharePercent: new Decimal(0.2), // 20% of revenue
  };
}

/**
 * Create sample partner investment rent parameters
 */
function createPartnerInvestmentParams(): PartnerInvestmentParams {
  return {
    landSize: new Decimal(10000), // m²
    landPricePerSqm: new Decimal(5000), // SAR per m²
    buaSize: new Decimal(20000), // m²
    constructionCostPerSqm: new Decimal(2500), // SAR per m²
    yieldRate: new Decimal(0.09), // 9% yield
    growthRate: new Decimal(0.03), // 3% growth
    frequency: 1,
  };
}

/**
 * Create a basic transition period input for 2025
 */
function createTransitionInput2025(): TransitionPeriodInput {
  return {
    year: 2025,
    preFillFromPriorYear: true,
    revenueGrowthRate: new Decimal(0.1), // 10% growth
    staffCostsRatio: new Decimal(0.4), // 40% of revenue
    otherOpex: new Decimal(5500000), // 5.5M SAR
    rentGrowthPercent: new Decimal(0.05),
  };
}

// ============================================================================
// BASIC CALCULATION TESTS
// ============================================================================

describe("Transition Period Calculator", () => {
  describe("calculateTransitionPeriod", () => {
    it("should calculate a complete transition period", () => {
      const input = createTransitionInput2025();
      const systemConfig = createSystemConfig();
      const previousPeriod = createPreviousPeriod2024();
      const wcRatios = createWorkingCapitalRatios();
      const rentParams = createFixedRentParams();

      const result = calculateTransitionPeriod(
        input,
        systemConfig,
        previousPeriod,
        wcRatios,
        RentModel.FIXED_ESCALATION,
        rentParams,
      );

      // Verify basic structure
      expect(result.year).toBe(2025);
      expect(result.periodType).toBe(PeriodType.TRANSITION);
      expect(result.converged).toBe(true);

      // Verify revenue growth
      // Tuition: 50M * 1.10 = 55M
      // Other Revenue: 55M * 10% = 5.5M
      // Total: 55M + 5.5M = 60.5M
      expect(result.profitLoss.totalRevenue.toNumber()).toBeCloseTo(
        60500000,
        -3,
      );

      // Verify balance sheet exists
      expect(result.balanceSheet.totalAssets.toNumber()).toBeGreaterThan(0);

      // Verify cash flow exists
      expect(result.cashFlow.netChangeInCash).toBeDefined();
    });

    it("should handle period type correctly", () => {
      const input = createTransitionInput2025();
      const systemConfig = createSystemConfig();
      const previousPeriod = createPreviousPeriod2024();
      const wcRatios = createWorkingCapitalRatios();
      const rentParams = createFixedRentParams();

      const result = calculateTransitionPeriod(
        input,
        systemConfig,
        previousPeriod,
        wcRatios,
        RentModel.FIXED_ESCALATION,
        rentParams,
      );

      expect(result.periodType).toBe(PeriodType.TRANSITION);
    });
  });

  // ==========================================================================
  // PRE-FILL LOGIC TESTS (GAP 19)
  // ==========================================================================

  describe("Pre-Fill Logic (GAP 19)", () => {
    it("should apply pre-fill logic when enabled", () => {
      const input = createTransitionInput2025();
      input.preFillFromPriorYear = true;
      input.revenueGrowthRate = new Decimal(0.1); // 10% growth

      const systemConfig = createSystemConfig();
      const previousPeriod = createPreviousPeriod2024();
      const wcRatios = createWorkingCapitalRatios();
      const rentParams = createFixedRentParams();

      const consoleSpy = vi.spyOn(console, "log");

      const result = calculateTransitionPeriod(
        input,
        systemConfig,
        previousPeriod,
        wcRatios,
        RentModel.FIXED_ESCALATION,
        rentParams,
      );

      // Verify pre-fill was acknowledged
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Pre-filling from prior year"),
      );

      // Revenue calculation with other revenue:
      // 2024 tuition: 50M, growth 10% → 55M tuition
      // Other revenue: 55M * 10% = 5.5M
      // Total: 55M + 5.5M = 60.5M
      expect(result.profitLoss.totalRevenue.toNumber()).toBeCloseTo(
        60500000,
        -3,
      );
    });

    it("should use manual inputs when pre-fill is disabled", () => {
      const input = createTransitionInput2025();
      input.preFillFromPriorYear = false;
      input.revenueGrowthRate = new Decimal(0.05); // 5% growth

      const systemConfig = createSystemConfig();
      const previousPeriod = createPreviousPeriod2024();
      const wcRatios = createWorkingCapitalRatios();
      const rentParams = createFixedRentParams();

      const consoleSpy = vi.spyOn(console, "log");

      const result = calculateTransitionPeriod(
        input,
        systemConfig,
        previousPeriod,
        wcRatios,
        RentModel.FIXED_ESCALATION,
        rentParams,
      );

      // Verify manual inputs were used
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Using manual inputs"),
      );

      // Revenue should still be calculated with growth rate
      expect(result.profitLoss.totalRevenue.toNumber()).toBeGreaterThan(0);
    });

    it("should correctly apply growth rate to revenue", () => {
      const input = createTransitionInput2025();
      input.preFillFromPriorYear = true;
      input.revenueGrowthRate = new Decimal(0.15); // 15% growth

      const systemConfig = createSystemConfig();
      const previousPeriod = createPreviousPeriod2024();
      const wcRatios = createWorkingCapitalRatios();
      const rentParams = createFixedRentParams();

      const result = calculateTransitionPeriod(
        input,
        systemConfig,
        previousPeriod,
        wcRatios,
        RentModel.FIXED_ESCALATION,
        rentParams,
      );

      // Prior tuition: 50M, Growth: 15% → 50M * 1.15 = 57.5M tuition
      // Other revenue: 57.5M * 10% = 5.75M
      // Total: 57.5M + 5.75M = 63.25M
      const expectedRevenue = 50000000 * 1.15 * 1.1;
      expect(result.profitLoss.totalRevenue.toNumber()).toBeCloseTo(
        expectedRevenue,
        -3,
      );
    });

    it("should handle zero growth rate", () => {
      const input = createTransitionInput2025();
      input.preFillFromPriorYear = true;
      input.revenueGrowthRate = ZERO; // No growth

      const systemConfig = createSystemConfig();
      const previousPeriod = createPreviousPeriod2024();
      const wcRatios = createWorkingCapitalRatios();
      const rentParams = createFixedRentParams();

      const result = calculateTransitionPeriod(
        input,
        systemConfig,
        previousPeriod,
        wcRatios,
        RentModel.FIXED_ESCALATION,
        rentParams,
      );

      // Revenue calculation with 0% growth:
      // Prior tuition: 50M, 0% growth → 50M tuition
      // Other revenue: 50M * 10% = 5M
      // Total: 50M + 5M = 55M
      expect(result.profitLoss.totalRevenue.toNumber()).toBeCloseTo(
        55000000,
        -3,
      );
    });

    it("should handle negative growth rate (decline)", () => {
      const input = createTransitionInput2025();
      input.preFillFromPriorYear = true;
      input.revenueGrowthRate = new Decimal(-0.1); // 10% decline

      const systemConfig = createSystemConfig();
      const previousPeriod = createPreviousPeriod2024();
      const wcRatios = createWorkingCapitalRatios();
      const rentParams = createFixedRentParams();

      const result = calculateTransitionPeriod(
        input,
        systemConfig,
        previousPeriod,
        wcRatios,
        RentModel.FIXED_ESCALATION,
        rentParams,
      );

      // Prior tuition: 50M, -10% growth → 50M * 0.90 = 45M tuition
      // Other revenue: 45M * 10% = 4.5M
      // Total: 45M + 4.5M = 49.5M
      expect(result.profitLoss.totalRevenue.toNumber()).toBeCloseTo(
        49500000,
        -3,
      );
    });
  });

  // ==========================================================================
  // RENT MODEL TESTS
  // ==========================================================================

  describe("Rent Model Calculations", () => {
    describe("Fixed Escalation Model", () => {
      it("should calculate fixed rent with escalation correctly", () => {
        const input = createTransitionInput2025();
        const systemConfig = createSystemConfig();
        const previousPeriod = createPreviousPeriod2024();
        const wcRatios = createWorkingCapitalRatios();
        const rentParams = createFixedRentParams();

        const result = calculateTransitionPeriod(
          input,
          systemConfig,
          previousPeriod,
          wcRatios,
          RentModel.FIXED_ESCALATION,
          rentParams,
        );

        // 2025 uses base rent grown from 2024 by rentGrowthPercent (5% default)
        expect(result.profitLoss.rentExpense.toNumber()).toBeCloseTo(
          10500000,
          -2,
        );
      });

      it("should keep transition rent tied to 2024 base without compounding", () => {
        const systemConfig = createSystemConfig();
        const wcRatios = createWorkingCapitalRatios();
        const rentParams = createFixedRentParams();

        const period2025 = createPreviousPeriod2024();

        // Calculate 2026 (year 1 of escalation)
        const input2026 = createTransitionInput2025();
        input2026.year = 2026;

        const result2026 = calculateTransitionPeriod(
          input2026,
          systemConfig,
          period2025,
          wcRatios,
          RentModel.FIXED_ESCALATION,
          rentParams,
        );

        // Transition rule: 2024 rent grown once by rentGrowthPercent for all transition years
        expect(result2026.profitLoss.rentExpense.toNumber()).toBeCloseTo(
          10500000,
          -2,
        );
      });
    });

    describe("Revenue Share Model", () => {
      it("should apply rent growth even when revenue share is selected (transition has no rent models)", () => {
        const input = createTransitionInput2025();
        const systemConfig = createSystemConfig();
        const previousPeriod = createPreviousPeriod2024();
        const wcRatios = createWorkingCapitalRatios();
        const rentParams = createRevenueShareParams();

        const result = calculateTransitionPeriod(
          input,
          systemConfig,
          previousPeriod,
          wcRatios,
          RentModel.REVENUE_SHARE,
          rentParams,
        );

        const expectedRent = previousPeriod.profitLoss.rentExpense.mul(1.05); // 5% growth from 2024
        expect(result.profitLoss.rentExpense.toNumber()).toBeCloseTo(
          expectedRent.toNumber(),
          -2,
        );
      });
    });

    describe("Partner Investment Model (GAP 4)", () => {
      it("should still use rent growth during transition (rent models disabled)", () => {
        const input = createTransitionInput2025();
        const systemConfig = createSystemConfig();
        const previousPeriod = createPreviousPeriod2024();
        const wcRatios = createWorkingCapitalRatios();
        const rentParams = createPartnerInvestmentParams();

        const result = calculateTransitionPeriod(
          input,
          systemConfig,
          previousPeriod,
          wcRatios,
          RentModel.PARTNER_INVESTMENT,
          rentParams,
        );

        const expectedRent = previousPeriod.profitLoss.rentExpense.mul(1.05);
        expect(result.profitLoss.rentExpense.toNumber()).toBeCloseTo(
          expectedRent.toNumber(),
          -2,
        );
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle very high growth rates", () => {
      const input = createTransitionInput2025();
      input.revenueGrowthRate = new Decimal(5.0); // 500% growth

      const systemConfig = createSystemConfig();
      const previousPeriod = createPreviousPeriod2024();
      const wcRatios = createWorkingCapitalRatios();
      const rentParams = createFixedRentParams();

      const result = calculateTransitionPeriod(
        input,
        systemConfig,
        previousPeriod,
        wcRatios,
        RentModel.FIXED_ESCALATION,
        rentParams,
      );

      // Prior tuition: 50M, Growth: 500% → 50M * 6.0 = 300M tuition
      // Other revenue: 300M * 10% = 30M
      // Total: 300M + 30M = 330M
      expect(result.profitLoss.totalRevenue.toNumber()).toBeCloseTo(
        330000000,
        -4,
      );
    });

    it("should handle small precision numbers", () => {
      const input = createTransitionInput2025();
      input.revenueGrowthRate = new Decimal("0.00001"); // 0.001% growth

      const systemConfig = createSystemConfig();
      const previousPeriod = createPreviousPeriod2024();
      const wcRatios = createWorkingCapitalRatios();
      const rentParams = createFixedRentParams();

      const result = calculateTransitionPeriod(
        input,
        systemConfig,
        previousPeriod,
        wcRatios,
        RentModel.FIXED_ESCALATION,
        rentParams,
      );

      // Prior tuition: 50M, Growth: 0.001% → 50M * 1.00001 = 50.000005M tuition
      // Other revenue: 50.000005M * 10% = 5.0000005M
      // Total: 55.0000055M
      expect(result.profitLoss.totalRevenue.toNumber()).toBeGreaterThan(
        55000000,
      );
      expect(result.profitLoss.totalRevenue.toNumber()).toBeLessThan(55010000);
    });

    it("should handle unknown rent model", () => {
      const input = createTransitionInput2025();
      const systemConfig = createSystemConfig();
      const previousPeriod = createPreviousPeriod2024();
      const wcRatios = createWorkingCapitalRatios();
      const rentParams = createFixedRentParams();

      const result = calculateTransitionPeriod(
        input,
        systemConfig,
        previousPeriod,
        wcRatios,
        "UNKNOWN_MODEL" as RentModel,
        rentParams,
      );

      // Unknown rent model still uses transition rent growth rules
      const expectedRent = previousPeriod.profitLoss.rentExpense.mul(1.05);
      expect(result.profitLoss.rentExpense.toNumber()).toBeCloseTo(
        expectedRent.toNumber(),
        -2,
      );
    });

    it("should detect negative cash balance", () => {
      const input = createTransitionInput2025();
      input.revenueGrowthRate = new Decimal(-0.95); // 95% decline → very low revenue

      const systemConfig = createSystemConfig();
      const previousPeriod = createPreviousPeriod2024();
      const wcRatios = createWorkingCapitalRatios();
      const rentParams = createRevenueShareParams();

      const result = calculateTransitionPeriod(
        input,
        systemConfig,
        previousPeriod,
        wcRatios,
        RentModel.REVENUE_SHARE,
        rentParams,
      );

      const validation = validateTransitionPeriod(result);

      // Should have warnings about negative cash or equity
      expect(validation.warnings.length).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // ADDITIONAL VALIDATION TESTS
  // ==========================================================================

  describe("Additional Validation Coverage", () => {
    it("should detect balance sheet not balancing", () => {
      const input = createTransitionInput2025();
      const systemConfig = createSystemConfig();
      const previousPeriod = createPreviousPeriod2024();
      const wcRatios = createWorkingCapitalRatios();
      const rentParams = createFixedRentParams();

      const period = calculateTransitionPeriod(
        input,
        systemConfig,
        previousPeriod,
        wcRatios,
        RentModel.FIXED_ESCALATION,
        rentParams,
      );

      // Manually break the balance
      period.balanceSheet.balanceDifference = new Decimal(1000); // Force imbalance

      const validation = validateTransitionPeriod(period);

      expect(validation.isValid).toBe(false);
      expect(
        validation.errors.some((e) => e.includes("does not balance")),
      ).toBe(true);
    });

    it("should detect cash flow not reconciling", () => {
      const input = createTransitionInput2025();
      const systemConfig = createSystemConfig();
      const previousPeriod = createPreviousPeriod2024();
      const wcRatios = createWorkingCapitalRatios();
      const rentParams = createFixedRentParams();

      const period = calculateTransitionPeriod(
        input,
        systemConfig,
        previousPeriod,
        wcRatios,
        RentModel.FIXED_ESCALATION,
        rentParams,
      );

      // Manually break cash reconciliation
      period.cashFlow.cashReconciliationDiff = new Decimal(1000); // Force difference

      const validation = validateTransitionPeriod(period);

      expect(validation.isValid).toBe(false);
      expect(
        validation.errors.some((e) => e.includes("does not reconcile")),
      ).toBe(true);
    });

    it("should warn about negative cash", () => {
      const input = createTransitionInput2025();
      const systemConfig = createSystemConfig();
      const previousPeriod = createPreviousPeriod2024();
      const wcRatios = createWorkingCapitalRatios();
      const rentParams = createFixedRentParams();

      const period = calculateTransitionPeriod(
        input,
        systemConfig,
        previousPeriod,
        wcRatios,
        RentModel.FIXED_ESCALATION,
        rentParams,
      );

      // Manually set negative cash
      period.balanceSheet.cash = new Decimal(-1000000);

      const validation = validateTransitionPeriod(period);

      expect(validation.warnings).toContain("Cash balance is negative");
    });

    it("should warn about negative equity", () => {
      const input = createTransitionInput2025();
      const systemConfig = createSystemConfig();
      const previousPeriod = createPreviousPeriod2024();
      const wcRatios = createWorkingCapitalRatios();
      const rentParams = createFixedRentParams();

      const period = calculateTransitionPeriod(
        input,
        systemConfig,
        previousPeriod,
        wcRatios,
        RentModel.FIXED_ESCALATION,
        rentParams,
      );

      // Manually set negative equity
      period.balanceSheet.totalEquity = new Decimal(-5000000);

      const validation = validateTransitionPeriod(period);

      expect(validation.warnings).toContain("Total equity is negative");
    });
  });

  // ==========================================================================
  // PERIOD LINKAGE TESTS
  // ==========================================================================

  describe("Period Linkage Validation", () => {
    it("should validate successful period linkage", () => {
      const input = createTransitionInput2025();
      const systemConfig = createSystemConfig();
      const previousPeriod = createPreviousPeriod2024();
      const wcRatios = createWorkingCapitalRatios();
      const rentParams = createFixedRentParams();

      const currentPeriod = calculateTransitionPeriod(
        input,
        systemConfig,
        previousPeriod,
        wcRatios,
        RentModel.FIXED_ESCALATION,
        rentParams,
      );

      const validation = validatePeriodLinkage(currentPeriod, previousPeriod);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it("should detect non-sequential years", () => {
      const input = createTransitionInput2025();
      const systemConfig = createSystemConfig();
      const previousPeriod = createPreviousPeriod2024();
      const wcRatios = createWorkingCapitalRatios();
      const rentParams = createFixedRentParams();

      const currentPeriod = calculateTransitionPeriod(
        input,
        systemConfig,
        previousPeriod,
        wcRatios,
        RentModel.FIXED_ESCALATION,
        rentParams,
      );

      // Manually change year to create non-sequential
      currentPeriod.year = 2027; // Should be 2025 following 2024

      const validation = validatePeriodLinkage(currentPeriod, previousPeriod);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.some((e) => e.includes("not sequential"))).toBe(
        true,
      );
    });

    it("should detect broken equity linkage", () => {
      const input = createTransitionInput2025();
      const systemConfig = createSystemConfig();
      const previousPeriod = createPreviousPeriod2024();
      const wcRatios = createWorkingCapitalRatios();
      const rentParams = createFixedRentParams();

      const currentPeriod = calculateTransitionPeriod(
        input,
        systemConfig,
        previousPeriod,
        wcRatios,
        RentModel.FIXED_ESCALATION,
        rentParams,
      );

      // Break equity linkage by changing retained earnings
      currentPeriod.balanceSheet.retainedEarnings = new Decimal(999999999);

      const validation = validatePeriodLinkage(currentPeriod, previousPeriod);

      expect(validation.isValid).toBe(false);
      expect(
        validation.errors.some((e) => e.includes("Equity linkage broken")),
      ).toBe(true);
    });

    it("should detect broken cash linkage", () => {
      const input = createTransitionInput2025();
      const systemConfig = createSystemConfig();
      const previousPeriod = createPreviousPeriod2024();
      const wcRatios = createWorkingCapitalRatios();
      const rentParams = createFixedRentParams();

      const currentPeriod = calculateTransitionPeriod(
        input,
        systemConfig,
        previousPeriod,
        wcRatios,
        RentModel.FIXED_ESCALATION,
        rentParams,
      );

      // Break cash linkage by changing beginning cash
      currentPeriod.cashFlow.beginningCash = new Decimal(999999999);

      const validation = validatePeriodLinkage(currentPeriod, previousPeriod);

      expect(validation.isValid).toBe(false);
      expect(
        validation.errors.some((e) => e.includes("Cash linkage broken")),
      ).toBe(true);
    });
  });
});
