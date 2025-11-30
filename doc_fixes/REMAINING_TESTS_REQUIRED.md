# Remaining Tests Required - Project Zeta

**Date:** November 25, 2025
**Status:** 🟢 MOSTLY COMPLETE
**Current Coverage:** 91.36% statements, 64.74% branches (Target: >80% branches)

---

## Executive Summary

### Current Test Status
- ✅ **Passing:** 339/344 tests (98.5%)
- ⏭️ **Skipped:** 5/344 tests (1.5%)
- ❌ **Failing:** 0 tests
- 📊 **Coverage:** 91.36% statements, 95.03% functions, 64.74% branches
- 🎯 **Target:** >80% branches (currently not met)

### Current Status
✅ **Historical period tests:** All passing
✅ **API integration tests:** All passing
✅ **Engine tests:** All passing
✅ **Calculation cache tests:** All 10 tests passing (Decimal.js serialization fixed)
✅ **Financial validation tests:** All passing
✅ **Edge case tests:** All passing

### Remaining Work
1. **Branch coverage** needs improvement (64.74% vs 80% target)
2. **Missing component tests** (0% coverage for React components)
3. **Missing API route tests** (proposals CRUD, historical, config routes)
4. **E2E tests** defined but not yet run in CI

---

## 1. COMPLETED FIXES ✅

### 1.1 Calculation Cache Tests ✅ FIXED

**File:** `src/lib/cache/calculation-cache.test.ts`
**Status:** ✅ All 10 tests passing
**Fixed:** November 25, 2025

#### Solution Applied:
The `isDecimalLike()` function uses duck typing to detect Decimal.js objects by checking for:
- `toString` method
- `d` property (Decimal.js internal digit array)

```typescript
function isDecimalLike(obj: unknown): obj is DecimalLike {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "toString" in obj &&
    typeof obj.toString === "function" &&
    "d" in obj  // Decimal.js stores digits in 'd' array
  );
}
```

This approach correctly serializes Decimal objects without requiring an explicit import.

#### Tests Now Passing:
- ✅ Cache Key Generation (2 tests)
- ✅ Cache Operations (3 tests)
- ✅ Cache Statistics (2 tests)
- ✅ LRU Eviction (1 test)
- ✅ Performance (2 tests)

---

### 1.2 All Core Tests ✅ PASSING

**Status:** All tests passing

- ✅ Historical period tests: All passing
- ✅ API integration tests: All passing
- ✅ Engine tests: All passing
- ✅ Calculation cache tests: All passing
- ✅ Financial validation tests: All passing
- ✅ Edge case tests: All passing

---

## 2. COVERAGE GAPS - Historical Period (Priority: HIGH)

**Current Coverage:** ~75%  
**Target Coverage:** >90%  
**Estimated Time:** 4-6 hours

### Missing Test Cases:

#### 2.1 Negative Net Income Scenarios
- [ ] Test historical period with negative net income
- [ ] Verify Zakat = 0 when EBT < 0
- [ ] Verify equity decreases correctly
- [ ] Verify cash flow handles negative income

#### 2.2 Zero Cash Scenarios
- [ ] Test period with zero beginning cash
- [ ] Test period with zero ending cash
- [ ] Verify minimum cash balance enforcement
- [ ] Verify debt plug when cash insufficient

#### 2.3 High Debt Scenarios
- [ ] Test debt > 50M SAR
- [ ] Test debt > total assets
- [ ] Verify interest calculation with high debt
- [ ] Verify debt plug logic with high debt

#### 2.4 Depreciation Edge Cases
- [ ] Test depreciation = 0
- [ ] Test depreciation > revenue
- [ ] Test accumulated depreciation > asset cost
- [ ] Verify NBV never goes negative

#### 2.5 Working Capital Edge Cases
- [ ] Test zero revenue (AR = 0)
- [ ] Test zero OpEx (AP = 0)
- [ ] Test negative working capital
- [ ] Test working capital ratios at boundaries

**Action Items:**
- [ ] Add 8-10 new test cases to `historical.test.ts`
- [ ] Target >90% coverage for historical period module

---

## 3. API ROUTE TESTS (Priority: HIGH)

**Current Coverage:** ~60% (only calculate route tested)  
**Target Coverage:** >90%  
**Estimated Time:** 8-12 hours

### Missing API Route Tests:

#### 3.1 `/api/proposals` Route ⚠️ NOT TESTED

**File:** `src/app/api/proposals/route.ts`  
**Tests Needed:**

- [ ] **GET /api/proposals**
  - [ ] Returns list of proposals (200)
  - [ ] Pagination works correctly
  - [ ] Filtering by search, rentModel, createdBy
  - [ ] Sorting by createdAt, name, etc.
  - [ ] Returns empty array when no proposals
  - [ ] RBAC: Only ADMIN, PLANNER, VIEWER can access
  - [ ] Unauthorized returns 401

- [ ] **POST /api/proposals**
  - [ ] Creates proposal with valid data (201)
  - [ ] Validates input with Zod schema
  - [ ] Rejects invalid data (400)
  - [ ] RBAC: Only ADMIN, PLANNER can create
  - [ ] VIEWER cannot create (403)
  - [ ] Returns created proposal with ID
  - [ ] Handles database errors (500)

- [ ] **GET /api/proposals/[id]**
  - [ ] Returns proposal by ID (200)
  - [ ] Returns 404 if not found
  - [ ] RBAC: All authenticated roles can view
  - [ ] Unauthorized returns 401

- [ ] **PUT /api/proposals/[id]**
  - [ ] Updates proposal (200)
  - [ ] Validates input
  - [ ] Returns 404 if not found
  - [ ] RBAC: Only ADMIN, PLANNER can update
  - [ ] VIEWER cannot update (403)

- [ ] **DELETE /api/proposals/[id]**
  - [ ] Deletes proposal (204)
  - [ ] Returns 404 if not found
  - [ ] RBAC: Only ADMIN can delete
  - [ ] PLANNER cannot delete (403)

**Test File:** `src/app/api/proposals/route.test.ts` (CREATE)

---

#### 3.2 `/api/historical` Route ⚠️ NOT TESTED

**File:** `src/app/api/historical/route.ts`  
**Tests Needed:**

- [ ] **GET /api/historical**
  - [ ] Returns historical data (200)
  - [ ] Ordered by year, statementType, lineItem
  - [ ] RBAC: ADMIN, PLANNER, VIEWER can access
  - [ ] Returns empty array when no data

- [ ] **POST /api/historical**
  - [ ] Creates/updates historical data (201)
  - [ ] Validates input with HistoricalDataArraySchema
  - [ ] Rejects invalid data (400)
  - [ ] Rejects modification of confirmed data (403)
  - [ ] RBAC: Only ADMIN, PLANNER can create/update
  - [ ] VIEWER cannot modify (403)
  - [ ] Handles immutability checks
  - [ ] Upserts multiple items correctly

**Test File:** `src/app/api/historical/route.test.ts` (CREATE)

---

#### 3.3 `/api/config` Route ⚠️ NOT TESTED

**File:** `src/app/api/config/route.ts`  
**Tests Needed:**

- [ ] **GET /api/config**
  - [ ] Returns system config (200)
  - [ ] Returns 404 if config not found
  - [ ] RBAC: All authenticated roles can view
  - [ ] Returns correct Decimal values as strings

- [ ] **PUT /api/config**
  - [ ] Updates system config (200)
  - [ ] Validates input with SystemConfigUpdateSchema
  - [ ] Rejects invalid data (400)
  - [ ] RBAC: Only ADMIN can update
  - [ ] PLANNER cannot update (403)
  - [ ] VIEWER cannot update (403)
  - [ ] Handles Decimal conversion correctly
  - [ ] Returns updated config

**Test File:** `src/app/api/config/route.test.ts` (CREATE)

---

#### 3.4 `/api/seed` Route ⚠️ NOT TESTED

**File:** `src/app/api/seed/route.ts`  
**Tests Needed:**

- [ ] **POST /api/seed**
  - [ ] Seeds database with default config (201)
  - [ ] Creates admin user
  - [ ] Returns "already seeded" if exists (200)
  - [ ] Handles database errors (500)
  - [ ] No authentication required (seed endpoint)

**Test File:** `src/app/api/seed/route.test.ts` (CREATE)

---

#### 3.5 API Route Test Patterns

**Common Test Cases for All Routes:**
- [ ] Authentication required (401 if not authenticated)
- [ ] RBAC enforcement (403 if wrong role)
- [ ] Input validation (400 for invalid data)
- [ ] Error handling (500 for server errors)
- [ ] Correct HTTP status codes
- [ ] Response format consistency

**Action Items:**
- [ ] Create test files for all API routes
- [ ] Use consistent test patterns
- [ ] Mock Prisma client
- [ ] Mock authentication middleware
- [ ] Target >90% coverage for all API routes

---

## 4. COMPONENT TESTS (Priority: MEDIUM)

**Current Coverage:** 0%  
**Target Coverage:** >80%  
**Estimated Time:** 16-24 hours

### Component Test Requirements:

#### 4.1 Financial Components ⚠️ NOT TESTED

**Components to Test:**

- [ ] **FinancialTable** (`src/components/financial/FinancialTable.tsx`)
  - [ ] Renders table with financial data
  - [ ] Formats millions correctly
  - [ ] Handles empty data
  - [ ] Handles loading state
  - [ ] Handles error state

- [ ] **FinancialValue** (`src/components/financial/FinancialValue.tsx`)
  - [ ] Formats Decimal values correctly
  - [ ] Shows millions format
  - [ ] Handles negative values
  - [ ] Handles zero values

- [ ] **MetricCard** (`src/components/financial/MetricCard.tsx`)
  - [ ] Displays metric value
  - [ ] Shows label
  - [ ] Handles loading state
  - [ ] Handles error state

- [ ] **MillionsInput** (`src/components/financial/MillionsInput.tsx`)
  - [ ] Converts between millions and raw values
  - [ ] Validates input
  - [ ] Handles invalid input
  - [ ] Calls onChange correctly

- [ ] **YearRangeSelector** (`src/components/financial/YearRangeSelector.tsx`)
  - [ ] Renders year range
  - [ ] Handles year selection
  - [ ] Validates year range
  - [ ] Calls onChange correctly

**Test Files:** `src/components/financial/*.test.tsx` (CREATE)

---

#### 4.2 Chart Components ⚠️ NOT TESTED

**Components to Test:**

- [ ] **CostBreakdownChart** (`src/components/dashboard/CostBreakdownChart.tsx`)
  - [ ] Renders chart with data
  - [ ] Handles empty data
  - [ ] Handles loading state
  - [ ] Responsive sizing

- [ ] **CumulativeCashFlowChart** (`src/components/dashboard/CumulativeCashFlowChart.tsx`)
  - [ ] Renders cumulative cash flow
  - [ ] Calculates cumulative values correctly
  - [ ] Handles negative cash flow
  - [ ] Handles empty data

- [ ] **NPVSensitivityChart** (`src/components/dashboard/NPVSensitivityChart.tsx`)
  - [ ] Renders sensitivity analysis
  - [ ] Handles multiple scenarios
  - [ ] Handles empty data

- [ ] **RentTrajectoryChart** (`src/components/dashboard/RentTrajectoryChart.tsx`)
  - [ ] Renders rent over time
  - [ ] Handles different rent models
  - [ ] Handles empty data

**Test Files:** `src/components/dashboard/*.test.tsx` (CREATE)

---

#### 4.3 Form Components ⚠️ NOT TESTED

**Components to Test:**

- [ ] **FormField** (`src/components/forms/FormField.tsx`)
  - [ ] Renders label and input
  - [ ] Shows validation errors
  - [ ] Handles required fields
  - [ ] Handles disabled state

**Test Files:** `src/components/forms/*.test.tsx` (CREATE)

---

#### 4.4 Proposal Components ⚠️ NOT TESTED

**Components to Test:**

- [ ] **ProposalCard** (`src/components/proposals/ProposalCard.tsx`)
  - [ ] Renders proposal information
  - [ ] Handles click events
  - [ ] Shows status badge
  - [ ] Handles loading state

- [ ] **ProposalOverviewTab** (`src/components/proposals/detail/ProposalOverviewTab.tsx`)
  - [ ] Renders overview data
  - [ ] Handles empty proposal
  - [ ] Handles loading state

- [ ] **FinancialStatementsTab** (`src/components/proposals/detail/FinancialStatementsTab.tsx`)
  - [ ] Renders financial statements
  - [ ] Handles tab switching
  - [ ] Handles empty data

- [ ] **Wizard Steps** (Step1-7)
  - [ ] Each step validates input
  - [ ] Each step calls onNext/onBack
  - [ ] Each step shows validation errors
  - [ ] Each step handles loading state

**Test Files:** `src/components/proposals/**/*.test.tsx` (CREATE)

---

#### 4.5 UI Components (shadcn/ui) ⚠️ OPTIONAL

**Note:** UI components from shadcn/ui are typically well-tested by the library.  
**Priority:** LOW (only test customizations)

**Components to Test (if customized):**

- [ ] **Button** - Only if custom logic added
- [ ] **Input** - Only if custom validation added
- [ ] **Select** - Only if custom logic added
- [ ] **Dialog** - Only if custom behavior added

**Test Files:** `src/components/ui/*.test.tsx` (CREATE if needed)

---

#### 4.6 Component Test Patterns

**Common Test Cases:**
- [ ] Component renders without crashing
- [ ] Props are passed correctly
- [ ] Event handlers are called
- [ ] Loading states work
- [ ] Error states work
- [ ] Empty states work
- [ ] Accessibility (ARIA labels, roles)
- [ ] Responsive behavior (if applicable)

**Testing Tools:**
- **Vitest** for unit tests
- **@testing-library/react** for component testing
- **@testing-library/user-event** for user interactions
- **@testing-library/jest-dom** for DOM matchers

**Action Items:**
- [ ] Create test files for all custom components
- [ ] Use React Testing Library patterns
- [ ] Target >80% coverage for components
- [ ] Focus on business logic, not styling

---

## 5. E2E TESTS (Priority: MEDIUM)

**Current Status:** 12 test files defined, 0% run  
**Target:** 100% passing  
**Estimated Time:** 20-30 hours

### E2E Test Files (Already Defined):

#### 5.1 Admin Tests

- [ ] **admin-historical-data.spec.ts**
  - [ ] Admin can view historical data
  - [ ] Admin can create historical data
  - [ ] Admin can update historical data
  - [ ] Admin cannot modify confirmed data
  - [ ] PLANNER can view but not modify
  - [ ] VIEWER can only view

- [ ] **admin-config.spec.ts**
  - [ ] Admin can view system config
  - [ ] Admin can update system config
  - [ ] PLANNER cannot update config
  - [ ] VIEWER cannot update config
  - [ ] Validation errors shown for invalid input

- [ ] **admin-capex.spec.ts**
  - [ ] Admin can configure CapEx
  - [ ] Admin can add new assets
  - [ ] Admin can configure auto-reinvestment
  - [ ] Validation works correctly

---

#### 5.2 Proposal Tests

- [ ] **proposal-wizard.spec.ts**
  - [ ] User can create new proposal
  - [ ] All wizard steps work
  - [ ] Validation on each step
  - [ ] Can navigate back/forward
  - [ ] Can save draft
  - [ ] Can submit proposal

- [ ] **proposal-detail.spec.ts**
  - [ ] Can view proposal details
  - [ ] All tabs work (Overview, Financials, Scenarios, etc.)
  - [ ] Can edit proposal (if allowed)
  - [ ] Can delete proposal (if allowed)
  - [ ] Can export proposal

---

#### 5.3 Analysis Tests

- [ ] **scenarios.spec.ts**
  - [ ] Can create scenarios
  - [ ] Can compare scenarios
  - [ ] Can delete scenarios
  - [ ] Scenario calculations are correct

- [ ] **sensitivity.spec.ts**
  - [ ] Can run sensitivity analysis
  - [ ] Charts render correctly
  - [ ] Can adjust parameters
  - [ ] Results update correctly

- [ ] **comparison.spec.ts**
  - [ ] Can compare multiple proposals
  - [ ] Comparison table renders
  - [ ] Comparison charts render
  - [ ] Can export comparison

---

#### 5.4 Export Tests

- [ ] **export.spec.ts**
  - [ ] Can export to PDF
  - [ ] Can export to Excel
  - [ ] Export includes all data
  - [ ] Export formatting is correct

---

#### 5.5 Quality Tests

- [ ] **accessibility.spec.ts**
  - [ ] WCAG AA compliance
  - [ ] Keyboard navigation works
  - [ ] Screen reader compatible
  - [ ] Color contrast meets standards

- [ ] **performance.spec.ts**
  - [ ] Page load < 2 seconds
  - [ ] Calculation < 1 second
  - [ ] No memory leaks
  - [ ] Smooth animations

- [ ] **dashboard.spec.ts**
  - [ ] Dashboard loads correctly
  - [ ] All charts render
  - [ ] KPI cards show correct values
  - [ ] Filters work correctly

---

#### 5.6 E2E Test Setup

**Tools:**
- **Playwright** (already configured)
- **@playwright/test**

**Action Items:**
- [ ] Review existing E2E test files
- [ ] Set up test database
- [ ] Create test fixtures
- [ ] Run E2E tests
- [ ] Fix any failures
- [ ] Add to CI/CD pipeline

---

## 6. INTEGRATION TESTS (Priority: MEDIUM)

**Current Status:** 2 files exist, partially passing  
**Target:** 100% passing  
**Estimated Time:** 4-6 hours

### Existing Integration Tests:

- [ ] **index.benchmark.test.ts**
  - [ ] Performance benchmarks pass
  - [ ] Calculation time < 1 second
  - [ ] Memory usage acceptable
  - [ ] Fix any warnings

- [ ] **index.e2e.test.ts**
  - [ ] Full 30-year calculation works
  - [ ] All rent models work
  - [ ] All periods calculated correctly
  - [ ] All balance sheets balance
  - [ ] All cash flows reconcile
  - [ ] Fix any warnings

**Action Items:**
- [ ] Fix failing integration tests
- [ ] Add more integration scenarios
- [ ] Test edge cases in integration context

---

## 7. UTILITY & HELPER TESTS (Priority: LOW)

**Current Coverage:** Unknown  
**Target Coverage:** >90%  
**Estimated Time:** 4-6 hours

### Utilities to Test:

- [ ] **Formatting utilities** (`src/lib/formatting/`)
  - [ ] `formatMillions()` - Formats Decimal to millions string
  - [ ] `formatCurrency()` - Formats currency correctly
  - [ ] `parseMillions()` - Parses millions string to Decimal
  - [ ] Edge cases (zero, negative, very large numbers)

- [ ] **Validation utilities** (`src/lib/validation/`)
  - [ ] Zod schemas validate correctly
  - [ ] Error messages are clear
  - [ ] Edge cases handled

- [ ] **Auth utilities** (`src/lib/auth/` or `src/middleware/auth.ts`)
  - [ ] Authentication works
  - [ ] RBAC enforcement
  - [ ] Session handling
  - [ ] Error handling

- [ ] **Database utilities** (`src/lib/prisma.ts`)
  - [ ] Connection handling
  - [ ] Transaction handling
  - [ ] Error handling

**Test Files:** `src/lib/**/*.test.ts` (CREATE)

---

## 8. TEST INFRASTRUCTURE (Priority: LOW)

### 8.1 Test Utilities

- [ ] **Test data generators** (`tests/utils/test-data.ts`)
  - [ ] Create mock proposals
  - [ ] Create mock historical data
  - [ ] Create mock system config
  - [ ] Create mock financial periods

- [ ] **Test helpers** (`tests/utils/test-helpers.ts`)
  - [ ] Mock Prisma client
  - [ ] Mock authentication
  - [ ] Mock API responses
  - [ ] Decimal comparison helpers

**Action Items:**
- [ ] Review existing test utilities
- [ ] Add missing helpers
- [ ] Document test patterns

---

### 8.2 Coverage Reporting

- [ ] **Generate coverage report**
  ```bash
  pnpm test:coverage
  ```
- [ ] **Review coverage gaps**
- [ ] **Set up coverage thresholds in vitest.config.ts**
- [ ] **Add coverage to CI/CD**

---

## 9. TESTING PRIORITY MATRIX

### ✅ COMPLETED
1. ~~Fix 7 failing calculation cache tests (Decimal.js serialization)~~ ✅ DONE
2. ~~Financial validation tests~~ ✅ DONE
3. ~~Edge case tests~~ ✅ DONE

### 🔴 CRITICAL (Do First)
1. Improve branch coverage from 64.74% to 80%+
2. Create API route tests for proposals CRUD, historical, config routes

### 🟡 HIGH (Do Next)
3. Component tests for financial components
4. Component tests for proposal components
5. Run E2E tests in CI pipeline

### 🟢 MEDIUM (Do After)
6. Component tests for chart components
7. Utility tests

### ⚪ LOW (Nice to Have)
8. UI component tests (if customized)
9. Additional performance tests
10. Accessibility tests

---

## 10. ESTIMATED TIME & EFFORT

### Total Estimated Time: **60-80 hours**

**Breakdown:**
- **Critical Fixes:** 5-7 hours
- **Historical Period Tests:** 4-6 hours
- **API Route Tests:** 8-12 hours
- **Component Tests:** 16-24 hours
- **E2E Tests:** 20-30 hours
- **Integration Tests:** 4-6 hours
- **Utility Tests:** 4-6 hours

### Recommended Approach:
1. **Week 1:** Fix failing tests + Historical period edge cases
2. **Week 2:** API route tests
3. **Week 3:** Component tests (financial + proposal)
4. **Week 4:** E2E tests + Integration tests
5. **Week 5:** Utility tests + Final coverage review

---

## 11. SUCCESS CRITERIA

### Phase 2 Exit Criteria ✅ COMPLETE
- [x] Engine architecture complete
- [x] All 3 rent models working
- [x] Circular solver converges
- [x] CapEx & depreciation working
- [x] Statements generation working
- [x] **All tests passing** ✅ (339/339 passing, 5 skipped)
- [x] **>80% statement coverage** ✅ (91.36% statements)
- [x] Performance <1s

### Phase 3/4 Exit Criteria (Current Focus)
- [ ] **Branch coverage >80%** ⚠️ (currently 64.74%)
- [ ] Component tests >80% coverage
- [ ] E2E tests 100% passing in CI
- [ ] Integration tests complete
- [ ] Accessibility tests (WCAG AA)

---

## 12. NEXT STEPS

### ✅ Completed:
1. ~~Fix 7 failing calculation cache tests~~ ✅ DONE (November 25, 2025)
2. ~~Financial validation suite~~ ✅ DONE
3. ~~Edge case tests~~ ✅ DONE

### Immediate Actions (This Week):
1. 🔴 **Improve branch coverage** - Add tests for uncovered branches (64.74% → 80%)
2. 🟡 **Create API route test files** (Backend Engineer, 8-12 hours)

### Short Term (Next 2 Weeks):
3. 🟡 **Component tests for financial components** (Frontend Engineer, 8-12 hours)
4. 🟡 **Component tests for proposal components** (Frontend Engineer, 8-12 hours)
5. 🟢 **Run E2E tests in CI** (QA Engineer, 4-6 hours)

### Medium Term (Next Month):
6. 🟢 **Complete all component tests** (Frontend Engineer)
7. 🟢 **Complete all utility tests** (Backend Engineer)
8. ⚪ **Final coverage review** (QA Engineer)

---

## 13. TEST COVERAGE TARGETS

### By Module:
- **Calculation Engine:** 100% ✅ (currently ~97% for circular solver, ~85% overall)
- **API Routes:** >90% ⚠️ (currently ~60%, only calculate route tested)
- **React Components:** >80% ⚠️ (currently 0%)
- **Utilities:** >90% ⚠️ (unknown)
- **Overall:** >85% ⚠️ (currently 82-85%)

### By Test Type:
- **Unit Tests:** >90% ⚠️ (currently ~85%)
- **Integration Tests:** 100% ⚠️ (currently partially passing)
- **E2E Tests:** 100% ⚠️ (currently 0% run)
- **Component Tests:** >80% ⚠️ (currently 0%)

---

## 14. NOTES

- **Financial code requires 100% coverage** - Zero tolerance for untested financial calculations
- **API routes require >90% coverage** - Security and validation critical
- **Components require >80% coverage** - Focus on business logic, not styling
- **E2E tests validate user workflows** - Critical for production readiness

---

**Report Status:** ✅ Updated
**Last Updated:** November 25, 2025
**Previous Issues:** Calculation cache tests fixed (Decimal.js serialization)
**Next Review:** After branch coverage improvement

### Current Test Summary (November 25, 2025)
```
Test Files:  15 passed
Tests:       339 passed, 5 skipped (344 total)
Coverage:    91.36% statements, 64.74% branches, 95.03% functions
Duration:    1.2s
```

