/**
 * /api/capex/categories/[id]
 *
 * Single category operations: GET, PUT, DELETE
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authenticateUserWithRole } from "@/middleware/auth";
import { Role } from "@prisma/client";

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const UpdateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  usefulLife: z.number().min(1).max(100).optional(),
  reinvestFrequency: z.number().min(1).max(50).optional().nullable(),
  reinvestAmount: z.number().min(0).optional().nullable(),
  reinvestStartYear: z.number().min(2028).max(2053).optional().nullable(),  // Year when auto-reinvestment begins
});

// ============================================================================
// TYPES
// ============================================================================

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ============================================================================
// GET - Fetch single category with assets
// ============================================================================

export async function GET(request: Request, { params }: RouteParams) {
  const authResult = await authenticateUserWithRole([
    Role.ADMIN,
    Role.PLANNER,
    Role.VIEWER,
  ]);
  if (!authResult.success) return authResult.error;

  try {
    const { id } = await params;

    const category = await prisma.capExCategory.findUnique({
      where: { id },
      include: {
        assets: {
          orderBy: { purchaseYear: "asc" },
          take: 100,
        },
        _count: { select: { assets: true } },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      category: {
        id: category.id,
        type: category.type,
        name: category.name,
        usefulLife: category.usefulLife,
        reinvestFrequency: category.reinvestFrequency,
        reinvestAmount: category.reinvestAmount
          ? Number(category.reinvestAmount)
          : null,
        reinvestStartYear: category.reinvestStartYear,  // Year when auto-reinvestment begins
        assetCount: category._count.assets,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
        assets: category.assets.map((asset) => ({
          id: asset.id,
          purchaseYear: asset.purchaseYear,
          purchaseAmount: Number(asset.purchaseAmount),
          usefulLife: asset.usefulLife,
          createdAt: asset.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Failed to fetch category:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT - Update category
// ============================================================================

export async function PUT(request: Request, { params }: RouteParams) {
  const authResult = await authenticateUserWithRole([Role.ADMIN]);
  if (!authResult.success) return authResult.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const validation = UpdateCategorySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.issues },
        { status: 400 }
      );
    }

    // Check if category exists
    const existing = await prisma.capExCategory.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Check for name conflict if name is being updated
    const data = validation.data;
    if (data.name && data.name !== existing.name) {
      const nameConflict = await prisma.capExCategory.findFirst({
        where: { name: data.name },
      });
      if (nameConflict) {
        return NextResponse.json(
          { error: "A category with this name already exists" },
          { status: 409 }
        );
      }
    }

    const category = await prisma.capExCategory.update({
      where: { id },
      data: {
        name: data.name,
        usefulLife: data.usefulLife,
        reinvestFrequency: data.reinvestFrequency,
        reinvestAmount: data.reinvestAmount,
        reinvestStartYear: data.reinvestStartYear,  // Year when auto-reinvestment begins
      },
      include: {
        _count: { select: { assets: true } },
      },
    });

    return NextResponse.json({
      success: true,
      category: {
        id: category.id,
        type: category.type,
        name: category.name,
        usefulLife: category.usefulLife,
        reinvestFrequency: category.reinvestFrequency,
        reinvestAmount: category.reinvestAmount
          ? Number(category.reinvestAmount)
          : null,
        reinvestStartYear: category.reinvestStartYear,  // Year when auto-reinvestment begins
        assetCount: category._count.assets,
        updatedAt: category.updatedAt,
      },
    });
  } catch (error) {
    console.error("Failed to update category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE - Delete category (moves assets to uncategorized)
// ============================================================================

export async function DELETE(request: Request, { params }: RouteParams) {
  const authResult = await authenticateUserWithRole([Role.ADMIN]);
  if (!authResult.success) return authResult.error;

  try {
    const { id } = await params;

    // Check if category exists and has no assets
    const existing = await prisma.capExCategory.findUnique({
      where: { id },
      include: {
        _count: { select: { assets: true, transitionData: true } },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    if (existing._count.assets > 0 || existing._count.transitionData > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete category with associated assets or transition data",
          assetCount: existing._count.assets,
          transitionCount: existing._count.transitionData,
        },
        { status: 409 }
      );
    }

    // Delete the category
    await prisma.capExCategory.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: `Category "${existing.name}" deleted`,
    });
  } catch (error) {
    console.error("Failed to delete category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
