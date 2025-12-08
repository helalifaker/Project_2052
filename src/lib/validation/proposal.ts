import { z } from "zod";
import {
  ProposalStatusSchema,
  ProposalOriginSchema,
  ProposalPurposeSchema,
} from "./negotiation";

export const RentModelSchema = z.enum(["FIXED", "REVSHARE", "PARTNER"]);

// Re-export for convenience
export { ProposalStatusSchema, ProposalOriginSchema, ProposalPurposeSchema };

export const FixedRentParamsSchema = z.object({
  baseRent2028: z.number().positive(),
  growthRate: z.number().min(0).max(0.2), // 0-20%
  frequency: z.number().int().min(1).max(5), // 1-5 years
});

export const RevenueShareParamsSchema = z.object({
  revenueSharePercent: z.number().min(0).max(1), // 0-100% as decimal
});

export const PartnerParamsSchema = z.object({
  landSize: z.number().positive(), // m²
  landPricePerSqm: z.number().positive(),
  buaSize: z.number().positive(), // m²
  constructionCostPerSqm: z.number().positive(),
  yieldRate: z.number().min(0).max(0.3), // 0-30%
  growthRate: z.number().min(0).max(0.2),
  frequency: z.number().int().min(1).max(5),
});

export const IBCurriculumSchema = z
  .object({
    enabled: z.boolean(),
    baseTuition2028: z.number().positive().optional(),
    growthRate: z.number().min(0).max(0.3).optional(),
    frequency: z.number().int().min(1).max(5).optional(),
  })
  .refine(
    (data) => {
      if (data.enabled) {
        return data.baseTuition2028 && data.growthRate && data.frequency;
      }
      return true;
    },
    { message: "IB params required when enabled" },
  );

export type RentModel = z.infer<typeof RentModelSchema>;
export type FixedRentParams = z.infer<typeof FixedRentParamsSchema>;
export type RevenueShareParams = z.infer<typeof RevenueShareParamsSchema>;
export type PartnerParams = z.infer<typeof PartnerParamsSchema>;
export type IBCurriculum = z.infer<typeof IBCurriculumSchema>;

/**
 * Schema for creating a new LeaseProposal
 * Validates all required fields including JSON structures
 */
export const CreateProposalSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    rentModel: RentModelSchema,
    contractPeriodYears: z.union([z.literal(25), z.literal(30)]).default(30), // Dynamic period: 25 or 30 years
    enrollment: z.object({
      capacity: z.number().int().positive(),
      rampUp: z.array(z.number().min(0).max(200)).length(5), // 5 years of ramp-up percentages
    }),
    curriculum: z.object({
      fr: z.object({
        baseTuition2028: z.number().positive(),
        growthRate: z.number().min(0).max(0.3),
        frequency: z.number().int().min(1).max(5),
      }),
      ib: IBCurriculumSchema,
    }),
    staff: z
      .object({
        teacherRatio: z.number().positive().optional(),
        nonTeacherRatio: z.number().positive().optional(),
        salaries: z
          .object({
            teacherSalary2028: z.number().positive().optional(),
            nonTeacherSalary2028: z.number().positive().optional(),
          })
          .optional(),
        cpi: z
          .object({
            rate: z.number().min(0).max(1).optional(),
            frequency: z.number().int().min(1).max(5).optional(),
          })
          .optional(),
      })
      .passthrough(),
    // SECURITY: Strict rent params validation - no arbitrary JSON fallback
    // Each rent model has specific required fields that must be validated
    rentParams: z.union([
      FixedRentParamsSchema.extend({ model: z.literal("FIXED") }),
      RevenueShareParamsSchema.extend({ model: z.literal("REVSHARE") }),
      PartnerParamsSchema.extend({ model: z.literal("PARTNER") }),
    ]),
    otherOpexPercent: z.number().min(0).max(1), // % of revenue as decimal (e.g., 0.31 = 31%)
    financials: z.record(z.string(), z.unknown()).optional(),
    metrics: z.record(z.string(), z.unknown()).optional(),
    calculatedAt: z.string().datetime().nullable().optional(),
  })
  .refine(
    (data) => {
      // Validate rentParams matches rentModel
      const rentParams = data.rentParams as Record<string, unknown>;
      if (data.rentModel === "FIXED") {
        return "baseRent2028" in rentParams;
      }
      if (data.rentModel === "REVSHARE") {
        return "revenueSharePercent" in rentParams;
      }
      if (data.rentModel === "PARTNER") {
        return "landSize" in rentParams && "buaSize" in rentParams;
      }
      return true;
    },
    { message: "rentParams must match rentModel" },
  );

export type CreateProposal = z.infer<typeof CreateProposalSchema>;

/**
 * Flexible enrollment schema for updates
 * Accepts both wizard format (capacity, rampUp) and dynamic setup format (steadyStateStudents, rampPlanPercentages)
 */
const FlexibleEnrollmentSchema = z
  .object({
    // Wizard format
    capacity: z.number().int().positive().optional(),
    rampUp: z.array(z.number().min(0).max(200)).optional(),
    // Dynamic setup format
    rampUpEnabled: z.boolean().optional(),
    rampUpStartYear: z.number().int().optional(),
    rampUpEndYear: z.number().int().optional(),
    steadyStateStudents: z.number().int().positive().optional(),
    rampUpTargetStudents: z.number().int().positive().optional(),
    rampPlanPercentages: z.array(z.number().min(0).max(1)).optional(),
    gradeDistribution: z.array(z.number()).optional(),
  })
  .passthrough();

/**
 * Flexible curriculum schema for updates
 * Accepts both wizard format (fr, ib) and dynamic setup format (frenchProgramEnabled, etc.)
 */
const FlexibleCurriculumSchema = z
  .object({
    // Wizard format
    fr: z
      .object({
        baseTuition2028: z.number().positive().optional(),
        growthRate: z.number().min(0).max(0.3).optional(),
        frequency: z.number().int().min(1).max(5).optional(),
      })
      .passthrough()
      .optional(),
    ib: IBCurriculumSchema.optional(),
    // Dynamic setup format
    frenchProgramEnabled: z.boolean().optional(),
    frenchProgramPercentage: z.number().min(0).max(1).optional(),
    frenchBaseTuition2028: z.number().positive().optional(),
    frenchTuitionGrowthRate: z.number().min(0).max(0.3).optional(),
    frenchTuitionGrowthFrequency: z.number().int().min(1).max(5).optional(),
    ibProgramEnabled: z.boolean().optional(),
    ibProgramPercentage: z.number().min(0).max(1).optional(),
    ibBaseTuition2028: z.number().positive().optional(),
    ibStartYear: z.number().int().optional(),
    ibTuitionGrowthRate: z.number().min(0).max(0.3).optional(),
    ibTuitionGrowthFrequency: z.number().int().min(1).max(5).optional(),
    // Engine format
    nationalCurriculumFee: z.number().positive().optional(),
    nationalTuitionGrowthRate: z.number().min(0).max(0.3).optional(),
    nationalTuitionGrowthFrequency: z.number().int().min(1).max(5).optional(),
    ibCurriculumFee: z.number().positive().optional(),
    ibStudentPercentage: z.number().min(0).max(1).optional(),
  })
  .passthrough();

/**
 * Flexible staff schema for updates
 * Accepts both wizard format (teacherRatio, salaries) and dynamic setup format (studentsPerTeacher, avgTeacherSalary)
 */
const FlexibleStaffSchema = z
  .object({
    // Wizard format
    teacherRatio: z.number().positive().optional(),
    nonTeacherRatio: z.number().positive().optional(),
    salaries: z
      .object({
        teacherSalary2028: z.number().positive().optional(),
        nonTeacherSalary2028: z.number().positive().optional(),
      })
      .optional(),
    cpi: z
      .object({
        rate: z.number().min(0).max(1).optional(),
        frequency: z.number().int().min(1).max(5).optional(),
      })
      .optional(),
    // Dynamic setup format
    studentsPerTeacher: z.number().positive().optional(),
    studentsPerNonTeacher: z.number().positive().optional(),
    avgTeacherSalary: z.number().positive().optional(),
    avgAdminSalary: z.number().positive().optional(),
    cpiRate: z.number().min(0).max(1).optional(),
    cpiFrequency: z.number().int().min(1).max(5).optional(),
  })
  .passthrough();

/**
 * Flexible rent params schema for updates
 * Accepts multiple naming conventions used across the app
 */
const FlexibleRentParamsSchema = z
  .object({
    // Fixed rent model fields (multiple naming conventions)
    baseRent: z.number().positive().optional(),
    baseRent2028: z.number().positive().optional(),
    rentGrowthRate: z.number().min(0).max(0.3).optional(),
    growthRate: z.number().min(0).max(0.3).optional(),
    rentFrequency: z.number().int().min(1).max(5).optional(),
    frequency: z.number().int().min(1).max(5).optional(),

    // Revenue share model fields
    revenueSharePercent: z.number().min(0).max(1).optional(),

    // Partner investment model fields (multiple naming conventions)
    partnerLandSize: z.number().positive().optional(),
    landSize: z.number().positive().optional(),
    partnerLandPricePerSqm: z.number().positive().optional(),
    landPricePerSqm: z.number().positive().optional(),
    partnerBuaSize: z.number().positive().optional(),
    buaSize: z.number().positive().optional(),
    partnerConstructionCostPerSqm: z.number().positive().optional(),
    constructionCostPerSqm: z.number().positive().optional(),
    partnerYieldRate: z.number().min(0).max(0.3).optional(),
    yieldRate: z.number().min(0).max(0.3).optional(),
    partnerGrowthRate: z.number().min(0).max(0.3).optional(),
    partnerFrequency: z.number().int().min(1).max(5).optional(),

    // Model identifier (optional, can be derived from proposal.rentModel)
    model: z.enum(["FIXED", "REVSHARE", "PARTNER"]).optional(),
  })
  .passthrough();

/**
 * Schema for updating an existing LeaseProposal (PATCH)
 * All fields are optional since it's a partial update
 * Uses flexible schemas to accept data from different parts of the app (wizard, dynamic setup tab, engine)
 */
export const UpdateProposalSchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    rentModel: RentModelSchema.optional(),
    developer: z.string().max(255).nullable().optional(),
    property: z.string().max(255).nullable().optional(),

    // Negotiation context fields (v2.2)
    status: ProposalStatusSchema.optional(),
    origin: ProposalOriginSchema.optional(),
    purpose: ProposalPurposeSchema.optional(),
    negotiationId: z.string().uuid().nullable().optional(),
    offerNumber: z.number().int().positive().nullable().optional(),
    version: z.string().max(50).nullable().optional(),
    negotiationNotes: z.string().max(5000).nullable().optional(),
    boardComments: z.string().max(5000).nullable().optional(),
    submittedDate: z.string().datetime().nullable().optional(),
    responseReceivedDate: z.string().datetime().nullable().optional(),

    // Flexible JSON schemas to accept data from different app components
    enrollment: FlexibleEnrollmentSchema.optional(),
    curriculum: FlexibleCurriculumSchema.optional(),
    staff: FlexibleStaffSchema.optional(),
    rentParams: FlexibleRentParamsSchema.optional(),

    otherOpexPercent: z.number().min(0).max(1).optional(),
    financials: z.record(z.string(), z.unknown()).optional(),
    metrics: z.record(z.string(), z.unknown()).optional(),
    calculatedAt: z.string().datetime().nullable().optional(),
  })
  .refine(
    (data) => {
      // At least one field must be provided for update
      return Object.keys(data).length > 0;
    },
    { message: "At least one field must be provided for update" },
  );

export type UpdateProposal = z.infer<typeof UpdateProposalSchema>;

/**
 * Schema for duplicating a proposal with optional overrides
 */
export const DuplicateProposalSchema = z
  .object({
    name: z.string().min(1).max(255).optional(), // Optional custom name (otherwise appends "(Copy)")
  })
  .optional();

export type DuplicateProposalInput = z.infer<typeof DuplicateProposalSchema>;

/**
 * Schema for recalculation request (currently accepts no parameters, but allows for future extensibility)
 */
export const RecalculateProposalSchema = z
  .object({
    force: z.boolean().optional(), // Future: Force recalculation even if already calculated
    skipCache: z.boolean().optional(), // Future: Skip cache lookup
  })
  .optional();

export type RecalculateProposalInput = z.infer<
  typeof RecalculateProposalSchema
>;
