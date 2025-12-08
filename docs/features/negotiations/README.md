# Negotiation Workflow System

> **Version**: 2.2 | **Added**: December 2025

The Negotiation Workflow System enables structured tracking of lease proposal exchanges between your organization and developers/landlords, providing a complete timeline of offers and counter-offers.

---

## Quick Navigation

| Document | Description |
|----------|-------------|
| [Workflow Guide](workflow.md) | Complete user workflow and best practices |
| [API Reference](api.md) | Detailed API endpoints with examples |
| [Components Guide](components.md) | React component documentation |
| [Status Guide](status-guide.md) | All status states explained |

---

## Overview

### What is a Negotiation?

A **Negotiation** is a container entity that groups all proposals related to a specific developer-property combination. It provides:

- **Timeline View**: Chronological display of all offers and counter-offers
- **Status Tracking**: Track negotiation progress (ACTIVE → ACCEPTED/REJECTED/CLOSED)
- **Metrics Comparison**: Compare financial metrics across offers

### Key Concepts

```
┌─────────────────────────────────────────────────────────────┐
│                      NEGOTIATION                            │
│  Developer: Olayan Group                                    │
│  Property: King Fahd Road Campus                            │
│  Status: ACTIVE                                             │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ TIMELINE                                             │   │
│  │                                                      │   │
│  │  #1 🟦 Our Offer    - REJECTED      (Jan 15)        │   │
│  │  #2 🟥 Their Counter - SUBMITTED    (Jan 20)        │   │
│  │  #3 🟦 Our Offer    - UNDER_REVIEW  (Feb 1)         │   │
│  │  #4 🟥 Their Counter - DRAFT        (Feb 5)         │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Terminology

| Term | Definition |
|------|------------|
| **Negotiation** | Container entity grouping proposals for one developer+property |
| **Offer** | A lease proposal within a negotiation timeline |
| **Our Offer** | Proposal originated from your organization |
| **Their Counter** | Counter-proposal from the developer/landlord |
| **Offer Number** | Sequential position in the timeline (1, 2, 3...) |
| **Purpose** | Why a proposal exists (NEGOTIATION, STRESS_TEST, SIMULATION) |

---

## Data Model

### Negotiation Entity

```prisma
model Negotiation {
  id          String            @id @default(uuid())
  developer   String            /// Developer/landlord company name
  property    String            /// Property/site name
  status      NegotiationStatus @default(ACTIVE)
  notes       String?           /// General negotiation notes
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
  createdBy   String

  // Relations
  creator     User              @relation(...)
  proposals   LeaseProposal[]   @relation("NegotiationProposals")

  @@unique([developer, property])
}
```

### Related Enums

| Enum | Values | Description |
|------|--------|-------------|
| `NegotiationStatus` | ACTIVE, ACCEPTED, REJECTED, CLOSED | Negotiation outcome |
| `ProposalStatus` | DRAFT → NEGOTIATION_CLOSED (9 states) | Individual offer status |
| `ProposalPurpose` | NEGOTIATION, STRESS_TEST, SIMULATION | Why proposal exists |
| `ProposalOrigin` | OUR_OFFER, THEIR_COUNTER | Who originated the offer |

---

## Feature Summary

### For Planners

- Create negotiations with developer and property names
- Add offers to negotiations (link existing or create counter)
- Track status through the workflow
- Compare metrics across offers
- Reorder offers if timeline needs correction

### For Admins

- All planner capabilities
- Delete negotiations (unlinks proposals)
- Manage negotiation lifecycle

### For Viewers

- Read-only access to all negotiations
- View timelines and proposal details
- Export reports

---

## API Overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/negotiations` | GET | List all negotiations |
| `/api/negotiations` | POST | Create new negotiation |
| `/api/negotiations/[id]` | GET | Get negotiation with proposals |
| `/api/negotiations/[id]` | PATCH | Update status/notes |
| `/api/negotiations/[id]` | DELETE | Delete negotiation (ADMIN only) |
| `/api/negotiations/[id]/proposals` | POST | Link existing proposal |
| `/api/negotiations/[id]/counter` | POST | Create counter-offer |
| `/api/negotiations/[id]/reorder` | PATCH | Reorder offer numbers |

See [API Reference](api.md) for complete documentation.

---

## Component Overview

| Component | Purpose |
|-----------|---------|
| `NegotiationCard` | Card display in list view |
| `NegotiationTimeline` | Vertical timeline of offers |
| `NegotiationStatusBadge` | Status indicator (ACTIVE/ACCEPTED/etc.) |
| `ProposalPurposeBadge` | Purpose indicator (NEGOTIATION/STRESS_TEST/etc.) |
| `CreateNegotiationDialog` | Modal for creating negotiations |
| `AddCounterDialog` | Modal for adding counter-offers |
| `LinkProposalDialog` | Modal for linking existing proposals |
| `ReorderOffersDialog` | Modal for reordering timeline |

See [Components Guide](components.md) for implementation details.

---

## File Structure

```
src/
├── app/
│   ├── api/negotiations/
│   │   ├── route.ts                    # GET/POST /api/negotiations
│   │   └── [id]/
│   │       ├── route.ts                # GET/PATCH/DELETE
│   │       ├── proposals/route.ts      # POST (link proposal)
│   │       ├── counter/route.ts        # POST (create counter)
│   │       └── reorder/route.ts        # PATCH (reorder offers)
│   └── negotiations/
│       ├── page.tsx                    # List view
│       ├── new/page.tsx                # Create negotiation
│       └── detail/[id]/page.tsx        # Detail view with timeline
├── components/negotiations/
│   ├── index.ts                        # Barrel exports
│   ├── NegotiationCard.tsx
│   ├── NegotiationTimeline.tsx
│   ├── NegotiationStatusBadge.tsx
│   ├── ProposalPurposeBadge.tsx
│   ├── StatusBadge.tsx
│   ├── CreateNegotiationDialog.tsx
│   ├── AddCounterDialog.tsx
│   ├── LinkProposalDialog.tsx
│   └── ReorderOffersDialog.tsx
└── lib/
    └── validation/
        └── negotiation.ts              # Zod schemas
```

---

## Related Documentation

- [Database Schema](/docs/technical/database-schema.md) - Full Prisma schema
- [API Reference](/docs/technical/api-reference.md) - All API endpoints
- [Planner Guide](/docs/user-guide/planner-guide.md) - User workflow guide
- [RLS Architecture](/docs/security/rls-architecture.md) - Access control policies

---

**Last Updated:** December 2025
**Version:** 2.2
