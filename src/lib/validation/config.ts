import { z } from "zod";

/**
 * Validation schema for SystemConfig updates
 * All rates are decimals (0-1 range for percentages)
 */
export const SystemConfigUpdateSchema = z
  .object({
    id: z.string().uuid(),
    zakatRate: z.number().min(0).max(1).optional(), // 0-100% as decimal (e.g., 0.025 = 2.5%)
    debtInterestRate: z.number().min(0).max(1).optional(), // 0-100% as decimal
    depositInterestRate: z.number().min(0).max(1).optional(), // 0-100% as decimal
    discountRate: z.number().min(0).max(1).optional(), // 0-100% as decimal (NPV discount rate)
    minCashBalance: z.number().positive().optional(), // Must be positive SAR amount
    confirmedAt: z.string().datetime().nullable().optional(),
    updatedBy: z.string().nullable().optional(),
  })
  .refine(
    (data) => {
      // At least one field must be provided for update
      return (
        data.zakatRate !== undefined ||
        data.debtInterestRate !== undefined ||
        data.depositInterestRate !== undefined ||
        data.discountRate !== undefined ||
        data.minCashBalance !== undefined ||
        data.confirmedAt !== undefined ||
        data.updatedBy !== undefined
      );
    },
    { message: "At least one field must be provided for update" },
  );

export type SystemConfigUpdate = z.infer<typeof SystemConfigUpdateSchema>;



