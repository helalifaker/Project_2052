"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import { ComparisonTable, ProposalSummary } from "@/components/proposals/comparison/ComparisonTable";
import { ComparisonMetricsTable } from "@/components/proposals/comparison/ComparisonMetricsTable";
import { FinancialStatementsComparison } from "@/components/proposals/comparison/FinancialStatementsComparison";
import { RentTrajectoryComparisonChart } from "@/components/proposals/comparison/RentTrajectoryComparisonChart";
import { CostBreakdownComparisonChart } from "@/components/proposals/comparison/CostBreakdownComparisonChart";
import { DeltaToggle } from "@/components/proposals/comparison/DeltaToggle";

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
  metrics?: ProposalSummary['metrics'];
};

function ProposalCompareContent() {
  const router = useRouter();
  const params = useSearchParams();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- params.toString() used for cache key
  const selectedIds = useMemo(() => params.getAll("ids"), [params.toString()]);

  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<ProposalSummary[]>([]);
  const [deltaMode, setDeltaMode] = useState(false);
  const [fullProposals, setFullProposals] = useState<Map<string, FullProposal>>(new Map());
  const [loadingFull, setLoadingFull] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Load proposal metrics (fast initial load)
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/proposals?includeMetrics=true");
        const data = await res.json();
        const all: ProposalSummary[] = data.proposals || [];
        const filtered =
          selectedIds.length > 0
            ? all.filter((p) => selectedIds.includes(p.id))
            : all.slice(0, 3);
        setProposals(filtered);
      } catch (error) {
        console.error("Failed to load proposals for comparison", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedIds]);

  // Load full proposal data (lazy load when navigating to Visual/Statements tabs)
  const loadFullProposalData = async () => {
    if (proposals.length === 0) return;

    setLoadingFull(true);
    setError(null);

    try {
      const fullDataMap = new Map<string, FullProposal>();

      // Parallel fetch all proposals
      const fetchPromises = proposals.map(async (p) => {
        const res = await fetch(`/api/proposals/${p.id}`);
        if (!res.ok) throw new Error(`Failed to fetch proposal ${p.id}`);
        const data = await res.json();
        return { id: p.id, data };
      });

      const results = await Promise.all(fetchPromises);
      results.forEach(({ id, data }) => fullDataMap.set(id, data));

      setFullProposals(fullDataMap);
    } catch (err) {
      console.error("Failed to load full proposal data", err);
      setError("Unable to load detailed financial data. Please try again.");
    } finally {
      setLoadingFull(false);
    }
  };

  // Trigger full data load when navigating away from Overview tab
  useEffect(() => {
    if (activeTab !== "overview" && fullProposals.size === 0 && proposals.length > 0) {
      loadFullProposalData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, proposals]);

  // Data transformations for charts
  const rentChartData = useMemo(() =>
    proposals.map(p => ({
      id: p.id,
      name: p.name,
      developer: p.developer ?? undefined,
      rentModel: p.rentModel,
      financials: {
        years: fullProposals.get(p.id)?.financials?.map(f => ({
          year: f.year,
          rent: f.profitLoss?.rentExpense || 0
        })) || []
      },
      metrics: p.metrics
    }))
  , [proposals, fullProposals]);

  const costChartData = useMemo(() =>
    proposals.map(p => ({
      id: p.id,
      name: p.name,
      developer: p.developer ?? undefined,
      rentModel: p.rentModel,
      financials: {
        years: fullProposals.get(p.id)?.financials?.map(f => ({
          year: f.year,
          rent: f.profitLoss?.rentExpense || 0,
          staffSalaries: f.profitLoss?.staffCosts || 0,
          otherOpEx: f.profitLoss?.otherOpex || 0
        })) || []
      },
      metrics: p.metrics
    }))
  , [proposals, fullProposals]);

  const statementsData = useMemo(() =>
    proposals.map(p => ({
      id: p.id,
      name: p.name,
      developer: p.developer ?? undefined,
      rentModel: p.rentModel,
      financials: fullProposals.get(p.id)?.financials || []
    }))
  , [proposals, fullProposals]);

  // Transform for ComparisonMetricsTable (convert null to undefined)
  const metricsTableData = useMemo(() =>
    proposals.map(p => ({
      ...p,
      developer: p.developer ?? undefined
    }))
  , [proposals]);

  // Find winner (lowest rent is best)
  const rentWinnerId = useMemo(() => {
    if (proposals.length === 0) return undefined;
    const sorted = [...proposals].sort((a, b) =>
      (a.metrics?.totalRent || Infinity) - (b.metrics?.totalRent || Infinity)
    );
    return sorted[0].id;
  }, [proposals]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
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
          <AlertDescription>
            {error}
            <Button variant="link" className="ml-2" onClick={loadFullProposalData}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Empty State */}
      {proposals.length === 0 && !loading && (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <h3 className="text-lg font-semibold mb-2">No Proposals Selected</h3>
          <p className="text-muted-foreground mb-4">
            Select 2-5 proposals from the proposals list to compare
          </p>
          <Button onClick={() => router.push('/proposals')}>
            Browse Proposals
          </Button>
        </div>
      )}

      {/* Tabbed Content */}
      {proposals.length > 0 && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="visual">Visual Analysis</TabsTrigger>
            <TabsTrigger value="statements">Financial Statements</TabsTrigger>
          </TabsList>

          {/* Tab 1: Overview */}
          <TabsContent value="overview" className="space-y-6">
            {/* Baseline Note */}
            <div className="bg-muted/30 p-4 rounded-lg text-sm text-muted-foreground">
              <p>
                <strong>Note:</strong> The first proposal (leftmost) is treated as the
                <span className="text-primary font-semibold"> Baseline</span>.
                Enable &quot;Delta View&quot; to see how other proposals compare against it.
              </p>
            </div>

            {/* Quick Comparison */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Quick Comparison</h2>
              <ComparisonTable proposals={proposals} deltaMode={deltaMode} />
            </div>

            {/* Detailed Metrics */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Detailed Metrics</h2>
              <ComparisonMetricsTable proposals={metricsTableData} />
            </div>
          </TabsContent>

          {/* Tab 2: Visual Analysis */}
          <TabsContent value="visual" className="space-y-6">
            {loadingFull ? (
              <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">
                  Loading detailed financial data...
                </span>
              </div>
            ) : (
              <>
                {/* Rent Trajectory */}
                <div>
                  <h2 className="text-xl font-semibold mb-2">Rent Trajectory</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    See how rent evolves over the full contract period
                  </p>
                  <RentTrajectoryComparisonChart
                    proposals={rentChartData}
                    winnerId={rentWinnerId}
                  />
                </div>

                {/* Cost Breakdown */}
                <div>
                  <h2 className="text-xl font-semibold mb-2">Total Cost Analysis</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Compare total costs broken down by category
                  </p>
                  <CostBreakdownComparisonChart
                    proposals={costChartData}
                    winnerId={rentWinnerId}
                  />
                </div>
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
