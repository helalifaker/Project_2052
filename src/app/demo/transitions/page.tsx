'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ModalTransition } from '@/components/ui/modal-transition';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { usePageTransition } from '@/hooks/usePageTransition';

/**
 * Transitions Demo Page
 *
 * Showcases all transition components and animations:
 * - Page transitions (automatic)
 * - Loading bar (automatic on navigation)
 * - Modal transitions
 * - Stagger animations for lists
 */
export default function TransitionsDemoPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isTransitioning } = usePageTransition();

  const demoCards = [
    { id: 1, title: 'Proposal A', value: '125.3M SAR' },
    { id: 2, title: 'Proposal B', value: '143.7M SAR' },
    { id: 3, title: 'Proposal C', value: '98.2M SAR' },
    { id: 4, title: 'Proposal D', value: '156.8M SAR' },
    { id: 5, title: 'Proposal E', value: '132.1M SAR' },
    { id: 6, title: 'Proposal F', value: '110.5M SAR' },
  ];

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Demo', href: '/demo' },
        { label: 'Transitions' },
      ]}
    >
      <div className="space-y-12">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-light tracking-tight text-foreground mb-3">
            Transition System Demo
          </h1>
          <p className="text-muted-foreground">
            Showcasing premium page transitions, loading states, and animations
          </p>
        </div>

        {/* Page Transition Status */}
        <div className="p-6 rounded-xl border border-border bg-card">
          <h2 className="text-lg font-semibold mb-4">Page Transition Status</h2>
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full transition-colors ${
                isTransitioning ? 'bg-copper-500' : 'bg-success-500'
              }`}
            />
            <span className="text-sm">
              {isTransitioning ? 'Transitioning...' : 'Idle'}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Navigate to another page to see the loading bar and page fade-in animation
          </p>
        </div>

        {/* Modal Transition Demo */}
        <div className="p-6 rounded-xl border border-border bg-card">
          <h2 className="text-lg font-semibold mb-4">Modal Transition</h2>
          <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
          <p className="text-sm text-muted-foreground mt-2">
            200ms slide-up animation with scale effect
          </p>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-md">
              <ModalTransition isOpen={isModalOpen}>
                <DialogHeader>
                  <DialogTitle>Premium Modal Transition</DialogTitle>
                  <DialogDescription>
                    This modal slides up with a subtle scale effect in 200ms.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-muted-foreground">
                    The modal content is wrapped in a ModalTransition component
                    for smooth entrance and exit animations.
                  </p>
                </div>
              </ModalTransition>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stagger Animation Demo */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Stagger Animation</h2>
            <p className="text-sm text-muted-foreground">
              Grid items animate sequentially with 50ms delays
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoCards.map((card) => (
              <div
                key={card.id}
                className="stagger-item p-6 rounded-xl border border-border bg-card hover:border-copper-500 transition-colors"
              >
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  {card.title}
                </h3>
                <p className="text-3xl font-light tabular-nums">{card.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Animation Classes Reference */}
        <div className="p-6 rounded-xl border border-border bg-card">
          <h2 className="text-lg font-semibold mb-4">Available Animation Classes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <code className="text-sm bg-muted px-2 py-1 rounded">
                .page-transition-enter
              </code>
              <p className="text-sm text-muted-foreground mt-1">
                300ms fade-in + slide-up (8px)
              </p>
            </div>
            <div>
              <code className="text-sm bg-muted px-2 py-1 rounded">
                .modal-transition-enter
              </code>
              <p className="text-sm text-muted-foreground mt-1">
                200ms slide-up + scale (16px)
              </p>
            </div>
            <div>
              <code className="text-sm bg-muted px-2 py-1 rounded">
                .stagger-item
              </code>
              <p className="text-sm text-muted-foreground mt-1">
                250ms with 50ms delays (up to 8 items)
              </p>
            </div>
            <div>
              <code className="text-sm bg-muted px-2 py-1 rounded">
                .animate-loading-bar
              </code>
              <p className="text-sm text-muted-foreground mt-1">
                500ms horizontal sweep
              </p>
            </div>
          </div>
        </div>

        {/* Design Tokens */}
        <div className="p-6 rounded-xl border border-border bg-card">
          <h2 className="text-lg font-semibold mb-4">Copper Accent Colors</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="h-16 rounded-lg bg-copper-900 mb-2" />
              <p className="text-xs font-mono">copper-900</p>
              <p className="text-xs text-muted-foreground">#7a5c2e</p>
            </div>
            <div className="text-center">
              <div className="h-16 rounded-lg bg-copper-700 mb-2" />
              <p className="text-xs font-mono">copper-700</p>
              <p className="text-xs text-muted-foreground">#a47b42</p>
            </div>
            <div className="text-center">
              <div className="h-16 rounded-lg bg-copper-500 mb-2" />
              <p className="text-xs font-mono">copper-500</p>
              <p className="text-xs text-muted-foreground">#c9a86c</p>
            </div>
            <div className="text-center">
              <div className="h-16 rounded-lg bg-copper-300 mb-2" />
              <p className="text-xs font-mono">copper-300</p>
              <p className="text-xs text-muted-foreground">#e4d4b8</p>
            </div>
            <div className="text-center">
              <div className="h-16 rounded-lg bg-copper-100 mb-2" />
              <p className="text-xs font-mono">copper-100</p>
              <p className="text-xs text-muted-foreground">#f7f3eb</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
