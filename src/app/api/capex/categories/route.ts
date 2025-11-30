/**
 * /api/capex/categories
 *
 * CapEx Category API - CRUD operations for asset categories
 *
 * GET: Fetch all categories with asset counts
 * POST: Create a new category
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateUserWithRole } from "@/middleware/auth";
import { Role } from "@/lib/types/roles";

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

// Note: POST route disabled - categories are seeded via prisma/seed-capex-categories.ts
// Only the 4 standard categories (IT_EQUIPMENT, FURNITURE, EDUCATIONAL_EQUIPMENT, BUILDING) are allowed

// ============================================================================
// TYPES
// ============================================================================

interface CategoryWithCount {
  id: string;
  type: string;
  name: string;
  usefulLife: number;
  reinvestFrequency: number | null;
  reinvestAmount: unknown;
  reinvestStartYear: number | null;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    assets: number;
  };
}

// ============================================================================
// GET - Fetch all categories
// ============================================================================

export async function GET() {
  const authResult = await authenticateUserWithRole([
    Role.ADMIN,
    Role.PLANNER,
    Role.VIEWER,
  ]);
  if (!authResult.success) return authResult.error;

  try {
    const categories = await prisma.capExCategory.findMany({
      orderBy: { type: "asc" },
      include: {
        _count: { select: { assets: true } },
      },
    });

    return NextResponse.json({
      categories: categories.map((cat: CategoryWithCount) => ({
        id: cat.id,
        type: cat.type,
        name: cat.name,
        usefulLife: cat.usefulLife,
        reinvestFrequency: cat.reinvestFrequency,
        reinvestAmount: cat.reinvestAmount ? Number(cat.reinvestAmount) : null,
        reinvestStartYear: cat.reinvestStartYear, // Year when auto-reinvestment begins
        assetCount: cat._count.assets,
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}

// ============================================================================
// POST - Create new category
// ============================================================================

export async function POST() {
  // Categories are seeded via prisma/seed-capex-categories.ts
  // Only the 4 standard categories are allowed: IT_EQUIPMENT, FURNITURE, EDUCATIONAL_EQUIPMENT, BUILDING
  return NextResponse.json(
    {
      error:
        "Creating categories is disabled. Use the seed script: npx tsx prisma/seed-capex-categories.ts",
    },
    { status: 405 },
  );
}
