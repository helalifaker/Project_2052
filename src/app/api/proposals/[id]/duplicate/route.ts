import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateUserWithRole } from "@/middleware/auth";
import { Role, Prisma } from "@prisma/client";

/**
 * POST /api/proposals/[id]/duplicate
 *
 * Duplicate an existing proposal
 * Requires PLANNER or ADMIN role
 *
 * Creates a copy of the proposal with:
 * - New UUID
 * - " (Copy)" appended to name
 * - Reset calculatedAt to null
 * - Same creator as original
 * - All other data copied
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Authenticate user and check role
    const authResult = await authenticateUserWithRole([
      Role.ADMIN,
      Role.PLANNER,
    ]);
    if (!authResult.success) return authResult.error;

    const { id } = await params;

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: "Invalid proposal ID" },
        { status: 400 },
      );
    }

    // Fetch the original proposal
    const original = await prisma.leaseProposal.findUnique({
      where: { id },
      include: {
        assets: true, // Include CapEx assets
      },
    });

    if (!original) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 },
      );
    }

    // Create duplicate proposal
    const duplicate = await prisma.leaseProposal.create({
      data: {
        name: `${original.name} (Copy)`,
        rentModel: original.rentModel,
        createdBy: authResult.user.id, // Current user becomes creator

        // Copy all configuration data
        transition: original.transition as Prisma.InputJsonValue,
        enrollment: original.enrollment as Prisma.InputJsonValue,
        curriculum: original.curriculum as Prisma.InputJsonValue,
        staff: original.staff as Prisma.InputJsonValue,
        rentParams: original.rentParams as Prisma.InputJsonValue,
        otherOpex: original.otherOpex,

        // Copy negotiation context
        developer: original.developer,
        property: original.property,
        negotiationRound: original.negotiationRound,
        version: original.version,
        origin: original.origin,
        status: "DRAFT", // Reset to DRAFT status
        parentProposalId: original.parentProposalId,

        // Reset timeline tracking
        submittedDate: null,
        responseReceivedDate: null,

        // Copy notes
        negotiationNotes: original.negotiationNotes,
        boardComments: original.boardComments,

        // Reset calculated data (will need to be recalculated)
        financials: Prisma.JsonNull,
        metrics: Prisma.JsonNull,
        calculatedAt: null,

        // Copy CapEx assets if any
        assets: {
          create: original.assets.map((asset) => ({
            year: asset.year,
            assetName: asset.assetName,
            amount: asset.amount,
            usefulLife: asset.usefulLife,
            depreciationMethod: asset.depreciationMethod,
            fixedAmount: asset.fixedAmount,
            rate: asset.rate,
            nbv: asset.nbv,
          })),
        },
      },
    });

    return NextResponse.json(duplicate, { status: 201 });
  } catch (error) {
    console.error("Error duplicating proposal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
