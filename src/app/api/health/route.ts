import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Health Check Endpoint
 *
 * Verifies that the application and critical dependencies are working correctly.
 * Used by:
 * - Uptime monitoring services (UptimeRobot, Better Uptime, etc.)
 * - CI/CD smoke tests
 * - Load balancers
 * - Kubernetes liveness probes (if applicable)
 *
 * Returns:
 * - 200 OK: System is healthy
 * - 503 Service Unavailable: System has issues
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface HealthCheckResponse {
  status: "ok" | "error";
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  checks: {
    database: {
      status: "ok" | "error";
      responseTime?: number;
      error?: string;
    };
    memory: {
      status: "ok" | "warning" | "error";
      used: number;
      total: number;
      percentage: number;
    };
  };
}

/**
 * GET /api/health
 *
 * Performs health checks on critical system components
 */
export async function GET() {
  const startTime = Date.now();

  try {
    // Initialize health check response
    // Security: Don't expose detailed environment info in production
    const isProduction = process.env.NODE_ENV === "production";
    const healthCheck: HealthCheckResponse = {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: isProduction ? "production" : "development",
      version: "1.0.0", // Don't expose actual version in production
      checks: {
        database: {
          status: "ok",
        },
        memory: {
          status: "ok",
          used: 0,
          total: 0,
          percentage: 0,
        },
      },
    };

    // Check 1: Database Connectivity
    try {
      const dbStartTime = Date.now();

      // Simple database query to verify connectivity
      await prisma.$queryRaw`SELECT 1 as health_check`;

      const dbResponseTime = Date.now() - dbStartTime;

      healthCheck.checks.database = {
        status: "ok",
        responseTime: dbResponseTime,
      };

      // Warning if database response is slow
      if (dbResponseTime > 1000) {
        healthCheck.checks.database.status = "ok"; // Still OK but logged
        console.warn(`Database response time is high: ${dbResponseTime}ms`);
      }
    } catch (error) {
      healthCheck.checks.database = {
        status: "error",
        error:
          error instanceof Error ? error.message : "Unknown database error",
      };
      healthCheck.status = "error";
    }

    // Check 2: Memory Usage
    const memUsage = process.memoryUsage();
    const heapUsed = memUsage.heapUsed;
    const heapTotal = memUsage.heapTotal;
    const heapPercentage = (heapUsed / heapTotal) * 100;

    healthCheck.checks.memory = {
      status:
        heapPercentage > 90 ? "error" : heapPercentage > 75 ? "warning" : "ok",
      used: Math.round(heapUsed / 1024 / 1024), // MB
      total: Math.round(heapTotal / 1024 / 1024), // MB
      percentage: Math.round(heapPercentage),
    };

    if (heapPercentage > 90) {
      healthCheck.status = "error";
      console.error(`Critical memory usage: ${heapPercentage.toFixed(2)}%`);
    } else if (heapPercentage > 75) {
      console.warn(`High memory usage: ${heapPercentage.toFixed(2)}%`);
    }

    // Calculate total response time
    const totalResponseTime = Date.now() - startTime;

    // Determine HTTP status code
    const statusCode = healthCheck.status === "ok" ? 200 : 503;

    // Log health check result
    if (statusCode !== 200) {
      console.error("Health check failed:", {
        status: healthCheck.status,
        checks: healthCheck.checks,
        responseTime: totalResponseTime,
      });
    }

    // Return appropriate response
    return NextResponse.json(healthCheck, {
      status: statusCode,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Response-Time": `${totalResponseTime}ms`,
      },
    });
  } catch (error) {
    // Catastrophic failure
    console.error("Health check endpoint error:", error);

    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      },
    );
  }
}

/**
 * HEAD /api/health
 *
 * Lightweight health check for load balancers and monitoring services
 * that only need to verify the service is responding
 */
export async function HEAD() {
  try {
    // Quick database check
    await prisma.$queryRaw`SELECT 1`;

    return new NextResponse(null, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Health check HEAD error:", error);
    return new NextResponse(null, {
      status: 503,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  }
}
