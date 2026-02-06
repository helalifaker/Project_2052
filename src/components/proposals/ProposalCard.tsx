"use client";

import React, { memo, useCallback, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRoleCheck } from "@/lib/hooks/useRoleCheck";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatMillions } from "@/lib/utils/financial";
import {
  Building2,
  Calendar,
  TrendingUp,
  DollarSign,
  MoreVertical,
  Eye,
  Copy,
  Edit,
  Trash2,
  FileDown,
  FileText,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Decimal from "decimal.js";
import { ProposalStatusSelect } from "./ProposalStatusSelect";
import { ProposalStatus } from "@/lib/types/roles";

type ProposalCardMetrics = {
  totalRent?: number | Decimal;
  npv?: number | Decimal;
  totalEbitda?: number | Decimal;
  // Contract period metrics (preferred for display)
  contractTotalRent?: number | Decimal;
  contractRentNPV?: number | Decimal;
  contractTotalEbitda?: number | Decimal;
  contractEndYear?: number;
};

export interface ProposalCardProps {
  id: string;
  name?: string | null;
  developer?: string | null;
  rentModel?: string | null;
  metrics?: ProposalCardMetrics;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
  status?: string | null;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
  onExport?: (id: string) => void;
  onStatusChange?: (id: string, newStatus: ProposalStatus) => void;
  className?: string;
}

/**
 * ProposalCard Component
 *
 * Displays a summary card for a rent proposal with key metrics and actions
 *
 * Features:
 * - Developer name and rent model badge
 * - Key financial metrics (Total Rent, NPV, EBITDA)
 * - Status indicator
 * - Quick actions dropdown (View, Edit, Duplicate, Delete, Export)
 * - Hover effects and responsive design
 *
 * PERFORMANCE OPTIMIZATION:
 * - React.memo() to prevent unnecessary re-renders
 * - useCallback() for event handlers to maintain referential equality
 * - useMemo() for expensive computations (badge colors, formatted dates)
 */
export const ProposalCard = memo(function ProposalCard({
  id,
  developer,
  name,
  rentModel,
  metrics,
  createdAt,
  updatedAt,
  status,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
  onExport,
  onStatusChange,
  className,
}: ProposalCardProps) {
  const router = useRouter();
  const { canEdit, canDelete } = useRoleCheck();

  const handleView = useCallback(() => {
    if (onView) {
      onView(id);
    } else {
      router.push(`/proposals/${id}`);
    }
  }, [id, onView, router]);

  const handleEdit = useCallback(() => onEdit?.(id), [id, onEdit]);
  const handleDuplicate = useCallback(
    () => onDuplicate?.(id),
    [id, onDuplicate],
  );
  const handleUseAsTemplate = useCallback(() => {
    router.push(`/proposals/new?prefillId=${id}`);
  }, [id, router]);
  const handleDelete = useCallback(() => onDelete?.(id), [id, onDelete]);
  const handleExport = useCallback(() => onExport?.(id), [id, onExport]);

  // Design System Mapping for Status - Atelier Edition
  const statusConfig = useMemo(() => {
    const normalized = status?.toUpperCase() ?? "DRAFT";
    // Map internal statuses to Atelier design system colors
    const map: Record<string, { color: string; bg: string; border: string }> = {
      DRAFT: {
        color: "var(--text-secondary)",
        bg: "var(--bg-subtle)",
        border: "var(--border-medium)",
      },
      READY_TO_SUBMIT: {
        color: "var(--accent-slate)",
        bg: "var(--bg-warm)",
        border: "var(--border-medium)",
      },
      SUBMITTED: {
        color: "var(--accent-gold)",
        bg: "var(--atelier-craft-gold-soft)",
        border: "var(--accent-gold)",
      },
      UNDER_REVIEW: {
        color: "var(--accent-gold)",
        bg: "var(--atelier-craft-gold-soft)",
        border: "var(--accent-gold)",
      },
      ACCEPTED: {
        color: "var(--financial-positive)",
        bg: "var(--atelier-ink-positive-soft)",
        border: "var(--financial-positive)",
      },
      REJECTED: {
        color: "var(--financial-negative)",
        bg: "var(--atelier-ink-negative-soft)",
        border: "var(--financial-negative)",
      },
    };
    return map[normalized] ?? map.DRAFT;
  }, [status]);

  // Design System Mapping for Rent Model - Atelier Edition
  const rentModelConfig = useMemo(() => {
    const normalized = rentModel?.toUpperCase() ?? "FIXED";
    const map: Record<string, { color: string; bg: string }> = {
      FIXED: { color: "var(--accent-slate)", bg: "var(--atelier-stone-100)" },
      REVSHARE: {
        color: "var(--financial-positive)",
        bg: "var(--atelier-ink-positive-soft)",
      },
      PARTNER: {
        color: "var(--accent-gold)",
        bg: "var(--atelier-craft-gold-soft)",
      },
    };
    return map[normalized] ?? map.FIXED;
  }, [rentModel]);

  // Helper for title casing
  const formatStatus = (s: string | null) => {
    if (!s) return "Draft";
    return s
      .toLowerCase()
      .split(/[_\s]+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const formattedUpdatedDate = useMemo(
    () => (updatedAt ? new Date(updatedAt).toLocaleDateString() : "-"),
    [updatedAt],
  );

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-500 cursor-pointer",
        "glass-card p-0 hover:shadow-2xl hover:scale-[1.01]", // V2 Base
        "animate-slide-up", // Entry animation
        className,
      )}
      onClick={handleView}
      role="article"
      aria-label={`Proposal: ${name || developer || "Untitled"} - ${rentModel || "Fixed"} model, Status: ${formatStatus(status ?? null)}`}
    >
      {/* Active Shimmer Border Gradient (on hover) */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]" />
      </div>

      {/* Header Section: Clean white/paper background */}
      <div className="relative z-10 px-6 py-5 border-b border-border flex items-start justify-between bg-card">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            {canEdit ? (
              <ProposalStatusSelect
                proposalId={id}
                currentStatus={status ?? "DRAFT"}
                onStatusChange={(newStatus) => onStatusChange?.(id, newStatus)}
                size="sm"
              />
            ) : (
              <Badge
                variant="outline"
                className="text-[10px] uppercase tracking-[0.1em] font-semibold border px-2 py-0.5"
                style={{
                  color: statusConfig.color,
                  backgroundColor: statusConfig.bg,
                  borderColor: statusConfig.border,
                }}
              >
                {formatStatus(status ?? null)}
              </Badge>
            )}
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-current opacity-50" />
              {rentModel || "Fixed"}
            </span>
          </div>

          <CardTitle className="text-xl font-serif font-medium text-foreground group-hover:text-accent-gold transition-colors duration-300">
            {name || developer || "Untitled Proposal"}
          </CardTitle>

          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            Updated {formattedUpdatedDate}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full hover:bg-white/10"
              onClick={(e) => e.stopPropagation()}
              aria-label="Proposal actions menu"
            >
              <MoreVertical className="h-4 w-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 glass-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenuItem onClick={handleView}>
              <Eye className="h-4 w-4 mr-2" /> View Details
            </DropdownMenuItem>
            {canEdit && (
              <>
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" /> Edit Proposal
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDuplicate}>
                  <Copy className="h-4 w-4 mr-2" /> Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleUseAsTemplate}>
                  <FileText className="h-4 w-4 mr-2" /> Save as Template
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleExport}>
              <FileDown className="h-4 w-4 mr-2" /> Export PDF
            </DropdownMenuItem>
            {canDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Body Section: Metrics */}
      <CardContent className="relative z-10 px-6 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Total Rent */}
          <div className="space-y-1">
            <span className="label-metric">
              Total Rent
            </span>
            <span className="font-serif text-3xl font-light text-foreground tracking-tight tabular-nums block group-hover:text-accent-gold transition-colors">
              {formatMillions(
                metrics?.contractTotalRent ?? metrics?.totalRent ?? 0,
              )}
            </span>
          </div>

          {/* NPV */}
          <div className="space-y-1 relative">
            {/* Vertical Divider */}
            <div className="absolute -left-3 top-2 bottom-2 w-px bg-border/40" />
            <span className="label-metric">
              NPV
            </span>
            <span className="font-serif text-3xl font-light tracking-tight tabular-nums block text-foreground">
              {formatMillions(
                Math.abs(Number(metrics?.contractRentNPV ?? metrics?.npv ?? 0)),
              )}
            </span>
          </div>

          {/* EBITDA */}
          <div className="space-y-1 relative">
            <div className="absolute -left-3 top-2 bottom-2 w-px bg-border/40" />
            <span className="label-metric">
              EBITDA
            </span>
            <span className="font-serif text-3xl font-light text-foreground tracking-tight tabular-nums block">
              {formatMillions(
                metrics?.contractTotalEbitda ?? metrics?.totalEbitda ?? 0,
              )}
            </span>
          </div>
        </div>
      </CardContent>

      {/* Footer Visual Indication */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-accent-gold to-transparent" />
    </Card>
  );
});

/**
 * ProposalCardSkeleton - Loading skeleton for proposal cards
 */
export function ProposalCardSkeleton() {
  return (
    <Card className="bg-paper border-border-light h-[280px] p-6">
      <CardHeader className="p-0 pb-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="h-7 w-48 bg-muted/50 rounded animate-shimmer" />
            <div className="flex gap-3">
              <div className="h-5 w-20 bg-muted/40 rounded animate-shimmer" />
              <div className="h-5 w-24 bg-muted/30 rounded animate-shimmer" />
            </div>
          </div>
          <div className="h-6 w-24 bg-muted/50 rounded-full animate-shimmer" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-3 gap-8 py-4 border-t border-b border-border-light/40">
          <div className="space-y-2">
            <div className="h-3 w-16 bg-muted/40 rounded animate-pulse" />
            <div className="h-8 w-24 bg-muted/60 rounded animate-shimmer" />
          </div>
          <div className="space-y-2 pl-4 border-l border-border-light/40">
            <div className="h-3 w-16 bg-muted/40 rounded animate-pulse" />
            <div className="h-8 w-24 bg-muted/60 rounded animate-shimmer" />
          </div>
          <div className="space-y-2 pl-4 border-l border-border-light/40">
            <div className="h-3 w-16 bg-muted/40 rounded animate-pulse" />
            <div className="h-8 w-24 bg-muted/60 rounded animate-shimmer" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Example usage:
 *
 * <ProposalCard
 *   id="prop-1"
 *   name="Proposal A"
 *   developer="Developer A"
 *   rentModel="FIXED"
 *   metrics={{ totalRent: new Decimal(500_000_000), npv: new Decimal(125_000_000), totalEbitda: new Decimal(45_000_000) }}
 *   createdAt={new Date("2025-11-01")}
 *   updatedAt={new Date("2025-11-15")}
 *   status="DRAFT"
 *   onView={(id) => console.log("View", id)}
 *   onEdit={(id) => console.log("Edit", id)}
 *   onDuplicate={(id) => console.log("Duplicate", id)}
 *   onDelete={(id) => console.log("Delete", id)}
 *   onExport={(id) => console.log("Export", id)}
 * />
 */
