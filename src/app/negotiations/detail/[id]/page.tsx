"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Plus,
  RefreshCw,
  Link2,
  MoreHorizontal,
  Loader2,
  Edit,
  Trash2,
  FileText,
  AlertCircle,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Decimal from "decimal.js";
import {
  NegotiationStatus,
  ProposalOrigin,
  ProposalStatus,
} from "@/lib/types/roles";
import { formatMillions } from "@/lib/formatting/millions";
import {
  NegotiationStatusBadge,
  NegotiationTimeline,
  AddCounterDialog,
  ReorderOffersDialog,
  LinkProposalDialog,
  StatusBadge,
  OfferTrendsCard,
} from "@/components/negotiations";
import type { TimelineOffer, OfferTrendData } from "@/components/negotiations";

/**
 * Negotiation data from API
 */
interface NegotiationData {
  id: string;
  developer: string;
  property: string;
  status: NegotiationStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    name: string | null;
  } | null;
  proposals: Array<{
    id: string;
    name: string;
    rentModel: string;
    offerNumber: number | null;
    origin: ProposalOrigin;
    status: ProposalStatus;
    version: string | null;
    metrics: Record<string, unknown> | null;
    createdAt: string;
    updatedAt: string;
  }>;
  summary?: {
    totalProposals: number;
    ourOffers: number;
    theirCounters: number;
    latestMetrics: {
      totalRent?: number | string | null;
      npv?: number | string | null;
      irr?: number | string | null;
    } | null;
  };
}

/**
 * Negotiation Detail Page
 *
 * Shows full negotiation timeline with:
 * - Header with status, developer, property
 * - Full timeline of all offers
 * - Actions: Add counter, link proposal, reorder
 * - Status management
 * - Notes editing
 */
export default function NegotiationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const negotiationId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [negotiation, setNegotiation] = useState<NegotiationData | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState("");

  // Dialog states
  const [addCounterOpen, setAddCounterOpen] = useState(false);
  const [addCounterSource, setAddCounterSource] = useState<{
    id: string;
    name: string;
    offerNumber: number | null;
  } | null>(null);
  const [reorderOpen, setReorderOpen] = useState(false);
  const [linkProposalOpen, setLinkProposalOpen] = useState(false);

  // Fetch negotiation data
  const fetchNegotiation = useCallback(async () => {
    try {
      const response = await fetch(`/api/negotiations/${negotiationId}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError("Negotiation not found");
        } else {
          setError("Failed to load negotiation");
        }
        return;
      }
      const data = await response.json();
      setNegotiation(data);
      setNotesValue(data.notes || "");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [negotiationId]);

  useEffect(() => {
    fetchNegotiation();
  }, [fetchNegotiation]);

  // Update negotiation status
  const handleStatusChange = async (newStatus: NegotiationStatus) => {
    if (!negotiation) return;
    setIsUpdating(true);

    try {
      const response = await fetch(`/api/negotiations/${negotiationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setNegotiation((prev) =>
          prev ? { ...prev, status: newStatus } : null,
        );
      }
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Save notes
  const handleSaveNotes = async () => {
    if (!negotiation) return;
    setIsUpdating(true);

    try {
      const response = await fetch(`/api/negotiations/${negotiationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesValue || null }),
      });

      if (response.ok) {
        setNegotiation((prev) =>
          prev ? { ...prev, notes: notesValue || null } : null,
        );
        setEditingNotes(false);
      }
    } catch (err) {
      console.error("Failed to save notes", err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Open add counter dialog
  const handleAddCounter = (proposalId: string) => {
    const proposal = negotiation?.proposals.find((p) => p.id === proposalId);
    if (proposal) {
      setAddCounterSource({
        id: proposal.id,
        name: proposal.name,
        offerNumber: proposal.offerNumber,
      });
      setAddCounterOpen(true);
    }
  };

  // Refresh after any dialog action
  const handleDialogSuccess = () => {
    fetchNegotiation();
  };

  if (loading) {
    return (
      <DashboardLayout
        breadcrumbs={[
          { label: "Negotiations", href: "/negotiations" },
          { label: "Loading..." },
        ]}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !negotiation) {
    return (
      <DashboardLayout
        breadcrumbs={[
          { label: "Negotiations", href: "/negotiations" },
          { label: "Error" },
        ]}
      >
        <Alert variant="destructive" className="max-w-lg mx-auto mt-8">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || "Negotiation not found"}
          </AlertDescription>
        </Alert>
        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            onClick={() => router.push("/negotiations")}
          >
            Back to Negotiations
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Convert proposals to timeline format
  const timelineOffers: TimelineOffer[] = negotiation.proposals.map((p) => ({
    id: p.id,
    name: p.name,
    offerNumber: p.offerNumber,
    origin: p.origin,
    status: p.status,
    updatedAt: p.updatedAt,
    metrics: p.metrics as TimelineOffer["metrics"],
  }));

  // Convert proposals to offer trend format (for OfferTrendsCard)
  const offerTrendData: OfferTrendData[] = negotiation.proposals
    .filter((p) => p.offerNumber != null)
    .map((p) => ({
      id: p.id,
      name: p.name,
      offerNumber: p.offerNumber as number,
      origin: p.origin,
      metrics: p.metrics as OfferTrendData["metrics"],
    }));

  // Latest proposal for counter-offer
  const latestProposal =
    negotiation.proposals.length > 0
      ? [...negotiation.proposals].sort(
          (a, b) => (b.offerNumber ?? 0) - (a.offerNumber ?? 0),
        )[0]
      : null;

  // Format metrics - use optional chaining for defensive access
  const metrics = negotiation.summary?.latestMetrics;
  const totalRent = metrics?.totalRent
    ? formatMillions(new Decimal(metrics.totalRent))
    : null;
  // npv and irr are available but not displayed in this summary view
  const _npv = metrics?.npv ? formatMillions(new Decimal(metrics.npv)) : null;
  const _irr = metrics?.irr
    ? `${(Number(metrics.irr) * 100).toFixed(1)}%`
    : null;

  // Compute summary counts with fallbacks (in case API doesn't return summary)
  const totalProposals =
    negotiation.summary?.totalProposals ?? negotiation.proposals.length;
  const ourOffers =
    negotiation.summary?.ourOffers ??
    negotiation.proposals.filter((p) => p.origin === ProposalOrigin.OUR_OFFER)
      .length;
  const theirCounters =
    negotiation.summary?.theirCounters ??
    negotiation.proposals.filter(
      (p) => p.origin === ProposalOrigin.THEIR_COUNTER,
    ).length;

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Negotiations", href: "/negotiations" },
        { label: `${negotiation.developer} - ${negotiation.property}` },
      ]}
      actions={
        <div className="flex items-center gap-2">
          {negotiation.status === NegotiationStatus.ACTIVE &&
            latestProposal && (
              <Button
                onClick={() => handleAddCounter(latestProposal.id)}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Counter
              </Button>
            )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLinkProposalOpen(true)}>
                <Link2 className="h-4 w-4 mr-2" />
                Link Proposal
              </DropdownMenuItem>
              {negotiation.proposals.length > 1 && (
                <DropdownMenuItem onClick={() => setReorderOpen(true)}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reorder Offers
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  // TODO: Implement delete confirmation
                  if (confirm("Delete this negotiation?")) {
                    fetch(`/api/negotiations/${negotiationId}`, {
                      method: "DELETE",
                    }).then(() => router.push("/negotiations"));
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Negotiation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Back link */}
        <Link
          href="/negotiations"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Negotiations
        </Link>

        {/* Header Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-2xl font-serif">
                  <Building2 className="h-6 w-6 text-muted-foreground" />
                  {negotiation.developer}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 text-base">
                  <MapPin className="h-4 w-4" />
                  {negotiation.property}
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <NegotiationStatusBadge status={negotiation.status} size="lg" />
                <Select
                  value={negotiation.status}
                  onValueChange={(value) =>
                    handleStatusChange(value as NegotiationStatus)
                  }
                  disabled={isUpdating}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(NegotiationStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-b">
              <div>
                <p className="text-sm text-muted-foreground">Total Offers</p>
                <p className="text-2xl font-semibold tabular-nums">
                  {totalProposals}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Our Offers</p>
                <p
                  className="text-2xl font-semibold tabular-nums inline-flex items-center gap-2"
                  style={{ color: "var(--atelier-chart-proposal-b)" }}
                >
                  <span className="w-3 h-3 rounded-full bg-current" />
                  {ourOffers}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Their Counters</p>
                <p
                  className="text-2xl font-semibold tabular-nums inline-flex items-center gap-2"
                  style={{ color: "var(--accent-gold)" }}
                >
                  <span className="w-3 h-3 rounded-full bg-current" />
                  {theirCounters}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Latest Metrics</p>
                {totalRent ? (
                  <p className="text-lg font-medium tabular-nums">
                    SAR {totalRent}
                  </p>
                ) : (
                  <p className="text-muted-foreground">-</p>
                )}
              </div>
            </div>

            {/* Notes section */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Notes
                </h3>
                {!editingNotes && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingNotes(true)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
              {editingNotes ? (
                <div className="space-y-2">
                  <Textarea
                    value={notesValue}
                    onChange={(e) => setNotesValue(e.target.value)}
                    rows={3}
                    placeholder="Add notes about this negotiation..."
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setNotesValue(negotiation.notes || "");
                        setEditingNotes(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveNotes}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      ) : null}
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {negotiation.notes || "No notes yet."}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Offer Trends Section - shows metric evolution across offers */}
        <OfferTrendsCard offers={offerTrendData} />

        {/* Timeline Section */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Full Timeline */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Negotiation Timeline</CardTitle>
              <CardDescription>
                All offers in chronological order
              </CardDescription>
            </CardHeader>
            <CardContent>
              {timelineOffers.length > 0 ? (
                <NegotiationTimeline
                  offers={timelineOffers}
                  negotiationId={negotiationId}
                  maxItems={50}
                  showViewAll={false}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No offers yet.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setLinkProposalOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Link First Proposal
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Proposals List */}
          <Card>
            <CardHeader>
              <CardTitle>Proposals</CardTitle>
              <CardDescription>Quick access to all proposals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {negotiation.proposals
                .sort((a, b) => (b.offerNumber ?? 0) - (a.offerNumber ?? 0))
                .map((proposal) => (
                  <Link
                    key={proposal.id}
                    href={`/proposals/${proposal.id}`}
                    className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{proposal.name}</p>
                        <p className="text-xs text-muted-foreground">
                          #{proposal.offerNumber ?? "?"} • {proposal.rentModel}
                        </p>
                      </div>
                      <StatusBadge
                        status={proposal.status}
                        origin={proposal.origin}
                      />
                    </div>
                  </Link>
                ))}
              {negotiation.proposals.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No proposals linked
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      {addCounterSource && (
        <AddCounterDialog
          open={addCounterOpen}
          onOpenChange={setAddCounterOpen}
          negotiationId={negotiationId}
          sourceProposalId={addCounterSource.id}
          sourceProposalName={addCounterSource.name}
          sourceOfferNumber={addCounterSource.offerNumber}
          onSuccess={handleDialogSuccess}
        />
      )}

      <ReorderOffersDialog
        open={reorderOpen}
        onOpenChange={setReorderOpen}
        negotiationId={negotiationId}
        offers={negotiation.proposals.map((p) => ({
          id: p.id,
          name: p.name,
          offerNumber: p.offerNumber,
          origin: p.origin,
          status: p.status,
        }))}
        onSuccess={handleDialogSuccess}
      />

      <LinkProposalDialog
        open={linkProposalOpen}
        onOpenChange={setLinkProposalOpen}
        negotiationId={negotiationId}
        currentOfferCount={negotiation.proposals.length}
        onSuccess={handleDialogSuccess}
      />
    </DashboardLayout>
  );
}
