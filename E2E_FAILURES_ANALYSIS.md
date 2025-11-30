# E2E Test Failures Analysis

**Total Failures:** 221 (out of 492 tests)  
**Pass Rate:** 55% (271 passing)

---

## Failure Categories

### Category 1: Missing Authentication (Majority of Failures)

**Issue:** Tests accessing admin pages without authentication are redirected to login or seeing "Project 2052" instead of expected content.

**Affected Tests:**
- All admin-* tests (admin-config, admin-capex, admin-historical-data)
- Tests accessing protected routes without login

**Error Pattern:**
```
Expected: /config/i or /capex/i
Received: "Project 2052" (login page title)
```

**Root Cause:** Tests don't call `loginAsRole()` before accessing protected pages.

**Fix Required:** Add authentication to all admin tests.

---

### Category 2: Selector Mismatches

**Issue:** Selectors don't match current UI elements.

**Affected Tests:**
- Export button tests (looking for "Excel" or "PDF" but buttons say "Export Excel", "Export PDF")
- Button text selectors may have changed
- Some elements may have different structure

**Error Pattern:**
```
Expected: visible
Error: element(s) not found
Locator: button:has-text("Excel")
```

**Fix Required:** Update selectors to match current UI.

---

### Category 3: Accessibility Violations

**Issue:** WCAG AA compliance failures detected by axe.

**Affected Tests:**
- Accessibility test suite (3 unique failures × 3 browsers = 9 failures)

**Fix Required:** Fix accessibility issues in UI components.

---

### Category 4: Test Logic Issues

**Issue:** Some tests have incorrect expectations or logic.

**Examples:**
- Sensitivity test with invalid RegExp flags
- Some tests may need updated test data

---

## Breakdown by Test File

### Admin Tests (18 unique × 3 browsers = 54 failures)

1. **admin-config.spec.ts** (5 tests × 3 browsers = 15 failures)
   - Missing authentication
   - Need to login as admin before accessing /admin/config

2. **admin-capex.spec.ts** (2 tests × 3 browsers = 6 failures)
   - Missing authentication
   - Need to login as admin before accessing /admin/capex

3. **admin-historical-data.spec.ts** (5 tests × 3 browsers = 15 failures)
   - Missing authentication
   - Need to login as admin before accessing /admin/historical

### Export Tests (2 unique × 3 browsers = 6 failures)

1. **export.spec.ts**
   - Selector issues: looking for "Excel" but button says "Export Excel"
   - Selector issues: looking for "PDF" but button says "Export PDF"

### Proposal Tests (3 unique × 3 browsers = 9 failures)

1. **proposal-detail.spec.ts**
   - Export button selectors
   - May also need authentication

### Other Tests

- Accessibility tests (3 unique × 3 browsers = 9 failures)
- Comparison tests (1 × 3 = 3 failures)
- Scenario tests (1 × 3 = 3 failures)
- Sensitivity tests (2 × 3 = 6 failures)
- Wizard tests (1 × 3 = 3 failures)

---

## Fix Priority

### Priority 1: Authentication (Blocks ~50% of failures)
- Add `loginAsRole(page, "admin")` to all admin tests
- Ensure test users exist or are created

### Priority 2: Selector Updates (Blocks ~25% of failures)
- Update export button selectors
- Verify all button/text selectors match current UI

### Priority 3: Accessibility Fixes (Blocks ~15% of failures)
- Fix WCAG violations
- Add missing ARIA labels

### Priority 4: Test Logic (Blocks ~10% of failures)
- Fix RegExp issues
- Update test data if needed

---

## Estimated Fix Time

- Authentication fixes: 2-3 hours
- Selector updates: 1-2 hours
- Accessibility fixes: 2-3 hours
- Test logic fixes: 1 hour

**Total:** 6-9 hours

