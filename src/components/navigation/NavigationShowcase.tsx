/**
 * Navigation Components Showcase
 *
 * Visual test page for all navigation component variants.
 * Use this page during development to verify visual consistency.
 *
 * To view: Create a route at /app/dev/navigation/page.tsx that imports this component
 */

'use client';

import {
  Breadcrumbs,
  BreadcrumbsResponsive,
  BackButton,
  BackButtonIcon,
  BackButtonPill,
} from './index';

export function NavigationShowcase() {
  const sampleBreadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Proposals', href: '/proposals' },
    { label: 'Proposal #42' },
  ];

  const deepBreadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Admin', href: '/admin' },
    { label: 'Configuration', href: '/admin/config' },
    { label: 'System Rates', href: '/admin/config/rates' },
    { label: 'Zakat Configuration' },
  ];

  return (
    <div className="min-h-screen bg-background p-8 space-y-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-light text-foreground mb-2">
          Navigation Components Showcase
        </h1>
        <p className="text-muted-foreground">
          Week 2 UI/UX Transformation - Executive Luxury Design
        </p>
      </div>

      {/* Breadcrumbs Section */}
      <section className="max-w-7xl mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Breadcrumbs</h2>
          <div className="space-y-6">
            {/* Standard Breadcrumbs */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">
                Standard Breadcrumbs
              </h3>
              <Breadcrumbs items={sampleBreadcrumbs} />
            </div>

            {/* Responsive Breadcrumbs */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">
                Responsive Breadcrumbs (resize window to see collapse)
              </h3>
              <BreadcrumbsResponsive items={deepBreadcrumbs} />
            </div>

            {/* Two-level Breadcrumbs */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">
                Two-level Breadcrumbs
              </h3>
              <Breadcrumbs
                items={[
                  { label: 'Dashboard', href: '/dashboard' },
                  { label: 'Proposals' },
                ]}
              />
            </div>

            {/* Single Item (edge case) */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">
                Single Item (edge case - should show just one item)
              </h3>
              <Breadcrumbs items={[{ label: 'Dashboard' }]} />
            </div>
          </div>
        </div>
      </section>

      {/* Back Buttons Section */}
      <section className="max-w-7xl mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Back Buttons</h2>
          <div className="space-y-6">
            {/* Default Variant */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">
                Default Variant (text hidden on mobile)
              </h3>
              <BackButton />
            </div>

            {/* Default with Custom Label */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">
                Default with Custom Label
              </h3>
              <BackButton label="Return to Dashboard" />
            </div>

            {/* Default with Always Visible Text */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">
                Default with Always Visible Text
              </h3>
              <BackButton label="Back to All Proposals" hideTextOnMobile={false} />
            </div>

            {/* Icon-Only Variant */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">
                Icon-Only Variant (compact, 36px circle)
              </h3>
              <BackButtonIcon label="Close" />
            </div>

            {/* Pill Variant */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">
                Pill Variant (premium rounded style)
              </h3>
              <BackButtonPill label="Return to Analysis" />
            </div>

            {/* Pill with Default Label */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">
                Pill Variant with Default Label
              </h3>
              <BackButtonPill />
            </div>
          </div>
        </div>
      </section>

      {/* Combined Examples */}
      <section className="max-w-7xl mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Combined Examples</h2>
          <div className="space-y-6">
            {/* Proposal Detail Layout */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">
                Proposal Detail Page Layout
              </h3>
              <div className="space-y-4">
                <BackButton href="/proposals" label="Back to All Proposals" />
                <Breadcrumbs items={sampleBreadcrumbs} />
                <div className="pt-4 border-t border-border">
                  <h1 className="text-3xl font-semibold">
                    Fixed Escalation - School Campus 2025
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    30-year lease proposal with 3% annual escalation
                  </p>
                </div>
              </div>
            </div>

            {/* Comparison Page Layout */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">
                Comparison Page Layout
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <BackButtonIcon href="/proposals" label="Back to proposals" />
                  <BreadcrumbsResponsive
                    items={[
                      { label: 'Dashboard', href: '/dashboard' },
                      { label: 'Proposals', href: '/proposals' },
                      { label: 'Compare', href: '/proposals/compare' },
                      { label: 'Proposals #12, #15, #18' },
                    ]}
                  />
                </div>
                <div className="pt-4 border-t border-border">
                  <h1 className="text-3xl font-semibold">Compare 3 Proposals</h1>
                </div>
              </div>
            </div>

            {/* Executive Dashboard Layout */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">
                Executive Dashboard Layout (Premium Pill Style)
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <BackButtonPill href="/dashboard" label="Return to Dashboard" />
                  <Breadcrumbs
                    items={[
                      { label: 'Dashboard', href: '/dashboard' },
                      { label: 'Executive View' },
                    ]}
                  />
                </div>
                <div className="pt-4 border-t border-border">
                  <h1 className="text-4xl font-light">Executive Dashboard</h1>
                  <p className="text-muted-foreground mt-2">
                    30-year financial projections at a glance
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive States */}
      <section className="max-w-7xl mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Interactive States</h2>
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              Hover over elements to see transitions
            </h3>
            <div className="space-y-6">
              <div className="flex flex-wrap gap-4 items-center">
                <BackButton label="Hover Me" />
                <BackButtonIcon label="Hover Me" />
                <BackButtonPill label="Hover Me" />
              </div>
              <div>
                <Breadcrumbs
                  items={[
                    { label: 'Hover', href: '#' },
                    { label: 'These', href: '#' },
                    { label: 'Links', href: '#' },
                    { label: 'Current Page' },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Design Token Reference */}
      <section className="max-w-7xl mx-auto">
        <div className="bg-muted/50 border border-border rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Design Token Reference</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="font-semibold mb-2">Typography</h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Size: 0.8125rem (13px)</li>
                <li>• Weight: 500 (medium)</li>
                <li>• Line Height: 1.4</li>
                <li>• Tracking: 0.01em</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Spacing</h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Inline Gap: 0.5rem (8px)</li>
                <li>• Icon + Text: 0.5rem (8px)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Colors (Sahara Twilight)</h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Copper 700: #a47b42 (current item)</li>
                <li>• Copper 500: #c9a86c (focus ring)</li>
                <li>• Stone 600: #6b6760 (muted)</li>
                <li>• Stone 950: #1c1a17 (foreground)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Transitions</h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Duration: 200ms</li>
                <li>• Icon Slide: -2px translateX</li>
                <li>• Properties: color, transform</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default NavigationShowcase;
