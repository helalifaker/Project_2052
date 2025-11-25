export interface ProposalFormData {
  // Step 1: Basics
  developerName: string;
  rentModel: "Fixed" | "RevShare" | "Partner" | "";

  // Step 2: Transition
  transition2025Students: number;
  transition2025AvgTuition: number;
  transition2026Students: number;
  transition2026AvgTuition: number;
  transition2027Students: number;
  transition2027AvgTuition: number;
  transitionRentGrowthPercent?: number;

  // Step 3: Enrollment
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

  // Step 4: Curriculum
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

  // Step 5: Rent Model Parameters
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

  // Step 6: Operating Costs
  studentsPerTeacher?: number;
  studentsPerNonTeacher?: number;
  avgTeacherSalary?: number;
  avgAdminSalary?: number;
  cpiRate?: number;
  cpiFrequency?: number;
  otherOpexPercent: number;
}
