"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Plus,
  TrendingUp,
  DollarSign,
  BarChart3,
  Calculator,
} from "lucide-react";
import { RangeKPICard } from "@/components/dashboard/RangeKPICard";
import { BentoGrid, BentoItem } from "@/components/dashboard/BentoGrid";
import {
  ExecutiveCard,
  ExecutiveCardHeader,
  ExecutiveCardTitle,
  ExecutiveCardContent,
} from "@/components/ui/executive-card";
import type { ComparisonInsights } from "@/lib/utils/comparison";
import { PageSkeleton } from "@/components/states/PageSkeleton";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { ChartSkeleton } from "@/components/charts/ChartSkeleton";

type SensitivityData = {
  id: string;
  proposalName: string;
  developer: string | null;
  variable: string;
  metric: string;
  dataPoints: Array<{ variablePercent: number; metricValue: string }> | null;
};

type DashboardData = {
  isEmpty?: boolean;
  insights?: ComparisonInsights;
  kpis: {
    totalContractRent: string;
    avgRentNPV: string;
    totalContractEBITDA: string;
    avgFinalCash: string;
    totalContractCapEx: string;
    discountRate: string;
    avgNAV: string; // Net Annualized Value
  };
  rentTrajectory: Array<{
    proposalId: string;
    proposalName: string;
    developer: string;
    rentModel: string;
    data: Array<{ year: number; rent: number }>;
    isWinner: boolean;
  }>;
  avgAnnualCosts?: Array<{
    proposalId: string;
    proposalName: string;
    developer: string;
    contractPeriodYears: number;
    avgAnnualRent: number;
    avgAnnualStaff: number;
    avgAnnualOther: number;
    totalAvgAnnual: number;
    isWinner: boolean;
  }>;
  npvComparison?: Array<{
    proposalId: string;
    proposalName: string;
    developer: string;
    npv: number;
    isWinner: boolean;
  }>;
  navComparison?: Array<{
    proposalId: string;
    proposalName: string;
    developer: string;
    nav: number;
    navPercentile: number;
    isWinner: boolean;
  }>;
  profitabilityWaterfall?: Array<{
    proposalId: string;
    proposalName: string;
    segments: Array<{
      label: string;
      value: number;
      type: "positive" | "negative" | "total";
      cumulative: number;
    }>;
    netIncome: number;
    isWinner: boolean;
  }>;
  cashFlowComparison?: Array<{
    proposalId: string;
    proposalName: string;
    developer: string;
    data: Array<{ year: number; cumulative: number }>;
    breakevenYear: number | null;
    lowestCashYear: number;
    peakCashYear: number;
    finalCash: number;
    isWinner: boolean;
  }>;
  costBreakdown: Array<{
    proposalId: string;
    proposalName: string;
    developer: string;
    rent: string;
    staff: string;
    otherOpexPercent: string;
  }>;
  cashFlow: Array<{
    proposalId: string;
    proposalName: string;
    developer: string;
    data: Array<{ year: number; netCashFlow: number; cumulative: number }>;
  }>;
  sensitivity: SensitivityData[];
  revenueCostProfit: Array<{
    year: number;
    revenue: number;
    costs: number;
    netIncome: number;
  }>;
  cashTrend: Array<{
    year: number;
    cash: number;
    operatingCF: number;
    investingCF: number;
    financingCF: number;
  }>;
  proposalCount: number;
  contractEndYear: number;
};

// PERFORMANCE OPTIMIZATION: Lazy load heavy chart components
// Charts are only loaded when needed, reducing initial bundle size
// Now using ChartSkeleton for better UX during loading
const RentTrajectoryChart = dynamic(
  () =>
    import("@/components/dashboard/RentTrajectoryChart").then((mod) => ({
      default: mod.RentTrajectoryChart,
    })),
  {
    loading: () => <ChartSkeleton type="line" height={280} />,
    ssr: false,
  },
);

const NAVComparisonChart = dynamic(
  () =>
    import("@/components/dashboard/NAVComparisonChart").then((mod) => ({
      default: mod.NAVComparisonChart,
    })),
  {
    loading: () => <ChartSkeleton type="bar" height={280} />,
    ssr: false,
  },
);

const NPVComparisonChart = dynamic(
  () =>
    import("@/components/dashboard/NPVComparisonChart").then((mod) => ({
      default: mod.NPVComparisonChart,
    })),
  {
    loading: () => <ChartSkeleton type="bar" height={200} />,
    ssr: false,
  },
);

const ProfitabilityWaterfallChart = dynamic(
  () =>
    import("@/components/dashboard/ProfitabilityWaterfallChart").then(
      (mod) => ({
        default: mod.ProfitabilityWaterfallChart,
      }),
    ),
  {
    loading: () => <ChartSkeleton type="bar" height={200} />,
    ssr: false,
  },
);

const CumulativeCashFlowChart = dynamic(
  () =>
    import("@/components/dashboard/CumulativeCashFlowChart").then((mod) => ({
      default: mod.CumulativeCashFlowChart,
    })),
  {
    loading: () => <ChartSkeleton type="area" height={200} />,
    ssr: false,
  },
);

/**
 * Analytics Dashboard (Week 12)
 *
 * Main landing page for the application
 * Provides high-level analytics across all proposals:
 * - 4 KPI Metric Cards (Total Cost, NPV, IRR, Payback)
 * - Chart 1: Rent Trajectory (all proposals, winner highlighted)
 * - Chart 2: Cost Breakdown (stacked bar)
 * - Chart 3: Cumulative Cash Flow (area chart)
 * - Chart 4: NPV Sensitivity (tornado diagram)
 */
/**
 * Analytics Dashboard (Week 12)
 *
 * Main landing page for the application
 * Provides high-level analytics across all proposals:
 * - 4 KPI Metric Cards (Total Cost, NPV, IRR, Payback)
 * - Chart 1: Rent Trajectory (all proposals, winner highlighted)
 * - Chart 2: Cost Breakdown (stacked bar)
 * - Chart 3: Cumulative Cash Flow (area chart)
 * - Chart 4: NPV Sensitivity (tornado diagram)
 */
import { ScenarioProvider, useScenario } from "@/context/ScenarioContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ControlPanel } from "@/components/dashboard/ControlPanel";
import { calculateNPV, calculateIRR } from "@/lib/utils/financial";
import Decimal from "decimal.js";
import { Settings2 } from "lucide-react";

function DashboardContent() {
  const router = useRouter();
  const { discountRate, inflationRate, rentGrowthFactor } = useScenario();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [statusFilter, setStatusFilter] = useState<"active" | "all" | "closed">(
    "active",
  );

  // Client-side calculated state (for scenario adjustments on existing charts)
  const [_calculatedKPIs, setCalculatedKPIs] = useState<{
    avgNPV: number;
    avgIRR: number;
  } | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `/api/dashboard/metrics?status=${statusFilter}`,
          {
            credentials: "include", // Ensure cookies are sent with the request
          },
        );

        if (!response.ok) {
          // Handle authentication errors by redirecting to login
          if (response.status === 401) {
            const redirectTo = encodeURIComponent(window.location.pathname);
            router.push(`/login?redirectTo=${redirectTo}`);
            return;
          }

          // For other errors, set error state instead of silent fallback
          if (response.status >= 500) {
            throw new Error(
              `Server error (${response.status}): Unable to load dashboard data`,
            );
          }

          // For 404 or empty data, treat as empty state
          console.warn(
            `Dashboard fetch returned ${response.status}. Using empty state.`,
          );

          setDashboardData({
            isEmpty: true,
            kpis: {
              totalContractRent: "0",
              avgRentNPV: "0",
              totalContractEBITDA: "0",
              avgFinalCash: "0",
              totalContractCapEx: "0",
              discountRate: "5.00",
              avgNAV: "0",
            },
            rentTrajectory: [],
            costBreakdown: [],
            cashFlow: [],
            sensitivity: [],
            revenueCostProfit: [],
            cashTrend: [],
            proposalCount: 0,
            contractEndYear: 2052,
          });
          return;
        }

        const data = (await response.json()) as DashboardData;
        setDashboardData(data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to load dashboard data"),
        );
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [statusFilter, router]);

  // Recalculate KPIs when scenario changes
  useEffect(() => {
    if (!dashboardData) return;

    let totalNPV = new Decimal(0);
    let totalIRR = new Decimal(0);
    let irrCount = 0;
    let count = 0;

    const discount = new Decimal(discountRate);
    const inflationScalar = new Decimal(1).plus(inflationRate);
    const rentScalar = new Decimal(rentGrowthFactor);

    (dashboardData.cashFlow || []).forEach((proposal) => {
      const cashFlows = (proposal.data || []).map(
        (d) => new Decimal(d.netCashFlow),
      );

      const adjustedCashFlows = cashFlows.map((cf) => {
        if (cf.greaterThan(0)) return cf.mul(rentScalar);
        return cf.mul(inflationScalar);
      });

      const npv = calculateNPV(adjustedCashFlows, discount);
      const irr = calculateIRR(adjustedCashFlows);

      totalNPV = totalNPV.plus(npv);
      if (irr) {
        totalIRR = totalIRR.plus(irr.mul(100)); // convert to percent for display
        irrCount++;
      }
      count++;
    });

    const avgNPV = count > 0 ? totalNPV.dividedBy(count) : new Decimal(0);
    const avgIRR = irrCount > 0 ? totalIRR.dividedBy(irrCount) : new Decimal(0);

    // Update state
    setCalculatedKPIs({
      avgNPV: avgNPV.dividedBy(1_000_000).toNumber(), // Convert to Millions for UI
      avgIRR: avgIRR.toNumber(),
    });
  }, [dashboardData, discountRate, inflationRate, rentGrowthFactor]);

  // Memoized Chart Data
  const adjustedRentTrajectory = useMemo(() => {
    if (!dashboardData?.rentTrajectory) return [];
    return dashboardData.rentTrajectory.map((proposal) => ({
      ...proposal,
      data: (proposal.data || []).map((d) => ({
        year: d.year,
        rent: d.rent * rentGrowthFactor,
      })),
    }));
  }, [dashboardData, rentGrowthFactor]);

  const adjustedCashFlow = useMemo(() => {
    if (!dashboardData?.cashFlow) return [];

    return dashboardData.cashFlow.map((proposal) => {
      let cumulative = 0;
      const newData = (proposal.data || []).map((d) => {
        // Simplified adjustment
        let adjustedNet = d.netCashFlow;
        if (d.netCashFlow > 0) {
          adjustedNet = d.netCashFlow * rentGrowthFactor;
        } else {
          adjustedNet = d.netCashFlow * (1 + inflationRate);
        }
        cumulative += adjustedNet;
        return {
          ...d,
          netCashFlow: adjustedNet,
          cumulative: cumulative,
        };
      });

      return {
        ...proposal,
        data: newData,
      };
    });
  }, [dashboardData, rentGrowthFactor, inflationRate]);

  // Retry function for error recovery
  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // Trigger re-fetch by toggling a timestamp or using the statusFilter dependency
    window.location.reload();
  };

  // Loading State - Use PageSkeleton for better UX
  if (loading) {
    return (
      <DashboardLayout
        breadcrumbs={[{ label: "Dashboard" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              <Settings2 className="h-4 w-4 mr-2" />
              Scenario
            </Button>
          </div>
        }
      >
        <PageSkeleton variant="dashboard" />
      </DashboardLayout>
    );
  }

  // Error State - Show ErrorState component with retry
  if (error) {
    return (
      <DashboardLayout breadcrumbs={[{ label: "Dashboard" }]}>
        <ErrorState
          error={error}
          reset={handleRetry}
          title="Failed to Load Dashboard"
          description="We encountered an error while loading your dashboard data. Please try again."
          size="default"
        />
      </DashboardLayout>
    );
  }

  // Empty State - Use EmptyState component
  if (dashboardData?.isEmpty) {
    return (
      <DashboardLayout
        breadcrumbs={[{ label: "Dashboard" }]}
        actions={
          <Button size="sm" onClick={() => router.push("/proposals/new")}>
            <Plus className="h-4 w-4 mr-2" />
            New Proposal
          </Button>
        }
      >
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
          <EmptyState
            variant="folder"
            title="No Proposals Yet"
            description="Get started by creating your first lease proposal. Once you have calculated proposals, the dashboard will display comprehensive analytics and insights across 30-year projections."
            action={{
              label: "Create First Proposal",
              onClick: () => router.push("/proposals/new"),
            }}
            size="spacious"
          />

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 max-w-4xl">
            <div className="text-center p-6 rounded-lg bg-card border border-border">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Compare proposals with interactive charts and metrics
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-card border border-border">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Financial Modeling</h3>
              <p className="text-sm text-muted-foreground">
                30-year projections with P&L, Balance Sheet, and Cash Flow
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-card border border-border">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Scenario Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Test variables with interactive sliders and sensitivity analysis
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!dashboardData) {
    return null;
  }

  return (
    <DashboardLayout
      breadcrumbs={[{ label: "Dashboard" }]}
      actions={
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Settings2 className="h-4 w-4" />
                Scenario
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <ControlPanel />
            </PopoverContent>
          </Popover>

          <div className="h-4 w-px bg-border mx-2" />

          <Button
            variant={statusFilter === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("active")}
          >
            Active
          </Button>
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("all")}
          >
            All
          </Button>
          <Button
            variant={statusFilter === "closed" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("closed")}
          >
            Closed
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/proposals")}
          >
            View All
          </Button>
          <Button size="sm" onClick={() => router.push("/proposals/new")}>
            <Plus className="h-4 w-4 mr-2" />
            New
          </Button>
        </div>
      }
    >
      <BentoGrid dense>
        {/* Row 1: 5 KPI Cards (Comparison Summary) */}
        <BentoItem colSpan={2}>
          <RangeKPICard
            title="NPV Rent Range"
            minValue={
              typeof dashboardData.insights?.npv.min === "number"
                ? dashboardData.insights.npv.min
                : Number(dashboardData.insights?.npv.min || 0)
            }
            maxValue={
              typeof dashboardData.insights?.npv.max === "number"
                ? dashboardData.insights.npv.max
                : Number(dashboardData.insights?.npv.max || 0)
            }
            minLabel={dashboardData.insights?.npv.winnerId ? "Best" : undefined}
            maxLabel={dashboardData.insights?.npv.winnerId ? undefined : "Best"}
            unit="millions"
            icon={TrendingUp}
            direction="higher-better"
            className="h-full"
            size="ultra-compact"
          />
        </BentoItem>
        <BentoItem colSpan={2}>
          <RangeKPICard
            title="Rent Variation"
            minValue={
              typeof dashboardData.insights?.rent.min === "number"
                ? dashboardData.insights.rent.min
                : Number(dashboardData.insights?.rent.min || 0)
            }
            maxValue={
              typeof dashboardData.insights?.rent.max === "number"
                ? dashboardData.insights.rent.max
                : Number(dashboardData.insights?.rent.max || 0)
            }
            minLabel="Best"
            unit="millions"
            icon={DollarSign}
            direction="lower-better"
            className="h-full"
            size="ultra-compact"
          />
        </BentoItem>
        <BentoItem colSpan={2}>
          <RangeKPICard
            title="NPV EBITDA Range"
            minValue={
              typeof dashboardData.insights?.npvEbitda.min === "number"
                ? dashboardData.insights.npvEbitda.min
                : Number(dashboardData.insights?.npvEbitda.min || 0)
            }
            maxValue={
              typeof dashboardData.insights?.npvEbitda.max === "number"
                ? dashboardData.insights.npvEbitda.max
                : Number(dashboardData.insights?.npvEbitda.max || 0)
            }
            maxLabel="Best"
            unit="millions"
            icon={BarChart3}
            direction="higher-better"
            className="h-full"
            size="ultra-compact"
          />
        </BentoItem>
        <BentoItem colSpan={2}>
          <RangeKPICard
            title="Cash Variation"
            minValue={
              typeof dashboardData.insights?.finalCash.min === "number"
                ? dashboardData.insights.finalCash.min
                : Number(dashboardData.insights?.finalCash.min || 0)
            }
            maxValue={
              typeof dashboardData.insights?.finalCash.max === "number"
                ? dashboardData.insights.finalCash.max
                : Number(dashboardData.insights?.finalCash.max || 0)
            }
            maxLabel="Best"
            unit="millions"
            icon={DollarSign}
            direction="higher-better"
            className="h-full"
            size="ultra-compact"
          />
        </BentoItem>
        <BentoItem colSpan={4}>
          <RangeKPICard
            title="NAV Range ⭐"
            minValue={
              typeof dashboardData.insights?.nav.min === "number"
                ? dashboardData.insights.nav.min
                : Number(dashboardData.insights?.nav.min || 0)
            }
            maxValue={
              typeof dashboardData.insights?.nav.max === "number"
                ? dashboardData.insights.nav.max
                : Number(dashboardData.insights?.nav.max || 0)
            }
            maxLabel="Best"
            unit="millions"
            icon={Calculator}
            direction="higher-better"
            className="h-full border-primary/20 bg-primary/5"
            size="ultra-compact"
          />
        </BentoItem>

        {/* Row 2: Main Trajectory & NAV - 2 Large Charts (Half width each) */}
        <BentoItem colSpan={6} className="min-h-[280px]">
          <ExecutiveCard className="h-full flex flex-col" size="ultra-compact">
            <ExecutiveCardHeader size="ultra-compact">
              <ExecutiveCardTitle>Rent Trajectory</ExecutiveCardTitle>
            </ExecutiveCardHeader>
            <ExecutiveCardContent
              className="flex-1 min-h-0"
              size="ultra-compact"
            >
              <RentTrajectoryChart data={adjustedRentTrajectory} />
            </ExecutiveCardContent>
          </ExecutiveCard>
        </BentoItem>

        <BentoItem colSpan={6} className="min-h-[280px]">
          <ExecutiveCard className="h-full flex flex-col" size="ultra-compact">
            <ExecutiveCardHeader size="ultra-compact">
              <ExecutiveCardTitle>NAV Comparison ⭐</ExecutiveCardTitle>
            </ExecutiveCardHeader>
            <ExecutiveCardContent
              className="flex-1 min-h-0"
              size="ultra-compact"
            >
              <NAVComparisonChart data={dashboardData.navComparison || []} />
            </ExecutiveCardContent>
          </ExecutiveCard>
        </BentoItem>

        {/* Row 3: Secondary Metrics - 3 Smaller Charts (Third width each) */}
        <BentoItem colSpan={4} className="min-h-[200px]">
          <ExecutiveCard className="h-full flex flex-col" size="ultra-compact">
            <ExecutiveCardHeader size="ultra-compact">
              <ExecutiveCardTitle>Cumulative Cash Flow</ExecutiveCardTitle>
            </ExecutiveCardHeader>
            <ExecutiveCardContent
              className="flex-1 min-h-0"
              size="ultra-compact"
            >
              <CumulativeCashFlowChart data={adjustedCashFlow} />
            </ExecutiveCardContent>
          </ExecutiveCard>
        </BentoItem>

        <BentoItem colSpan={4} className="min-h-[200px]">
          <ExecutiveCard className="h-full flex flex-col" size="ultra-compact">
            <ExecutiveCardHeader size="ultra-compact">
              <ExecutiveCardTitle>NPV Comparison</ExecutiveCardTitle>
            </ExecutiveCardHeader>
            <ExecutiveCardContent
              className="flex-1 min-h-0"
              size="ultra-compact"
            >
              <NPVComparisonChart data={dashboardData.npvComparison || []} />
            </ExecutiveCardContent>
          </ExecutiveCard>
        </BentoItem>

        <BentoItem colSpan={4} className="min-h-[200px]">
          <ExecutiveCard className="h-full flex flex-col" size="ultra-compact">
            <ExecutiveCardHeader size="ultra-compact">
              <ExecutiveCardTitle>Profitability Breakdown</ExecutiveCardTitle>
            </ExecutiveCardHeader>
            <ExecutiveCardContent
              className="flex-1 min-h-0"
              size="ultra-compact"
            >
              <ProfitabilityWaterfallChart
                data={dashboardData.profitabilityWaterfall || []}
              />
            </ExecutiveCardContent>
          </ExecutiveCard>
        </BentoItem>
      </BentoGrid>
    </DashboardLayout>
  );
}

export default function DashboardPage() {
  return (
    <ScenarioProvider>
      <DashboardContent />
    </ScenarioProvider>
  );
}
