"use client";

import { formatDistanceToNow } from "date-fns";
import { ProposalOrigin, ProposalStatus } from "@/lib/types/roles";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

/**
 * Offer item in the negotiation timeline
 */
export interface TimelineOffer {
  id: string;
  name: string;
  offerNumber: number | null;
  origin: ProposalOrigin;
  status: ProposalStatus;
  updatedAt: string | Date;
  metrics?: {
    totalRent?: number | string;
    npv?: number | string;
    irr?: number | string;
  } | null;
}

interface NegotiationTimelineProps {
  offers: TimelineOffer[];
  negotiationId: string;
  maxItems?: number;
  showViewAll?: boolean;
  compact?: boolean;
  className?: string;
}

/**
 * Status styling for timeline items - Atelier Edition
 * Using CSS variables for consistent theming
 */
const statusStyles: Record<
  ProposalStatus,
  { dotStyle: React.CSSProperties; textStyle: React.CSSProperties }
> = {
  DRAFT: {
    dotStyle: { backgroundColor: "var(--atelier-stone-400)" },
    textStyle: { color: "var(--text-secondary)" },
  },
  READY_TO_SUBMIT: {
    dotStyle: { backgroundColor: "var(--atelier-chart-proposal-b)" },
    textStyle: { color: "var(--atelier-chart-proposal-b)" },
  },
  SUBMITTED: {
    dotStyle: { backgroundColor: "var(--atelier-chart-proposal-b)" },
    textStyle: { color: "var(--atelier-chart-proposal-b)" },
  },
  UNDER_REVIEW: {
    dotStyle: { backgroundColor: "var(--financial-warning)" },
    textStyle: { color: "var(--financial-warning)" },
  },
  COUNTER_RECEIVED: {
    dotStyle: { backgroundColor: "var(--accent-gold)" },
    textStyle: { color: "var(--accent-gold)" },
  },
  EVALUATING_COUNTER: {
    dotStyle: { backgroundColor: "var(--financial-warning)" },
    textStyle: { color: "var(--financial-warning)" },
  },
  ACCEPTED: {
    dotStyle: { backgroundColor: "var(--financial-positive)" },
    textStyle: { color: "var(--financial-positive)" },
  },
  REJECTED: {
    dotStyle: { backgroundColor: "var(--financial-negative)" },
    textStyle: { color: "var(--financial-negative)" },
  },
  NEGOTIATION_CLOSED: {
    dotStyle: { backgroundColor: "var(--atelier-stone-500)" },
    textStyle: { color: "var(--text-tertiary)" },
  },
};

const statusLabels: Record<ProposalStatus, string> = {
  DRAFT: "Draft",
  READY_TO_SUBMIT: "Ready",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  COUNTER_RECEIVED: "Counter Received",
  EVALUATING_COUNTER: "Evaluating",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  NEGOTIATION_CLOSED: "Closed",
};

/**
 * NegotiationTimeline displays a vertical timeline of offers in a negotiation
 *
 * Key features:
 * - Shows offer number, origin (Us/Them), status, and time
 * - Color-coded by origin: blue for our offers, red for their counters
 * - Compact mode shows minimal info (useful in cards)
 * - Links to proposal detail for each item
 */
export function NegotiationTimeline({
  offers,
  negotiationId,
  maxItems = 5,
  showViewAll = true,
  compact = false,
  className,
}: NegotiationTimelineProps) {
  // Sort by offer number descending (most recent first)
  const sortedOffers = [...offers].sort((a, b) => {
    const aNum = a.offerNumber ?? 0;
    const bNum = b.offerNumber ?? 0;
    return bNum - aNum;
  });

  const displayedOffers = sortedOffers.slice(0, maxItems);
  const hasMore = sortedOffers.length > maxItems;

  if (offers.length === 0) {
    return (
      <div className={cn("text-sm text-muted-foreground italic", className)}>
        No offers yet
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-border" />

        {/* Timeline items */}
        <div className="space-y-2">
          {displayedOffers.map((offer, index) => (
            <TimelineItem
              key={offer.id}
              offer={offer}
              isFirst={index === 0}
              isLast={index === displayedOffers.length - 1 && !hasMore}
              compact={compact}
            />
          ))}
        </div>
      </div>

      {/* View all link */}
      {showViewAll && hasMore && (
        <Link
          href={`/negotiations/detail/${negotiationId}`}
          className="flex items-center gap-1 text-sm text-primary hover:underline ml-5 pt-1"
        >
          View all {sortedOffers.length} offers
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

/**
 * Individual timeline item
 */
function TimelineItem({
  offer,
  isFirst,
  isLast: _isLast,
  compact,
}: {
  offer: TimelineOffer;
  isFirst: boolean;
  isLast: boolean;
  compact: boolean;
}) {
  const isOurOffer = offer.origin === "OUR_OFFER";
  const statusStyle = statusStyles[offer.status];
  const timeAgo = formatDistanceToNow(new Date(offer.updatedAt), {
    addSuffix: true,
  });

  // Atelier colors for origin indicators
  const originColors = {
    our: {
      bg: "var(--atelier-chart-proposal-b)",
      bgSoft:
        "color-mix(in srgb, var(--atelier-chart-proposal-b) 15%, transparent)",
      text: "var(--atelier-chart-proposal-b)",
      ring: "color-mix(in srgb, var(--atelier-chart-proposal-b) 30%, transparent)",
    },
    their: {
      bg: "var(--accent-gold)",
      bgSoft: "var(--atelier-craft-gold-soft)",
      text: "var(--accent-gold)",
      ring: "color-mix(in srgb, var(--accent-gold) 30%, transparent)",
    },
  };
  const originStyle = isOurOffer ? originColors.our : originColors.their;

  return (
    <div className="flex items-start gap-3 group">
      {/* Dot indicator */}
      <div
        className={cn(
          "relative z-10 mt-1.5 h-3.5 w-3.5 rounded-full border-2 border-background",
          isFirst && "ring-2 ring-offset-1",
        )}
        style={{
          backgroundColor: originStyle.bg,
          ...(isFirst && { boxShadow: `0 0 0 2px ${originStyle.ring}` }),
        }}
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/proposals/${offer.id}`}
          className="block hover:bg-muted/50 rounded-md -m-1 p-1 transition-colors"
        >
          <div className="flex items-center gap-2 flex-wrap">
            {/* Offer number */}
            <span className="font-semibold text-sm">
              #{offer.offerNumber ?? "?"}
            </span>

            {/* Origin badge */}
            <span
              className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: originStyle.bgSoft,
                color: originStyle.text,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {isOurOffer ? "Us" : "Them"}
            </span>

            {/* Status */}
            <span
              className="text-xs px-1.5 py-0.5 rounded bg-muted"
              style={statusStyle.textStyle}
            >
              {statusLabels[offer.status]}
            </span>
          </div>

          {/* Name and time (non-compact only) */}
          {!compact && (
            <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
              <span className="truncate max-w-[200px]">{offer.name}</span>
              <span>•</span>
              <span>{timeAgo}</span>
            </div>
          )}
        </Link>
      </div>
    </div>
  );
}

/**
 * Compact timeline preview - shows last N items inline
 * Used in NegotiationCard for space efficiency
 */
export function TimelinePreview({
  offers,
  maxItems = 3,
}: {
  offers: TimelineOffer[];
  maxItems?: number;
}) {
  const sortedOffers = [...offers]
    .sort((a, b) => (b.offerNumber ?? 0) - (a.offerNumber ?? 0))
    .slice(0, maxItems);

  if (offers.length === 0) {
    return (
      <span className="text-xs text-muted-foreground italic">No offers</span>
    );
  }

  // Atelier colors for origin indicators
  const getOriginStyle = (isOurOffer: boolean) => ({
    backgroundColor: isOurOffer
      ? "color-mix(in srgb, var(--atelier-chart-proposal-b) 15%, transparent)"
      : "var(--atelier-craft-gold-soft)",
    color: isOurOffer
      ? "var(--atelier-chart-proposal-b)"
      : "var(--accent-gold)",
  });

  return (
    <div className="flex flex-wrap gap-1">
      {sortedOffers.map((offer) => {
        const isOurOffer = offer.origin === "OUR_OFFER";
        return (
          <span
            key={offer.id}
            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
            style={getOriginStyle(isOurOffer)}
            title={`#${offer.offerNumber} - ${offer.name} (${statusLabels[offer.status]})`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />#
            {offer.offerNumber ?? "?"}
          </span>
        );
      })}
      {offers.length > maxItems && (
        <span className="text-xs text-muted-foreground">
          +{offers.length - maxItems}
        </span>
      )}
    </div>
  );
}
