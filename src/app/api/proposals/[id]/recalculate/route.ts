/**
 * POST /api/proposals/[id]/recalculate
 *
 * Recalculate financial projections for an existing proposal
 * Uses the stored proposal data to rebuild the calculation input and re-run the engine
 */

import { NextResponse } from "next/server";
import Decimal from "decimal.js";
import { prisma } from "@/lib/prisma";
import { authenticateUserWithRole } from "@/middleware/auth";
import { Role, Prisma } from "@prisma/client";
import { calculateFinancialProjections } from "@/lib/engine";
import type { CalculationEngineOutput } from "@/lib/engine/core/types";
import {
  reconstructCalculationInput,
  type ProposalRecord,
} from "@/lib/proposals/reconstruct-calculation-input";
import {
  invalidateProposalCache,
  setCachedCalculation,
} from "@/lib/cache/calculation-cache";

// ============================================================================
// API HANDLER
// ============================================================================

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // Check auth - only ADMIN and PLANNER can recalculate
  const authResult = await authenticateUserWithRole([Role.ADMIN, Role.PLANNER]);
  if (!authResult.success) return authResult.error;

  const startTime = performance.now();

  try {
    const { id: proposalId } = await params;

    // Validate UUID
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(proposalId)) {
      return NextResponse.json(
        { error: "Invalid proposal ID" },
        { status: 400 },
      );
    }

    // Fetch proposal
    const proposal = await prisma.leaseProposal.findUnique({
      where: { id: proposalId },
      include: { assets: true },
    });

    if (!proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 },
      );
    }

    console.log(`🔄 Recalculating proposal ${proposalId}...`);

    // Reconstruct calculation input from proposal
    const input = await reconstructCalculationInput(proposal as ProposalRecord);

    // Invalidate cache for this proposal
    invalidateProposalCache(proposalId);

    // Run calculation
    const calculationStartTime = performance.now();
    const result: CalculationEngineOutput =
      await calculateFinancialProjections(input);
    const calculationTimeMs = performance.now() - calculationStartTime;

    console.log(
      `✅ Recalculation completed in ${calculationTimeMs.toFixed(2)}ms`,
    );

    // Serialize results
    const serializedResult = serializeCalculationOutput(result);

    // Fetch TransitionConfig to record audit timestamp
    const transitionConfig = await prisma.transitionConfig.findFirst();

    // Update proposal with new results
    const updatedProposal = await prisma.leaseProposal.update({
      where: { id: proposalId },
      data: {
        financials:
          serializedResult.periods as unknown as Prisma.InputJsonValue,
        metrics: serializedResult.metrics as unknown as Prisma.InputJsonValue,
        calculatedAt: new Date(),
        transitionConfigUpdatedAt: transitionConfig?.updatedAt || new Date(),
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Cache the new calculation result
    setCachedCalculation(input, result);

    const totalTimeMs = performance.now() - startTime;

    return NextResponse.json({
      success: true,
      proposal: updatedProposal,
      data: serializedResult,
      meta: {
        calculationTimeMs,
        totalTimeMs,
        periodsCalculated: result.periods.length,
        allBalanced: result.validation.allPeriodsBalanced,
        allReconciled: result.validation.allCashFlowsReconciled,
      },
    });
  } catch (error) {
    console.error("❌ Recalculation failed:", error);

    return NextResponse.json(
      {
        error: "Recalculation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Serialize CalculationEngineOutput for JSON response
 */
function serializeCalculationOutput(output: CalculationEngineOutput) {
  return {
    periods: output.periods.map((period) => ({
      ...period,
      profitLoss: serializeObject(period.profitLoss),
      balanceSheet: serializeObject(period.balanceSheet),
      cashFlow: serializeObject(period.cashFlow),
    })),
    metrics: serializeObject(output.metrics),
    validation: serializeObject(output.validation),
    performance: output.performance,
    calculatedAt: output.calculatedAt.toISOString(),
  };
}

/**
 * Recursively serialize object, converting Decimal to string
 */
function serializeObject(obj: unknown): unknown {
  if (obj instanceof Decimal) {
    return obj.toString();
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeObject);
  }

  if (obj !== null && typeof obj === "object") {
    const serialized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      serialized[key] = serializeObject(value);
    }
    return serialized;
  }

  return obj;
}
