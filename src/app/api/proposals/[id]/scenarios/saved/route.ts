/**
 * Saved Scenarios API Endpoint
 *
 * GET /api/proposals/[id]/scenarios/saved - List all saved scenarios
 * POST /api/proposals/[id]/scenarios/saved - Save a new scenario
 * DELETE /api/proposals/[id]/scenarios/saved?scenarioId=xxx - Delete a scenario
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import Decimal from "decimal.js";
import { prisma } from "@/lib/prisma";
import { authenticateUserWithRole } from "@/middleware/auth";
import { Role } from "@prisma/client";

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const SaveScenarioSchema = z.object({
  name: z.string().min(1).max(100),
  enrollmentPercent: z.number().min(50).max(150),
  cpiPercent: z.number().min(0).max(10),
  tuitionGrowthPercent: z.number().min(0).max(15),
  rentEscalationPercent: z.number().min(0).max(10),
  metrics: z.object({
    totalRent: z.string(),
    npv: z.string().optional(),
    totalEbitda: z.string(),
    finalCash: z.string(),
    maxDebt: z.string(),
  }),
});

// ============================================================================
// GET - List all saved scenarios for a proposal
// ============================================================================

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await authenticateUserWithRole([
    Role.ADMIN,
    Role.PLANNER,
    Role.VIEWER,
  ]);
  if (!authResult.success) return authResult.error;

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

    // Fetch all scenarios for this proposal
    const scenarios = await prisma.scenario.findMany({
      where: { proposalId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      scenarios: scenarios.map((s) => ({
        id: s.id,
        name: s.name,
        createdAt: s.createdAt,
        createdBy: s.creator,
        variables: {
          enrollmentPercent: s.enrollmentPercent.toNumber(),
          cpiPercent: s.cpiPercent.toNumber(),
          tuitionGrowthPercent: s.tuitionGrowthPercent.toNumber(),
          rentEscalationPercent: s.rentEscalationPercent.toNumber(),
        },
        metrics: {
          totalRent: s.totalRent?.toString(),
          npv: s.npv?.toString(),
          totalEbitda: s.totalEbitda?.toString(),
          finalCash: s.finalCash?.toString(),
          maxDebt: s.maxDebt?.toString(),
        },
      })),
    });
  } catch (error) {
    console.error("Error fetching saved scenarios:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved scenarios" },
      { status: 500 },
    );
  }
}

// ============================================================================
// POST - Save a new scenario
// ============================================================================

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await authenticateUserWithRole([Role.ADMIN, Role.PLANNER]);
  if (!authResult.success) return authResult.error;

  const { user } = authResult;

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

    // Check if proposal exists
    const proposal = await prisma.leaseProposal.findUnique({
      where: { id: proposalId },
    });

    if (!proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 },
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = SaveScenarioSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid scenario data",
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const data = validationResult.data;

    // Create scenario
    const scenario = await prisma.scenario.create({
      data: {
        proposalId,
        createdBy: user.id,
        name: data.name,
        enrollmentPercent: new Decimal(data.enrollmentPercent),
        cpiPercent: new Decimal(data.cpiPercent),
        tuitionGrowthPercent: new Decimal(data.tuitionGrowthPercent),
        rentEscalationPercent: new Decimal(data.rentEscalationPercent),
        totalRent: data.metrics.totalRent
          ? new Decimal(data.metrics.totalRent)
          : null,
        npv: data.metrics.npv ? new Decimal(data.metrics.npv) : null,
        totalEbitda: data.metrics.totalEbitda
          ? new Decimal(data.metrics.totalEbitda)
          : null,
        finalCash: data.metrics.finalCash
          ? new Decimal(data.metrics.finalCash)
          : null,
        maxDebt: data.metrics.maxDebt
          ? new Decimal(data.metrics.maxDebt)
          : null,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        scenario: {
          id: scenario.id,
          name: scenario.name,
          createdAt: scenario.createdAt,
          createdBy: scenario.creator,
          variables: {
            enrollmentPercent: scenario.enrollmentPercent.toNumber(),
            cpiPercent: scenario.cpiPercent.toNumber(),
            tuitionGrowthPercent: scenario.tuitionGrowthPercent.toNumber(),
            rentEscalationPercent: scenario.rentEscalationPercent.toNumber(),
          },
          metrics: {
            totalRent: scenario.totalRent?.toString(),
            npv: scenario.npv?.toString(),
            totalEbitda: scenario.totalEbitda?.toString(),
            finalCash: scenario.finalCash?.toString(),
            maxDebt: scenario.maxDebt?.toString(),
          },
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error saving scenario:", error);
    return NextResponse.json(
      { error: "Failed to save scenario" },
      { status: 500 },
    );
  }
}

// ============================================================================
// DELETE - Delete a saved scenario
// ============================================================================

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await authenticateUserWithRole([Role.ADMIN, Role.PLANNER]);
  if (!authResult.success) return authResult.error;

  try {
    const { id: proposalId } = await params;
    const { searchParams } = new URL(request.url);
    const scenarioId = searchParams.get("scenarioId");

    if (!scenarioId) {
      return NextResponse.json(
        { error: "scenarioId query parameter is required" },
        { status: 400 },
      );
    }

    // Validate UUIDs
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(proposalId) || !uuidRegex.test(scenarioId)) {
      return NextResponse.json({ error: "Invalid UUID" }, { status: 400 });
    }

    // Check if scenario exists and belongs to this proposal
    const scenario = await prisma.scenario.findUnique({
      where: { id: scenarioId },
    });

    if (!scenario) {
      return NextResponse.json(
        { error: "Scenario not found" },
        { status: 404 },
      );
    }

    if (scenario.proposalId !== proposalId) {
      return NextResponse.json(
        { error: "Scenario does not belong to this proposal" },
        { status: 403 },
      );
    }

    // Delete scenario
    await prisma.scenario.delete({
      where: { id: scenarioId },
    });

    return NextResponse.json({
      success: true,
      message: "Scenario deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting scenario:", error);
    return NextResponse.json(
      { error: "Failed to delete scenario" },
      { status: 500 },
    );
  }
}
