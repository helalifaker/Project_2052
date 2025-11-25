/**
 * POST /api/auth/logout
 *
 * Signs out the current user from Supabase authentication.
 * Clears session and authentication cookies.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST - Sign out current user
 */
export async function POST() {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      return NextResponse.json(
        { error: "Failed to sign out" },
        { status: 500 },
      );
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
