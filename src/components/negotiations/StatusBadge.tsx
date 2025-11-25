import { ProposalOrigin, ProposalStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: ProposalStatus;
  origin: ProposalOrigin;
}

const statusClasses: Record<ProposalStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-800",
  READY_TO_SUBMIT: "bg-blue-100 text-blue-800",
  SUBMITTED: "bg-blue-100 text-blue-800",
  UNDER_REVIEW: "bg-amber-100 text-amber-800",
  COUNTER_RECEIVED: "bg-orange-100 text-orange-800",
  EVALUATING_COUNTER: "bg-amber-100 text-amber-800",
  ACCEPTED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  NEGOTIATION_CLOSED: "bg-slate-100 text-slate-800",
};

const statusLabel: Record<ProposalStatus, string> = {
  DRAFT: "📝 Draft",
  READY_TO_SUBMIT: "📤 Ready",
  SUBMITTED: "✈️ Submitted",
  UNDER_REVIEW: "⏳ Under Review",
  COUNTER_RECEIVED: "📨 Counter Received",
  EVALUATING_COUNTER: "🔍 Evaluating",
  ACCEPTED: "✅ Accepted",
  REJECTED: "❌ Rejected",
  NEGOTIATION_CLOSED: "🔒 Closed",
};

export function StatusBadge({ status, origin }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
        statusClasses[status],
      )}
    >
      <span>{origin === "OUR_OFFER" ? "🟦 Us" : "🟥 Them"}</span>
      <span>{statusLabel[status]}</span>
    </span>
  );
}
