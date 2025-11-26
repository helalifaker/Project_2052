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
import { useAuth } from "@/lib/hooks/useAuth";
import { Role } from "@/lib/types/roles";
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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Decimal from "decimal.js";

type ProposalCardMetrics = {
  totalRent?: number | Decimal;
  npv?: number | Decimal;
  totalEbitda?: number | Decimal;
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
  className,
}: ProposalCardProps) {
  const router = useRouter();
  const { hasRole } = useAuth();

  // Check permissions
  const canEdit = hasRole([Role.ADMIN, Role.PLANNER]);
  const canDelete = hasRole([Role.ADMIN, Role.PLANNER]);

  // PERFORMANCE: Memoize event handlers to prevent child re-renders
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
  const handleDelete = useCallback(() => onDelete?.(id), [id, onDelete]);
  const handleExport = useCallback(() => onExport?.(id), [id, onExport]);

  // PERFORMANCE: Memoize status badge computation
  const statusBadge = useMemo(() => {
    const normalizedStatus = status?.toUpperCase() ?? "DRAFT";
    const title = (value: string) =>
      value
        .toLowerCase()
        .split(/[\s_]+/)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");

    const variants = {
      DRAFT: { label: "Draft", className: "bg-gray-100 text-gray-800" },
      READY_TO_SUBMIT: {
        label: "Ready to Submit",
        className: "bg-blue-100 text-blue-800",
      },
      SUBMITTED: { label: "Submitted", className: "bg-blue-100 text-blue-800" },
      UNDER_REVIEW: {
        label: "Under Review",
        className: "bg-amber-100 text-amber-800",
      },
      COUNTER_RECEIVED: {
        label: "Counter Received",
        className: "bg-purple-100 text-purple-800",
      },
      EVALUATING_COUNTER: {
        label: "Evaluating Counter",
        className: "bg-purple-100 text-purple-800",
      },
      ACCEPTED: { label: "Accepted", className: "bg-green-100 text-green-800" },
      REJECTED: {
        label: "Rejected",
        className: "bg-destructive/10 text-destructive",
      },
      NEGOTIATION_CLOSED: {
        label: "Closed",
        className: "bg-gray-100 text-gray-600",
      },
    } as const;

    const variant = variants[normalizedStatus as keyof typeof variants] ?? {
      label: title(normalizedStatus),
      className: "bg-gray-100 text-gray-800",
    };

    return (
      <Badge variant="outline" className={variant.className}>
        {variant.label}
      </Badge>
    );
  }, [status]);

  // PERFORMANCE: Memoize rent model color
  const rentModelColor = useMemo(() => {
    const normalized = rentModel?.toUpperCase() ?? "FIXED";
    const colors: Record<string, string> = {
      FIXED: "text-blue-600 bg-blue-50 border-blue-200",
      REVSHARE: "text-green-600 bg-green-50 border-green-200",
      PARTNER: "text-purple-600 bg-purple-50 border-purple-200",
    };
    return colors[normalized] ?? "text-muted-foreground bg-muted border-muted";
  }, [rentModel]);

  const rentModelLabel = useMemo(() => {
    const normalized = rentModel?.toUpperCase() ?? "";
    const labels: Record<string, string> = {
      FIXED: "Fixed",
      REVSHARE: "RevShare",
      PARTNER: "Partner",
    };
    return labels[normalized] ?? rentModel ?? "Model";
  }, [rentModel]);

  // PERFORMANCE: Memoize formatted dates
  const formattedUpdatedDate = useMemo(
    () => (updatedAt ? new Date(updatedAt).toLocaleDateString() : "-"),
    [updatedAt],
  );
  const formattedCreatedDate = useMemo(
    () => (createdAt ? new Date(createdAt).toLocaleDateString() : "-"),
    [createdAt],
  );

  return (
    <Card
      className={cn(
        "hover:shadow-lg transition-all duration-200 cursor-pointer group",
        className,
      )}
      onClick={handleView}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              {name || developer || "Proposal"}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              Last updated: {formattedUpdatedDate}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {statusBadge}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuItem onClick={handleView}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                {canEdit && (
                  <>
                    <DropdownMenuItem onClick={handleEdit}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDuplicate}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleExport}>
                  <FileDown className="h-4 w-4 mr-2" />
                  Export
                </DropdownMenuItem>
                {canDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleDelete}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Rent Model */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Model:</span>
          <Badge className={rentModelColor} variant="outline">
            {rentModel}
          </Badge>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              Total Rent (30Y)
            </div>
            <div className="text-lg font-bold font-mono">
              {formatMillions(metrics?.totalRent ?? 0)}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              NPV
            </div>
            <div
              className={cn(
                "text-lg font-bold font-mono",
                Number(metrics?.npv ?? 0) >= 0
                  ? "text-green-600"
                  : "text-destructive",
              )}
            >
              {formatMillions(metrics?.npv ?? 0)}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              EBITDA (Avg)
            </div>
            <div className="text-lg font-bold font-mono">
              {formatMillions(metrics?.totalEbitda ?? 0)}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="text-xs text-muted-foreground border-t pt-4">
        Created {formattedCreatedDate}
      </CardFooter>
    </Card>
  );
});

/**
 * ProposalCardSkeleton - Loading skeleton for proposal cards
 */
export function ProposalCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-6 w-40 bg-muted rounded" />
            <div className="h-4 w-32 bg-muted rounded" />
          </div>
          <div className="h-6 w-20 bg-muted rounded" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-6 w-24 bg-muted rounded" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-12 bg-muted rounded" />
          <div className="h-12 bg-muted rounded" />
          <div className="h-12 bg-muted rounded" />
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="h-4 w-28 bg-muted rounded" />
      </CardFooter>
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
