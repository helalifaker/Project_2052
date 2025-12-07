import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateUserWithRole } from "@/middleware/auth";
import { Role } from "@/lib/types/roles";
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

    const { user } = authResult;

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

    // Fetch proposals to check ownership before deletion
    const proposals = await prisma.leaseProposal.findMany({
      where: { id: { in: proposalIds } },
      select: { id: true, createdBy: true },
    });

    const proposalMap = new Map(proposals.map((p) => [p.id, p.createdBy]));

    // Validate all proposals first - separate valid from invalid
    const validIdsToDelete: string[] = [];

    for (const proposalId of proposalIds) {
      const createdBy = proposalMap.get(proposalId);

      // Check if proposal exists
      if (createdBy === undefined) {
        results.failed++;
        results.errors.push({
          id: proposalId,
          error: "Proposal not found",
        });
        continue;
      }

      // Check ownership: only allow if user is ADMIN or the creator
      if (user.role !== Role.ADMIN && createdBy !== user.id) {
        results.failed++;
        results.errors.push({
          id: proposalId,
          error: "Not authorized to delete this proposal",
        });
        continue;
      }

      // This proposal is valid for deletion
      validIdsToDelete.push(proposalId);
    }

    // Delete all valid proposals in a single atomic transaction
    // This ensures either all deletions succeed or none do
    if (validIdsToDelete.length > 0) {
      try {
        const deleteResult = await prisma.leaseProposal.deleteMany({
          where: { id: { in: validIdsToDelete } },
        });
        results.deleted = deleteResult.count;
      } catch (error) {
        // If transaction fails, mark all valid proposals as failed
        for (const id of validIdsToDelete) {
          results.failed++;
          results.errors.push({
            id,
            error: error instanceof Error ? error.message : "Database error",
          });
        }
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
