import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateUserWithRole } from "@/middleware/auth";
import { Role } from "@/lib/types/roles";
import { UpdateNegotiationSchema } from "@/lib/validation/negotiation";

/**
 * GET /api/negotiations/[id]
 *
 * Fetch a single negotiation by ID with all proposals
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

    const negotiation = await prisma.negotiation.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        proposals: {
          orderBy: [{ offerNumber: "asc" }, { createdAt: "asc" }],
          include: {
            creator: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!negotiation) {
      return NextResponse.json(
        { error: "Negotiation not found" },
        { status: 404 },
      );
    }

    // Compute summary statistics for frontend
    const ourOffers = negotiation.proposals.filter(
      (p) => p.origin === "OUR_OFFER",
    ).length;
    const theirCounters = negotiation.proposals.filter(
      (p) => p.origin === "THEIR_COUNTER",
    ).length;

    // Get latest metrics from the proposal with highest offerNumber
    const latestProposal =
      negotiation.proposals.length > 0
        ? [...negotiation.proposals].sort(
            (a, b) => (b.offerNumber ?? 0) - (a.offerNumber ?? 0),
          )[0]
        : null;

    // Extract metrics from the latest proposal (stored as JSON)
    const latestMetrics = latestProposal?.metrics
      ? {
          totalRent:
            (latestProposal.metrics as Record<string, unknown>).totalRent ??
            null,
          npv: (latestProposal.metrics as Record<string, unknown>).npv ?? null,
          irr: (latestProposal.metrics as Record<string, unknown>).irr ?? null,
        }
      : null;

    const summary = {
      totalProposals: negotiation.proposals.length,
      ourOffers,
      theirCounters,
      latestMetrics,
    };

    return NextResponse.json({
      ...negotiation,
      summary,
    });
  } catch (error) {
    console.error("Error fetching negotiation:", error);
    return NextResponse.json(
      { error: "Failed to fetch negotiation" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/negotiations/[id]
 *
 * Update a negotiation (status, notes)
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
    const validationResult = UpdateNegotiationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    // Check if negotiation exists
    const existing = await prisma.negotiation.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Negotiation not found" },
        { status: 404 },
      );
    }

    // Update the negotiation
    const updated = await prisma.negotiation.update({
      where: { id },
      data: validationResult.data,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        proposals: {
          orderBy: [{ offerNumber: "asc" }, { createdAt: "asc" }],
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating negotiation:", error);
    return NextResponse.json(
      { error: "Failed to update negotiation" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/negotiations/[id]
 *
 * Delete a negotiation (unlinks proposals, does not delete them)
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await authenticateUserWithRole([Role.ADMIN]);
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

    // Check if negotiation exists
    const existing = await prisma.negotiation.findUnique({
      where: { id },
      include: { proposals: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Negotiation not found" },
        { status: 404 },
      );
    }

    // ATOMICITY: Use transaction to ensure proposals are unlinked AND negotiation is deleted
    // If either operation fails, both are rolled back to prevent orphaned data
    await prisma.$transaction(async (tx) => {
      // Unlink proposals first (set negotiationId to null)
      await tx.leaseProposal.updateMany({
        where: { negotiationId: id },
        data: {
          negotiationId: null,
          offerNumber: null,
        },
      });

      // Delete the negotiation
      await tx.negotiation.delete({
        where: { id },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Negotiation deleted",
      unlinkedProposals: existing.proposals.length,
    });
  } catch (error) {
    console.error("Error deleting negotiation:", error);
    return NextResponse.json(
      { error: "Failed to delete negotiation" },
      { status: 500 },
    );
  }
}
