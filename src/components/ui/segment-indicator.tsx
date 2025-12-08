import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Segment Indicator - Status and category markers
 * Part of the Atelier Edition design system
 */
type SegmentIndicatorVariant = "positive" | "negative" | "gold" | "neutral";

interface SegmentIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual variant */
  variant?: SegmentIndicatorVariant;
  /** Show animated pulse dot */
  pulse?: boolean;
}

const variantClasses: Record<SegmentIndicatorVariant, string> = {
  positive: "segment-indicator--positive",
  negative: "segment-indicator--negative",
  gold: "segment-indicator--gold",
  neutral: "segment-indicator--neutral",
};

const SegmentIndicator = React.forwardRef<
  HTMLDivElement,
  SegmentIndicatorProps
>(
  (
    { className, variant = "neutral", pulse = false, children, ...props },
    ref,
  ) => (
    <div
      ref={ref}
      data-slot="segment-indicator"
      className={cn("segment-indicator", variantClasses[variant], className)}
      {...props}
    >
      {pulse && <span className="segment-indicator__dot" aria-hidden="true" />}
      {children}
    </div>
  ),
);
SegmentIndicator.displayName = "SegmentIndicator";

export { SegmentIndicator };
export type { SegmentIndicatorProps, SegmentIndicatorVariant };
