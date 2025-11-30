import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateUserWithRole } from "@/middleware/auth";
import { Role } from "@prisma/client";
import Decimal from "decimal.js";
import { calculateNPV } from "@/lib/utils/financial";
import {
  calculateComparisonInsights,
  extractProfitabilityWaterfall,
  type ProposalMetrics,
  type ComparisonInsights,
  type ProfitabilityWaterfallData,
} from "@/lib/utils/comparison";

type DashboardProposal = {
  id: string;
  name: string;
  developer: string | null;
  rentModel: string;
  metrics: unknown;
  financials: unknown;
  contractPeriodYears: number | null;
};

type KPIResponse = {
  totalContractRent: string;
  avgRentNPV: string;
  totalContractEBITDA: string;
  avgFinalCash: string;
  totalContractCapEx: string;
  discountRate: string;
  avgNAV: string; // Net Annualized Value (KEY METRIC)
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

type AverageCostData = {
  proposalId: string;
  proposalName: string;
  developer: string;
  contractPeriodYears: number;
  avgAnnualRent: number;
  avgAnnualStaff: number;
  avgAnnualOther: number;
  totalAvgAnnual: number;
  isWinner: boolean;
};

type NPVComparisonData = {
  proposalId: string;
  proposalName: string;
  developer: string;
  npv: number;
  isWinner: boolean;
};

type NAVComparisonData = {
  proposalId: string;
  proposalName: string;
  developer: string;
  nav: number;
  navPercentile: number;
  isWinner: boolean;
};

type CashFlowComparisonData = {
  proposalId: string;
  proposalName: string;
  developer: string;
  data: Array<{ year: number; cumulative: number }>;
  breakevenYear: number | null;
  lowestCashYear: number;
  peakCashYear: number;
  finalCash: number;
  isWinner: boolean;
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
  balanceSheet?: Record<string, unknown>;
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

const parseDecimal = (value: unknown): Decimal => {
  if (value instanceof Decimal) return value;
  if (typeof value === "number") return new Decimal(value);
  if (typeof value === "string") {
    try {
      return new Decimal(value);
    } catch {
      return new Decimal(0);
    }
  }
  return new Decimal(0);
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
      balanceSheet:
        period.balanceSheet && typeof period.balanceSheet === "object"
          ? (period.balanceSheet as Record<string, unknown>)
          : undefined,
    }));
};

const getContractPeriodFinancials = (
  financials: FinancialPeriodSnapshot[],
  contractPeriodYears: number,
): FinancialPeriodSnapshot[] => {
  const endYear = 2028 + contractPeriodYears - 1; // 2052 or 2057
  return financials.filter((p) => p.year >= 2028 && p.year <= endYear);
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

    // Fetch SystemConfig for discount rate
    const systemConfig = await prisma.systemConfig.findFirst({
      orderBy: { confirmedAt: "desc" },
    });
    const discountRate =
      systemConfig?.discountRate || new Decimal(0.08);

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
        contractPeriodYears: true,
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

    const kpis = await calculateContractPeriodKPIs(
      typedProposals,
      discountRate,
    );

    // Build proposal metrics for comparison insights
    const proposalMetrics: ProposalMetrics[] = typedProposals.map((p) => {
      const metrics = p.metrics as Record<string, unknown> | null;
      return {
        id: p.id,
        name: p.name,
        developer: p.developer,
        totalRent: parseNumber(metrics?.totalRent),
        npv: parseNumber(metrics?.npv),
        irr: parseNumber(metrics?.irr),
        totalEbitda: parseNumber(metrics?.totalEbitda),
        avgEbitda: parseNumber(metrics?.avgEbitda),
        npvEbitda: parseNumber(metrics?.contractEbitdaNPV),
        nav: parseNumber(metrics?.contractNAV),
        finalCash: parseNumber(metrics?.finalCash),
        maxDebt: parseNumber(metrics?.maxDebt),
        peakDebt: parseNumber(metrics?.peakDebt),
        contractPeriodYears: p.contractPeriodYears ?? 25,
      };
    });

    // Calculate comparison insights
    const insights = calculateComparisonInsights(proposalMetrics);

    // Extract rent trajectory data
    const rentTrajectory = extractRentTrajectory(typedProposals);

    // Extract cost breakdown data (DEPRECATED - use avgAnnualCosts instead)
    const costBreakdown = extractCostBreakdown(typedProposals);

    // Extract average annual cost data (NEW)
    const avgAnnualCosts = extractAverageAnnualCosts(typedProposals, insights);

    // Extract NPV comparison data (NEW)
    const npvComparison = extractNPVComparison(typedProposals, insights);

    // Extract NAV comparison data (NEW - KEY METRIC)
    const navComparison = extractNAVComparison(typedProposals, insights);

    // Extract profitability waterfall data (NEW)
    const profitabilityWaterfall = await extractProfitabilityWaterfallData(
      typedProposals,
      insights,
    );

    // Extract cash flow data
    const cashFlow = extractCashFlow(typedProposals);

    // Extract cash flow comparison data (NEW)
    const cashFlowComparison = extractCashFlowComparison(
      typedProposals,
      insights,
    );

    // Get sensitivity data (DEPRECATED - removed from dashboard)
    const sensitivity = await extractSensitivityData();

    // Detect contract end year from proposals
    const contractEndYear = detectContractEndYear(typedProposals);

    return NextResponse.json({
      isEmpty: false,
      insights,
      kpis,
      rentTrajectory,
      costBreakdown, // Keep for backward compatibility
      avgAnnualCosts,
      npvComparison,
      navComparison, // KEY METRIC for comparing different contract lengths
      profitabilityWaterfall,
      cashFlow, // Keep for existing components
      cashFlowComparison,
      sensitivity, // Keep for backward compatibility
      proposalCount: proposals.length,
      contractEndYear,
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
          avgNAV: "0",
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

/**
 * Calculate KPIs focused on the contract period (2028-2052 or 2028-2057)
 * Includes rent NPV calculation using admin discount rate
 */
async function calculateContractPeriodKPIs(
  proposals: DashboardProposal[],
  discountRate: Decimal,
): Promise<KPIResponse> {
  let totalContractRent = new Decimal(0);
  let totalRentNPV = new Decimal(0);
  let totalContractEBITDA = new Decimal(0);
  let totalFinalCash = new Decimal(0);
  let totalNAV = new Decimal(0); // Aggregate NAV across proposals

  proposals.forEach((proposal) => {
    const contractPeriodYears = proposal.contractPeriodYears || 30;
    const contractFinancials = getContractPeriodFinancials(
      normalizeFinancials(proposal.financials),
      contractPeriodYears,
    );

    // Sum rent and EBITDA for contract period
    contractFinancials.forEach((period) => {
      const rentExpense = parseDecimal(period.profitLoss?.["rentExpense"]);
      totalContractRent = totalContractRent.plus(rentExpense);

      const ebitda = parseDecimal(period.profitLoss?.["ebitda"]);
      totalContractEBITDA = totalContractEBITDA.plus(ebitda);
    });

    // Calculate rent NPV (rent as negative cash flows for NPV)
    const rentCashFlows = contractFinancials.map((p) =>
      parseDecimal(p.profitLoss?.["rentExpense"]).neg(),
    );
    const rentNPV = calculateNPV(rentCashFlows, discountRate);
    totalRentNPV = totalRentNPV.plus(rentNPV);

    // Final cash (last period of full projection)
    const allFinancials = normalizeFinancials(proposal.financials);
    const lastPeriod = allFinancials[allFinancials.length - 1];
    const finalCash = parseDecimal(lastPeriod?.balanceSheet?.["cash"]);
    totalFinalCash = totalFinalCash.plus(finalCash);

    // Extract NAV from proposal metrics
    if (proposal.metrics && typeof proposal.metrics === "object" && !Array.isArray(proposal.metrics)) {
      const metrics = proposal.metrics as Record<string, unknown>;
      const nav = parseDecimal(metrics.contractNAV);
      totalNAV = totalNAV.plus(nav);
    }
  });

  // Query CapEx from database for contract period
  const capexSum = await prisma.capExAsset.aggregate({
    where: {
      proposalId: { in: proposals.map((p) => p.id) },
      purchaseYear: { gte: 2028 },
    },
    _sum: { purchaseAmount: true },
  });
  const totalContractCapEx = new Decimal(
    capexSum._sum.purchaseAmount?.toString() || "0",
  );

  const count = proposals.length;

  return {
    totalContractRent: totalContractRent.toFixed(2),
    avgRentNPV: count > 0 ? totalRentNPV.dividedBy(count).toFixed(2) : "0",
    totalContractEBITDA: totalContractEBITDA.toFixed(2),
    avgFinalCash: count > 0 ? totalFinalCash.dividedBy(count).toFixed(2) : "0",
    totalContractCapEx: totalContractCapEx.toFixed(2),
    discountRate: discountRate.times(100).toFixed(2),
    avgNAV: count > 0 ? totalNAV.dividedBy(count).toFixed(2) : "0",
  };
}



/**
 * Extract average annual cost data for fair comparison
 * Accounts for different contract periods (25Y vs 30Y)
 */
function extractAverageAnnualCosts(
  proposals: DashboardProposal[],
  insights: ComparisonInsights,
): AverageCostData[] {
  return proposals.map((proposal) => {
    const financials = normalizeFinancials(proposal.financials);
    const contractPeriodYears = proposal.contractPeriodYears || 25;

    // Calculate totals for contract period (2028 to 2028 + contractPeriodYears - 1)
    const contractStartYear = 2028;
    const contractEndYear = contractStartYear + contractPeriodYears - 1;

    const contractFinancials = financials.filter(
      f => f.year >= contractStartYear && f.year <= contractEndYear
    );

    let totalRent = 0;
    let totalStaff = 0;
    let totalOtherOpex = 0;

    contractFinancials.forEach((period) => {
      const profitLoss = period.profitLoss ?? {};
      totalRent += parseNumber(profitLoss["rentExpense"]);
      totalStaff += parseNumber(profitLoss["staffCosts"]);
      totalOtherOpex += parseNumber(profitLoss["otherOpex"]);
    });

    // Calculate averages
    const avgAnnualRent = totalRent / contractPeriodYears;
    const avgAnnualStaff = totalStaff / contractPeriodYears;
    const avgAnnualOther = totalOtherOpex / contractPeriodYears;
    const totalAvgAnnual = avgAnnualRent + avgAnnualStaff + avgAnnualOther;

    // Determine if this is the winner (lowest total average annual cost)
    const isWinner = insights.rent.winnerId === proposal.id;

    return {
      proposalId: proposal.id,
      proposalName: proposal.name,
      developer: proposal.developer ?? "Unknown",
      contractPeriodYears,
      avgAnnualRent,
      avgAnnualStaff,
      avgAnnualOther,
      totalAvgAnnual,
      isWinner,
    };
  });
}

/**
 * Extract NPV comparison data for horizontal bar chart
 */
function extractNPVComparison(
  proposals: DashboardProposal[],
  insights: ComparisonInsights,
): NPVComparisonData[] {
  return proposals.map((proposal) => {
    const metrics = proposal.metrics as Record<string, unknown> | null;
    const npv = parseNumber(metrics?.npv);
    const isWinner = insights.npv.winnerId === proposal.id;

    return {
      proposalId: proposal.id,
      proposalName: proposal.name,
      developer: proposal.developer ?? "Unknown",
      npv,
      isWinner,
    };
  }).sort((a, b) => b.npv - a.npv); // Sort by NPV descending
}

/**
 * Extract NAV comparison data for horizontal bar chart
 * NAV = Net Annualized Value (Annual EBITDA - Annual Rent)
 * KEY METRIC for comparing proposals with different contract lengths
 */
function extractNAVComparison(
  proposals: DashboardProposal[],
  insights: ComparisonInsights,
): NAVComparisonData[] {
  const sorted = proposals
    .map((proposal) => {
      const metrics = proposal.metrics as Record<string, unknown> | null;
      const nav = parseNumber(metrics?.contractNAV);
      const isWinner = insights.nav.winnerId === proposal.id;

      return {
        proposalId: proposal.id,
        proposalName: proposal.name,
        developer: proposal.developer ?? "Unknown",
        nav,
        isWinner,
      };
    })
    .sort((a, b) => b.nav - a.nav); // Sort by NAV descending

  // Calculate percentile rankings
  return sorted.map((item, index) => ({
    ...item,
    navPercentile: ((sorted.length - index) / sorted.length) * 100,
  }));
}

/**
 * Extract profitability waterfall data for each proposal
 */
async function extractProfitabilityWaterfallData(
  proposals: DashboardProposal[],
  insights: ComparisonInsights,
): Promise<ProfitabilityWaterfallData[]> {
  const waterfallData: ProfitabilityWaterfallData[] = [];

  for (const proposal of proposals) {
    const financials = normalizeFinancials(proposal.financials);
    const contractPeriodYears = proposal.contractPeriodYears || 25;

    // Convert to format expected by extractProfitabilityWaterfall
    const proposalWithFinancials = {
      ...proposal,
      contractPeriodYears, // Use the non-null value
      financials: financials.map(f => ({
        year: f.year,
        profitLoss: {
          totalRevenue: parseNumber(f.profitLoss?.["totalRevenue"]),
          rentExpense: parseNumber(f.profitLoss?.["rentExpense"]),
          staffCosts: parseNumber(f.profitLoss?.["staffCosts"]),
          otherOpex: parseNumber(f.profitLoss?.["otherOpex"]),
          ebitda: parseNumber(f.profitLoss?.["ebitda"]),
          depreciation: parseNumber(f.profitLoss?.["depreciation"]),
          ebit: parseNumber(f.profitLoss?.["ebit"]),
          interestIncome: parseNumber(f.profitLoss?.["interestIncome"]),
          interestExpense: parseNumber(f.profitLoss?.["interestExpense"]),
          zakatExpense: parseNumber(f.profitLoss?.["zakatExpense"]),
          netIncome: parseNumber(f.profitLoss?.["netIncome"]),
        },
      })),
    };

    const waterfall = extractProfitabilityWaterfall(
      proposalWithFinancials,
      contractPeriodYears
    );

    // Mark winner based on highest NPV EBITDA
    waterfall.isWinner = insights.npvEbitda.winnerId === proposal.id;

    waterfallData.push(waterfall);
  }

  return waterfallData;
}

/**
 * Extract cash flow comparison data for multi-line chart
 */
function extractCashFlowComparison(
  proposals: DashboardProposal[],
  insights: ComparisonInsights,
): CashFlowComparisonData[] {
  return proposals.map((proposal) => {
    const financials = normalizeFinancials(proposal.financials);

    let cumulative = 0;
    let breakevenYear: number | null = null;
    let lowestCash = Infinity;
    let lowestCashYear = 2023;
    let peakCash = -Infinity;
    let peakCashYear = 2023;

    const data = financials.map((period) => {
      const netCashFlow = parseNumber(period.cashFlow?.["netChangeInCash"]);
      cumulative += netCashFlow;

      // Track breakeven year (first year cumulative > 0)
      if (breakevenYear === null && cumulative > 0) {
        breakevenYear = period.year;
      }

      // Track lowest and peak cash
      if (cumulative < lowestCash) {
        lowestCash = cumulative;
        lowestCashYear = period.year;
      }
      if (cumulative > peakCash) {
        peakCash = cumulative;
        peakCashYear = period.year;
      }

      return {
        year: period.year,
        cumulative,
      };
    });

    const isWinner = insights.finalCash.winnerId === proposal.id;

    return {
      proposalId: proposal.id,
      proposalName: proposal.name,
      developer: proposal.developer ?? "Unknown",
      data,
      breakevenYear,
      lowestCashYear,
      peakCashYear,
      finalCash: cumulative,
      isWinner,
    };
  });
}

/**
 * Detect contract end year from proposals (2052 or 2057)
 */
function detectContractEndYear(proposals: DashboardProposal[]): number {
  // Check if any proposal has 30-year contract (2028 + 30 - 1 = 2057)
  const has30YearContract = proposals.some(
    (p) => p.contractPeriodYears === 30,
  );
  return has30YearContract ? 2057 : 2052;
}
