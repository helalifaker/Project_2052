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

// Database health check timeout (5 seconds)
const DB_HEALTH_CHECK_TIMEOUT_MS = 5000;

// SECURITY: Minimal response for production - prevents information disclosure
interface MinimalHealthResponse {
  status: "ok" | "error";
  timestamp: string;
}

// Extended response for development/debugging (authenticated admin only in future)
interface DetailedHealthCheckResponse extends MinimalHealthResponse {
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
 *
 * SECURITY: In production, returns minimal response to prevent information disclosure.
 * Detailed diagnostics are logged server-side but not exposed to clients.
 */
export async function GET() {
  const startTime = Date.now();
  const isProduction = process.env.NODE_ENV === "production";

  try {
    // Initialize health check status
    let overallStatus: "ok" | "error" = "ok";
    let dbStatus: "ok" | "error" = "ok";
    let dbResponseTime = 0;
    let dbError: string | undefined;

    // Check 1: Database Connectivity with timeout protection
    try {
      const dbStartTime = Date.now();

      // Use Promise.race to enforce timeout - prevents hanging on unresponsive DB
      const dbCheck = prisma.$queryRaw`SELECT 1 as health_check`;
      const timeout = new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error("Database health check timed out")),
          DB_HEALTH_CHECK_TIMEOUT_MS,
        );
      });

      await Promise.race([dbCheck, timeout]);
      dbResponseTime = Date.now() - dbStartTime;

      if (dbResponseTime > 1000) {
        console.warn(`Database response time is high: ${dbResponseTime}ms`);
      }
    } catch (error) {
      dbStatus = "error";
      dbError =
        error instanceof Error ? error.message : "Unknown database error";
      overallStatus = "error";
    }

    // Check 2: Memory Usage
    const memUsage = process.memoryUsage();
    const heapUsed = memUsage.heapUsed;
    const heapTotal = memUsage.heapTotal;
    const heapPercentage = (heapUsed / heapTotal) * 100;

    let memoryStatus: "ok" | "warning" | "error" = "ok";
    if (heapPercentage > 90) {
      memoryStatus = "error";
      overallStatus = "error";
      console.error(`Critical memory usage: ${heapPercentage.toFixed(2)}%`);
    } else if (heapPercentage > 75) {
      memoryStatus = "warning";
      console.warn(`High memory usage: ${heapPercentage.toFixed(2)}%`);
    }

    const totalResponseTime = Date.now() - startTime;
    const statusCode = overallStatus === "ok" ? 200 : 503;

    // Log failures server-side (always, not exposed to client in prod)
    if (statusCode !== 200) {
      console.error("Health check failed:", {
        status: overallStatus,
        database: {
          status: dbStatus,
          responseTime: dbResponseTime,
          error: dbError,
        },
        memory: {
          status: memoryStatus,
          percentage: Math.round(heapPercentage),
        },
        responseTime: totalResponseTime,
      });
    }

    // SECURITY: In production, return minimal response only
    if (isProduction) {
      const minimalResponse: MinimalHealthResponse = {
        status: overallStatus,
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json(minimalResponse, {
        status: statusCode,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      });
    }

    // Development: Return detailed response for debugging
    const detailedResponse: DetailedHealthCheckResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: "development",
      version: "1.0.0",
      checks: {
        database: {
          status: dbStatus,
          responseTime: dbResponseTime,
          ...(dbError && { error: dbError }),
        },
        memory: {
          status: memoryStatus,
          used: Math.round(heapUsed / 1024 / 1024),
          total: Math.round(heapTotal / 1024 / 1024),
          percentage: Math.round(heapPercentage),
        },
      },
    };

    return NextResponse.json(detailedResponse, {
      status: statusCode,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Response-Time": `${totalResponseTime}ms`,
      },
    });
  } catch (error) {
    // Catastrophic failure - log server-side, return minimal to client
    console.error("Health check endpoint error:", error);

    const errorResponse: MinimalHealthResponse = {
      status: "error",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(errorResponse, {
      status: 503,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
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
    // Quick database check with timeout protection
    const dbCheck = prisma.$queryRaw`SELECT 1`;
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error("Database health check timed out")),
        DB_HEALTH_CHECK_TIMEOUT_MS,
      );
    });

    await Promise.race([dbCheck, timeout]);

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
