import { ProposalOrigin, ProposalStatus } from "@/lib/types/roles";

interface StatusBadgeProps {
  status: ProposalStatus;
  origin: ProposalOrigin;
}

// Status styles using Atelier CSS variables
const statusStyles: Record<
  ProposalStatus,
  { backgroundColor: string; color: string }
> = {
  DRAFT: {
    backgroundColor: "var(--atelier-stone-200)",
    color: "var(--text-secondary)",
  },
  READY_TO_SUBMIT: {
    backgroundColor:
      "color-mix(in srgb, var(--atelier-chart-proposal-b) 15%, transparent)",
    color: "var(--atelier-chart-proposal-b)",
  },
  SUBMITTED: {
    backgroundColor:
      "color-mix(in srgb, var(--atelier-chart-proposal-b) 15%, transparent)",
    color: "var(--atelier-chart-proposal-b)",
  },
  UNDER_REVIEW: {
    backgroundColor: "var(--atelier-ink-warning-soft)",
    color: "var(--financial-warning)",
  },
  COUNTER_RECEIVED: {
    backgroundColor: "var(--atelier-craft-gold-soft)",
    color: "var(--accent-gold)",
  },
  EVALUATING_COUNTER: {
    backgroundColor: "var(--atelier-ink-warning-soft)",
    color: "var(--financial-warning)",
  },
  ACCEPTED: {
    backgroundColor: "var(--atelier-ink-positive-soft)",
    color: "var(--financial-positive)",
  },
  REJECTED: {
    backgroundColor: "var(--atelier-ink-negative-soft)",
    color: "var(--financial-negative)",
  },
  NEGOTIATION_CLOSED: {
    backgroundColor: "var(--atelier-stone-200)",
    color: "var(--text-secondary)",
  },
};

const statusLabel: Record<ProposalStatus, string> = {
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

// Origin colors using design system
const originStyles = {
  OUR_OFFER: {
    dotColor: "var(--atelier-chart-proposal-b)",
    label: "Us",
  },
  THEIR_COUNTER: {
    dotColor: "var(--accent-gold)",
    label: "Them",
  },
};

export function StatusBadge({ status, origin }: StatusBadgeProps) {
  const originStyle = originStyles[origin];

  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
      style={statusStyles[status]}
    >
      {/* Origin indicator with colored dot */}
      <span className="inline-flex items-center gap-1">
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: originStyle.dotColor }}
        />
        <span style={{ color: originStyle.dotColor }}>{originStyle.label}</span>
      </span>
      {/* Status label */}
      <span>{statusLabel[status]}</span>
    </span>
  );
}
