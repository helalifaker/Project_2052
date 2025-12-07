"use client";

import { Suspense, useEffect, useState, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import {
  ComparisonTable,
  ProposalSummary,
} from "@/components/proposals/comparison/ComparisonTable";
import { ComparisonMetricsTable } from "@/components/proposals/comparison/ComparisonMetricsTable";
import { FinancialStatementsComparison } from "@/components/proposals/comparison/FinancialStatementsComparison";
import { DeltaToggle } from "@/components/proposals/comparison/DeltaToggle";
import { ChartSkeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

// Lazy-loaded chart components for Visual Analysis tab
// This reduces initial bundle size by ~50KB and improves LCP
const NAVComparisonBarChart = dynamic(
  () =>
    import("@/components/proposals/comparison/NAVComparisonBarChart").then(
      (mod) => mod.NAVComparisonBarChart,
    ),
  {
    loading: () => <ChartSkeleton type="bar" className="h-64" />,
    ssr: false,
  },
);

const NPVComparisonBarChart = dynamic(
  () =>
    import("@/components/proposals/comparison/NPVComparisonBarChart").then(
      (mod) => mod.NPVComparisonBarChart,
    ),
  {
    loading: () => <ChartSkeleton type="bar" className="h-64" />,
    ssr: false,
  },
);

const EBITDAComparisonChart = dynamic(
  () =>
    import("@/components/proposals/comparison/EBITDAComparisonChart").then(
      (mod) => mod.EBITDAComparisonChart,
    ),
  {
    loading: () => <ChartSkeleton type="bar" className="h-64" />,
    ssr: false,
  },
);

const CumulativeCashFlowComparisonChart = dynamic(
  () =>
    import(
      "@/components/proposals/comparison/CumulativeCashFlowComparisonChart"
    ).then((mod) => mod.CumulativeCashFlowComparisonChart),
  {
    loading: () => <ChartSkeleton type="line" className="h-80" />,
    ssr: false,
  },
);

const ProfitabilityComparisonChart = dynamic(
  () =>
    import(
      "@/components/proposals/comparison/ProfitabilityComparisonChart"
    ).then((mod) => mod.ProfitabilityComparisonChart),
  {
    loading: () => <ChartSkeleton type="line" className="h-80" />,
    ssr: false,
  },
);

// Full proposal type for detailed financial data
type FullProposal = {
  id: string;
  name: string;
  developer: string | null;
  rentModel: string;
  contractPeriodYears: number;
  financials: Array<{
    year: number;
    profitLoss: Record<string, number>;
    balanceSheet: Record<string, number>;
    cashFlow: Record<string, number>;
  }>;
  metrics?: ProposalSummary["metrics"];
};

function ProposalCompareContent() {
  const router = useRouter();
  const params = useSearchParams();

  // Stable selected IDs from URL
  const selectedIds = useMemo(() => params.getAll("ids"), [params]);

  // Component state
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<ProposalSummary[]>([]);
  const [deltaMode, setDeltaMode] = useState(false);
  const [fullProposals, setFullProposals] = useState<Map<string, FullProposal>>(
    new Map(),
  );
  const [loadingFull, setLoadingFull] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch guard refs (don't cause re-renders)
  const didFetchProposals = useRef(false);
  const didFetchFullData = useRef(false);

  // Initial data fetch - runs exactly once
  useEffect(() => {
    if (didFetchProposals.current) return;
    didFetchProposals.current = true;

    async function fetchProposals() {
      try {
        setLoading(true);
        const res = await fetch("/api/proposals");

        if (!res.ok) {
          throw new Error(`API returned ${res.status}`);
        }

        const json = await res.json();
        const allProposals: ProposalSummary[] = json.data || [];

        // Filter by selected IDs or take first 3
        const filtered =
          selectedIds.length > 0
            ? allProposals.filter((p) => selectedIds.includes(p.id))
            : allProposals.slice(0, 3);

        setProposals(filtered);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch proposals:", err);
        setError("Failed to load proposals. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    }

    fetchProposals();
  }, [selectedIds]);

  // Fetch full proposal data when switching to Visual/Statements tabs
  useEffect(() => {
    if (activeTab === "overview") return;
    if (didFetchFullData.current) return;
    if (proposals.length === 0) return;

    didFetchFullData.current = true;

    async function fetchFullData() {
      setLoadingFull(true);

      try {
        const results = await Promise.all(
          proposals.map(async (p) => {
            const res = await fetch(`/api/proposals/${p.id}`);
            if (!res.ok) throw new Error(`Failed to fetch ${p.id}`);
            const data = await res.json();
            return { id: p.id, data };
          }),
        );

        const dataMap = new Map<string, FullProposal>();
        results.forEach(({ id, data }) => dataMap.set(id, data));
        setFullProposals(dataMap);
      } catch (err) {
        console.error("Failed to fetch full data:", err);
        setError("Failed to load detailed data.");
      } finally {
        setLoadingFull(false);
      }
    }

    fetchFullData();
  }, [activeTab, proposals]);

  // Helper to safely parse metric values from database JSON strings
  const parseMetricValue = (value: unknown): number => {
    if (value === null || value === undefined) return 0;
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  // NAV Chart Data - compares Net Annualized Value
  const navChartData = useMemo(() => {
    const navValues = proposals.map((p) => ({
      proposalId: p.id,
      proposalName: p.name,
      developer: p.developer ?? "Unknown",
      nav: parseMetricValue(p.metrics?.contractNAV),
      isWinner: false,
    }));
    // Mark winner (highest NAV)
    if (navValues.length > 0) {
      const maxNav = Math.max(...navValues.map((v) => v.nav));
      navValues.forEach((v) => {
        v.isWinner = v.nav === maxNav;
      });
    }
    return navValues;
  }, [proposals]);

  // NPV Chart Data - compares Net Present Value
  const npvChartData = useMemo(() => {
    const npvValues = proposals.map((p) => ({
      proposalId: p.id,
      proposalName: p.name,
      developer: p.developer ?? "Unknown",
      npv: parseMetricValue(p.metrics?.npv),
      isWinner: false,
    }));
    // Mark winner (highest NPV)
    if (npvValues.length > 0) {
      const maxNpv = Math.max(...npvValues.map((v) => v.npv));
      npvValues.forEach((v) => {
        v.isWinner = v.npv === maxNpv;
      });
    }
    return npvValues;
  }, [proposals]);

  // EBITDA Chart Data - compares Average EBITDA
  const ebitdaChartData = useMemo(() => {
    const ebitdaValues = proposals.map((p) => ({
      proposalId: p.id,
      proposalName: p.name,
      developer: p.developer ?? "Unknown",
      avgEbitda: parseMetricValue(p.metrics?.avgEbitda),
      isWinner: false,
    }));
    // Mark winner (highest EBITDA)
    if (ebitdaValues.length > 0) {
      const maxEbitda = Math.max(...ebitdaValues.map((v) => v.avgEbitda));
      ebitdaValues.forEach((v) => {
        v.isWinner = v.avgEbitda === maxEbitda;
      });
    }
    return ebitdaValues;
  }, [proposals]);

  // Cumulative Cash Flow Chart Data - time series
  const cashFlowChartData = useMemo(
    () =>
      proposals.map((p) => ({
        id: p.id,
        name: p.name,
        developer: p.developer ?? undefined,
        financials: {
          years:
            fullProposals.get(p.id)?.financials?.map((f) => ({
              year: f.year,
              cumulativeCash:
                f.cashFlow?.closingCash || f.balanceSheet?.cash || 0,
            })) || [],
        },
      })),
    [proposals, fullProposals],
  );

  // Profitability Chart Data - time series for Net Income
  const profitabilityChartData = useMemo(
    () =>
      proposals.map((p) => ({
        id: p.id,
        name: p.name,
        developer: p.developer ?? undefined,
        financials: {
          years:
            fullProposals.get(p.id)?.financials?.map((f) => ({
              year: f.year,
              netIncome: f.profitLoss?.netIncome || 0,
              ebitda: f.profitLoss?.ebitda || 0,
            })) || [],
        },
      })),
    [proposals, fullProposals],
  );

  // Winner ID for cash flow chart (highest final cash)
  const cashFlowWinnerId = useMemo(() => {
    if (proposals.length === 0) return undefined;
    const sorted = [...proposals].sort(
      (a, b) =>
        parseMetricValue(b.metrics?.finalCash) -
        parseMetricValue(a.metrics?.finalCash),
    );
    return sorted[0].id;
  }, [proposals]);

  // Winner ID for profitability chart (highest avg EBITDA)
  const profitabilityWinnerId = useMemo(() => {
    if (proposals.length === 0) return undefined;
    const sorted = [...proposals].sort(
      (a, b) =>
        parseMetricValue(b.metrics?.avgEbitda) -
        parseMetricValue(a.metrics?.avgEbitda),
    );
    return sorted[0].id;
  }, [proposals]);

  const statementsData = useMemo(
    () =>
      proposals.map((p) => ({
        id: p.id,
        name: p.name,
        developer: p.developer ?? undefined,
        rentModel: p.rentModel,
        financials: fullProposals.get(p.id)?.financials || [],
      })),
    [proposals, fullProposals],
  );

  const metricsTableData = useMemo(
    () =>
      proposals.map((p) => ({
        ...p,
        developer: p.developer ?? undefined,
      })),
    [proposals],
  );

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2 text-muted-foreground">Loading proposals...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">War Room</h1>
          <p className="text-muted-foreground">
            Compare proposals side-by-side with comprehensive analysis.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <DeltaToggle checked={deltaMode} onCheckedChange={setDeltaMode} />
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Empty State */}
      {proposals.length === 0 && !loading && !error && (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <h3 className="text-lg font-semibold mb-2">No Proposals Selected</h3>
          <p className="text-muted-foreground mb-4">
            Select 2-5 proposals from the proposals list to compare
          </p>
          <Button onClick={() => router.push("/proposals")}>
            Browse Proposals
          </Button>
        </div>
      )}

      {/* Tabbed Content */}
      {proposals.length > 0 && (
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3 max-w-2xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="visual">Visual Analysis</TabsTrigger>
            <TabsTrigger value="statements">Financial Statements</TabsTrigger>
          </TabsList>

          {/* Tab 1: Overview */}
          <TabsContent value="overview" className="space-y-6">
            <div className="bg-muted/30 p-4 rounded-lg text-sm text-muted-foreground">
              <p>
                <strong>Note:</strong> The first proposal (leftmost) is treated
                as the
                <span className="text-primary font-semibold"> Baseline</span>.
                Enable &quot;Delta View&quot; to see how other proposals compare
                against it.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Quick Comparison</h2>
              <ComparisonTable proposals={proposals} deltaMode={deltaMode} />
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Detailed Metrics</h2>
              <ComparisonMetricsTable proposals={metricsTableData} />
            </div>
          </TabsContent>

          {/* Tab 2: Visual Analysis */}
          <TabsContent value="visual" className="space-y-8">
            {/* Top Row: NAV and NPV side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* NAV Comparison */}
              <Card className="p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">
                    Net Annualized Value (NAV) ⭐
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Primary decision metric: Annual EBITDA minus Annual Rent
                  </p>
                </div>
                <NAVComparisonBarChart data={navChartData} />
              </Card>

              {/* NPV Comparison */}
              <Card className="p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">
                    Net Present Value (NPV)
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Present value of all future cash flows
                  </p>
                </div>
                <NPVComparisonBarChart data={npvChartData} />
              </Card>
            </div>

            {/* EBITDA Comparison */}
            <Card className="p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">
                  Average EBITDA Comparison
                </h2>
                <p className="text-sm text-muted-foreground">
                  Operating performance comparison across all proposals
                </p>
              </div>
              <EBITDAComparisonChart data={ebitdaChartData} />
            </Card>

            {/* Time Series Charts - require full proposal data */}
            {loadingFull ? (
              <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">
                  Loading detailed financial data for time series charts...
                </span>
              </div>
            ) : (
              <>
                {/* Cumulative Cash Flow */}
                <Card className="p-6">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold">
                      Cumulative Cash Flow Over Time
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Cash position trajectory across the 30-year projection
                    </p>
                  </div>
                  <CumulativeCashFlowComparisonChart
                    proposals={cashFlowChartData}
                    winnerId={cashFlowWinnerId}
                  />
                </Card>

                {/* Profitability */}
                <Card className="p-6">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold">
                      Profitability Over Time
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Net Income progression across the projection period
                    </p>
                  </div>
                  <ProfitabilityComparisonChart
                    proposals={profitabilityChartData}
                    winnerId={profitabilityWinnerId}
                    metric="netIncome"
                  />
                </Card>
              </>
            )}
          </TabsContent>

          {/* Tab 3: Financial Statements */}
          <TabsContent value="statements" className="space-y-6">
            {loadingFull ? (
              <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">
                  Loading detailed financial data...
                </span>
              </div>
            ) : (
              <FinancialStatementsComparison proposals={statementsData} />
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

export default function ProposalComparePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <ProposalCompareContent />
    </Suspense>
  );
}
