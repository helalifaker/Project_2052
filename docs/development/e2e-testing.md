# E2E Testing Quick Start Guide

## 🚀 Running Tests

### Quick Commands

```bash
# Run all tests
pnpm test:e2e

# Run with interactive UI
pnpm test:e2e:ui

# Run with visible browser
pnpm test:e2e:headed

# Debug mode
pnpm test:e2e:debug
```

### Run Specific Test Files

```bash
# Admin tests
pnpm test:e2e tests/e2e/admin-historical-data.spec.ts
pnpm test:e2e tests/e2e/admin-config.spec.ts
pnpm test:e2e tests/e2e/admin-capex.spec.ts

# Proposal tests
pnpm test:e2e tests/e2e/proposal-wizard.spec.ts
pnpm test:e2e tests/e2e/proposal-detail.spec.ts

# Feature tests
pnpm test:e2e tests/e2e/scenarios.spec.ts
pnpm test:e2e tests/e2e/sensitivity.spec.ts
pnpm test:e2e tests/e2e/comparison.spec.ts
pnpm test:e2e tests/e2e/export.spec.ts

# Performance & Accessibility
pnpm test:e2e tests/e2e/performance.spec.ts
pnpm test:e2e tests/e2e/accessibility.spec.ts
```

### Run by Pattern

```bash
# Run all admin tests
pnpm test:e2e --grep "admin"

# Run all proposal tests
pnpm test:e2e --grep "proposal"

# Run all performance tests
pnpm test:e2e --grep "Performance"

# Run all accessibility tests
pnpm test:e2e --grep "Accessibility"
```

## 📊 Viewing Results

```bash
# Show HTML report
pnpm exec playwright show-report

# View trace (after failure)
pnpm exec playwright show-trace test-results/.../trace.zip
```

## 🐛 Debugging

```bash
# Debug specific test
pnpm test:e2e:debug tests/e2e/proposal-wizard.spec.ts

# Run with slowmo (slows down actions)
pnpm test:e2e --slow-mo=1000

# Take screenshots
# Screenshots are automatically saved on failure to:
# test-results/**/*.png
```

## 📁 Test Structure

```
tests/
├── e2e/
│   ├── admin-historical-data.spec.ts
│   ├── admin-config.spec.ts
│   ├── admin-capex.spec.ts
│   ├── proposal-wizard.spec.ts
│   ├── proposal-detail.spec.ts
│   ├── scenarios.spec.ts
│   ├── sensitivity.spec.ts
│   ├── comparison.spec.ts
│   ├── export.spec.ts
│   ├── dashboard.spec.ts
│   ├── performance.spec.ts
│   └── accessibility.spec.ts
└── utils/
    ├── test-helpers.ts
    └── test-data.ts
```

## ✅ What's Tested

### Admin Flows (26 tests)
- Historical data entry (2023-2024)
- System configuration (Zakat, Interest, Min Cash)
- CapEx module (Auto-reinvestment + Manual items)

### Proposal Management (27 tests)
- 7-step wizard (Basics → Review & Calculate)
- Proposal detail page (6 tabs)
- Create, view, edit, delete proposals

### Financial Analysis (43 tests)
- Financial statements (P&L, BS, CF)
- Year range selector
- Scenario sliders (4 variables)
- Sensitivity analysis (Tornado chart)

### Comparison & Export (27 tests)
- Compare 2-5 proposals
- Winner highlighting
- Export to Excel/PDF
- Comparison charts

### Performance (13 tests)
- Page load times (<2s)
- Calculation speed (<2s)
- Scenario updates (<500ms)
- Export speed (<5s)

### Accessibility (30+ tests)
- WCAG AA compliance
- Keyboard navigation
- Screen reader support
- Color contrast
- Focus indicators

## 🎯 Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| Page Load | <2 seconds | ✅ Tested |
| Proposal Calculation | <2 seconds | ✅ Tested |
| Scenario Slider | <500ms | ✅ Tested |
| Export | <5 seconds | ✅ Tested |
| Tab Switch | <100ms | ✅ Tested |

## 🔧 Configuration

Edit `playwright.config.ts` to customize:
- Test timeout
- Number of workers
- Browser selection
- Screenshot settings
- Video recording

## 📝 Writing New Tests

```typescript
import { test, expect } from "@playwright/test";
import { waitForNetworkIdle } from "../utils/test-helpers";

test.describe("My Feature", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/my-page");
    await waitForNetworkIdle(page);
  });

  test("should do something", async ({ page }) => {
    // Your test here
    await page.click("button");
    await expect(page.locator("h1")).toBeVisible();
  });
});
```

## 🚨 Troubleshooting

**Tests are slow:**
```bash
# Run with fewer workers
pnpm test:e2e --workers=1
```

**Tests fail locally but pass in CI:**
```bash
# Run in CI mode
CI=true pnpm test:e2e
```

**Need to update snapshots:**
```bash
pnpm test:e2e --update-snapshots
```

**Browser not installed:**
```bash
pnpm exec playwright install
```

## 📚 Resources

- [Full Test Report](./WEEK_12_E2E_TESTING_REPORT.md)
- [Playwright Docs](https://playwright.dev/)
- [Test Helpers](./tests/utils/test-helpers.ts)
- [Test Data](./tests/utils/test-data.ts)

## 🔄 CI/CD Integration

See [WEEK_12_E2E_TESTING_REPORT.md](./WEEK_12_E2E_TESTING_REPORT.md) Section 7 for detailed CI/CD setup.

Quick GitHub Actions setup:
```yaml
- name: Run E2E tests
  run: pnpm test:e2e
  env:
    CI: true
```

---

**Total Tests:** 140+
**Total Files:** 12
**Coverage:** Admin, Proposals, Financial Analysis, Performance, Accessibility
**Status:** ✅ Production Ready
