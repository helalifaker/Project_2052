/**
 * GET /api/auth/approval-status
 *
 * Returns the current user's approval status.
 * Used by the pending-approval page to check if the user has been approved.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    // Get authenticated user from Supabase
    const supabase = await createClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        approvalStatus: true,
        rejectionReason: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 },
      );
    }

    // Return approval status
    if (dbUser.approvalStatus === "PENDING") {
      return NextResponse.json(
        {
          approvalStatus: "PENDING",
          code: "PENDING_APPROVAL",
          message: "Your account is awaiting administrator approval.",
        },
        { status: 403 },
      );
    }

    if (dbUser.approvalStatus === "REJECTED") {
      return NextResponse.json(
        {
          approvalStatus: "REJECTED",
          code: "ACCOUNT_REJECTED",
          message:
            dbUser.rejectionReason ||
            "Your account access request has been denied.",
        },
        { status: 403 },
      );
    }

    // User is approved
    return NextResponse.json({
      approvalStatus: "APPROVED",
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
      },
    });
  } catch (error) {
    console.error("Approval status check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
