/**
 * POST /api/proposals/[id]/scenarios
 *
 * Real-time Scenario Analysis Endpoint (GAP 6)
 *
 * Accepts scenario variables (enrollment%, CPI%, tuition growth%, rent escalation%)
 * and recalculates 30-year projections in real-time.
 *
 * Performance Target: <200ms response time
 *
 * Request Body:
 * - enrollmentPercent: number (50-150)
 * - cpiPercent: number (0-10)
 * - tuitionGrowthPercent: number (0-15)
 * - rentEscalationPercent: number (0-10)
 *
 * Response:
 * - metrics: { totalRent, npv, totalEbitda, finalCash, maxDebt }
 * - comparisonToBaseline: { metric: { baseline, current, changePercent } }
 * - calculationTimeMs: number
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import Decimal from "decimal.js";
import { prisma } from "@/lib/prisma";
import { authenticateUserWithRole } from "@/middleware/auth";
import { Role, type Prisma } from "@prisma/client";
import { calculateFinancialProjections } from "@/lib/engine";
import type { CalculationEngineOutput } from "@/lib/engine/core/types";
import { calculateNPV } from "@/lib/engine/core/decimal-utils";
import {
  applyScenarioVariables,
  calculateMetricChange,
} from "@/lib/engine/scenario-modifier";
import type { ScenarioVariables } from "@/lib/engine/scenario-modifier";
import {
  reconstructCalculationInput as sharedReconstructCalculationInput,
  toNumber,
  type ProposalRecord,
} from "@/lib/proposals/reconstruct-calculation-input";

type StoredFinancialPeriod = {
  year: number;
  profitLoss: Record<string, unknown>;
  balanceSheet: Record<string, unknown>;
};

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const ScenarioVariablesSchema = z.object({
  enrollmentPercent: z.number().min(50).max(150),
  cpiPercent: z.number().min(0).max(10),
  tuitionGrowthPercent: z.number().min(0).max(15),
  rentEscalationPercent: z.number().min(0).max(10),
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

    // Parse and validate request body
    const body = await request.json();
    const validationResult = ScenarioVariablesSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid scenario variables",
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const variables: ScenarioVariables = validationResult.data;

    // Fetch proposal with baseline calculation input
    const proposal = await prisma.leaseProposal.findUnique({
      where: { id: proposalId },
    });

    if (!proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 },
      );
    }

    if (!proposal.financials || !proposal.metrics) {
      return NextResponse.json(
        {
          error: "Proposal has not been calculated yet",
          message: "Please run the initial calculation first",
        },
        { status: 400 },
      );
    }

    // Reconstruct baseline calculation input
    // We need to rebuild the full CalculationEngineInput from proposal data
    const baselineInput = await reconstructCalculationInput(proposal);

    // Apply scenario variables to create modified input
    const scenarioInput = applyScenarioVariables(baselineInput, variables);

    // Run calculation with modified input
    console.log(
      `🎯 Running scenario calculation for proposal ${proposalId}...`,
    );
    const calculationStartTime = performance.now();

    const result = await calculateFinancialProjections(scenarioInput);

    const calculationTimeMs = performance.now() - calculationStartTime;
    console.log(
      `✅ Scenario calculation completed in ${calculationTimeMs.toFixed(2)}ms`,
    );

    // Extract key metrics from scenario results
    const scenarioMetrics = extractScenarioMetrics(
      result,
      scenarioInput.systemConfig.debtInterestRate ?? new Decimal(0.1),
    );

    // Extract baseline metrics from stored proposal
    const baselineMetrics = extractBaselineMetrics(proposal);

    // Calculate comparison (baseline vs scenario)
    const comparison = compareMetrics(baselineMetrics, scenarioMetrics);

    const totalTimeMs = performance.now() - startTime;

    return NextResponse.json({
      success: true,
      variables,
      metrics: scenarioMetrics,
      baseline: baselineMetrics,
      comparison,
      performance: {
        totalTimeMs,
        calculationTimeMs,
        periodsCalculated: result.periods.length,
      },
    });
  } catch (error) {
    console.error("❌ Scenario calculation failed:", error);

    return NextResponse.json(
      {
        error: "Scenario calculation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Use the shared utility for reconstructing calculation input
const reconstructCalculationInput = sharedReconstructCalculationInput;

/**
 * Extract scenario metrics from calculation results
 */
function extractScenarioMetrics(
  result: CalculationEngineOutput,
  discountRate: Decimal,
) {
  const periods = result.periods;

  // Total rent across all periods
  const totalRent = periods.reduce((sum: Decimal, period) => {
    return sum.add(period.profitLoss.rentExpense);
  }, new Decimal(0));

  // Total EBITDA
  const totalEbitda = periods.reduce((sum: Decimal, period) => {
    return sum.add(period.profitLoss.ebitda);
  }, new Decimal(0));

  // Final cash
  const finalCash = periods[periods.length - 1].balanceSheet.cash;

  // Max debt
  const maxDebt = periods.reduce((max: Decimal, period) => {
    return period.balanceSheet.debtBalance.greaterThan(max)
      ? period.balanceSheet.debtBalance
      : max;
  }, new Decimal(0));

  // NPV based on net change in cash each period using provided discount rate
  const discount = discountRate || new Decimal(0.1);
  const cashFlows = periods.map((period) => period.cashFlow.netChangeInCash);
  const npv = calculateNPV(cashFlows, discount);

  return {
    totalRent: totalRent.toFixed(2),
    npv: npv.toFixed(2),
    totalEbitda: totalEbitda.toFixed(2),
    finalCash: finalCash.toFixed(2),
    maxDebt: maxDebt.toFixed(2),
  };
}

const normalizeStoredPeriods = (
  financials: Prisma.JsonValue,
): StoredFinancialPeriod[] => {
  if (!Array.isArray(financials)) return [];

  return financials
    .map((period) =>
      typeof period === "object" && period !== null
        ? (period as Record<string, unknown>)
        : null,
    )
    .filter((period): period is Record<string, unknown> => period !== null)
    .map((period) => ({
      year:
        typeof period.year === "number" ? period.year : toNumber(period.year),
      profitLoss:
        period.profitLoss && typeof period.profitLoss === "object"
          ? (period.profitLoss as Record<string, unknown>)
          : {},
      balanceSheet:
        period.balanceSheet && typeof period.balanceSheet === "object"
          ? (period.balanceSheet as Record<string, unknown>)
          : {},
    }));
};

/**
 * Extract baseline metrics from stored proposal
 */
function extractBaselineMetrics(proposal: ProposalRecord) {
  // Metrics are already stored in the proposal
  const metrics =
    proposal.metrics &&
    typeof proposal.metrics === "object" &&
    !Array.isArray(proposal.metrics)
      ? (proposal.metrics as Record<string, unknown>)
      : {};
  const periods = normalizeStoredPeriods(proposal.financials);

  // Calculate what we need from stored data
  const totalRent = periods.reduce((sum, period) => {
    return sum + toNumber(period.profitLoss["rentExpense"]);
  }, 0);

  const totalEbitda = periods.reduce((sum, period) => {
    return sum + toNumber(period.profitLoss["ebitda"]);
  }, 0);

  return {
    totalRent: totalRent.toFixed(2),
    npv: "0.00", // TODO
    totalEbitda: totalEbitda.toFixed(2),
    finalCash: String(metrics.finalCash ?? "0"),
    maxDebt: String(metrics.peakDebt ?? "0"),
  };
}

/**
 * Compare baseline and scenario metrics
 */
function compareMetrics(
  baseline: Record<string, string>,
  scenario: Record<string, string>,
) {
  const comparison: Record<
    string,
    {
      baseline: string;
      current: string;
      absoluteChange: string;
      percentChange: string;
    }
  > = {};

  for (const key in baseline) {
    const baselineValue = new Decimal(baseline[key]);
    const scenarioValue = new Decimal(scenario[key]);

    const change = calculateMetricChange(baselineValue, scenarioValue);

    comparison[key] = {
      baseline: baseline[key],
      current: scenario[key],
      absoluteChange: change.absolute.toFixed(2),
      percentChange: change.percent.toFixed(2),
    };
  }

  return comparison;
}
