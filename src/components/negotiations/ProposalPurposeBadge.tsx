"use client";

import { ProposalPurpose } from "@/lib/types/roles";
import { cn } from "@/lib/utils";

interface ProposalPurposeBadgeProps {
  purpose: ProposalPurpose;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Badge component for displaying Proposal purpose/classification
 *
 * Purpose meanings:
 * - NEGOTIATION: Part of an active negotiation workflow (tracked in timeline)
 * - STRESS_TEST: What-if analysis AFTER negotiation is finalized (isolated from negotiation)
 * - SIMULATION: Standalone simulation without negotiation context (default)
 *
 * Key insight: Stress tests must be visually distinct as they are
 * explicitly NOT part of the negotiation flow per user requirements.
 */
/**
 * Purpose configuration using Atelier design system CSS variables
 */
const purposeConfig: Record<
  ProposalPurpose,
  {
    label: string;
    icon: string;
    style: { backgroundColor: string; color: string; borderColor: string };
    description: string;
  }
> = {
  [ProposalPurpose.NEGOTIATION]: {
    label: "Negotiation",
    icon: "🤝",
    style: {
      backgroundColor:
        "color-mix(in srgb, var(--atelier-chart-proposal-b) 15%, transparent)",
      color: "var(--atelier-chart-proposal-b)",
      borderColor: "var(--atelier-chart-proposal-b)",
    },
    description: "Part of active negotiation",
  },
  [ProposalPurpose.STRESS_TEST]: {
    label: "Stress Test",
    icon: "🧪",
    style: {
      backgroundColor:
        "color-mix(in srgb, var(--atelier-chart-proposal-a) 15%, transparent)",
      color: "var(--atelier-chart-proposal-a)",
      borderColor: "var(--atelier-chart-proposal-a)",
    },
    description: "What-if analysis (isolated)",
  },
  [ProposalPurpose.SIMULATION]: {
    label: "Simulation",
    icon: "📊",
    style: {
      backgroundColor: "var(--atelier-stone-100)",
      color: "var(--text-secondary)",
      borderColor: "var(--border-medium)",
    },
    description: "Standalone simulation",
  },
};

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-xs",
  lg: "px-3 py-1.5 text-sm",
};

export function ProposalPurposeBadge({
  purpose,
  size = "md",
  className,
}: ProposalPurposeBadgeProps) {
  const config = purposeConfig[purpose];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium",
        sizeClasses[size],
        className,
      )}
      style={config.style}
      title={config.description}
    >
      <span aria-hidden="true">{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}

/**
 * Compact version without icon - useful for tables/dense lists
 */
export function ProposalPurposeBadgeCompact({
  purpose,
  className,
}: Omit<ProposalPurposeBadgeProps, "size">) {
  const config = purposeConfig[purpose];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        className,
      )}
      style={config.style}
      title={config.description}
    >
      {config.label}
    </span>
  );
}

/**
 * Utility function to check if a purpose is part of negotiation workflow
 * Useful for filtering/display logic
 */
export function isNegotiationPurpose(purpose: ProposalPurpose): boolean {
  return purpose === ProposalPurpose.NEGOTIATION;
}

/**
 * Utility function to check if purpose should be shown in negotiation timeline
 * Only NEGOTIATION purposes appear in the timeline; STRESS_TEST and SIMULATION are isolated
 */
export function showInNegotiationTimeline(purpose: ProposalPurpose): boolean {
  return purpose === ProposalPurpose.NEGOTIATION;
}
