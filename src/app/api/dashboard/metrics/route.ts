import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateUserWithRole } from "@/middleware/auth";
import { Role } from "@/lib/types/roles";
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

// Response types use number for JSON serialization (converted from Decimal before sending to client)
/* eslint-disable no-restricted-syntax */
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
/* eslint-enable no-restricted-syntax */

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

// SECURITY: Auth bypass removed - authentication is always required
// Previously allowed dashboard to render without auth in non-production environments
// This was a security risk as dev environments may still contain sensitive data

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

    // SECURITY: Always require authentication - no bypass allowed
    if (!authResult.success) {
      return authResult.error;
    }

    // Fetch SystemConfig for discount rate
    const systemConfig = await prisma.systemConfig.findFirst({
      orderBy: { confirmedAt: "desc" },
    });
    const discountRate = systemConfig?.discountRate || new Decimal(0.08);

    // Fetch calculated proposals with pagination to prevent memory issues
    // Limit to 100 most recently calculated proposals
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
      orderBy: {
        calculatedAt: "desc",
      },
      take: 100, // Performance: prevent OOM with large datasets
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
        totalRent: parseDecimal(metrics?.totalRent),
        npv: parseDecimal(metrics?.npv),
        irr: parseNumber(metrics?.irr),
        totalEbitda: parseDecimal(metrics?.totalEbitda),
        avgEbitda: parseDecimal(metrics?.avgEbitda),
        npvEbitda: parseDecimal(metrics?.contractEbitdaNPV),
        nav: parseDecimal(metrics?.contractNAV),
        finalCash: parseDecimal(metrics?.finalCash),
        maxDebt: parseDecimal(metrics?.maxDebt),
        peakDebt: parseDecimal(metrics?.peakDebt),
        contractPeriodYears: p.contractPeriodYears ?? 25,
      };
    });

    // Calculate comparison insights
    const insights = calculateComparisonInsights(proposalMetrics);

    // Optimize: Run independent operations in parallel
    const [
      chartData,
      npvComparison,
      navComparison,
      profitabilityWaterfall,
      sensitivity,
    ] = await Promise.all([
      // Extract all chart data in a single pass through financials
      Promise.resolve(extractAllChartData(typedProposals, insights)),

      // Extract NPV comparison (metrics only, no financials)
      Promise.resolve(extractNPVComparison(typedProposals, insights)),

      // Extract NAV comparison (metrics only, no financials)
      Promise.resolve(extractNAVComparison(typedProposals, insights)),

      // Extract profitability waterfall data
      extractProfitabilityWaterfallData(typedProposals, insights),

      // Get sensitivity data (DEPRECATED - removed from dashboard)
      extractSensitivityData(),
    ]);

    // Detect contract end year from proposals
    const contractEndYear = detectContractEndYear(typedProposals);

    return NextResponse.json(
      {
        isEmpty: false,
        insights,
        kpis,
        rentTrajectory: chartData.rentTrajectory,
        costBreakdown: chartData.costBreakdown, // Keep for backward compatibility
        avgAnnualCosts: chartData.avgAnnualCosts,
        npvComparison,
        navComparison, // KEY METRIC for comparing different contract lengths
        profitabilityWaterfall,
        cashFlow: chartData.cashFlow, // Keep for existing components
        cashFlowComparison: chartData.cashFlowComparison,
        sensitivity, // Keep for backward compatibility
        proposalCount: proposals.length,
        contractEndYear,
      },
      {
        headers: {
          // Cache for 60 seconds - dashboard data can be slightly stale
          "Cache-Control": "private, max-age=60, stale-while-revalidate=30",
        },
      },
    );
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);

    // SECURITY: Return generic error message, log details server-side
    return NextResponse.json(
      {
        error: "Failed to fetch dashboard metrics. Please try again.",
      },
      { status: 500 },
    );
  }
}

/**
 * OPTIMIZED: Extract all chart data in a single pass through financials
 * Combines rent trajectory, cost breakdown, average costs, and cash flow extraction
 * Reduces 5 separate iterations to 1 iteration per proposal
 */
function extractAllChartData(
  proposals: DashboardProposal[],
  insights: ComparisonInsights,
) {
  const rentTrajectory: RentTrajectorySeries[] = [];
  const costBreakdown: CostBreakdownEntry[] = [];
  const avgAnnualCosts: AverageCostData[] = [];
  const cashFlow: CashFlowSeries[] = [];
  const cashFlowComparison: CashFlowComparisonData[] = [];

  proposals.forEach((proposal) => {
    const financials = normalizeFinancials(proposal.financials);
    if (financials.length === 0) return;

    const contractPeriodYears = proposal.contractPeriodYears || 25;
    const contractStartYear = 2028;
    const contractEndYear = contractStartYear + contractPeriodYears - 1;

    // Initialize accumulators for single pass
    let totalRent = 0;
    let totalStaff = 0;
    let totalOtherOpex = 0;
    let contractTotalRent = 0;
    let contractTotalStaff = 0;
    let contractTotalOtherOpex = 0;
    let cumulative = 0;
    let breakevenYear: number | null = null;
    let lowestCash = Infinity;
    let lowestCashYear = 2023;
    let peakCash = -Infinity;
    let peakCashYear = 2023;

    const rentByYear: RentTrajectoryPoint[] = [];
    const cashFlowData: CashFlowEntry[] = [];
    const cashFlowComparisonData: Array<{ year: number; cumulative: number }> =
      [];

    // SINGLE PASS through financials - extract all needed data
    financials.forEach((period) => {
      const profitLoss = period.profitLoss ?? {};
      const rentExpense = parseNumber(profitLoss["rentExpense"]);
      const staffCosts = parseNumber(profitLoss["staffCosts"]);
      const otherOpex = parseNumber(profitLoss["otherOpex"]);
      const netCashFlow = parseNumber(period.cashFlow?.["netChangeInCash"]);

      // For rent trajectory
      rentByYear.push({
        year: period.year,
        rent: rentExpense,
      });

      // For cost breakdown (all years)
      totalRent += rentExpense;
      totalStaff += staffCosts;
      totalOtherOpex += otherOpex;

      // For average annual costs (contract period only)
      if (period.year >= contractStartYear && period.year <= contractEndYear) {
        contractTotalRent += rentExpense;
        contractTotalStaff += staffCosts;
        contractTotalOtherOpex += otherOpex;
      }

      // For cash flow
      cumulative += netCashFlow;
      cashFlowData.push({
        year: period.year,
        netCashFlow,
        cumulative,
      });

      // For cash flow comparison
      cashFlowComparisonData.push({
        year: period.year,
        cumulative,
      });

      // Track breakeven year
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
    });

    // Build rent trajectory entry
    rentTrajectory.push({
      proposalId: proposal.id,
      proposalName: proposal.name,
      developer: proposal.developer ?? "Unknown",
      rentModel: proposal.rentModel,
      data: rentByYear,
      isWinner: insights.rent.winnerId === proposal.id,
    });

    // Build cost breakdown entry
    costBreakdown.push({
      proposalId: proposal.id,
      proposalName: proposal.name,
      developer: proposal.developer ?? "Unknown",
      rent: totalRent.toFixed(2),
      staff: totalStaff.toFixed(2),
      otherOpex: totalOtherOpex.toFixed(2),
    });

    // Build average annual costs entry
    const avgAnnualRent = contractTotalRent / contractPeriodYears;
    const avgAnnualStaff = contractTotalStaff / contractPeriodYears;
    const avgAnnualOther = contractTotalOtherOpex / contractPeriodYears;
    const totalAvgAnnual = avgAnnualRent + avgAnnualStaff + avgAnnualOther;

    avgAnnualCosts.push({
      proposalId: proposal.id,
      proposalName: proposal.name,
      developer: proposal.developer ?? "Unknown",
      contractPeriodYears,
      avgAnnualRent,
      avgAnnualStaff,
      avgAnnualOther,
      totalAvgAnnual,
      isWinner: insights.rent.winnerId === proposal.id,
    });

    // Build cash flow entry
    cashFlow.push({
      proposalId: proposal.id,
      proposalName: proposal.name,
      developer: proposal.developer ?? "Unknown",
      data: cashFlowData,
    });

    // Build cash flow comparison entry
    cashFlowComparison.push({
      proposalId: proposal.id,
      proposalName: proposal.name,
      developer: proposal.developer ?? "Unknown",
      data: cashFlowComparisonData,
      breakevenYear,
      lowestCashYear,
      peakCashYear,
      finalCash: cumulative,
      isWinner: insights.finalCash.winnerId === proposal.id,
    });
  });

  return {
    rentTrajectory,
    costBreakdown,
    avgAnnualCosts,
    cashFlow,
    cashFlowComparison,
  };
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

    interface AnalysisRecord {
      id: string;
      variable: string;
      impactMetric: string;
      dataPoints: unknown;
      proposal: {
        name: string | null;
        developer: string | null;
      };
    }

    return analyses.map((analysis: AnalysisRecord) => ({
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
    if (
      proposal.metrics &&
      typeof proposal.metrics === "object" &&
      !Array.isArray(proposal.metrics)
    ) {
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
 * Extract NPV comparison data for horizontal bar chart
 */
function extractNPVComparison(
  proposals: DashboardProposal[],
  insights: ComparisonInsights,
): NPVComparisonData[] {
  return proposals
    .map((proposal) => {
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
    })
    .sort((a, b) => b.npv - a.npv); // Sort by NPV descending
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
      financials: financials.map((f) => ({
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
      contractPeriodYears,
    );

    // Mark winner based on highest NPV EBITDA
    waterfall.isWinner = insights.npvEbitda.winnerId === proposal.id;

    waterfallData.push(waterfall);
  }

  return waterfallData;
}

/**
 * Detect contract end year from proposals (2052 or 2057)
 */
function detectContractEndYear(proposals: DashboardProposal[]): number {
  // Check if any proposal has 30-year contract (2028 + 30 - 1 = 2057)
  const has30YearContract = proposals.some((p) => p.contractPeriodYears === 30);
  return has30YearContract ? 2057 : 2052;
}
