import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateUserWithRole } from "@/middleware/auth";
import { Role } from "@prisma/client";

type DashboardProposal = {
  id: string;
  name: string;
  developer: string | null;
  rentModel: string;
  metrics: unknown;
  financials: unknown;
};

type KPIResponse = {
  totalCost: string;
  avgNPV: string;
  avgIRR: string;
  avgPayback: string;
};

type RentTrajectoryPoint = {
  year: number;
  rent: number;
};

type RentTrajectorySeries = {
  proposalId: string;
  proposalName: string;
  developer: string;
  rentModel: string;
  data: RentTrajectoryPoint[];
  isWinner: boolean;
};

type CostBreakdownEntry = {
  proposalId: string;
  proposalName: string;
  developer: string;
  rent: string;
  staff: string;
  otherOpex: string;
};

type CashFlowEntry = {
  year: number;
  netCashFlow: number;
  cumulative: number;
};

type CashFlowSeries = {
  proposalId: string;
  proposalName: string;
  developer: string;
  data: CashFlowEntry[];
};

type FinancialPeriodSnapshot = {
  year: number;
  profitLoss?: Record<string, unknown>;
  cashFlow?: Record<string, unknown>;
};

// Allow dashboard to render in local/test environments only when explicitly enabled
const allowNonProdBypass =
  process.env.NODE_ENV !== "production" &&
  process.env.BYPASS_DASHBOARD_AUTH === "true";

const parseNumber = (value: unknown): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const normalizeFinancials = (
  financials: unknown,
): FinancialPeriodSnapshot[] => {
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
        typeof period.year === "number"
          ? period.year
          : parseNumber(period.year),
      profitLoss:
        period.profitLoss && typeof period.profitLoss === "object"
          ? (period.profitLoss as Record<string, unknown>)
          : undefined,
      cashFlow:
        period.cashFlow && typeof period.cashFlow === "object"
          ? (period.cashFlow as Record<string, unknown>)
          : undefined,
    }));
};

/**
 * Dashboard Metrics API Endpoint
 *
 * Aggregates metrics across all proposals for the Analytics Dashboard
 * Provides:
 * - KPI summary (Total Cost, Average NPV, Average IRR, Average Payback)
 * - Rent trajectory data (all proposals by year)
 * - Cost breakdown data (Rent, Staff, Other OpEx)
 * - Cash flow data (cumulative by year)
 * - Sensitivity data (from saved analyses)
 */
export async function GET(_request: Request) {
  try {
    // Check auth - allow all authenticated roles to view dashboard
    const authResult = await authenticateUserWithRole([
      Role.ADMIN,
      Role.PLANNER,
      Role.VIEWER,
    ]);

    // In non-production we still want the dashboard to render for demos/tests even if auth isn't set up
    if (!authResult.success) {
      if (allowNonProdBypass) {
        console.warn(
          "Dashboard metrics: auth check failed, bypassing in non-production environment",
        );
      } else {
        return authResult.error;
      }
    }

    // Fetch all calculated proposals
    const proposals = await prisma.leaseProposal.findMany({
      where: {
        calculatedAt: {
          not: null,
        },
      },
      select: {
        id: true,
        name: true,
        developer: true,
        rentModel: true,
        metrics: true,
        financials: true,
      },
    });

    if (proposals.length === 0) {
      return NextResponse.json({
        isEmpty: true,
        message: "No calculated proposals found",
      });
    }

    // Aggregate KPIs
    const typedProposals = proposals as DashboardProposal[];

    const kpis = calculateKPIs(typedProposals);

    // Extract rent trajectory data
    const rentTrajectory = extractRentTrajectory(typedProposals);

    // Extract cost breakdown data
    const costBreakdown = extractCostBreakdown(typedProposals);

    // Extract cash flow data
    const cashFlow = extractCashFlow(typedProposals);

    // Get sensitivity data
    const sensitivity = await extractSensitivityData();

    return NextResponse.json({
      isEmpty: false,
      kpis,
      rentTrajectory,
      costBreakdown,
      cashFlow,
      sensitivity,
      proposalCount: proposals.length,
    });
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;

    // In dev/test, return a harmless empty payload so the page doesn't crash
    if (allowNonProdBypass) {
      console.warn(
        "Dashboard metrics fallback: returning empty dataset due to error in non-production environment",
      );

      return NextResponse.json({
        isEmpty: true,
        kpis: {
          totalCost: "0",
          avgNPV: "0",
          avgIRR: "0",
          avgPayback: "0",
        },
        rentTrajectory: [],
        costBreakdown: [],
        cashFlow: [],
        sensitivity: [],
        proposalCount: 0,
        error: "Dashboard data unavailable",
        details:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
      });
    }

    return NextResponse.json(
      {
        error: "Failed to fetch dashboard metrics",
        details:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
        stack: process.env.NODE_ENV === "development" ? errorStack : undefined,
      },
      { status: 500 },
    );
  }
}

function calculateKPIs(proposals: DashboardProposal[]): KPIResponse {
  let totalCost = 0;
  let totalNPV = 0;
  let totalIRR = 0;
  let totalPayback = 0;
  let npvCount = 0;
  let irrCount = 0;
  let paybackCount = 0;

  proposals.forEach((proposal) => {
    if (
      !proposal.metrics ||
      typeof proposal.metrics !== "object" ||
      Array.isArray(proposal.metrics)
    ) {
      return;
    }

    const metrics = proposal.metrics as Record<string, unknown>;

    const totalRent = parseNumber(metrics.totalRent);
    if (totalRent !== 0) {
      totalCost += totalRent;
    }

    const npv = parseNumber(metrics.npv);
    if (npv !== 0) {
      totalNPV += npv;
      npvCount++;
    }

    const irr = parseNumber(metrics.irr);
    if (irr !== 0) {
      totalIRR += irr;
      irrCount++;
    }

    const payback = parseNumber(metrics.paybackPeriod);
    if (payback !== 0) {
      totalPayback += payback;
      paybackCount++;
    }
  });

  return {
    totalCost: totalCost.toFixed(2),
    avgNPV: npvCount > 0 ? (totalNPV / npvCount).toFixed(2) : "0",
    avgIRR: irrCount > 0 ? (totalIRR / irrCount).toFixed(2) : "0",
    avgPayback:
      paybackCount > 0 ? (totalPayback / paybackCount).toFixed(2) : "0",
  };
}

function extractRentTrajectory(
  proposals: DashboardProposal[],
): RentTrajectorySeries[] {
  const trajectories: RentTrajectorySeries[] = [];

  // Find the winner (highest NPV)
  let winnerProposalId: string | null = null;
  let highestNPV = -Infinity;

  proposals.forEach((proposal) => {
    if (
      proposal.metrics &&
      typeof proposal.metrics === "object" &&
      !Array.isArray(proposal.metrics)
    ) {
      const metrics = proposal.metrics as Record<string, unknown>;
      const npv = parseNumber(metrics.npv);
      if (Number.isFinite(npv) && npv > highestNPV) {
        highestNPV = npv;
        winnerProposalId = proposal.id;
      }
    }
  });

  proposals.forEach((proposal) => {
    const financials = normalizeFinancials(proposal.financials);
    if (financials.length === 0) return;

    const rentByYear = financials.map<RentTrajectoryPoint>((period) => ({
      year: period.year,
      rent: parseNumber(period.profitLoss?.["rentExpense"]),
    }));

    trajectories.push({
      proposalId: proposal.id,
      proposalName: proposal.name,
      developer: proposal.developer ?? "Unknown",
      rentModel: proposal.rentModel,
      data: rentByYear,
      isWinner: proposal.id === winnerProposalId,
    });
  });

  return trajectories;
}

function extractCostBreakdown(
  proposals: DashboardProposal[],
): CostBreakdownEntry[] {
  const breakdown: CostBreakdownEntry[] = [];

  proposals.forEach((proposal) => {
    const financials = normalizeFinancials(proposal.financials);
    if (financials.length === 0) return;

    let totalRent = 0;
    let totalStaff = 0;
    let totalOtherOpex = 0;

    financials.forEach((period) => {
      const profitLoss = period.profitLoss ?? {};
      totalRent += parseNumber(profitLoss["rentExpense"]);
      totalStaff += parseNumber(profitLoss["staffCosts"]);
      totalOtherOpex += parseNumber(profitLoss["otherOpex"]);
    });

    breakdown.push({
      proposalId: proposal.id,
      proposalName: proposal.name,
      developer: proposal.developer ?? "Unknown",
      rent: totalRent.toFixed(2),
      staff: totalStaff.toFixed(2),
      otherOpex: totalOtherOpex.toFixed(2),
    });
  });

  return breakdown;
}

function extractCashFlow(proposals: DashboardProposal[]): CashFlowSeries[] {
  const cashFlows: CashFlowSeries[] = [];

  proposals.forEach((proposal) => {
    const financials = normalizeFinancials(proposal.financials);
    if (financials.length === 0) return;

    let cumulative = 0;
    const data = financials.map<CashFlowEntry>((period) => {
      const netCashFlow = parseNumber(period.cashFlow?.["netChangeInCash"]);
      cumulative += netCashFlow;

      return {
        year: period.year,
        netCashFlow,
        cumulative,
      };
    });

    cashFlows.push({
      proposalId: proposal.id,
      proposalName: proposal.name,
      developer: proposal.developer ?? "Unknown",
      data,
    });
  });

  return cashFlows;
}

async function extractSensitivityData() {
  try {
    // Get all sensitivity analyses
    const analyses = await prisma.sensitivityAnalysis.findMany({
      take: 10, // Limit to recent analyses
      orderBy: {
        createdAt: "desc",
      },
      include: {
        proposal: {
          select: {
            name: true,
            developer: true,
          },
        },
      },
    });

    return analyses.map((analysis) => ({
      id: analysis.id,
      proposalName: analysis.proposal.name,
      developer: analysis.proposal.developer,
      variable: analysis.variable,
      metric: analysis.impactMetric,
      dataPoints: analysis.dataPoints,
    }));
  } catch (error) {
    console.error("Error fetching sensitivity data:", error);
    return [];
  }
}
