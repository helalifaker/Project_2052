"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  TrendingUp,
  DollarSign,
  BarChart3,
  Calendar,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { KPICard } from "@/components/dashboard/KPICard";
import { formatMillions } from "@/lib/utils/financial";

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
  kpis: {
    totalCost: string;
    avgNPV: string;
    avgIRR: string;
    avgPayback: string;
  };
  rentTrajectory: Array<{
    proposalId: string;
    proposalName: string;
    developer: string;
    rentModel: string;
    data: Array<{ year: number; rent: number }>;
    isWinner: boolean;
  }>;
  costBreakdown: Array<{
    proposalId: string;
    proposalName: string;
    developer: string;
    rent: string;
    staff: string;
    otherOpex: string;
  }>;
  cashFlow: Array<{
    proposalId: string;
    proposalName: string;
    developer: string;
    data: Array<{ year: number; netCashFlow: number; cumulative: number }>;
  }>;
  sensitivity: SensitivityData[];
  proposalCount: number;
};

// PERFORMANCE OPTIMIZATION: Lazy load heavy chart components
// Charts are only loaded when needed, reducing initial bundle size
const RentTrajectoryChart = dynamic(
  () =>
    import("@/components/dashboard/RentTrajectoryChart").then((mod) => ({
      default: mod.RentTrajectoryChart,
    })),
  {
    loading: () => (
      <div className="h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    ),
    ssr: false,
  },
);

const CostBreakdownChart = dynamic(
  () =>
    import("@/components/dashboard/CostBreakdownChart").then((mod) => ({
      default: mod.CostBreakdownChart,
    })),
  {
    loading: () => (
      <div className="h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    ),
    ssr: false,
  },
);

const CumulativeCashFlowChart = dynamic(
  () =>
    import("@/components/dashboard/CumulativeCashFlowChart").then((mod) => ({
      default: mod.CumulativeCashFlowChart,
    })),
  {
    loading: () => (
      <div className="h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    ),
    ssr: false,
  },
);

const NPVSensitivityChart = dynamic(
  () =>
    import("@/components/dashboard/NPVSensitivityChart").then((mod) => ({
      default: mod.NPVSensitivityChart,
    })),
  {
    loading: () => (
      <div className="h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    ),
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
export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [statusFilter, setStatusFilter] = useState<"active" | "all" | "closed">(
    "active",
  );

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/dashboard/metrics?status=${statusFilter}`,
        );

        if (!response.ok) {
          let errorMessage = "Failed to fetch dashboard data";
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            errorMessage = `${response.status} ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }

        const data = (await response.json()) as DashboardData;
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load dashboard";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [statusFilter]);

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Empty State
  if (dashboardData?.isEmpty) {
    return (
      <div className="container mx-auto py-12">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">Welcome to Project 2052</h1>
            <p className="text-xl text-muted-foreground">
              Financial Planning & Analysis Dashboard
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-8 space-y-4">
            <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground" />
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">No Proposals Yet</h2>
              <p className="text-muted-foreground">
                Get started by creating your first lease proposal. Once you have
                calculated proposals, the dashboard will display comprehensive
                analytics and insights.
              </p>
            </div>
            <Button size="lg" onClick={() => router.push("/proposals/new")}>
              <Plus className="h-5 w-5 mr-2" />
              Create First Proposal
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
            <div className="text-center p-4">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Compare proposals with interactive charts and metrics
              </p>
            </div>
            <div className="text-center p-4">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Financial Modeling</h3>
              <p className="text-sm text-muted-foreground">
                30-year projections with P&L, Balance Sheet, and Cash Flow
              </p>
            </div>
            <div className="text-center p-4">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Scenario Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Test variables with interactive sliders and sensitivity analysis
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  // Dashboard with Data
  const {
    kpis,
    rentTrajectory,
    costBreakdown,
    cashFlow,
    sensitivity,
    proposalCount,
  } = dashboardData;

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Overview of {proposalCount} calculated proposal
              {proposalCount !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex gap-2">
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
            <Button variant="outline" onClick={() => router.push("/proposals")}>
              View All Proposals
            </Button>
            <Button onClick={() => router.push("/proposals/new")}>
              <Plus className="h-4 w-4 mr-2" />
              New Proposal
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Cost"
          value={formatMillions(parseFloat(kpis.totalCost))}
          subtitle={`Sum of all rent over 30 years (${proposalCount} proposals)`}
          icon={DollarSign}
        />
        <KPICard
          title="Average NPV"
          value={formatMillions(parseFloat(kpis.avgNPV))}
          subtitle="Net Present Value (mean across proposals)"
          icon={TrendingUp}
        />
        <KPICard
          title="Average IRR"
          value={`${parseFloat(kpis.avgIRR).toFixed(2)}%`}
          subtitle="Internal Rate of Return"
          icon={BarChart3}
        />
        <KPICard
          title="Avg Payback"
          value={`${parseFloat(kpis.avgPayback).toFixed(1)} years`}
          subtitle="Average payback period"
          icon={Calendar}
        />
      </div>

      {/* Chart 1: Rent Trajectory */}
      <RentTrajectoryChart data={rentTrajectory} />

      {/* Chart 2: Cost Breakdown */}
      <CostBreakdownChart data={costBreakdown} />

      {/* Chart 3: Cumulative Cash Flow */}
      <CumulativeCashFlowChart data={cashFlow} />

      {/* Chart 4: NPV Sensitivity */}
      <NPVSensitivityChart data={sensitivity} />

      {/* Footer Info */}
      <div className="bg-muted/50 rounded-lg p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Dashboard data is updated in real-time based on calculated proposals.
          <br />
          Last refreshed: {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  );
}
