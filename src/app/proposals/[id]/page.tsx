"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ProposalOverviewTab } from "@/components/proposals/detail/ProposalOverviewTab";
import { useRoleCheck } from "@/lib/hooks/useRoleCheck";
import { InlineEditableName } from "@/components/proposals/detail/InlineEditableName";
import { ProposalStatusSelect } from "@/components/proposals/ProposalStatusSelect";
import { BackButton } from "@/components/navigation/BackButton";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { PageSkeleton } from "@/components/states/PageSkeleton";
import { ErrorState } from "@/components/states/ErrorState";
import { Card } from "@/components/ui/card";

// PERFORMANCE OPTIMIZATION: Lazy-load heavy tab components
// These tabs contain charts (Recharts) and are only loaded when user clicks them
// This reduces initial bundle size by ~300-500KB

const TabLoadingSkeleton = () => (
  <Card className="p-6 animate-fade-in">
    <div className="space-y-6">
      <div className="h-6 w-48 bg-muted animate-shimmer rounded" />
      <div className="h-64 bg-muted animate-shimmer rounded" />
      <div className="h-32 bg-muted animate-shimmer rounded" />
    </div>
  </Card>
);

const DynamicSetupTab = dynamic(
  () =>
    import("@/components/proposals/detail/DynamicSetupTab").then((mod) => ({
      default: mod.DynamicSetupTab,
    })),
  { loading: () => <TabLoadingSkeleton />, ssr: false },
);

const FinancialStatementsTab = dynamic(
  () =>
    import("@/components/proposals/detail/FinancialStatementsTab").then(
      (mod) => ({ default: mod.FinancialStatementsTab }),
    ),
  { loading: () => <TabLoadingSkeleton />, ssr: false },
);

const ScenariosTab = dynamic(
  () =>
    import("@/components/proposals/detail/ScenariosTab").then((mod) => ({
      default: mod.ScenariosTab,
    })),
  { loading: () => <TabLoadingSkeleton />, ssr: false },
);

const SensitivityTab = dynamic(
  () =>
    import("@/components/proposals/detail/SensitivityTab").then((mod) => ({
      default: mod.SensitivityTab,
    })),
  { loading: () => <TabLoadingSkeleton />, ssr: false },
);

type ProposalData = {
  id: string;
  name: string;
  developer?: string | null;
  rentModel: string;
  status: string;
  calculatedAt?: string | null;
  [key: string]: unknown;
};

/**
 * Proposal Detail Page
 *
 * 5-Tab Interface
 * - Tab 1: Overview (key metrics, charts, actions)
 * - Tab 2: Dynamic Setup (sub-tabs for enrollment, curriculum, rent, opex)
 * - Tab 3: Financial Statements (P&L, BS, CF with year range selector)
 * - Tab 4: Scenarios (interactive sliders)
 * - Tab 5: Sensitivity Analysis (tornado charts)
 *
 * Note: Transition period configuration is now admin-only (Admin > Transition Setup)
 */
export default function ProposalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const proposalId = params.id as string;
  const { canEdit: _canEdit, isViewer } = useRoleCheck();

  const [proposal, setProposal] = useState<ProposalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch proposal data
  const fetchProposal = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/proposals/${proposalId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("PROPOSAL_NOT_FOUND");
        }
        throw new Error("Failed to fetch proposal");
      }

      const data = (await response.json()) as ProposalData;
      setProposal(data);
    } catch (err) {
      console.error("Error fetching proposal:", err);
      const errorObj =
        err instanceof Error ? err : new Error("Failed to load proposal");
      setError(errorObj);

      // Handle 404 specifically
      if (errorObj.message === "PROPOSAL_NOT_FOUND") {
        toast.error("Proposal not found");
        // Redirect after showing error state briefly
        setTimeout(() => {
          router.push("/proposals");
        }, 2000);
      } else {
        toast.error("Failed to load proposal");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (proposalId) {
      fetchProposal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposalId]);

  // Handle proposal update (from edit tabs)
  const handleProposalUpdate = (updatedProposal: Record<string, unknown>) => {
    setProposal(
      (prev) => ({ ...(prev ?? {}), ...updatedProposal }) as ProposalData,
    );
    toast.success("Proposal updated successfully");
  };

  // Refresh proposal data (for recalculations)
  const refreshProposal = async () => {
    try {
      const response = await fetch(`/api/proposals/${proposalId}`);

      if (!response.ok) {
        throw new Error("Failed to refresh proposal");
      }

      const data = (await response.json()) as ProposalData;
      setProposal(data);
    } catch (error) {
      console.error("Error refreshing proposal:", error);
      toast.error("Failed to refresh proposal data");
    }
  };

  // Loading state - show skeleton
  if (loading) {
    return (
      <div className="container max-w-[1920px] mx-auto px-6 py-8 space-y-6">
        <PageSkeleton variant="detail" />
      </div>
    );
  }

  // Error state - handle 404 and network errors
  if (error) {
    const is404 = error.message === "PROPOSAL_NOT_FOUND";

    return (
      <div className="container max-w-[1920px] mx-auto px-6 py-8">
        <ErrorState
          title={is404 ? "Proposal Not Found" : "Failed to Load Proposal"}
          description={
            is404
              ? "The proposal you're looking for doesn't exist or has been removed. Redirecting to proposals list..."
              : "We couldn't load the proposal data. This might be a temporary network issue."
          }
          reset={is404 ? undefined : fetchProposal}
          showBackButton={!is404}
          showHomeButton={!is404}
          size="full-page"
        />
      </div>
    );
  }

  // Data check - should not happen with proper error handling
  if (!proposal) {
    return (
      <div className="container max-w-[1920px] mx-auto px-6 py-8">
        <ErrorState
          title="No Data Available"
          description="Unable to display proposal information."
          showBackButton
          showHomeButton
          size="full-page"
        />
      </div>
    );
  }

  return (
    <div className="container max-w-[1920px] mx-auto px-6 py-8 space-y-8">
      {/* Navigation */}
      <div className="space-y-4">
        {/* Back Button */}
        <BackButton href="/proposals" label="Back to Proposals" />

        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Proposals", href: "/proposals" },
            { label: proposal.name },
          ]}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1 flex-1">
          <InlineEditableName
            proposalId={proposal.id}
            initialName={proposal.name}
            status={proposal.status}
            canEdit={_canEdit}
            onNameUpdated={(newName) => {
              setProposal((prev) => ({ ...prev!, name: newName }));
            }}
          />
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {proposal.developer && <span>Developer: {proposal.developer}</span>}
            <span>Model: {proposal.rentModel}</span>
            {proposal.calculatedAt && (
              <span>
                Calculated:{" "}
                {new Date(proposal.calculatedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        {/* Status Dropdown */}
        <ProposalStatusSelect
          proposalId={proposal.id}
          currentStatus={proposal.status}
          onStatusChange={(newStatus) => {
            setProposal((prev) =>
              prev ? { ...prev, status: newStatus } : null,
            );
          }}
        />
      </div>

      {/* 5-Tab Interface */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="flex w-auto justify-start border-b bg-transparent p-0">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="dynamic"
            disabled={isViewer}
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
          >
            Dynamic Setup {isViewer && "(Read-only)"}
          </TabsTrigger>
          <TabsTrigger
            value="financials"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
          >
            Financial Statements
          </TabsTrigger>
          <TabsTrigger
            value="scenarios"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
          >
            Scenarios
          </TabsTrigger>
          <TabsTrigger
            value="sensitivity"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
          >
            Sensitivity
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview */}
        <TabsContent value="overview">
          <ProposalOverviewTab
            proposal={proposal}
            onUpdate={handleProposalUpdate}
          />
        </TabsContent>

        {/* Tab 2: Dynamic Setup (Edit Mode) */}
        <TabsContent value="dynamic">
          <DynamicSetupTab
            proposal={proposal}
            onUpdate={handleProposalUpdate}
          />
        </TabsContent>

        {/* Tab 3: Financial Statements */}
        <TabsContent value="financials">
          <FinancialStatementsTab
            proposal={proposal}
            onRecalculated={refreshProposal}
          />
        </TabsContent>

        {/* Tab 4: Scenarios (Interactive Sliders) */}
        <TabsContent value="scenarios">
          <ScenariosTab proposal={proposal} />
        </TabsContent>

        {/* Tab 5: Sensitivity Analysis */}
        <TabsContent value="sensitivity">
          <SensitivityTab proposal={proposal} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
