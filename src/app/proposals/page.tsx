"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProposalCard } from "@/components/proposals/ProposalCard";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, Filter, Grid, List, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import Decimal from "decimal.js";
import { useRoleCheck } from "@/lib/hooks/useRoleCheck";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { PageSkeleton } from "@/components/states/PageSkeleton";
import { EmptyState, EmptyStates } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";

type ProposalMetrics = {
  totalRent?: Decimal;
  npv?: Decimal;
  totalEbitda?: Decimal;
  // Contract period metrics
  contractTotalRent?: Decimal;
  contractRentNPV?: Decimal;
  contractTotalEbitda?: Decimal;
  contractEndYear?: number;
};

type ProposalListItem = {
  id: string;
  name: string;
  developer: string | null;
  rentModel: string | null;
  metrics?: ProposalMetrics;
  createdAt?: string;
  updatedAt?: string;
  status?: string | null;
};

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "READY_TO_SUBMIT", label: "Ready to Submit" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "COUNTER_RECEIVED", label: "Counter Received" },
  { value: "EVALUATING_COUNTER", label: "Evaluating Counter" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "REJECTED", label: "Rejected" },
  { value: "NEGOTIATION_CLOSED", label: "Closed" },
] as const;

const RENT_MODEL_OPTIONS = [
  { value: "ALL", label: "All Models" },
  { value: "FIXED", label: "Fixed" },
  { value: "REVSHARE", label: "RevShare" },
  { value: "PARTNER", label: "Partner" },
] as const;

const toDecimalOrUndefined = (value: unknown): Decimal | undefined => {
  if (value === null || value === undefined) return undefined;
  if (Decimal.isDecimal(value)) return value as Decimal;
  if (typeof value === "number" || typeof value === "string") {
    return new Decimal(value);
  }
  return undefined;
};

const normalizeRentModel = (value?: string | null) =>
  value?.toUpperCase() ?? "";
const normalizeStatus = (value?: string | null) => value?.toUpperCase() ?? "";

export default function ProposalsListPage() {
  const router = useRouter();
  const { canCreate, canDelete, isViewer } = useRoleCheck();
  const [proposals, setProposals] = useState<ProposalListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterModel, setFilterModel] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("updatedAt");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);

  const loadProposals = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch("/api/proposals?includeMetrics=true");

      if (!res.ok) {
        throw new Error(`Failed to fetch proposals: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      const payload = data.data || data.proposals || [];
      const normalized = (payload as Array<Record<string, unknown>>).map(
        (proposal) => {
          const metrics =
            proposal.metrics &&
              typeof proposal.metrics === "object" &&
              !Array.isArray(proposal.metrics)
              ? (proposal.metrics as Record<string, unknown>)
              : undefined;
          return {
            id:
              typeof proposal.id === "string"
                ? proposal.id
                : String(proposal.id ?? ""),
            name:
              typeof proposal.name === "string"
                ? proposal.name
                : "Untitled Proposal",
            rentModel:
              typeof proposal.rentModel === "string"
                ? proposal.rentModel
                : null,
            developer:
              typeof proposal.developer === "string"
                ? proposal.developer
                : null,
            status:
              typeof proposal.status === "string" ? proposal.status : null,
            createdAt:
              typeof proposal.createdAt === "string"
                ? proposal.createdAt
                : undefined,
            updatedAt:
              typeof proposal.updatedAt === "string"
                ? proposal.updatedAt
                : undefined,
            metrics: metrics
              ? {
                totalRent: toDecimalOrUndefined(metrics.totalRent),
                npv: toDecimalOrUndefined(metrics.npv),
                totalEbitda: toDecimalOrUndefined(metrics.totalEbitda),
                contractTotalRent: toDecimalOrUndefined(metrics.contractTotalRent),
                contractRentNPV: toDecimalOrUndefined(metrics.contractRentNPV),
                contractTotalEbitda: toDecimalOrUndefined(metrics.contractTotalEbitda),
                contractEndYear: typeof metrics.contractEndYear === 'number' ? metrics.contractEndYear : undefined,
              }
              : undefined,
          };
        },
      );
      setProposals(normalized);
    } catch (err) {
      console.error("Failed to load proposals", err);
      setError(err instanceof Error ? err : new Error("Failed to load proposals"));
      toast.error("Failed to load proposals");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProposals();
  }, []);

  // Filter and sort proposals
  const filteredProposals = useMemo(() => {
    let filtered = [...proposals];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((proposal) =>
        (proposal.developer || proposal.name || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
      );
    }

    // Status filter
    if (filterStatus !== "ALL") {
      filtered = filtered.filter(
        (proposal) => normalizeStatus(proposal.status) === filterStatus,
      );
    }

    // Model filter
    if (filterModel !== "ALL") {
      filtered = filtered.filter(
        (proposal) => normalizeRentModel(proposal.rentModel) === filterModel,
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "updatedAt":
          return (
            new Date(b.updatedAt || 0).getTime() -
            new Date(a.updatedAt || 0).getTime()
          );
        case "createdAt":
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
        case "totalRent":
          return (
            (b.metrics?.totalRent?.toNumber() || 0) -
            (a.metrics?.totalRent?.toNumber() || 0)
          );
        case "npv":
          return (
            (b.metrics?.npv?.toNumber() || 0) -
            (a.metrics?.npv?.toNumber() || 0)
          );
        case "developerName":
          return (a.developer || "").localeCompare(b.developer || "");
        default:
          return 0;
      }
    });

    return filtered;
  }, [proposals, searchQuery, filterStatus, filterModel, sortBy]);

  const handleCreateProposal = () => {
    router.push("/proposals/new");
  };

  const handleViewProposal = (id: string) => {
    router.push(`/proposals/${id}`);
  };

  const handleEditProposal = (id: string) => {
    router.push(`/proposals/${id}/edit`);
  };

  const handleDuplicateProposal = async (id: string) => {
    try {
      toast.info("Duplicating proposal...");

      const response = await fetch(`/api/proposals/${id}/duplicate`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to duplicate proposal");
      }

      const newProposal = await response.json();
      toast.success("Proposal duplicated successfully");
      router.push(`/proposals/${newProposal.id}`);
    } catch (error) {
      console.error("Error duplicating proposal:", error);
      toast.error("Failed to duplicate proposal");
    }
  };

  const handleDeleteProposal = (id: string) => {
    fetch(`/api/proposals/${id}`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete");
        toast.success(`Proposal ${id} deleted`);
        setProposals((prev) => prev.filter((p) => p.id !== id));
      })
      .catch(() => toast.error("Failed to delete proposal"));
  };

  const handleExportProposal = async (id: string) => {
    try {
      const res = await fetch(`/api/proposals/${id}/export/excel`);
      if (!res.ok) {
        throw new Error("Failed to export to Excel");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `proposal-${id}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success(`Exported proposal ${id} to Excel`);
    } catch (error) {
      console.error("Failed to export proposal", error);
      toast.error("Failed to export proposal");
    }
  };

  const handleCompareProposals = () => {
    const idsParam = Array.from(selectedIds);
    const query = idsParam.length
      ? `?${idsParam.map((id) => `ids=${id}`).join("&")}`
      : "";
    router.push(`/proposals/compare${query}`);
  };

  // Multi-select handlers
  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    setSelectedIds(new Set(filteredProposals.map((p) => p.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setIsSelecting(false);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    try {
      const response = await fetch("/api/proposals/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalIds: Array.from(selectedIds) }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete proposals");
      }

      const result = await response.json();
      toast.success(`Deleted ${result.deleted} proposal(s)`);

      if (result.failed > 0) {
        toast.error(`Failed to delete ${result.failed} proposal(s)`);
      }

      clearSelection();
      setProposals((prev) =>
        prev.filter((proposal) => !selectedIds.has(proposal.id)),
      );
    } catch (error) {
      console.error("Error deleting proposals:", error);
      toast.error("Failed to delete proposals");
    }
  };

  const handleBulkCompare = () => {
    if (selectedIds.size < 2) {
      toast.error("Please select at least 2 proposals to compare");
      return;
    }

    if (selectedIds.size > 5) {
      toast.error("You can compare up to 5 proposals at a time");
      return;
    }

    const ids = Array.from(selectedIds).join(",");
    router.push(`/proposals/compare?ids=${ids}`);
  };

  // Handle error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* Breadcrumbs */}
          <Breadcrumbs
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Proposals" }
            ]}
          />

          {/* Error State */}
          <ErrorState
            error={error}
            title="Failed to Load Proposals"
            description="We couldn't fetch your lease proposals. This might be a temporary network issue."
            reset={loadProposals}
            showBackButton
          />
        </div>
      </DashboardLayout>
    );
  }

  // Handle loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* Breadcrumbs */}
          <Breadcrumbs
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Proposals" }
            ]}
          />

          {/* Loading Skeleton */}
          <PageSkeleton variant="list" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      breadcrumbs={[{ label: "Proposals" }]}
      actions={
        canCreate && (
          <Button onClick={handleCreateProposal} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            New Proposal
          </Button>
        )
      }
    >
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Proposals" }
          ]}
        />
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Rent Proposals</h1>
            <p className="text-muted-foreground mt-2">
              Create and manage rent proposals for different developers
            </p>
          </div>
          <div className="flex gap-2">
            {isSelecting ? (
              <>
                <Button variant="outline" onClick={clearSelection}>
                  Cancel
                </Button>
                {selectedIds.size >= 2 && selectedIds.size <= 5 && (
                  <Button variant="outline" onClick={handleBulkCompare}>
                    <Filter className="h-4 w-4 mr-2" />
                    Compare ({selectedIds.size})
                  </Button>
                )}
                {selectedIds.size > 0 && canDelete && (
                  <Button variant="destructive" onClick={handleBulkDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete ({selectedIds.size})
                  </Button>
                )}
              </>
            ) : (
              <>
                {!isViewer && (
                  <Button variant="outline" onClick={() => setIsSelecting(true)}>
                    Select Multiple
                  </Button>
                )}
                <Button variant="outline" onClick={handleCompareProposals}>
                  <Filter className="h-4 w-4 mr-2" />
                  Compare
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Multi-select toolbar */}
        {isSelecting && (
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium">
              {selectedIds.size} of {filteredProposals.length} selected
            </p>
            <Button variant="link" size="sm" onClick={selectAll}>
              Select All
            </Button>
            <Button variant="link" size="sm" onClick={clearSelection}>
              Clear Selection
            </Button>
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by developer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Model Filter */}
          <Select value={filterModel} onValueChange={setFilterModel}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by model" />
            </SelectTrigger>
            <SelectContent>
              {RENT_MODEL_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updatedAt">Last Updated</SelectItem>
              <SelectItem value="createdAt">Date Created</SelectItem>
              <SelectItem value="totalRent">Total Rent</SelectItem>
              <SelectItem value="npv">NPV</SelectItem>
              <SelectItem value="developerName">Developer Name</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode Toggle */}
          <div className="flex gap-1 border rounded-md p-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredProposals.length} of {proposals.length} proposals
        </div>

        {/* Proposals Grid/List */}
        {filteredProposals.length === 0 ? (
          // Empty state - distinguish between filtered and no data
          searchQuery || filterStatus !== "ALL" || filterModel !== "ALL" ? (
            <EmptyState
              variant="search"
              title="No proposals found"
              description="Try adjusting your search filters or clearing them to see all proposals."
              action={{
                label: "Clear Filters",
                onClick: () => {
                  setSearchQuery("");
                  setFilterStatus("ALL");
                  setFilterModel("ALL");
                },
                variant: "outline"
              }}
              size="default"
            />
          ) : canCreate ? (
            <EmptyStates.NoProposals onCreate={handleCreateProposal} />
          ) : (
            <EmptyState
              variant="folder"
              icon={FileText}
              title="No proposals yet"
              description="There are no lease proposals in the system. Contact your administrator to create proposals."
              size="default"
            />
          )
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                : "space-y-4"
            }
          >
            {filteredProposals.map((proposal) => (
              <div key={proposal.id} className="relative">
                {isSelecting && (
                  <div className="absolute top-4 left-4 z-10">
                    <Checkbox
                      checked={selectedIds.has(proposal.id)}
                      onCheckedChange={() => toggleSelection(proposal.id)}
                      className="h-6 w-6 bg-background border-2"
                    />
                  </div>
                )}
                <ProposalCard
                  {...proposal}
                  onView={
                    isSelecting
                      ? () => toggleSelection(proposal.id)
                      : handleViewProposal
                  }
                  onEdit={handleEditProposal}
                  onDuplicate={handleDuplicateProposal}
                  onDelete={handleDeleteProposal}
                  onExport={handleExportProposal}
                  className={
                    isSelecting
                      ? selectedIds.has(proposal.id)
                        ? "ring-2 ring-primary"
                        : "opacity-75"
                      : ""
                  }
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
