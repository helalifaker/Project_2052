/**
 * Admin Users API
 *
 * GET /api/admin/users - List all users with filtering options
 * Only accessible by ADMIN users.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateUserWithRole } from "@/middleware/auth";
import { Role } from "@/lib/types/roles";
import {
  Prisma,
  Role as PrismaRole,
  ApprovalStatus as PrismaApprovalStatus,
} from "@prisma/client";
import { z } from "zod";

// Query params schema
const QuerySchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "all"]).optional(),
  role: z.enum(["ADMIN", "PLANNER", "VIEWER", "all"]).optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

/**
 * GET - List all users (Admin only)
 */
export async function GET(request: NextRequest) {
  // Authenticate - Admin only
  const authResult = await authenticateUserWithRole([Role.ADMIN]);
  if (!authResult.success) {
    return authResult.error;
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = QuerySchema.safeParse({
      status: searchParams.get("status") || "all",
      role: searchParams.get("role") || "all",
      search: searchParams.get("search") || undefined,
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 20,
    });

    if (!query.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: query.error.flatten() },
        { status: 400 },
      );
    }

    const { status, role, search, page, limit } = query.data;

    // Build where clause using Prisma types
    const where: Prisma.UserWhereInput = {};

    if (status && status !== "all") {
      where.approvalStatus = status as PrismaApprovalStatus;
    }

    if (role && role !== "all") {
      where.role = role as PrismaRole;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    // PERF: Run all database queries in parallel to reduce response time
    const [total, users, statusCounts] = await Promise.all([
      // Query 1: Total count for filtered results
      prisma.user.count({ where }),

      // Query 2: Users with pagination
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          approvalStatus: true,
          approvedBy: true,
          approvedAt: true,
          rejectionReason: true,
          createdAt: true,
        },
        orderBy: [
          { approvalStatus: "asc" }, // PENDING first
          { createdAt: "desc" },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),

      // Query 3: Status counts for dashboard summary
      prisma.user.groupBy({
        by: ["approvalStatus"],
        _count: { id: true },
      }),
    ]);

    const counts = {
      pending:
        statusCounts.find((s) => s.approvalStatus === "PENDING")?._count.id ||
        0,
      approved:
        statusCounts.find((s) => s.approvalStatus === "APPROVED")?._count.id ||
        0,
      rejected:
        statusCounts.find((s) => s.approvalStatus === "REJECTED")?._count.id ||
        0,
      total,
    };

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      counts,
    });
  } catch (error) {
    console.error("Admin users list error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
