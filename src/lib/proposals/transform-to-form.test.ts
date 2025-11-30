import { describe, it, expect } from "vitest";
import { proposalToFormData, type ProposalRecord } from "./transform-to-form";

describe("proposalToFormData", () => {
  describe("Fixed Rent Model", () => {
    it("should correctly transform fixed rent model proposal", () => {
      const proposal: ProposalRecord = {
        id: "test-fixed-id",
        name: "Test Fixed Proposal",
        rentModel: "FIXED",
        contractPeriodYears: 30,
        enrollment: {
          capacity: 1000,
          rampUp: [0.2, 0.4, 0.6, 0.8, 1.0],
        },
        curriculum: {
          fr: {
            enabled: true,
            baseTuition2028: 30000,
            growthRate: 0.03,
            frequency: 1,
          },
          ib: {
            enabled: false,
          },
        },
        staff: {
          cpi: { rate: 0.03, frequency: 1 },
          studentsPerTeacher: 14,
          studentsPerNonTeacher: 50,
          avgTeacherSalary: 60000,
          avgAdminSalary: 50000,
        },
        rentParams: {
          baseRent: 10000000,
          growthRate: 0.03,
          frequency: 1,
        },
        otherOpexPercent: 0.1,
      };

      const result = proposalToFormData(proposal);

      // Step 1: Basics
      expect(result.developerName).toBe("");
      expect(result.contractPeriodYears).toBe(30);
      expect(result.rentModel).toBe("Fixed");

      // Step 2: Enrollment
      expect(result.frenchCapacity).toBe(1000);
      expect(result.ibCapacity).toBe(0);
      expect(result.rampUpFRYear1Percentage).toBe(20); // 0.2 * 100
      expect(result.rampUpFRYear2Percentage).toBe(40);
      expect(result.rampUpFRYear3Percentage).toBe(60);
      expect(result.rampUpFRYear4Percentage).toBe(80);
      expect(result.rampUpFRYear5Percentage).toBe(100);

      // Step 3: Curriculum
      expect(result.frenchProgramEnabled).toBe(true);
      expect(result.ibProgramEnabled).toBe(false);
      expect(result.frenchBaseTuition2028).toBe(30000);
      expect(result.frenchTuitionGrowthRate).toBe(3); // 0.03 * 100
      expect(result.frenchTuitionGrowthFrequency).toBe(1);

      // Step 4: Rent Model
      expect(result.baseRent).toBe(10000000);
      expect(result.rentGrowthRate).toBe(3); // 0.03 * 100
      expect(result.rentFrequency).toBe(1);

      // Step 5: Operating Costs
      expect(result.studentsPerTeacher).toBe(14);
      expect(result.studentsPerNonTeacher).toBe(50);
      expect(result.avgTeacherSalary).toBe(60000);
      expect(result.avgAdminSalary).toBe(50000);
      expect(result.cpiRate).toBe(3); // 0.03 * 100
      expect(result.cpiFrequency).toBe(1);
      expect(result.otherOpexPercent).toBe(10); // 0.1 * 100
    });

    it("should handle FIXED_ESCALATION variant", () => {
      const proposal: ProposalRecord = {
        id: "test-id",
        name: "Test",
        rentModel: "FIXED_ESCALATION",
        contractPeriodYears: 25,
        enrollment: { capacity: 1000, rampUp: [0.2, 0.4, 0.6, 0.8, 1.0] },
        curriculum: { fr: { enabled: true, baseTuition2028: 30000 } },
        staff: { cpi: { rate: 0.03 } },
        rentParams: { baseRent: 12000000, growthRate: 0.04, frequency: 2 },
        otherOpexPercent: 0.15,
      };

      const result = proposalToFormData(proposal);

      expect(result.rentModel).toBe("Fixed");
      expect(result.contractPeriodYears).toBe(25);
      expect(result.baseRent).toBe(12000000);
      expect(result.rentGrowthRate).toBe(4); // 0.04 * 100
      expect(result.rentFrequency).toBe(2);
    });
  });

  describe("RevShare Rent Model", () => {
    it("should correctly transform revenue share model proposal", () => {
      const proposal: ProposalRecord = {
        id: "test-revshare-id",
        name: "Test RevShare Proposal",
        rentModel: "REVSHARE",
        contractPeriodYears: 30,
        enrollment: {
          capacity: 1200,
          rampUp: [0.25, 0.5, 0.75, 0.9, 1.0],
        },
        curriculum: {
          fr: {
            enabled: true,
            baseTuition2028: 35000,
            growthRate: 0.04,
            frequency: 1,
          },
          ib: { enabled: false },
        },
        staff: {
          cpi: { rate: 0.035, frequency: 1 },
          studentsPerTeacher: 15,
          studentsPerNonTeacher: 55,
          avgTeacherSalary: 65000,
          avgAdminSalary: 55000,
        },
        rentParams: {
          revenueSharePercent: 0.15,
        },
        otherOpexPercent: 0.12,
      };

      const result = proposalToFormData(proposal);

      expect(result.rentModel).toBe("RevShare");
      expect(result.revenueSharePercent).toBe(15); // 0.15 * 100
      expect(result.frenchCapacity).toBe(1200);
      expect(result.rampUpFRYear1Percentage).toBe(25); // 0.25 * 100
      expect(result.frenchTuitionGrowthRate).toBe(4); // 0.04 * 100
      expect(result.cpiRate).toBeCloseTo(3.5); // 0.035 * 100 (floating point)
    });

    it("should handle REVENUE_SHARE variant", () => {
      const proposal: ProposalRecord = {
        id: "test-id",
        name: "Test",
        rentModel: "REVENUE_SHARE",
        contractPeriodYears: 30,
        enrollment: { capacity: 1000, rampUp: [0.2, 0.4, 0.6, 0.8, 1.0] },
        curriculum: { fr: { enabled: true, baseTuition2028: 30000 } },
        staff: { cpi: { rate: 0.03 } },
        rentParams: { revenueSharePercent: 0.18 },
        otherOpexPercent: 0.1,
      };

      const result = proposalToFormData(proposal);

      expect(result.rentModel).toBe("RevShare");
      expect(result.revenueSharePercent).toBe(18); // 0.18 * 100
    });
  });

  describe("Partner Investment Model", () => {
    it("should correctly transform partner investment model proposal", () => {
      const proposal: ProposalRecord = {
        id: "test-partner-id",
        name: "Test Partner Proposal",
        rentModel: "PARTNER",
        contractPeriodYears: 30,
        enrollment: {
          capacity: 1500,
          rampUp: [0.15, 0.35, 0.55, 0.75, 1.0],
        },
        curriculum: {
          fr: {
            enabled: true,
            baseTuition2028: 32000,
            growthRate: 0.035,
            frequency: 1,
          },
          ib: { enabled: false },
        },
        staff: {
          cpi: { rate: 0.03, frequency: 1 },
          studentsPerTeacher: 14,
          studentsPerNonTeacher: 50,
          avgTeacherSalary: 60000,
          avgAdminSalary: 50000,
        },
        rentParams: {
          landSize: 12000,
          landPricePerSqm: 6000,
          buaSize: 25000,
          constructionCostPerSqm: 3000,
          yieldRate: 0.09,
          growthRate: 0.02,
          frequency: 1,
        },
        otherOpexPercent: 0.11,
      };

      const result = proposalToFormData(proposal);

      expect(result.rentModel).toBe("Partner");
      expect(result.partnerLandSize).toBe(12000);
      expect(result.partnerLandPricePerSqm).toBe(6000);
      expect(result.partnerBuaSize).toBe(25000);
      expect(result.partnerConstructionCostPerSqm).toBe(3000);
      expect(result.partnerYieldRate).toBe(9); // 0.09 * 100
      expect(result.partnerGrowthRate).toBe(2); // 0.02 * 100
      expect(result.partnerFrequency).toBe(1);
    });

    it("should handle legacy partner field names", () => {
      const proposal: ProposalRecord = {
        id: "test-legacy-id",
        name: "Test Legacy Partner",
        rentModel: "PARTNER_INVESTMENT",
        contractPeriodYears: 30,
        enrollment: { capacity: 1000, rampUp: [0.2, 0.4, 0.6, 0.8, 1.0] },
        curriculum: { fr: { enabled: true, baseTuition2028: 30000 } },
        staff: { cpi: { rate: 0.03 } },
        rentParams: {
          partnerLandSize: 10000,
          partnerLandPricePerSqm: 5000,
          partnerBuaSize: 20000,
          partnerConstructionCostPerSqm: 2500,
          partnerYieldRate: 8, // Old format: stored as whole number percentage
          partnerGrowthRate: 2, // Old format: stored as whole number percentage
          partnerFrequency: 1,
        },
        otherOpexPercent: 0.1,
      };

      const result = proposalToFormData(proposal);

      expect(result.rentModel).toBe("Partner");
      expect(result.partnerLandSize).toBe(10000);
      expect(result.partnerLandPricePerSqm).toBe(5000);
      expect(result.partnerBuaSize).toBe(20000);
      expect(result.partnerConstructionCostPerSqm).toBe(2500);
      // Legacy values > 1 are already percentages, don't multiply
      expect(result.partnerYieldRate).toBe(8);
      expect(result.partnerGrowthRate).toBe(2);
      expect(result.partnerFrequency).toBe(1);
    });

    it("should prefer new field names over legacy when both exist", () => {
      const proposal: ProposalRecord = {
        id: "test-mixed-id",
        name: "Test Mixed Fields",
        rentModel: "PARTNER",
        contractPeriodYears: 30,
        enrollment: { capacity: 1000, rampUp: [0.2, 0.4, 0.6, 0.8, 1.0] },
        curriculum: { fr: { enabled: true, baseTuition2028: 30000 } },
        staff: { cpi: { rate: 0.03 } },
        rentParams: {
          landSize: 15000, // New field (should win)
          partnerLandSize: 10000, // Legacy field
          landPricePerSqm: 7000, // New field (should win)
          partnerLandPricePerSqm: 5000, // Legacy field
          yieldRate: 0.10, // New field as decimal (should win, convert to %)
          partnerYieldRate: 8, // Legacy field as percentage
        },
        otherOpexPercent: 0.1,
      };

      const result = proposalToFormData(proposal);

      expect(result.partnerLandSize).toBe(15000); // New field wins
      expect(result.partnerLandPricePerSqm).toBe(7000); // New field wins
      expect(result.partnerYieldRate).toBe(10); // 0.10 * 100
    });
  });

  describe("Edge Cases and Missing Data", () => {
    it("should handle missing enrollment data with defaults", () => {
      const proposal: ProposalRecord = {
        id: "test-id",
        name: "Test",
        rentModel: "FIXED",
        contractPeriodYears: 30,
        enrollment: {},
        curriculum: { fr: { enabled: true } },
        staff: {},
        rentParams: {},
        otherOpexPercent: 0,
      };

      const result = proposalToFormData(proposal);

      expect(result.frenchCapacity).toBe(1000); // Default
      expect(result.rampUpFRYear1Percentage).toBe(20); // Default
      expect(result.rampUpFRYear2Percentage).toBe(40); // Default
      expect(result.rampUpFRYear3Percentage).toBe(60); // Default
      expect(result.rampUpFRYear4Percentage).toBe(80); // Default
      expect(result.rampUpFRYear5Percentage).toBe(100); // Default
    });

    it("should handle missing curriculum data with defaults", () => {
      const proposal: ProposalRecord = {
        id: "test-id",
        name: "Test",
        rentModel: "FIXED",
        contractPeriodYears: 30,
        enrollment: { capacity: 1000, rampUp: [0.2, 0.4, 0.6, 0.8, 1.0] },
        curriculum: {},
        staff: { cpi: { rate: 0.03 } },
        rentParams: {},
        otherOpexPercent: 0.1,
      };

      const result = proposalToFormData(proposal);

      expect(result.frenchProgramEnabled).toBe(true); // Default (enabled !== false)
      expect(result.frenchBaseTuition2028).toBe(30000); // Default
      expect(result.frenchTuitionGrowthRate).toBe(3); // Default
      expect(result.frenchTuitionGrowthFrequency).toBe(1); // Default
      expect(result.ibProgramEnabled).toBe(false); // Default
      expect(result.ibStartYear).toBe(2028); // Default
    });

    it("should handle missing staff data with defaults", () => {
      const proposal: ProposalRecord = {
        id: "test-id",
        name: "Test",
        rentModel: "FIXED",
        contractPeriodYears: 30,
        enrollment: { capacity: 1000, rampUp: [0.2, 0.4, 0.6, 0.8, 1.0] },
        curriculum: { fr: { enabled: true, baseTuition2028: 30000 } },
        staff: {},
        rentParams: { baseRent: 10000000 },
        otherOpexPercent: 0.1,
      };

      const result = proposalToFormData(proposal);

      expect(result.studentsPerTeacher).toBe(14); // Default
      expect(result.studentsPerNonTeacher).toBe(50); // Default
      expect(result.avgTeacherSalary).toBe(60000); // Default
      expect(result.avgAdminSalary).toBe(50000); // Default
      expect(result.cpiRate).toBe(3); // Default
      expect(result.cpiFrequency).toBe(1); // Default
    });

    it("should handle missing rent params with defaults", () => {
      const proposal: ProposalRecord = {
        id: "test-id",
        name: "Test",
        rentModel: "FIXED",
        contractPeriodYears: 30,
        enrollment: { capacity: 1000, rampUp: [0.2, 0.4, 0.6, 0.8, 1.0] },
        curriculum: { fr: { enabled: true, baseTuition2028: 30000 } },
        staff: { cpi: { rate: 0.03 } },
        rentParams: {},
        otherOpexPercent: 0.1,
      };

      const result = proposalToFormData(proposal);

      expect(result.baseRent).toBe(10000000); // Default
      expect(result.rentGrowthRate).toBe(3); // Default
      expect(result.rentFrequency).toBe(1); // Default
    });

    it("should handle null/undefined values gracefully", () => {
      const proposal: ProposalRecord = {
        id: "test-id",
        name: "Test",
        rentModel: "FIXED",
        contractPeriodYears: 30,
        enrollment: null as any,
        curriculum: undefined as any,
        staff: null as any,
        rentParams: null as any,
        otherOpexPercent: null as any,
      };

      const result = proposalToFormData(proposal);

      // Should not throw, should use defaults
      expect(result.frenchCapacity).toBe(1000);
      expect(result.frenchBaseTuition2028).toBe(30000);
      expect(result.studentsPerTeacher).toBe(14);
      expect(result.baseRent).toBe(10000000);
      expect(result.otherOpexPercent).toBe(10);
    });

    it("should handle unknown rent model gracefully", () => {
      const proposal: ProposalRecord = {
        id: "test-id",
        name: "Test",
        rentModel: "UNKNOWN_MODEL",
        contractPeriodYears: 30,
        enrollment: { capacity: 1000, rampUp: [0.2, 0.4, 0.6, 0.8, 1.0] },
        curriculum: { fr: { enabled: true, baseTuition2028: 30000 } },
        staff: { cpi: { rate: 0.03 } },
        rentParams: {},
        otherOpexPercent: 0.1,
      };

      const result = proposalToFormData(proposal);

      expect(result.rentModel).toBe(""); // Empty string for unknown
    });
  });

  describe("Percentage Conversion", () => {
    it("should convert decimal percentages to whole numbers", () => {
      const proposal: ProposalRecord = {
        id: "test-id",
        name: "Test",
        rentModel: "FIXED",
        contractPeriodYears: 30,
        enrollment: { capacity: 1000, rampUp: [0.2, 0.4, 0.6, 0.8, 1.0] },
        curriculum: {
          fr: {
            enabled: true,
            baseTuition2028: 30000,
            growthRate: 0.05, // 5%
          },
        },
        staff: { cpi: { rate: 0.025 } }, // 2.5%
        rentParams: { growthRate: 0.035 }, // 3.5%
        otherOpexPercent: 0.125, // 12.5%
      };

      const result = proposalToFormData(proposal);

      expect(result.frenchTuitionGrowthRate).toBe(5);
      expect(result.cpiRate).toBe(2.5);
      expect(result.rentGrowthRate).toBeCloseTo(3.5); // Floating point
      expect(result.otherOpexPercent).toBe(12.5);
    });

    it("should not double-convert values already as percentages", () => {
      const proposal: ProposalRecord = {
        id: "test-id",
        name: "Test",
        rentModel: "PARTNER",
        contractPeriodYears: 30,
        enrollment: { capacity: 1000, rampUp: [0.2, 0.4, 0.6, 0.8, 1.0] },
        curriculum: { fr: { enabled: true, baseTuition2028: 30000 } },
        staff: { cpi: { rate: 0.03 } },
        rentParams: {
          partnerYieldRate: 9, // Already a percentage
          partnerGrowthRate: 3, // Already a percentage
        },
        otherOpexPercent: 0.1,
      };

      const result = proposalToFormData(proposal);

      // Values > 1 should be kept as-is (already percentages)
      expect(result.partnerYieldRate).toBe(9);
      expect(result.partnerGrowthRate).toBe(3);
    });
  });

  describe("Contract Period", () => {
    it("should preserve 25-year contract period", () => {
      const proposal: ProposalRecord = {
        id: "test-id",
        name: "Test 25-year",
        rentModel: "FIXED",
        contractPeriodYears: 25,
        enrollment: { capacity: 1000, rampUp: [0.2, 0.4, 0.6, 0.8, 1.0] },
        curriculum: { fr: { enabled: true, baseTuition2028: 30000 } },
        staff: { cpi: { rate: 0.03 } },
        rentParams: { baseRent: 10000000 },
        otherOpexPercent: 0.1,
      };

      const result = proposalToFormData(proposal);

      expect(result.contractPeriodYears).toBe(25);
    });

    it("should default to 30-year contract period if missing", () => {
      const proposal: ProposalRecord = {
        id: "test-id",
        name: "Test",
        rentModel: "FIXED",
        contractPeriodYears: 0,
        enrollment: { capacity: 1000, rampUp: [0.2, 0.4, 0.6, 0.8, 1.0] },
        curriculum: { fr: { enabled: true, baseTuition2028: 30000 } },
        staff: { cpi: { rate: 0.03 } },
        rentParams: { baseRent: 10000000 },
        otherOpexPercent: 0.1,
      };

      const result = proposalToFormData(proposal);

      expect(result.contractPeriodYears).toBe(30);
    });
  });
});
