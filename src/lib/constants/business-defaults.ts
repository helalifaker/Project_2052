/**
 * Business Default Constants
 *
 * Centralized default values for business logic including:
 * - Enrollment parameters
 * - Curriculum settings
 * - Staff ratios and salaries
 * - Rent model parameters
 * - Financial rates
 *
 * These values are used as defaults when creating new proposals
 * or when database values are not available.
 */

// ============================================================================
// ENROLLMENT DEFAULTS
// ============================================================================

/**
 * Default enrollment configuration for dynamic period (2028+)
 */
export const DEFAULT_ENROLLMENT = {
  /** Whether ramp-up is enabled by default */
  rampUpEnabled: true,
  /** Number of students at steady state */
  steadyStateStudents: 2000,
  /** Target students during ramp-up period */
  rampUpTargetStudents: 2000,
  /** Percentage of target achieved each year during ramp-up [20%, 40%, 60%, 80%, 100%] */
  rampPlanPercentages: [0.2, 0.4, 0.6, 0.8, 1] as readonly number[],
  /** Default grade distribution (empty = even distribution) */
  gradeDistribution: [] as readonly number[],
} as const;

// ============================================================================
// CURRICULUM DEFAULTS
// ============================================================================

/**
 * Default French/National curriculum configuration
 */
export const DEFAULT_FRENCH_PROGRAM = {
  /** Whether French program is enabled by default */
  enabled: true,
  /** Percentage of students in French program (100 = 100%) */
  percentage: 100,
  /** Base tuition fee in SAR for 2028 */
  baseTuition2028: 30000,
  /** Annual tuition growth rate (3 = 3%) */
  growthRate: 3,
  /** How often growth is applied (years) */
  growthFrequency: 1,
} as const;

/**
 * Default IB curriculum configuration
 */
export const DEFAULT_IB_PROGRAM = {
  /** Whether IB program is enabled by default */
  enabled: false,
  /** Percentage of students in IB program (0 = 0%) */
  percentage: 0,
  /** Base tuition fee in SAR for 2028 */
  baseTuition2028: 45000,
  /** Annual tuition growth rate (3 = 3%) */
  growthRate: 3,
  /** How often growth is applied (years) */
  growthFrequency: 1,
} as const;

/**
 * Combined curriculum defaults for proposal forms
 */
export const DEFAULT_CURRICULUM = {
  frenchProgramEnabled: DEFAULT_FRENCH_PROGRAM.enabled,
  frenchProgramPercentage: DEFAULT_FRENCH_PROGRAM.percentage,
  frenchBaseTuition2028: DEFAULT_FRENCH_PROGRAM.baseTuition2028,
  frenchTuitionGrowthRate: DEFAULT_FRENCH_PROGRAM.growthRate,
  frenchTuitionGrowthFrequency: DEFAULT_FRENCH_PROGRAM.growthFrequency,
  ibProgramEnabled: DEFAULT_IB_PROGRAM.enabled,
  ibProgramPercentage: DEFAULT_IB_PROGRAM.percentage,
  ibBaseTuition2028: DEFAULT_IB_PROGRAM.baseTuition2028,
  ibTuitionGrowthRate: DEFAULT_IB_PROGRAM.growthRate,
  ibTuitionGrowthFrequency: DEFAULT_IB_PROGRAM.growthFrequency,
} as const;

// ============================================================================
// STAFF DEFAULTS
// ============================================================================

/**
 * Default staff configuration
 */
export const DEFAULT_STAFF = {
  /** Number of students per teaching staff */
  studentsPerTeacher: 14,
  /** Number of students per non-teaching staff */
  studentsPerNonTeacher: 50,
  /** Average annual teacher salary in SAR */
  avgTeacherSalary: 60000,
  /** Average annual admin/non-teaching staff salary in SAR */
  avgAdminSalary: 50000,
  /** Annual CPI/salary growth rate (3 = 3%) */
  cpiRate: 3,
  /** How often CPI adjustment is applied (years) */
  cpiFrequency: 1,
} as const;

// ============================================================================
// RENT MODEL DEFAULTS
// ============================================================================

/**
 * Default Fixed Escalation rent model parameters
 */
export const DEFAULT_FIXED_RENT = {
  /** Base annual rent in SAR (10M) */
  baseRent: 10000000,
  /** Annual rent growth rate (3 = 3%) */
  growthRate: 3,
  /** How often growth is applied (years) */
  frequency: 1,
} as const;

/**
 * Default Revenue Share rent model parameters
 */
export const DEFAULT_REVENUE_SHARE = {
  /** Percentage of revenue paid as rent (15 = 15%) */
  revenueSharePercent: 15,
} as const;

/**
 * Default Partner Investment rent model parameters
 */
export const DEFAULT_PARTNER_INVESTMENT = {
  /** Land size in square meters */
  landSize: 10000,
  /** Land price per square meter in SAR */
  landPricePerSqm: 5000,
  /** Built-up area in square meters */
  buaSize: 20000,
  /** Construction cost per square meter in SAR */
  constructionCostPerSqm: 2500,
  /** Annual yield rate (9 = 9%) */
  yieldRate: 9,
  /** Annual rent growth rate (2 = 2%) */
  growthRate: 2,
  /** How often growth is applied (years) */
  frequency: 1,
} as const;

// ============================================================================
// FINANCIAL RATE DEFAULTS (UI Display Values)
// ============================================================================

/**
 * Default financial rates for admin configuration
 * Note: Engine uses Decimal.js constants from @/lib/engine/core/constants.ts
 * These are the UI-friendly percentage values (not decimals)
 */
export const DEFAULT_FINANCIAL_RATES = {
  /** Zakat rate as percentage (2.5%) */
  zakatRate: 2.5,
  /** Debt interest rate as percentage (5%) */
  debtInterestRate: 5.0,
  /** Deposit interest rate as percentage (2%) */
  depositInterestRate: 2.0,
  /** NPV discount rate as percentage (8%) */
  npvDiscountRate: 8.0,
  /** Minimum cash balance in millions SAR (1M) */
  minCashBalanceMillions: 1.0,
} as const;

// ============================================================================
// OPERATING EXPENSE DEFAULTS
// ============================================================================

/**
 * Default other operating expenses as percentage of revenue
 * Typical range is 8-12% of revenue
 */
export const DEFAULT_OTHER_OPEX_PERCENT = 10;

/**
 * Guidance range for other OpEx as percentage of revenue
 */
export const OPEX_PERCENTAGE_RANGE = {
  min: 8,
  max: 12,
  description: "8-12% of revenue is typical for operational expenses",
} as const;

// ============================================================================
// HELPER EXPORTS
// ============================================================================

/**
 * Get default rent parameters based on rent model type
 */
export function getDefaultRentParams(rentModel: string) {
  switch (rentModel) {
    case "Fixed":
    case "FIXED_ESCALATION":
      return {
        baseRent: DEFAULT_FIXED_RENT.baseRent,
        rentGrowthRate: DEFAULT_FIXED_RENT.growthRate,
        rentFrequency: DEFAULT_FIXED_RENT.frequency,
      };
    case "RevShare":
    case "REVENUE_SHARE":
      return {
        revenueSharePercent: DEFAULT_REVENUE_SHARE.revenueSharePercent,
      };
    case "Partner":
    case "PARTNER_INVESTMENT":
      return {
        partnerLandSize: DEFAULT_PARTNER_INVESTMENT.landSize,
        partnerLandPricePerSqm: DEFAULT_PARTNER_INVESTMENT.landPricePerSqm,
        partnerBuaSize: DEFAULT_PARTNER_INVESTMENT.buaSize,
        partnerConstructionCostPerSqm:
          DEFAULT_PARTNER_INVESTMENT.constructionCostPerSqm,
        partnerYieldRate: DEFAULT_PARTNER_INVESTMENT.yieldRate,
        partnerGrowthRate: DEFAULT_PARTNER_INVESTMENT.growthRate,
        partnerFrequency: DEFAULT_PARTNER_INVESTMENT.frequency,
      };
    default:
      return {};
  }
}
