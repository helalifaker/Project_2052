import { z } from "zod";

/**
 * Negotiation Status enum for Zod validation
 */
export const NegotiationStatusSchema = z.enum([
  "ACTIVE",
  "ACCEPTED",
  "REJECTED",
  "CLOSED",
]);

/**
 * Proposal Purpose enum for Zod validation
 */
export const ProposalPurposeSchema = z.enum([
  "NEGOTIATION",
  "STRESS_TEST",
  "SIMULATION",
]);

/**
 * Proposal Origin enum for Zod validation
 */
export const ProposalOriginSchema = z.enum(["OUR_OFFER", "THEIR_COUNTER"]);

/**
 * Proposal Status enum for Zod validation
 */
export const ProposalStatusSchema = z.enum([
  "DRAFT",
  "READY_TO_SUBMIT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "COUNTER_RECEIVED",
  "EVALUATING_COUNTER",
  "ACCEPTED",
  "REJECTED",
  "NEGOTIATION_CLOSED",
]);

/**
 * Schema for creating a new Negotiation
 */
export const CreateNegotiationSchema = z.object({
  developer: z
    .string()
    .min(1, "Developer name is required")
    .max(255, "Developer name too long"),
  property: z
    .string()
    .min(1, "Property name is required")
    .max(255, "Property name too long"),
  notes: z.string().max(2000, "Notes too long").optional(),
});

export type CreateNegotiation = z.infer<typeof CreateNegotiationSchema>;

/**
 * Schema for updating an existing Negotiation
 */
export const UpdateNegotiationSchema = z
  .object({
    status: NegotiationStatusSchema.optional(),
    notes: z.string().max(2000).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type UpdateNegotiation = z.infer<typeof UpdateNegotiationSchema>;

/**
 * Schema for linking an existing proposal to a negotiation
 */
export const LinkProposalSchema = z.object({
  proposalId: z.string().uuid("Invalid proposal ID"),
  offerNumber: z.number().int().positive().optional(),
  origin: ProposalOriginSchema.optional(),
});

export type LinkProposal = z.infer<typeof LinkProposalSchema>;

/**
 * Schema for creating a counter-offer (duplicate + link)
 */
export const CreateCounterOfferSchema = z.object({
  sourceProposalId: z.string().uuid("Invalid source proposal ID"),
  origin: ProposalOriginSchema,
  name: z.string().min(1).max(255).optional(),
});

export type CreateCounterOffer = z.infer<typeof CreateCounterOfferSchema>;

/**
 * Schema for reordering offers within a negotiation
 */
export const ReorderOffersSchema = z.object({
  offers: z
    .array(
      z.object({
        proposalId: z.string().uuid("Invalid proposal ID"),
        offerNumber: z.number().int().positive(),
      }),
    )
    .min(1, "At least one offer must be provided"),
});

export type ReorderOffers = z.infer<typeof ReorderOffersSchema>;

/**
 * Negotiation with proposals for API responses
 */
export const NegotiationWithProposalsSchema = z.object({
  id: z.string().uuid(),
  developer: z.string(),
  property: z.string(),
  status: NegotiationStatusSchema,
  notes: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string(),
  proposals: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      offerNumber: z.number().int().positive().nullable(),
      origin: ProposalOriginSchema,
      status: ProposalStatusSchema,
      rentModel: z.string(),
      metrics: z.record(z.string(), z.unknown()).nullable(),
      createdAt: z.string().datetime(),
      updatedAt: z.string().datetime(),
    }),
  ),
});

export type NegotiationWithProposals = z.infer<
  typeof NegotiationWithProposalsSchema
>;
