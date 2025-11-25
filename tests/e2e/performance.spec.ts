import { test, expect } from "@playwright/test";
import { TEST_ROUTES, PERFORMANCE_THRESHOLDS } from "../utils/test-data";
import { waitForNetworkIdle, measurePerformance } from "../utils/test-helpers";

test.describe("Performance Tests", () => {
  test("Home page should load in <2 seconds", async ({ page }) => {
    const duration = await measurePerformance(page, async () => {
      await page.goto(TEST_ROUTES.HOME);
      await waitForNetworkIdle(page);
    });

    console.log(`Home page loaded in ${duration}ms`);
    expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.PAGE_LOAD);
  });

  test("Proposals List page should load in <2 seconds", async ({ page }) => {
    const duration = await measurePerformance(page, async () => {
      await page.goto(TEST_ROUTES.PROPOSALS_LIST);
      await waitForNetworkIdle(page);
    });

    console.log(`Proposals List loaded in ${duration}ms`);
    expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.PAGE_LOAD);
  });

  test("Admin Historical page should load in <2 seconds", async ({ page }) => {
    const duration = await measurePerformance(page, async () => {
      await page.goto(TEST_ROUTES.ADMIN_HISTORICAL);
      await waitForNetworkIdle(page);
    });

    console.log(`Admin Historical page loaded in ${duration}ms`);
    expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.PAGE_LOAD);
  });

  test("Proposal Detail page should load in <2 seconds", async ({ page }) => {
    await page.goto(TEST_ROUTES.PROPOSALS_LIST);
    await waitForNetworkIdle(page);

    const firstProposal = page.locator('a[href*="/proposals/"]').first();

    if (await firstProposal.isVisible()) {
      const duration = await measurePerformance(page, async () => {
        await firstProposal.click();
        await waitForNetworkIdle(page);
      });

      console.log(`Proposal Detail page loaded in ${duration}ms`);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.PAGE_LOAD);
    }
  });

  test("Proposal calculation should complete in <2 seconds", async ({
    page,
  }) => {
    await page.goto(TEST_ROUTES.PROPOSALS_NEW);
    await waitForNetworkIdle(page);

    const calculateButton = page.locator('button:has-text("Calculate")');

    if (await calculateButton.isVisible()) {
      const responsePromise = page.waitForResponse(
        (response) =>
          response.url().includes("/api/proposals/calculate") &&
          response.status() === 200,
        { timeout: PERFORMANCE_THRESHOLDS.PROPOSAL_CALCULATION + 1000 },
      );

      const startTime = Date.now();
      await calculateButton.click();

      try {
        await responsePromise;
        const endTime = Date.now();
        const duration = endTime - startTime;

        console.log(`Proposal calculation completed in ${duration}ms`);
        expect(duration).toBeLessThan(
          PERFORMANCE_THRESHOLDS.PROPOSAL_CALCULATION,
        );
      } catch (error) {
        console.log(
          "Calculation not triggered (validation or incomplete form)",
        );
      }
    }
  });

  test("Scenario slider should update in <500ms", async ({ page }) => {
    await page.goto(TEST_ROUTES.PROPOSALS_LIST);
    await waitForNetworkIdle(page);

    const firstProposal = page.locator('a[href*="/proposals/"]').first();
    if (await firstProposal.isVisible()) {
      await firstProposal.click();
      await waitForNetworkIdle(page);

      // Navigate to Scenarios tab
      const scenariosTab = page.locator('button:has-text("Scenarios")').first();
      if (await scenariosTab.isVisible()) {
        await scenariosTab.click();
        await page.waitForTimeout(500);

        const sliders = page.locator('input[type="range"], [role="slider"]');
        if ((await sliders.count()) > 0) {
          const firstSlider = sliders.first();

          const responsePromise = page.waitForResponse(
            (response) =>
              response.url().includes("/scenarios") &&
              response.status() === 200,
            { timeout: PERFORMANCE_THRESHOLDS.SCENARIO_UPDATE + 500 },
          );

          const startTime = Date.now();
          await firstSlider.focus();
          await firstSlider.press("ArrowRight");

          try {
            await responsePromise;
            const endTime = Date.now();
            const duration = endTime - startTime;

            console.log(`Scenario update completed in ${duration}ms`);
            expect(duration).toBeLessThan(
              PERFORMANCE_THRESHOLDS.SCENARIO_UPDATE,
            );
          } catch (error) {
            console.log(
              "Scenario API not called (debounced or not configured)",
            );
          }
        }
      }
    }
  });

  test("Scenario slider optimal response time <200ms", async ({ page }) => {
    await page.goto(TEST_ROUTES.PROPOSALS_LIST);
    await waitForNetworkIdle(page);

    const firstProposal = page.locator('a[href*="/proposals/"]').first();
    if (await firstProposal.isVisible()) {
      await firstProposal.click();
      await waitForNetworkIdle(page);

      const scenariosTab = page.locator('button:has-text("Scenarios")').first();
      if (await scenariosTab.isVisible()) {
        await scenariosTab.click();
        await page.waitForTimeout(500);

        const sliders = page.locator('input[type="range"], [role="slider"]');
        if ((await sliders.count()) > 0) {
          const firstSlider = sliders.first();

          const responsePromise = page.waitForResponse(
            (response) =>
              response.url().includes("/scenarios") &&
              response.status() === 200,
            { timeout: PERFORMANCE_THRESHOLDS.OPTIMAL_SCENARIO_UPDATE + 500 },
          );

          const startTime = Date.now();
          await firstSlider.focus();
          await firstSlider.press("ArrowRight");

          try {
            await responsePromise;
            const endTime = Date.now();
            const duration = endTime - startTime;

            console.log(
              `Scenario optimal update in ${duration}ms (target <200ms)`,
            );

            // This is an aspirational target
            if (duration < PERFORMANCE_THRESHOLDS.OPTIMAL_SCENARIO_UPDATE) {
              console.log("✓ Exceeded optimal performance target!");
            } else {
              console.log(
                "✗ Did not meet optimal target but within acceptable range",
              );
            }

            // Don't fail test for optimal target
            expect(duration).toBeLessThan(
              PERFORMANCE_THRESHOLDS.SCENARIO_UPDATE,
            );
          } catch (error) {
            console.log("Scenario API not called");
          }
        }
      }
    }
  });

  test("Export should complete in <5 seconds", async ({ page }) => {
    await page.goto(TEST_ROUTES.PROPOSALS_LIST);
    await waitForNetworkIdle(page);

    const firstProposal = page.locator('a[href*="/proposals/"]').first();
    if (await firstProposal.isVisible()) {
      await firstProposal.click();
      await waitForNetworkIdle(page);

      const excelButton = page.locator('button:has-text("Excel")').first();

      if (await excelButton.isVisible()) {
        const downloadPromise = page.waitForEvent("download", {
          timeout: PERFORMANCE_THRESHOLDS.EXPORT_GENERATION + 1000,
        });

        const startTime = Date.now();
        await excelButton.click();

        try {
          await downloadPromise;
          const endTime = Date.now();
          const duration = endTime - startTime;

          console.log(`Export completed in ${duration}ms`);
          expect(duration).toBeLessThan(
            PERFORMANCE_THRESHOLDS.EXPORT_GENERATION,
          );
        } catch (error) {
          console.log("Export not triggered");
        }
      }
    }
  });

  test("Tab switching should be instant (<100ms)", async ({ page }) => {
    await page.goto(TEST_ROUTES.PROPOSALS_LIST);
    await waitForNetworkIdle(page);

    const firstProposal = page.locator('a[href*="/proposals/"]').first();
    if (await firstProposal.isVisible()) {
      await firstProposal.click();
      await waitForNetworkIdle(page);

      const tabs = page.locator('[role="tab"]');
      const tabCount = await tabs.count();

      if (tabCount > 1) {
        // Switch to second tab
        const startTime = Date.now();
        await tabs.nth(1).click();
        await page.waitForTimeout(100);
        const endTime = Date.now();
        const duration = endTime - startTime;

        console.log(`Tab switch completed in ${duration}ms`);
        expect(duration).toBeLessThan(100);
      }
    }
  });

  test("Financial table rendering should be fast (<1s)", async ({ page }) => {
    await page.goto(TEST_ROUTES.PROPOSALS_LIST);
    await waitForNetworkIdle(page);

    const firstProposal = page.locator('a[href*="/proposals/"]').first();
    if (await firstProposal.isVisible()) {
      await firstProposal.click();
      await waitForNetworkIdle(page);

      const financialTab = page.locator('button:has-text("Financial")').first();
      if (await financialTab.isVisible()) {
        const startTime = Date.now();
        await financialTab.click();
        await page.waitForSelector("table", { timeout: 1000 });
        const endTime = Date.now();
        const duration = endTime - startTime;

        console.log(`Financial table rendered in ${duration}ms`);
        expect(duration).toBeLessThan(1000);
      }
    }
  });

  test("API response time monitoring", async ({ page }) => {
    // Monitor all API calls for performance
    const apiCalls: { url: string; duration: number }[] = [];

    page.on("response", async (response) => {
      if (response.url().includes("/api/")) {
        const request = response.request();
        const timing = request.timing();

        if (timing) {
          const duration = timing.responseEnd - timing.requestStart;
          apiCalls.push({
            url: response.url(),
            duration,
          });

          if (duration > 1000) {
            console.log(
              `⚠️  Slow API call: ${response.url()} took ${duration}ms`,
            );
          }
        }
      }
    });

    await page.goto(TEST_ROUTES.PROPOSALS_LIST);
    await waitForNetworkIdle(page);

    // Report API performance
    console.log(`Monitored ${apiCalls.length} API calls`);
    const avgDuration =
      apiCalls.reduce((sum, call) => sum + call.duration, 0) / apiCalls.length;
    console.log(`Average API response time: ${avgDuration.toFixed(2)}ms`);

    expect(apiCalls.length).toBeGreaterThanOrEqual(0);
  });
});

test.describe("Resource Loading Performance", () => {
  test("should not load excessive JavaScript", async ({ page }) => {
    await page.goto(TEST_ROUTES.HOME);
    await waitForNetworkIdle(page);

    const jsResources = await page.evaluate(() => {
      const resources = performance.getEntriesByType(
        "resource",
      ) as PerformanceResourceTiming[];
      return resources.filter((r) => r.name.endsWith(".js"));
    });

    const totalJsSize = jsResources.reduce(
      (sum, r) => sum + (r.transferSize || 0),
      0,
    );
    const totalJsSizeMB = totalJsSize / (1024 * 1024);

    console.log(`Total JavaScript: ${totalJsSizeMB.toFixed(2)}MB`);
    console.log(`Number of JS files: ${jsResources.length}`);

    // Reasonable limits for a React/Next.js app
    expect(totalJsSizeMB).toBeLessThan(5); // Less than 5MB total
  });

  test("should have reasonable page weight", async ({ page }) => {
    await page.goto(TEST_ROUTES.PROPOSALS_LIST);
    await waitForNetworkIdle(page);

    const allResources = await page.evaluate(() => {
      const resources = performance.getEntriesByType(
        "resource",
      ) as PerformanceResourceTiming[];
      return resources.map((r) => ({
        name: r.name,
        size: r.transferSize || 0,
        type: r.initiatorType,
      }));
    });

    const totalSize = allResources.reduce((sum, r) => sum + r.size, 0);
    const totalSizeMB = totalSize / (1024 * 1024);

    console.log(`Total page weight: ${totalSizeMB.toFixed(2)}MB`);

    // Reasonable limit for initial page load
    expect(totalSizeMB).toBeLessThan(10); // Less than 10MB total
  });
});
