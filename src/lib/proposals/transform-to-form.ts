import type { ProposalFormData } from "@/components/proposals/wizard/types";

/**
 * Database proposal record type
 * Subset of fields needed for pre-filling the wizard
 */
export type ProposalRecord = {
  id: string;
  name: string;
  rentModel: string;
  contractPeriodYears: number;
  enrollment: unknown;
  curriculum: unknown;
  staff: unknown;
  rentParams: unknown;
  otherOpexPercent: unknown;
};

/**
 * Transform database LeaseProposal to wizard ProposalFormData
 *
 * This function handles the inverse of the wizard→database transformation:
 * - Converts enum cases: FIXED → Fixed, REVSHARE → RevShare, PARTNER → Partner
 * - Flattens JSON structures: enrollment.capacity → frenchCapacity + ibCapacity
 * - Converts percentages: database stores 0.03, form expects 3
 * - Extracts rent model-specific parameters
 * - Handles legacy field names (partnerLandSize vs landSize)
 * - Provides fallback defaults for all fields
 *
 * @param proposal - Database LeaseProposal record
 * @returns Partial form data ready for wizard initialization
 */
export function proposalToFormData(
  proposal: ProposalRecord
): Partial<ProposalFormData> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const enrollment = proposal.enrollment as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const curriculum = proposal.curriculum as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const staff = proposal.staff as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rentParams = proposal.rentParams as any;

  // Base transformation
  const formData: Partial<ProposalFormData> = {
    // Step 1: Basics
    developerName: "", // Intentionally blank - user will provide new name
    contractPeriodYears: (proposal.contractPeriodYears as 25 | 30) || 30,
    rentModel: normalizeRentModelForForm(proposal.rentModel),

    // Step 2: Enrollment
    // Try both old format (capacity) and new format (steadyStateStudents)
    frenchCapacity: toNumber(enrollment?.steadyStateStudents || enrollment?.capacity) || 1000,
    ibCapacity: 0, // Currently all proposals use FR only

    // Ramp-up percentages (stored as decimals 0.0-1.0, form expects 0-100)
    // Try both old format (rampUp) and new format (rampPlanPercentages)
    rampUpFRYear1Percentage: toPercent(enrollment?.rampPlanPercentages?.[0] || enrollment?.rampUp?.[0], 20),
    rampUpFRYear2Percentage: toPercent(enrollment?.rampPlanPercentages?.[1] || enrollment?.rampUp?.[1], 40),
    rampUpFRYear3Percentage: toPercent(enrollment?.rampPlanPercentages?.[2] || enrollment?.rampUp?.[2], 60),
    rampUpFRYear4Percentage: toPercent(enrollment?.rampPlanPercentages?.[3] || enrollment?.rampUp?.[3], 80),
    rampUpFRYear5Percentage: toPercent(enrollment?.rampPlanPercentages?.[4] || enrollment?.rampUp?.[4], 100),

    // IB ramp-up defaults (not used in most proposals)
    rampUpIBYear1Percentage: 10,
    rampUpIBYear2Percentage: 30,
    rampUpIBYear3Percentage: 50,
    rampUpIBYear4Percentage: 75,
    rampUpIBYear5Percentage: 100,

    // Step 3: Curriculum
    // Try both flat format (new) and nested format (legacy)
    frenchProgramEnabled: curriculum?.frenchProgramEnabled ?? curriculum?.fr?.enabled ?? true,
    frenchProgramPercentage: 100, // Default assumption
    ibProgramEnabled: curriculum?.ibProgramEnabled ?? curriculum?.ib?.enabled ?? false,
    ibProgramPercentage: 0, // Default assumption

    frenchBaseTuition2028: toNumber(curriculum?.frenchBaseTuition2028 || curriculum?.fr?.baseTuition2028) || 30000,
    ibBaseTuition2028: toNumber(curriculum?.ibBaseTuition2028 || curriculum?.ib?.baseTuition2028) || 45000,
    ibStartYear: curriculum?.ibStartYear || curriculum?.ib?.startYear || 2028,

    // Growth rates (some stored as decimal 0.03, some as percentage 3)
    frenchTuitionGrowthRate: toPercent(curriculum?.frenchTuitionGrowthRate || curriculum?.fr?.growthRate, 3),
    frenchTuitionGrowthFrequency: toNumber(curriculum?.frenchTuitionGrowthFrequency || curriculum?.fr?.frequency) || 1,
    ibTuitionGrowthRate: toPercent(curriculum?.ibTuitionGrowthRate || curriculum?.ib?.growthRate, 3),
    ibTuitionGrowthFrequency: toNumber(curriculum?.ibTuitionGrowthFrequency || curriculum?.ib?.frequency) || 1,

    // Step 5: Operating Costs
    studentsPerTeacher: toNumber(staff?.studentsPerTeacher) || 14,
    studentsPerNonTeacher: toNumber(staff?.studentsPerNonTeacher) || 50,
    avgTeacherSalary: toNumber(staff?.avgTeacherSalary) || 60000,
    avgAdminSalary: toNumber(staff?.avgAdminSalary) || 50000,

    // CPI rate (stored as decimal, form expects percentage)
    // Try both formats: new (cpiRate) and old (cpi.rate)
    cpiRate: toPercent(staff?.cpiRate || staff?.cpi?.rate, 3),
    cpiFrequency: toNumber(staff?.cpiFrequency || staff?.cpi?.frequency) || 1,

    otherOpexPercent: toPercent(proposal.otherOpexPercent, 10),
  };

  // Step 4: Rent Model Parameters (conditional based on rent model)
  const rentModel = proposal.rentModel.toUpperCase();

  if (rentModel === "FIXED" || rentModel === "FIXED_ESCALATION") {
    formData.baseRent = toNumber(rentParams?.baseRent) || 10000000;
    formData.rentGrowthRate = toPercent(rentParams?.growthRate, 3);
    formData.rentFrequency = toNumber(rentParams?.frequency) || 1;
  }
  else if (rentModel === "REVSHARE" || rentModel === "REVENUE_SHARE") {
    formData.revenueSharePercent = toPercent(rentParams?.revenueSharePercent, 15);
  }
  else if (rentModel === "PARTNER" || rentModel === "PARTNER_INVESTMENT") {
    // Handle legacy field names (partnerLandSize) vs new names (landSize)
    formData.partnerLandSize = getNumericValue(
      rentParams,
      "landSize",
      "partnerLandSize",
      10000
    );
    formData.partnerLandPricePerSqm = getNumericValue(
      rentParams,
      "landPricePerSqm",
      "partnerLandPricePerSqm",
      5000
    );
    formData.partnerBuaSize = getNumericValue(
      rentParams,
      "buaSize",
      "partnerBuaSize",
      20000
    );
    formData.partnerConstructionCostPerSqm = getNumericValue(
      rentParams,
      "constructionCostPerSqm",
      "partnerConstructionCostPerSqm",
      2500
    );

    // Yield/growth rates might be stored as decimals (0.09) or percentages (9)
    const yieldRateRaw = getNumericValue(
      rentParams,
      "yieldRate",
      "partnerYieldRate",
      0.09
    );
    formData.partnerYieldRate = yieldRateRaw > 1 ? yieldRateRaw : yieldRateRaw * 100;

    const growthRateRaw = getNumericValue(
      rentParams,
      "growthRate",
      "partnerGrowthRate",
      0.02
    );
    formData.partnerGrowthRate = growthRateRaw > 1 ? growthRateRaw : growthRateRaw * 100;

    formData.partnerFrequency = getNumericValue(
      rentParams,
      "partnerFrequency",
      "frequency",
      1
    );
  }

  return formData;
}

/**
 * Normalize rent model from DB format to form format
 *
 * Database uses: "FIXED", "REVSHARE", "PARTNER", "FIXED_ESCALATION", "REVENUE_SHARE", "PARTNER_INVESTMENT"
 * Form expects: "Fixed", "RevShare", "Partner", or ""
 */
function normalizeRentModelForForm(dbRentModel: string): "Fixed" | "RevShare" | "Partner" | "" {
  const normalized = dbRentModel.toUpperCase();

  if (normalized === "FIXED" || normalized === "FIXED_ESCALATION") {
    return "Fixed";
  }
  if (normalized === "REVSHARE" || normalized === "REVENUE_SHARE") {
    return "RevShare";
  }
  if (normalized === "PARTNER" || normalized === "PARTNER_INVESTMENT") {
    return "Partner";
  }

  return "";
}

/**
 * Convert value to number safely
 */
function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (typeof value === "object" && value && "toString" in value) {
    const parsed = Number((value as { toString: () => string }).toString());
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

/**
 * Convert decimal to percentage (0.03 → 3)
 * If value is already > 1, assume it's already a percentage
 *
 * @param value - The decimal or percentage value
 * @param fallback - Default percentage to use if value is missing
 */
function toPercent(value: unknown, fallback: number): number {
  const num = toNumber(value);
  if (num === 0) return fallback;

  // If value > 1, assume it's already a percentage (e.g., 3 for 3%)
  // If value <= 1, it's a decimal that needs conversion (e.g., 0.03 → 3)
  return num > 1 ? num : num * 100;
}

/**
 * Get numeric value from object, trying new field first, then legacy field
 *
 * @param obj - Object containing the fields
 * @param newField - Preferred field name
 * @param legacyField - Legacy/alternative field name
 * @param fallback - Default value if both are missing
 */
function getNumericValue(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  obj: any,
  newField: string,
  legacyField: string,
  fallback: number
): number {
  const newVal = toNumber(obj?.[newField]);
  const legacyVal = toNumber(obj?.[legacyField]);

  // Prefer legacy field if new field is 0 but legacy has a value
  if (newVal === 0 && legacyVal !== 0) return legacyVal;
  if (newVal !== 0) return newVal;

  return fallback;
}
