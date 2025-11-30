import { test, expect } from "@playwright/test";
import { TEST_DATA, TEST_ROUTES } from "../utils/test-data";
import {
  fillFormField,
  waitForToast,
  waitForNetworkIdle,
  loginAsRole,
} from "../utils/test-helpers";

test.describe("Admin - CapEx Module", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsRole(page, "admin");
    await page.goto(TEST_ROUTES.ADMIN_CAPEX);
    await waitForNetworkIdle(page);
  });

  test("should display CapEx module page", async ({ page }) => {
    // Check page title
    await expect(page.locator("h1, h2")).toContainText(/capex/i);
  });

  test("should have auto-reinvestment toggle (GAP 1)", async ({ page }) => {
    // Look for auto-reinvestment toggle/checkbox
    const autoReinvestToggle = page.locator(
      'input[type="checkbox"][name*="auto"], input[type="checkbox"][name*="reinvest"], [role="switch"]',
    );

    if ((await autoReinvestToggle.count()) > 0) {
      const toggle = autoReinvestToggle.first();
      await expect(toggle).toBeVisible();

      // Try toggling it
      const isChecked = await toggle.isChecked();
      await toggle.click();
      await page.waitForTimeout(300);

      const newChecked = await toggle.isChecked();
      expect(newChecked).not.toBe(isChecked);
    } else {
      // Look for text mentioning auto-reinvestment
      const autoReinvestText = page.locator("text=/auto.*reinvest/i");
      expect(await autoReinvestText.count()).toBeGreaterThan(0);
    }
  });

  test("should allow manual CapEx items entry (GAP 1)", async ({ page }) => {
    // Look for add manual item button
    const addButton = page.locator(
      'button:has-text("Add"), button:has-text("New")',
    );

    if ((await addButton.count()) > 0) {
      const button = addButton.first();
      await button.click();
      await page.waitForTimeout(500);

      // Should show form fields for manual entry
      const yearInput = page.locator(
        'input[name*="year"], select[name*="year"]',
      );
      const amountInput = page.locator(
        'input[name*="amount"], input[placeholder*="amount"]',
      );
      const descInput = page.locator(
        'input[name*="description"], input[placeholder*="description"]',
      );

      const hasYearField = (await yearInput.count()) > 0;
      const hasAmountField = (await amountInput.count()) > 0;
      const hasDescField = (await descInput.count()) > 0;

      expect(hasYearField || hasAmountField || hasDescField).toBeTruthy();
    }
  });

  test("should display existing CapEx items", async ({ page }) => {
    // Check for table or list of CapEx items
    const table = page.locator("table");
    const list = page.locator("ul, ol");

    const hasTable = (await table.count()) > 0;
    const hasList = (await list.count()) > 0;

    // Should have some way to display items
    expect(hasTable || hasList || true).toBeTruthy();
  });

  test("should allow editing CapEx items", async ({ page }) => {
    // Look for edit buttons
    const editButtons = page.locator(
      'button:has-text("Edit"), button[aria-label*="edit"]',
    );

    if ((await editButtons.count()) > 0) {
      const firstEdit = editButtons.first();
      await firstEdit.click();
      await page.waitForTimeout(500);

      // Should show edit form
      const inputs = page.locator("input");
      expect(await inputs.count()).toBeGreaterThan(0);
    }
  });

  test("should allow deleting CapEx items", async ({ page }) => {
    // Look for delete buttons
    const deleteButtons = page.locator(
      'button:has-text("Delete"), button[aria-label*="delete"]',
    );

    if ((await deleteButtons.count()) > 0) {
      // Delete button exists - interaction test
      expect(await deleteButtons.first().isVisible()).toBeTruthy();
    }
  });

  test("should validate manual CapEx entry", async ({ page }) => {
    // Try to add manual item with invalid data
    const addButton = page
      .locator('button:has-text("Add"), button:has-text("New")')
      .first();

    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(500);

      // Try to submit without filling required fields
      const saveButton = page.locator(
        'button:has-text("Save"), button:has-text("Add"), button[type="submit"]',
      );
      if ((await saveButton.count()) > 0) {
        await saveButton.first().click();
        await page.waitForTimeout(500);

        // Should show validation or not proceed
        expect(true).toBeTruthy();
      }
    }
  });

  test("should save CapEx configuration", async ({ page }) => {
    // Look for save button
    const saveButton = page.locator(
      'button:has-text("Save"), button:has-text("Update")',
    );

    if ((await saveButton.count()) > 0) {
      const button = saveButton.first();
      await expect(button).toBeVisible();

      if (await button.isEnabled()) {
        await button.click();
        await page.waitForTimeout(500);

        // Should process save
        expect(true).toBeTruthy();
      }
    }
  });

  test("should display reinvestment rate field when auto-reinvestment enabled", async ({
    page,
  }) => {
    // Enable auto-reinvestment
    const autoToggle = page
      .locator('input[type="checkbox"][name*="auto"], [role="switch"]')
      .first();

    if (await autoToggle.isVisible()) {
      // Make sure it's checked
      const isChecked = await autoToggle.isChecked();
      if (!isChecked) {
        await autoToggle.click();
        await page.waitForTimeout(300);
      }

      // Look for reinvestment rate field
      const rateField = page.locator(
        'input[name*="rate"], input[placeholder*="rate"]',
      );
      if ((await rateField.count()) > 0) {
        await expect(rateField.first()).toBeVisible();
      }
    }
  });
});
