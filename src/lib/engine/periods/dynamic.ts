/**
 * PHASE 2: DYNAMIC PERIOD CALCULATOR (2028-2053)
 *
 * This module handles the calculation of dynamic period projections with full
 * operational modeling including enrollment ramp-up and IB curriculum toggle.
 *
 * Key Features:
 * - GAP 20: Enrollment Engine with ramp-up logic
 * - GAP 3: IB Curriculum Toggle
 * - Revenue calculation based on enrollment and curriculum
 * - Staff cost calculation (fixed + variable)
 * - Rent model integration (Fixed, Revenue Share, Partner Investment)
 * - CapEx and depreciation tracking
 * - Full financial statement generation
 *
 * @module periods/dynamic
 */

import type {
  DynamicPeriodInput,
  FinancialPeriod,
  ProfitLossStatement,
  BalanceSheet,
  CashFlowStatement,
  EnrollmentConfig,
  CurriculumConfig,
  StaffConfig,
  WorkingCapitalRatios,
  SystemConfiguration,
  RentModel,
  FixedRentParams,
  RevenueShareParams,
  PartnerInvestmentParams,
  CapExConfiguration,
  CapExAsset,
} from "../core/types";
import { PeriodType, DepreciationMethod } from "../core/types";
import {
  ZERO,
  ONE,
  BALANCE_SHEET_TOLERANCE,
  CASH_FLOW_TOLERANCE,
} from "../core/constants";
import {
  add,
  subtract,
  multiply,
  divide,
  divideSafe,
  abs,
  isWithinTolerance,
  max,
  min,
} from "../core/decimal-utils";
import type Decimal from "decimal.js";
import { Decimal as D } from "decimal.js";

// ============================================================================
// ENROLLMENT ENGINE (GAP 20: Ramp-up Logic)
// ============================================================================

/**
 * Calculate student enrollment for a given year with optional ramp-up logic.
 *
 * GAP 20: Enrollment Ramp-up
 * - Linear interpolation from start year to end year
 * - Steady state after ramp-up period
 *
 * @example
 * // Ramp-up from 500 to 1200 students over 2028-2032
 * const students = calculateEnrollment(2030, {
 *   rampUpEnabled: true,
 *   rampUpStartYear: 2028,
 *   rampUpEndYear: 2032,
 *   rampUpTargetStudents: 1200,
 *   steadyStateStudents: 1200,
 * });
 * // Result: 850 students (midpoint interpolation)
 */
export function calculateEnrollment(
  year: number,
  config: EnrollmentConfig,
): number {
  // If ramp plan percentages provided (length >=5), use discrete percentages for years 1-5
  if (config.rampPlanPercentages && config.rampPlanPercentages.length >= 5) {
    const baseYear = config.rampUpStartYear;
    const offset = year - baseYear;
    if (offset < 0) return 0;
    if (offset < 5) {
      const pct = config.rampPlanPercentages[offset];
      return Math.round(config.rampUpTargetStudents * pct);
    }
    return config.steadyStateStudents;
  }

  // If ramp-up is disabled, return steady state
  if (!config.rampUpEnabled) {
    return config.steadyStateStudents;
  }

  // Before ramp-up starts: use initial enrollment (could be 0 or a small base)
  if (year < config.rampUpStartYear) {
    return 0; // Or a base enrollment if provided
  }

  // During ramp-up: linear interpolation
  if (year <= config.rampUpEndYear) {
    const totalYears = config.rampUpEndYear - config.rampUpStartYear;
    const yearsElapsed = year - config.rampUpStartYear;

    // Linear ramp: distribute students evenly across all ramp-up years
    // Include year 1 by adding 1 to both numerator and denominator
    // Example: 5-year ramp-up (2028-2033) has 6 data points
    // Year 1: (0+1)/(5+1) = 1/6, Year 6: (5+1)/(5+1) = 6/6 = 100%
    const progress = (yearsElapsed + 1) / (totalYears + 1);
    const enrollment = Math.round(config.rampUpTargetStudents * progress);
    return enrollment;
  }

  // After ramp-up: steady state
  return config.steadyStateStudents;
}

/**
 * Validates enrollment configuration for consistency.
 */
export function validateEnrollmentConfig(config: EnrollmentConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (config.rampUpEnabled) {
    if (config.rampUpStartYear >= config.rampUpEndYear) {
      errors.push("Ramp-up start year must be before end year");
    }
    if (config.rampUpTargetStudents <= 0) {
      errors.push("Ramp-up target students must be positive");
    }
  }

  if (config.steadyStateStudents <= 0) {
    errors.push("Steady state students must be positive");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// CURRICULUM & REVENUE ENGINE (GAP 3: IB Toggle)
// ============================================================================

/**
 * Calculate tuition revenue based on enrollment and curriculum configuration.
 *
 * GAP 3: IB Curriculum Toggle
 * - Support for dual curriculum (National + IB)
 * - Different tuition fees for each curriculum
 * - Student distribution between curricula
 *
 * @example
 * // Calculate revenue with IB program
 * const revenue = calculateTuitionRevenue(1000, {
 *   ibProgramEnabled: true,
 *   ibStartYear: 2030,
 *   nationalCurriculumFee: new D(15000),
 *   ibCurriculumFee: new D(25000),
 *   ibStudentPercentage: new D(0.30),
 * }, 2032);
 * // Result: 700 students × 15000 + 300 students × 25000 = 18,000,000
 */
export function calculateTuitionRevenue(
  totalStudents: number,
  curriculum: CurriculumConfig,
  currentYear: number,
): Decimal {
  const baseYear = 2028;

  const calcTuitionWithGrowth = (
    baseFee: Decimal,
    growthRate?: Decimal,
    growthFrequency?: number,
  ): Decimal => {
    if (!growthRate || growthRate.equals(0) || !growthFrequency) return baseFee;
    const periods = Math.floor((currentYear - baseYear) / growthFrequency);
    const factor = new D(1).plus(growthRate).pow(periods);
    return baseFee.times(factor);
  };

  // If no students, no revenue
  if (totalStudents === 0) {
    return ZERO;
  }

  // IB program not enabled or not started yet: all students on national curriculum
  if (
    !curriculum.ibProgramEnabled ||
    (curriculum.ibStartYear && currentYear < curriculum.ibStartYear)
  ) {
    const tuition = calcTuitionWithGrowth(
      curriculum.nationalCurriculumFee,
      curriculum.nationalTuitionGrowthRate,
      curriculum.nationalTuitionGrowthFrequency,
    );
    const revenue = multiply(new D(totalStudents), tuition);
    return revenue;
  }

  // IB program enabled and started: split students
  const ibPercentage = curriculum.ibStudentPercentage || ZERO;
  const ibStudents = Math.round(totalStudents * ibPercentage.toNumber());
  const nationalStudents = totalStudents - ibStudents;

  const nationalTuition = calcTuitionWithGrowth(
    curriculum.nationalCurriculumFee,
    curriculum.nationalTuitionGrowthRate,
    curriculum.nationalTuitionGrowthFrequency,
  );
  const ibTuition = calcTuitionWithGrowth(
    curriculum.ibCurriculumFee,
    curriculum.ibTuitionGrowthRate,
    curriculum.ibTuitionGrowthFrequency,
  );

  const nationalRevenue = multiply(new D(nationalStudents), nationalTuition);
  const ibRevenue = multiply(new D(ibStudents), ibTuition);

  return add(nationalRevenue, ibRevenue);
}

/**
 * Validates curriculum configuration for consistency.
 */
export function validateCurriculumConfig(config: CurriculumConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (config.nationalCurriculumFee.lessThanOrEqualTo(ZERO)) {
    errors.push("National curriculum fee must be positive");
  }

  if (config.ibProgramEnabled) {
    if (
      !config.ibCurriculumFee ||
      config.ibCurriculumFee.lessThanOrEqualTo(ZERO)
    ) {
      errors.push("IB curriculum fee must be positive when IB is enabled");
    }
    if (
      config.ibStudentPercentage &&
      (config.ibStudentPercentage.lessThan(ZERO) ||
        config.ibStudentPercentage.greaterThan(ONE))
    ) {
      errors.push("IB student percentage must be between 0 and 1");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// STAFF COST ENGINE
// ============================================================================

/**
 * Calculate staff costs based on configuration (fixed + variable or revenue-based).
 *
 * Two calculation methods:
 * 1. Fixed + Variable: Base cost + per-student cost
 * 2. Revenue-based: Percentage of total revenue
 *
 * @example
 * // Fixed + Variable model
 * const staffCost = calculateStaffCosts(1000, new D(18000000), {
 *   fixedStaffCost: new D(5000000),
 *   variableStaffCostPerStudent: new D(3000),
 * });
 * // Result: 5,000,000 + (1000 × 3000) = 8,000,000
 */
export function calculateStaffCosts(
  totalStudents: number,
  totalRevenue: Decimal,
  staffConfig: StaffConfig,
  currentYear: number,
  baseYear = 2028,
): Decimal {
  // Ratio-based with CPI escalation
  if (staffConfig.studentsPerTeacher && staffConfig.studentsPerNonTeacher) {
    const teachers = Math.ceil(totalStudents / staffConfig.studentsPerTeacher);
    const nonTeachers = Math.ceil(
      totalStudents / staffConfig.studentsPerNonTeacher,
    );
    const teacherSalary = staffConfig.avgTeacherSalary ?? ZERO;
    const adminSalary = staffConfig.avgAdminSalary ?? ZERO;
    const baseCost = new D(teachers)
      .times(teacherSalary)
      .times(12)
      .plus(new D(nonTeachers).times(adminSalary).times(12));

    const cpiRate = staffConfig.cpiRate ?? ZERO;
    const cpiFrequency = staffConfig.cpiFrequency ?? 1;
    const periods = Math.max(
      0,
      Math.floor((currentYear - baseYear) / cpiFrequency),
    );
    const cpiFactor = new D(1).plus(cpiRate).pow(periods);
    return baseCost.times(cpiFactor);
  }

  // If revenue-based percentage is provided, use that
  if (staffConfig.staffCostAsRevenuePercent) {
    return multiply(totalRevenue, staffConfig.staffCostAsRevenuePercent);
  }

  // Otherwise use fixed + variable model
  const fixedCost = staffConfig.fixedStaffCost;
  const variableCost = multiply(
    new D(totalStudents),
    staffConfig.variableStaffCostPerStudent,
  );

  return add(fixedCost, variableCost);
}

// ============================================================================
// RENT MODEL CALCULATIONS (Integrated from Transition Period)
// ============================================================================

/**
 * Calculate rent expense based on the selected rent model.
 * Integrated from transition period implementation.
 */
export function calculateRentExpense(
  year: number,
  baseYear: number,
  totalRevenue: Decimal,
  rentModel: RentModel,
  rentParams: FixedRentParams | RevenueShareParams | PartnerInvestmentParams,
): Decimal {
  switch (rentModel) {
    case "FIXED_ESCALATION":
      return calculateFixedEscalationRent(
        year,
        baseYear,
        rentParams as FixedRentParams,
      );

    case "REVENUE_SHARE":
      return calculateRevenueShareRent(
        totalRevenue,
        rentParams as RevenueShareParams,
      );

    case "PARTNER_INVESTMENT":
      return calculatePartnerInvestmentRent(
        year,
        baseYear,
        rentParams as PartnerInvestmentParams,
      );

    default:
      return ZERO;
  }
}

function calculateFixedEscalationRent(
  currentYear: number,
  baseYear: number,
  params: FixedRentParams,
): Decimal {
  const frequency = params.frequency || 1;
  const growthRate = params.growthRate || ZERO;
  const yearsElapsed = Math.max(
    0,
    Math.floor((currentYear - baseYear) / frequency),
  );
  const escalationFactor = new D(1).plus(growthRate).pow(yearsElapsed);
  return multiply(params.baseRent, escalationFactor);
}

function calculateRevenueShareRent(
  totalRevenue: Decimal,
  params: RevenueShareParams,
): Decimal {
  return multiply(totalRevenue, params.revenueSharePercent);
}

function calculatePartnerInvestmentRent(
  currentYear: number,
  baseYear: number,
  params: PartnerInvestmentParams,
): Decimal {
  const frequency = params.frequency || 1;
  const growthRate = params.growthRate || ZERO;
  const totalInvestment = params.landSize
    .times(params.landPricePerSqm)
    .plus(params.buaSize.times(params.constructionCostPerSqm));

  const baseRent = totalInvestment.times(params.yieldRate);
  const yearsElapsed = Math.max(
    0,
    Math.floor((currentYear - baseYear) / frequency),
  );
  const growthFactor = new D(1).plus(growthRate).pow(yearsElapsed);
  return baseRent.times(growthFactor);
}

// ============================================================================
// DEPRECIATION CALCULATION (Integrated - Full implementation in capex module)
// ============================================================================

/**
 * Calculate total depreciation expense for a given year.
 * This is a simplified version - full implementation in capex/depreciation.ts
 */
export function calculateDepreciation(
  year: number,
  capexConfig: CapExConfiguration,
): Decimal {
  let totalDepreciation = ZERO;

  // Depreciate existing assets
  for (const asset of capexConfig.existingAssets) {
    const assetDepreciation = calculateAssetDepreciation(asset, year);
    totalDepreciation = add(totalDepreciation, assetDepreciation);
  }

  // Depreciate new assets
  for (const asset of capexConfig.newAssets) {
    const assetDepreciation = calculateAssetDepreciation(asset, year);
    totalDepreciation = add(totalDepreciation, assetDepreciation);
  }

  return totalDepreciation;
}

function calculateAssetDepreciation(asset: CapExAsset, year: number): Decimal {
  // Asset purchased after this year - no depreciation yet
  if (year < asset.purchaseYear) {
    return ZERO;
  }

  // Asset fully depreciated
  if (asset.fullyDepreciated) {
    return ZERO;
  }

  const age = year - asset.purchaseYear + 1; // +1 because we depreciate in purchase year

  // Asset exceeded useful life
  if (age > asset.usefulLife) {
    return ZERO;
  }

  // Straight line depreciation
  if (asset.depreciationMethod === DepreciationMethod.STRAIGHT_LINE) {
    return divide(asset.purchaseAmount, new D(asset.usefulLife));
  }

  // Declining balance (if needed later)
  return ZERO;
}

// ============================================================================
// PROFIT & LOSS STATEMENT
// ============================================================================

/**
 * Generate Profit & Loss statement for a dynamic period year.
 */
export function calculateProfitLoss(
  year: number,
  input: DynamicPeriodInput,
  systemConfig: SystemConfiguration,
  workingCapitalRatios: WorkingCapitalRatios,
  priorDebt: Decimal,
  priorCash: Decimal,
): ProfitLossStatement {
  // Calculate enrollment
  const totalStudents = calculateEnrollment(year, input.enrollment);

  // Calculate revenue
  const tuitionRevenue = calculateTuitionRevenue(
    totalStudents,
    input.curriculum,
    year,
  );

  // Calculate Other Revenue using 2024 baseline ratio (Section 1.3 of Financial Rules)
  // Other Revenue = Tuition Revenue × Other Revenue Ratio
  const otherRevenue = multiply(
    tuitionRevenue,
    workingCapitalRatios.otherRevenueRatio,
  );

  const totalRevenue = add(tuitionRevenue, otherRevenue);

  // Calculate operating expenses
  // Base year for rent escalation should be 2028 (first dynamic year per financial rules)
  const RENT_BASE_YEAR = 2028;
  const rentExpense = calculateRentExpense(
    year,
    RENT_BASE_YEAR,
    totalRevenue,
    input.rentModel,
    input.rentParams,
  );

  const staffCosts = calculateStaffCosts(
    totalStudents,
    totalRevenue,
    input.staff,
    year,
    RENT_BASE_YEAR,
  );

  const otherOpex = input.otherOpexPercent
    ? multiply(totalRevenue, input.otherOpexPercent)
    : input.otherOpex;
  const totalOpex = add(add(rentExpense, staffCosts), otherOpex);

  // EBITDA
  const ebitda = subtract(totalRevenue, totalOpex);

  // Depreciation
  const depreciation = calculateDepreciation(year, input.capexConfig);

  // EBIT
  const ebit = subtract(ebitda, depreciation);

  // Interest (simplified - will be refined with circular solver)
  const avgDebt = priorDebt; // Simplified
  const interestExpense = multiply(avgDebt, systemConfig.debtInterestRate);

  const avgCash = priorCash; // Simplified
  const interestIncome = multiply(avgCash, systemConfig.depositInterestRate);

  const netInterest = subtract(interestExpense, interestIncome);

  // EBT
  const ebt = subtract(ebit, netInterest);

  // Zakat (2.5% of EBT if positive)
  const zakatExpense = ebt.greaterThan(ZERO)
    ? multiply(ebt, systemConfig.zakatRate)
    : ZERO;

  // Net Income
  const netIncome = subtract(ebt, zakatExpense);

  return {
    year,
    tuitionRevenue,
    otherRevenue,
    totalRevenue,
    rentExpense,
    staffCosts,
    otherOpex,
    totalOpex,
    ebitda,
    depreciation,
    ebit,
    interestExpense,
    interestIncome,
    netInterest,
    ebt,
    zakatExpense,
    netIncome,
  };
}

// ============================================================================
// BALANCE SHEET
// ============================================================================

/**
 * Generate Balance Sheet for a dynamic period year.
 */
export function calculateBalanceSheet(
  year: number,
  pl: ProfitLossStatement,
  priorBS: BalanceSheet,
  workingCapitalRatios: WorkingCapitalRatios,
  capexConfig: CapExConfiguration,
  capexSpending: Decimal,
): BalanceSheet {
  // Working Capital calculation using ratios
  const accountsReceivable = multiply(
    pl.totalRevenue,
    workingCapitalRatios.arPercent,
  );
  const prepaidExpenses = multiply(
    pl.totalOpex,
    workingCapitalRatios.prepaidPercent,
  );
  const accountsPayable = multiply(
    pl.totalOpex,
    workingCapitalRatios.apPercent,
  );
  const accruedExpenses = multiply(
    pl.totalOpex,
    workingCapitalRatios.accruedPercent,
  );
  const deferredRevenue = multiply(
    pl.totalRevenue,
    workingCapitalRatios.deferredRevenuePercent,
  );

  // PP&E calculation
  // Prior period stores NET PP&E, so we need to calculate GROSS first
  const priorNetPPE = priorBS.propertyPlantEquipment;
  const priorAccumDepreciation = priorBS.accumulatedDepreciation;
  const priorGrossPPE = add(priorNetPPE, priorAccumDepreciation);

  // Current Gross PP&E = Prior Gross PP&E + CapEx
  const currentGrossPPE = add(priorGrossPPE, capexSpending);

  // Accumulated Depreciation grows each period
  const accumulatedDepreciation = add(priorAccumDepreciation, pl.depreciation);

  // Net PP&E = Gross PP&E - Accumulated Depreciation
  const netPPE = subtract(currentGrossPPE, accumulatedDepreciation);

  // Store NET PP&E (to maintain consistency across periods)
  const ppe = netPPE;

  // Assets
  const totalCurrentAssets = add(
    add(ZERO, accountsReceivable), // Cash calculated via plug
    prepaidExpenses,
  );
  const totalNonCurrentAssets = netPPE;
  const totalAssets = add(totalCurrentAssets, totalNonCurrentAssets);

  // Equity
  const retainedEarnings = priorBS.totalEquity;
  const netIncomeCurrentYear = pl.netIncome;
  const totalEquity = add(retainedEarnings, netIncomeCurrentYear);

  // Liabilities (before debt plug)
  const totalCurrentLiabilities = add(
    add(accountsPayable, accruedExpenses),
    deferredRevenue,
  );

  // Debt plug: Assets = Liabilities + Equity
  // Debt = Total Assets - Total Current Liabilities - Equity
  const debtPlug = subtract(
    subtract(totalAssets, totalCurrentLiabilities),
    totalEquity,
  );

  const debtBalance = max(debtPlug, ZERO);
  const totalNonCurrentLiabilities = debtBalance;
  const totalLiabilities = add(
    totalCurrentLiabilities,
    totalNonCurrentLiabilities,
  );

  // Cash balancing plug
  const liabilitiesPlusEquity = add(totalLiabilities, totalEquity);
  const nonCashAssets = add(
    add(accountsReceivable, prepaidExpenses),
    totalNonCurrentAssets,
  );
  const cash = subtract(liabilitiesPlusEquity, nonCashAssets);

  // Calculate balance difference for validation
  const totalAssetsWithCash = add(
    add(add(cash, accountsReceivable), prepaidExpenses),
    netPPE,
  );
  const balanceDifference = subtract(
    totalAssetsWithCash,
    liabilitiesPlusEquity,
  );

  return {
    year,
    cash,
    accountsReceivable,
    prepaidExpenses,
    totalCurrentAssets: add(add(cash, accountsReceivable), prepaidExpenses),
    propertyPlantEquipment: ppe,
    accumulatedDepreciation,
    totalNonCurrentAssets: netPPE,
    totalAssets: totalAssetsWithCash,
    accountsPayable,
    accruedExpenses,
    deferredRevenue,
    totalCurrentLiabilities,
    debtBalance,
    totalNonCurrentLiabilities,
    totalLiabilities,
    retainedEarnings,
    netIncomeCurrentYear,
    totalEquity,
    balanceDifference,
  };
}

// ============================================================================
// CASH FLOW STATEMENT (Indirect Method)
// ============================================================================

/**
 * Generate Cash Flow statement using indirect method.
 */
export function calculateCashFlow(
  year: number,
  pl: ProfitLossStatement,
  bs: BalanceSheet,
  priorBS: BalanceSheet,
  capexSpending: Decimal,
): CashFlowStatement {
  // Operating Activities (Indirect Method)
  const netIncome = pl.netIncome;

  // Add back non-cash expenses
  const depreciation = pl.depreciation;

  // Changes in working capital (increase in asset = use of cash = negative)
  const changeInAR = subtract(
    bs.accountsReceivable,
    priorBS.accountsReceivable,
  );
  const changeInPrepaid = subtract(bs.prepaidExpenses, priorBS.prepaidExpenses);
  const changeInAP = subtract(bs.accountsPayable, priorBS.accountsPayable);
  const changeInAccrued = subtract(bs.accruedExpenses, priorBS.accruedExpenses);
  const changeInDeferredRevenue = subtract(
    bs.deferredRevenue,
    priorBS.deferredRevenue,
  );

  const cashFlowFromOperations = add(
    add(netIncome, depreciation),
    add(
      add(subtract(ZERO, changeInAR), subtract(ZERO, changeInPrepaid)),
      add(add(changeInAP, changeInAccrued), changeInDeferredRevenue),
    ),
  );

  // Investing Activities
  const capex = multiply(capexSpending, new D(-1)); // CapEx is cash outflow
  const cashFlowFromInvesting = capex;

  // Financing Activities
  const debtChange = subtract(bs.debtBalance, priorBS.debtBalance);
  const debtIssuance = debtChange.greaterThan(ZERO) ? debtChange : ZERO;
  const debtRepayment = debtChange.lessThan(ZERO)
    ? multiply(debtChange, new D(-1))
    : ZERO;
  const cashFlowFromFinancing = debtChange;

  // Net change in cash
  const netChangeInCash = add(
    add(cashFlowFromOperations, cashFlowFromInvesting),
    cashFlowFromFinancing,
  );

  // Ending cash
  const beginningCash = priorBS.cash;
  const endingCash = add(beginningCash, netChangeInCash);

  // Cash reconciliation difference
  const cashReconciliationDiff = subtract(endingCash, bs.cash);

  return {
    year,
    netIncome,
    depreciation,
    changeInAR,
    changeInPrepaid,
    changeInAP,
    changeInAccrued,
    changeInDeferredRevenue,
    cashFlowFromOperations,
    capex,
    cashFlowFromInvesting,
    debtIssuance,
    debtRepayment,
    cashFlowFromFinancing,
    netChangeInCash,
    beginningCash,
    endingCash,
    cashReconciliationDiff,
  };
}

// ============================================================================
// MAIN DYNAMIC PERIOD CALCULATOR
// ============================================================================

/**
 * Calculate complete financial period for a dynamic year.
 */
export function calculateDynamicPeriod(
  input: DynamicPeriodInput,
  priorPeriod: FinancialPeriod,
  systemConfig: SystemConfiguration,
  workingCapitalRatios: WorkingCapitalRatios,
): FinancialPeriod {
  const { year } = input;

  // Validate configurations
  const enrollmentValidation = validateEnrollmentConfig(input.enrollment);
  if (!enrollmentValidation.valid) {
    throw new Error(
      `Invalid enrollment config: ${enrollmentValidation.errors.join(", ")}`,
    );
  }

  const curriculumValidation = validateCurriculumConfig(input.curriculum);
  if (!curriculumValidation.valid) {
    throw new Error(
      `Invalid curriculum config: ${curriculumValidation.errors.join(", ")}`,
    );
  }

  // Calculate P&L
  const profitLoss = calculateProfitLoss(
    year,
    input,
    systemConfig,
    workingCapitalRatios,
    priorPeriod.balanceSheet.debtBalance,
    priorPeriod.balanceSheet.cash,
  );

  // Calculate CapEx spending (simplified - can be enhanced)
  const capexSpending = ZERO; // TODO: Implement auto-reinvestment logic

  // Calculate Balance Sheet
  const balanceSheet = calculateBalanceSheet(
    year,
    profitLoss,
    priorPeriod.balanceSheet,
    workingCapitalRatios,
    input.capexConfig,
    capexSpending,
  );

  // Calculate Cash Flow
  const cashFlow = calculateCashFlow(
    year,
    profitLoss,
    balanceSheet,
    priorPeriod.balanceSheet,
    capexSpending,
  );

  // Validate balance sheet balancing
  const totalLiabilitiesAndEquity = add(
    balanceSheet.totalLiabilities,
    balanceSheet.totalEquity,
  );
  const balanceSheetDiff = balanceSheet.balanceDifference;
  const balanceSheetBalanced = isWithinTolerance(
    balanceSheetDiff,
    ZERO,
    BALANCE_SHEET_TOLERANCE,
  );

  // Validate cash flow reconciliation
  const cashReconciliationDiff = cashFlow.cashReconciliationDiff;
  const cashFlowReconciled = isWithinTolerance(
    cashReconciliationDiff,
    ZERO,
    CASH_FLOW_TOLERANCE,
  );

  // Log warnings if not balanced (but don't throw)
  if (!balanceSheetBalanced) {
    console.warn(
      `⚠️  Year ${year}: Balance sheet not balanced (diff: ${balanceSheetDiff.toFixed(2)})`,
    );
  }

  if (!cashFlowReconciled) {
    console.warn(
      `⚠️  Year ${year}: Cash flow not reconciled (diff: ${cashReconciliationDiff.toFixed(2)})`,
    );
  }

  return {
    year,
    periodType: PeriodType.DYNAMIC,
    profitLoss,
    balanceSheet,
    cashFlow,
    calculatedAt: new Date(),
    iterationsRequired: 0,
    converged: true,
    balanceSheetBalanced,
    cashFlowReconciled,
  };
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate period linkage from transition to dynamic period.
 */
export function validatePeriodLinkage(
  priorPeriod: FinancialPeriod,
  currentPeriod: FinancialPeriod,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Year continuity
  if (currentPeriod.year !== priorPeriod.year + 1) {
    errors.push(
      `Year discontinuity: ${priorPeriod.year} -> ${currentPeriod.year}`,
    );
  }

  // Equity linkage: Current equity = Prior equity + Net income
  const expectedEquity = add(
    priorPeriod.balanceSheet.totalEquity,
    currentPeriod.profitLoss.netIncome,
  );
  const equityDiff = subtract(
    currentPeriod.balanceSheet.totalEquity,
    expectedEquity,
  );
  if (!isWithinTolerance(equityDiff, ZERO, new D(0.01))) {
    errors.push(
      `Equity linkage broken: expected ${expectedEquity.toString()}, got ${currentPeriod.balanceSheet.totalEquity.toString()}`,
    );
  }

  // Cash linkage: Current cash = Prior cash + Net cash change
  const expectedCash = add(
    priorPeriod.balanceSheet.cash,
    currentPeriod.cashFlow.netChangeInCash,
  );
  const cashDiff = subtract(currentPeriod.balanceSheet.cash, expectedCash);
  if (!isWithinTolerance(cashDiff, ZERO, CASH_FLOW_TOLERANCE)) {
    errors.push(
      `Cash linkage broken: expected ${expectedCash.toString()}, got ${currentPeriod.balanceSheet.cash.toString()}`,
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Export all functions for testing and external use.
 */
export const dynamicPeriodExports = {
  calculateEnrollment,
  validateEnrollmentConfig,
  calculateTuitionRevenue,
  validateCurriculumConfig,
  calculateStaffCosts,
  calculateRentExpense,
  calculateDepreciation,
  calculateProfitLoss,
  calculateBalanceSheet,
  calculateCashFlow,
  calculateDynamicPeriod,
  validatePeriodLinkage,
};
