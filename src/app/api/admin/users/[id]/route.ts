/**
 * Admin User Detail API
 *
 * GET /api/admin/users/[id] - Get user details
 * PATCH /api/admin/users/[id] - Update user (approve/reject, change role)
 * DELETE /api/admin/users/[id] - Delete user
 *
 * Only accessible by ADMIN users.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  authenticateUserWithRole,
  invalidateUserSession,
} from "@/middleware/auth";
import { Role } from "@/lib/types/roles";
import {
  Prisma,
  Role as PrismaRole,
  ApprovalStatus as PrismaApprovalStatus,
} from "@prisma/client";
import { z } from "zod";

// Update user schema
const UpdateUserSchema = z.object({
  approvalStatus: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  role: z.enum(["ADMIN", "PLANNER", "VIEWER"]).optional(),
  rejectionReason: z.string().max(500).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET - Get user details (Admin only)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // Authenticate - Admin only
  const authResult = await authenticateUserWithRole([Role.ADMIN]);
  if (!authResult.success) {
    return authResult.error;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        approvalStatus: true,
        approvedBy: true,
        approvedAt: true,
        rejectionReason: true,
        createdAt: true,
        _count: {
          select: {
            proposalsCreated: true,
            negotiationsCreated: true,
            scenariosCreated: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Admin get user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PATCH - Update user (approve/reject, change role) - Admin only
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // Authenticate - Admin only
  const authResult = await authenticateUserWithRole([Role.ADMIN]);
  if (!authResult.success) {
    return authResult.error;
  }

  const { user: adminUser } = authResult;

  try {
    // Prevent self-modification of approval status
    if (id === adminUser.id) {
      return NextResponse.json(
        { error: "Cannot modify your own account" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const parseResult = UpdateUserSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parseResult.error.flatten() },
        { status: 400 },
      );
    }

    const { approvalStatus, role, rejectionReason } = parseResult.data;

    // Check user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, approvalStatus: true },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Build update data using Prisma types
    const updateData: Prisma.UserUpdateInput = {};

    if (approvalStatus !== undefined) {
      updateData.approvalStatus = approvalStatus as PrismaApprovalStatus;
      updateData.approvedBy = adminUser.id;
      updateData.approvedAt = new Date();

      if (approvalStatus === "REJECTED" && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      } else if (approvalStatus === "APPROVED") {
        updateData.rejectionReason = null;
      }
    }

    if (role !== undefined) {
      updateData.role = role as PrismaRole;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        approvalStatus: true,
        approvedBy: true,
        approvedAt: true,
        rejectionReason: true,
        createdAt: true,
      },
    });

    // Invalidate the user's session cache so changes take effect immediately
    invalidateUserSession(id);

    // TODO: Send email notification to user about approval status change

    return NextResponse.json({
      user: updatedUser,
      message: approvalStatus
        ? `User ${approvalStatus.toLowerCase()} successfully`
        : "User updated successfully",
    });
  } catch (error) {
    console.error("Admin update user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE - Delete user (Admin only)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // Authenticate - Admin only
  const authResult = await authenticateUserWithRole([Role.ADMIN]);
  if (!authResult.success) {
    return authResult.error;
  }

  const { user: adminUser } = authResult;

  try {
    // Prevent self-deletion
    if (id === adminUser.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 },
      );
    }

    // Check user exists and has no critical relations
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        _count: {
          select: {
            proposalsCreated: true,
            negotiationsCreated: true,
          },
        },
      },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Warn if user has created content
    const hasContent =
      existingUser._count.proposalsCreated > 0 ||
      existingUser._count.negotiationsCreated > 0;

    if (hasContent) {
      return NextResponse.json(
        {
          error: "Cannot delete user with existing proposals or negotiations",
          details: {
            proposals: existingUser._count.proposalsCreated,
            negotiations: existingUser._count.negotiationsCreated,
          },
        },
        { status: 400 },
      );
    }

    // Delete user from database
    await prisma.user.delete({ where: { id } });

    // Invalidate session cache
    invalidateUserSession(id);

    // TODO: Also delete from Supabase auth.users

    return NextResponse.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Admin delete user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
