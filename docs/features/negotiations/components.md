# Negotiation Components Guide

> React component documentation for the Negotiation Workflow System

---

## Component Overview

```
src/components/negotiations/
├── index.ts                      # Barrel exports
├── NegotiationCard.tsx          # Card display in list
├── NegotiationTimeline.tsx      # Vertical timeline
├── NegotiationStatusBadge.tsx   # Status badge
├── ProposalPurposeBadge.tsx     # Purpose badge
├── StatusBadge.tsx              # Generic status badge
├── CreateNegotiationDialog.tsx  # Create dialog
├── AddCounterDialog.tsx         # Add counter dialog
├── LinkProposalDialog.tsx       # Link proposal dialog
└── ReorderOffersDialog.tsx      # Reorder dialog
```

---

## Main Components

### NegotiationCard

Card component for displaying a negotiation in list views.

```tsx
import { NegotiationCard } from "@/components/negotiations";

<NegotiationCard
  negotiation={{
    id: "uuid",
    developer: "Olayan Group",
    property: "King Fahd Road Campus",
    status: "ACTIVE",
    notes: "Initial contact December 2025",
    updatedAt: "2025-02-01T14:30:00.000Z",
    createdAt: "2025-01-15T10:00:00.000Z",
    proposalCount: 4,
    ourOffers: 2,
    theirCounters: 2,
    latestOffer: {
      id: "proposal-uuid",
      name: "Their Counter #4",
      offerNumber: 4,
      origin: "THEIR_COUNTER",
      status: "DRAFT",
      updatedAt: "2025-02-05T09:00:00.000Z"
    },
    latestMetrics: {
      totalRent: 450000000,
      npv: 120000000,
      irr: 0.12
    },
    proposals: [...]
  }}
  onAddCounter={(negId, proposalId) => handleAddCounter(negId, proposalId)}
  onReorderOffers={(negId) => handleReorder(negId)}
  onLinkProposal={(negId) => handleLink(negId)}
  className="my-custom-class"
/>
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `negotiation` | `NegotiationCardProps['negotiation']` | Negotiation data object |
| `onAddCounter` | `(negId, proposalId) => void` | Counter-offer callback |
| `onReorderOffers` | `(negId) => void` | Reorder callback |
| `onLinkProposal` | `(negId) => void` | Link proposal callback |
| `className` | `string` | Additional CSS classes |

#### Layout

```
┌─────────────────────────────────────────────────┐
│ [ACTIVE]                        Last: 2 days ago│
│                                                 │
│ Olayan Developer                                │
│ King Fahd Road Campus                           │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ Timeline (last 3 offers)                    │ │
│ │ #3 🟥 Them - COUNTER_RECEIVED               │ │
│ │ #2 🟦 Us   - SUBMITTED                      │ │
│ │ #1 🟦 Us   - REJECTED                       │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Total Rent: SAR 450M │ NPV: SAR 120M │ IRR: 12% │
│                                                 │
│ [View Details]              [Add Counter ▼]     │
└─────────────────────────────────────────────────┘
```

#### Skeleton Loader

```tsx
import { NegotiationCardSkeleton } from "@/components/negotiations";

// Loading state
<NegotiationCardSkeleton />
```

---

### NegotiationTimeline

Vertical timeline showing offers in chronological order.

```tsx
import { NegotiationTimeline, TimelineOffer } from "@/components/negotiations";

const offers: TimelineOffer[] = [
  {
    id: "proposal-1",
    name: "Our Initial Offer",
    offerNumber: 1,
    origin: "OUR_OFFER",
    status: "REJECTED",
    updatedAt: "2025-01-15T10:00:00.000Z",
    metrics: { totalRent: 400000000, npv: 100000000 }
  },
  {
    id: "proposal-2",
    name: "Their Counter #2",
    offerNumber: 2,
    origin: "THEIR_COUNTER",
    status: "SUBMITTED",
    updatedAt: "2025-01-20T14:00:00.000Z",
    metrics: { totalRent: 520000000, npv: 80000000 }
  }
];

<NegotiationTimeline
  offers={offers}
  negotiationId="uuid"
  maxItems={5}
  showViewAll={true}
  compact={false}
  className="my-timeline"
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `offers` | `TimelineOffer[]` | required | Array of offers |
| `negotiationId` | `string` | required | Parent negotiation ID |
| `maxItems` | `number` | 5 | Max items to display |
| `showViewAll` | `boolean` | true | Show "view all" link |
| `compact` | `boolean` | false | Compact mode for cards |
| `className` | `string` | - | Additional CSS classes |

#### TimelineOffer Interface

```typescript
interface TimelineOffer {
  id: string;
  name: string;
  offerNumber: number | null;
  origin: ProposalOrigin;  // "OUR_OFFER" | "THEIR_COUNTER"
  status: ProposalStatus;  // 9 possible values
  updatedAt: string | Date;
  metrics?: {
    totalRent?: number | string;
    npv?: number | string;
    irr?: number | string;
  } | null;
}
```

#### TimelinePreview

Compact timeline for card previews:

```tsx
import { TimelinePreview } from "@/components/negotiations";

<TimelinePreview
  offers={offers}
  negotiationId="uuid"
  maxItems={3}
/>
```

---

## Badge Components

### NegotiationStatusBadge

Badge showing negotiation status (ACTIVE, ACCEPTED, REJECTED, CLOSED).

```tsx
import { NegotiationStatusBadge, NegotiationStatusBadgeCompact } from "@/components/negotiations";

// Full badge
<NegotiationStatusBadge status="ACTIVE" />

// Compact badge (icon only)
<NegotiationStatusBadgeCompact status="ACCEPTED" />
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `status` | `NegotiationStatus` | Status value |
| `className` | `string` | Additional CSS classes |

#### Styling

| Status | Color | Icon |
|--------|-------|------|
| ACTIVE | Blue | Circle |
| ACCEPTED | Green | Check |
| REJECTED | Red | X |
| CLOSED | Gray | Lock |

---

### ProposalPurposeBadge

Badge showing proposal purpose (NEGOTIATION, STRESS_TEST, SIMULATION).

```tsx
import {
  ProposalPurposeBadge,
  ProposalPurposeBadgeCompact,
  isNegotiationPurpose,
  showInNegotiationTimeline
} from "@/components/negotiations";

// Full badge
<ProposalPurposeBadge purpose="NEGOTIATION" />

// Compact badge
<ProposalPurposeBadgeCompact purpose="STRESS_TEST" />

// Utility functions
if (isNegotiationPurpose(proposal.purpose)) {
  // Show in negotiation timeline
}

if (showInNegotiationTimeline(proposal)) {
  // Include in timeline view
}
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `purpose` | `ProposalPurpose` | Purpose value |
| `className` | `string` | Additional CSS classes |

#### Styling

| Purpose | Color | Description |
|---------|-------|-------------|
| NEGOTIATION | Blue | Part of active negotiation |
| STRESS_TEST | Amber | What-if analysis |
| SIMULATION | Gray | Standalone simulation |

---

### StatusBadge

Generic status badge for proposal status with origin indicator.

```tsx
import { StatusBadge } from "@/components/negotiations";

<StatusBadge
  status="UNDER_REVIEW"
  origin="OUR_OFFER"
/>
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `status` | `ProposalStatus` | Proposal status |
| `origin` | `ProposalOrigin` | Offer origin |
| `className` | `string` | Additional CSS classes |

#### Status Colors

| Status | Dot Color | Text Color |
|--------|-----------|------------|
| DRAFT | Slate-400 | Slate-600 |
| READY_TO_SUBMIT | Blue-400 | Blue-600 |
| SUBMITTED | Blue-500 | Blue-700 |
| UNDER_REVIEW | Amber-400 | Amber-600 |
| COUNTER_RECEIVED | Orange-500 | Orange-700 |
| EVALUATING_COUNTER | Amber-500 | Amber-700 |
| ACCEPTED | Green-500 | Green-700 |
| REJECTED | Red-500 | Red-700 |
| NEGOTIATION_CLOSED | Slate-500 | Slate-700 |

---

## Dialog Components

### CreateNegotiationDialog

Modal for creating a new negotiation.

```tsx
import { CreateNegotiationDialog } from "@/components/negotiations";

<CreateNegotiationDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  onSuccess={(negotiation) => {
    // Navigate to new negotiation
    router.push(`/negotiations/detail/${negotiation.id}`);
  }}
/>
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `open` | `boolean` | Dialog open state |
| `onOpenChange` | `(open: boolean) => void` | State change callback |
| `onSuccess` | `(negotiation) => void` | Success callback with created negotiation |

#### Fields

- **Developer** (required): Company name, max 255 chars
- **Property** (required): Site name, max 255 chars
- **Notes** (optional): Initial notes, max 2000 chars

---

### AddCounterDialog

Modal for creating a counter-offer by duplicating a source proposal.

```tsx
import { AddCounterDialog } from "@/components/negotiations";

<AddCounterDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  negotiationId="uuid"
  sourceProposal={{
    id: "source-uuid",
    name: "Their Counter #2"
  }}
  onSuccess={(counterOffer) => {
    // Navigate to new proposal for editing
    router.push(`/proposals/${counterOffer.id}`);
  }}
/>
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `open` | `boolean` | Dialog open state |
| `onOpenChange` | `(open: boolean) => void` | State change callback |
| `negotiationId` | `string` | Parent negotiation ID |
| `sourceProposal` | `{ id: string; name: string }` | Proposal to duplicate |
| `onSuccess` | `(counterOffer) => void` | Success callback |

#### Fields

- **Origin** (required): OUR_OFFER or THEIR_COUNTER
- **Name** (optional): Auto-generated if not provided

---

### LinkProposalDialog

Modal for linking an existing proposal to a negotiation.

```tsx
import { LinkProposalDialog } from "@/components/negotiations";

<LinkProposalDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  negotiationId="uuid"
  onSuccess={(linkedProposal) => {
    // Refresh negotiation data
    refetch();
  }}
/>
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `open` | `boolean` | Dialog open state |
| `onOpenChange` | `(open: boolean) => void` | State change callback |
| `negotiationId` | `string` | Parent negotiation ID |
| `onSuccess` | `(proposal) => void` | Success callback |

#### Fields

- **Proposal** (required): Select from unlinked proposals
- **Origin** (required): OUR_OFFER or THEIR_COUNTER
- **Offer Number** (optional): Auto-assigned if not provided

---

### ReorderOffersDialog

Modal for reordering offer numbers in the timeline.

```tsx
import { ReorderOffersDialog } from "@/components/negotiations";

<ReorderOffersDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  negotiationId="uuid"
  proposals={currentProposals}
  onSuccess={(reorderedProposals) => {
    // Refresh timeline
    refetch();
  }}
/>
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `open` | `boolean` | Dialog open state |
| `onOpenChange` | `(open: boolean) => void` | State change callback |
| `negotiationId` | `string` | Parent negotiation ID |
| `proposals` | `Array<{ id, name, offerNumber }>` | Current proposals |
| `onSuccess` | `(proposals) => void` | Success callback |

#### Features

- Drag-and-drop reordering
- Validation for duplicate numbers
- Preview of new order before saving

---

## Import Patterns

### Barrel Import

```tsx
// Recommended: Use barrel exports
import {
  NegotiationCard,
  NegotiationCardSkeleton,
  NegotiationTimeline,
  TimelinePreview,
  NegotiationStatusBadge,
  ProposalPurposeBadge,
  StatusBadge,
  CreateNegotiationDialog,
  AddCounterDialog,
  LinkProposalDialog,
  ReorderOffersDialog
} from "@/components/negotiations";
```

### Direct Import

```tsx
// Alternative: Direct file imports
import { NegotiationCard } from "@/components/negotiations/NegotiationCard";
import { NegotiationTimeline } from "@/components/negotiations/NegotiationTimeline";
```

---

## Type Exports

```tsx
// Types exported from index.ts
import type {
  NegotiationCardProps,
  TimelineOffer
} from "@/components/negotiations";
```

---

## Styling Notes

### Tailwind Classes

All components use Tailwind CSS 4 with the project's design tokens:

- Colors follow the design system (blue for our offers, red for their counters)
- Spacing uses consistent scale (gap-2, gap-4, etc.)
- Responsive breakpoints (sm, md, lg) for mobile support

### Dark Mode

Components support dark mode through Tailwind's `dark:` variants. The timeline colors are designed to work in both light and dark themes.

### Accessibility

- All interactive elements have proper focus states
- Color is not the only indicator (icons accompany status badges)
- Proper ARIA labels on dialogs
- Keyboard navigation support

---

## Related Documentation

- [Status Guide](status-guide.md) - Status definitions
- [Workflow Guide](workflow.md) - User workflows
- [API Reference](api.md) - Backend endpoints

---

**Last Updated:** December 2025
**Version:** 2.2
