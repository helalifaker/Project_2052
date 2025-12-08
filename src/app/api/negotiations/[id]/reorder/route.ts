import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateUserWithRole } from "@/middleware/auth";
import { Role } from "@/lib/types/roles";
import { ReorderOffersSchema } from "@/lib/validation/negotiation";

/**
 * PATCH /api/negotiations/[id]/reorder
 *
 * Reorder offer numbers for proposals in this negotiation.
 * Accepts an array of { proposalId, offerNumber } pairs.
 */
export async function PATCH(
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
    const validationResult = ReorderOffersSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const { offers } = validationResult.data;

    // Check negotiation exists
    const negotiation = await prisma.negotiation.findUnique({
      where: { id },
      include: {
        proposals: {
          select: { id: true },
        },
      },
    });

    if (!negotiation) {
      return NextResponse.json(
        { error: "Negotiation not found" },
        { status: 404 },
      );
    }

    // Verify all proposals belong to this negotiation
    const negotiationProposalIds = new Set(
      negotiation.proposals.map((p) => p.id),
    );
    const invalidProposals = offers.filter(
      (o) => !negotiationProposalIds.has(o.proposalId),
    );

    if (invalidProposals.length > 0) {
      return NextResponse.json(
        {
          error: "Some proposals do not belong to this negotiation",
          invalidProposalIds: invalidProposals.map((p) => p.proposalId),
        },
        { status: 400 },
      );
    }

    // Check for duplicate offer numbers
    const offerNumbers = offers.map((o) => o.offerNumber);
    const uniqueOfferNumbers = new Set(offerNumbers);
    if (offerNumbers.length !== uniqueOfferNumbers.size) {
      return NextResponse.json(
        { error: "Duplicate offer numbers not allowed" },
        { status: 400 },
      );
    }

    // Update offer numbers in a transaction
    await prisma.$transaction(
      offers.map((offer) =>
        prisma.leaseProposal.update({
          where: { id: offer.proposalId },
          data: { offerNumber: offer.offerNumber },
        }),
      ),
    );

    // Fetch updated proposals
    const updatedProposals = await prisma.leaseProposal.findMany({
      where: { negotiationId: id },
      orderBy: [{ offerNumber: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        name: true,
        offerNumber: true,
        origin: true,
        status: true,
      },
    });

    return NextResponse.json({
      success: true,
      proposals: updatedProposals,
    });
  } catch (error) {
    console.error("Error reordering offers:", error);
    return NextResponse.json(
      { error: "Failed to reorder offers" },
      { status: 500 },
    );
  }
}
