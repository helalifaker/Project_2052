/**
 * State Components - Week 2 UI/UX Transformation
 *
 * Comprehensive loading and error state system for Project Zeta.
 * Provides consistent, premium feedback across all application states.
 *
 * Components:
 * - PageSkeleton: Full-page loading states (dashboard, detail, list)
 * - EmptyState: Empty data states with optional CTAs
 * - ErrorState: Error boundaries and fallback UI
 * - ProgressIndicator: Multi-step flow progress tracking
 *
 * Design Philosophy:
 * - Copper accent for positive/active states
 * - Terracotta accent for errors/warnings
 * - Smooth animations (fade-in, shimmer)
 * - Typography and shadows from design tokens
 * - Accessible with proper ARIA labels
 *
 * @example
 * ```tsx
 * import {
 *   PageSkeleton,
 *   EmptyState,
 *   ErrorState,
 *   ProgressIndicator
 * } from '@/components/states';
 *
 * // Loading state
 * if (isLoading) return <PageSkeleton variant="dashboard" />;
 *
 * // Empty state
 * if (!data.length) return (
 *   <EmptyState
 *     variant="folder"
 *     title="No proposals yet"
 *     description="Create your first lease proposal to get started"
 *     action={{ label: "Create Proposal", onClick: handleCreate }}
 *   />
 * );
 *
 * // Error state
 * if (error) return <ErrorState error={error} reset={refetch} />;
 *
 * // Multi-step progress
 * <ProgressIndicator steps={wizardSteps} currentStep={2} />
 * ```
 */

// Core components
export { PageSkeleton, SkeletonBlocks } from "./PageSkeleton";
export { EmptyState, EmptyStates } from "./EmptyState";
export { ErrorState, ErrorStates, ErrorBoundary } from "./ErrorState";
export {
  ProgressIndicator,
  ProgressBar,
  ProgressIndicators,
} from "./ProgressIndicator";
