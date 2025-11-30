import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateUserWithRole } from "@/middleware/auth";
import { Role } from "@/lib/types/roles";
import type {
  InputJsonValue,
  LeaseProposalUpdateInput,
} from "@/lib/types/prisma-helpers";
import { invalidateProposalCache } from "@/lib/cache/calculation-cache";
import { UpdateProposalSchema } from "@/lib/validation/proposal";

/**
 * GET /api/proposals/[id]
 *
 * Fetch a single proposal by ID
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // Check auth - allow all authenticated roles to view proposals
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
        { error: "Invalid proposal ID" },
        { status: 400 },
      );
    }

    // Fetch proposal with creator info
    const proposal = await prisma.leaseProposal.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        assets: true,
      },
    });

    if (!proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(proposal);
  } catch (error) {
    console.error("Error fetching proposal:", error);
    return NextResponse.json(
      { error: "Failed to fetch proposal" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/proposals/[id]
 *
 * Update a proposal (for edit mode in tabs 2 & 3)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // Check auth - only ADMIN and PLANNER can update proposals
  const authResult = await authenticateUserWithRole([Role.ADMIN, Role.PLANNER]);
  if (!authResult.success) return authResult.error;

  try {
    // Validate request size (1MB limit)
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 1024 * 1024) {
      return NextResponse.json(
        { error: "Request body too large (max 1MB)" },
        { status: 413 },
      );
    }

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

    const body = await request.json();

    // Validate request body with Zod
    const validationResult = UpdateProposalSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const validatedData = validationResult.data;

    // Check if proposal exists
    const existingProposal = await prisma.leaseProposal.findUnique({
      where: { id },
    });

    if (!existingProposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 },
      );
    }

    // Row-level security: Only allow update if user is ADMIN or the creator
    const user = authResult.user;
    if (user.role !== Role.ADMIN && existingProposal.createdBy !== user.id) {
      return NextResponse.json(
        { error: "You can only modify proposals you created" },
        { status: 403 },
      );
    }

    // Build update data object from validated data
    const updateData: LeaseProposalUpdateInput = {};

    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.rentModel !== undefined)
      updateData.rentModel = validatedData.rentModel;
    if (validatedData.developer !== undefined)
      updateData.developer = validatedData.developer;
    if (validatedData.property !== undefined)
      updateData.property = validatedData.property;
    if (validatedData.enrollment !== undefined)
      updateData.enrollment = validatedData.enrollment as InputJsonValue;
    if (validatedData.curriculum !== undefined)
      updateData.curriculum = validatedData.curriculum as InputJsonValue;
    if (validatedData.staff !== undefined)
      updateData.staff = validatedData.staff as InputJsonValue;
    if (validatedData.rentParams !== undefined)
      updateData.rentParams = validatedData.rentParams as InputJsonValue;
    if (validatedData.otherOpexPercent !== undefined)
      updateData.otherOpexPercent = validatedData.otherOpexPercent;
    if (validatedData.financials !== undefined)
      updateData.financials = validatedData.financials as InputJsonValue;
    if (validatedData.metrics !== undefined)
      updateData.metrics = validatedData.metrics as InputJsonValue;
    if (validatedData.calculatedAt !== undefined)
      updateData.calculatedAt = validatedData.calculatedAt
        ? new Date(validatedData.calculatedAt)
        : null;

    // Update proposal
    const updatedProposal = await prisma.leaseProposal.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        assets: true,
      },
    });

    // PERFORMANCE OPTIMIZATION: Invalidate cache for this proposal
    invalidateProposalCache(id);

    return NextResponse.json(updatedProposal);
  } catch (error) {
    console.error("Error updating proposal:", error);
    return NextResponse.json(
      { error: "Failed to update proposal" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/proposals/[id]
 *
 * Delete a proposal
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // Check auth - only ADMIN and PLANNER can delete proposals
  const authResult = await authenticateUserWithRole([Role.ADMIN, Role.PLANNER]);
  if (!authResult.success) return authResult.error;

  try {
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

    // Check if proposal exists
    const existingProposal = await prisma.leaseProposal.findUnique({
      where: { id },
    });

    if (!existingProposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 },
      );
    }

    // Row-level security: Only allow delete if user is ADMIN or the creator
    const user = authResult.user;
    if (user.role !== Role.ADMIN && existingProposal.createdBy !== user.id) {
      return NextResponse.json(
        { error: "You can only delete proposals you created" },
        { status: 403 },
      );
    }

    // PERFORMANCE OPTIMIZATION: Invalidate cache for this proposal before deletion
    invalidateProposalCache(id);

    // Delete proposal
    await prisma.leaseProposal.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Proposal deleted" });
  } catch (error) {
    console.error("Error deleting proposal:", error);
    return NextResponse.json(
      { error: "Failed to delete proposal" },
      { status: 500 },
    );
  }
}
