"use client";

import { ReactNode } from "react";
import { LucideIcon, FileQuestion, Inbox, Search, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Empty State Props
 */
interface EmptyStateProps {
  /** Icon component (Lucide icon) */
  icon?: LucideIcon;
  /** Preset icon variant for common scenarios */
  variant?: "default" | "search" | "folder" | "inbox";
  /** Main heading */
  title: string;
  /** Supporting description */
  description: string;
  /** Optional action button configuration */
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "ghost";
  };
  /** Optional secondary action */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /** Optional illustration or custom content above text */
  illustration?: ReactNode;
  /** Size variant */
  size?: "default" | "compact" | "spacious";
  /** Additional CSS classes */
  className?: string;
}

/**
 * Icon variant mapping
 */
const iconVariants: Record<string, LucideIcon> = {
  default: FileQuestion,
  search: Search,
  folder: FolderOpen,
  inbox: Inbox,
};

/**
 * Size configuration
 */
const sizeConfig = {
  compact: {
    container: "py-12 px-6",
    icon: "h-12 w-12",
    title: "text-lg",
    description: "text-sm",
    spacing: "space-y-3",
  },
  default: {
    container: "py-16 px-8",
    icon: "h-16 w-16",
    title: "text-xl",
    description: "text-base",
    spacing: "space-y-4",
  },
  spacious: {
    container: "py-24 px-12",
    icon: "h-20 w-20",
    title: "text-2xl",
    description: "text-lg",
    spacing: "space-y-6",
  },
} as const;

/**
 * Empty State Component
 *
 * Elegant empty state with optional illustration, icon, and call-to-action.
 * Provides clear feedback when no data is available.
 *
 * Features:
 * - Preset variants for common scenarios (search, folder, inbox)
 * - Custom icon support via Lucide icons
 * - Optional illustration/custom content
 * - Primary and secondary action buttons
 * - Three size variants
 * - Smooth fade-in animation
 *
 * Design Details:
 * - Centered layout with balanced spacing
 * - Copper accent for icons and primary actions
 * - Terracotta for secondary messaging
 * - Elevation shadow on card variant
 * - Typography from design tokens
 *
 * @example
 * ```tsx
 * // Simple empty state
 * <EmptyState
 *   variant="search"
 *   title="No results found"
 *   description="Try adjusting your search filters"
 * />
 *
 * // With action button
 * <EmptyState
 *   variant="folder"
 *   title="No proposals yet"
 *   description="Create your first lease proposal to get started"
 *   action={{
 *     label: "Create Proposal",
 *     onClick: () => router.push('/proposals/new')
 *   }}
 * />
 *
 * // With custom icon and secondary action
 * <EmptyState
 *   icon={Database}
 *   title="No historical data"
 *   description="Import your 2023-2024 financial data to begin projections"
 *   action={{
 *     label: "Import Data",
 *     onClick: handleImport
 *   }}
 *   secondaryAction={{
 *     label: "Learn More",
 *     onClick: () => router.push('/docs')
 *   }}
 * />
 * ```
 */
export function EmptyState({
  icon,
  variant = "default",
  title,
  description,
  action,
  secondaryAction,
  illustration,
  size = "default",
  className,
}: EmptyStateProps) {
  const config = sizeConfig[size];
  const IconComponent = icon || iconVariants[variant];

  return (
    <div
      className={cn(
        "flex items-center justify-center w-full animate-fade-in",
        className
      )}
    >
      <Card
        className={cn(
          "flex flex-col items-center text-center max-w-lg",
          config.container
        )}
      >
        <div className={config.spacing}>
          {/* Illustration or Icon */}
          {illustration ? (
            <div className="flex justify-center mb-2">{illustration}</div>
          ) : (
            <div className="flex justify-center">
              <div
                className={cn(
                  "rounded-full bg-copper-100 dark:bg-copper-900/20 flex items-center justify-center",
                  config.icon === "h-12 w-12" && "p-3",
                  config.icon === "h-16 w-16" && "p-4",
                  config.icon === "h-20 w-20" && "p-5"
                )}
              >
                <IconComponent
                  className={cn(config.icon, "text-copper-700 dark:text-copper-500")}
                  strokeWidth={1.5}
                />
              </div>
            </div>
          )}

          {/* Title */}
          <h3
            className={cn(
              config.title,
              "font-semibold tracking-tight text-foreground"
            )}
          >
            {title}
          </h3>

          {/* Description */}
          <p className={cn(config.description, "text-muted-foreground")}>
            {description}
          </p>

          {/* Actions */}
          {(action || secondaryAction) && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {action && (
                <Button
                  onClick={action.onClick}
                  variant={action.variant || "default"}
                  size={size === "compact" ? "sm" : "default"}
                  className="w-full sm:w-auto"
                >
                  {action.label}
                </Button>
              )}
              {secondaryAction && (
                <Button
                  onClick={secondaryAction.onClick}
                  variant="ghost"
                  size={size === "compact" ? "sm" : "default"}
                  className="w-full sm:w-auto"
                >
                  {secondaryAction.label}
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

/**
 * Preset Empty States for Common Scenarios
 */
export const EmptyStates = {
  /**
   * No Search Results
   */
  NoSearchResults: ({
    query,
    onClear,
  }: {
    query?: string;
    onClear?: () => void;
  }) => (
    <EmptyState
      variant="search"
      title="No results found"
      description={
        query
          ? `No results found for "${query}". Try different keywords or filters.`
          : "Try adjusting your search filters"
      }
      action={
        onClear
          ? {
              label: "Clear Filters",
              onClick: onClear,
              variant: "outline",
            }
          : undefined
      }
    />
  ),

  /**
   * No Proposals
   */
  NoProposals: ({ onCreate }: { onCreate: () => void }) => (
    <EmptyState
      variant="folder"
      title="No proposals yet"
      description="Create your first lease proposal to begin analyzing 30-year projections"
      action={{
        label: "Create Proposal",
        onClick: onCreate,
      }}
    />
  ),

  /**
   * No Data Available
   */
  NoData: ({ message }: { message?: string }) => (
    <EmptyState
      variant="inbox"
      title="No data available"
      description={message || "There's nothing here yet"}
      size="compact"
    />
  ),

  /**
   * No Historical Data
   */
  NoHistoricalData: ({ onImport }: { onImport: () => void }) => (
    <EmptyState
      variant="folder"
      title="No historical data"
      description="Import your 2023-2024 financial data to enable accurate projections"
      action={{
        label: "Import Data",
        onClick: onImport,
      }}
    />
  ),
};
