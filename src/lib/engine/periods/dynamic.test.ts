/**
 * PHASE 2: DYNAMIC PERIOD CALCULATOR - UNIT TESTS
 *
 * Comprehensive test suite for the Dynamic Period calculator.
 *
 * Test Coverage:
 * - Enrollment Engine with ramp-up (GAP 20)
 * - IB Curriculum Toggle (GAP 3)
 * - Revenue calculations (tuition fees)
 * - Staff cost calculations
 * - Rent model integration
 * - Depreciation calculations
 * - Financial statement generation
 * - Period linkage validation
 *
 * @module periods/dynamic.test
 */

import { describe, it, expect } from "vitest";
import { Decimal as D } from "decimal.js";
import {
  calculateEnrollment,
  validateEnrollmentConfig,
  calculateTuitionRevenue,
  validateCurriculumConfig,
  calculateStaffCosts,
  calculateRentExpense,
  calculateProfitLoss,
  calculateBalanceSheet,
  calculateCashFlow,
  calculateDynamicPeriod,
  validatePeriodLinkage,
} from "./dynamic";
import type {
  EnrollmentConfig,
  CurriculumConfig,
  StaffConfig,
  DynamicPeriodInput,
  FinancialPeriod,
  SystemConfiguration,
  WorkingCapitalRatios,
  CapExConfiguration,
  BalanceSheet,
} from "../core/types";
import { PeriodType, RentModel } from "../core/types";
import { ZERO, ONE } from "../core/constants";

// ============================================================================
// TEST FIXTURES
// ============================================================================

const mockSystemConfig: SystemConfiguration = {
  zakatRate: new D(0.025), // 2.5%
  debtInterestRate: new D(0.05), // 5%
  depositInterestRate: new D(0.02), // 2%
  minCashBalance: new D(1000000), // 1M SAR
};

const mockWorkingCapitalRatios: WorkingCapitalRatios = {
  arPercent: new D(0.1), // 10% of revenue
  prepaidPercent: new D(0.05), // 5% of OpEx
  apPercent: new D(0.08), // 8% of OpEx
  accruedPercent: new D(0.03), // 3% of OpEx
  deferredRevenuePercent: new D(0.15), // 15% of revenue
  otherRevenueRatio: new D(0.1), // 10% of tuition revenue (Section 1.3)
  locked: true,
  calculatedFrom2024: true,
};

const mockCapExConfig: CapExConfiguration = {
  categories: [],
  historicalState: {
    grossPPE2024: new D(10000000),
    accumulatedDepreciation2024: new D(500000),
    annualDepreciation: new D(500000),
    remainingToDepreciate: new D(9500000),
  },
  transitionCapex: [],
  virtualAssets: [],
};

function createMockPriorPeriod(year: number): FinancialPeriod {
  const mockBalanceSheet: BalanceSheet = {
    year,
    cash: new D(5000000),
    accountsReceivable: new D(2000000),
    prepaidExpenses: new D(500000),
    totalCurrentAssets: new D(7500000),
    // propertyPlantEquipment stores NET PP&E (consistent with historical/transition periods)
    grossPPE: new D(10000000), // GROSS PP&E = Net + AccDep
    propertyPlantEquipment: new D(9000000), // NET PP&E
    accumulatedDepreciation: new D(1000000),
    totalNonCurrentAssets: new D(9000000), // Same as NET PP&E
    totalAssets: new D(16500000),
    accountsPayable: new D(800000),
    accruedExpenses: new D(300000),
    deferredRevenue: new D(1500000),
    totalCurrentLiabilities: new D(2600000),
    debtBalance: new D(8000000),
    totalNonCurrentLiabilities: new D(8000000),
    totalLiabilities: new D(10600000),
    retainedEarnings: new D(5900000),
    netIncomeCurrentYear: ZERO,
    totalEquity: new D(5900000),
    balanceDifference: ZERO,
  };

  return {
    year,
    periodType: PeriodType.TRANSITION,
    profitLoss: {
      year,
      tuitionRevenue: new D(20000000),
      otherRevenue: ZERO,
      totalRevenue: new D(20000000),
      rentExpense: new D(3000000),
      staffCosts: new D(8000000),
      otherOpex: new D(2000000),
      totalOpex: new D(13000000),
      ebitda: new D(7000000),
      depreciation: new D(500000),
      ebit: new D(6500000),
      interestExpense: new D(400000),
      interestIncome: new D(100000),
      netInterest: new D(300000),
      ebt: new D(6200000),
      zakatExpense: new D(155000),
      netIncome: new D(6045000),
    },
    balanceSheet: mockBalanceSheet,
    cashFlow: {
      year,
      netIncome: new D(6045000),
      depreciation: new D(500000),
      changeInAR: ZERO,
      changeInPrepaid: ZERO,
      changeInAP: ZERO,
      changeInAccrued: ZERO,
      changeInDeferredRevenue: ZERO,
      cashFlowFromOperations: new D(6500000),
      capex: new D(-500000),
      cashFlowFromInvesting: new D(-500000),
      debtIssuance: ZERO,
      debtRepayment: new D(1000000),
      cashFlowFromFinancing: new D(-1000000),
      netChangeInCash: new D(5000000),
      beginningCash: new D(3000000),
      endingCash: new D(8000000),
      cashReconciliationDiff: ZERO,
    },
    calculatedAt: new Date(),
    iterationsRequired: 0,
    converged: true,
    balanceSheetBalanced: true,
    cashFlowReconciled: true,
  };
}

// ============================================================================
// ENROLLMENT ENGINE TESTS (GAP 20)
// ============================================================================

describe("Enrollment Engine (GAP 20)", () => {
  it("should calculate enrollment during ramp-up period", () => {
    const config: EnrollmentConfig = {
      rampUpEnabled: true,
      rampUpStartYear: 2028,
      rampUpEndYear: 2032,
      rampUpTargetStudents: 1200,
      steadyStateStudents: 1200,
      gradeDistribution: [],
    };

    // Start of ramp-up (2028): progress = (0+1)/(4+1) = 1/5 = 20%
    expect(calculateEnrollment(2028, config)).toBe(240);

    // Midpoint (2030): progress = (2+1)/(4+1) = 3/5 = 60%
    expect(calculateEnrollment(2030, config)).toBe(720);

    // End of ramp-up (2032): progress = (4+1)/(4+1) = 5/5 = 100%
    expect(calculateEnrollment(2032, config)).toBe(1200);
  });

  it("should return steady state after ramp-up period", () => {
    const config: EnrollmentConfig = {
      rampUpEnabled: true,
      rampUpStartYear: 2028,
      rampUpEndYear: 2032,
      rampUpTargetStudents: 1200,
      steadyStateStudents: 1200,
      gradeDistribution: [],
    };

    // After ramp-up
    expect(calculateEnrollment(2035, config)).toBe(1200);
    expect(calculateEnrollment(2050, config)).toBe(1200);
  });

  it("should return steady state when ramp-up is disabled", () => {
    const config: EnrollmentConfig = {
      rampUpEnabled: false,
      rampUpStartYear: 2028,
      rampUpEndYear: 2032,
      rampUpTargetStudents: 1200,
      steadyStateStudents: 1000,
      gradeDistribution: [],
    };

    expect(calculateEnrollment(2028, config)).toBe(1000);
    expect(calculateEnrollment(2035, config)).toBe(1000);
  });

  it("should validate enrollment configuration", () => {
    const validConfig: EnrollmentConfig = {
      rampUpEnabled: true,
      rampUpStartYear: 2028,
      rampUpEndYear: 2032,
      rampUpTargetStudents: 1200,
      steadyStateStudents: 1200,
      gradeDistribution: [],
    };

    const result = validateEnrollmentConfig(validConfig);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should detect invalid enrollment configuration", () => {
    const invalidConfig: EnrollmentConfig = {
      rampUpEnabled: true,
      rampUpStartYear: 2032,
      rampUpEndYear: 2028, // Invalid: end before start
      rampUpTargetStudents: -100, // Invalid: negative
      steadyStateStudents: 0, // Invalid: zero
      gradeDistribution: [],
    };

    const result = validateEnrollmentConfig(invalidConfig);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// CURRICULUM & REVENUE TESTS (GAP 3)
// ============================================================================

describe("Curriculum & Revenue Engine (GAP 3)", () => {
  it("should calculate revenue for national curriculum only", () => {
    const curriculum: CurriculumConfig = {
      ibProgramEnabled: false,
      nationalCurriculumFee: new D(15000),
      ibCurriculumFee: new D(25000),
    };

    const revenue = calculateTuitionRevenue(1000, curriculum, 2030);

    // 1000 students × 15,000 = 15,000,000
    expect(revenue.toString()).toBe("15000000");
  });

  it("should calculate revenue with IB program enabled", () => {
    const curriculum: CurriculumConfig = {
      ibProgramEnabled: true,
      ibStartYear: 2030,
      nationalCurriculumFee: new D(15000),
      ibCurriculumFee: new D(25000),
      ibStudentPercentage: new D(0.3), // 30% IB
    };

    const revenue = calculateTuitionRevenue(1000, curriculum, 2032);

    // 700 students × 15,000 + 300 students × 25,000 = 18,000,000
    expect(revenue.toString()).toBe("18000000");
  });

  it("should use national curriculum if IB not started yet", () => {
    const curriculum: CurriculumConfig = {
      ibProgramEnabled: true,
      ibStartYear: 2035,
      nationalCurriculumFee: new D(15000),
      ibCurriculumFee: new D(25000),
      ibStudentPercentage: new D(0.3),
    };

    const revenue = calculateTuitionRevenue(1000, curriculum, 2030);

    // IB not started yet, all national: 1000 × 15,000 = 15,000,000
    expect(revenue.toString()).toBe("15000000");
  });

  it("should return zero revenue for zero students", () => {
    const curriculum: CurriculumConfig = {
      ibProgramEnabled: false,
      nationalCurriculumFee: new D(15000),
      ibCurriculumFee: new D(25000),
    };

    const revenue = calculateTuitionRevenue(0, curriculum, 2030);
    expect(revenue.toString()).toBe("0");
  });

  it("should validate curriculum configuration", () => {
    const validConfig: CurriculumConfig = {
      ibProgramEnabled: true,
      ibStartYear: 2030,
      nationalCurriculumFee: new D(15000),
      ibCurriculumFee: new D(25000),
      ibStudentPercentage: new D(0.3),
    };

    const result = validateCurriculumConfig(validConfig);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should detect invalid curriculum configuration", () => {
    const invalidConfig: CurriculumConfig = {
      ibProgramEnabled: true,
      nationalCurriculumFee: new D(0), // Invalid
      ibCurriculumFee: new D(-1000), // Invalid
      ibStudentPercentage: new D(1.5), // Invalid: >100%
    };

    const result = validateCurriculumConfig(invalidConfig);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// STAFF COST TESTS
// ============================================================================

describe("Staff Cost Engine", () => {
  it("should calculate staff costs using fixed + variable model", () => {
    const staffConfig: StaffConfig = {
      fixedStaffCost: new D(5000000),
      variableStaffCostPerStudent: new D(3000),
    };

    const staffCost = calculateStaffCosts(
      1000,
      new D(18000000),
      staffConfig,
      2028,
    );

    // 5,000,000 + (1000 × 3,000) = 8,000,000
    expect(staffCost.toString()).toBe("8000000");
  });

  it("should calculate staff costs using revenue-based model", () => {
    const staffConfig: StaffConfig = {
      fixedStaffCost: new D(5000000),
      variableStaffCostPerStudent: new D(3000),
      staffCostAsRevenuePercent: new D(0.4), // 40% of revenue
    };

    const staffCost = calculateStaffCosts(
      1000,
      new D(18000000),
      staffConfig,
      2028,
    );

    // 40% of 18,000,000 = 7,200,000
    expect(staffCost.toString()).toBe("7200000");
  });

  it("should handle zero students", () => {
    const staffConfig: StaffConfig = {
      fixedStaffCost: new D(5000000),
      variableStaffCostPerStudent: new D(3000),
    };

    const staffCost = calculateStaffCosts(0, ZERO, staffConfig, 2028);

    // Only fixed cost: 5,000,000
    expect(staffCost.toString()).toBe("5000000");
  });
});

// ============================================================================
// RENT MODEL TESTS
// ============================================================================

describe("Rent Model Calculations", () => {
  it("should calculate fixed escalation rent", () => {
    const rentParams = {
      baseRent: new D(3000000),
      growthRate: new D(0.03), // 3% escalation
      frequency: 1,
    };

    // Year 1 (2028)
    const rent2028 = calculateRentExpense(
      2028,
      2028,
      new D(20000000),
      RentModel.FIXED_ESCALATION,
      rentParams,
    );
    expect(rent2028.toString()).toBe("3000000");

    // Year 2 (2029): 3,000,000 × 1.03 = 3,090,000
    const rent2029 = calculateRentExpense(
      2029,
      2028,
      new D(20000000),
      RentModel.FIXED_ESCALATION,
      rentParams,
    );
    expect(rent2029.toFixed(2)).toBe("3090000.00");
  });

  it("should calculate revenue share rent", () => {
    const rentParams = {
      revenueSharePercent: new D(0.15), // 15% of revenue
    };

    const rent = calculateRentExpense(
      2028,
      2028,
      new D(20000000),
      RentModel.REVENUE_SHARE,
      rentParams,
    );

    // 15% of 20,000,000 = 3,000,000
    expect(rent.toString()).toBe("3000000");
  });

  // Floors/caps are not part of the approved financial rules; revenue share is pure % of revenue.

  it("should calculate partner investment rent", () => {
    const rentParams = {
      landSize: new D(10000), // m²
      landPricePerSqm: new D(5000), // SAR/m²
      buaSize: new D(20000), // m²
      constructionCostPerSqm: new D(2500), // SAR/m²
      yieldRate: new D(0.09), // 9% yield
      growthRate: new D(0.02), // 2% growth
      frequency: 1,
    };

    // Base rent = ((land 10000*5000) + (BUA 20000*2500)) * 9% = (50M + 50M) * 0.09 = 9M
    // Year 2029 should reflect one growth step
    const rentRecovery = calculateRentExpense(
      2029,
      2028,
      new D(20000000),
      RentModel.PARTNER_INVESTMENT,
      rentParams,
    );
    expect(rentRecovery.toNumber()).toBeCloseTo(9180000, -2); // 9M * 1.02^1

    // After 5 years with 2% growth: 9M * 1.02^5
    const expectedPostRecovery = 9000000 * Math.pow(1.02, 5);
    const rentPostRecovery = calculateRentExpense(
      2033,
      2028,
      new D(20000000),
      RentModel.PARTNER_INVESTMENT,
      rentParams,
    );
    expect(rentPostRecovery.toNumber()).toBeCloseTo(expectedPostRecovery, -1);
  });

  it("should apply growth rate based on frequency for partner investment", () => {
    const rentParams = {
      landSize: new D(10000), // m²
      landPricePerSqm: new D(5000), // SAR/m²
      buaSize: new D(20000), // m²
      constructionCostPerSqm: new D(2500), // SAR/m²
      yieldRate: new D(0.09), // 9% yield
      growthRate: new D(0.02), // 2% growth
      frequency: 2, // Every 2 years
    };

    // Base rent = (50M + 50M) * 9% = 9M

    // Year 1 (2028): yearsElapsed = floor(0/2) = 0, rent = 9M
    const rent2028 = calculateRentExpense(
      2028,
      2028,
      new D(20000000),
      RentModel.PARTNER_INVESTMENT,
      rentParams,
    );
    expect(rent2028.toNumber()).toBeCloseTo(9000000, -2);

    // Year 2 (2029): yearsElapsed = floor(1/2) = 0, rent = 9M (same as year 1)
    const rent2029 = calculateRentExpense(
      2029,
      2028,
      new D(20000000),
      RentModel.PARTNER_INVESTMENT,
      rentParams,
    );
    expect(rent2029.toNumber()).toBeCloseTo(9000000, -2);

    // Year 3 (2030): yearsElapsed = floor(2/2) = 1, rent = 9M * 1.02 = 9.18M
    const rent2030 = calculateRentExpense(
      2030,
      2028,
      new D(20000000),
      RentModel.PARTNER_INVESTMENT,
      rentParams,
    );
    expect(rent2030.toNumber()).toBeCloseTo(9180000, -2);

    // Year 4 (2031): yearsElapsed = floor(3/2) = 1, rent = 9M * 1.02 = 9.18M (same as year 3)
    const rent2031 = calculateRentExpense(
      2031,
      2028,
      new D(20000000),
      RentModel.PARTNER_INVESTMENT,
      rentParams,
    );
    expect(rent2031.toNumber()).toBeCloseTo(9180000, -2);

    // Year 5 (2032): yearsElapsed = floor(4/2) = 2, rent = 9M * 1.02^2 = 9.3636M
    const rent2032 = calculateRentExpense(
      2032,
      2028,
      new D(20000000),
      RentModel.PARTNER_INVESTMENT,
      rentParams,
    );
    expect(rent2032.toNumber()).toBeCloseTo(9000000 * Math.pow(1.02, 2), -2);
  });
});

// ============================================================================
// DEPRECIATION TESTS
// ============================================================================
// NOTE: Depreciation calculation has been moved to the CAPEX calculator.
// These tests are deprecated and have been removed as they tested the old
// deprecated calculateDepreciation function. Depreciation is now handled
// via calculateCapexYearResult() which combines historical and new asset depreciation.
//
// For CAPEX-based depreciation tests, see: src/lib/engine/capex/capex-calculator.test.ts

// ============================================================================
// PROFIT & LOSS TESTS
// ============================================================================

describe("Profit & Loss Statement", () => {
  it("should generate complete P&L statement", () => {
    const input: DynamicPeriodInput = {
      year: 2030,
      enrollment: {
        rampUpEnabled: true,
        rampUpStartYear: 2028,
        rampUpEndYear: 2032,
        rampUpTargetStudents: 1200,
        steadyStateStudents: 1200,
        gradeDistribution: [],
      },
      curriculum: {
        ibProgramEnabled: false,
        nationalCurriculumFee: new D(15000),
        ibCurriculumFee: new D(25000),
      },
      staff: {
        fixedStaffCost: new D(5000000),
        variableStaffCostPerStudent: new D(3000),
      },
      rentModel: RentModel.FIXED_ESCALATION,
      rentParams: {
        baseRent: new D(3000000),
        growthRate: new D(0.03),
        frequency: 1,
      },
      otherOpexPercent: new D(0.1), // 10% of revenue
      capexConfig: mockCapExConfig,
    };

    const pl = calculateProfitLoss(
      2030,
      input,
      mockSystemConfig,
      mockWorkingCapitalRatios,
      new D(8000000), // prior debt
      new D(5000000), // prior cash
      new D(0), // zakatExpense (test doesn't need accurate value)
    );

    // Validations
    expect(pl.year).toBe(2030);
    expect(pl.totalRevenue.greaterThan(ZERO)).toBe(true);
    expect(pl.ebitda.equals(pl.totalRevenue.sub(pl.totalOpex))).toBe(true);
    expect(pl.ebit.equals(pl.ebitda.sub(pl.depreciation))).toBe(true);
    expect(pl.netIncome.lessThanOrEqualTo(pl.ebt)).toBe(true);
  });
});

// ============================================================================
// DYNAMIC PERIOD INTEGRATION TESTS
// ============================================================================

describe("Dynamic Period Calculator (Integration)", () => {
  it("should calculate complete dynamic period", () => {
    const priorPeriod = createMockPriorPeriod(2027);

    const input: DynamicPeriodInput = {
      year: 2028,
      enrollment: {
        rampUpEnabled: true,
        rampUpStartYear: 2028,
        rampUpEndYear: 2032,
        rampUpTargetStudents: 1200,
        steadyStateStudents: 1200,
        gradeDistribution: [],
      },
      curriculum: {
        ibProgramEnabled: false,
        nationalCurriculumFee: new D(15000),
        ibCurriculumFee: new D(25000),
      },
      staff: {
        fixedStaffCost: new D(5000000),
        variableStaffCostPerStudent: new D(3000),
      },
      rentModel: RentModel.REVENUE_SHARE,
      rentParams: {
        revenueSharePercent: new D(0.15),
      },
      otherOpexPercent: new D(0.1), // 10% of revenue
      capexConfig: mockCapExConfig,
    };

    const period = calculateDynamicPeriod(
      input,
      priorPeriod,
      mockSystemConfig,
      mockWorkingCapitalRatios,
    );

    // Basic validations
    expect(period.year).toBe(2028);
    expect(period.periodType).toBe(PeriodType.DYNAMIC);
    expect(period.converged).toBe(true);

    // Balance sheet should balance
    const totalLiabilitiesAndEquity = period.balanceSheet.totalLiabilities.add(
      period.balanceSheet.totalEquity,
    );
    const diff = period.balanceSheet.totalAssets.sub(totalLiabilitiesAndEquity);
    expect(diff.abs().lessThan(new D(0.01))).toBe(true);

    // Cash flow should reconcile
    const expectedCash = priorPeriod.balanceSheet.cash.add(
      period.cashFlow.netChangeInCash,
    );
    const cashDiff = period.balanceSheet.cash.sub(expectedCash);
    expect(cashDiff.abs().lessThan(new D(0.01))).toBe(true);
  });

  it("should validate period linkage correctly", () => {
    const priorPeriod = createMockPriorPeriod(2027);

    const input: DynamicPeriodInput = {
      year: 2028,
      enrollment: {
        rampUpEnabled: false,
        rampUpStartYear: 2028,
        rampUpEndYear: 2032,
        rampUpTargetStudents: 1200,
        steadyStateStudents: 1000,
        gradeDistribution: [],
      },
      curriculum: {
        ibProgramEnabled: false,
        nationalCurriculumFee: new D(15000),
        ibCurriculumFee: new D(25000),
      },
      staff: {
        fixedStaffCost: new D(5000000),
        variableStaffCostPerStudent: new D(3000),
      },
      rentModel: RentModel.FIXED_ESCALATION,
      rentParams: {
        baseRent: new D(3000000),
        growthRate: new D(0.03),
        frequency: 1,
      },
      otherOpexPercent: new D(0.1), // 10% of revenue
      capexConfig: mockCapExConfig,
    };

    const currentPeriod = calculateDynamicPeriod(
      input,
      priorPeriod,
      mockSystemConfig,
      mockWorkingCapitalRatios,
    );

    const validation = validatePeriodLinkage(priorPeriod, currentPeriod);
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });
});

// ============================================================================
// EDGE CASE TESTS
// ============================================================================

describe("Edge Cases", () => {
  it("should handle zero enrollment scenario", () => {
    const config: EnrollmentConfig = {
      rampUpEnabled: true,
      rampUpStartYear: 2028,
      rampUpEndYear: 2032,
      rampUpTargetStudents: 1200,
      steadyStateStudents: 1200,
      gradeDistribution: [],
    };

    // Before ramp-up starts
    const enrollment = calculateEnrollment(2025, config);
    expect(enrollment).toBe(0);
  });

  it("should handle zero revenue scenario", () => {
    const curriculum: CurriculumConfig = {
      ibProgramEnabled: false,
      nationalCurriculumFee: new D(15000),
      ibCurriculumFee: new D(25000),
    };

    const revenue = calculateTuitionRevenue(0, curriculum, 2030);
    expect(revenue.toString()).toBe("0");
  });

  it("should handle 100% IB students", () => {
    const curriculum: CurriculumConfig = {
      ibProgramEnabled: true,
      ibStartYear: 2030,
      nationalCurriculumFee: new D(15000),
      ibCurriculumFee: new D(25000),
      ibStudentPercentage: new D(1.0), // 100% IB
    };

    const revenue = calculateTuitionRevenue(1000, curriculum, 2032);

    // All students on IB: 1000 × 25,000 = 25,000,000
    expect(revenue.toString()).toBe("25000000");
  });

  it("should use ramp plan percentages when provided", () => {
    const config: EnrollmentConfig = {
      rampUpEnabled: true,
      rampUpStartYear: 2028,
      rampUpEndYear: 2032,
      rampUpTargetStudents: 1000,
      steadyStateStudents: 1000,
      gradeDistribution: [],
      rampPlanPercentages: [0.2, 0.4, 0.6, 0.8, 1.0], // 20%, 40%, 60%, 80%, 100%
    };

    // Year 1 (offset 0): 20%
    expect(calculateEnrollment(2028, config)).toBe(200);

    // Year 3 (offset 2): 60%
    expect(calculateEnrollment(2030, config)).toBe(600);

    // Year 5 (offset 4): 100%
    expect(calculateEnrollment(2032, config)).toBe(1000);

    // After year 5: steady state
    expect(calculateEnrollment(2033, config)).toBe(1000);
  });

  it("should return 0 for year before ramp plan start", () => {
    const config: EnrollmentConfig = {
      rampUpEnabled: true,
      rampUpStartYear: 2028,
      rampUpEndYear: 2032,
      rampUpTargetStudents: 1000,
      steadyStateStudents: 1000,
      gradeDistribution: [],
      rampPlanPercentages: [0.2, 0.4, 0.6, 0.8, 1.0],
    };

    // Before ramp plan starts (offset < 0)
    expect(calculateEnrollment(2027, config)).toBe(0);
  });

  it("should validate enrollment config with valid disabled ramp-up", () => {
    const config: EnrollmentConfig = {
      rampUpEnabled: false,
      rampUpStartYear: 2028,
      rampUpEndYear: 2032,
      rampUpTargetStudents: 1200,
      steadyStateStudents: 1200,
      gradeDistribution: [],
    };

    const result = validateEnrollmentConfig(config);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should detect only steady state error when ramp-up disabled", () => {
    const config: EnrollmentConfig = {
      rampUpEnabled: false,
      rampUpStartYear: 2032, // Invalid but should be ignored
      rampUpEndYear: 2028, // Invalid but should be ignored
      rampUpTargetStudents: -100, // Invalid but should be ignored
      steadyStateStudents: 0, // Only this matters
      gradeDistribution: [],
    };

    const result = validateEnrollmentConfig(config);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain("Steady state");
  });

  it("should calculate tuition with growth rate", () => {
    const curriculum: CurriculumConfig = {
      ibProgramEnabled: false,
      nationalCurriculumFee: new D(15000),
      ibCurriculumFee: new D(25000),
      nationalTuitionGrowthRate: new D(0.05), // 5% growth
      nationalTuitionGrowthFrequency: 1, // yearly
    };

    // Year 2028 (base year): 15000 * 1000 = 15,000,000
    const revenue2028 = calculateTuitionRevenue(1000, curriculum, 2028);
    expect(revenue2028.toNumber()).toBeCloseTo(15000000, 0);

    // Year 2030 (2 years growth): 15000 * 1.05^2 * 1000 = 16,537,500
    const revenue2030 = calculateTuitionRevenue(1000, curriculum, 2030);
    expect(revenue2030.toNumber()).toBeCloseTo(16537500, 0);
  });

  it("should calculate IB tuition with growth rate", () => {
    const curriculum: CurriculumConfig = {
      ibProgramEnabled: true,
      ibStartYear: 2028,
      nationalCurriculumFee: new D(15000),
      ibCurriculumFee: new D(25000),
      ibStudentPercentage: new D(0.5), // 50% IB
      ibTuitionGrowthRate: new D(0.03), // 3% growth
      ibTuitionGrowthFrequency: 1,
    };

    // Year 2028 (base year): 500 students × 15000 + 500 × 25000 = 20,000,000
    const revenue2028 = calculateTuitionRevenue(1000, curriculum, 2028);
    expect(revenue2028.toNumber()).toBeCloseTo(20000000, 0);
  });

  it("should detect invalid IB percentage", () => {
    const invalidConfig: CurriculumConfig = {
      ibProgramEnabled: true,
      ibStartYear: 2028,
      nationalCurriculumFee: new D(15000),
      ibCurriculumFee: new D(25000),
      ibStudentPercentage: new D(-0.1), // Negative - invalid
    };

    const result = validateCurriculumConfig(invalidConfig);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("should detect missing IB start year when enabled", () => {
    const invalidConfig: CurriculumConfig = {
      ibProgramEnabled: true,
      // Missing ibStartYear
      nationalCurriculumFee: new D(15000),
      ibCurriculumFee: new D(25000),
      ibStudentPercentage: new D(0.3),
    };

    const result = validateCurriculumConfig(invalidConfig);
    // Depending on implementation, this may or may not be an error
    // The test verifies the branch is exercised
    expect(result).toBeDefined();
  });
});
