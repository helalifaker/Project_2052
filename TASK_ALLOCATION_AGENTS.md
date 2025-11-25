# Task Allocation & Agent Assignment - Project Zeta

**Date:** November 24, 2025
**Status:** Phase 1 & 2 Complete, Phase 3 Pending
**Purpose:** Allocate remaining tasks to optimal AI agents

---

## Executive Summary

**Completed:**
- ✅ Phase 1: Foundation & Infrastructure (100%)
- ✅ Phase 2: Core Financial Engine (100%)

**Pending:**
- ⏳ Phase 3: User Interface & Workflows (0% - 14 weeks of work)
- ⏳ Phase 4: Polish & Production (0% - 4 weeks of work)
- 🔴 **Critical:** Fix test coverage issues (5 failing tests)

**Total Remaining Effort:** ~18 weeks (with parallel execution: ~10-12 weeks)

---

## 🚨 IMMEDIATE PRIORITY: Test Coverage Fixes

### Issue Analysis
**Status:** 5 test failures, 168 tests passing
**Root Cause:** Balance sheet reconciliation and cash flow calculation issues in historical period

**Failing Tests:**
1. Historical period cash flow reconciliation (diff: 11.23M)
2. Balance sheet balancing issues
3. API integration tests failing due to engine issues

**Recommended Agent:** **Opus** (highest reasoning capability)
**Estimated Time:** 1-2 days
**Priority:** 🔴 CRITICAL - Must fix before Phase 3

**Tasks:**
- [ ] Debug cash flow reconciliation in `historical.test.ts`
- [ ] Fix balance sheet balancing logic
- [ ] Verify all 173 tests pass
- [ ] Achieve >90% code coverage on engine module
- [ ] Run full test suite with coverage report

---

## Phase 3: User Interface & Workflows (14 Tasks)

### Track 1: Admin Module (4 Tasks)

#### Task 3.1: Admin Dashboard & Historical Data Input
**Agent:** **Sonnet 4.5** (balanced speed + quality for UI)
**Complexity:** High
**Estimated Time:** 1 week
**Prerequisites:** Test fixes complete
**Deliverables:**
- Admin dashboard layout (`/app/admin/page.tsx`)
- Historical data input forms (P&L, BS for 2023-2024)
- "Confirm Historical Data" button with immutability
- Working Capital ratios display (auto-calculated, locked)
- Form validation (Zod schemas)
- RBAC enforcement (ADMIN only)

**Why Sonnet 4.5:**
- Excellent at React component structure
- Fast iteration for UI refinement
- Good balance of code quality and speed
- Strong TypeScript understanding

---

#### Task 3.2: System Configuration Form
**Agent:** **Haiku** (simple CRUD UI)
**Complexity:** Low-Medium
**Estimated Time:** 2-3 days
**Prerequisites:** Task 3.1 complete
**Deliverables:**
- System config form (`/app/admin/config/page.tsx`)
- Pre-filled values (Zakat 2.5%, Debt 5%, Deposit 2%, MinCash 1M)
- Form validation
- API integration with `/api/config`
- Success/error handling

**Why Haiku:**
- Simple form with basic CRUD
- Cost-effective for straightforward task
- Fast execution

---

#### Task 3.3: CapEx Module
**Agent:** **Sonnet 4.5** (complex business logic)
**Complexity:** High
**Estimated Time:** 1 week
**Prerequisites:** Task 3.1 complete
**Deliverables:**
- CapEx module UI (`/app/admin/capex/page.tsx`)
- Auto Reinvestment configuration (toggle, frequency, amount/%)
- Manual CapEx items table (CRUD)
- OLD vs NEW asset depreciation display
- Integration with calculation engine
- Validation rules

**Why Sonnet 4.5:**
- Complex business rules
- Table CRUD with validation
- Integration with financial engine
- Requires understanding of depreciation logic

---

#### Task 3.4: Admin E2E Tests
**Agent:** **Opus** (comprehensive testing)
**Complexity:** Medium-High
**Estimated Time:** 3-4 days
**Prerequisites:** Tasks 3.1-3.3 complete
**Deliverables:**
- Playwright tests for all admin workflows
- Historical data input & confirmation
- System config updates
- CapEx module operations
- RBAC verification
- Visual regression tests

**Why Opus:**
- Best reasoning for edge cases
- Thorough test coverage
- Complex user flow simulation

---

### Track 2: Proposal Management (5 Tasks)

#### Task 3.5: Proposal List View
**Agent:** **Sonnet 4.5** (UI with state management)
**Complexity:** Medium
**Estimated Time:** 3-4 days
**Prerequisites:** Task 3.1 complete
**Deliverables:**
- Proposal list page (`/app/proposals/page.tsx`)
- Card layout with key metrics
- Filter/sort functionality
- Actions: View, Edit, Delete
- RBAC enforcement
- Loading states

**Why Sonnet 4.5:**
- Good at React patterns
- State management
- Clean component structure

---

#### Task 3.6: Proposal Creation Wizard (Steps 1-3)
**Agent:** **Opus** (complex multi-step form)
**Complexity:** High
**Estimated Time:** 1 week
**Prerequisites:** Task 3.5 complete
**Deliverables:**
- Step 1: Basics (name, rent model)
- Step 2: Transition period inputs
- Step 3: Enrollment & ramp-up
- Form state management (zustand or react-hook-form)
- Validation (Zod)
- Pre-fills implementation (GAP 19, 20)
- Progress indicator

**Why Opus:**
- Complex state management across steps
- Critical business logic
- Pre-fill requirements
- Needs perfect validation

---

#### Task 3.7: Proposal Creation Wizard (Steps 4-7)
**Agent:** **Opus** (complex business rules)
**Complexity:** High
**Estimated Time:** 1 week
**Prerequisites:** Task 3.6 complete
**Deliverables:**
- Step 4: Curriculum (IB toggle - GAP 3)
- Step 5: Rent model forms (conditional - GAP 4)
- Step 6: Operating costs
- Step 7: Review & Calculate
- Integration with calculation API
- Loading states & error handling

**Why Opus:**
- Conditional logic complexity
- Critical calculation integration
- IB toggle requirements
- 3 rent model variations

---

#### Task 3.8: Proposal Detail - Overview & Setup Tabs
**Agent:** **Sonnet 4.5** (tabbed UI)
**Complexity:** Medium
**Estimated Time:** 4-5 days
**Prerequisites:** Task 3.7 complete
**Deliverables:**
- Tab 1: Overview with key metrics
- Tab 2: Transition setup (edit mode)
- Tab 3: Dynamic setup (edit mode)
- Tabbed interface structure
- "Recalculate" functionality
- Duplicate/Delete actions

**Why Sonnet 4.5:**
- Good at layout structure
- Tab management
- Form reuse from wizard

---

#### Task 3.9: Financial Statements Tab (CRITICAL - GAP 5)
**Agent:** **Opus** (complex data display)
**Complexity:** Very High
**Estimated Time:** 1.5 weeks
**Prerequisites:** Task 3.8 complete
**Deliverables:**
- Tab 4: Financial Statements
- Year range selector (GAP 9)
- Sub-tabs: P&L, Balance Sheet, Cash Flow
- Financial table component with Millions (M) format (GAP 8)
- Calculation transparency tooltips (GAP 21)
- Export to Excel/PDF (GAP 22)
- Performance optimization (large tables)

**Why Opus:**
- Most critical feature
- Complex table rendering
- Tooltip formula display
- Export functionality
- Performance considerations
- Must be perfect

---

### Track 3: Advanced Features (3 Tasks)

#### Task 3.10: Scenarios Tab (Interactive Sliders - GAP 6)
**Agent:** **Opus** (real-time calculations)
**Complexity:** Very High
**Estimated Time:** 1 week
**Prerequisites:** Task 3.9 complete
**Deliverables:**
- Tab 5: Scenarios
- 4 interactive sliders (Enrollment, CPI, Tuition Growth, Rent Escalation)
- Real-time metric updates (<200ms target)
- Baseline vs Current comparison table
- Save scenario functionality
- Web Worker integration for performance

**Why Opus:**
- Real-time calculation complexity
- Performance critical (<200ms)
- Web Worker coordination
- State management

---

#### Task 3.11: Sensitivity Analysis Tab (GAP 7)
**Agent:** **Opus** (complex calculations + charts)
**Complexity:** High
**Estimated Time:** 1 week
**Prerequisites:** Task 3.10 complete
**Deliverables:**
- Tab 6: Sensitivity Analysis
- Variable selector
- Range configuration
- Impact metric selector
- Tornado chart (Recharts)
- Table view with impact calculations
- Export functionality

**Why Opus:**
- Statistical analysis complexity
- Tornado chart implementation
- Multiple calculation scenarios
- Data visualization

---

#### Task 3.12: Proposal Comparison (GAP 10)
**Agent:** **Sonnet 4.5** (comparison UI)
**Complexity:** Medium-High
**Estimated Time:** 5-6 days
**Prerequisites:** Task 3.9 complete (can run parallel to 3.10-3.11)
**Deliverables:**
- Comparison matrix page (`/app/proposals/compare/page.tsx`)
- Multi-select proposals (2-5)
- Comparison table with winner highlighting
- Rent trajectory chart (Recharts)
- Side-by-side financial statements
- Export comparison to PDF

**Why Sonnet 4.5:**
- Data comparison logic
- Chart implementation
- Good at table layouts
- Parallel processing logic

---

#### Task 3.13: Complete E2E Test Suite
**Agent:** **Opus** (comprehensive testing)
**Complexity:** High
**Estimated Time:** 1 week
**Prerequisites:** Tasks 3.5-3.12 complete
**Deliverables:**
- All E2E tests in `/tests/e2e/`
- Proposal creation workflow
- Scenario slider tests
- Sensitivity analysis tests
- Comparison view tests
- Export functionality tests
- Performance benchmarks
- Accessibility tests (WCAG AA)
- Visual regression tests

**Why Opus:**
- Most thorough testing
- Edge case coverage
- Performance validation
- Accessibility expertise

---

#### Task 3.14: Phase 3 Integration & Bug Fixes
**Agent:** **Opus** (integration & debugging)
**Complexity:** Medium
**Estimated Time:** 3-4 days
**Prerequisites:** All other Phase 3 tasks complete
**Deliverables:**
- Integration testing across all modules
- Bug fixes from E2E tests
- Performance optimization
- Code review & refactoring
- Documentation updates
- Phase 3 sign-off

**Why Opus:**
- Best debugging capabilities
- Holistic view of system
- Integration expertise

---

## Phase 4: Polish & Production (6 Tasks)

### Track 4: Optimization & Testing (3 Tasks)

#### Task 4.1: Performance Optimization
**Agent:** **Opus** (performance analysis)
**Complexity:** High
**Estimated Time:** 1 week
**Prerequisites:** Phase 3 complete
**Deliverables:**
- Calculation caching implementation
- React optimization (memo, useMemo, useCallback)
- Database optimization (indexes, query optimization)
- Bundle optimization (code splitting, tree-shaking)
- Performance benchmarks (<1s calculations, <200ms UI)
- Lighthouse score >90

**Why Opus:**
- Performance analysis expertise
- Complex optimization strategies
- Profiling & benchmarking

---

#### Task 4.2: Comprehensive Testing & Validation
**Agent:** **Opus** (quality assurance)
**Complexity:** High
**Estimated Time:** 1 week
**Prerequisites:** Task 4.1 complete
**Deliverables:**
- >90% test coverage (unit + integration + E2E)
- Excel golden model comparison (tolerance <$100)
- Edge case testing
- Load testing (50+ proposals)
- Security audit (RBAC, XSS, CSRF)
- Financial validation report

**Why Opus:**
- Thoroughness required
- Financial accuracy critical
- Security expertise

---

#### Task 4.3: Documentation
**Agent:** **Sonnet 4.5** (documentation)
**Complexity:** Medium
**Estimated Time:** 4-5 days
**Prerequisites:** Task 4.2 complete
**Deliverables:**
- User documentation (Admin, Planner, Viewer guides)
- Technical documentation (architecture, API, formulas)
- FAQ document
- Deployment guide
- Video walkthrough script

**Why Sonnet 4.5:**
- Excellent at documentation
- Clear writing style
- Fast execution

---

### Track 5: Deployment & Launch (3 Tasks)

#### Task 4.4: CI/CD Pipeline Setup
**Agent:** **Sonnet 4.5** (DevOps)
**Complexity:** Medium
**Estimated Time:** 2-3 days
**Prerequisites:** Task 4.2 complete
**Deliverables:**
- GitHub Actions workflow
- Automated testing on PRs
- Staging deployment (auto on merge to develop)
- Production deployment (manual approval)
- Environment variables configuration
- Rollback procedures

**Why Sonnet 4.5:**
- Good at DevOps tasks
- YAML configuration
- Fast execution

---

#### Task 4.5: Production Deployment
**Agent:** **Sonnet 4.5** (deployment)
**Complexity:** Medium
**Estimated Time:** 2-3 days
**Prerequisites:** Task 4.4 complete
**Deliverables:**
- Vercel production setup
- Custom domain configuration (if any)
- Environment variables (production)
- Database migration (production)
- Monitoring setup (Sentry, Vercel Analytics)
- Uptime monitoring
- Backup configuration

**Why Sonnet 4.5:**
- Platform expertise
- Configuration management
- Fast execution

---

#### Task 4.6: Launch Preparation & CAO Sign-off
**Agent:** **Opus** (final validation)
**Complexity:** Medium
**Estimated Time:** 2-3 days
**Prerequisites:** Task 4.5 complete
**Deliverables:**
- Launch checklist validation
- UAT (User Acceptance Testing) with stakeholders
- CAO sign-off documentation
- Post-launch monitoring plan
- Incident response plan
- Success metrics tracking

**Why Opus:**
- Attention to detail
- Stakeholder communication
- Final validation

---

## Parallel Execution Strategy

### Week 1-2: Critical Fixes + Admin Module
```
Opus:    Test Coverage Fixes (Days 1-2) → Admin E2E Tests (Days 8-11)
Sonnet:  Admin Dashboard (Days 3-7) → System Config (Days 8-9)
Haiku:   [Wait] → CapEx Module (Days 3-9)
```

### Week 3-4: Proposal Wizard
```
Opus:    Wizard Steps 1-3 (Days 1-5) → Wizard Steps 4-7 (Days 6-10)
Sonnet:  Proposal List (Days 1-3) → [Support Opus]
```

### Week 5-7: Proposal Detail & Financial Statements
```
Opus:    Financial Statements Tab (Days 1-10)
Sonnet:  Overview & Setup Tabs (Days 1-4) → Comparison Page (Days 5-9)
```

### Week 8-9: Advanced Features
```
Opus:    Scenarios Tab (Days 1-5) → Sensitivity Tab (Days 6-10)
Sonnet:  [Support] → [Start E2E tests preparation]
```

### Week 10-11: Testing & Integration
```
Opus:    Complete E2E Suite (Days 1-5) → Integration (Days 6-8)
Sonnet:  [Support testing]
```

### Week 12-13: Phase 4 - Optimization
```
Opus:    Performance Optimization (Days 1-5) → Testing & Validation (Days 6-10)
Sonnet:  Documentation (Days 6-9)
```

### Week 14: Deployment & Launch
```
Opus:    Launch Preparation & Sign-off (Days 1-3)
Sonnet:  CI/CD Setup (Days 1-2) → Deployment (Days 3-4)
```

---

## Test Coverage Status & Recommendations

### Current Coverage
- **Unit Tests:** 9 test files in `src/` (engine focused)
- **E2E Tests:** 12 test files in `tests/e2e/` (Phase 3 features - not yet implemented)
- **Passing:** 168 tests ✅
- **Failing:** 5 tests 🔴
- **Coverage:** Unknown (need coverage report after fixes)

### Failing Test Root Causes

#### 1. Cash Flow Reconciliation (Diff: 11.23M - 11.73M)
**Files Affected:**
- `src/lib/engine/periods/historical.test.ts`
- `src/lib/engine/index.benchmark.test.ts`
- `src/lib/engine/index.e2e.test.ts`

**Likely Issue:**
- Missing cash flow component (CapEx, debt repayment, or working capital change)
- Timing difference in depreciation calculation
- Interest calculation off by period

**Fix Priority:** 🔴 CRITICAL
**Recommended Agent:** Opus
**Estimated Fix Time:** 4-6 hours

---

#### 2. Balance Sheet Not Balanced (Diff: -6M to 14.7M)
**Files Affected:**
- `src/lib/engine/periods/historical.test.ts`

**Likely Issue:**
- Debt plug calculation incorrect
- Equity calculation missing retained earnings
- Asset or liability double-counted

**Fix Priority:** 🔴 CRITICAL
**Recommended Agent:** Opus
**Estimated Fix Time:** 2-4 hours

---

#### 3. API Integration Tests Failing (5 tests)
**Files Affected:**
- `src/app/api/proposals/calculate/route.test.ts`

**Likely Issue:**
- Cascading failures from engine issues above
- Should pass once engine tests fixed

**Fix Priority:** 🟡 HIGH (will auto-resolve)
**Estimated Fix Time:** 0 hours (after engine fixes)

---

### Test Coverage Goals

**Phase 2 (Current):**
- [x] Engine unit tests: 9 files
- [ ] Engine coverage: Target >90% (currently ~70-80% estimated)
- [ ] Fix failing tests: 5 tests → 0 tests

**Phase 3 (Upcoming):**
- [ ] Component unit tests: Target >80% coverage
- [ ] E2E tests: 12 test files (all 12 currently stubbed)
- [ ] Integration tests: API routes
- [ ] Visual regression tests: Major screens

**Phase 4 (Final):**
- [ ] Overall coverage: >85%
- [ ] Load testing: 50+ proposals
- [ ] Security testing: RBAC enforcement
- [ ] Performance benchmarks: All passing

---

## Recommended Test Coverage Actions

### Immediate (This Week):
1. **Fix 5 failing tests** → Opus (1-2 days)
2. **Run coverage report:** `pnpm test:coverage` after fixes
3. **Add missing engine tests** if coverage <90%
4. **Verify all 173 tests pass**

### Phase 3 (Weeks 1-11):
1. **Component tests** for each new UI component (Sonnet/Haiku during development)
2. **E2E tests** for each user workflow (Opus in Task 3.13)
3. **Integration tests** for new API routes
4. **Visual regression tests** (Playwright snapshots)

### Phase 4 (Weeks 12-14):
1. **Performance benchmarks** (Opus)
2. **Load testing** (Opus)
3. **Security audit** (Opus)
4. **Final coverage report** (must be >85%)

---

## Agent Allocation Summary

| Agent | Tasks Assigned | Total Weeks | Strengths Used |
|-------|----------------|-------------|----------------|
| **Opus** | 10 tasks | ~8-9 weeks | Complex logic, testing, debugging, critical features |
| **Sonnet 4.5** | 8 tasks | ~5-6 weeks | UI development, documentation, DevOps, balanced speed/quality |
| **Haiku** | 1 task | ~0.5 weeks | Simple CRUD forms, cost-effective |

**Total Parallel Time:** 10-12 weeks (with overlapping work)
**Total Sequential Time:** ~18 weeks

---

## Success Metrics

### Phase 3 Exit Criteria:
- [ ] All 14 UI tasks complete
- [ ] All 173+ tests passing (no failures)
- [ ] E2E tests cover all user workflows
- [ ] Performance targets met (<1s calculations, <200ms sliders)
- [ ] All 24 GAPs implemented and validated
- [ ] Financial statements display correctly (GAP 5)
- [ ] Millions (M) formatting everywhere (GAP 8)

### Phase 4 Exit Criteria:
- [ ] >85% test coverage
- [ ] Zero critical bugs
- [ ] Performance optimizations complete
- [ ] Documentation complete
- [ ] Production deployed
- [ ] CAO sign-off obtained

---

## Next Steps

1. **IMMEDIATE:** Assign test coverage fixes to Opus (Days 1-2)
2. **Week 1:** Start Admin Module (Tasks 3.1-3.3) with Sonnet & Haiku
3. **Week 3:** Begin Proposal Wizard (Tasks 3.6-3.7) with Opus
4. **Week 5:** Financial Statements implementation (Task 3.9) with Opus
5. **Week 10:** Complete E2E testing (Task 3.13) with Opus
6. **Week 12:** Phase 4 optimization and deployment

---

**Prepared by:** AI Planning Agent
**Date:** November 24, 2025
**Version:** 1.0
**Status:** Ready for CAO Review & Agent Assignment
