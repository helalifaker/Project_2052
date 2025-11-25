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
    transition: z.object({
      year2025: z
        .object({
          students: z.number().int().positive().optional(),
          avgTuition: z.number().positive().optional(),
          rentGrowth: z.number().min(0).max(1).optional(),
        })
        .passthrough(), // Allow additional fields
      year2026: z
        .object({
          students: z.number().int().positive().optional(),
          avgTuition: z.number().positive().optional(),
          rentGrowth: z.number().min(0).max(1).optional(),
        })
        .passthrough(),
      year2027: z
        .object({
          students: z.number().int().positive().optional(),
          avgTuition: z.number().positive().optional(),
          rentGrowth: z.number().min(0).max(1).optional(),
        })
        .passthrough(),
    }),
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
    otherOpex: z.number().min(0).max(1), // % of revenue as decimal
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
