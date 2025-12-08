/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  authenticateUser,
  authenticateUserWithRole,
  invalidateUserSession,
} from "@/middleware/auth";
import { Role } from "@/lib/types/roles";
import type { UserUpdateInput } from "@/lib/types/prisma-helpers";
import { PrismaClientKnownRequestError } from "@/lib/types/prisma-helpers";
import { z } from "zod";

// Request size limit (100KB - users don't need large payloads)
const MAX_REQUEST_SIZE = 100 * 1024;

/**
 * Validation schema for updating a user
 */
const UpdateUserSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .max(255, "Name too long")
      .optional(),
    role: z.nativeEnum(Role).optional(),
    email: z.string().email("Invalid email address").optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.role !== undefined ||
      data.email !== undefined,
    {
      message: "At least one field must be provided for update",
    },
  );

type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

/**
 * GET /api/users/[id]
 *
 * Fetch user details by ID.
 *
 * NOTE: Uses authenticateUser() instead of authenticateUserWithRole() because
 * this endpoint implements a "self-access or admin" pattern:
 * - Any authenticated user can fetch their OWN data
 * - ADMIN can fetch ANY user's data
 *
 * This pattern requires manual role checking after authentication.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Authenticate user
    const authResult = await authenticateUser();
    if (!authResult.success) return authResult.error;

    const { id } = await params;

    // Users can only fetch their own data unless they're admin
    const { user: currentUser } = authResult;
    if (currentUser.id !== id && currentUser.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: "Forbidden - You can only access your own user data" },
        { status: 403 },
      );
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            proposalsCreated: true,
            scenariosCreated: true,
            sensitivityAnalysesCreated: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user. Please try again." },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/users/[id]
 *
 * Update user details.
 *
 * NOTE: Uses authenticateUser() instead of authenticateUserWithRole() because
 * this endpoint implements a "self-access or admin" pattern:
 * - Any authenticated user can update their OWN name
 * - ADMIN can update ANY user's name, email, or role
 *
 * This pattern requires manual role checking after authentication.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Authenticate user
    const authResult = await authenticateUser();
    if (!authResult.success) return authResult.error;

    const { id } = await params;
    const { user: currentUser } = authResult;

    // Check content-length header for request size limit
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_REQUEST_SIZE) {
      return NextResponse.json(
        {
          error: "Request body too large",
          maxSize: `${MAX_REQUEST_SIZE / 1024}KB`,
        },
        { status: 413 },
      );
    }

    const body = await request.json();

    // Validate input
    const validationResult = UpdateUserSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const validatedData: UpdateUserInput = validationResult.data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Authorization logic:
    // - Users can update their own name only
    // - ADMIN can update any user's name, email, or role
    const isAdmin = currentUser.role === Role.ADMIN;
    const isSelf = currentUser.id === id;

    if (!isAdmin && !isSelf) {
      return NextResponse.json(
        { error: "Forbidden - You can only update your own user data" },
        { status: 403 },
      );
    }

    // Non-admin users can only update their name
    if (
      !isAdmin &&
      (validatedData.role !== undefined || validatedData.email !== undefined)
    ) {
      return NextResponse.json(
        { error: "Forbidden - Only admins can update role or email" },
        { status: 403 },
      );
    }

    // If email is being changed, check for conflicts
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const emailConflict = await prisma.user.findUnique({
        where: { email: validatedData.email },
        select: { id: true },
      });

      if (emailConflict) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 409 },
        );
      }
    }

    // Build update data object
    const updateData: UserUpdateInput = {};
    if (validatedData.name !== undefined) {
      updateData.name = validatedData.name;
    }
    if (validatedData.email !== undefined && isAdmin) {
      updateData.email = validatedData.email;
    }
    if (validatedData.role !== undefined && isAdmin) {
      updateData.role = validatedData.role;
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: updateData as any,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    // SECURITY: Invalidate cached session when user data changes
    // This ensures role changes take effect immediately, not after cache TTL (10 min)
    invalidateUserSession(id);

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.issues,
        },
        { status: 400 },
      );
    }

    // Handle Prisma unique constraint violation
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 },
      );
    }

    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/users/[id]
 *
 * Delete a user
 * Requires ADMIN role
 * Cannot delete yourself
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // Check auth - only ADMIN can delete users
  const authResult = await authenticateUserWithRole([Role.ADMIN]);
  if (!authResult.success) return authResult.error;

  try {
    const { id } = await params;
    const { user: currentUser } = authResult;

    // Prevent self-deletion
    if (currentUser.id === id) {
      return NextResponse.json(
        { error: "Cannot delete your own user account" },
        { status: 400 },
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        _count: {
          select: {
            proposalsCreated: true,
          },
        },
      },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has created proposals (will fail due to onDelete: Restrict)
    if (existingUser._count.proposalsCreated > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete user with existing proposals",
          details: `User has ${existingUser._count.proposalsCreated} proposal(s)`,
        },
        { status: 409 },
      );
    }

    // SECURITY: Invalidate cached session BEFORE deleting user
    // This ensures deleted users lose access immediately, not after cache TTL (10 min)
    invalidateUserSession(id);

    // Delete user
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    // Handle foreign key constraint violation
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return NextResponse.json(
        {
          error: "Cannot delete user with existing data",
          details: "User has associated proposals, scenarios, or other records",
        },
        { status: 409 },
      );
    }

    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 },
    );
  }
}
