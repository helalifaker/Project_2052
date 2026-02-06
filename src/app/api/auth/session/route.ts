/**
 * GET /api/auth/session
 *
 * Checks current authentication session and returns user data.
 * Uses authenticateUser() which leverages the LRU session cache
 * to avoid redundant database lookups.
 *
 * Returns { user: null } if not authenticated (200 status for AuthProvider compatibility).
 */

import { NextResponse } from "next/server";
import { authenticateUser } from "@/middleware/auth";

/**
 * GET - Get current session and user data
 */
export async function GET() {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      // Return { user: null } with 200 for AuthProvider compatibility
      // (AuthProvider checks data.user, not HTTP status for auth state)
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const { user } = authResult;

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Session API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
