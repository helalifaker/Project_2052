import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateUserWithRole } from "@/middleware/auth";
import { Role, ProposalPurpose, ProposalStatus } from "@/lib/types/roles";
import { z } from "zod";

/**
 * Schema for creating a counter-offer
 */
const CreateCounterSchema = z.object({
  sourceProposalId: z.string().uuid("Invalid source proposal ID"),
  name: z.string().min(1).max(255).optional(),
  origin: z.enum(["OUR_OFFER", "THEIR_COUNTER"]),
});

/**
 * POST /api/negotiations/[id]/counter
 *
 * Create a counter-offer by duplicating a source proposal
 * and linking it to this negotiation with the next offer number
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await authenticateUserWithRole([Role.ADMIN, Role.PLANNER]);
  if (!authResult.success) return authResult.error;

  try {
    const { id } = await params;

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: "Invalid negotiation ID" },
        { status: 400 },
      );
    }

    const body = await request.json();

    // Validate request body
    const validationResult = CreateCounterSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const { sourceProposalId, name, origin } = validationResult.data;

    // ATOMICITY: Use transaction to prevent race conditions on offer number assignment
    // Without this, concurrent requests could get the same nextOfferNumber
    const counterOffer = await prisma.$transaction(async (tx) => {
      // Check negotiation exists
      const negotiation = await tx.negotiation.findUnique({
        where: { id },
      });

      if (!negotiation) {
        throw new Error("NEGOTIATION_NOT_FOUND");
      }

      // Check source proposal exists
      const sourceProposal = await tx.leaseProposal.findUnique({
        where: { id: sourceProposalId },
      });

      if (!sourceProposal) {
        throw new Error("SOURCE_PROPOSAL_NOT_FOUND");
      }

      // Get next offer number (atomic within transaction)
      const maxOffer = await tx.leaseProposal.findFirst({
        where: { negotiationId: id },
        orderBy: { offerNumber: "desc" },
        select: { offerNumber: true },
      });
      const nextOfferNumber = (maxOffer?.offerNumber ?? 0) + 1;

      // Generate name if not provided
      const counterName =
        name ||
        (origin === "OUR_OFFER"
          ? `Our Offer #${nextOfferNumber}`
          : `Their Counter #${nextOfferNumber}`);

      // Create the counter-offer by duplicating the source
      return tx.leaseProposal.create({
        data: {
          // Copy all essential data from source
          name: counterName,
          rentModel: sourceProposal.rentModel,
          createdBy: authResult.user.id,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          enrollment: sourceProposal.enrollment as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          curriculum: sourceProposal.curriculum as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          staff: sourceProposal.staff as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          rentParams: sourceProposal.rentParams as any,
          otherOpexPercent: sourceProposal.otherOpexPercent,
          contractPeriodYears: sourceProposal.contractPeriodYears,

          // Negotiation context
          negotiationId: id,
          purpose: ProposalPurpose.NEGOTIATION,
          offerNumber: nextOfferNumber,
          origin,
          status: ProposalStatus.DRAFT,
          parentProposalId: sourceProposalId,

          // Copy developer/property from negotiation for backward compatibility
          developer: negotiation.developer,
          property: negotiation.property,

          // These fields are NOT copied - they should be recalculated
          // financials: null,
          // metrics: null,
          // calculatedAt: null,
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    });

    return NextResponse.json(
      {
        id: counterOffer.id,
        name: counterOffer.name,
        offerNumber: counterOffer.offerNumber,
        origin: counterOffer.origin,
        status: counterOffer.status,
        sourceProposalId,
      },
      { status: 201 },
    );
  } catch (error) {
    // Handle specific transaction errors with appropriate status codes
    if (error instanceof Error) {
      if (error.message === "NEGOTIATION_NOT_FOUND") {
        return NextResponse.json(
          { error: "Negotiation not found" },
          { status: 404 },
        );
      }
      if (error.message === "SOURCE_PROPOSAL_NOT_FOUND") {
        return NextResponse.json(
          { error: "Source proposal not found" },
          { status: 404 },
        );
      }
    }

    console.error("Error creating counter-offer:", error);
    return NextResponse.json(
      { error: "Failed to create counter-offer" },
      { status: 500 },
    );
  }
}
