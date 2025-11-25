/**
 * GET /api/auth/session
 *
 * Checks current authentication session and returns user data.
 * Returns null if not authenticated.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

/**
 * GET - Get current session and user data
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Get authenticated user from Supabase
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    // Not authenticated
    if (authError || !authUser) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Fetch user details from database
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    // User exists in Supabase but not in our database
    if (!user) {
      return NextResponse.json(
        {
          user: null,
          error: "User not found in database. Please complete registration.",
        },
        { status: 200 },
      );
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Session API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
