import * as React from "react";
import { cn } from "@/lib/utils";

interface ExecutiveCardProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "default" | "compact" | "ultra-compact";
}

const ExecutiveCard = React.forwardRef<HTMLDivElement, ExecutiveCardProps>(
  ({ className, size: _size = "default", ...props }, ref) => (
    <div ref={ref} className={cn("executive-card", className)} {...props} />
  ),
);
ExecutiveCard.displayName = "ExecutiveCard";

const ExecutiveCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    size?: "default" | "compact" | "ultra-compact";
  }
>(({ className, size = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5",
      size === "compact" ? "p-5" : size === "ultra-compact" ? "p-3" : "p-6",
      className,
    )}
    {...props}
  />
));
ExecutiveCardHeader.displayName = "ExecutiveCardHeader";

const ExecutiveCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
));
ExecutiveCardTitle.displayName = "ExecutiveCardTitle";

const ExecutiveCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    size?: "default" | "compact" | "ultra-compact";
  }
>(({ className, size = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "pt-0",
      size === "compact" ? "p-5" : size === "ultra-compact" ? "p-3" : "p-6",
      className,
    )}
    {...props}
  />
));
ExecutiveCardContent.displayName = "ExecutiveCardContent";

const ExecutiveCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
ExecutiveCardFooter.displayName = "ExecutiveCardFooter";

// Executive Specific Components
const ExecutiveLabel = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    size?: "default" | "compact" | "ultra-compact";
  }
>(({ className, size = "default", ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "executive-label",
      (size === "compact" || size === "ultra-compact") && "text-[9px] mb-2",
      className,
    )}
    {...props}
  />
));
ExecutiveLabel.displayName = "ExecutiveLabel";

const ExecutiveValue = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    size?: "default" | "compact" | "ultra-compact";
  }
>(({ className, size = "default", ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "executive-value",
      (size === "compact" || size === "ultra-compact") && "text-3xl",
      className,
    )}
    {...props}
  />
));
ExecutiveValue.displayName = "ExecutiveValue";

const ExecutiveSubtitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("executive-subtitle", className)} {...props} />
));
ExecutiveSubtitle.displayName = "ExecutiveSubtitle";

const ExecutiveTrend = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    direction?: "positive" | "negative" | "neutral";
    size?: "default" | "compact" | "ultra-compact";
  }
>(({ className, direction = "neutral", size = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      direction === "positive" && "executive-trend-positive",
      direction === "negative" && "executive-trend-negative",
      direction === "neutral" &&
        "text-muted-foreground flex items-center gap-2",
      size === "compact" || size === "ultra-compact"
        ? "text-xs mt-2"
        : "text-sm mt-4",
      className,
    )}
    {...props}
  />
));
ExecutiveTrend.displayName = "ExecutiveTrend";

export {
  ExecutiveCard,
  ExecutiveCardHeader,
  ExecutiveCardFooter,
  ExecutiveCardTitle,
  ExecutiveCardContent,
  ExecutiveLabel,
  ExecutiveValue,
  ExecutiveSubtitle,
  ExecutiveTrend,
};
