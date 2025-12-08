import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Monument Card - Primary container for major metrics
 * Part of the Atelier Edition design system
 */
interface MonumentCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Show the corner flourish decoration */
  showFlourish?: boolean;
}

const MonumentCard = React.forwardRef<HTMLDivElement, MonumentCardProps>(
  ({ className, showFlourish = true, children, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="monument-card"
      className={cn(
        "monument-card",
        !showFlourish && "monument-card--minimal",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);
MonumentCard.displayName = "MonumentCard";

const MonumentCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="monument-card-header"
    className={cn("mb-6", className)}
    {...props}
  />
));
MonumentCardHeader.displayName = "MonumentCardHeader";

const MonumentCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    data-slot="monument-card-title"
    className={cn("atelier-display-large", className)}
    {...props}
  />
));
MonumentCardTitle.displayName = "MonumentCardTitle";

const MonumentCardValue = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="monument-card-value"
    className={cn("atelier-financial-hero", className)}
    {...props}
  />
));
MonumentCardValue.displayName = "MonumentCardValue";

const MonumentCardLabel = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="monument-card-label"
    className={cn("atelier-label-uppercase mb-3", className)}
    {...props}
  />
));
MonumentCardLabel.displayName = "MonumentCardLabel";

const MonumentCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="monument-card-description"
    className={cn("text-sm mt-3 text-[var(--atelier-stone-500)]", className)}
    {...props}
  />
));
MonumentCardDescription.displayName = "MonumentCardDescription";

const MonumentCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="monument-card-content"
    className={cn("mt-6", className)}
    {...props}
  />
));
MonumentCardContent.displayName = "MonumentCardContent";

export {
  MonumentCard,
  MonumentCardHeader,
  MonumentCardTitle,
  MonumentCardValue,
  MonumentCardLabel,
  MonumentCardDescription,
  MonumentCardContent,
};
