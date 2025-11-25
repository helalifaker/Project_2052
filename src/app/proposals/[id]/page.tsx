"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ProposalOverviewTab } from "@/components/proposals/detail/ProposalOverviewTab";
import { TransitionSetupTab } from "@/components/proposals/detail/TransitionSetupTab";
import { DynamicSetupTab } from "@/components/proposals/detail/DynamicSetupTab";
import { FinancialStatementsTab } from "@/components/proposals/detail/FinancialStatementsTab";
import { ScenariosTab } from "@/components/proposals/detail/ScenariosTab";
import { SensitivityTab } from "@/components/proposals/detail/SensitivityTab";

type ProposalData = {
  id: string;
  name: string;
  developer?: string | null;
  rentModel: string;
  calculatedAt?: string | null;
  [key: string]: unknown;
};

/**
 * Proposal Detail Page
 *
 * Week 9 Track 2B: 6-Tab Interface
 * - Tab 1: Overview (key metrics, charts, actions)
 * - Tab 2: Transition Setup (editable form)
 * - Tab 3: Dynamic Setup (sub-tabs for enrollment, curriculum, rent, opex)
 * - Tab 4: Financial Statements (P&L, BS, CF with year range selector)
 * - Tab 5: Scenarios (interactive sliders)
 * - Tab 6: Sensitivity Analysis (tornado charts)
 */
export default function ProposalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const proposalId = params.id as string;

  const [proposal, setProposal] = useState<ProposalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch proposal data
  useEffect(() => {
    async function fetchProposal() {
      try {
        setLoading(true);
        const response = await fetch(`/api/proposals/${proposalId}`);

        if (!response.ok) {
          if (response.status === 404) {
            toast.error("Proposal not found");
            router.push("/proposals");
            return;
          }
          throw new Error("Failed to fetch proposal");
        }

        const data = (await response.json()) as ProposalData;
        setProposal(data);
      } catch (error) {
        console.error("Error fetching proposal:", error);
        toast.error("Failed to load proposal");
      } finally {
        setLoading(false);
      }
    }

    if (proposalId) {
      fetchProposal();
    }
  }, [proposalId, router]);

  // Handle proposal update (from edit tabs)
  const handleProposalUpdate = (updatedProposal: Record<string, unknown>) => {
    setProposal(
      (prev) => ({ ...(prev ?? {}), ...updatedProposal }) as ProposalData,
    );
    toast.success("Proposal updated successfully");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading proposal...</p>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Proposal not found</p>
          <Button onClick={() => router.push("/proposals")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Proposals
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/proposals")}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Proposals
          </Button>
          <h1 className="text-3xl font-bold">{proposal.name}</h1>
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
      </div>

      {/* 6-Tab Interface */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transition">Transition Setup</TabsTrigger>
          <TabsTrigger value="dynamic">Dynamic Setup</TabsTrigger>
          <TabsTrigger value="financials">Financial Statements</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="sensitivity">Sensitivity</TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview */}
        <TabsContent value="overview">
          <ProposalOverviewTab
            proposal={proposal}
            onUpdate={handleProposalUpdate}
          />
        </TabsContent>

        {/* Tab 2: Transition Setup (Edit Mode) */}
        <TabsContent value="transition">
          <TransitionSetupTab
            proposal={proposal}
            onUpdate={handleProposalUpdate}
          />
        </TabsContent>

        {/* Tab 3: Dynamic Setup (Edit Mode) */}
        <TabsContent value="dynamic">
          <DynamicSetupTab
            proposal={proposal}
            onUpdate={handleProposalUpdate}
          />
        </TabsContent>

        {/* Tab 4: Financial Statements */}
        <TabsContent value="financials">
          <FinancialStatementsTab proposal={proposal} />
        </TabsContent>

        {/* Tab 5: Scenarios (Interactive Sliders) */}
        <TabsContent value="scenarios">
          <ScenariosTab proposal={proposal} />
        </TabsContent>

        {/* Tab 6: Sensitivity Analysis */}
        <TabsContent value="sensitivity">
          <SensitivityTab proposal={proposal} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
