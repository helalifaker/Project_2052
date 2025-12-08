# Negotiation Status Guide

> Complete reference for all status states in the Negotiation Workflow System

---

## Table of Contents

1. [Negotiation Status](#negotiation-status)
2. [Proposal Status](#proposal-status)
3. [Proposal Purpose](#proposal-purpose)
4. [Proposal Origin](#proposal-origin)
5. [Status Combinations](#status-combinations)
6. [Visual Reference](#visual-reference)

---

## Negotiation Status

The `NegotiationStatus` enum represents the overall state of a negotiation container.

### Values

| Status | Description | Actions Available | Color |
|--------|-------------|-------------------|-------|
| **ACTIVE** | Negotiation is ongoing | Add offers, update, manage | Blue |
| **ACCEPTED** | Deal was successfully closed | View, create stress tests | Green |
| **REJECTED** | Negotiation failed | View only | Red |
| **CLOSED** | Manually closed (no resolution) | View only | Gray |

### State Diagram

```
                    ┌──────────┐
                    │  ACTIVE  │
                    └────┬─────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
    ┌─────────┐    ┌──────────┐    ┌────────┐
    │ ACCEPTED│    │ REJECTED │    │ CLOSED │
    └─────────┘    └──────────┘    └────────┘
```

### Usage

```typescript
import { NegotiationStatus } from "@/lib/types/roles";

// Check if negotiation is active
if (negotiation.status === NegotiationStatus.ACTIVE) {
  // Allow adding offers
}

// Check if negotiation is finalized
const isClosed = [
  NegotiationStatus.ACCEPTED,
  NegotiationStatus.REJECTED,
  NegotiationStatus.CLOSED
].includes(negotiation.status);
```

### Transitions

| From | To | When |
|------|-----|------|
| ACTIVE | ACCEPTED | Deal terms agreed |
| ACTIVE | REJECTED | Parties walked away |
| ACTIVE | CLOSED | Manual closure |

**Note:** Status transitions are final. Once a negotiation moves from ACTIVE, it cannot return to ACTIVE.

---

## Proposal Status

The `ProposalStatus` enum represents the state of an individual offer within a negotiation.

### Values (9 States)

| Status | Description | Next Actions | Color |
|--------|-------------|--------------|-------|
| **DRAFT** | Initial state, being prepared | Edit, submit | Slate |
| **READY_TO_SUBMIT** | Ready for submission | Submit | Blue |
| **SUBMITTED** | Sent to counterparty | Wait for response | Blue |
| **UNDER_REVIEW** | Counterparty is reviewing | Wait | Amber |
| **COUNTER_RECEIVED** | Counterparty responded | Evaluate | Orange |
| **EVALUATING_COUNTER** | Analyzing their counter | Respond | Amber |
| **ACCEPTED** | Proposal was accepted | Archive | Green |
| **REJECTED** | Proposal was rejected | Create counter | Red |
| **NEGOTIATION_CLOSED** | Negotiation ended | Archive | Slate |

### State Machine

```
┌─────────┐
│  DRAFT  │
└────┬────┘
     │ Complete
     ▼
┌─────────────────┐
│ READY_TO_SUBMIT │
└────────┬────────┘
         │ Submit
         ▼
   ┌───────────┐
   │ SUBMITTED │
   └─────┬─────┘
         │ Counterparty receives
         ▼
  ┌──────────────┐
  │ UNDER_REVIEW │
  └───────┬──────┘
          │
    ┌─────┴─────┬────────────────┐
    │           │                │
    ▼           ▼                ▼
┌────────┐ ┌────────┐ ┌──────────────────┐
│ACCEPTED│ │REJECTED│ │ COUNTER_RECEIVED │
└────────┘ └────────┘ └────────┬─────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ EVALUATING_COUNTER  │
                    └──────────┬──────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
                    ▼                     ▼
              ┌──────────┐         Create counter-
              │ ACCEPTED │         offer (returns
              └──────────┘         to DRAFT)
```

### Status Labels (Display Text)

| Status | Display Label |
|--------|---------------|
| DRAFT | "Draft" |
| READY_TO_SUBMIT | "Ready" |
| SUBMITTED | "Submitted" |
| UNDER_REVIEW | "Under Review" |
| COUNTER_RECEIVED | "Counter Received" |
| EVALUATING_COUNTER | "Evaluating" |
| ACCEPTED | "Accepted" |
| REJECTED | "Rejected" |
| NEGOTIATION_CLOSED | "Closed" |

### Usage

```typescript
import { ProposalStatus } from "@/lib/types/roles";

// Check if proposal can be edited
const canEdit = proposal.status === ProposalStatus.DRAFT;

// Check if proposal is awaiting response
const isWaiting = [
  ProposalStatus.SUBMITTED,
  ProposalStatus.UNDER_REVIEW
].includes(proposal.status);

// Check if proposal is final
const isFinal = [
  ProposalStatus.ACCEPTED,
  ProposalStatus.REJECTED,
  ProposalStatus.NEGOTIATION_CLOSED
].includes(proposal.status);
```

---

## Proposal Purpose

The `ProposalPurpose` enum indicates why a proposal was created.

### Values

| Purpose | Description | Shows in Timeline |
|---------|-------------|-------------------|
| **NEGOTIATION** | Part of active negotiation | Yes |
| **STRESS_TEST** | What-if analysis after acceptance | No |
| **SIMULATION** | Standalone simulation (default) | No |

### When to Use Each

#### NEGOTIATION
- Proposal is linked to a negotiation
- Appears in the negotiation timeline
- Has an offer number
- Part of back-and-forth exchange

#### STRESS_TEST
- Created after negotiation is ACCEPTED
- Used to test sensitivity of accepted terms
- Not part of the timeline
- For internal analysis only

#### SIMULATION
- Default purpose for new proposals
- Standalone financial modeling
- Not linked to any negotiation
- Can be linked later (converts to NEGOTIATION)

### Usage

```typescript
import { ProposalPurpose } from "@/lib/types/roles";

// Filter proposals for timeline
const timelineProposals = proposals.filter(
  p => p.purpose === ProposalPurpose.NEGOTIATION
);

// Check if proposal is for analysis
const isAnalysis = [
  ProposalPurpose.STRESS_TEST,
  ProposalPurpose.SIMULATION
].includes(proposal.purpose);
```

---

## Proposal Origin

The `ProposalOrigin` enum indicates which party created the offer.

### Values

| Origin | Description | Color Indicator |
|--------|-------------|-----------------|
| **OUR_OFFER** | Your organization's proposal | 🟦 Blue |
| **THEIR_COUNTER** | Counterparty's proposal | 🟥 Red |

### Visual Distinction

In the timeline, origin is indicated by color:

```
┌─────────────────────────────────────────┐
│ TIMELINE                                │
│                                         │
│ #4 🟥 Their Counter    DRAFT            │
│ #3 🟦 Our Offer        UNDER_REVIEW     │
│ #2 🟥 Their Counter    SUBMITTED        │
│ #1 🟦 Our Offer        REJECTED         │
└─────────────────────────────────────────┘
```

### Usage

```typescript
import { ProposalOrigin } from "@/lib/types/roles";

// Count by origin
const ourOffers = proposals.filter(
  p => p.origin === ProposalOrigin.OUR_OFFER
).length;

const theirCounters = proposals.filter(
  p => p.origin === ProposalOrigin.THEIR_COUNTER
).length;

// Style by origin
const bgColor = proposal.origin === ProposalOrigin.OUR_OFFER
  ? "bg-blue-100"
  : "bg-red-100";
```

---

## Status Combinations

### Common Scenarios

#### Active Negotiation with Our Latest Offer

```typescript
{
  negotiation: { status: "ACTIVE" },
  latestProposal: {
    origin: "OUR_OFFER",
    status: "SUBMITTED",
    purpose: "NEGOTIATION"
  }
}
```

#### Waiting for Their Response

```typescript
{
  negotiation: { status: "ACTIVE" },
  latestProposal: {
    origin: "OUR_OFFER",
    status: "UNDER_REVIEW",
    purpose: "NEGOTIATION"
  }
}
```

#### Counter Received

```typescript
{
  negotiation: { status: "ACTIVE" },
  latestProposal: {
    origin: "THEIR_COUNTER",
    status: "COUNTER_RECEIVED",
    purpose: "NEGOTIATION"
  }
}
```

#### Deal Closed

```typescript
{
  negotiation: { status: "ACCEPTED" },
  acceptedProposal: {
    origin: "OUR_OFFER",
    status: "ACCEPTED",
    purpose: "NEGOTIATION"
  }
}
```

#### Post-Acceptance Analysis

```typescript
{
  negotiation: { status: "ACCEPTED" },
  stressTest: {
    origin: "OUR_OFFER",
    status: "DRAFT",
    purpose: "STRESS_TEST"
  }
}
```

---

## Visual Reference

### Status Color Matrix

| Status | Background | Text | Dot |
|--------|------------|------|-----|
| DRAFT | slate-100 | slate-600 | slate-400 |
| READY_TO_SUBMIT | blue-100 | blue-600 | blue-400 |
| SUBMITTED | blue-100 | blue-700 | blue-500 |
| UNDER_REVIEW | amber-100 | amber-600 | amber-400 |
| COUNTER_RECEIVED | orange-100 | orange-700 | orange-500 |
| EVALUATING_COUNTER | amber-100 | amber-700 | amber-500 |
| ACCEPTED | green-100 | green-700 | green-500 |
| REJECTED | red-100 | red-700 | red-500 |
| NEGOTIATION_CLOSED | slate-100 | slate-700 | slate-500 |

### Negotiation Status Colors

| Status | Background | Text | Icon |
|--------|------------|------|------|
| ACTIVE | blue-100 | blue-700 | Circle |
| ACCEPTED | green-100 | green-700 | Check |
| REJECTED | red-100 | red-700 | X |
| CLOSED | slate-100 | slate-700 | Lock |

### Purpose Badge Colors

| Purpose | Background | Text |
|---------|------------|------|
| NEGOTIATION | blue-100 | blue-700 |
| STRESS_TEST | amber-100 | amber-700 |
| SIMULATION | slate-100 | slate-600 |

---

## TypeScript Definitions

```typescript
// All status enums
enum NegotiationStatus {
  ACTIVE = "ACTIVE",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  CLOSED = "CLOSED"
}

enum ProposalStatus {
  DRAFT = "DRAFT",
  READY_TO_SUBMIT = "READY_TO_SUBMIT",
  SUBMITTED = "SUBMITTED",
  UNDER_REVIEW = "UNDER_REVIEW",
  COUNTER_RECEIVED = "COUNTER_RECEIVED",
  EVALUATING_COUNTER = "EVALUATING_COUNTER",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  NEGOTIATION_CLOSED = "NEGOTIATION_CLOSED"
}

enum ProposalPurpose {
  NEGOTIATION = "NEGOTIATION",
  STRESS_TEST = "STRESS_TEST",
  SIMULATION = "SIMULATION"
}

enum ProposalOrigin {
  OUR_OFFER = "OUR_OFFER",
  THEIR_COUNTER = "THEIR_COUNTER"
}
```

### Import Location

```typescript
import {
  NegotiationStatus,
  ProposalStatus,
  ProposalPurpose,
  ProposalOrigin
} from "@/lib/types/roles";
```

---

## Related Documentation

- [Workflow Guide](workflow.md) - How to use statuses in practice
- [API Reference](api.md) - API endpoints for status updates
- [Components Guide](components.md) - Badge component styling

---

**Last Updated:** December 2025
**Version:** 2.2
