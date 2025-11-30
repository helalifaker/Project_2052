import { z } from "zod";

export const RentModelSchema = z.enum(["FIXED", "REVSHARE", "PARTNER"]);

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
    rentParams: z
      .union([
        FixedRentParamsSchema.extend({ model: z.literal("FIXED") }),
        RevenueShareParamsSchema.extend({ model: z.literal("REVSHARE") }),
        PartnerParamsSchema.extend({ model: z.literal("PARTNER") }),
      ])
      .or(z.record(z.string(), z.unknown())), // Fallback for JSON storage flexibility
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
 * Schema for updating an existing LeaseProposal (PATCH)
 * All fields are optional since it's a partial update
 */
export const UpdateProposalSchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    rentModel: RentModelSchema.optional(),
    developer: z.string().max(255).nullable().optional(),
    property: z.string().max(255).nullable().optional(),
    enrollment: z
      .object({
        capacity: z.number().int().positive(),
        rampUp: z.array(z.number().min(0).max(200)).length(5),
      })
      .optional(),
    curriculum: z
      .object({
        fr: z.object({
          baseTuition2028: z.number().positive(),
          growthRate: z.number().min(0).max(0.3),
          frequency: z.number().int().min(1).max(5),
        }),
        ib: IBCurriculumSchema,
      })
      .optional(),
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
      .passthrough()
      .optional(),
    rentParams: z
      .union([
        FixedRentParamsSchema.extend({ model: z.literal("FIXED") }),
        RevenueShareParamsSchema.extend({ model: z.literal("REVSHARE") }),
        PartnerParamsSchema.extend({ model: z.literal("PARTNER") }),
      ])
      .or(z.record(z.string(), z.unknown()))
      .optional(),
    otherOpexPercent: z.number().min(0).max(1).optional(),
    financials: z.record(z.string(), z.unknown()).optional(),
    metrics: z.record(z.string(), z.unknown()).optional(),
    calculatedAt: z.string().datetime().nullable().optional(),
  })
  .refine(
    (data) => {
      // Validate rentParams matches rentModel if both are provided
      if (data.rentModel && data.rentParams) {
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
      }
      return true;
    },
    { message: "rentParams must match rentModel when both are provided" },
  )
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
