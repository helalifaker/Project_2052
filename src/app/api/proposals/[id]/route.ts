import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateUserWithRole } from "@/middleware/auth";
import { Role, Prisma } from "@prisma/client";
import { invalidateProposalCache } from "@/lib/cache/calculation-cache";

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
    const body = await request.json();

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

    // Row-level security: Only allow update if user is ADMIN or the creator
    const user = authResult.user;
    if (user.role !== Role.ADMIN && existingProposal.createdBy !== user.id) {
      return NextResponse.json(
        { error: "You can only modify proposals you created" },
        { status: 403 },
      );
    }

    // Build update data object
    const updateData: Prisma.LeaseProposalUpdateInput = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.rentModel !== undefined) updateData.rentModel = body.rentModel;
    if (body.developer !== undefined) updateData.developer = body.developer;
    if (body.property !== undefined) updateData.property = body.property;
    if (body.transition !== undefined)
      updateData.transition = body.transition as Prisma.InputJsonValue;
    if (body.enrollment !== undefined)
      updateData.enrollment = body.enrollment as Prisma.InputJsonValue;
    if (body.curriculum !== undefined)
      updateData.curriculum = body.curriculum as Prisma.InputJsonValue;
    if (body.staff !== undefined)
      updateData.staff = body.staff as Prisma.InputJsonValue;
    if (body.rentParams !== undefined)
      updateData.rentParams = body.rentParams as Prisma.InputJsonValue;
    if (body.otherOpex !== undefined)
      updateData.otherOpex = new Prisma.Decimal(body.otherOpex);
    if (body.financials !== undefined)
      updateData.financials = body.financials as Prisma.InputJsonValue;
    if (body.metrics !== undefined)
      updateData.metrics = body.metrics as Prisma.InputJsonValue;
    if (body.calculatedAt !== undefined)
      updateData.calculatedAt = body.calculatedAt
        ? new Date(body.calculatedAt)
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
