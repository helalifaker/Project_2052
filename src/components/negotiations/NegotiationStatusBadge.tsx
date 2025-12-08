"use client";

import { NegotiationStatus } from "@/lib/types/roles";
import { cn } from "@/lib/utils";

interface NegotiationStatusBadgeProps {
  status: NegotiationStatus;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Badge component for displaying Negotiation entity status
 *
 * Status meanings:
 * - ACTIVE: Negotiation is ongoing, proposals being exchanged
 * - ACCEPTED: Deal has been agreed upon
 * - REJECTED: Negotiation was unsuccessful
 * - CLOSED: Negotiation ended (manually closed)
 */
/**
 * Status configuration using Atelier design system CSS variables
 */
const statusConfig: Record<
  NegotiationStatus,
  {
    label: string;
    style: { backgroundColor: string; color: string; borderColor: string };
  }
> = {
  [NegotiationStatus.ACTIVE]: {
    label: "Active",
    style: {
      backgroundColor: "var(--atelier-ink-positive-soft)",
      color: "var(--financial-positive)",
      borderColor: "var(--financial-positive)",
    },
  },
  [NegotiationStatus.ACCEPTED]: {
    label: "Accepted",
    style: {
      backgroundColor: "var(--atelier-ink-positive-soft)",
      color: "var(--financial-positive)",
      borderColor: "var(--financial-positive)",
    },
  },
  [NegotiationStatus.REJECTED]: {
    label: "Rejected",
    style: {
      backgroundColor: "var(--atelier-ink-negative-soft)",
      color: "var(--financial-negative)",
      borderColor: "var(--financial-negative)",
    },
  },
  [NegotiationStatus.CLOSED]: {
    label: "Closed",
    style: {
      backgroundColor: "var(--atelier-stone-100)",
      color: "var(--text-secondary)",
      borderColor: "var(--border-medium)",
    },
  },
};

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-xs",
  lg: "px-3 py-1.5 text-sm",
};

export function NegotiationStatusBadge({
  status,
  size = "md",
  className,
}: NegotiationStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        sizeClasses[size],
        className,
      )}
      style={config.style}
    >
      <span aria-hidden="true" className="w-2 h-2 rounded-full bg-current" />
      <span>{config.label}</span>
    </span>
  );
}

/**
 * Compact version without icon - useful for tables/lists
 */
export function NegotiationStatusBadgeCompact({
  status,
  className,
}: Omit<NegotiationStatusBadgeProps, "size">) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        className,
      )}
      style={config.style}
    >
      {config.label}
    </span>
  );
}
