"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Filter } from "lucide-react";
import {
  NegotiationCard,
  NegotiationCardSkeleton,
  CreateNegotiationDialog,
  AddCounterDialog,
  ReorderOffersDialog,
  LinkProposalDialog,
} from "@/components/negotiations";
import type { NegotiationCardProps } from "@/components/negotiations";
import {
  NegotiationStatus,
  ProposalOrigin,
  ProposalStatus,
} from "@/lib/types/roles";

/**
 * Filter options for negotiation status
 */
const STATUS_FILTERS = [
  { value: "all", label: "All Negotiations" },
  { value: "active", label: "Active Only" },
  { value: "closed", label: "Closed" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "REJECTED", label: "Rejected" },
];

/**
 * Loading fallback for Suspense boundary
 */
function NegotiationsLoadingFallback() {
  return (
    <DashboardLayout breadcrumbs={[{ label: "Negotiations" }]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">
              Negotiations
            </h1>
            <p className="text-muted-foreground">
              Track lease negotiations with developers and manage offer
              timelines.
            </p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 atelier-reveal-stagger">
          {[1, 2, 3, 4].map((i) => (
            <NegotiationCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

/**
 * Main Negotiations Page Content
 *
 * Lists all negotiations using NegotiationCard components.
 * Supports filtering by status and creating new negotiations.
 *
 * Key changes from v2.1:
 * - Uses explicit Negotiation entity (not implicit developer+property grouping)
 * - Uses NegotiationCard component for consistent display
 * - Supports counter-offer creation via dialog
 */
function NegotiationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [loading, setLoading] = useState(true);
  const [negotiations, setNegotiations] = useState<
    NegotiationCardProps["negotiation"][]
  >([]);
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "active",
  );

  // Dialog states
  const [addCounterOpen, setAddCounterOpen] = useState(false);
  const [addCounterData, setAddCounterData] = useState<{
    negotiationId: string;
    proposalId: string;
    proposalName: string;
    offerNumber: number | null;
  } | null>(null);

  const [reorderOpen, setReorderOpen] = useState(false);
  const [reorderNegotiationId, setReorderNegotiationId] = useState<
    string | null
  >(null);
  const [reorderOffers, setReorderOffers] = useState<
    Array<{
      id: string;
      name: string;
      offerNumber: number | null;
      origin: ProposalOrigin;
      status: ProposalStatus;
    }>
  >([]);

  const [linkProposalOpen, setLinkProposalOpen] = useState(false);
  const [linkNegotiationId, setLinkNegotiationId] = useState<string | null>(
    null,
  );
  const [linkOfferCount, setLinkOfferCount] = useState(0);

  // Fetch negotiations
  const fetchNegotiations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/negotiations?status=${statusFilter}`);
      const json = await res.json();

      // Transform API response to card props format
      const transformed: NegotiationCardProps["negotiation"][] = (
        json.negotiations || []
      ).map(
        (neg: {
          id: string;
          developer: string;
          property: string;
          status: NegotiationStatus;
          notes: string | null;
          updatedAt: string;
          createdAt: string;
          proposalCount: number;
          ourOffers: number;
          theirCounters: number;
          latestOffer: {
            id: string;
            name: string;
            offerNumber: number | null;
            origin: ProposalOrigin;
            status: ProposalStatus;
            updatedAt: string;
          } | null;
          latestMetrics: {
            totalRent?: number | string | null;
            npv?: number | string | null;
            irr?: number | string | null;
          } | null;
          proposals: Array<{
            id: string;
            name: string;
            offerNumber: number | null;
            origin: ProposalOrigin;
            status: ProposalStatus;
            metrics: Record<string, unknown> | null;
            updatedAt: string;
          }>;
        }) => ({
          id: neg.id,
          developer: neg.developer,
          property: neg.property,
          status: neg.status,
          notes: neg.notes,
          updatedAt: neg.updatedAt,
          createdAt: neg.createdAt,
          proposalCount: neg.proposalCount,
          ourOffers: neg.ourOffers,
          theirCounters: neg.theirCounters,
          latestOffer: neg.latestOffer,
          latestMetrics: neg.latestMetrics,
          proposals: (neg.proposals ?? []).map((p) => ({
            id: p.id,
            name: p.name,
            offerNumber: p.offerNumber,
            origin: p.origin,
            status: p.status,
            updatedAt: p.updatedAt,
            metrics: p.metrics as {
              totalRent?: number | string;
              npv?: number | string;
              irr?: number | string;
            } | null,
          })),
        }),
      );

      setNegotiations(transformed);
    } catch (error) {
      console.error("Failed to load negotiations", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchNegotiations();
  }, [fetchNegotiations]);

  // Update URL when filter changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (statusFilter === "active") {
      params.delete("status");
    } else {
      params.set("status", statusFilter);
    }
    router.replace(`/negotiations?${params.toString()}`, { scroll: false });
  }, [statusFilter, router, searchParams]);

  // Handlers for card actions
  const handleAddCounter = (negotiationId: string, proposalId: string) => {
    const neg = negotiations.find((n) => n.id === negotiationId);
    const proposal = neg?.proposals.find((p) => p.id === proposalId);
    if (proposal) {
      setAddCounterData({
        negotiationId,
        proposalId: proposal.id,
        proposalName: proposal.name,
        offerNumber: proposal.offerNumber,
      });
      setAddCounterOpen(true);
    }
  };

  const handleReorderOffers = (negotiationId: string) => {
    const neg = negotiations.find((n) => n.id === negotiationId);
    if (neg) {
      setReorderNegotiationId(negotiationId);
      setReorderOffers(
        neg.proposals.map((p) => ({
          id: p.id,
          name: p.name,
          offerNumber: p.offerNumber,
          origin: p.origin,
          status: p.status,
        })),
      );
      setReorderOpen(true);
    }
  };

  const handleLinkProposal = (negotiationId: string) => {
    const neg = negotiations.find((n) => n.id === negotiationId);
    if (neg) {
      setLinkNegotiationId(negotiationId);
      setLinkOfferCount(neg.proposalCount);
      setLinkProposalOpen(true);
    }
  };

  const handleDialogSuccess = () => {
    fetchNegotiations();
  };

  const handleNegotiationCreated = (negotiation: {
    id: string;
    developer: string;
    property: string;
  }) => {
    router.push(`/negotiations/detail/${negotiation.id}`);
  };

  return (
    <DashboardLayout
      breadcrumbs={[{ label: "Negotiations" }]}
      actions={
        <CreateNegotiationDialog
          onSuccess={handleNegotiationCreated}
          trigger={
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Negotiation
            </Button>
          }
        />
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">
              Negotiations
            </h1>
            <p className="text-muted-foreground">
              Track lease negotiations with developers and manage offer
              timelines.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="grid gap-6 md:grid-cols-2 atelier-reveal-stagger">
            {[1, 2, 3, 4].map((i) => (
              <NegotiationCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Negotiations grid */}
        {!loading && negotiations.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 atelier-reveal-stagger">
            {negotiations.map((negotiation) => (
              <NegotiationCard
                key={negotiation.id}
                negotiation={negotiation}
                onAddCounter={handleAddCounter}
                onReorderOffers={handleReorderOffers}
                onLinkProposal={handleLinkProposal}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && negotiations.length === 0 && (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <h3 className="text-lg font-medium mb-2">No negotiations found</h3>
            <p className="text-muted-foreground mb-6">
              {statusFilter === "active"
                ? "You don't have any active negotiations yet."
                : "No negotiations match this filter."}
            </p>
            <CreateNegotiationDialog
              onSuccess={handleNegotiationCreated}
              trigger={
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Start Your First Negotiation
                </Button>
              }
            />
          </div>
        )}
      </div>

      {/* Dialogs */}
      {addCounterData && (
        <AddCounterDialog
          open={addCounterOpen}
          onOpenChange={setAddCounterOpen}
          negotiationId={addCounterData.negotiationId}
          sourceProposalId={addCounterData.proposalId}
          sourceProposalName={addCounterData.proposalName}
          sourceOfferNumber={addCounterData.offerNumber}
          onSuccess={handleDialogSuccess}
        />
      )}

      {reorderNegotiationId && (
        <ReorderOffersDialog
          open={reorderOpen}
          onOpenChange={setReorderOpen}
          negotiationId={reorderNegotiationId}
          offers={reorderOffers}
          onSuccess={handleDialogSuccess}
        />
      )}

      {linkNegotiationId && (
        <LinkProposalDialog
          open={linkProposalOpen}
          onOpenChange={setLinkProposalOpen}
          negotiationId={linkNegotiationId}
          currentOfferCount={linkOfferCount}
          onSuccess={handleDialogSuccess}
        />
      )}
    </DashboardLayout>
  );
}

/**
 * Negotiations Page with Suspense boundary
 *
 * Wraps NegotiationsContent in Suspense to support useSearchParams()
 * during static generation. Shows skeleton cards while loading.
 */
export default function NegotiationsPage() {
  return (
    <Suspense fallback={<NegotiationsLoadingFallback />}>
      <NegotiationsContent />
    </Suspense>
  );
}
