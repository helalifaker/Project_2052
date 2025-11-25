# PRD VERSION 2.1 - NARRATIVE CORRECTION ADDENDUM
## School Lease Negotiation & Financial Analysis Application
### Project Zeta

---

**Document Version:** 2.1 (Addendum to v2.0)
**Date:** November 23, 2025
**Change Type:** Narrative Correction (Workflow Clarification)
**Impact Level:** Medium (Schema + UX changes, core engine unchanged)
**Status:** APPROVED - Implementation in Progress

---

## CHANGE SUMMARY

This addendum corrects the **product narrative** in PRD v2.0 to accurately reflect the **iterative negotiation workflow**. All financial calculation requirements from v2.0 remain **100% unchanged**.

**What Changed:**
- ✅ Product framing: Passive receiver → Active negotiator
- ✅ Data model: Add negotiation tracking fields
- ✅ Dashboard UX: Flat list → Thread-based view
- ✅ Status tracking: Added negotiation lifecycle states

**What Stayed the Same:**
- ✅ All financial calculations (100% unchanged)
- ✅ Three rent models (unchanged)
- ✅ Three-period framework (unchanged)
- ✅ Performance requirements (< 1 second)
- ✅ Export functionality (unchanged)

---

## CORRECTED PRODUCT VISION

### Original Vision (v2.0) - INCORRECT
> "Enable comparison of lease proposals received from developers to select the best option."

**Implied Workflow:**
1. Developers submit proposals
2. School reviews proposals
3. School selects best one
4. Done ✅

**Problem:** This is not how negotiations work in reality.

### Corrected Vision (v2.1) - CORRECT
> "Enable financial evaluation of lease scenarios to prepare negotiation positions and evaluate developer responses through iterative offer-counteroffer cycles."

**Actual Workflow:**
1. School creates financial model/offer
2. School submits to developer
3. Developer responds with counter-offer
4. School evaluates counter & creates new counter
5. Iterate until accepted/rejected/abandoned
6. Multiple rounds, multiple versions per negotiation

---

## UPDATED PROBLEM STATEMENT

### v2.0 Problem Statement (Partial)
> "The school board faces a critical decision: selecting a 25-year lease proposal (2028-2053) from multiple developers."

### v2.1 Problem Statement (Complete)
> "The school board must **negotiate** a 25-year lease agreement (2028-2053) with developers through an **iterative offer-counteroffer process**. Each negotiation involves:
> - Creating initial financial models to determine viable rent structures
> - Submitting offers to developers
> - Evaluating developer counter-proposals
> - Creating counter-offers based on financial analysis
> - Multiple rounds until agreement is reached
>
> Current manual analysis cannot support this **dynamic negotiation process** with rapid sensitivity testing, version tracking, and comparative evaluation across negotiation rounds."

---

## DATA MODEL ADDITIONS

### New Fields Added to LeaseProposal

```typescript
interface LeaseProposal {
  // ... All existing fields from v2.0 (UNCHANGED)

  // NEW: Negotiation Context
  developer: string;              // Developer name (e.g., "Developer ABC")
  property: string;               // Property identifier (e.g., "Downtown Campus Site")
  negotiationRound: number;       // Which round (1, 2, 3...)
  version: string;                // Version within round (e.g., "V2.1")

  // NEW: Proposal Metadata
  origin: ProposalOrigin;         // 'OUR_OFFER' or 'THEIR_COUNTER'
  status: ProposalStatus;         // Lifecycle status (see enum below)
  parentProposalId?: string;      // Links to previous version in thread

  // NEW: Timeline Tracking
  submittedDate?: Date;           // When we/they submitted
  responseReceivedDate?: Date;    // When response came back

  // NEW: Notes & Context
  negotiationNotes?: string;      // Internal evaluation notes
  boardComments?: string;         // Board discussion notes
}

enum ProposalOrigin {
  OUR_OFFER = 'our_offer',           // Created by school
  THEIR_COUNTER = 'their_counter',   // Received from developer
}

enum ProposalStatus {
  // Our offers
  DRAFT = 'draft',                        // We're working on it
  READY_TO_SUBMIT = 'ready_to_submit',   // Reviewed, ready to send
  SUBMITTED = 'submitted',                // Sent to developer
  UNDER_REVIEW = 'under_review',          // Developer reviewing

  // Their counters
  COUNTER_RECEIVED = 'counter_received',  // They responded
  EVALUATING_COUNTER = 'evaluating_counter', // We're analyzing

  // Final states
  ACCEPTED = 'accepted',                  // Deal accepted
  REJECTED = 'rejected',                  // Offer/counter rejected
  NEGOTIATION_CLOSED = 'negotiation_closed', // Thread ended
}
```

### Database Migration Required

```sql
-- Add negotiation tracking fields
ALTER TABLE "LeaseProposal" ADD COLUMN "developer" TEXT;
ALTER TABLE "LeaseProposal" ADD COLUMN "property" TEXT;
ALTER TABLE "LeaseProposal" ADD COLUMN "negotiationRound" INTEGER DEFAULT 1;
ALTER TABLE "LeaseProposal" ADD COLUMN "version" TEXT;
ALTER TABLE "LeaseProposal" ADD COLUMN "origin" TEXT CHECK ("origin" IN ('our_offer', 'their_counter'));
ALTER TABLE "LeaseProposal" ADD COLUMN "status" TEXT DEFAULT 'draft';
ALTER TABLE "LeaseProposal" ADD COLUMN "parentProposalId" TEXT REFERENCES "LeaseProposal"("id");
ALTER TABLE "LeaseProposal" ADD COLUMN "submittedDate" TIMESTAMP;
ALTER TABLE "LeaseProposal" ADD COLUMN "responseReceivedDate" TIMESTAMP;
ALTER TABLE "LeaseProposal" ADD COLUMN "negotiationNotes" TEXT;
ALTER TABLE "LeaseProposal" ADD COLUMN "boardComments" TEXT;

-- Add index for negotiation queries
CREATE INDEX "idx_negotiation_thread" ON "LeaseProposal"("developer", "property", "negotiationRound");
CREATE INDEX "idx_status" ON "LeaseProposal"("status");
```

---

## UPDATED USER STORIES

### NEW User Stories (Added to v2.0)

**US-P1-NEW: Create Initial Offer**
- As a Planner, I want to create an initial lease offer to submit to a developer
- Acceptance Criteria:
  - Enter developer name and property details
  - Configure transition and dynamic period assumptions
  - Select rent model (Fixed/Revenue Share/Partner)
  - Mark as DRAFT initially
  - Can progress to READY_TO_SUBMIT when reviewed
  - Can submit (changes status to SUBMITTED, records submittedDate)

**US-P2-NEW: Log Developer Counter-Proposal**
- As a Planner, I want to record a counter-proposal received from a developer
- Acceptance Criteria:
  - Create new proposal version
  - Mark origin as THEIR_COUNTER
  - Link to parent (our previous offer) via parentProposalId
  - Status: COUNTER_RECEIVED
  - Record responseReceivedDate
  - Can add negotiationNotes with initial assessment

**US-P3-NEW: Evaluate Developer Counter**
- As a Planner, I want to evaluate a developer's counter-proposal financially
- Acceptance Criteria:
  - View their counter's financial projections
  - Run sensitivity analysis on their terms
  - Compare to our previous offer
  - Compare to our internal targets
  - Status changes to EVALUATING_COUNTER
  - Can add detailed evaluation notes

**US-P4-NEW: Create Counter-Offer**
- As a Planner, I want to create a counter-offer in response to developer's proposal
- Acceptance Criteria:
  - Duplicate developer's counter as starting point (optional)
  - Adjust rent model parameters
  - Mark origin as OUR_OFFER
  - Link to parent (their counter) via parentProposalId
  - Increment negotiation round if switching back to us
  - Status: DRAFT → READY_TO_SUBMIT → SUBMITTED

**US-P5-NEW: View Negotiation Timeline**
- As a Planner, I want to see complete negotiation history with a developer
- Acceptance Criteria:
  - View all proposals chronologically
  - See status of each version
  - Identify origin (us/them) with visual badges
  - Navigate to any version's details
  - See time elapsed between rounds
  - Filter by status or round

**US-P6-NEW: Compare Versions Within Negotiation**
- As a Planner, I want to compare multiple versions from same negotiation
- Acceptance Criteria:
  - Select 2-3 versions from negotiation thread
  - Side-by-side financial comparison
  - Highlight deltas between versions
  - Show progression over rounds
  - Filter comparison by origin (ours only, theirs only, mixed)
  - Export comparison report

**US-P7-NEW: Track Negotiation Status**
- As a Planner, I want to track where each negotiation stands
- Acceptance Criteria:
  - Dashboard shows status badges for each proposal
  - Clear indication of "ball in our court" vs "awaiting response"
  - Notifications for overdue responses (optional)
  - Can manually update status as negotiation progresses
  - Can mark negotiation as CLOSED (accepted/rejected/abandoned)

### REVISED User Stories (from v2.0)

**US-P1 (v2.0): Create Lease Proposal**
→ **REVISED TO:** US-P1-NEW above

**US-P7 (v2.0): Compare Multiple Proposals**
→ **REVISED TO:** Support two comparison modes:
1. **Cross-Negotiation:** Compare final offers from different developers/properties
2. **Within-Thread:** Compare versions within same negotiation (US-P6-NEW)

---

## UPDATED UI/UX REQUIREMENTS

### Dashboard Layout (v2.1)

**Replaces:** Section 7.2 "Dashboard Screen" in PRD v2.0

```
┌─────────────────────────────────────────────────────────────┐
│ 📊 Lease Negotiation Dashboard                              │
│                                                             │
│ [+ Start New Negotiation]    [📋 View All] [⚙️ Settings]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ACTIVE NEGOTIATIONS (2)                                     │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 🏢 Downtown Campus - Developer ABC                  │   │
│ │                                                     │   │
│ │ Round 3 (Current)                                   │   │
│ │ ├─ V3.0 [THEM] Revenue Share 8%                    │   │
│ │ │   📨 Counter-Received: Dec 1, 2025                │   │
│ │ │   💰 25-Yr Total: €125.8M | NPV: €48.2M          │   │
│ │ │   ⚠️ Above target by 24%                         │   │
│ │ │   [📊 Evaluate] [💬 Add Notes]                   │   │
│ │ │                                                   │   │
│ │ └─ V3.1 [US] Revenue Share 6.5%                    │   │
│ │     📝 Draft - In Progress                          │   │
│ │     💰 25-Yr Total: €101.5M | NPV: €44.8M         │   │
│ │     ✅ Within budget                               │   │
│ │     [✏️ Continue] [📤 Submit]                       │   │
│ │                                                     │   │
│ │ [View All 3 Rounds] [📈 Timeline] [+ Counter-Offer]│   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 🏢 North Campus - Developer XYZ                     │   │
│ │                                                     │   │
│ │ Round 1                                             │   │
│ │ └─ V1.0 [US] Fixed Rent 3%                         │   │
│ │     ✈️ Submitted: Nov 20, 2025                     │   │
│ │     ⏳ Awaiting response... (3 days)                │   │
│ │                                                     │   │
│ │ [View Details] [📝 Add Notes]                       │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ CLOSED NEGOTIATIONS (1)                                     │
│                                                             │
│ □ Property A - Developer 123                                │
│   ✅ Accepted: V2.1 Revenue Share 7% (Oct 15, 2025)        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Negotiation Timeline View (NEW)

**New Component:** `NegotiationTimelineView`

```
Property: Downtown Campus
Developer: ABC Development Corp
Status: Active Negotiation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Nov 1, 2025
┌─ V1.0 [US] Fixed Rent 3% annual ───────────────────────┐
│  Status: SUBMITTED                                      │
│  School's target: Keep under 3.5%                      │
│  [View Details] [📊 Financials]                        │
└─────────────────────────────────────────────────────────┘
          ↓ (14 days)

Nov 15, 2025
┌─ V1.1 [THEM] Fixed Rent 5% annual ─────────────────────┐
│  Status: COUNTER_RECEIVED                              │
│  School's evaluation: Too expensive (40% over target)  │
│  Sensitivity: 5% = €15M extra over 25 years           │
│  Internal notes: "Rejected - too high"                 │
│  [View Details] [📊 Compare to V1.0]                   │
└─────────────────────────────────────────────────────────┘
          ↓ (7 days)

Nov 22, 2025
┌─ V2.0 [US] Fixed Rent 4% annual ───────────────────────┐
│  Status: SUBMITTED                                      │
│  School's reasoning: Meet halfway, still acceptable    │
│  [View Details] [📊 Financials]                        │
└─────────────────────────────────────────────────────────┘
          ↓ (9 days)

Dec 1, 2025
┌─ V2.1 [THEM] Revenue Share 8% ─────────────────────────┐
│  Status: EVALUATING_COUNTER                            │
│  School's evaluation: Different model, needs analysis  │
│  Sensitivity: 8% RS vs 4% Fixed → RS better if high   │
│               enrollment sustained                     │
│  Internal notes: "Interesting pivot to Rev Share"      │
│  [View Details] [📊 Run Sensitivity]                   │
└─────────────────────────────────────────────────────────┘
          ↓

Dec 10, 2025 (Draft)
┌─ V3.0 [US] Revenue Share 6.5% ─────────────────────────┐
│  Status: DRAFT                                          │
│  School's reasoning: Split difference, aligns          │
│                      incentives                        │
│  [✏️ Edit] [📤 Submit] [📊 Financials]                 │
└─────────────────────────────────────────────────────────┘
```

### Status Badge Component (NEW)

Visual indicators for proposal status:

```typescript
interface StatusBadge {
  status: ProposalStatus;
  origin: ProposalOrigin;
}

// Visual Design
[📝 DRAFT]             // Gray, our offer in progress
[📤 READY]             // Blue, reviewed and ready
[✈️ SUBMITTED]         // Blue, sent to developer
[⏳ UNDER REVIEW]      // Yellow, developer reviewing
[📨 COUNTER RECEIVED]  // Orange, they responded
[🔍 EVALUATING]        // Yellow, we're analyzing
[✅ ACCEPTED]          // Green, deal done!
[❌ REJECTED]          // Red, offer declined
[🔒 CLOSED]            // Gray, negotiation ended
```

### Comparison Modes (UPDATED)

**Mode 1: Cross-Negotiation Comparison**
> Compare final/best offers from different negotiations

```
Select negotiations to compare:
☑ Downtown Campus - Developer ABC (V3.0 Rev Share 6.5%)
☑ North Campus - Developer XYZ (V1.5 Fixed 4%)
☑ South Campus - Developer QRS (V2.0 Partner)

                    Downtown        North          South
                    ────────        ─────          ─────
Developer           ABC             XYZ            QRS
Our Offer           V3.0            V1.5           V2.0
Rent Model          Rev Share 6.5%  Fixed 4%       Partner
Year 1 Rent         €2.6M          €2.8M          €3.0M
25-Year Total       €101.5M ✅      €118.2M        €135.8M ❌
NPV (4%)            €44.8M ✅       €47.1M         €52.3M ❌
Status              Draft           Submitted      Evaluating

Best Option: Downtown Campus (ABC) - Lowest cost, aligned incentives
```

**Mode 2: Within-Thread Version Comparison**
> Compare versions within same negotiation

```
Negotiation: Downtown Campus - Developer ABC
Select versions to compare:

☑ V2.0 [US] Fixed 4%
☑ V2.1 [THEM] Rev Share 8%
☑ V3.0 [US] Rev Share 6.5%

                    V2.0 [US]       V2.1 [THEM]    V3.0 [US]
                    ─────────       ───────────    ─────────
Origin              Our Offer       Their Counter  Our Counter
Rent Model          Fixed 4%        Rev Share 8%   Rev Share 6.5%
Year 1 Rent         €2.4M          €3.2M ⚠️        €2.6M ✅
25-Year Total       €95.8M         €125.8M ⚠️      €101.5M ✅
NPV (4%)            €43.5M         €48.2M          €44.8M
Delta from V2.0     Baseline       +€30M          +€5.7M

Recommendation: V3.0 - Acceptable middle ground, aligns incentives
```

---

## UPDATED NAVIGATION STRUCTURE

### Primary Navigation (Top Level)

**v2.0 Navigation:**
```
- Dashboard
- Historical Data
- System Settings
- Proposals ← Flat list
- Comparison
- Reports
```

**v2.1 Navigation (REVISED):**
```
- Dashboard ← Thread-based view (active negotiations)
- Negotiations ← All negotiations (searchable, filterable)
- Historical Data
- System Settings (Admin only)
- Reports & Analytics
```

### Negotiation-Level Navigation (NEW)

When viewing a specific negotiation thread:

```
Negotiation: Downtown Campus - Developer ABC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tabs:
├─ 🧵 Timeline (chronological view of all versions)
├─ 📊 Compare Versions (side-by-side comparison)
├─ 💬 Notes & Discussion (internal board notes)
├─ 📈 Analysis (sensitivity, scenarios)
└─ 📑 Documents (contracts, emails, attachments)
```

### Proposal-Level Navigation (Unchanged from v2.0)

When viewing a specific proposal version:

```
Proposal: V3.0 [US] Revenue Share 6.5%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tabs (same as v2.0):
├─ 📝 Overview
├─ 🔄 Transition Setup (2025-2027)
├─ 🚀 Dynamic Setup (2028-2053)
├─ 💰 Financial Statements (P&L / BS / CF)
├─ 🎚️ Scenarios (interactive sliders)
└─ 📊 Sensitivity Analysis (tornado diagrams)
```

---

## API ENHANCEMENTS

### New Endpoints

**GET /api/negotiations**
> Get all negotiation threads (grouped proposals)

Query Parameters:
- `status`: Filter by status (active, closed, all)
- `developer`: Filter by developer name
- `property`: Filter by property
- `sortBy`: Sort field (lastActivity, developer, round)
- `sortOrder`: asc | desc

Response:
```json
{
  "negotiations": [
    {
      "developer": "Developer ABC",
      "property": "Downtown Campus",
      "totalRounds": 3,
      "currentRound": 3,
      "latestVersion": "V3.0",
      "latestStatus": "draft",
      "latestOrigin": "our_offer",
      "lastActivity": "2025-12-10T10:00:00Z",
      "proposals": [
        { "id": "...", "version": "V1.0", ... },
        { "id": "...", "version": "V1.1", ... },
        // ...
      ]
    }
  ]
}
```

**GET /api/negotiations/:developer/:property/timeline**
> Get chronological timeline for specific negotiation

Response:
```json
{
  "negotiation": {
    "developer": "Developer ABC",
    "property": "Downtown Campus",
    "status": "active"
  },
  "timeline": [
    {
      "date": "2025-11-01",
      "version": "V1.0",
      "origin": "our_offer",
      "status": "submitted",
      "summary": "Fixed Rent 3%",
      "proposalId": "..."
    },
    // ...
  ]
}
```

### Enhanced Existing Endpoints

**POST /api/proposals** (UPDATED)

Additional fields in request body:
```json
{
  // ... existing fields from v2.0

  // NEW fields
  "developer": "Developer ABC",
  "property": "Downtown Campus",
  "negotiationRound": 2,
  "version": "V2.0",
  "origin": "our_offer",
  "status": "draft",
  "parentProposalId": "parent-id-here",  // optional
  "negotiationNotes": "Countering their 8% with 6.5%"
}
```

**GET /api/proposals** (UPDATED)

Additional query parameters:
- `developer`: Filter by developer
- `property`: Filter by property
- `origin`: Filter by origin (our_offer, their_counter)
- `status`: Filter by status
- `negotiationRound`: Filter by round

---

## IMPLEMENTATION TIMELINE

### Week 1 Extension (+2 days)

**Focus:** Database schema updates

- [ ] Create Prisma migration for new fields
- [ ] Update Prisma schema with enums
- [ ] Run migration on development database
- [ ] Seed with sample negotiation thread
- [ ] Test parent-child relationships

**Deliverables:**
- Updated schema with negotiation tracking
- Migration file
- Updated types

### Week 2 (+3 days)

**Focus:** API & Dashboard

- [ ] Implement /api/negotiations endpoints
- [ ] Update /api/proposals with new filters
- [ ] Build NegotiationThreadView component
- [ ] Build StatusBadge component
- [ ] Update Dashboard layout

**Deliverables:**
- Thread-based dashboard
- Status tracking
- Negotiation grouping

### Week 2-3 (+2 days)

**Focus:** Timeline & Comparison

- [ ] Build TimelineView component
- [ ] Enhance comparison to support within-thread
- [ ] Add version comparison UI
- [ ] Test negotiation workflows

**Deliverables:**
- Timeline view
- Enhanced comparison
- Complete negotiation UX

---

## BACKWARD COMPATIBILITY

**Migration Strategy for Existing Data:**

```sql
-- For existing proposals without negotiation context
UPDATE "LeaseProposal"
SET
  "developer" = 'Legacy Developer',
  "property" = COALESCE("name", 'Legacy Property'),
  "negotiationRound" = 1,
  "version" = 'V1.0',
  "origin" = 'our_offer',
  "status" = 'draft'
WHERE
  "developer" IS NULL;
```

---

## SUCCESS METRICS (UPDATED)

### Additional Metrics (v2.1)

**Negotiation Tracking:**
- Average negotiation rounds to acceptance: Target < 4 rounds
- Time from initial offer to acceptance: Track per negotiation
- Counter-offer response time: Monitor developer responsiveness

**Version Management:**
- Average versions created per negotiation: Track complexity
- Version comparison usage: Measure utility
- Timeline view engagement: Track user behavior

**Status Accuracy:**
- % of proposals with accurate status: Target 100%
- Status update frequency: Measure discipline
- Closed negotiations tracking: Complete history

---

## APPENDIX: TERMINOLOGY GUIDE

**v2.1 Preferred Terms:**

| Concept | Preferred Term | Avoid | Rationale |
|---------|---------------|-------|-----------|
| Financial model/offer | **Proposal** | Scenario, Model | Generic, works both directions |
| Created by school | **[US] Our Offer** | - | Clear ownership |
| Received from dev | **[THEM] Their Counter** | - | Clear origin |
| Multiple versions | **Negotiation Thread** | Proposal Group | Implies continuity |
| Version identifier | **V2.0, V2.1** | Version 2, Draft 2 | Concise, sortable |
| Workflow stage | **Status** | State, Phase | Standard terminology |
| Version history | **Timeline** | History, Log | Visual metaphor |

---

## DOCUMENT STATUS

✅ **APPROVED FOR IMPLEMENTATION**

**Review & Approval:**
- [x] CAO Review: Approved Nov 23, 2025
- [x] Technical Feasibility: Confirmed (Medium effort, 7-9 hours)
- [x] Backward Compatibility: Migration strategy defined
- [x] Impact Assessment: Complete (see PHASE_3_NARRATIVE_CORRECTION.md)

**Next Steps:**
1. Begin schema migration (Week 1 extension)
2. Update API endpoints (Week 2)
3. Build negotiation UX components (Week 2-3)
4. Update documentation and guides

**Dependencies:**
- Requires PRD v2.0 (all financial requirements remain valid)
- Requires Phase 1 & 2 completion (database and calculation engine)

---

**— END OF ADDENDUM —**

*This addendum (v2.1) supersedes narrative and workflow descriptions in PRD v2.0. All financial calculation requirements from v2.0 remain 100% valid and unchanged.*
