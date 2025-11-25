# ⚠️ DEPRECATED - ARCHIVED DOCUMENT ⚠️

**This document has been superseded by [02_PRD_v2.1_NARRATIVE_CORRECTION.md](02_PRD_v2.1_NARRATIVE_CORRECTION.md)**

**Deprecation Date:** November 24, 2025
**Reason:** Consolidated into authoritative PRD v2.1 with corrected specifications
**Status:** ARCHIVED - For historical reference only

**DO NOT USE for implementation.** Refer to PRD v2.1 for:
- ✅ Correct data types (TEXT vs VARCHAR)
- ✅ Complete enum definitions with string values
- ✅ Database indexes and CHECK constraints
- ✅ API endpoint specifications
- ✅ Backward compatibility migration strategy
- ✅ Accurate timeline estimates (7 days vs 7-9 hours)

---

# Phase 3 Critical Narrative Correction
**Date:** November 23, 2025
**Issue:** Product narrative misalignment with actual workflow
**Severity:** High (would result in wrong UX if not caught)
**Status:** Identified before UI implementation ✅

---

## The Problem Discovered

During Phase 3 Week 1 implementation review, a critical mismatch was identified between the **assumed product story** (from BCD/PRD) and the **actual workflow**.

### Original Assumption (WRONG)
```
School passively receives lease proposals from developers
    ↓
School compares proposals
    ↓
School selects the best proposal
    ↓
Deal done ✅
```

**Implied User Experience:**
- Dashboard: "Lease Proposals from Developers"
- Cards: "Developer A's Proposal", "Developer B's Proposal"
- Action: "Select winning proposal"
- Comparison: "Which developer offers best terms?"

### Actual Reality (CORRECT)
```
School creates initial financial model/offer
    ↓
School submits proposal to developer
    ↓
Developer responds with counter-offer
    ↓
School evaluates counter & creates new counter
    ↓
Multiple rounds of negotiation
    ↓
Eventually: Accepted or Rejected
```

**Actual User Experience Needed:**
- Dashboard: "Active Negotiations" with multiple rounds
- Cards: "Property X - Round 2" with version history
- Action: "Create counter-offer", "Evaluate their response"
- Comparison: "Our V2.0 vs Their V2.1" OR "Compare rounds"

---

## Impact Analysis

### What This Changes

#### 1. **Data Model** (Medium Impact)
**Before:**
```typescript
Proposal {
  id: string
  name: string
  rentModel: string
  // ... financial data
}
```

**After:**
```typescript
Proposal {
  id: string

  // Negotiation Context (NEW)
  developer: string
  property: string
  negotiationRound: number
  version: string
  origin: 'OUR_OFFER' | 'THEIR_COUNTER'
  status: ProposalStatus  // NEW
  parentProposalId?: string  // NEW (links versions)

  // Dates (NEW)
  submittedDate?: Date
  responseReceivedDate?: Date

  // Existing fields
  name: string
  rentModel: string
  // ... financial data (UNCHANGED)
}

enum ProposalStatus {
  DRAFT,
  READY_TO_SUBMIT,
  SUBMITTED,
  UNDER_REVIEW,
  COUNTER_RECEIVED,
  EVALUATING_COUNTER,
  ACCEPTED,
  REJECTED,
  NEGOTIATION_CLOSED
}
```

#### 2. **Dashboard UX** (High Impact)

**Before:**
```
Proposal List
─────────────
□ Developer A - Fixed Rent
□ Developer B - Revenue Share
□ Developer C - Partnership

[Compare Selected] [Create New]
```

**After:**
```
Active Negotiations
───────────────────
🏢 Property X - Developer ABC
   Round 3 (Current)
   ├─ V3.0 [THEM]: Rev Share 8% → Counter-Received
   │   [📊 Evaluate] [💬 Notes]
   └─ V3.1 [US]: Rev Share 6.5% → Draft
       [✏️ Edit] [📤 Submit]

   [View All Rounds] [+ New Counter]

🏢 Property Y - Developer XYZ
   Round 1
   └─ V1.0 [US]: Fixed 3% → Submitted
       ⏳ Awaiting response...

[+ Start New Negotiation]
```

#### 3. **Comparison Feature** (Medium Impact)

**Two Comparison Modes Needed:**

**Mode A: Compare Our Versions**
> "We have 3 draft counters - which should we submit?"

```
V3.1 [US]         V3.2 [US]         V3.3 [US]
─────────         ─────────         ─────────
Rev Share 6.5%    Rev Share 6.0%    Fixed 4.2%
NPV: €44.8M      NPV: €42.1M       NPV: €43.5M
✅ Balanced       💰 Conservative   📊 Predictable
```

**Mode B: Evaluate Their Counter vs Our Target**
> "They countered with 8% Rev Share - how does it compare to our target?"

```
V3.0 [THEIR COUNTER]    V3.1 [OUR TARGET]    Delta
────────────────────    ─────────────────    ─────
Rev Share 8%            Rev Share 6.5%       +1.5%
Year 1: €3.2M          Year 1: €2.6M        +€0.6M
25-Yr: €125.8M         25-Yr: €101.5M       +€24.3M ⚠️
NPV: €48.2M            NPV: €44.8M          +€3.4M

⚠️ Their counter is 24% more expensive over 25 years
```

#### 4. **Sensitivity Analysis Context** (Minor Impact)

**Use Cases:**
1. **On Their Counter:** "If we accept their 5% escalation, what's the impact?"
2. **On Our Draft:** "What if we offer 3.5% instead of 3%?"
3. **Scenario Testing:** "What if enrollment drops to 80%?"

**UI Needs:**
- Clear indication of WHOSE proposal is being analyzed
- Ability to save sensitivity results as new version
- Compare sensitivity across versions

#### 5. **Navigation & Terminology** (Minor Impact)

**Language Adjustments:**

| Old Term | New Term | Rationale |
|----------|----------|-----------|
| "Lease Proposals" | ✅ Keep, but add context | "Proposals" works for both directions |
| "Compare Proposals" | ✅ "Compare Versions" | Clarifies comparison within negotiation |
| "Create Proposal" | ✅ "Create Offer" or "New Counter" | Clarifies direction |
| "Select Best" | ❌ Remove | Not the goal - negotiation is iterative |

**Status Badges (NEW):**
```
[📝 DRAFT]           Our offer in progress
[📤 READY]           Reviewed, ready to send
[✈️ SUBMITTED]       Sent to developer
[⏳ UNDER REVIEW]    Developer reviewing
[📨 COUNTER RECEIVED] They responded
[🔍 EVALUATING]      Analyzing their counter
[✅ ACCEPTED]        Deal done!
[❌ REJECTED]        They declined
[🔒 CLOSED]          Negotiation ended
```

---

## Workflow Clarification

### The Real Process

**Step 1: Create Initial Offer**
```
School analyzes financials → Creates V1.0 offer → Submits to Developer ABC
```

**Step 2: Receive Counter**
```
Developer ABC responds → V1.1 counter-proposal → School receives notification
```

**Step 3: Evaluate Counter**
```
School evaluates V1.1 → Runs sensitivity analysis → Decides: accept, counter, or walk away
```

**Step 4: Create Counter-Offer**
```
School creates V2.0 counter → Adjusts terms → Submits back to Developer ABC
```

**Step 5-N: Iterate**
```
Repeat steps 2-4 until: ACCEPTED, REJECTED, or NEGOTIATION_CLOSED
```

### Example Timeline

```
Property X - Developer ABC Negotiation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Nov 1, 2025
├─ V1.0 [US]: Fixed Rent 3% annual
│   Status: SUBMITTED
│   School's internal target: Keep under 3.5%
│
Nov 15, 2025
├─ V1.1 [THEM]: Fixed Rent 5% annual
│   Status: COUNTER_RECEIVED
│   School's evaluation: Too expensive (40% over target)
│   Sensitivity: 5% = €15M extra over 25 years
│
Nov 22, 2025
├─ V2.0 [US]: Fixed Rent 4% annual
│   Status: SUBMITTED
│   School's reasoning: Meet halfway, still acceptable
│
Dec 1, 2025
├─ V2.1 [THEM]: Revenue Share 8%
│   Status: COUNTER_RECEIVED
│   School's evaluation: Different model, needs analysis
│   Sensitivity: 8% RS vs 4% Fixed → RS better if enrollment high
│
Dec 10, 2025
├─ V3.0 [US]: Revenue Share 6.5%
│   Status: SUBMITTED
│   School's reasoning: Split difference, aligns incentives
│
Dec 20, 2025
└─ ✅ V3.0 ACCEPTED by Developer ABC
    Negotiation: CLOSED (Success)
    Final Terms: Revenue Share 6.5% for 25 years
```

---

## Updated Requirements

### Database Schema Changes

**Add to `LeaseProposal` table:**
```sql
ALTER TABLE LeaseProposal ADD COLUMN developer VARCHAR(255);
ALTER TABLE LeaseProposal ADD COLUMN property VARCHAR(255);
ALTER TABLE LeaseProposal ADD COLUMN negotiationRound INTEGER DEFAULT 1;
ALTER TABLE LeaseProposal ADD COLUMN version VARCHAR(20);
ALTER TABLE LeaseProposal ADD COLUMN origin VARCHAR(20); -- 'OUR_OFFER' or 'THEIR_COUNTER'
ALTER TABLE LeaseProposal ADD COLUMN status VARCHAR(30); -- enum
ALTER TABLE LeaseProposal ADD COLUMN parentProposalId VARCHAR(255) REFERENCES LeaseProposal(id);
ALTER TABLE LeaseProposal ADD COLUMN submittedDate TIMESTAMP;
ALTER TABLE LeaseProposal ADD COLUMN responseReceivedDate TIMESTAMP;
ALTER TABLE LeaseProposal ADD COLUMN negotiationNotes TEXT;
```

### New UI Components Needed

1. **NegotiationThreadView** (NEW)
   - Groups proposals by developer/property
   - Shows rounds chronologically
   - Displays status badges
   - Quick actions (counter, evaluate)

2. **TimelineView** (NEW)
   - Vertical timeline of negotiation history
   - Color-coded by origin (us/them)
   - Expandable details per version

3. **VersionComparison** (ENHANCED)
   - Side-by-side version comparison
   - Highlight deltas
   - Support both "ours vs ours" and "ours vs theirs"

4. **StatusBadge** (NEW)
   - Visual status indicators
   - Color-coded
   - Tooltips with explanation

### Updated User Stories

**US-P1: Create Initial Offer** (REVISED)
- As a Planner, I want to create a new lease offer to submit to a developer
- Acceptance Criteria:
  - Enter developer name and property details
  - Select rent model and configure parameters
  - Mark as DRAFT initially
  - Can submit when ready (changes to SUBMITTED)

**US-P2: Receive and Evaluate Counter** (NEW)
- As a Planner, I want to log a counter-proposal received from a developer
- Acceptance Criteria:
  - Create new proposal version linked to parent
  - Mark origin as THEIR_COUNTER
  - Status: COUNTER_RECEIVED
  - Run sensitivity to evaluate their terms
  - Add internal evaluation notes

**US-P3: Create Counter-Offer** (NEW)
- As a Planner, I want to create a counter-offer in response to their proposal
- Acceptance Criteria:
  - Duplicate their counter as starting point
  - Adjust parameters
  - Mark origin as OUR_OFFER
  - Link to parent (their counter)
  - Status: DRAFT → READY_TO_SUBMIT → SUBMITTED

**US-P4: View Negotiation History** (NEW)
- As a Planner, I want to see the complete negotiation timeline
- Acceptance Criteria:
  - View all rounds chronologically
  - See status of each version
  - Identify who created each (us/them)
  - Navigate to any version details

**US-P5: Compare Versions in Negotiation** (REVISED)
- As a Planner, I want to compare versions within a negotiation thread
- Acceptance Criteria:
  - Select 2-3 versions from same negotiation
  - Side-by-side financial comparison
  - Highlight differences
  - Filter by origin (ours only, theirs only, or mixed)

---

## Action Plan

### Phase 1: Schema Update (Week 1 Extension - 2 hours)
- [ ] Create migration for new fields
- [ ] Update Prisma schema
- [ ] Add status enum
- [ ] Add origin enum
- [ ] Test with sample data

### Phase 2: API Enhancement (Week 1 Extension - 1 hour)
- [ ] Add filtering by developer/property
- [ ] Add grouping by negotiation thread
- [ ] Add status filtering
- [ ] Update validation schemas

### Phase 3: Dashboard Redesign (Week 2 - 4 hours)
- [ ] Build NegotiationThreadView component
- [ ] Build TimelineView component
- [ ] Update ProposalCard with status badges
- [ ] Add negotiation grouping logic

### Phase 4: Comparison Enhancement (Week 2 - 2 hours)
- [ ] Support version comparison within thread
- [ ] Add delta highlighting
- [ ] Add origin filtering

### Phase 5: Documentation (Week 2 - 1 hour)
- [ ] Update PRD with corrected narrative
- [ ] Update user guide
- [ ] Create negotiation workflow diagram

---

## Key Decisions Made

1. ✅ **Keep "Proposal" terminology** - Works for both directions with context
2. ✅ **Add origin badges** - [US] and [THEM] make direction clear
3. ✅ **Status tracking required** - Essential for workflow
4. ✅ **Thread-based dashboard** - Group by negotiation, not flat list
5. ✅ **Version linking** - Parent-child relationships track history

---

## Risk Assessment

**Risk:** Building wrong UX before catching this issue
**Impact:** HIGH (would require major rework)
**Status:** ✅ **MITIGATED** - Caught before UI implementation

**Actual Impact:** MEDIUM
**Reason:** Schema and dashboard changes, but core engine unchanged

---

## Conclusion

This narrative correction is **critical but manageable**:

**Good News:**
- ✅ Caught early (before UI built)
- ✅ Core financial engine unaffected
- ✅ Week 1 components reusable
- ✅ ~7-9 hours additional work
- ✅ Results in correct product

**What Changes:**
- Database schema: Add 8 fields
- Dashboard: Redesign with thread view
- Comparison: Add version comparison
- Status tracking: New states
- Navigation: Minor adjustments

**What Stays the Same:**
- ✅ All financial calculations
- ✅ Three rent models
- ✅ FinancialValue, MetricCard components
- ✅ Form infrastructure
- ✅ Export functionality

This correction ensures we build the **right product** that matches the **actual workflow**.

---

**Document Status:** ✅ Approved for Implementation
**Next Steps:** Update PRD, then proceed with schema changes
**Estimated Completion:** End of Week 2 (minor schedule impact)
