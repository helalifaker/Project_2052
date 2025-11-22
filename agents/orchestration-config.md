# Project Zeta - Agent Orchestration Configuration

## Overview

This document defines how the 7 agents coordinate to deliver Project Zeta. It specifies communication protocols, dependency chains, handoff procedures, and conflict resolution mechanisms.

## Agent Registry

| Agent ID | Role | Status | Primary Contact |
|----------|------|--------|-----------------|
| `pm-001` | Project Manager | Active | Orchestrator |
| `fa-001` | Financial Architect | Active | Financial Engine |
| `be-001` | Backend Engineer | Active | API & Services |
| `fe-001` | Frontend Engineer | Active | UI Components |
| `da-001` | Database Architect | Active | Schema & Data |
| `ux-001` | UI/UX Designer | Active | Design System |
| `qa-001` | QA/Validation Engineer | Active | Testing & Quality |

## Communication Matrix

### Who Reports to Whom

```
CAO (Chief Accounting Officer)
  ↓
Project Manager (pm-001)
  ├→ Financial Architect (fa-001)
  ├→ Backend Engineer (be-001)
  ├→ Frontend Engineer (fe-001)
  ├→ Database Architect (da-001)
  ├→ UI/UX Designer (ux-001)
  └→ QA/Validation Engineer (qa-001)
```

### Peer-to-Peer Communication Patterns

```
Financial Architect ←→ Backend Engineer
  (Integration: Engine to API)

Backend Engineer ←→ Frontend Engineer
  (Integration: API to UI)

Backend Engineer ←→ Database Architect
  (Integration: Service to Data)

Frontend Engineer ←→ UI/UX Designer
  (Integration: Design to Code)

QA Engineer ←→ All Agents
  (Testing & Validation)
```

## Dependency Chain

### Phase 1: Foundation (Weeks 1-5)

#### Critical Path
```
1. Database Schema Design (da-001) [Day 1-5]
   ↓
2. Database Setup (da-001) [Day 6-8]
   ↓
3. API Design (be-001) [Day 6-8]
   ↓
4. Core API Implementation (be-001) [Day 9-13]

Parallel:
A. Financial Engine Design (fa-001) [Day 1-7]
   ↓
B. Calculation Engine Core (fa-001) [Day 8-17]

Parallel:
X. Design System (ux-001) [Day 1-7]
   ↓
Y. Component Library (fe-001) [Day 8-14]
```

#### Handoff Requirements

**da-001 → be-001 (Database to Backend):**
- **Deliverable:** Complete ERD, Prisma schema file, migration scripts
- **Format:** `schema.prisma`, migration SQL files, documentation
- **Validation:** Schema supports all PRD requirements
- **Handoff Method:** Git commit + Slack notification + sync meeting

**fa-001 → be-001 (Financial Engine to Backend):**
- **Deliverable:** Calculation engine as TypeScript module
- **Format:** NPM package or monorepo module with types
- **Validation:** Unit tests pass, single-year calculation works
- **Handoff Method:** Git commit + API contract review meeting

**ux-001 → fe-001 (Design to Frontend):**
- **Deliverable:** Design system, component specs, Figma files
- **Format:** Figma link, design tokens (JSON), style guide (Markdown)
- **Validation:** CAO approval on design direction
- **Handoff Method:** Figma handoff + design tokens export + sync meeting

**be-001 → fe-001 (Backend API to Frontend):**
- **Deliverable:** OpenAPI spec, test API endpoints
- **Format:** `openapi.yaml`, Postman collection, base URL
- **Validation:** All CRUD endpoints working
- **Handoff Method:** API docs URL + sync meeting + example requests

### Phase 2: Core Financial Engine (Weeks 5-9)

#### Critical Path
```
1. Three-Period Engine (fa-001) [Week 5-6]
   ↓
2. Circular Solver (fa-001) [Week 7]
   ↓
3. Balance Sheet Auto-Balancing (fa-001) [Week 7-8]
   ↓
4. Cash Flow Reconciliation (fa-001) [Week 8]
   ↓
5. Financial Validation (qa-001) [Week 8-9]

Parallel:
A. API Integration (be-001) [Week 5-8]
B. Frontend Integration (fe-001) [Week 7-9]
```

#### Integration Points

**fa-001 ←→ be-001 (Engine Integration):**
- **Meeting Frequency:** Daily sync during integration week
- **Key Decisions:**
  - Input data format (JSON structure)
  - Output data format (calculation results)
  - Error handling patterns
  - Performance benchmarks
- **Success Criteria:** 30-year calculation < 1 second

**be-001 ←→ fe-001 (API Integration):**
- **Meeting Frequency:** Twice weekly during integration
- **Key Decisions:**
  - API contract finalization
  - WebSocket vs polling for real-time updates
  - Pagination strategy
  - Error message formats
- **Success Criteria:** Frontend can trigger calculation and display results

**fa-001 ←→ qa-001 (Validation):**
- **Meeting Frequency:** Daily during validation week
- **Key Decisions:**
  - Validation test cases
  - Tolerance levels (e.g., $100 difference acceptable)
  - Excel model comparison approach
- **Success Criteria:** Zero calculation errors vs validated models

### Phase 3: User Interface & Workflows (Weeks 9-11)

#### Parallel Workstreams

```
Workstream A: Admin Setup
├─ be-001: Historical data API
├─ fe-001: Historical data input forms
└─ qa-001: Data validation testing

Workstream B: Planner Input
├─ be-001: Proposal CRUD API
├─ fe-001: Transition & dynamic input forms
└─ qa-001: Form validation testing

Workstream C: Viewing & Comparison
├─ be-001: Comparison API
├─ fe-001: Financial statement views + comparison dashboard
└─ qa-001: Display accuracy testing
```

#### Coordination Points

**Weekly Feature Demos:**
- **Time:** Friday 2:00 PM
- **Participants:** pm-001, be-001, fe-001, qa-001, ux-001
- **Purpose:** Demo completed user flows end-to-end
- **Format:** Live demo → feedback → bug list → next sprint planning

**Design Review Sessions:**
- **Time:** Monday 10:00 AM
- **Participants:** pm-001, fe-001, ux-001, (CAO if major changes)
- **Purpose:** Review implemented UI vs design specs
- **Format:** Screen share → markup → action items

### Phase 4: Polish & Production (Weeks 11-16)

#### Final Integration

```
1. Scenario Analysis (fe-001 + be-001) [Week 12]
2. Report Generation (be-001) [Week 12-13]
3. Export Functionality (be-001 + fe-001) [Week 13]
4. Full Testing (qa-001) [Week 12-14]
5. Bug Fixes (All Agents) [Week 14-15]
6. Performance Tuning (fa-001 + be-001) [Week 15]
7. Documentation (All Agents) [Week 14-16]
8. Production Deployment (be-001 + da-001) [Week 16]
```

## Handoff Procedures

### Code Handoff Checklist

When passing code from one agent to another:

- [ ] **Coding Standards:** All code follows CODING_STANDARDS.md (MANDATORY)
- [ ] **Code Review:** At least one peer review (via PM)
- [ ] **Tests:** All tests pass (unit + integration)
- [ ] **Documentation:** README updated, inline comments present
- [ ] **Types:** TypeScript types exported and documented
- [ ] **Examples:** Working examples provided
- [ ] **Migration:** Any database migrations included
- [ ] **Dependencies:** Package.json updated, no missing deps

### Design Handoff Checklist

When passing designs from UX to Frontend:

- [ ] **Figma File:** Access granted, all screens present
- [ ] **Design Tokens:** Colors, typography, spacing exported
- [ ] **Component Specs:** Interactive states documented
- [ ] **Responsive Behavior:** Mobile/tablet/desktop specs
- [ ] **Assets:** Icons, images exported in correct formats
- [ ] **Accessibility:** Color contrast checked, focus states defined
- [ ] **Approval:** CAO sign-off obtained (if required)

### API Contract Handoff Checklist

When Backend provides API to Frontend:

- [ ] **OpenAPI Spec:** Complete and up-to-date
- [ ] **Postman Collection:** All endpoints with examples
- [ ] **Base URLs:** Dev/staging/prod environments
- [ ] **Authentication:** Token generation instructions
- [ ] **Rate Limits:** Any limits documented
- [ ] **Error Codes:** All error responses documented
- [ ] **Webhooks:** If applicable, callback URLs documented

## Conflict Resolution

### Technical Conflicts

**Scenario:** Two agents disagree on technical approach

**Resolution Process:**
1. Agents attempt peer resolution (30 minutes)
2. If unresolved, escalate to PM
3. PM reviews PRD/TSD, consults both agents
4. PM makes decision within 4 hours
5. Decision documented in CHANGELOG with rationale

**Example:** Backend wants REST, Frontend wants GraphQL
- **Resolution:** PM reviews PRD complexity, team expertise
- **Decision:** REST (aligned with recommended stack, team familiar)
- **Documentation:** "Decision: REST API. Rationale: Team expertise, PRD simplicity."

### Scope Conflicts

**Scenario:** Agent believes PRD is ambiguous or incomplete

**Resolution Process:**
1. Agent documents question with specific examples
2. Agent escalates to PM immediately
3. PM reviews PRD section in question
4. If PM can clarify: Document clarification, inform agent
5. If PM cannot clarify: Escalate to CAO within 24 hours
6. CAO decision documented, PRD updated

**Example:** "PRD doesn't specify inflation escalation timing (beginning vs end of year)"
- **PM Review:** Check 04_FINANCIAL_RULES.md
- **Finding:** Specified in financial rules (beginning of year)
- **Resolution:** Document in implementation notes, inform agent

### Priority Conflicts

**Scenario:** Multiple agents request same resource or PM attention

**Resolution Process:**
1. PM assesses based on:
   - Critical path impact (blocks other work?)
   - Phase deadline proximity
   - Risk level (could derail project?)
   - Effort required
2. PM communicates priority decision with reasoning
3. Lower-priority items scheduled with expected timeline

**Example:** Frontend needs API contract, QA needs validation logic
- **Critical Path:** Frontend blocks user stories (Phase 3 deadline)
- **Decision:** API contract first (2 hours), validation logic next (4 hours)
- **Communication:** "Frontend API review at 2pm today, QA validation review at 4pm"

### Quality vs. Speed Conflicts

**Scenario:** Agent wants more time for quality, PM needs delivery

**Resolution Process:**
1. Agent quantifies quality concern (risk, impact)
2. Agent proposes minimum viable quality bar
3. PM assesses project timeline impact
4. PM and agent negotiate scope
5. Decision: Deliver with documented technical debt OR extend timeline (escalate to CAO)

**Example:** Backend wants comprehensive input validation, timeline tight
- **Negotiation:** Implement critical validations now, comprehensive later
- **Decision:** Validate required fields + data types now, business rule validation in Phase 4
- **Documentation:** Technical debt item created, scheduled for Phase 4

## Communication Protocols

### Daily Standup (Async or Sync)

**Time:** 9:00 AM Riyadh time (or async before)
**Duration:** 15 minutes max
**Format:**

Each agent posts:
```
Agent: [Agent Name]
Yesterday:
- [Task 1 completed]
- [Task 2 completed]

Today:
- [Task 1 planned]
- [Task 2 planned]

Blockers:
- [Blocker 1 if any]
- [Blocker 2 if any]
```

PM consolidates and responds with:
- Priority adjustments
- Blocker resolution plan
- Coordination notes

### Weekly Sprint Review

**Time:** Friday 10:00 AM Riyadh time
**Duration:** 30-60 minutes
**Participants:** PM + All Agents + CAO

**Agenda:**
1. **Demos (20 min):** Working software, live demo
2. **Metrics (10 min):** Velocity, quality, blockers
3. **Retrospective (10 min):** What went well, what to improve
4. **Planning (15 min):** Next sprint priorities
5. **CAO Feedback (10 min):** Approvals, decisions, questions

### Integration Sync Meetings

**When:** As needed during integration phases
**Duration:** 30-45 minutes
**Participants:** Relevant agents + PM

**Purpose:**
- Align on interfaces (API contracts, module exports, data formats)
- Test integration points
- Debug integration issues
- Define acceptance criteria

**Example: Backend + Financial Engine Integration Sync**
- Review engine function signatures
- Test sample calculation
- Define error handling
- Agree on performance benchmarks
- Schedule next integration test

### Emergency Escalation

**Critical issues requiring immediate attention:**

**Level 1: Agent-to-Agent (Response time: 1 hour)**
- Minor blockers, quick questions
- Method: Direct message

**Level 2: Agent-to-PM (Response time: 4 hours)**
- Blockers affecting timeline
- Technical conflicts
- Method: Slack + @mention PM

**Level 3: PM-to-CAO (Response time: 24 hours)**
- Business rule ambiguities
- Scope changes
- Timeline risks >2 weeks
- Method: Email + scheduled call

## Work Assignment Protocol

### How PM Assigns Tasks

**Task Assignment Message Template:**
```
TASK ASSIGNMENT

Agent: [Agent ID and Name]
Task: [Clear, specific task description]
Priority: [High / Medium / Low]
Deadline: [Date and time]

Context:
[Why this task matters, how it fits in the project]

Dependencies:
[What must be complete first, if anything]

Acceptance Criteria:
- [ ] Criterion 1 (measurable)
- [ ] Criterion 2 (measurable)
- [ ] Criterion 3 (measurable)

References:
- [Link to PRD section]
- [Link to TSD section]
- [Link to related code/design]

Questions? Reply to this thread.
```

**Example:**
```
TASK ASSIGNMENT

Agent: fa-001 (Financial Architect)
Task: Implement Balance Sheet Auto-Balancing Logic
Priority: High
Deadline: 2025-12-05 EOD

Context:
This is critical for Phase 2 completion. Balance sheet must
balance in all scenarios (Assets = Liabilities + Equity).
Debt is the "plug" variable.

Dependencies:
- Three-period engine structure complete ✅
- P&L calculation complete ✅

Acceptance Criteria:
- [ ] Balance sheet balances for all test scenarios (diff < $0.01)
- [ ] Debt calculation handles negative values (excess cash)
- [ ] Unit tests with >90% coverage
- [ ] Documented formula with comments

References:
- 04_FINANCIAL_RULES.md Section 6 (Balance Sheet)
- /lib/financial-engine/calculators/balance-sheet.ts

Questions? Reply to this thread.
```

### How Agents Report Completion

**Completion Report Template:**
```
TASK COMPLETED

Agent: [Agent ID and Name]
Task: [Task name]
Completion Date: [Date]

Summary:
[Brief description of what was delivered]

Deliverables:
- [Link to code/design/document]
- [Link to tests]
- [Link to documentation]

Acceptance Criteria:
- [x] Criterion 1 - PASSED
- [x] Criterion 2 - PASSED
- [x] Criterion 3 - PASSED

Test Results:
[Summary of test outcomes, coverage percentage]

Notes:
[Any important decisions made, assumptions, or known limitations]

Next Steps:
[What should happen next, dependencies unblocked]
```

## Quality Gates

### Phase Completion Gates

Each phase has specific quality gates that must pass before proceeding:

#### Phase 1: Foundation Gate

**Criteria:**
- [ ] Database schema supports all PRD data requirements
- [ ] Core API endpoints return 200 OK
- [ ] Single-year financial calculation works correctly
- [ ] Design system approved by CAO
- [ ] Component library has 10+ reusable components
- [ ] All tests pass (>80% coverage)

**Approver:** PM + CAO

**What happens if gate fails:**
- PM identifies gaps
- PM assigns remediation tasks
- Gate re-evaluation in 48 hours

#### Phase 2: Financial Engine Gate

**Criteria:**
- [ ] 30-year calculation completes in <1 second
- [ ] Balance sheet balances in all test scenarios
- [ ] Cash flow reconciles with balance sheet
- [ ] All three rent models implemented
- [ ] Circular solver converges reliably
- [ ] Zero errors vs validated Excel models
- [ ] All tests pass (>90% coverage for financial code)

**Approver:** PM + QA Engineer + CAO

**What happens if gate fails:**
- Critical: Halt Phase 3 work, fix immediately
- Non-critical: Document as known issue, fix in parallel with Phase 3

#### Phase 3: User Interface Gate

**Criteria:**
- [ ] All user stories implemented
- [ ] Admin can input historical data successfully
- [ ] Planner can create proposal in <10 minutes
- [ ] All forms have validation
- [ ] Financial statements display correctly (millions format)
- [ ] Comparison dashboard highlights best proposal
- [ ] Responsive design works on tablet/desktop
- [ ] All tests pass (>80% coverage)

**Approver:** PM + UX Designer + CAO

**What happens if gate fails:**
- PM and CAO decide: Fix before Phase 4 OR move to Phase 4 backlog

#### Phase 4: Production Readiness Gate

**Criteria:**
- [ ] All features complete
- [ ] >80% test coverage across codebase
- [ ] Zero critical bugs
- [ ] Performance targets met (<1s calculations, <200ms UI)
- [ ] User documentation complete
- [ ] Technical documentation complete
- [ ] Security review passed (if applicable)
- [ ] CAO acceptance testing passed

**Approver:** PM + CAO + All Agents sign-off

**What happens if gate fails:**
- Delay production launch
- Create punch list of remaining items
- Set new target date

## Progress Tracking

### Metrics Dashboard

PM maintains a live dashboard tracking:

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Overall Completion | 100% by Week 16 | [X]% | 🟢/🟡/🔴 |
| Phase 1 Completion | 100% by Week 5 | [X]% | 🟢/🟡/🔴 |
| Phase 2 Completion | 100% by Week 9 | [X]% | 🟢/🟡/🔴 |
| Phase 3 Completion | 100% by Week 11 | [X]% | 🟢/🟡/🔴 |
| Phase 4 Completion | 100% by Week 16 | [X]% | 🟢/🟡/🔴 |
| Test Coverage | >80% | [X]% | 🟢/🟡/🔴 |
| Calculation Accuracy | 100% | [X]% | 🟢/🟡/🔴 |
| API Performance | <200ms | [X]ms | 🟢/🟡/🔴 |
| Critical Bugs | 0 | [X] | 🟢/🟡/🔴 |

**Status Indicators:**
- 🟢 Green: On track or ahead
- 🟡 Yellow: At risk, mitigation plan in place
- 🔴 Red: Blocked or behind, escalation needed

### Velocity Tracking

Track story points completed per agent per week:

| Agent | Week 1 | Week 2 | Week 3 | Avg | Trend |
|-------|--------|--------|--------|-----|-------|
| fa-001 | 8 | 10 | 9 | 9.0 | → |
| be-001 | 12 | 11 | 13 | 12.0 | ↑ |
| fe-001 | 10 | 9 | 11 | 10.0 | → |
| da-001 | 15 | 8 | 5 | 9.3 | ↓ |
| ux-001 | 7 | 8 | 7 | 7.3 | → |
| qa-001 | 6 | 7 | 9 | 7.3 | ↑ |

**Use this to:**
- Identify agents who may need support
- Adjust task assignments
- Predict future capacity

## Risk Register

PM maintains a live risk register:

| Risk ID | Description | Probability | Impact | Mitigation | Owner | Status |
|---------|-------------|-------------|--------|------------|-------|--------|
| R-001 | Circular solver doesn't converge | Medium | High | Pair programming, iterative solver | fa-001 | 🟡 |
| R-002 | 30-year calculation too slow | Low | High | Early performance testing | fa-001 + be-001 | 🟢 |
| R-003 | Balance sheet won't balance | Medium | Critical | Extensive validation testing | fa-001 + qa-001 | 🟡 |
| R-004 | Scope creep from CAO | Medium | Medium | Strict PRD adherence, Phase 2 backlog | pm-001 | 🟢 |

**Status:**
- 🟢 Green: Mitigation working
- 🟡 Yellow: Monitoring closely
- 🔴 Red: Risk materialized, active response

## Knowledge Management

### Documentation Repository

All project documentation lives in:
```
/docs
  ├── business/
  │   ├── 01_BCD.md
  │   └── 02_PRD.md
  ├── technical/
  │   ├── 03_TSD_COMPREHENSIVE.md
  │   ├── 04_FINANCIAL_RULES.md
  │   ├── CODING_STANDARDS.md (MANDATORY - All agents must follow)
  │   └── architecture/
  │       ├── system-architecture.md
  │       ├── data-model.md
  │       └── api-contracts.md
  ├── design/
  │   ├── 06_UI_UX_SPECIFICATION.md
  │   ├── design-system.md
  │   └── component-specs/
  ├── process/
  │   ├── 05_AGENTS_SPECIFICATION.md
  │   ├── orchestration-config.md (this document)
  │   └── workflows/
  └── decisions/
      └── adr/  (Architecture Decision Records)
          ├── 001-use-nextjs.md
          ├── 002-database-choice.md
          └── 003-calculation-engine-approach.md
```

### Decision Log (ADR Format)

When making significant decisions, agents create Architecture Decision Records:

**Template:**
```markdown
# ADR-XXX: [Decision Title]

**Date:** YYYY-MM-DD
**Status:** Accepted / Rejected / Superseded
**Decision Maker:** [Agent ID]
**Approver:** [PM / CAO]

## Context
[What problem are we solving? What constraints exist?]

## Options Considered
1. Option A: [Description, pros, cons]
2. Option B: [Description, pros, cons]
3. Option C: [Description, pros, cons]

## Decision
[Which option chosen and why]

## Consequences
**Positive:**
- [Benefit 1]
- [Benefit 2]

**Negative:**
- [Trade-off 1]
- [Trade-off 2]

**Neutral:**
- [Impact 1]

## References
- [Link to related docs]
- [Link to discussion thread]
```

## Onboarding New Agents (If Needed)

If an agent needs to be replaced or added mid-project:

### Day 1: Orientation
- [ ] Read all project documents (BCD, PRD, TSD, Financial Rules, CODING_STANDARDS.md)
- [ ] Review agent specification for your role
- [ ] Meet with PM for project status update
- [ ] Meet with predecessor agent (if replacement)
- [ ] Set up development environment
- [ ] **CRITICAL:** Study CODING_STANDARDS.md - All code must comply

### Day 2: Context Deep-Dive
- [ ] Review current codebase/designs
- [ ] Meet with peer agents for integration points
- [ ] Review CHANGELOG and decision log
- [ ] Understand current sprint priorities

### Day 3: First Assignment
- [ ] Receive first task from PM (small, low-risk)
- [ ] Deliver first task
- [ ] Receive feedback
- [ ] Gradual ramp-up to full capacity

## Conclusion

This orchestration configuration ensures all agents work in harmony toward Project Zeta completion. The PM is responsible for enforcing these protocols and adapting them as needed.

**Key Principles:**
1. **Transparency:** All work visible to PM and relevant agents
2. **Communication:** Over-communicate rather than under-communicate
3. **Documentation:** Document decisions and rationale
4. **Quality:** Never compromise on financial accuracy
5. **Collaboration:** Agents help each other succeed

---

**Last Updated:** 2025-11-22
**Maintained By:** Project Manager (pm-001)
**Review Frequency:** Weekly during sprint reviews
