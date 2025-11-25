/**
 * PHASE 2: CORE FINANCIAL ENGINE - TYPE DEFINITIONS
 *
 * This file contains all TypeScript interfaces and types for the financial calculation engine.
 * It defines the structure for:
 * - Financial periods (Historical, Transition, Dynamic)
 * - Financial statements (P&L, Balance Sheet, Cash Flow)
 * - Input/Output types for calculations
 * - Configuration types
 */

import type { Decimal } from "decimal.js";

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export enum PeriodType {
  HISTORICAL = "HISTORICAL", // 2023-2024
  TRANSITION = "TRANSITION", // 2025-2027
  DYNAMIC = "DYNAMIC", // 2028-2053
}

export enum RentModel {
  FIXED_ESCALATION = "FIXED_ESCALATION",
  REVENUE_SHARE = "REVENUE_SHARE",
  PARTNER_INVESTMENT = "PARTNER_INVESTMENT",
}

export enum StatementType {
  PROFIT_LOSS = "PROFIT_LOSS",
  BALANCE_SHEET = "BALANCE_SHEET",
  CASH_FLOW = "CASH_FLOW",
}

export enum DepreciationMethod {
  STRAIGHT_LINE = "STRAIGHT_LINE",
  DECLINING_BALANCE = "DECLINING_BALANCE",
}

// ============================================================================
// PROFIT & LOSS STATEMENT
// ============================================================================

export interface ProfitLossStatement {
  year: number;

  // Revenue
  tuitionRevenue: Decimal;
  otherRevenue: Decimal;
  totalRevenue: Decimal;

  // Operating Expenses
  rentExpense: Decimal;
  staffCosts: Decimal;
  otherOpex: Decimal;
  totalOpex: Decimal;

  // EBITDA
  ebitda: Decimal;

  // Depreciation
  depreciation: Decimal;

  // EBIT
  ebit: Decimal;

  // Interest
  interestExpense: Decimal;
  interestIncome: Decimal;
  netInterest: Decimal;

  // EBT
  ebt: Decimal;

  // Zakat
  zakatExpense: Decimal;

  // Net Income
  netIncome: Decimal;
}

// ============================================================================
// BALANCE SHEET
// ============================================================================

export interface BalanceSheet {
  year: number;

  // ASSETS
  // Current Assets
  cash: Decimal;
  accountsReceivable: Decimal;
  prepaidExpenses: Decimal;
  totalCurrentAssets: Decimal;

  // Non-Current Assets
  propertyPlantEquipment: Decimal; // Net PP&E
  accumulatedDepreciation: Decimal;
  totalNonCurrentAssets: Decimal;

  totalAssets: Decimal;

  // LIABILITIES
  // Current Liabilities
  accountsPayable: Decimal;
  accruedExpenses: Decimal;
  deferredRevenue: Decimal;
  totalCurrentLiabilities: Decimal;

  // Non-Current Liabilities
  debtBalance: Decimal; // PLUG to balance
  totalNonCurrentLiabilities: Decimal;

  totalLiabilities: Decimal;

  // EQUITY
  retainedEarnings: Decimal;
  netIncomeCurrentYear: Decimal;
  totalEquity: Decimal;

  // Validation
  balanceDifference: Decimal; // Should be ~0
}

// ============================================================================
// CASH FLOW STATEMENT (Indirect Method)
// ============================================================================

export interface CashFlowStatement {
  year: number;

  // Cash Flow from Operations
  netIncome: Decimal;
  depreciation: Decimal;
  changeInAR: Decimal;
  changeInPrepaid: Decimal;
  changeInAP: Decimal;
  changeInAccrued: Decimal;
  changeInDeferredRevenue: Decimal;
  cashFlowFromOperations: Decimal;

  // Cash Flow from Investing
  capex: Decimal;
  cashFlowFromInvesting: Decimal;

  // Cash Flow from Financing
  debtIssuance: Decimal;
  debtRepayment: Decimal;
  cashFlowFromFinancing: Decimal;

  // Net Change in Cash
  netChangeInCash: Decimal;

  // Beginning and Ending Cash
  beginningCash: Decimal;
  endingCash: Decimal;

  // Validation (should match Balance Sheet cash)
  cashReconciliationDiff: Decimal;
}

// ============================================================================
// COMPLETE FINANCIAL PERIOD
// ============================================================================

export interface FinancialPeriod {
  year: number;
  periodType: PeriodType;

  // Financial Statements
  profitLoss: ProfitLossStatement;
  balanceSheet: BalanceSheet;
  cashFlow: CashFlowStatement;

  // Calculation Metadata
  calculatedAt: Date;
  iterationsRequired?: number; // For circular solver
  converged: boolean;

  // Validation Flags
  balanceSheetBalanced: boolean;
  cashFlowReconciled: boolean;
}

// ============================================================================
// HISTORICAL PERIOD INPUT (2023-2024)
// ============================================================================

export interface HistoricalPeriodInput {
  year: number;

  // From Database (HistoricalData)
  profitLoss: {
    revenue: Decimal; // DEPRECATED: Use tuitionRevenue + otherRevenue instead
    tuitionRevenue?: Decimal; // Tuition revenue (FR + IB)
    otherRevenue?: Decimal; // Other revenue (cafeteria, programs, etc.)
    rent: Decimal;
    staffCosts: Decimal;
    otherOpex: Decimal;
    depreciation: Decimal;
    interest: Decimal;
    zakat: Decimal;
  };

  balanceSheet: {
    cash: Decimal;
    accountsReceivable: Decimal;
    prepaidExpenses: Decimal;
    ppe: Decimal;
    accumulatedDepreciation: Decimal;
    accountsPayable: Decimal;
    accruedExpenses: Decimal;
    deferredRevenue: Decimal;
    debt: Decimal;
    equity: Decimal;
  };

  // Immutability flag (GAP 17)
  immutable: boolean;
}

// ============================================================================
// TRANSITION PERIOD INPUT (2025-2027)
// ============================================================================

export interface TransitionPeriodInput {
  year: number;

  // Pre-fill logic (GAP 19)
  preFillFromPriorYear: boolean;

  // Revenue assumptions (spec)
  numberOfStudents?: number; // FR only in transition
  averageTuitionPerStudent?: Decimal;
  revenueGrowthRate?: Decimal; // If not using direct student/tuition

  // OpEx assumptions
  rentGrowthPercent?: Decimal; // Growth applied to 2024 rent (per financial rules)
  rentAmount?: Decimal; // If not using rent model
  staffCostsRatio?: Decimal; // % of revenue
  otherOpex?: Decimal;

  // Working Capital ratios (if not auto-calculated)
  workingCapitalRatios?: WorkingCapitalRatios;
}

// ============================================================================
// DYNAMIC PERIOD INPUT (2028-2053)
// ============================================================================

export interface DynamicPeriodInput {
  year: number;

  // Enrollment Configuration
  enrollment: EnrollmentConfig;

  // Curriculum Configuration (GAP 3: IB Toggle)
  curriculum: CurriculumConfig;

  // Staff Cost Configuration
  staff: StaffConfig;

  // Rent Model (determined by LeaseProposal)
  rentModel: RentModel;
  rentParams: FixedRentParams | RevenueShareParams | PartnerInvestmentParams;

  // Other OpEx
  otherOpex: Decimal;
  otherOpexPercent?: Decimal; // Optional % of revenue

  // CapEx Configuration
  capexConfig: CapExConfiguration;
}

// ============================================================================
// ENROLLMENT ENGINE (GAP 20: Ramp-up)
// ============================================================================

export interface EnrollmentConfig {
  // Ramp-up configuration
  rampUpEnabled: boolean;
  rampUpStartYear: number; // e.g., 2028
  rampUpEndYear: number; // e.g., 2032
  rampUpTargetStudents: number; // e.g., 1200
  rampPlanPercentages?: number[]; // Optional 5-year ramp percentages (0-1)

  // Steady state
  steadyStateStudents: number;

  // Grade distribution
  gradeDistribution: GradeDistribution[];
}

export interface GradeDistribution {
  gradeName: string; // e.g., "KG1", "Grade 1", etc.
  percentage: Decimal; // % of total students
}

// ============================================================================
// CURRICULUM CONFIGURATION (GAP 3: IB Toggle)
// ============================================================================

export interface CurriculumConfig {
  // IB Toggle
  ibProgramEnabled: boolean;
  ibStartYear?: number; // Year when IB starts

  // Tuition fees by curriculum
  nationalCurriculumFee: Decimal; // Annual fee per student
  ibCurriculumFee: Decimal; // Annual fee per IB student (if enabled)
  nationalTuitionGrowthRate?: Decimal; // Growth rate for national tuition
  nationalTuitionGrowthFrequency?: number; // Frequency in years (1-5)
  ibTuitionGrowthRate?: Decimal; // Growth rate for IB tuition
  ibTuitionGrowthFrequency?: number; // Frequency in years (1-5)

  // Student distribution
  ibStudentPercentage?: Decimal; // % of students in IB (if enabled)
}

// ============================================================================
// STAFF COST CONFIGURATION
// ============================================================================

export interface StaffConfig {
  // Fixed vs. Variable
  fixedStaffCost: Decimal; // Base staff cost
  variableStaffCostPerStudent: Decimal; // Additional cost per student

  // Or ratio-based
  staffCostAsRevenuePercent?: Decimal; // Alternative: % of revenue
  studentsPerTeacher?: number;
  studentsPerNonTeacher?: number;
  avgTeacherSalary?: Decimal; // Average monthly teacher salary
  avgAdminSalary?: Decimal; // Average monthly admin salary
  cpiRate?: Decimal;
  cpiFrequency?: number; // years
}

// ============================================================================
// RENT MODELS (3 types)
// ============================================================================

// Model 1: Fixed Escalation
export interface FixedRentParams {
  baseRent: Decimal; // Base rent in the first dynamic year (2028)
  growthRate: Decimal; // Escalation rate (e.g., 0.03 for 3%)
  frequency: number; // Escalation frequency in years (1-5)
}

// Model 2: Revenue Share (percentage-only per financial rules)
export interface RevenueShareParams {
  revenueSharePercent: Decimal; // % of total revenue (e.g., 0.08 for 8%)
}

// Model 3: Partner Investment (investment-yield model per financial rules)
export interface PartnerInvestmentParams {
  landSize: Decimal; // Land size in m²
  landPricePerSqm: Decimal; // Land price per m²
  buaSize: Decimal; // Built-up area size in m²
  constructionCostPerSqm: Decimal; // Construction cost per m²
  yieldRate: Decimal; // Yield applied to total investment (e.g., 0.09 for 9%)
  growthRate: Decimal; // Rent growth rate applied to base rent
  frequency: number; // Growth frequency in years (1-5)
}

// ============================================================================
// CAPEX CONFIGURATION (GAP 1: Depreciation)
// ============================================================================

export interface CapExConfiguration {
  // Auto-reinvestment
  autoReinvestEnabled: boolean;
  reinvestFrequency?: number; // Every N years
  reinvestAmount?: Decimal; // Fixed amount
  reinvestAmountPercent?: Decimal; // Or % of revenue

  // Asset pools
  existingAssets: CapExAsset[]; // OLD assets from 2023-2024
  newAssets: CapExAsset[]; // NEW assets from Transition/Dynamic
}

export interface CapExAsset {
  id: string;
  assetName: string;
  purchaseYear: number;
  purchaseAmount: Decimal;
  usefulLife: number; // Years
  depreciationMethod: DepreciationMethod;

  // For declining balance
  depreciationRate?: Decimal;

  // Tracking
  accumulatedDepreciation: Decimal;
  netBookValue: Decimal;
  fullyDepreciated: boolean;
}

// ============================================================================
// WORKING CAPITAL RATIOS (GAP 2: Auto-calculation from 2024)
// ============================================================================

export interface WorkingCapitalRatios {
  arPercent: Decimal; // AR as % of revenue
  prepaidPercent: Decimal; // Prepaid as % of OpEx
  apPercent: Decimal; // AP as % of OpEx
  accruedPercent: Decimal; // Accrued as % of OpEx
  deferredRevenuePercent: Decimal; // Deferred as % of revenue

  // Other Revenue Ratio (Section 1.3 of Financial Rules)
  otherRevenueRatio: Decimal; // Other revenue as % of tuition revenue (from 2024 baseline)

  locked: boolean; // If true, don't recalculate
  calculatedFrom2024?: boolean; // Flag for auto-calculation
}

// ============================================================================
// CIRCULAR SOLVER CONFIGURATION (GAP 11)
// ============================================================================

export interface CircularSolverConfig {
  maxIterations: number; // e.g., 100
  convergenceTolerance: Decimal; // e.g., 0.01 ($0.01)
  relaxationFactor?: Decimal; // For stability (e.g., 0.5)
}

export interface CircularSolverResult {
  converged: boolean;
  iterations: number;
  finalDifference: Decimal;
  interestExpense: Decimal;
  interestIncome: Decimal; // GAP 16: Bank deposit interest
  netInterest: Decimal; // Interest income - interest expense
  zakatExpense: Decimal;
  debtBalance: Decimal;
  ebt: Decimal; // Earnings before tax
  netIncome: Decimal; // Final net income after zakat
  cash: Decimal; // Final cash balance
}

// ============================================================================
// SYSTEM CONFIGURATION (from SystemConfig table)
// ============================================================================

export interface SystemConfiguration {
  zakatRate: Decimal; // e.g., 0.025 (2.5%)
  debtInterestRate: Decimal; // e.g., 0.05 (5%)
  depositInterestRate: Decimal; // e.g., 0.02 (2%)
  minCashBalance: Decimal; // e.g., 1,000,000 (GAP 14)
}

// ============================================================================
// CALCULATION ENGINE INPUT & OUTPUT
// ============================================================================

export interface CalculationEngineInput {
  // System configuration
  systemConfig: SystemConfiguration;

  // Historical data (2023-2024)
  historicalPeriods: HistoricalPeriodInput[];

  // Transition period configuration (2025-2027)
  transitionPeriods: TransitionPeriodInput[];

  // Dynamic period configuration (2028-2053)
  dynamicPeriodConfig: DynamicPeriodInput;

  // Rent model (applies to Transition + Dynamic)
  rentModel: RentModel;
  rentParams: FixedRentParams | RevenueShareParams | PartnerInvestmentParams;

  // CapEx configuration
  capexConfig: CapExConfiguration;

  // Working Capital ratios
  workingCapitalRatios: WorkingCapitalRatios;

  // Circular solver config
  circularSolverConfig: CircularSolverConfig;
}

export interface CalculationEngineOutput {
  // All 30 years of financial data
  periods: FinancialPeriod[]; // 2024-2053 (30 years)

  // Summary metrics
  metrics: {
    totalNetIncome: Decimal;
    averageROE: Decimal;
    peakDebt: Decimal;
    finalCash: Decimal;
    npv?: Decimal; // Optional: Net Present Value
    irr?: Decimal; // Optional: Internal Rate of Return
  };

  // Validation results
  validation: {
    allPeriodsBalanced: boolean;
    allCashFlowsReconciled: boolean;
    maxBalanceDifference: Decimal;
    maxCashDifference: Decimal;
  };

  // Performance metrics
  performance: {
    calculationTimeMs: number;
    totalIterations: number;
    averageIterationsPerYear: number;
  };

  // Calculation timestamp
  calculatedAt: Date;
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  year: number;
  field: string;
  message: string;
  actualValue: Decimal;
  expectedValue?: Decimal;
  difference?: Decimal;
}

export interface ValidationWarning {
  year: number;
  field: string;
  message: string;
  value: Decimal;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type DecimalInput = Decimal | number | string;

export interface YearRange {
  startYear: number;
  endYear: number;
}

export const YEAR_RANGES: Record<PeriodType, YearRange> = {
  [PeriodType.HISTORICAL]: { startYear: 2023, endYear: 2024 },
  [PeriodType.TRANSITION]: { startYear: 2025, endYear: 2027 },
  [PeriodType.DYNAMIC]: { startYear: 2028, endYear: 2053 },
};
