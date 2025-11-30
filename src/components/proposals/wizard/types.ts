export interface ProposalFormData {
  // Step 1: Basics
  developerName: string;
  contractPeriodYears: 25 | 30;
  rentModel: "Fixed" | "RevShare" | "Partner" | "";

  // Step 2: Enrollment (previously Step 3)
  frenchCapacity: number;
  ibCapacity: number;
  rampUpFRYear1Percentage: number;
  rampUpFRYear2Percentage: number;
  rampUpFRYear3Percentage: number;
  rampUpFRYear4Percentage: number;
  rampUpFRYear5Percentage: number;
  rampUpIBYear1Percentage: number;
  rampUpIBYear2Percentage: number;
  rampUpIBYear3Percentage: number;
  rampUpIBYear4Percentage: number;
  rampUpIBYear5Percentage: number;

  // Step 3: Curriculum (previously Step 4)
  frenchProgramEnabled: boolean;
  frenchProgramPercentage: number;
  ibProgramEnabled: boolean;
  ibProgramPercentage: number;
  frenchBaseTuition2028: number;
  ibBaseTuition2028: number;
  ibStartYear?: number;
  frenchTuitionGrowthRate?: number;
  frenchTuitionGrowthFrequency?: number;
  ibTuitionGrowthRate?: number;
  ibTuitionGrowthFrequency?: number;

  // Step 4: Rent Model Parameters (previously Step 5)
  baseRent?: number;
  rentGrowthRate?: number;
  rentFrequency?: number;
  revenueSharePercent?: number;
  partnerLandSize?: number;
  partnerLandPricePerSqm?: number;
  partnerBuaSize?: number;
  partnerConstructionCostPerSqm?: number;
  partnerYieldRate?: number;
  partnerGrowthRate?: number;
  partnerFrequency?: number;

  // Step 5: Operating Costs (previously Step 6)
  studentsPerTeacher?: number;
  studentsPerNonTeacher?: number;
  avgTeacherSalary?: number;
  avgAdminSalary?: number;
  cpiRate?: number;
  cpiFrequency?: number;
  otherOpexPercent: number;
}
