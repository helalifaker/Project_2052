/**
 * POST /api/auth/signup
 *
 * Creates a user in the Prisma database after successful Supabase signup.
 * This endpoint syncs Supabase auth users with the application database.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

/**
 * Input validation schema
 */
const SignupSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().min(1, "Name is required").max(255, "Name too long"),
  supabaseUserId: z.string().uuid("Invalid Supabase user ID"),
});

/**
 * POST - Create user in database after Supabase signup
 */
export async function POST(request: Request) {
  try {
    // Validate content length
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 10000) {
      return NextResponse.json(
        { error: "Request body too large" },
        { status: 413 },
      );
    }

    const body = await request.json();

    // Validate input
    const parseResult = SignupSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 },
      );
    }

    const { email, name, supabaseUserId } = parseResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ id: supabaseUserId }, { email }],
      },
    });

    if (existingUser) {
      // User already exists - return success with existing user data
      return NextResponse.json(
        {
          user: {
            id: existingUser.id,
            email: existingUser.email,
            name: existingUser.name,
            role: existingUser.role,
            createdAt: existingUser.createdAt,
          },
          message: "User already exists",
        },
        { status: 200 },
      );
    }

    // Create new user with default VIEWER role
    const user = await prisma.user.create({
      data: {
        id: supabaseUserId, // Use Supabase user ID as primary key
        email,
        name,
        role: "VIEWER", // Default role
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        user,
        message: "User created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup API error:", error);

    // Handle Prisma unique constraint violation
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint failed")
    ) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
