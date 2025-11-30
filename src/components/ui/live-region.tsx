"use client";

import * as React from "react";

/**
 * LiveRegion Component
 *
 * Announces dynamic content changes to screen readers.
 *
 * WCAG 2.1 Compliance:
 * - 4.1.3 Status Messages (Level AA)
 *
 * Usage:
 * - Use "polite" for non-urgent updates (form validation, data loaded)
 * - Use "assertive" for urgent updates (errors, warnings)
 * - Use "off" to temporarily disable announcements
 *
 * @example
 * // Loading state
 * <LiveRegion politeness="polite">
 *   {isLoading ? "Loading data..." : "Data loaded successfully"}
 * </LiveRegion>
 *
 * @example
 * // Error state
 * <LiveRegion politeness="assertive">
 *   {error ? `Error: ${error.message}` : null}
 * </LiveRegion>
 */

interface LiveRegionProps {
  children: React.ReactNode;
  politeness?: "polite" | "assertive" | "off";
  atomic?: boolean;
  relevant?: "additions" | "removals" | "text" | "all";
  className?: string;
}

export function LiveRegion({
  children,
  politeness = "polite",
  atomic = true,
  relevant = "additions text",
  className,
}: LiveRegionProps) {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic={atomic}
      aria-relevant={relevant}
      className={className || "sr-only"}
    >
      {children}
    </div>
  );
}

/**
 * LoadingAnnouncer Component
 *
 * Specialized component for announcing loading states.
 *
 * @example
 * <LoadingAnnouncer isLoading={isLoading} message="Calculating proposal" />
 */

interface LoadingAnnouncerProps {
  isLoading: boolean;
  message?: string;
  completedMessage?: string;
}

export function LoadingAnnouncer({
  isLoading,
  message = "Loading",
  completedMessage = "Loading complete",
}: LoadingAnnouncerProps) {
  return (
    <LiveRegion politeness="polite">
      {isLoading ? `${message}...` : completedMessage}
    </LiveRegion>
  );
}

/**
 * ErrorAnnouncer Component
 *
 * Specialized component for announcing errors (assertive).
 *
 * @example
 * <ErrorAnnouncer error={error} />
 */

interface ErrorAnnouncerProps {
  error: string | null | undefined;
  prefix?: string;
}

export function ErrorAnnouncer({
  error,
  prefix = "Error",
}: ErrorAnnouncerProps) {
  if (!error) return null;

  return (
    <LiveRegion politeness="assertive">
      {prefix}: {error}
    </LiveRegion>
  );
}

/**
 * SuccessAnnouncer Component
 *
 * Specialized component for announcing success messages.
 *
 * @example
 * <SuccessAnnouncer message={successMessage} />
 */

interface SuccessAnnouncerProps {
  message: string | null | undefined;
}

export function SuccessAnnouncer({ message }: SuccessAnnouncerProps) {
  if (!message) return null;

  return (
    <LiveRegion politeness="polite">
      {message}
    </LiveRegion>
  );
}
