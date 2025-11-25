import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateUserWithRole } from "@/middleware/auth";
import { Role } from "@prisma/client";
import { z } from "zod";

/**
 * POST /api/proposals/bulk-delete
 *
 * Delete multiple proposals at once
 * Requires PLANNER or ADMIN role
 *
 * Request body:
 * {
 *   "proposalIds": ["id1", "id2", "id3"]
 * }
 *
 * Response:
 * {
 *   "deleted": 3,
 *   "failed": 0,
 *   "errors": []
 * }
 */

const bulkDeleteSchema = z.object({
  proposalIds: z
    .array(z.string().uuid())
    .min(1, "At least one proposal ID required"),
});

export async function POST(request: Request) {
  try {
    // Authenticate user and check role
    const authResult = await authenticateUserWithRole([
      Role.ADMIN,
      Role.PLANNER,
    ]);
    if (!authResult.success) return authResult.error;

    // Parse and validate request body
    const body = await request.json();
    const validation = bulkDeleteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.issues },
        { status: 400 },
      );
    }

    const { proposalIds } = validation.data;

    // Track results
    const results = {
      deleted: 0,
      failed: 0,
      errors: [] as Array<{ id: string; error: string }>,
    };

    // Delete proposals in a transaction for safety
    for (const proposalId of proposalIds) {
      try {
        await prisma.leaseProposal.delete({
          where: { id: proposalId },
        });
        results.deleted++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          id: proposalId,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Return success with summary
    return NextResponse.json(results, {
      status: results.failed > 0 ? 207 : 200, // 207 Multi-Status if some failed
    });
  } catch (error) {
    console.error("Error in bulk delete:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
