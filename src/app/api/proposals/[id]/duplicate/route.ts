/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateUserWithRole } from "@/middleware/auth";
import { Role } from "@/lib/types/roles";
import { JsonNull } from "@/lib/types/prisma-helpers";
import { DuplicateProposalSchema } from "@/lib/validation/proposal";

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

    // Parse and validate optional request body
    let customName: string | undefined;
    const contentType = request.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      try {
        const body = await request.json();
        const validationResult = DuplicateProposalSchema.safeParse(body);
        if (!validationResult.success) {
          return NextResponse.json(
            {
              error: "Validation failed",
              details: validationResult.error.issues,
            },
            { status: 400 },
          );
        }
        customName = validationResult.data?.name;
      } catch {
        // Empty body is acceptable - ignore parse errors
      }
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
        name: customName || `${original.name} (Copy)`,
        rentModel: original.rentModel,
        createdBy: authResult.user.id, // Current user becomes creator

        // Copy all configuration data
        enrollment: original.enrollment as any,
        curriculum: original.curriculum as any,
        staff: original.staff as any,
        rentParams: original.rentParams as any,
        otherOpexPercent: original.otherOpexPercent,
        transitionConfigUpdatedAt: original.transitionConfigUpdatedAt,

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
        financials: JsonNull as any,
        metrics: JsonNull as any,
        calculatedAt: null,

        // Copy CapEx assets if any
        assets: {
          create: original.assets.map(
            (asset: {
              purchaseYear: number;
              purchaseAmount: unknown;
              usefulLife: number;
              categoryId: string;
            }) => ({
              purchaseYear: asset.purchaseYear,
              purchaseAmount: asset.purchaseAmount,
              usefulLife: asset.usefulLife,
              categoryId: asset.categoryId,
            }),
          ) as any,
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
