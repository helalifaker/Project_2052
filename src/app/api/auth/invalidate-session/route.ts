/**
 * POST /api/auth/invalidate-session
 *
 * Force-invalidates a user's cached session from the server-side session cache.
 * This is used to:
 * 1. Immediately propagate role changes (admin action)
 * 2. Sync cache after token refresh (AuthProvider)
 * 3. Force logout for security incidents (admin action)
 *
 * Authorization:
 * - Admins can invalidate any user's session
 * - Regular users can only invalidate their own session
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import {
  authenticateUser,
  invalidateUserSession,
  clearAllSessions,
} from "@/middleware/auth";
import { Role } from "@/lib/types/roles";

// Request body schema
const InvalidateSessionSchema = z.object({
  // Target user ID to invalidate (optional - defaults to self)
  userId: z.string().uuid().optional(),
  // Clear all sessions (admin only, for security incidents)
  clearAll: z.boolean().optional().default(false),
});

/**
 * POST - Invalidate user session cache
 */
export async function POST(request: Request) {
  try {
    // Authenticate the requesting user
    const authResult = await authenticateUser();
    if (!authResult.success) {
      return authResult.error;
    }

    const { user: requestingUser } = authResult;

    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      // Empty body is allowed - defaults to invalidating own session
      body = {};
    }

    const parsed = InvalidateSessionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: parsed.error.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
        },
        { status: 400 },
      );
    }

    const { userId, clearAll } = parsed.data;

    // Handle clear all sessions (admin only)
    if (clearAll) {
      if (requestingUser.role !== Role.ADMIN) {
        return NextResponse.json(
          { error: "Forbidden - Only admins can clear all sessions" },
          { status: 403 },
        );
      }

      clearAllSessions();

      return NextResponse.json(
        {
          success: true,
          message: "All sessions invalidated",
          action: "clear_all",
        },
        { status: 200 },
      );
    }

    // Determine target user ID
    const targetUserId = userId ?? requestingUser.id;

    // Authorization check: non-admins can only invalidate their own session
    if (
      targetUserId !== requestingUser.id &&
      requestingUser.role !== Role.ADMIN
    ) {
      return NextResponse.json(
        { error: "Forbidden - You can only invalidate your own session" },
        { status: 403 },
      );
    }

    // Invalidate the target user's session
    invalidateUserSession(targetUserId);

    return NextResponse.json(
      {
        success: true,
        message: "Session invalidated",
        userId: targetUserId,
        action: "invalidate_single",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Session invalidation error:", error);
    return NextResponse.json(
      { error: "Failed to invalidate session. Please try again." },
      { status: 500 },
    );
  }
}
