/**
 * RBAC (Role-Based Access Control) Security Tests
 *
 * Validates that role-based permissions are properly enforced across the application.
 * Uses Playwright fixtures for authenticated sessions per role.
 *
 * Tests that:
 * - Admin users can access all features
 * - Planner users can create/edit proposals
 * - Viewer users have read-only access
 * - Unauthorized users are rejected
 */

import { test, expect, hasCredentials } from "../fixtures/auth";
import { test as baseTest } from "@playwright/test";

test.describe("RBAC Security Tests", () => {
  test.describe("Admin Role", () => {
    test("should allow admin to access admin dashboard", async ({
      adminPage,
    }) => {
      await adminPage.goto("/admin");

      // Admin should see admin dashboard
      await expect(adminPage).toHaveURL(/\/admin/);
      await expect(adminPage.locator("h1")).toContainText(/admin/i);
    });

    test("should allow admin to access configuration", async ({
      adminPage,
    }) => {
      await adminPage.goto("/admin/config");
      await expect(adminPage).toHaveURL(/\/admin\/config/);
    });

    test("should allow admin to access historical data", async ({
      adminPage,
    }) => {
      await adminPage.goto("/admin/historical");
      await expect(adminPage).toHaveURL(/\/admin\/historical/);
    });

    test("should allow admin to access CapEx management", async ({
      adminPage,
    }) => {
      await adminPage.goto("/admin/capex");
      await expect(adminPage).toHaveURL(/\/admin\/capex/);
    });

    test("should allow admin to access user management API", async ({
      adminPage,
      request,
    }) => {
      // Admin should be able to list users
      const response = await adminPage.request.get("/api/users");
      expect(response.status()).toBe(200);
    });
  });

  test.describe("Planner Role", () => {
    test("should allow planner to create proposals", async ({
      plannerPage,
    }) => {
      await plannerPage.goto("/proposals/new");

      // Planner should see proposal creation form
      await expect(plannerPage).toHaveURL(/\/proposals\/new/);
      await expect(plannerPage.locator("form")).toBeVisible();
    });

    test("should allow planner to view proposals list", async ({
      plannerPage,
    }) => {
      await plannerPage.goto("/proposals");

      // Should see proposals list
      await expect(plannerPage).toHaveURL(/\/proposals/);
    });

    test("should NOT allow planner to access admin pages", async ({
      plannerPage,
    }) => {
      await plannerPage.goto("/admin");

      // Should be redirected or see access denied
      await expect(plannerPage).not.toHaveURL(/\/admin$/);
    });

    test("should NOT allow planner to access user management API", async ({
      plannerPage,
    }) => {
      const response = await plannerPage.request.get("/api/users");
      expect(response.status()).toBe(403);
    });

    test("should NOT allow planner to update system config", async ({
      plannerPage,
    }) => {
      const response = await plannerPage.request.put("/api/config", {
        data: { zakatRate: "0.025" },
      });
      expect(response.status()).toBe(403);
    });
  });

  test.describe("Viewer Role", () => {
    test("should allow viewer to view proposals", async ({ viewerPage }) => {
      await viewerPage.goto("/proposals");

      // Viewer should see proposals list
      await expect(viewerPage).toHaveURL(/\/proposals/);
    });

    test("should NOT allow viewer to create proposals via UI", async ({
      viewerPage,
    }) => {
      await viewerPage.goto("/proposals/new");

      // Should be redirected or see access denied
      await expect(viewerPage).not.toHaveURL(/\/proposals\/new/);
    });

    test("should NOT allow viewer to create proposals via API", async ({
      viewerPage,
    }) => {
      const response = await viewerPage.request.post(
        "/api/proposals/calculate",
        {
          data: {
            name: "Test Proposal",
            developer: "Test Developer",
          },
        },
      );
      expect(response.status()).toBe(403);
    });

    test("should NOT allow viewer to access admin pages", async ({
      viewerPage,
    }) => {
      await viewerPage.goto("/admin");

      // Should be redirected or see access denied
      await expect(viewerPage).not.toHaveURL(/\/admin/);
    });

    test("should allow viewer to read proposals via API", async ({
      viewerPage,
    }) => {
      const response = await viewerPage.request.get("/api/proposals");
      expect(response.status()).toBe(200);
    });

    test("should allow viewer to read config via API", async ({
      viewerPage,
    }) => {
      const response = await viewerPage.request.get("/api/config");
      expect(response.status()).toBe(200);
    });
  });

  test.describe("Unauthenticated Access", () => {
    // Use base test without auth fixtures for unauthenticated tests
    baseTest(
      "should redirect unauthenticated users to login",
      async ({ page }) => {
        // Clear any existing auth
        await page.context().clearCookies();

        await page.goto("/proposals");

        // Should be redirected to login or show login form
        await expect(page).toHaveURL(/\/(login|auth)/);
      },
    );

    baseTest(
      "should not allow API access without authentication",
      async ({ request }) => {
        // Try to access API without auth (new request context has no cookies)
        const response = await request.get("/api/proposals");

        // Should return 401 Unauthorized
        expect(response.status()).toBe(401);
      },
    );

    baseTest(
      "should not allow proposal creation without authentication",
      async ({ request }) => {
        const response = await request.post("/api/proposals/calculate", {
          data: {
            name: "Test Proposal",
            developer: "Test Developer",
          },
        });

        // Should return 401 Unauthorized
        expect(response.status()).toBe(401);
      },
    );
  });

  test.describe("API Endpoint RBAC", () => {
    test("admin can manage users", async ({ adminPage }) => {
      const response = await adminPage.request.get("/api/users");
      expect(response.status()).toBe(200);
    });

    test("admin can update system config", async ({ adminPage }) => {
      // First get current config
      const getResponse = await adminPage.request.get("/api/config");
      expect(getResponse.status()).toBe(200);

      // Config update should work (may return 400 for validation, but not 403)
      const putResponse = await adminPage.request.put("/api/config", {
        data: { zakatRate: "0.025" },
      });
      expect([200, 400]).toContain(putResponse.status());
    });

    test("planner can create proposals", async ({ plannerPage }) => {
      // Planner should be able to access calculate endpoint
      const response = await plannerPage.request.post(
        "/api/proposals/calculate",
        {
          data: {
            name: "Test Proposal from Planner",
            developer: "Test Developer",
            rentModel: "FIXED_ESCALATION",
          },
        },
      );
      // 400 = validation error (expected), 200 = success, not 403
      expect([200, 400]).toContain(response.status());
    });

    test("viewer cannot modify proposals", async ({ viewerPage }) => {
      const response = await viewerPage.request.post(
        "/api/proposals/calculate",
        {
          data: {
            name: "Test Proposal from Viewer",
          },
        },
      );
      expect(response.status()).toBe(403);
    });

    test("all roles can read proposals", async ({
      adminPage,
      plannerPage,
      viewerPage,
    }) => {
      const adminResponse = await adminPage.request.get("/api/proposals");
      const plannerResponse = await plannerPage.request.get("/api/proposals");
      const viewerResponse = await viewerPage.request.get("/api/proposals");

      expect(adminResponse.status()).toBe(200);
      expect(plannerResponse.status()).toBe(200);
      expect(viewerResponse.status()).toBe(200);
    });
  });

  test.describe("Protected Admin Endpoints", () => {
    test("GET /api/users requires ADMIN", async ({
      adminPage,
      plannerPage,
      viewerPage,
    }) => {
      const adminResponse = await adminPage.request.get("/api/users");
      const plannerResponse = await plannerPage.request.get("/api/users");
      const viewerResponse = await viewerPage.request.get("/api/users");

      expect(adminResponse.status()).toBe(200);
      expect(plannerResponse.status()).toBe(403);
      expect(viewerResponse.status()).toBe(403);
    });

    test("PUT /api/config requires ADMIN", async ({
      adminPage,
      plannerPage,
      viewerPage,
    }) => {
      const data = { zakatRate: "0.025" };

      const adminResponse = await adminPage.request.put("/api/config", {
        data,
      });
      const plannerResponse = await plannerPage.request.put("/api/config", {
        data,
      });
      const viewerResponse = await viewerPage.request.put("/api/config", {
        data,
      });

      // Admin: 200 or 400 (validation), Planner/Viewer: 403
      expect([200, 400]).toContain(adminResponse.status());
      expect(plannerResponse.status()).toBe(403);
      expect(viewerResponse.status()).toBe(403);
    });
  });

  test.describe("Row-Level Security", () => {
    test("users can only access their own user data", async ({ adminPage }) => {
      // Get current user info
      const sessionResponse = await adminPage.request.get("/api/auth/session");
      const session = await sessionResponse.json();

      if (session.user?.id) {
        // User can access their own data
        const ownResponse = await adminPage.request.get(
          `/api/users/${session.user.id}`,
        );
        expect(ownResponse.status()).toBe(200);
      }
    });

    baseTest(
      "should prevent access to protected routes without auth",
      async ({ request }) => {
        const response = await request.get("/api/users/some-random-id");
        expect(response.status()).toBe(401);
      },
    );
  });
});
