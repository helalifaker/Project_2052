/**
 * Negotiation Components
 *
 * Components for the negotiation management system (v2.2)
 *
 * Main components:
 * - NegotiationCard: Card displaying negotiation with timeline preview
 * - NegotiationTimeline: Vertical timeline of offers
 *
 * Badge components:
 * - NegotiationStatusBadge: Shows ACTIVE/ACCEPTED/REJECTED/CLOSED
 * - ProposalPurposeBadge: Shows NEGOTIATION/STRESS_TEST/SIMULATION
 * - StatusBadge: Shows proposal status with origin indicator
 *
 * Dialog components:
 * - CreateNegotiationDialog: Create new negotiation container
 * - AddCounterDialog: Duplicate proposal as counter-offer
 * - ReorderOffersDialog: Manually adjust offer numbers
 * - LinkProposalDialog: Link existing proposal to negotiation
 */

// Main components
export { NegotiationCard, NegotiationCardSkeleton } from "./NegotiationCard";
export type { NegotiationCardProps } from "./NegotiationCard";

export { NegotiationTimeline, TimelinePreview } from "./NegotiationTimeline";
export type { TimelineOffer } from "./NegotiationTimeline";

// Badge components
export {
  NegotiationStatusBadge,
  NegotiationStatusBadgeCompact,
} from "./NegotiationStatusBadge";

export {
  ProposalPurposeBadge,
  ProposalPurposeBadgeCompact,
  isNegotiationPurpose,
  showInNegotiationTimeline,
} from "./ProposalPurposeBadge";

export { StatusBadge } from "./StatusBadge";

// Dialog components
export { CreateNegotiationDialog } from "./CreateNegotiationDialog";
export { AddCounterDialog } from "./AddCounterDialog";
export { ReorderOffersDialog } from "./ReorderOffersDialog";
export { LinkProposalDialog } from "./LinkProposalDialog";

// Trend analysis components
export { OfferTrendsCard } from "./OfferTrendsCard";
export type { OfferTrendData, OfferTrendsCardProps } from "./OfferTrendsCard";
