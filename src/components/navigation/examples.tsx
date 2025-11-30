/**
 * Navigation Components - Usage Examples
 *
 * These examples demonstrate all navigation component variants
 * in realistic scenarios from Project Zeta.
 *
 * Copy these patterns into your pages as needed.
 */

'use client';

import { Breadcrumbs, BreadcrumbsResponsive, BackButton, BackButtonIcon, BackButtonPill } from './index';

/**
 * Example 1: Proposal Detail Page
 * Full navigation with breadcrumbs and back button
 */
export function ProposalDetailExample() {
  return (
    <div className="space-y-6 p-8">
      {/* Back button at top */}
      <BackButton href="/proposals" label="Back to All Proposals" />

      {/* Breadcrumbs below */}
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Proposals', href: '/proposals' },
          { label: 'Fixed Escalation - School Campus 2025' },
        ]}
      />

      {/* Page content */}
      <div>
        <h1 className="text-3xl font-semibold">Fixed Escalation - School Campus 2025</h1>
        <p className="text-muted-foreground mt-2">
          30-year lease proposal with 3% annual escalation
        </p>
      </div>
    </div>
  );
}

/**
 * Example 2: Comparison Page
 * Responsive breadcrumbs that collapse on mobile
 */
export function ComparisonPageExample() {
  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        {/* Icon-only back button (compact) */}
        <BackButtonIcon href="/proposals" label="Back to proposals" />

        {/* Responsive breadcrumbs - collapses on mobile */}
        <BreadcrumbsResponsive
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Proposals', href: '/proposals' },
            { label: 'Compare', href: '/proposals/compare' },
            { label: 'Proposals #12, #15, #18' },
          ]}
        />
      </div>

      <h1 className="text-3xl font-semibold">Compare 3 Proposals</h1>
    </div>
  );
}

/**
 * Example 3: Executive Dashboard
 * Pill-style back button for premium feel
 */
export function ExecutiveDashboardExample() {
  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        {/* Premium pill-style back button */}
        <BackButtonPill href="/dashboard" label="Return to Dashboard" />

        {/* Simple breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Executive View' },
          ]}
        />
      </div>

      <div>
        <h1 className="text-4xl font-light">Executive Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          30-year financial projections at a glance
        </p>
      </div>
    </div>
  );
}

/**
 * Example 4: Settings Page
 * Deep hierarchy with responsive breadcrumbs
 */
export function SettingsPageExample() {
  return (
    <div className="space-y-6 p-8">
      {/* Back button with custom text */}
      <BackButton label="Back" hideTextOnMobile={false} />

      {/* Deep breadcrumb trail */}
      <BreadcrumbsResponsive
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Admin', href: '/admin' },
          { label: 'Configuration', href: '/admin/config' },
          { label: 'System Rates', href: '/admin/config/rates' },
          { label: 'Zakat Configuration' },
        ]}
      />

      <h1 className="text-2xl font-semibold">Zakat Configuration</h1>
    </div>
  );
}

/**
 * Example 5: Modal/Drawer Navigation
 * Minimal navigation for overlay components
 */
export function ModalNavigationExample({ onClose }: { onClose: () => void }) {
  return (
    <div className="p-6 border-b border-border">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Create New Proposal</h2>
        <BackButtonIcon onClick={onClose} label="Close" />
      </div>
    </div>
  );
}

/**
 * Example 6: Wizard Step Navigation
 * Shows current step in breadcrumbs
 */
export function WizardNavigationExample({ currentStep }: { currentStep: number }) {
  const steps = [
    'Basics',
    'Transition Setup',
    'Dynamic Setup',
    'Review',
  ];

  return (
    <div className="space-y-4 p-8">
      {/* Back button to exit wizard */}
      <BackButton href="/proposals" label="Exit Wizard" />

      {/* Breadcrumbs showing wizard progress */}
      <Breadcrumbs
        items={[
          { label: 'Proposals', href: '/proposals' },
          { label: 'New Proposal', href: '/proposals/new' },
          { label: `Step ${currentStep + 1}: ${steps[currentStep]}` },
        ]}
      />

      <div>
        <h1 className="text-3xl font-semibold">
          Step {currentStep + 1}: {steps[currentStep]}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {currentStep + 1} of {steps.length}
        </p>
      </div>
    </div>
  );
}

/**
 * Example 7: Simple Page Header
 * Minimal breadcrumbs for top-level pages
 */
export function SimplePageHeaderExample() {
  return (
    <div className="space-y-4 p-8">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Proposals' },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">All Proposals</h1>
          <p className="text-muted-foreground mt-1">
            Manage and compare lease proposals
          </p>
        </div>

        <button className="px-4 py-2 bg-[var(--copper-700)] text-white rounded-md hover:bg-[var(--copper-900)] transition-colors">
          New Proposal
        </button>
      </div>
    </div>
  );
}

/**
 * Example 8: Admin Panel Navigation
 * Custom styling with className prop
 */
export function AdminPanelExample() {
  return (
    <div className="bg-muted/50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Custom styled breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Admin Panel' },
          ]}
          className="mb-6"
        />

        {/* Custom styled back button */}
        <BackButton
          href="/dashboard"
          label="Exit Admin Mode"
          className="mb-4 text-[var(--copper-700)] hover:text-[var(--copper-900)]"
          hideTextOnMobile={false}
        />

        <h1 className="text-4xl font-light">Admin Panel</h1>
      </div>
    </div>
  );
}
