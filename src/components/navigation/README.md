# Navigation Components

**Week 2 - UI/UX Transformation**
Executive Luxury aesthetic with Sahara Twilight theme integration.

## Overview

This directory contains navigation components that provide consistent, accessible, and beautiful navigation patterns across Project Zeta. All components are built using design tokens from `/src/lib/design-tokens/` for typography, spacing, and colors.

## Components

### 1. Breadcrumbs

Hierarchical navigation component with semantic HTML and accessibility support.

#### Basic Usage

```tsx
import { Breadcrumbs } from '@/components/navigation';

const items = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Proposals', href: '/proposals' },
  { label: 'Proposal #42' }, // Current page (no href)
];

<Breadcrumbs items={items} />
```

#### Responsive Variant

Automatically collapses middle items on mobile (shows: First ... Last):

```tsx
import { BreadcrumbsResponsive } from '@/components/navigation';

<BreadcrumbsResponsive items={items} />
```

#### Features

- **Typography**: Uses `typography.label.base` (13px, medium weight)
- **Spacing**: 8px inline gaps using `spacing[2]`
- **Colors**:
  - Copper (`--copper-700`) for current item
  - Muted foreground for inactive items
  - Hover transitions to full foreground
- **Icons**: ChevronRight separator (14px, muted)
- **Accessibility**:
  - Semantic `<nav>` with `aria-label="breadcrumb"`
  - Current page marked with `aria-current="page"`
  - Screen reader friendly

#### Props

```typescript
interface BreadcrumbItem {
  label: string;
  href?: string;  // Omit for current page
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}
```

---

### 2. BackButton

Router-aware back navigation button with multiple style variants.

#### Default Variant

Standard back button with icon + text (text hidden on mobile):

```tsx
import { BackButton } from '@/components/navigation';

// Uses router.back()
<BackButton />

// Custom label
<BackButton label="Return to Dashboard" />

// Custom href (overrides router.back)
<BackButton href="/proposals" label="Back to Proposals" />

// Always show text (even on mobile)
<BackButton hideTextOnMobile={false} />

// Custom click handler
<BackButton onClick={() => console.log('Going back')} />
```

#### Icon-Only Variant

Compact circular button (36px × 36px) with icon only:

```tsx
import { BackButtonIcon } from '@/components/navigation';

<BackButtonIcon />
<BackButtonIcon href="/dashboard" label="Return to Dashboard" />
```

#### Pill Variant

Premium rounded pill style with glass-morphism effect:

```tsx
import { BackButtonPill } from '@/components/navigation';

<BackButtonPill />
<BackButtonPill label="Return to Analysis" />
```

#### Features

- **Typography**: Uses `typography.label.base` (13px, medium weight)
- **Spacing**: 8px gap between icon and text using `spacing[2]`
- **Colors**:
  - Muted foreground default
  - Full foreground on hover
  - Copper focus ring (`--copper-500`)
- **Animation**:
  - Smooth color transitions (200ms)
  - Icon slides left on hover (-2px translateX)
- **Responsive**: Text hidden on mobile (< 640px) by default
- **Accessibility**:
  - Proper `aria-label` when text is hidden
  - Focus ring for keyboard navigation
  - Button semantics

#### Props

```typescript
interface BackButtonProps {
  href?: string;              // Custom navigation target
  label?: string;             // Button text (default: "Back")
  hideTextOnMobile?: boolean; // Hide text on mobile (default: true)
  className?: string;         // Additional CSS classes
  onClick?: () => void;       // Custom click handler
}
```

---

## Design System Integration

### Typography

All components use design tokens from `/src/lib/design-tokens/typography.ts`:

```typescript
import { typography } from '@/lib/design-tokens/typography';

// Applied as:
fontSize: typography.label.base.size,      // 13px
fontWeight: typography.label.base.weight,  // 500
lineHeight: typography.label.base.lineHeight,
letterSpacing: typography.label.base.tracking,
```

### Spacing

All components use spacing tokens from `/src/lib/design-tokens/spacing.ts`:

```typescript
import { spacing } from '@/lib/design-tokens/spacing';

// Applied as:
gap: spacing[2],  // 8px inline spacing
```

### Colors

All components reference CSS custom properties from globals.css:

- **Copper**: `var(--copper-700)` - Primary brand color
- **Copper Ring**: `var(--copper-500)` - Focus states
- **Muted Foreground**: Default inactive state
- **Foreground**: Hover and active states
- **Accent**: Background hover effects

---

## Accessibility

All navigation components follow WCAG 2.1 AA standards:

1. **Semantic HTML**: Proper `<nav>`, `<ol>`, `<li>` structure
2. **Keyboard Navigation**: Full keyboard support with visible focus rings
3. **Screen Readers**:
   - `aria-label` attributes for context
   - `aria-current="page"` for current location
   - `aria-hidden="true"` for decorative icons
4. **Color Contrast**: All text meets 4.5:1 contrast ratio
5. **Focus Indicators**: 2px copper ring with offset

---

## Examples

### Page Header with Breadcrumbs

```tsx
import { Breadcrumbs } from '@/components/navigation';

export function ProposalHeader() {
  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Proposals', href: '/proposals' },
    { label: 'Proposal #42' },
  ];

  return (
    <div className="mb-6">
      <Breadcrumbs items={breadcrumbs} />
      <h1 className="mt-2 text-3xl font-semibold">Proposal #42</h1>
    </div>
  );
}
```

### Modal with Back Button

```tsx
import { BackButtonIcon } from '@/components/navigation';

export function Modal({ onClose }: { onClose: () => void }) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2>Edit Proposal</h2>
        <BackButtonIcon onClick={onClose} label="Close modal" />
      </div>
      {/* Modal content */}
    </div>
  );
}
```

### Detail Page Navigation

```tsx
import { BackButton, Breadcrumbs } from '@/components/navigation';

export function ProposalDetail() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <BackButton href="/proposals" label="Back to All Proposals" />
      </div>
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Proposals', href: '/proposals' },
          { label: 'Proposal #42' },
        ]}
      />
      {/* Page content */}
    </div>
  );
}
```

---

## Migration Guide

### Replacing Existing Navigation

Before:
```tsx
<button onClick={() => router.back()}>← Back</button>
```

After:
```tsx
import { BackButton } from '@/components/navigation';
<BackButton />
```

Before:
```tsx
<div className="text-sm">
  <Link href="/dashboard">Dashboard</Link>
  {' / '}
  <Link href="/proposals">Proposals</Link>
  {' / '}
  <span>Proposal #42</span>
</div>
```

After:
```tsx
import { Breadcrumbs } from '@/components/navigation';
<Breadcrumbs items={[
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Proposals', href: '/proposals' },
  { label: 'Proposal #42' },
]} />
```

---

## Performance

All navigation components are:
- **Client Components**: Use `'use client'` for interactivity
- **Tree Shakeable**: Import only what you need
- **Minimal Bundle**: Only lucide-react icons, Next.js router
- **No Runtime Dependencies**: Pure React components

---

## Future Enhancements

Planned for Week 3-4:

1. **Breadcrumb Dropdown**: Collapsible segments for deep hierarchies
2. **Keyboard Shortcuts**: Arrow key navigation in breadcrumbs
3. **Animation**: Page transitions with Framer Motion
4. **Customization**: Theme variants (light/dark mode support)
