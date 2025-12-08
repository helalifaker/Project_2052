"use client";

import { useState, useCallback, useMemo } from "react";
import { ProposalStatus } from "@/lib/types/roles";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProposalStatusSelectProps {
  proposalId: string;
  currentStatus: string;
  onStatusChange?: (newStatus: ProposalStatus) => void;
  disabled?: boolean;
  size?: "sm" | "default";
  className?: string;
}

// Same color config as ProposalCard statusConfig
const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  DRAFT: {
    label: "Draft",
    color: "var(--text-secondary)",
    bg: "var(--bg-subtle)",
    border: "var(--border-medium)",
  },
  READY_TO_SUBMIT: {
    label: "Ready To Submit",
    color: "var(--accent-slate)",
    bg: "var(--bg-warm)",
    border: "var(--border-medium)",
  },
  SUBMITTED: {
    label: "Submitted",
    color: "var(--accent-gold)",
    bg: "var(--atelier-craft-gold-soft)",
    border: "var(--accent-gold)",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    color: "var(--accent-gold)",
    bg: "var(--atelier-craft-gold-soft)",
    border: "var(--accent-gold)",
  },
  COUNTER_RECEIVED: {
    label: "Counter Received",
    color: "var(--accent-gold)",
    bg: "var(--atelier-craft-gold-soft)",
    border: "var(--accent-gold)",
  },
  EVALUATING_COUNTER: {
    label: "Evaluating Counter",
    color: "var(--accent-gold)",
    bg: "var(--atelier-craft-gold-soft)",
    border: "var(--accent-gold)",
  },
  ACCEPTED: {
    label: "Accepted",
    color: "var(--financial-positive)",
    bg: "var(--atelier-ink-positive-soft)",
    border: "var(--financial-positive)",
  },
  REJECTED: {
    label: "Rejected",
    color: "var(--financial-negative)",
    bg: "var(--atelier-ink-negative-soft)",
    border: "var(--financial-negative)",
  },
  NEGOTIATION_CLOSED: {
    label: "Closed",
    color: "var(--text-secondary)",
    bg: "var(--bg-subtle)",
    border: "var(--border-medium)",
  },
};

const STATUS_OPTIONS = Object.entries(STATUS_CONFIG).map(([value, config]) => ({
  value: value as ProposalStatus,
  label: config.label,
}));

export function ProposalStatusSelect({
  proposalId,
  currentStatus,
  onStatusChange,
  disabled = false,
  className,
}: ProposalStatusSelectProps) {
  const { isViewer } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const statusConfig = useMemo(() => {
    const normalized = currentStatus?.toUpperCase() ?? "DRAFT";
    return STATUS_CONFIG[normalized] ?? STATUS_CONFIG.DRAFT;
  }, [currentStatus]);

  const handleValueChange = useCallback(
    async (newStatus: string) => {
      if (newStatus === currentStatus) return;

      setIsUpdating(true);

      try {
        const response = await fetch(`/api/proposals/${proposalId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to update status");
        }

        toast.success("Status updated");
        onStatusChange?.(newStatus as ProposalStatus);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update status",
        );
      } finally {
        setIsUpdating(false);
      }
    },
    [proposalId, currentStatus, onStatusChange],
  );

  // Hide for viewers
  if (isViewer) return null;

  return (
    <Select
      value={currentStatus}
      onValueChange={handleValueChange}
      disabled={disabled || isUpdating}
    >
      <SelectTrigger
        className={cn(
          // Match EXACT Badge styling from ProposalCard
          "inline-flex items-center h-auto w-auto min-w-0 gap-0.5 rounded-md",
          "text-[10px] uppercase tracking-[0.1em] font-semibold",
          "border px-2 py-0.5",
          // Remove default select styling
          "bg-transparent shadow-none",
          "focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
          "hover:opacity-80 transition-opacity cursor-pointer",
          // Style the default chevron icon
          "[&_svg]:h-2.5 [&_svg]:w-2.5 [&_svg]:opacity-60",
          isUpdating && "opacity-50 cursor-wait",
          className,
        )}
        style={{
          color: statusConfig.color,
          backgroundColor: statusConfig.bg,
          borderColor: statusConfig.border,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {isUpdating ? (
          <Loader2 className="h-2.5 w-2.5 animate-spin" />
        ) : (
          <span>{statusConfig.label}</span>
        )}
      </SelectTrigger>
      <SelectContent
        onClick={(e) => e.stopPropagation()}
        className="min-w-[160px]"
      >
        {STATUS_OPTIONS.map((option) => {
          const config = STATUS_CONFIG[option.value];
          const isSelected = option.value === currentStatus?.toUpperCase();
          return (
            <SelectItem
              key={option.value}
              value={option.value}
              className="text-xs cursor-pointer"
            >
              <span
                className="inline-flex items-center gap-1.5"
                style={{ color: isSelected ? config.color : undefined }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: config.color }}
                />
                {option.label}
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
