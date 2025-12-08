# Negotiation Workflow Guide

> Complete guide to managing lease negotiations in Project Zeta

---

## Table of Contents

1. [Creating a Negotiation](#creating-a-negotiation)
2. [Adding Offers](#adding-offers)
3. [Managing the Timeline](#managing-the-timeline)
4. [Status Workflow](#status-workflow)
5. [Closing Negotiations](#closing-negotiations)
6. [Best Practices](#best-practices)
7. [Common Scenarios](#common-scenarios)

---

## Creating a Negotiation

### Step 1: Navigate to Negotiations

Access the negotiations list from the main navigation:
- Click **Negotiations** in the sidebar
- Or navigate directly to `/negotiations`

### Step 2: Create New Negotiation

Click the **"New Negotiation"** button to open the creation dialog.

Required fields:
- **Developer**: The landlord/developer company name (e.g., "Olayan Group")
- **Property**: The property/site name (e.g., "King Fahd Road Campus")
- **Notes** (optional): Any initial notes about the negotiation

```
┌───────────────────────────────────────────────┐
│         Create New Negotiation                │
├───────────────────────────────────────────────┤
│                                               │
│  Developer *                                  │
│  ┌─────────────────────────────────────────┐  │
│  │ Olayan Group                            │  │
│  └─────────────────────────────────────────┘  │
│                                               │
│  Property *                                   │
│  ┌─────────────────────────────────────────┐  │
│  │ King Fahd Road Campus                   │  │
│  └─────────────────────────────────────────┘  │
│                                               │
│  Notes                                        │
│  ┌─────────────────────────────────────────┐  │
│  │ Initial contact made Dec 2025           │  │
│  └─────────────────────────────────────────┘  │
│                                               │
│           [Cancel]        [Create]            │
└───────────────────────────────────────────────┘
```

### Uniqueness Constraint

Each developer+property combination can only have **one active negotiation**. If you try to create a duplicate, you'll receive an error with a link to the existing negotiation.

---

## Adding Offers

There are three ways to add offers to a negotiation:

### Option 1: Create Counter-Offer

Duplicate an existing proposal and add it as the next offer in the timeline.

1. From the negotiation detail page, click **"Add Counter"**
2. Select the source proposal to duplicate
3. Choose the origin:
   - **Our Offer**: Your organization's proposal
   - **Their Counter**: Developer's counter-proposal
4. The system will:
   - Duplicate all proposal data (enrollment, curriculum, rent params)
   - Clear calculated financials (must be recalculated)
   - Assign the next offer number automatically

```
POST /api/negotiations/{id}/counter
{
  "sourceProposalId": "uuid-of-source",
  "origin": "OUR_OFFER" | "THEIR_COUNTER",
  "name": "Our Revised Offer #3" // optional
}
```

### Option 2: Link Existing Proposal

Connect an already-created proposal to the negotiation.

1. Click **"Link Proposal"** from the actions menu
2. Select from unlinked proposals (purpose: SIMULATION)
3. Choose the origin and position

```
POST /api/negotiations/{id}/proposals
{
  "proposalId": "uuid-of-existing-proposal",
  "origin": "OUR_OFFER" | "THEIR_COUNTER",
  "offerNumber": 2  // optional, auto-assigned if not provided
}
```

### Option 3: Create New Proposal

Create a fresh proposal through the 7-step wizard:

1. Navigate to **Proposals > New Proposal**
2. Complete the wizard with all financial parameters
3. After creation, link the proposal to the negotiation

---

## Managing the Timeline

### Timeline View

The negotiation detail page shows a vertical timeline of all offers:

```
┌─────────────────────────────────────────────────────────────┐
│  TIMELINE                                                   │
│                                                             │
│  ● #4 Their Counter    DRAFT           Feb 5, 2025         │
│  │     ↳ SAR 48M/yr rent, 3% escalation                    │
│  │                                                          │
│  ● #3 Our Offer        UNDER_REVIEW    Feb 1, 2025         │
│  │     ↳ SAR 45M/yr rent, 5% escalation                    │
│  │                                                          │
│  ● #2 Their Counter    SUBMITTED       Jan 20, 2025        │
│  │     ↳ SAR 52M/yr rent, 2% escalation                    │
│  │                                                          │
│  ● #1 Our Offer        REJECTED        Jan 15, 2025        │
│        ↳ SAR 40M/yr rent, 5% escalation                    │
└─────────────────────────────────────────────────────────────┘
```

### Reordering Offers

If offers were added in the wrong order, you can reorder them:

1. Click **"Reorder"** from the actions menu
2. Drag offers to the correct positions
3. Click **"Save Order"**

```
PATCH /api/negotiations/{id}/reorder
{
  "offers": [
    { "proposalId": "uuid-1", "offerNumber": 1 },
    { "proposalId": "uuid-2", "offerNumber": 2 },
    { "proposalId": "uuid-3", "offerNumber": 3 }
  ]
}
```

### Color Coding

- 🟦 **Blue**: Our offers (OUR_OFFER)
- 🟥 **Red**: Their counters (THEIR_COUNTER)

---

## Status Workflow

### Negotiation Status

The overall negotiation has four possible statuses:

| Status | Description | Actions Available |
|--------|-------------|-------------------|
| **ACTIVE** | Negotiation is ongoing | Add offers, update status |
| **ACCEPTED** | Deal was accepted | View only, create stress tests |
| **REJECTED** | Negotiation failed | View only |
| **CLOSED** | Manually closed without resolution | View only |

### Proposal Status

Each individual offer has its own status. See the [Status Guide](status-guide.md) for the complete state machine.

**Typical flow:**
```
DRAFT → READY_TO_SUBMIT → SUBMITTED → UNDER_REVIEW → [ACCEPTED | REJECTED | COUNTER_RECEIVED]
```

---

## Closing Negotiations

### Accepting a Deal

When a proposal is accepted:

1. Update the winning proposal's status to **ACCEPTED**
2. Update the negotiation status to **ACCEPTED**
3. The accepted proposal can be used for stress testing

```
// Update proposal status
PATCH /api/proposals/{proposalId}
{ "status": "ACCEPTED" }

// Update negotiation status
PATCH /api/negotiations/{negotiationId}
{ "status": "ACCEPTED" }
```

### Rejecting/Closing

If negotiations fail:

1. Update the negotiation status to **REJECTED** or **CLOSED**
2. All linked proposals remain accessible for reference

### Post-Negotiation Analysis

After a negotiation is ACCEPTED, you can:

1. Create **Stress Test** proposals to analyze sensitivity
2. Run **Scenarios** on the accepted proposal
3. Generate **Sensitivity Analysis** (tornado charts)

Stress test proposals use `purpose: STRESS_TEST` and are not part of the negotiation timeline.

---

## Best Practices

### Naming Conventions

Use clear, sequential naming for offers:

```
✓ "Our Initial Offer - 30yr Fixed"
✓ "Their Counter #2 - Revenue Share"
✓ "Our Final Offer - Partner Investment"

✗ "Proposal 1"
✗ "test"
✗ "asdf"
```

### Notes and Documentation

- Add notes to the negotiation for context
- Use `boardComments` on proposals for internal discussion
- Use `negotiationNotes` on proposals for negotiation-specific details

### Timeline Accuracy

- Always verify offer numbers reflect chronological order
- Use the reorder feature if offers were added out of sequence
- Document any timeline corrections in notes

### Status Updates

- Update proposal statuses promptly as negotiations progress
- Use the correct status for the current state
- Update negotiation status when reaching a conclusion

---

## Common Scenarios

### Scenario 1: Standard Negotiation

```
1. Create negotiation: "ABC Developer" + "North Campus"
2. Create initial proposal through wizard
3. Link proposal as "Our Offer #1"
4. Submit → Status: SUBMITTED
5. Receive counter-proposal terms
6. Create counter-offer: "Their Counter #2"
7. Enter their terms, recalculate
8. Evaluate → Status: EVALUATING_COUNTER
9. Create response: "Our Offer #3"
10. Continue until ACCEPTED or REJECTED
```

### Scenario 2: Linking Historical Proposals

```
1. You have existing SIMULATION proposals
2. Create negotiation container
3. Link first proposal as "Our Offer #1"
4. Link second as "Their Counter #2"
5. Continue adding to timeline
```

### Scenario 3: Post-Acceptance Analysis

```
1. Negotiation status: ACCEPTED
2. Create new proposal with purpose: STRESS_TEST
3. Modify key assumptions (enrollment, rates)
4. Compare metrics to accepted proposal
5. Document findings in board comments
```

### Scenario 4: Multiple Properties with Same Developer

```
Olayan Group negotiations:
├── "Olayan Group" + "King Fahd Campus"   → Negotiation #1
├── "Olayan Group" + "Riyadh North Site"  → Negotiation #2
└── "Olayan Group" + "Jeddah Location"    → Negotiation #3
```

Each property gets its own negotiation container.

---

## Troubleshooting

### "Negotiation already exists"

A negotiation for this developer+property combination exists. You'll receive the existing ID to navigate to it.

### "Proposal already linked to another negotiation"

Each proposal can only belong to one negotiation. To reuse, either:
- Unlink from the original negotiation first
- Create a counter-offer (duplicate) instead

### "Duplicate offer numbers not allowed"

When reordering, each offer must have a unique number. Check for duplicates in your reorder request.

### Timeline shows wrong order

Use the Reorder feature to correct offer numbers. The timeline always sorts by `offerNumber` ascending.

---

## Related Documentation

- [Status Guide](status-guide.md) - Complete status state machine
- [API Reference](api.md) - Detailed endpoint documentation
- [Components Guide](components.md) - React component usage

---

**Last Updated:** December 2025
**Version:** 2.2
