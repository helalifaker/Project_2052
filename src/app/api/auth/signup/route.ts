/**
 * POST /api/auth/signup
 *
 * Creates a user in the Prisma database after successful Supabase signup.
 * This endpoint syncs Supabase auth users with the application database.
 *
 * SECURITY: Verifies JWT token before creating user to prevent IDOR attacks.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

/**
 * Input validation schema - name is optional, will be extracted from JWT if available
 */
const SignupSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name too long"),
});

/**
 * POST - Create user in database after Supabase signup
 *
 * SECURITY: This endpoint now verifies the JWT token and uses the authenticated
 * user's ID and email directly from Supabase, preventing attackers from
 * creating user records for arbitrary Supabase IDs.
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

    // SECURITY: Verify JWT token to get authenticated user
    const supabase = await createClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in with Supabase first." },
        { status: 401 },
      );
    }

    // Use verified user ID and email from JWT, not client-provided values
    const supabaseUserId = authUser.id;
    const email = authUser.email;

    if (!email) {
      return NextResponse.json(
        { error: "Email not available from authentication" },
        { status: 400 },
      );
    }

    const body = await request.json();

    // Validate input (only name is from client now)
    const parseResult = SignupSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 },
      );
    }

    const { name } = parseResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ id: supabaseUserId }, { email }],
      },
    });

    if (existingUser) {
      // SECURITY: User already exists - return 409 Conflict
      // Previously returned 200 which allowed email enumeration attacks
      // The authenticated user's Supabase ID or email already has a profile
      return NextResponse.json(
        {
          error: "User profile already exists",
        },
        { status: 409 },
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
