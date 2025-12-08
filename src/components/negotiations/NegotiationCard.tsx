"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import Decimal from "decimal.js";
import { Building2, ChevronDown, Plus, RefreshCw } from "lucide-react";
import {
  NegotiationStatus,
  ProposalOrigin,
  ProposalStatus,
} from "@/lib/types/roles";
import { cn } from "@/lib/utils";
import { formatMillions } from "@/lib/formatting/millions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { NegotiationStatusBadge } from "./NegotiationStatusBadge";
import { TimelineOffer, TimelinePreview } from "./NegotiationTimeline";

/**
 * Props for NegotiationCard
 */
export interface NegotiationCardProps {
  negotiation: {
    id: string;
    developer: string;
    property: string;
    status: NegotiationStatus;
    notes?: string | null;
    updatedAt: string | Date;
    createdAt: string | Date;
    proposalCount: number;
    ourOffers: number;
    theirCounters: number;
    latestOffer?: {
      id: string;
      name: string;
      offerNumber: number | null;
      origin: ProposalOrigin;
      status: ProposalStatus;
      updatedAt: string | Date;
    } | null;
    latestMetrics?: {
      totalRent?: number | string | null;
      npv?: number | string | null;
      irr?: number | string | null;
    } | null;
    proposals: TimelineOffer[];
  };
  onAddCounter?: (negotiationId: string, proposalId: string) => void;
  onReorderOffers?: (negotiationId: string) => void;
  onLinkProposal?: (negotiationId: string) => void;
  className?: string;
}

/**
 * NegotiationCard - Main container for displaying a negotiation
 *
 * Layout (as approved by user):
 * ┌─────────────────────────────────────────────────┐
 * │ [ACTIVE]                        Last: 2 days ago│
 * │                                                 │
 * │ Olayan Developer                                │
 * │ King Fahd Road Campus                           │
 * │                                                 │
 * │ ┌─────────────────────────────────────────────┐ │
 * │ │ Timeline (last 3 offers)                    │ │
 * │ │ #3 🟥 Them - COUNTER_RECEIVED               │ │
 * │ │ #2 🟦 Us   - SUBMITTED                      │ │
 * │ │ #1 🟦 Us   - REJECTED                       │ │
 * │ └─────────────────────────────────────────────┘ │
 * │                                                 │
 * │ Total Rent: SAR 450M │ NPV: SAR 120M │ IRR: 12% │
 * │                                                 │
 * │ [View Details]              [Add Counter ▼]     │
 * └─────────────────────────────────────────────────┘
 */
export function NegotiationCard({
  negotiation,
  onAddCounter,
  onReorderOffers,
  onLinkProposal,
  className,
}: NegotiationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const lastUpdated = formatDistanceToNow(new Date(negotiation.updatedAt), {
    addSuffix: true,
  });

  // Get the latest offer for counter-offer action
  const latestOffer = negotiation.latestOffer;

  // Format metrics
  const metrics = negotiation.latestMetrics;
  const totalRent = metrics?.totalRent
    ? formatMillions(new Decimal(metrics.totalRent))
    : null;
  const npv = metrics?.npv ? formatMillions(new Decimal(metrics.npv)) : null;
  const irr = metrics?.irr
    ? `${(Number(metrics.irr) * 100).toFixed(1)}%`
    : null;

  // Atelier status-based card styling
  const getCardStyle = () => {
    if (negotiation.status === NegotiationStatus.ACCEPTED) {
      return {
        borderColor: "var(--financial-positive)",
        backgroundColor: "var(--atelier-ink-positive-soft)",
      };
    }
    if (negotiation.status === NegotiationStatus.REJECTED) {
      return {
        borderColor: "var(--financial-negative)",
        backgroundColor: "var(--atelier-ink-negative-soft)",
      };
    }
    return {};
  };

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-500",
        "hover:shadow-xl hover:translate-y-[-2px]",
        negotiation.status === NegotiationStatus.CLOSED && "opacity-75",
        className,
      )}
      style={getCardStyle()}
    >
      <CardHeader className="pb-3">
        {/* Top row: Status and last updated */}
        <div className="flex items-center justify-between gap-2">
          <NegotiationStatusBadge status={negotiation.status} size="sm" />
          <span className="text-xs text-muted-foreground">
            Last: {lastUpdated}
          </span>
        </div>

        {/* Developer & Property */}
        <CardTitle className="flex items-center gap-2 mt-2 font-serif group-hover:text-accent-gold transition-colors duration-300">
          <Building2 className="h-5 w-5 text-muted-foreground shrink-0" />
          <span className="truncate">{negotiation.developer}</span>
        </CardTitle>
        <CardDescription className="truncate">
          {negotiation.property}
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-3 space-y-4">
        {/* Offer counts summary */}
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">
            <span className="font-medium text-foreground tabular-nums">
              {negotiation.proposalCount}
            </span>{" "}
            offers
          </span>
          <span
            className="inline-flex items-center gap-1.5"
            style={{ color: "var(--atelier-chart-proposal-b)" }}
          >
            <span className="w-2 h-2 rounded-full bg-current" />
            <span className="tabular-nums">{negotiation.ourOffers}</span> ours
          </span>
          <span
            className="inline-flex items-center gap-1.5"
            style={{ color: "var(--accent-gold)" }}
          >
            <span className="w-2 h-2 rounded-full bg-current" />
            <span className="tabular-nums">
              {negotiation.theirCounters}
            </span>{" "}
            theirs
          </span>
        </div>

        {/* Timeline preview */}
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Recent Offers
            </span>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              {isExpanded ? "Collapse" : "Expand"}
              <ChevronDown
                className={cn(
                  "h-3 w-3 transition-transform",
                  isExpanded && "rotate-180",
                )}
              />
            </button>
          </div>
          <TimelinePreview
            offers={negotiation.proposals}
            maxItems={isExpanded ? 10 : 3}
          />
        </div>

        {/* Metrics row */}
        {metrics && (totalRent || npv || irr) && (
          <div className="flex items-center justify-between text-sm border-t pt-3">
            {totalRent && (
              <div>
                <span className="text-muted-foreground">Total Rent:</span>{" "}
                <span className="font-semibold tabular-nums">
                  SAR {totalRent}
                </span>
              </div>
            )}
            {npv && (
              <div>
                <span className="text-muted-foreground">NPV:</span>{" "}
                <span className="font-semibold tabular-nums">SAR {npv}</span>
              </div>
            )}
            {irr && (
              <div>
                <span className="text-muted-foreground">IRR:</span>{" "}
                <span className="font-semibold tabular-nums">{irr}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-3 border-t">
        {/* View Details button */}
        <Button variant="outline" size="sm" asChild>
          <Link href={`/negotiations/detail/${negotiation.id}`}>
            View Details
          </Link>
        </Button>

        {/* Actions dropdown */}
        {negotiation.status === NegotiationStatus.ACTIVE && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Actions
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {latestOffer && onAddCounter && (
                <DropdownMenuItem
                  onClick={() => onAddCounter(negotiation.id, latestOffer.id)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Counter (from #{latestOffer.offerNumber})
                </DropdownMenuItem>
              )}
              {onLinkProposal && (
                <DropdownMenuItem
                  onClick={() => onLinkProposal(negotiation.id)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Link Existing Proposal
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {onReorderOffers && negotiation.proposalCount > 1 && (
                <DropdownMenuItem
                  onClick={() => onReorderOffers(negotiation.id)}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reorder Offers
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardFooter>

      {/* Gold accent line on hover */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-accent-gold to-transparent" />
    </Card>
  );
}

/**
 * Skeleton loader for NegotiationCard
 */
export function NegotiationCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="h-5 w-16 bg-muted rounded-full" />
          <div className="h-3 w-20 bg-muted rounded" />
        </div>
        <div className="h-6 w-3/4 bg-muted rounded mt-2" />
        <div className="h-4 w-1/2 bg-muted rounded mt-1" />
      </CardHeader>
      <CardContent className="pb-3 space-y-4">
        <div className="flex gap-4">
          <div className="h-4 w-16 bg-muted rounded" />
          <div className="h-4 w-16 bg-muted rounded" />
          <div className="h-4 w-16 bg-muted rounded" />
        </div>
        <div className="bg-muted/50 rounded-lg p-3 h-20" />
        <div className="flex justify-between pt-3 border-t">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-4 w-16 bg-muted rounded" />
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between pt-3 border-t">
        <div className="h-8 w-24 bg-muted rounded" />
        <div className="h-8 w-20 bg-muted rounded" />
      </CardFooter>
    </Card>
  );
}
