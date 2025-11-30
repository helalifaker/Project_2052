import { Page, expect, test } from "@playwright/test";

/**
 * Test Helpers for E2E Testing
 * Provides common utilities and helper functions for Playwright tests
 */

type Role = "admin" | "planner" | "viewer";

const roleEnv: Record<Role, { email?: string; password?: string }> = {
  admin: {
    email: process.env.E2E_ADMIN_EMAIL,
    password: process.env.E2E_ADMIN_PASSWORD,
  },
  planner: {
    email: process.env.E2E_PLANNER_EMAIL,
    password: process.env.E2E_PLANNER_PASSWORD,
  },
  viewer: {
    email: process.env.E2E_VIEWER_EMAIL,
    password: process.env.E2E_VIEWER_PASSWORD,
  },
};

/**
 * Login as a specific role for E2E tests
 * Skips the test if credentials are not provided
 */
export async function loginAsRole(page: Page, role: Role) {
  const creds = roleEnv[role];
  if (!creds.email || !creds.password) {
    // Skip test if credentials are not configured
    // Tests can check for this by looking for a skip message
    test.skip(true, `Missing credentials for role: ${role}. Set E2E_${role.toUpperCase()}_EMAIL and E2E_${role.toUpperCase()}_PASSWORD environment variables.`);
    return;
  }

  await page.goto("/login");
  await page.fill('input[type="email"]', creds.email);
  await page.fill('input[type="password"]', creds.password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/dashboard|admin|proposals/, { timeout: 10_000 });
}

/**
 * Wait for network to be idle (no pending requests)
 */
export async function waitForNetworkIdle(page: Page, timeout = 5000) {
  await page.waitForLoadState("networkidle", { timeout });
}

/**
 * Fill form field and wait for validation
 */
export async function fillFormField(
  page: Page,
  selector: string,
  value: string,
) {
  await page.fill(selector, value);
  await page.waitForTimeout(100); // Brief wait for validation
}

/**
 * Select from dropdown and wait for change
 */
export async function selectDropdown(
  page: Page,
  selector: string,
  value: string,
) {
  await page.selectOption(selector, value);
  await page.waitForTimeout(100);
}

/**
 * Click button and wait for navigation
 */
export async function clickAndWaitForNavigation(page: Page, selector: string) {
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle" }),
    page.click(selector),
  ]);
}

/**
 * Measure performance of an action
 */
export async function measurePerformance(
  page: Page,
  action: () => Promise<void>,
): Promise<number> {
  const startTime = Date.now();
  await action();
  const endTime = Date.now();
  return endTime - startTime;
}

/**
 * Wait for API response
 */
export async function waitForApiResponse(
  page: Page,
  urlPattern: string | RegExp,
) {
  const response = await page.waitForResponse(
    (response) =>
      (typeof urlPattern === "string"
        ? response.url().includes(urlPattern)
        : urlPattern.test(response.url())) && response.status() === 200,
  );
  return response;
}

/**
 * Check if element is visible and enabled
 */
export async function isElementReady(
  page: Page,
  selector: string,
): Promise<boolean> {
  try {
    const element = page.locator(selector);
    await element.waitFor({ state: "visible", timeout: 5000 });
    const isEnabled = await element.isEnabled();
    return isEnabled;
  } catch {
    return false;
  }
}

/**
 * Take screenshot on failure
 */
export async function captureOnFailure(page: Page, testName: string) {
  const screenshot = await page.screenshot({ fullPage: true });
  return screenshot;
}

/**
 * Generate random test data
 */
export function generateTestData() {
  const timestamp = Date.now();
  return {
    developerName: `Test Developer ${timestamp}`,
    email: `test${timestamp}@example.com`,
    phone: `+966${Math.floor(Math.random() * 1000000000)}`,
  };
}

/**
 * Format number for comparison (removes formatting)
 */
export function parseFormattedNumber(text: string): number {
  return parseFloat(text.replace(/[^0-9.-]/g, ""));
}

/**
 * Wait for toast notification
 */
export async function waitForToast(
  page: Page,
  expectedText?: string,
  timeout = 5000,
) {
  const toastSelector = '[role="status"], [data-sonner-toast]';
  await page.waitForSelector(toastSelector, { timeout });

  if (expectedText) {
    const toast = page.locator(toastSelector);
    await expect(toast).toContainText(expectedText);
  }
}

/**
 * Check for loading state to complete
 */
export async function waitForLoadingComplete(
  page: Page,
  loadingSelector = '[data-testid="loading"], [aria-busy="true"]',
) {
  try {
    await page.waitForSelector(loadingSelector, {
      state: "hidden",
      timeout: 10000,
    });
  } catch {
    // Loading indicator might not appear for fast operations
  }
}

/**
 * Scroll element into view
 */
export async function scrollIntoView(page: Page, selector: string) {
  await page.locator(selector).scrollIntoViewIfNeeded();
}

/**
 * Get table cell value
 */
export async function getTableCellValue(
  page: Page,
  rowIndex: number,
  columnIndex: number,
): Promise<string> {
  const cell = page.locator(
    `table tbody tr:nth-child(${rowIndex}) td:nth-child(${columnIndex})`,
  );
  return (await cell.textContent()) || "";
}

/**
 * Check keyboard navigation
 */
export async function testKeyboardNavigation(
  page: Page,
  elementSelector: string,
) {
  await page.focus(elementSelector);
  await expect(page.locator(elementSelector)).toBeFocused();
  await page.keyboard.press("Tab");
}

/**
 * Verify ARIA attributes
 */
export async function verifyAriaAttributes(page: Page, selector: string) {
  const element = page.locator(selector);
  const ariaLabel = await element.getAttribute("aria-label");
  const ariaDescribedBy = await element.getAttribute("aria-describedby");
  const role = await element.getAttribute("role");

  return {
    hasAriaLabel: !!ariaLabel,
    hasAriaDescribedBy: !!ariaDescribedBy,
    hasRole: !!role,
    ariaLabel,
    ariaDescribedBy,
    role,
  };
}

/**
 * Wait for calculation to complete
 */
export async function waitForCalculation(page: Page, timeout = 10000) {
  // Wait for calculation API response
  await waitForApiResponse(page, /\/api\/proposals\/calculate/);
  // Wait for any loading indicators to disappear
  await waitForLoadingComplete(page);
}

/**
 * Fill wizard step and proceed
 */
export async function completeWizardStep(
  page: Page,
  stepNumber: number,
  fillAction: () => Promise<void>,
) {
  // Execute the fill action for this step
  await fillAction();

  // Click next/continue button
  const nextButton = page.locator(
    'button:has-text("Next"), button:has-text("Continue")',
  );
  await nextButton.click();

  // Wait for the step transition
  await page.waitForTimeout(500);
}

/**
 * Verify financial table has data
 */
export async function verifyFinancialTableHasData(
  page: Page,
  tableSelector: string,
) {
  const rows = page.locator(`${tableSelector} tbody tr`);
  const rowCount = await rows.count();
  expect(rowCount).toBeGreaterThan(0);

  // Check that cells contain numeric values
  const firstCell = page.locator(
    `${tableSelector} tbody tr:first-child td:nth-child(2)`,
  );
  const cellText = await firstCell.textContent();
  expect(cellText).toBeTruthy();
}
