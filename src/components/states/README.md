# State Components - Week 2 UI/UX Transformation

Comprehensive loading and error state component system for Project Zeta. Provides consistent, premium user feedback across all application states.

## Overview

This directory contains four core state components:

1. **PageSkeleton** - Full-page loading states
2. **EmptyState** - Empty data states with optional actions
3. **ErrorState** - Error boundaries and fallback UI
4. **ProgressIndicator** - Multi-step flow progress tracking

All components follow the Sahara Twilight design system with copper accents, warm shadows, and smooth animations.

---

## Components

### 1. PageSkeleton

Full-page loading skeleton with three layout variants.

#### Variants

- `dashboard` - KPI cards grid + chart placeholders
- `detail` - Header + tabs + content sections
- `list` - Table with rows and pagination

#### Usage

```tsx
import { PageSkeleton } from '@/components/states';

// Dashboard loading
<PageSkeleton variant="dashboard" />

// Proposal detail loading
<PageSkeleton variant="detail" />

// List/table loading
<PageSkeleton variant="list" />
```

#### Custom Compositions

Use `SkeletonBlocks` for custom skeleton layouts:

```tsx
import { SkeletonBlocks } from '@/components/states';

<div className="space-y-6">
  <SkeletonBlocks.KPIGrid count={3} columns={3} />
  <SkeletonBlocks.Chart />
  <SkeletonBlocks.Table rows={5} columns={4} />
  <SkeletonBlocks.Text lines={3} />
</div>
```

#### Features

- Shimmer animation (`.animate-shimmer` from globals.css)
- Fade-in animation (`.animate-fade-in`)
- Responsive grid layouts
- Matches real component structure
- Uses KPICardSkeleton for consistency

---

### 2. EmptyState

Elegant empty state with optional illustration and call-to-action.

#### Variants

- `default` - Generic empty state with FileQuestion icon
- `search` - No search results with Search icon
- `folder` - Empty folder with FolderOpen icon
- `inbox` - Empty inbox with Inbox icon

#### Size Variants

- `compact` - Minimal spacing (12px icon, text-lg title)
- `default` - Standard spacing (16px icon, text-xl title)
- `spacious` - Maximum spacing (20px icon, text-2xl title)

#### Usage

```tsx
import { EmptyState } from '@/components/states';

// Simple empty state
<EmptyState
  variant="search"
  title="No results found"
  description="Try adjusting your search filters"
/>

// With action button
<EmptyState
  variant="folder"
  title="No proposals yet"
  description="Create your first lease proposal to get started"
  action={{
    label: "Create Proposal",
    onClick: () => router.push('/proposals/new')
  }}
/>

// With custom icon and secondary action
import { Database } from 'lucide-react';

<EmptyState
  icon={Database}
  title="No historical data"
  description="Import your 2023-2024 financial data to begin projections"
  action={{
    label: "Import Data",
    onClick: handleImport
  }}
  secondaryAction={{
    label: "Learn More",
    onClick: () => router.push('/docs')
  }}
/>
```

#### Preset Empty States

```tsx
import { EmptyStates } from '@/components/states';

// No search results
<EmptyStates.NoSearchResults query="lease" onClear={clearFilters} />

// No proposals
<EmptyStates.NoProposals onCreate={handleCreate} />

// No data
<EmptyStates.NoData message="No scenarios configured" />

// No historical data
<EmptyStates.NoHistoricalData onImport={handleImport} />
```

#### Features

- Copper-tinted icon backgrounds
- Centered layout with balanced spacing
- Primary and secondary actions
- Custom illustrations support
- Smooth fade-in animation

---

### 3. ErrorState

Friendly error boundary fallback with retry functionality.

#### Size Variants

- `compact` - Inline error (12px icon, text-lg title)
- `default` - Standard error card (16px icon, text-xl title)
- `full-page` - Full-page error (20px icon, text-2xl title, min-h-60vh)

#### Usage

```tsx
import { ErrorState } from '@/components/states';

// Simple error state
<ErrorState
  error={error}
  reset={() => window.location.reload()}
/>

// Custom error message
<ErrorState
  title="Failed to load proposals"
  description="We couldn't fetch your lease proposals. Please try again."
  reset={refetch}
/>

// Full page error with navigation
<ErrorState
  error={error}
  reset={reset}
  size="full-page"
  showBackButton
  showHomeButton
/>

// Compact inline error
<ErrorState
  error="Failed to save changes"
  reset={handleRetry}
  size="compact"
/>
```

#### Preset Error States

```tsx
import { ErrorStates } from '@/components/states';

// Network error
<ErrorStates.NetworkError reset={refetch} />

// Not found
<ErrorStates.NotFound resource="proposal" />

// Permission denied
<ErrorStates.PermissionDenied />

// Calculation error
<ErrorStates.CalculationError reset={recalculate} />

// Data load error
<ErrorStates.DataLoadError reset={refetch} />

// Generic fallback
<ErrorStates.Generic error={error} reset={reset} />
```

#### Development Mode

- Shows error stack trace in development
- Collapsible technical details
- Set `showDetails={false}` to hide in production

#### Features

- Terracotta error accent (--destructive)
- Try Again button with RefreshCw icon
- Optional navigation (back, home)
- Error message extraction
- Accessible error messaging (role="alert")

---

### 4. ProgressIndicator

Visual step-by-step progress tracker for multi-step flows.

#### Variants

- `default` - Standard step display with labels
- `compact` - Minimal display (numbers only, no descriptions)
- `detailed` - Full display with descriptions

#### Orientation

- `horizontal` - Steps in a row (default)
- `vertical` - Steps stacked vertically

#### Usage

```tsx
import { ProgressIndicator } from '@/components/states';

// Basic usage
<ProgressIndicator
  steps={[
    { label: "Basics", description: "Proposal details" },
    { label: "Program", description: "Student & curriculum" },
    { label: "Financials", description: "Costs & rent" },
    { label: "Review", description: "Confirm & submit" },
  ]}
  currentStep={1}
/>

// Compact variant
<ProgressIndicator
  steps={steps}
  currentStep={2}
  variant="compact"
/>

// Clickable steps
<ProgressIndicator
  steps={steps}
  currentStep={currentStep}
  onStepClick={(index) => setCurrentStep(index)}
/>

// Vertical orientation
<ProgressIndicator
  steps={steps}
  currentStep={1}
  orientation="vertical"
/>
```

#### Progress Bar Alternative

For simple linear progress:

```tsx
import { ProgressBar } from '@/components/states';

<ProgressBar current={3} total={7} showLabel />
```

#### Preset Progress Indicators

```tsx
import { ProgressIndicators } from '@/components/states';

// Proposal wizard (7 steps)
<ProgressIndicators.ProposalWizard
  currentStep={currentStep}
  onStepClick={handleStepClick}
/>

// Onboarding flow (4 steps)
<ProgressIndicators.Onboarding currentStep={currentStep} />
```

#### Features

- Copper accent for completed/current steps
- Animated step transitions
- Check icons for completed steps
- Connecting lines between steps
- Clickable steps (optional)
- Responsive (stacks on mobile for horizontal)
- Accessible with ARIA labels

---

## Design System Integration

All components use:

- **Colors**: Copper (primary), Terracotta (destructive), Muted (backgrounds)
- **Shadows**: Design token elevation system (card, floating, elevated)
- **Typography**: Design token font sizes and weights
- **Animations**: `.animate-fade-in`, `.animate-shimmer` utilities
- **Spacing**: 4px base unit system

### Color Usage

```typescript
// Copper accent (primary actions, completed steps)
--primary: #a47b42
--copper-500: #c9a86c

// Terracotta (errors)
--destructive: #b84233

// Muted (skeletons, backgrounds)
--muted: #f5f4f1
```

### Shadow Levels

```typescript
// Card elevation
shadow-card: 0 1px 3px...

// Floating elements
shadow-floating: 0 4px 6px...

// Elevated elements
shadow-elevated: 0 10px 15px...
```

---

## Accessibility

All components follow WCAG 2.1 AA standards:

- **PageSkeleton**: Proper `aria-busy` state handling
- **EmptyState**: Semantic HTML with clear hierarchy
- **ErrorState**: `role="alert"` for error announcements, `aria-live="assertive"`
- **ProgressIndicator**: `aria-current="step"`, proper navigation semantics

### Keyboard Navigation

- **ProgressIndicator**: Clickable steps support Enter/Space keys
- **ErrorState**: All buttons are keyboard accessible
- **EmptyState**: Action buttons follow focus order

---

## Integration Examples

### Next.js Page with Loading/Error/Empty States

```tsx
'use client';

import { useProposals } from '@/hooks/useProposals';
import { PageSkeleton, EmptyState, ErrorState } from '@/components/states';

export default function ProposalsPage() {
  const { data, isLoading, error, refetch } = useProposals();

  // Loading state
  if (isLoading) return <PageSkeleton variant="list" />;

  // Error state
  if (error) return <ErrorState error={error} reset={refetch} />;

  // Empty state
  if (!data?.length) {
    return (
      <EmptyState
        variant="folder"
        title="No proposals yet"
        description="Create your first lease proposal to get started"
        action={{
          label: "Create Proposal",
          onClick: () => router.push('/proposals/new')
        }}
      />
    );
  }

  // Success state
  return <ProposalsList proposals={data} />;
}
```

### Multi-Step Wizard with Progress

```tsx
'use client';

import { useState } from 'react';
import { ProgressIndicator } from '@/components/states';

const wizardSteps = [
  { label: "Basics", description: "Proposal details" },
  { label: "Program", description: "Student setup" },
  { label: "Review", description: "Confirm & submit" },
];

export function ProposalWizard() {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div className="space-y-8">
      <ProgressIndicator
        steps={wizardSteps}
        currentStep={currentStep}
        variant="detailed"
      />

      {/* Step content */}
      {currentStep === 0 && <Step1Basics />}
      {currentStep === 1 && <Step2Program />}
      {currentStep === 2 && <Step3Review />}
    </div>
  );
}
```

---

## Migration Guide

### Replace Generic Loading States

```tsx
// Before
{isLoading && <div>Loading...</div>}

// After
{isLoading && <PageSkeleton variant="dashboard" />}
```

### Replace Basic Error States

```tsx
// Before
{error && <div className="text-red-500">{error.message}</div>}

// After
{error && <ErrorState error={error} reset={refetch} />}
```

### Replace Empty Div Placeholders

```tsx
// Before
{!data.length && <div>No data found</div>}

// After
{!data.length && (
  <EmptyState
    variant="search"
    title="No results found"
    description="Try adjusting your filters"
  />
)}
```

---

## File Structure

```
src/components/states/
├── PageSkeleton.tsx       # Full-page loading skeletons
├── EmptyState.tsx         # Empty state component
├── ErrorState.tsx         # Error boundaries & fallbacks
├── ProgressIndicator.tsx  # Multi-step progress tracker
├── index.ts               # Barrel exports
└── README.md              # This file
```

---

## Performance Notes

- All components are client-side (`'use client'`)
- Animations use CSS transforms (GPU-accelerated)
- Shimmer animation is optimized with `will-change: background-position`
- Minimal re-renders (no unnecessary state)

---

## Testing

```tsx
import { render, screen } from '@testing-library/react';
import { EmptyState, ErrorState, ProgressIndicator } from '@/components/states';

// Empty state test
test('renders empty state with action button', () => {
  const handleClick = jest.fn();
  render(
    <EmptyState
      title="No data"
      description="Test description"
      action={{ label: "Create", onClick: handleClick }}
    />
  );

  expect(screen.getByText('No data')).toBeInTheDocument();
  expect(screen.getByText('Create')).toBeInTheDocument();
});

// Error state test
test('renders error state and calls reset', () => {
  const handleReset = jest.fn();
  render(<ErrorState error="Test error" reset={handleReset} />);

  const retryButton = screen.getByText('Try Again');
  retryButton.click();

  expect(handleReset).toHaveBeenCalled();
});

// Progress indicator test
test('renders progress indicator with correct current step', () => {
  const steps = [
    { label: 'Step 1' },
    { label: 'Step 2' },
    { label: 'Step 3' },
  ];

  render(<ProgressIndicator steps={steps} currentStep={1} />);

  expect(screen.getByText('Step 2')).toHaveAttribute('aria-current', 'step');
});
```

---

## Future Enhancements

Potential improvements for future weeks:

1. **PageSkeleton**: Add animated pulse variants
2. **EmptyState**: Support for inline illustrations/Lottie animations
3. **ErrorState**: Automatic error reporting integration (Sentry)
4. **ProgressIndicator**: Time estimates per step
5. **Global**: Dark mode optimizations
6. **Global**: Reduced motion support for animations

---

## Credits

**Week 2 Deliverable**: Loading & Error State Component System
**Design System**: Sahara Twilight (Copper, Terracotta, Stone)
**Framework**: Next.js 16, React 19, TypeScript 5
**Components**: shadcn/ui (Card, Button)
**Icons**: Lucide React
