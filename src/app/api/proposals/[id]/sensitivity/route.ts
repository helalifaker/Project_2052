/**
 * POST /api/proposals/[id]/sensitivity
 *
 * Sensitivity Analysis Endpoint (GAP 7)
 *
 * Runs formal sensitivity analysis by varying a single variable across a range
 * and measuring the impact on a selected metric.
 *
 * Performance Target: <2 seconds for full range analysis
 *
 * Request Body:
 * - variable: string (enrollment | tuitionGrowth | cpi | rentEscalation | staffCosts | otherOpex)
 * - rangePercent: number (e.g., 20 for ±20%)
 * - metric: string (npv | totalRent | ebitda | irr | payback | maxDebt)
 * - dataPoints: number (optional, default 5)
 *
 * Response:
 * - variable: string
 * - metric: string
 * - baselineMetricValue: string
 * - dataPoints: array of { variableValue, variablePercent, metricValue }
 * - impact: { positiveDeviation, negativeDeviation, totalImpact }
 * - performance: { totalTimeMs }
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authenticateUserWithRole } from "@/middleware/auth";
import { Role } from "@/lib/types/roles";
import {
  runSensitivityAnalysis,
  runMultiVariableSensitivity,
} from "@/lib/engine/sensitivity-analyzer";
import type {
  SensitivityVariable,
  SensitivityMetric,
  SensitivityConfig,
} from "@/lib/engine/sensitivity-analyzer";
import { reconstructCalculationInput as sharedReconstructCalculationInput } from "@/lib/proposals/reconstruct-calculation-input";

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const SensitivityRequestSchema = z.object({
  variable: z.enum([
    "enrollment",
    "tuitionGrowth",
    "cpi",
    "rentEscalation",
    "staffCosts",
    "otherOpex",
  ]),
  rangePercent: z.number().min(5).max(50),
  metric: z.enum([
    "npv",
    "totalRent",
    "ebitda",
    "irr",
    "payback",
    "maxDebt",
    "finalCash",
  ]),
  dataPoints: z.number().min(3).max(11).optional(),
});

const TornadoRequestSchema = z.object({
  variables: z
    .array(
      z.enum([
        "enrollment",
        "tuitionGrowth",
        "cpi",
        "rentEscalation",
        "staffCosts",
        "otherOpex",
      ]),
    )
    .min(1),
  rangePercent: z.number().min(5).max(50),
  metric: z.enum([
    "npv",
    "totalRent",
    "ebitda",
    "irr",
    "payback",
    "maxDebt",
    "finalCash",
  ]),
});

// ============================================================================
// API HANDLER
// ============================================================================

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // Auth check
  const authResult = await authenticateUserWithRole([
    Role.ADMIN,
    Role.PLANNER,
    Role.VIEWER,
  ]);
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

    // Parse request body
    const body = await request.json();

    // Check if this is a tornado chart request (multiple variables)
    const isTornadoRequest = body.variables !== undefined;

    if (isTornadoRequest) {
      // Validate tornado request
      const validationResult = TornadoRequestSchema.safeParse(body);

      if (!validationResult.success) {
        return NextResponse.json(
          {
            error: "Invalid sensitivity request",
            details: validationResult.error.issues,
          },
          { status: 400 },
        );
      }

      const data = validationResult.data;

      // Fetch and reconstruct baseline input
      const proposal = await fetchProposal(proposalId);
      const baselineInput = await reconstructCalculationInput(proposal);

      // Run multi-variable sensitivity analysis
      console.log(
        `🎯 Running tornado analysis for ${data.variables.length} variables...`,
      );

      const results = await runMultiVariableSensitivity(
        baselineInput,
        data.variables as SensitivityVariable[],
        data.rangePercent,
        data.metric as SensitivityMetric,
      );

      const totalTimeMs = performance.now() - startTime;

      return NextResponse.json({
        success: true,
        type: "tornado",
        metric: data.metric,
        rangePercent: data.rangePercent,
        results,
        performance: {
          totalTimeMs,
          averageTimePerVariable: totalTimeMs / data.variables.length,
        },
      });
    } else {
      // Single variable sensitivity analysis
      const validationResult = SensitivityRequestSchema.safeParse(body);

      if (!validationResult.success) {
        return NextResponse.json(
          {
            error: "Invalid sensitivity request",
            details: validationResult.error.issues,
          },
          { status: 400 },
        );
      }

      const data = validationResult.data;

      // Fetch and reconstruct baseline input
      const proposal = await fetchProposal(proposalId);
      const baselineInput = await reconstructCalculationInput(proposal);

      // Create sensitivity config
      const config: SensitivityConfig = {
        variable: data.variable as SensitivityVariable,
        rangePercent: data.rangePercent,
        dataPoints: data.dataPoints || 5,
        metric: data.metric as SensitivityMetric,
      };

      // Run sensitivity analysis
      console.log(
        `🎯 Running sensitivity analysis: ${config.variable} → ${config.metric}...`,
      );

      const result = await runSensitivityAnalysis(baselineInput, config);

      const totalTimeMs = performance.now() - startTime;

      return NextResponse.json({
        success: true,
        type: "single",
        result,
        performance: {
          totalTimeMs,
        },
      });
    }
  } catch (error) {
    console.error("❌ Sensitivity analysis failed:", error);

    return NextResponse.json(
      {
        error: "Sensitivity analysis failed",
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
 * Fetch proposal and check if calculated
 */
async function fetchProposal(proposalId: string) {
  const proposal = await prisma.leaseProposal.findUnique({
    where: { id: proposalId },
  });

  if (!proposal) {
    throw new Error("Proposal not found");
  }

  if (!proposal.financials || !proposal.metrics) {
    throw new Error(
      "Proposal has not been calculated yet. Please run the initial calculation first.",
    );
  }

  return proposal;
}

// Use the shared utility for reconstructing calculation input
const reconstructCalculationInput = sharedReconstructCalculationInput;
