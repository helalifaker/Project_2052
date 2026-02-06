/**
 * POST /api/auth/logout
 *
 * Signs out the current user from Supabase authentication.
 * Clears session and authentication cookies.
 * Invalidates the server-side session cache to prevent stale data.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { invalidateUserSession } from "@/middleware/auth";

/**
 * POST - Sign out current user
 */
export async function POST() {
  try {
    const supabase = await createClient();

    // Capture user ID before signing out so we can invalidate the cache
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      return NextResponse.json(
        { error: "Failed to sign out" },
        { status: 500 },
      );
    }

    // Invalidate the server-side session cache for this user
    if (user?.id) {
      invalidateUserSession(user.id);
    }

    return NextResponse.json(
      { message: "Successfully signed out" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Logout API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
