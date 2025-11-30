import { z } from "zod";

/**
 * Validation schema for historical data items
 * Year must be 2023 or 2024 (historical period)
 */
export const HistoricalDataItemSchema = z.object({
  year: z.number().int().min(2023).max(2024),
  statementType: z.enum(["PL", "BS", "CF"]),
  lineItem: z.string().min(1),
  amount: z.number().nonnegative(), // Will be converted to Decimal in route
  confirmed: z.boolean().optional().default(false),
});

/**
 * Schema for array of historical data items (POST request body)
 */
export const HistoricalDataArraySchema = z.array(HistoricalDataItemSchema);

export type HistoricalDataItem = z.infer<typeof HistoricalDataItemSchema>;



