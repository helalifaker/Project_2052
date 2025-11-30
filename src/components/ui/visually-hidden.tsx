import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * VisuallyHidden Component
 *
 * Hides content visually while keeping it accessible to screen readers.
 *
 * Use cases:
 * - Skip links for keyboard navigation
 * - Descriptive text for icon-only buttons
 * - Additional context for screen readers
 *
 * WCAG 2.1 Compliance:
 * - 1.3.1 Info and Relationships (Level A)
 * - 2.4.1 Bypass Blocks (Level A)
 *
 * @example
 * <VisuallyHidden>
 *   <a href="#main-content">Skip to main content</a>
 * </VisuallyHidden>
 */
export function VisuallyHidden({
  children,
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0",
        "clip-[rect(0,0,0,0)]",
        // When focused, make visible
        "focus-within:static focus-within:w-auto focus-within:h-auto focus-within:m-0 focus-within:overflow-visible focus-within:whitespace-normal focus-within:clip-auto",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/**
 * SkipLink Component
 *
 * Provides keyboard users a way to skip repetitive navigation.
 * Becomes visible when focused.
 *
 * WCAG 2.1 Compliance:
 * - 2.4.1 Bypass Blocks (Level A)
 *
 * @example
 * <SkipLink href="#main-content">Skip to main content</SkipLink>
 */
export function SkipLink({
  href,
  children,
  className,
  ...props
}: React.ComponentProps<"a"> & { href: string }) {
  return (
    <a
      href={href}
      className={cn(
        // Hidden by default
        "absolute left-0 top-0 z-[9999] p-4 bg-primary text-primary-foreground rounded-md",
        "transform -translate-y-full",
        // Visible when focused
        "focus:translate-y-0 focus:outline-none focus:ring-4 focus:ring-ring",
        "transition-transform duration-200",
        className
      )}
      {...props}
    >
      {children}
    </a>
  );
}
