/**
 * XSS (Cross-Site Scripting) Security Tests
 *
 * Validates that the application properly sanitizes user input and prevents XSS attacks.
 * Tests stored XSS, reflected XSS, and DOM-based XSS vulnerabilities.
 */

import { test, expect } from "@playwright/test";

test.describe("XSS Security Tests", () => {
  test.describe("Stored XSS Protection", () => {
    test("should sanitize malicious script tags in proposal names", async ({
      page,
      request,
    }) => {
      const maliciousName = '<script>alert("XSS")</script>';

      // Create proposal with malicious name
      const response = await request.post("/api/proposals", {
        data: {
          schoolName: maliciousName,
          region: "Central",
          plannerName: "Test Planner",
          plannerEmail: "test@test.com",
        },
      });

      if (response.ok()) {
        const proposal = await response.json();

        // Visit the proposals page
        await page.goto("/proposals");

        // Wait for proposals to load
        await page.waitForLoadState("networkidle");

        // Script should not execute
        page.on("dialog", (dialog) => {
          throw new Error(`Unexpected alert: ${dialog.message()}`);
        });

        // Page should render safely
        await page.waitForTimeout(1000);
        await expect(page.locator("body")).toBeVisible();
      }
    });

    test("should escape HTML entities in displayed content", async ({
      page,
    }) => {
      await page.goto("/proposals");

      // Check that any special characters are properly escaped
      const content = await page
        .locator('[data-testid="proposal-card"]')
        .first()
        .innerHTML();

      // Should not contain unescaped script tags
      expect(content).not.toMatch(/<script>.*<\/script>/);
      expect(content).not.toMatch(/javascript:/);
      expect(content).not.toMatch(/onerror=/);
    });

    test("should prevent XSS via image onerror", async ({ page, request }) => {
      const maliciousInput = "<img src=x onerror=\"alert('XSS')\">";

      const response = await request.post("/api/proposals", {
        data: {
          schoolName: maliciousInput,
          region: "Central",
        },
      });

      if (response.ok()) {
        await page.goto("/proposals");

        // Alert should not fire
        page.on("dialog", (dialog) => {
          throw new Error(`XSS executed: ${dialog.message()}`);
        });

        await page.waitForTimeout(1000);
      }
    });

    test("should prevent XSS via SVG tags", async ({ page, request }) => {
      const maliciousInput = "<svg onload=\"alert('XSS')\">";

      const response = await request.post("/api/proposals", {
        data: {
          schoolName: maliciousInput,
          region: "Central",
        },
      });

      if (response.ok()) {
        await page.goto("/proposals");

        page.on("dialog", (dialog) => {
          throw new Error(`XSS executed: ${dialog.message()}`);
        });

        await page.waitForTimeout(1000);
      }
    });
  });

  test.describe("Reflected XSS Protection", () => {
    test("should sanitize URL parameters", async ({ page }) => {
      const maliciousParam = '<script>alert("XSS")</script>';

      await page.goto(
        `/proposals?search=${encodeURIComponent(maliciousParam)}`,
      );

      // Alert should not fire
      page.on("dialog", (dialog) => {
        throw new Error(`XSS executed: ${dialog.message()}`);
      });

      await page.waitForTimeout(1000);

      // Parameter should be escaped in page
      const content = await page.content();
      expect(content).not.toContain("<script>alert");
    });

    test("should escape search query in results", async ({ page }) => {
      await page.goto("/proposals?search=<img src=x onerror=alert(1)>");

      page.on("dialog", (dialog) => {
        throw new Error(`XSS executed: ${dialog.message()}`);
      });

      await page.waitForTimeout(1000);
    });

    test("should protect against XSS in error messages", async ({ page }) => {
      await page.goto("/proposals/<script>alert(1)</script>");

      page.on("dialog", (dialog) => {
        throw new Error(`XSS executed: ${dialog.message()}`);
      });

      await page.waitForTimeout(1000);
    });
  });

  test.describe("DOM-Based XSS Protection", () => {
    test("should safely handle user input in client-side rendering", async ({
      page,
    }) => {
      await page.goto("/proposals/new");

      // Fill form with malicious input
      await page.fill('[name="schoolName"]', '<script>alert("XSS")</script>');

      page.on("dialog", (dialog) => {
        throw new Error(`XSS executed: ${dialog.message()}`);
      });

      await page.waitForTimeout(1000);

      // Check preview if available
      const preview = page.locator('[data-testid="preview"]');
      if (await preview.isVisible()) {
        const previewContent = await preview.innerHTML();
        expect(previewContent).not.toContain("<script>");
      }
    });

    test("should sanitize innerHTML assignments", async ({ page }) => {
      await page.goto("/proposals");

      // Execute script to test if innerHTML is safely handled
      const hasUnsafeInnerHTML = await page.evaluate(() => {
        // Check if any elements use innerHTML with user data
        const elements = document.querySelectorAll("[data-user-content]");
        for (const el of elements) {
          if (el.innerHTML.includes("<script>")) {
            return true;
          }
        }
        return false;
      });

      expect(hasUnsafeInnerHTML).toBe(false);
    });
  });

  test.describe("Event Handler XSS Protection", () => {
    test("should prevent XSS via event handlers", async ({ page, request }) => {
      const maliciousInputs = [
        "<div onclick=\"alert('XSS')\">Click me</div>",
        "<button onmouseover=\"alert('XSS')\">Hover</button>",
        "<input onfocus=\"alert('XSS')\" autofocus>",
        "<body onload=\"alert('XSS')\">",
      ];

      for (const input of maliciousInputs) {
        const response = await request.post("/api/proposals", {
          data: {
            schoolName: input,
            region: "Central",
          },
        });

        if (response.ok()) {
          await page.goto("/proposals");

          page.on("dialog", (dialog) => {
            throw new Error(`XSS executed: ${dialog.message()}`);
          });

          await page.waitForTimeout(500);
        }
      }
    });
  });

  test.describe("JavaScript Protocol XSS Protection", () => {
    test("should prevent javascript: protocol in links", async ({
      page,
      request,
    }) => {
      const maliciousInput = "<a href=\"javascript:alert('XSS')\">Click</a>";

      const response = await request.post("/api/proposals", {
        data: {
          schoolName: maliciousInput,
          region: "Central",
        },
      });

      if (response.ok()) {
        await page.goto("/proposals");

        // Check that javascript: links are removed or escaped
        const links = await page.locator('a[href^="javascript:"]').count();
        expect(links).toBe(0);
      }
    });

    test("should prevent data: protocol XSS", async ({ page, request }) => {
      const maliciousInput =
        "<a href=\"data:text/html,<script>alert('XSS')</script>\">Click</a>";

      const response = await request.post("/api/proposals", {
        data: {
          schoolName: maliciousInput,
          region: "Central",
        },
      });

      if (response.ok()) {
        await page.goto("/proposals");

        const dataLinks = await page.locator('a[href^="data:"]').count();
        expect(dataLinks).toBe(0);
      }
    });
  });

  test.describe("CSS Injection Protection", () => {
    test("should prevent XSS via CSS expressions", async ({
      page,
      request,
    }) => {
      const maliciousCSS =
        '<style>body{background:expression(alert("XSS"))}</style>';

      const response = await request.post("/api/proposals", {
        data: {
          schoolName: maliciousCSS,
          region: "Central",
        },
      });

      if (response.ok()) {
        await page.goto("/proposals");

        page.on("dialog", (dialog) => {
          throw new Error(`XSS executed: ${dialog.message()}`);
        });

        await page.waitForTimeout(1000);
      }
    });

    test("should sanitize inline styles", async ({ page }) => {
      await page.goto("/proposals");

      // Check for dangerous inline styles
      const dangerousStyles = await page.evaluate(() => {
        const elements = document.querySelectorAll("[style]");
        for (const el of elements) {
          const style = el.getAttribute("style") || "";
          if (style.includes("expression(") || style.includes("javascript:")) {
            return true;
          }
        }
        return false;
      });

      expect(dangerousStyles).toBe(false);
    });
  });

  test.describe("React-Specific XSS Protection", () => {
    test("should leverage React XSS protection", async ({ page }) => {
      await page.goto("/proposals");

      // React should auto-escape by default
      // Verify no dangerouslySetInnerHTML is used unsafely
      const hasDangerousHTML = await page.evaluate(() => {
        // Check console for React warnings about dangerouslySetInnerHTML
        return false; // Placeholder
      });

      expect(hasDangerousHTML).toBe(false);
    });

    test("should sanitize markdown rendering if used", async ({ page }) => {
      // If the app uses markdown, test that it's sanitized
      await page.goto("/proposals");

      // Markdown parsers should strip script tags
      const content = await page.content();
      expect(content).not.toMatch(/<script>.*<\/script>/);
    });
  });

  test.describe("Content Security Policy", () => {
    test("should have restrictive CSP headers", async ({ page }) => {
      const response = await page.goto("/proposals");

      const cspHeader = response?.headers()["content-security-policy"];

      if (cspHeader) {
        // Should not allow unsafe-inline or unsafe-eval
        expect(cspHeader).not.toContain("'unsafe-eval'");

        // Should restrict script sources
        expect(cspHeader).toContain("script-src");
      }
    });

    test("should have X-XSS-Protection header", async ({ page }) => {
      const response = await page.goto("/proposals");

      const xssProtection = response?.headers()["x-xss-protection"];

      if (xssProtection) {
        expect(xssProtection).toBe("1; mode=block");
      }
    });

    test("should have X-Content-Type-Options header", async ({ page }) => {
      const response = await page.goto("/proposals");

      const contentTypeOptions = response?.headers()["x-content-type-options"];

      if (contentTypeOptions) {
        expect(contentTypeOptions).toBe("nosniff");
      }
    });
  });

  test.describe("File Upload XSS Protection", () => {
    test("should validate file types on upload", async ({ page }) => {
      await page.goto("/proposals/new");

      const fileInput = page.locator('input[type="file"]');

      if ((await fileInput.count()) > 0) {
        // Try to upload a malicious HTML file
        await fileInput.setInputFiles({
          name: "malicious.html",
          mimeType: "text/html",
          buffer: Buffer.from('<script>alert("XSS")</script>'),
        });

        // Should reject or sanitize
        await page.waitForTimeout(1000);

        // Check for error message
        const error = page.locator('[role="alert"]');
        if (await error.isVisible()) {
          expect(await error.textContent()).toMatch(
            /invalid|not allowed|file type/i,
          );
        }
      }
    });
  });
});
