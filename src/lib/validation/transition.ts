import { z } from "zod";

export const TransitionConfigSchema = z.object({
  id: z.string().uuid(),
  year2025Students: z.number().int().nonnegative(),
  year2025AvgTuition: z.number().nonnegative(),
  year2026Students: z.number().int().nonnegative(),
  year2026AvgTuition: z.number().nonnegative(),
  year2027Students: z.number().int().nonnegative(),
  year2027AvgTuition: z.number().nonnegative(),
  rentGrowthPercent: z.number().nonnegative(),
  updatedBy: z.string().uuid().optional().nullable(),
});

export const TransitionConfigCreateSchema = TransitionConfigSchema.omit({
  id: true,
}).partial({
  updatedBy: true,
});

export const TransitionConfigUpsertSchema = TransitionConfigCreateSchema.extend(
  {
    id: z.string().uuid().optional(),
  },
);
