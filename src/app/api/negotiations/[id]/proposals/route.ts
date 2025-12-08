import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateUserWithRole } from "@/middleware/auth";
import { Role, ProposalPurpose } from "@/lib/types/roles";
import { z } from "zod";

/**
 * Schema for linking a proposal to a negotiation
 */
const LinkProposalSchema = z.object({
  proposalId: z.string().uuid("Invalid proposal ID"),
  origin: z.enum(["OUR_OFFER", "THEIR_COUNTER"]),
  offerNumber: z.number().int().positive().optional(),
});

/**
 * GET /api/negotiations/[id]/proposals
 *
 * List all proposals in this negotiation
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await authenticateUserWithRole([
    Role.ADMIN,
    Role.PLANNER,
    Role.VIEWER,
  ]);
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

    // Check negotiation exists
    const negotiation = await prisma.negotiation.findUnique({
      where: { id },
    });

    if (!negotiation) {
      return NextResponse.json(
        { error: "Negotiation not found" },
        { status: 404 },
      );
    }

    // Fetch proposals
    const proposals = await prisma.leaseProposal.findMany({
      where: { negotiationId: id },
      orderBy: [{ offerNumber: "asc" }, { createdAt: "asc" }],
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ proposals });
  } catch (error) {
    console.error("Error fetching proposals:", error);
    return NextResponse.json(
      { error: "Failed to fetch proposals" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/negotiations/[id]/proposals
 *
 * Link an existing proposal to this negotiation
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
    const validationResult = LinkProposalSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const { proposalId, origin, offerNumber } = validationResult.data;

    // Check negotiation exists
    const negotiation = await prisma.negotiation.findUnique({
      where: { id },
    });

    if (!negotiation) {
      return NextResponse.json(
        { error: "Negotiation not found" },
        { status: 404 },
      );
    }

    // Check proposal exists and is not already linked
    const proposal = await prisma.leaseProposal.findUnique({
      where: { id: proposalId },
    });

    if (!proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 },
      );
    }

    if (proposal.negotiationId && proposal.negotiationId !== id) {
      return NextResponse.json(
        {
          error: "Proposal is already linked to another negotiation",
          existingNegotiationId: proposal.negotiationId,
        },
        { status: 409 },
      );
    }

    // Determine offer number
    let assignedOfferNumber = offerNumber;
    if (!assignedOfferNumber) {
      // Auto-assign next offer number
      const maxOffer = await prisma.leaseProposal.findFirst({
        where: { negotiationId: id },
        orderBy: { offerNumber: "desc" },
        select: { offerNumber: true },
      });
      assignedOfferNumber = (maxOffer?.offerNumber ?? 0) + 1;
    }

    // Link the proposal
    const updated = await prisma.leaseProposal.update({
      where: { id: proposalId },
      data: {
        negotiationId: id,
        origin,
        offerNumber: assignedOfferNumber,
        purpose: ProposalPurpose.NEGOTIATION,
        // Copy developer/property from negotiation for backward compatibility
        developer: negotiation.developer,
        property: negotiation.property,
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

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      offerNumber: updated.offerNumber,
      origin: updated.origin,
      status: updated.status,
    });
  } catch (error) {
    console.error("Error linking proposal:", error);
    return NextResponse.json(
      { error: "Failed to link proposal" },
      { status: 500 },
    );
  }
}
