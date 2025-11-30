# E2E Test Fixes Progress

**Date:** Current Session  
**Initial Failures:** 221  
**Status:** In Progress

---

## ✅ Fixed Issues

### 1. Authentication (54 failures)
- ✅ Added `loginAsRole(page, "admin")` to:
  - `admin-config.spec.ts`
  - `admin-capex.spec.ts`
  - `admin-historical-data.spec.ts`

### 2. Export Button Selectors (6+ failures)
- ✅ Changed from `button:has-text("Excel")` to `getByRole("button", { name: /export.*excel/i })`
- ✅ Changed from `button:has-text("PDF")` to `getByRole("button", { name: /export.*pdf/i })`
- ✅ Fixed in:
  - `export.spec.ts`
  - `proposal-detail.spec.ts`

### 3. Selector Syntax Issues
- ✅ Fixed RegExp CSS selector issue in `sensitivity.spec.ts`
- ✅ Fixed duplicate variable in `admin-config.spec.ts`
- ✅ Updated save button selectors to use `getByRole`
- ✅ Fixed `interestLabel` duplicate variable

---

## ⚠️ Remaining Issues

### 1. Page Title Selectors
- ❌ Historical page: Looking for `/historical data/i` in `h1` but page shows "Historical Data Entry"
- ❌ Admin config: Looking for `/config/i` but page shows "System Configuration"
- ❌ Admin capex: Looking for `/capex/i` but page might show different title

### 2. Button Text Selectors
- ❌ Confirm button in historical page - need to check actual button text
- ❌ Save button selectors - some might still be wrong

### 3. Accessibility Violations
- ❌ 3 unique failures × 3 browsers = 9 failures
- Need to fix actual WCAG violations in UI components

### 4. Other Selector Issues
- ❌ Comparison test selectors
- ❌ Scenario test selectors
- ❌ Wizard test selectors

---

## 📝 Next Steps

1. Fix page title expectations in tests
2. Fix remaining button selectors
3. Add authentication to proposal tests if needed
4. Fix accessibility violations
5. Fix remaining selector mismatches

---

## Estimated Remaining Fixes

- Page title fixes: ~5 tests
- Button selectors: ~10 tests
- Accessibility: ~9 tests (requires UI fixes)
- Other selectors: ~20 tests
- Authentication: ~5 tests

**Total Remaining:** ~49 fixes needed (many are duplicates across browsers)

