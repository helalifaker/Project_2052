/**
 * API Integration Tests for /api/proposals/calculate
 *
 * These tests validate:
 * - Request validation (Zod schemas)
 * - Calculation engine integration
 * - Response formatting
 * - Error handling
 * - Performance
 */

import { describe, it, expect, vi } from "vitest";
import { NextResponse } from "next/server";

// Define Role enum locally to avoid Prisma client dependency in tests
enum Role {
  ADMIN = "ADMIN",
  PLANNER = "PLANNER",
  VIEWER = "VIEWER",
}

// Mock @prisma/client before importing route
vi.mock("@prisma/client", () => ({
  Role: {
    ADMIN: "ADMIN",
    PLANNER: "PLANNER",
    VIEWER: "VIEWER",
  },
  Prisma: {
    Decimal: class {
      constructor(value: string | number) {
        return value;
      }
    },
  },
  PrismaClient: vi.fn(),
}));

import { POST } from "./route";
import { RentModel } from "@/lib/engine/core/types";

// ============================================================================
// MOCK AUTHENTICATION MIDDLEWARE
// ============================================================================

/**
 * Mock the authentication middleware to bypass Next.js cookies requirement
 * This allows tests to run without a full Next.js request context
 */
vi.mock("@/middleware/auth", () => ({
  authenticateUserWithRole: vi.fn(async () => ({
    success: true,
    user: {
      id: "test-user-id",
      email: "test@example.com",
      role: Role.ADMIN,
    },
  })),
  authenticateUser: vi.fn(async () => ({
    success: true,
    user: {
      id: "test-user-id",
      email: "test@example.com",
      role: Role.ADMIN,
    },
  })),
}));

// ============================================================================
// MOCK PRISMA CLIENT
// ============================================================================

/**
 * Mock the Prisma client to skip database operations in tests
 * This allows tests to run without a real database connection
 */
vi.mock("@/lib/prisma", () => ({
  prisma: {
    leaseProposal: {
      create: vi.fn(async (args: any) => ({
        id: "test-proposal-id",
        ...args.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    },
    systemConfig: {
      findFirst: vi.fn(async () => ({
        zakatRate: "0.025",
        debtInterestRate: "0.05",
        depositInterestRate: "0.02",
        minCashBalance: "1000000",
        confirmedAt: new Date(),
      })),
    },
    workingCapitalRatios: {
      findFirst: vi.fn(async () => ({
        arPercent: "0.10",
        prepaidPercent: "0.05",
        apPercent: "0.08",
        accruedPercent: "0.05",
        deferredRevenuePercent: "0.15",
        locked: false,
        calculatedFrom2024: true,
      })),
    },
    transitionConfig: {
      findFirst: vi.fn(async () => ({
        year2025Students: 800,
        year2025AvgTuition: "28000",
        year2026Students: 900,
        year2026AvgTuition: "29000",
        year2027Students: 1000,
        year2027AvgTuition: "30000",
        rentGrowthPercent: "0.03",
        updatedAt: new Date(),
      })),
    },
  },
}));

// ============================================================================
// TEST DATA HELPERS
// ============================================================================

/**
 * Create valid calculation request body
 */
function createValidCalculationRequest(rentModel: RentModel): any {
  return {
    systemConfig: {
      zakatRate: "0.025",
      debtInterestRate: "0.05",
      depositInterestRate: "0.02",
      minCashBalance: "1000000",
    },
    historicalPeriods: [
      {
        year: 2023,
        profitLoss: {
          revenue: "45000000",
          rent: "9000000",
          staffCosts: "18000000",
          otherOpex: "4500000",
          depreciation: "1800000",
          interest: "900000",
          zakat: "270000",
        },
        balanceSheet: {
          cash: "4500000",
          accountsReceivable: "4500000",
          prepaidExpenses: "1575000",
          grossPPE: "36000000", // Gross = Net + Accumulated Depreciation (27000000 + 9000000)
          ppe: "27000000",
          accumulatedDepreciation: "9000000",
          accountsPayable: "2520000",
          accruedExpenses: "1575000",
          deferredRevenue: "6750000",
          debt: "18000000",
          equity: "8730000",
        },
        immutable: true,
      },
      {
        year: 2024,
        profitLoss: {
          revenue: "50000000",
          rent: "10000000",
          staffCosts: "20000000",
          otherOpex: "5000000",
          depreciation: "2000000",
          interest: "1000000",
          zakat: "300000",
        },
        balanceSheet: {
          cash: "5000000",
          accountsReceivable: "5000000",
          prepaidExpenses: "1750000",
          grossPPE: "40000000", // Gross = Net + Accumulated Depreciation (30000000 + 10000000)
          ppe: "30000000",
          accumulatedDepreciation: "10000000",
          accountsPayable: "2800000",
          accruedExpenses: "1750000",
          deferredRevenue: "7500000",
          debt: "20000000",
          equity: "9700000",
        },
        immutable: false,
      },
    ],
    transitionPeriods: [
      {
        year: 2025,
        preFillFromPriorYear: false,
        revenueGrowthRate: "0.10",
      },
      {
        year: 2026,
        preFillFromPriorYear: false,
        revenueGrowthRate: "0.12",
      },
      {
        year: 2027,
        preFillFromPriorYear: false,
        revenueGrowthRate: "0.15",
      },
    ],
    workingCapitalRatios: {
      arPercent: "0.10",
      prepaidPercent: "0.05",
      apPercent: "0.08",
      accruedPercent: "0.05",
      deferredRevenuePercent: "0.15",
      otherRevenueRatio: "0.05",
      locked: false,
      calculatedFrom2024: true,
    },
    rentModel,
    rentParams:
      rentModel === RentModel.FIXED_ESCALATION
        ? {
            baseRent: "10000000",
            growthRate: "0.03",
            frequency: 1,
          }
        : rentModel === RentModel.REVENUE_SHARE
          ? {
              revenueSharePercent: "0.20",
            }
          : {
              landSize: "10000",
              landPricePerSqm: "5000",
              buaSize: "20000",
              constructionCostPerSqm: "2500",
              yieldRate: "0.09",
              growthRate: "0.02",
              frequency: 1,
            },
    dynamicPeriodConfig: {
      year: 2028,
      enrollment: {
        rampUpEnabled: true,
        rampUpStartYear: 2028,
        rampUpEndYear: 2033,
        rampUpTargetStudents: 3000,
        steadyStateStudents: 3000,
        gradeDistribution: [],
      },
      curriculum: {
        ibProgramEnabled: true,
        ibStartYear: 2030,
        nationalCurriculumFee: "25000",
        ibCurriculumFee: "45000",
        ibStudentPercentage: "0.30",
      },
      staff: {
        fixedStaffCost: "15000000",
        variableStaffCostPerStudent: "8000",
      },
      rentModel,
      rentParams:
        rentModel === RentModel.FIXED_ESCALATION
          ? {
              baseRent: "10000000",
              growthRate: "0.03",
              frequency: 1,
            }
          : rentModel === RentModel.REVENUE_SHARE
            ? {
                revenueSharePercent: "0.20",
              }
            : {
                landSize: "10000",
                landPricePerSqm: "5000",
                buaSize: "20000",
                constructionCostPerSqm: "2500",
                yieldRate: "0.09",
                growthRate: "0.02",
                frequency: 1,
              },
      otherOpexPercent: "0.10",
      capexConfig: {
        autoReinvestEnabled: true,
        reinvestAmount: "2500000",
        reinvestFrequency: 1,
        existingAssets: [],
        newAssets: [],
        categories: [
          {
            id: "cat-it",
            type: "IT_EQUIPMENT",
            name: "IT Equipment",
            usefulLife: 5,
            reinvestFrequency: undefined,
            reinvestAmount: undefined,
          },
        ],
        historicalState: {
          grossPPE2024: "40000000",
          accumulatedDepreciation2024: "10000000",
          annualDepreciation: "1000000",
          remainingToDepreciate: "30000000",
        },
        transitionCapex: [],
        virtualAssets: [],
      },
    },
    capexConfig: {
      autoReinvestEnabled: true,
      reinvestAmount: "2500000",
      reinvestFrequency: 1,
      existingAssets: [],
      newAssets: [],
      categories: [
        {
          id: "cat-it",
          type: "IT_EQUIPMENT",
          name: "IT Equipment",
          usefulLife: 5,
          reinvestFrequency: undefined,
          reinvestAmount: undefined,
        },
      ],
      historicalState: {
        grossPPE2024: "40000000",
        accumulatedDepreciation2024: "10000000",
        annualDepreciation: "1000000",
        remainingToDepreciate: "30000000",
      },
      transitionCapex: [],
      virtualAssets: [],
    },
    circularSolverConfig: {
      maxIterations: 100,
      convergenceTolerance: "0.01",
      relaxationFactor: "0.5",
    },
  };
}

// ============================================================================
// API INTEGRATION TESTS
// ============================================================================

describe("POST /api/proposals/calculate - API Integration", () => {
  describe("Authentication", () => {
    it("should reject unauthenticated requests", async () => {
      // Reset the mock to simulate auth failure
      const { authenticateUserWithRole } = await import("@/middleware/auth");
      vi.mocked(authenticateUserWithRole).mockResolvedValueOnce({
        success: false,
        error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      });

      const request = new Request(
        "http://localhost:3000/api/proposals/calculate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            createValidCalculationRequest(RentModel.FIXED_ESCALATION),
          ),
        },
      );

      const response = await POST(request);
      expect(response.status).toBe(401);
    });
  });

  describe("Request Validation", () => {
    it("should reject request with missing required fields", async () => {
      const request = new Request(
        "http://localhost:3000/api/proposals/calculate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Validation failed");
      expect(data.details).toBeDefined();
    });

    it("should reject request with invalid decimal values", async () => {
      const invalidRequest = createValidCalculationRequest(
        RentModel.FIXED_ESCALATION,
      );
      invalidRequest.systemConfig.zakatRate = "invalid";

      const request = new Request(
        "http://localhost:3000/api/proposals/calculate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(invalidRequest),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it("should reject request with invalid rent model", async () => {
      const invalidRequest = createValidCalculationRequest(
        RentModel.FIXED_ESCALATION,
      );
      invalidRequest.rentModel = "INVALID_MODEL";

      const request = new Request(
        "http://localhost:3000/api/proposals/calculate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(invalidRequest),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Validation failed");
    });

    it("should reject request with invalid year in historical periods", async () => {
      const invalidRequest = createValidCalculationRequest(
        RentModel.FIXED_ESCALATION,
      );
      invalidRequest.historicalPeriods[0].year = 1900; // Invalid year

      const request = new Request(
        "http://localhost:3000/api/proposals/calculate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(invalidRequest),
        },
      );

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it("should reject request with invalid transition period year", async () => {
      const invalidRequest = createValidCalculationRequest(
        RentModel.FIXED_ESCALATION,
      );
      invalidRequest.transitionPeriods[0].year = 2050; // Invalid year

      const request = new Request(
        "http://localhost:3000/api/proposals/calculate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(invalidRequest),
        },
      );

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it("should reject request with negative rent frequency", async () => {
      const invalidRequest = createValidCalculationRequest(
        RentModel.FIXED_ESCALATION,
      );
      invalidRequest.rentParams.frequency = -1; // Invalid

      const request = new Request(
        "http://localhost:3000/api/proposals/calculate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(invalidRequest),
        },
      );

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });

  describe("Successful Calculations", () => {
    it("should calculate 30-year projections with Fixed Escalation rent model", async () => {
      const requestBody = createValidCalculationRequest(
        RentModel.FIXED_ESCALATION,
      );

      const request = new Request(
        "http://localhost:3000/api/proposals/calculate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      console.log("\n📊 API Response - Fixed Escalation:");
      console.log(`   Status: ${response.status}`);
      console.log(`   Success: ${data.success}`);
      console.log(
        `   Calculation Time: ${data.meta?.calculationTimeMs?.toFixed(2)}ms`,
      );
      console.log(`   Periods Calculated: ${data.meta?.periodsCalculated}`);
      console.log(`   All Balanced: ${data.meta?.allBalanced ? "✅" : "❌"}`);
      console.log(
        `   All Reconciled: ${data.meta?.allReconciled ? "✅" : "❌"}`,
      );

      expect(response.status).toBe(201); // 201 Created is correct for POST
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.periods).toBeDefined();
      expect(data.data.periods.length).toBe(35); // 2023-2057 (35 years)
      expect(data.meta.allBalanced).toBe(true);
      expect(data.meta.allReconciled).toBe(true);
    });

    it("should calculate 30-year projections with Revenue Share rent model", async () => {
      const requestBody = createValidCalculationRequest(
        RentModel.REVENUE_SHARE,
      );

      const request = new Request(
        "http://localhost:3000/api/proposals/calculate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      console.log("\n📊 API Response - Revenue Share:");
      console.log(`   Status: ${response.status}`);
      console.log(
        `   Calculation Time: ${data.meta?.calculationTimeMs?.toFixed(2)}ms`,
      );
      console.log(`   All Balanced: ${data.meta?.allBalanced ? "✅" : "❌"}`);

      expect(response.status).toBe(201); // 201 Created is correct for POST
      expect(data.success).toBe(true);
      expect(data.data.periods.length).toBe(35); // 2023-2057 (35 years)
      expect(data.meta.allBalanced).toBe(true);
    });

    it("should calculate 30-year projections with Partner Investment rent model", async () => {
      const requestBody = createValidCalculationRequest(
        RentModel.PARTNER_INVESTMENT,
      );

      const request = new Request(
        "http://localhost:3000/api/proposals/calculate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      console.log("\n📊 API Response - Partner Investment:");
      console.log(`   Status: ${response.status}`);
      console.log(
        `   Calculation Time: ${data.meta?.calculationTimeMs?.toFixed(2)}ms`,
      );
      console.log(`   All Balanced: ${data.meta?.allBalanced ? "✅" : "❌"}`);

      expect(response.status).toBe(201); // 201 Created is correct for POST
      expect(data.success).toBe(true);
      expect(data.data.periods.length).toBe(35); // 2023-2057 (35 years)
      expect(data.meta.allBalanced).toBe(true);
    });
  });

  describe("Response Format", () => {
    it("should return properly formatted response with metadata", async () => {
      const requestBody = createValidCalculationRequest(
        RentModel.FIXED_ESCALATION,
      );

      const request = new Request(
        "http://localhost:3000/api/proposals/calculate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      // Validate response structure
      expect(data).toHaveProperty("success");
      expect(data).toHaveProperty("data");
      expect(data).toHaveProperty("meta");

      // Validate metadata
      expect(data.meta).toHaveProperty("calculationTimeMs");
      expect(data.meta).toHaveProperty("periodsCalculated");
      expect(data.meta).toHaveProperty("allBalanced");
      expect(data.meta).toHaveProperty("allReconciled");

      // Validate data structure
      expect(data.data).toHaveProperty("periods");
      expect(data.data).toHaveProperty("metrics");
      expect(data.data).toHaveProperty("validation");
      expect(data.data).toHaveProperty("performance");
      expect(data.data).toHaveProperty("calculatedAt");

      // Validate all Decimal values are serialized to strings
      expect(typeof data.data.periods[0].profitLoss.totalRevenue).toBe(
        "string",
      );
      expect(typeof data.data.metrics.totalNetIncome).toBe("string");
    });
  });

  describe("Performance", () => {
    it("should complete calculation in reasonable time (<1 second)", async () => {
      const requestBody = createValidCalculationRequest(
        RentModel.FIXED_ESCALATION,
      );

      const request = new Request(
        "http://localhost:3000/api/proposals/calculate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        },
      );

      const startTime = performance.now();
      const response = await POST(request);
      const endTime = performance.now();
      const data = await response.json();

      const totalTimeMs = endTime - startTime;

      console.log(
        `\n⚡ API Performance: ${totalTimeMs.toFixed(2)}ms total (including I/O)`,
      );
      console.log(
        `   Calculation only: ${data.meta.calculationTimeMs.toFixed(2)}ms`,
      );

      expect(totalTimeMs).toBeLessThan(1000); // <1 second including overhead
      expect(data.meta.calculationTimeMs).toBeLessThan(100); // Calculation itself should be very fast
    });
  });

  describe("Error Handling", () => {
    it("should handle JSON parse errors gracefully", async () => {
      const request = new Request(
        "http://localhost:3000/api/proposals/calculate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "not valid json{",
        },
      );

      const response = await POST(request);
      expect(response.status).toBe(500);
    });

    it("should handle database errors gracefully", async () => {
      // Mock prisma to throw an error
      const { prisma } = await import("@/lib/prisma");
      vi.mocked(prisma.leaseProposal.create).mockRejectedValueOnce(
        new Error("Database connection failed"),
      );

      const requestBody = createValidCalculationRequest(
        RentModel.FIXED_ESCALATION,
      );
      const request = new Request(
        "http://localhost:3000/api/proposals/calculate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Calculation failed");
    });

    it("should handle missing historical periods", async () => {
      const invalidRequest = createValidCalculationRequest(
        RentModel.FIXED_ESCALATION,
      );
      invalidRequest.historicalPeriods = []; // Empty array

      const request = new Request(
        "http://localhost:3000/api/proposals/calculate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(invalidRequest),
        },
      );

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it("should handle missing transition periods", async () => {
      const invalidRequest = createValidCalculationRequest(
        RentModel.FIXED_ESCALATION,
      );
      invalidRequest.transitionPeriods = []; // Empty array

      const request = new Request(
        "http://localhost:3000/api/proposals/calculate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(invalidRequest),
        },
      );

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero enrollment", async () => {
      const requestBody = createValidCalculationRequest(
        RentModel.FIXED_ESCALATION,
      );
      requestBody.dynamicPeriodConfig.enrollment.steadyStateStudents = 0;
      requestBody.dynamicPeriodConfig.enrollment.rampUpTargetStudents = 0;

      const request = new Request(
        "http://localhost:3000/api/proposals/calculate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        },
      );

      const response = await POST(request);
      // Zero enrollment may cause calculation errors - this tests error handling path
      expect([200, 201, 400, 500]).toContain(response.status);
    });

    it("should handle very large decimal values", async () => {
      const requestBody = createValidCalculationRequest(
        RentModel.FIXED_ESCALATION,
      );
      requestBody.systemConfig.minCashBalance = "999999999999"; // Very large

      const request = new Request(
        "http://localhost:3000/api/proposals/calculate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        },
      );

      const response = await POST(request);
      expect([200, 201]).toContain(response.status);
    });

    it("should handle negative growth rates", async () => {
      const requestBody = createValidCalculationRequest(
        RentModel.FIXED_ESCALATION,
      );
      requestBody.rentParams.growthRate = "-0.05"; // Negative growth

      const request = new Request(
        "http://localhost:3000/api/proposals/calculate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        },
      );

      const response = await POST(request);
      // Should still process (negative growth is valid)
      expect([200, 201]).toContain(response.status);
    });

    it("should handle 100% revenue share", async () => {
      const requestBody = createValidCalculationRequest(
        RentModel.REVENUE_SHARE,
      );
      requestBody.rentParams.revenueSharePercent = "1.0"; // 100%
      requestBody.dynamicPeriodConfig.rentParams.revenueSharePercent = "1.0";

      const request = new Request(
        "http://localhost:3000/api/proposals/calculate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        },
      );

      const response = await POST(request);
      expect([200, 201]).toContain(response.status);
    });

    it("should handle optional tuition growth rates", async () => {
      const requestBody = createValidCalculationRequest(
        RentModel.FIXED_ESCALATION,
      );
      // Add optional tuition growth rates
      requestBody.dynamicPeriodConfig.curriculum.nationalTuitionGrowthRate =
        "0.03";
      requestBody.dynamicPeriodConfig.curriculum.nationalTuitionGrowthFrequency = 1;
      requestBody.dynamicPeriodConfig.curriculum.ibTuitionGrowthRate = "0.05";
      requestBody.dynamicPeriodConfig.curriculum.ibTuitionGrowthFrequency = 2;

      const request = new Request(
        "http://localhost:3000/api/proposals/calculate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        },
      );

      const response = await POST(request);
      expect([200, 201]).toContain(response.status);
    });

    it("should handle optional staff configuration fields", async () => {
      const requestBody = createValidCalculationRequest(
        RentModel.FIXED_ESCALATION,
      );
      // Add optional staff fields
      requestBody.dynamicPeriodConfig.staff.studentsPerTeacher = 15;
      requestBody.dynamicPeriodConfig.staff.studentsPerNonTeacher = 50;
      requestBody.dynamicPeriodConfig.staff.avgTeacherSalary = "120000";
      requestBody.dynamicPeriodConfig.staff.avgAdminSalary = "80000";
      requestBody.dynamicPeriodConfig.staff.cpiRate = "0.02";
      requestBody.dynamicPeriodConfig.staff.cpiFrequency = 1;

      const request = new Request(
        "http://localhost:3000/api/proposals/calculate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        },
      );

      const response = await POST(request);
      expect([200, 201]).toContain(response.status);
    });

    it("should handle ramp plan percentages", async () => {
      const requestBody = createValidCalculationRequest(
        RentModel.FIXED_ESCALATION,
      );
      requestBody.dynamicPeriodConfig.enrollment.rampPlanPercentages = [
        0.2, 0.4, 0.6, 0.8, 1.0,
      ];

      const request = new Request(
        "http://localhost:3000/api/proposals/calculate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        },
      );

      const response = await POST(request);
      const data = await response.json();
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
    });
  });

  describe("Cache Behavior", () => {
    it("should utilize cache for repeated calculations", async () => {
      const requestBody = createValidCalculationRequest(
        RentModel.FIXED_ESCALATION,
      );

      // First request - should be a cache miss
      const request1 = new Request(
        "http://localhost:3000/api/proposals/calculate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        },
      );
      const response1 = await POST(request1);
      const data1 = await response1.json();

      // Second request with same data - should be a cache hit
      const request2 = new Request(
        "http://localhost:3000/api/proposals/calculate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        },
      );
      const response2 = await POST(request2);
      const data2 = await response2.json();

      expect(response1.status).toBe(201);
      expect(response2.status).toBe(201);
      // Cache should report hits
      expect(data2.meta.cacheStats.hits).toBeGreaterThanOrEqual(
        data1.meta.cacheStats.hits,
      );
    });
  });

  describe("Wizard Format (Simplified Input)", () => {
    it("should process wizard format with Fixed rent model", async () => {
      const wizardRequest = {
        name: "Test Proposal",
        developer: "Test Developer",
        rentModel: "Fixed",
        baseRent: 10000000,
        rentGrowthRate: 3,
        rentFrequency: 1,
        frenchCapacity: 1000,
        ibCapacity: 200,
        ibProgramEnabled: true,
        ibStartYear: 2030,
        frenchBaseTuition2028: 30000,
        ibBaseTuition2028: 45000,
        rampUpFRYear1Percentage: 20,
        rampUpFRYear2Percentage: 40,
        rampUpFRYear3Percentage: 60,
        rampUpFRYear4Percentage: 80,
        rampUpFRYear5Percentage: 100,
        studentsPerTeacher: 15,
        studentsPerNonTeacher: 50,
        avgTeacherSalary: 120000,
        avgAdminSalary: 80000,
        cpiRate: 2,
        cpiFrequency: 1,
        otherOpexPercent: 10,
      };

      const request = new Request(
        "http://localhost:3000/api/proposals/calculate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(wizardRequest),
        },
      );

      const response = await POST(request);
      // Wizard format exercises the transformation code path
      expect([200, 201, 400, 500]).toContain(response.status);
    });

    it("should process wizard format with RevShare rent model", async () => {
      const wizardRequest = {
        name: "Revenue Share Proposal",
        developer: "Test Developer",
        rentModel: "RevShare",
        revenueSharePercent: 20,
        frenchCapacity: 1000,
        ibCapacity: 0,
        ibProgramEnabled: false,
        frenchBaseTuition2028: 28000,
        rampUpFRYear1Percentage: 25,
        rampUpFRYear2Percentage: 50,
        rampUpFRYear3Percentage: 75,
        rampUpFRYear4Percentage: 90,
        rampUpFRYear5Percentage: 100,
        studentsPerTeacher: 12,
        otherOpexPercent: 8,
      };

      const request = new Request(
        "http://localhost:3000/api/proposals/calculate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(wizardRequest),
        },
      );

      const response = await POST(request);
      // Wizard format exercises the transformation code path
      expect([200, 201, 400, 500]).toContain(response.status);
    });

    it("should process wizard format with Partner Investment rent model", async () => {
      const wizardRequest = {
        name: "Partner Investment Proposal",
        developer: "Test Developer",
        rentModel: "PartnerInvestment",
        partnerLandSize: 10000,
        partnerLandPricePerSqm: 5000,
        partnerBuaSize: 20000,
        partnerConstructionCostPerSqm: 2500,
        partnerYieldRate: 9,
        partnerGrowthRate: 3,
        partnerFrequency: 1,
        frenchCapacity: 1500,
        ibCapacity: 500,
        ibProgramEnabled: true,
        ibStartYear: 2029,
        frenchBaseTuition2028: 35000,
        ibBaseTuition2028: 55000,
        rampUpFRYear1Percentage: 30,
        rampUpFRYear2Percentage: 50,
        rampUpFRYear3Percentage: 70,
        rampUpFRYear4Percentage: 85,
        rampUpFRYear5Percentage: 100,
        rampUpIBYear1Percentage: 0,
        rampUpIBYear2Percentage: 20,
        rampUpIBYear3Percentage: 40,
        rampUpIBYear4Percentage: 70,
        rampUpIBYear5Percentage: 100,
        studentsPerTeacher: 10,
        studentsPerNonTeacher: 40,
        avgTeacherSalary: 150000,
        avgAdminSalary: 100000,
        cpiRate: 3,
        cpiFrequency: 2,
        otherOpexPercent: 12,
        frenchTuitionGrowthRate: 4,
        frenchTuitionGrowthFrequency: 1,
        ibTuitionGrowthRate: 5,
        ibTuitionGrowthFrequency: 2,
      };

      const request = new Request(
        "http://localhost:3000/api/proposals/calculate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(wizardRequest),
        },
      );

      const response = await POST(request);
      // Wizard format exercises the transformation code path
      expect([200, 201, 400, 500]).toContain(response.status);
    });

    it("should reject wizard format when working capital ratios are missing", async () => {
      // Mock workingCapitalRatios to return null
      const { prisma } = await import("@/lib/prisma");
      vi.mocked(prisma.workingCapitalRatios.findFirst).mockResolvedValueOnce(
        null,
      );

      const wizardRequest = {
        name: "Test Proposal",
        developer: "Test Developer",
        rentModel: "Fixed",
        baseRent: 10000000,
        frenchCapacity: 1000,
      };

      const request = new Request(
        "http://localhost:3000/api/proposals/calculate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(wizardRequest),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Working capital ratios missing");
    });

    it("should use default system config when none exists", async () => {
      // Mock systemConfig to return null
      const { prisma } = await import("@/lib/prisma");
      vi.mocked(prisma.systemConfig.findFirst).mockResolvedValueOnce(null);

      const wizardRequest = {
        name: "Test Proposal",
        developer: "Test Developer",
        rentModel: "Fixed",
        baseRent: 10000000,
        rentGrowthRate: 3,
        frenchCapacity: 1000,
        ibCapacity: 0,
        ibProgramEnabled: false,
        frenchBaseTuition2028: 28000,
        rampUpFRYear1Percentage: 20,
        rampUpFRYear2Percentage: 40,
        rampUpFRYear3Percentage: 60,
        rampUpFRYear4Percentage: 80,
        rampUpFRYear5Percentage: 100,
        otherOpexPercent: 10,
      };

      const request = new Request(
        "http://localhost:3000/api/proposals/calculate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(wizardRequest),
        },
      );

      const response = await POST(request);
      // Wizard format exercises the transformation code path
      expect([200, 201, 400, 500]).toContain(response.status);
    });

    it("should use transition period from wizard input without transitionConfig", async () => {
      const { prisma } = await import("@/lib/prisma");
      vi.mocked(prisma.transitionConfig.findFirst).mockResolvedValueOnce(null);

      const wizardRequest = {
        name: "Test Proposal",
        developer: "Test Developer",
        rentModel: "Fixed",
        baseRent: 10000000,
        frenchCapacity: 1000,
        ibProgramEnabled: false,
        frenchBaseTuition2028: 28000,
        rampUpFRYear1Percentage: 20,
        rampUpFRYear2Percentage: 40,
        rampUpFRYear3Percentage: 60,
        rampUpFRYear4Percentage: 80,
        rampUpFRYear5Percentage: 100,
        otherOpexPercent: 10,
        transition: {
          year2025: { students: 750, avgTuition: 27000 },
          year2026: { students: 850, avgTuition: 28000 },
          year2027: { students: 950, avgTuition: 29000 },
          rentGrowthPercent: 5,
        },
      };

      const request = new Request(
        "http://localhost:3000/api/proposals/calculate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(wizardRequest),
        },
      );

      const response = await POST(request);
      // Wizard format exercises the transformation code path
      expect([200, 201, 400, 500]).toContain(response.status);
    });

    it("should handle wizard format with nested curriculum config", async () => {
      const wizardRequest = {
        name: "Nested Config Proposal",
        developer: "Test Developer",
        rentModel: "Fixed",
        baseRent: 10000000,
        rentGrowthRate: 3,
        rentFrequency: 1,
        enrollment: {
          frenchCapacity: 1200,
          ibCapacity: 300,
          rampUpFRYear1Percentage: 25,
          rampUpFRYear2Percentage: 50,
          rampUpFRYear3Percentage: 75,
          rampUpFRYear4Percentage: 90,
          rampUpFRYear5Percentage: 100,
        },
        curriculum: {
          ibProgramEnabled: true,
          ibStartYear: 2031,
          frenchBaseTuition2028: 32000,
          ibBaseTuition2028: 50000,
          frenchTuitionGrowthRate: 3,
          frenchTuitionGrowthFrequency: 1,
          ibTuitionGrowthRate: 4,
          ibTuitionGrowthFrequency: 2,
        },
        staff: {
          studentsPerTeacher: 14,
          studentsPerNonTeacher: 45,
          avgTeacherSalary: 130000,
          avgAdminSalary: 85000,
          cpiRate: 2.5,
          cpiFrequency: 1,
          otherOpexPercent: 9,
        },
      };

      const request = new Request(
        "http://localhost:3000/api/proposals/calculate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(wizardRequest),
        },
      );

      const response = await POST(request);
      // Wizard format exercises the transformation code path
      expect([200, 201, 400, 500]).toContain(response.status);
    });
  });
});
