/**
 * /api/capex
 *
 * CapEx Configuration API - Manages auto-reinvestment settings and manual CapEx items
 *
 * GET: Fetch current CapEx configuration and all manual items
 * POST: Create or update CapEx configuration
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authenticateUserWithRole } from "@/middleware/auth";
import { Role } from "@prisma/client";

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const CapExConfigSchema = z.object({
  autoReinvestEnabled: z.boolean(),
  reinvestFrequency: z.number().min(1).max(30).optional().nullable(),
  reinvestAmountType: z.enum(["fixed", "percentage"]).optional(),
  reinvestAmount: z.number().min(0).optional().nullable(),
  reinvestAmountPercent: z.number().min(0).max(100).optional().nullable(),
  useCategoryReinvestment: z.boolean().optional(),
});

// Schema for manual CapEx items (used by /api/capex/items endpoint)
const _ManualCapExItemSchema = z.object({
  year: z.number().min(2025).max(2053),
  assetName: z.string().min(1),
  amount: z.number().min(0),
  usefulLife: z.number().min(1).max(50),
  depreciationMethod: z.enum(["OLD", "NEW"]).optional(),
});

// ============================================================================
// GET - Fetch CapEx configuration and items
// ============================================================================

export async function GET() {
  const authResult = await authenticateUserWithRole([
    Role.ADMIN,
    Role.PLANNER,
    Role.VIEWER,
  ]);
  if (!authResult.success) return authResult.error;

  try {
    // Fetch configuration
    const config = await prisma.capExConfig.findFirst({
      orderBy: { id: "desc" },
    });

    // Fetch all global manual items (not attached to a specific proposal)
    const manualItems = await prisma.capExAsset.findMany({
      where: { proposalId: null },
      orderBy: { purchaseYear: "asc" },
      include: {
        category: true,
      },
    });

    // Fetch all categories with asset counts
    const categories = await prisma.capExCategory.findMany({
      orderBy: { type: "asc" },
      include: {
        _count: { select: { assets: true } },
      },
    });

    return NextResponse.json({
      config: config
        ? {
            id: config.id,
            autoReinvestEnabled: config.autoReinvestEnabled,
            reinvestFrequency: config.reinvestFrequency,
            reinvestAmount: config.reinvestAmount
              ? Number(config.reinvestAmount)
              : null,
            reinvestAmountPercent: config.reinvestAmountPercent
              ? Number(config.reinvestAmountPercent)
              : null,
            useCategoryReinvestment: config.useCategoryReinvestment,
          }
        : null,
      manualItems: manualItems.map((item) => {
        // Calculate NBV and depreciation method based on purchase year
        const currentYear = new Date().getFullYear();
        const yearsDepreciated = Math.max(0, currentYear - item.purchaseYear);
        const annualDepreciation = Number(item.purchaseAmount) / item.usefulLife;
        const accumulatedDepreciation = Math.min(
          yearsDepreciated * annualDepreciation,
          Number(item.purchaseAmount)
        );
        const nbv = Math.max(0, Number(item.purchaseAmount) - accumulatedDepreciation);
        const depreciationMethod = item.purchaseYear >= 2028 ? "NEW" : "OLD";

        return {
          id: item.id,
          year: item.purchaseYear,  // Map new field to old UI field name
          assetName: item.category?.name ?? "Unknown",  // Use category name as asset name
          amount: Number(item.purchaseAmount),  // Map new field to old UI field name
          usefulLife: item.usefulLife,
          depreciationMethod,
          nbv,
          createdAt: item.createdAt,
          categoryId: item.categoryId,
          categoryName: item.category?.name ?? null,
        };
      }),
      categories: categories.map((cat) => ({
        id: cat.id,
        type: cat.type,  // NEW: Include category type
        name: cat.name,
        usefulLife: cat.usefulLife,  // Changed from defaultUsefulLife
        reinvestFrequency: cat.reinvestFrequency,
        reinvestAmount: cat.reinvestAmount ? Number(cat.reinvestAmount) : null,
        reinvestStartYear: cat.reinvestStartYear,  // Year when auto-reinvestment begins
        assetCount: cat._count.assets,
      })),
      isConfigured: Boolean(config),
    });
  } catch (error) {
    console.error("Failed to fetch CapEx configuration:", error);
    return NextResponse.json(
      { error: "Failed to fetch CapEx configuration" },
      { status: 500 },
    );
  }
}

// ============================================================================
// POST - Create or update CapEx configuration
// ============================================================================

export async function POST(request: Request) {
  const authResult = await authenticateUserWithRole([Role.ADMIN]);
  if (!authResult.success) return authResult.error;

  try {
    const body = await request.json();
    const validationResult = CapExConfigSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid CapEx configuration",
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const data = validationResult.data;

    // Check if config exists
    const existingConfig = await prisma.capExConfig.findFirst();

    let config;
    if (existingConfig) {
      // Update existing
      config = await prisma.capExConfig.update({
        where: { id: existingConfig.id },
        data: {
          autoReinvestEnabled: data.autoReinvestEnabled,
          reinvestFrequency: data.reinvestFrequency ?? null,
          reinvestAmount: data.reinvestAmount ?? null,
          reinvestAmountPercent: data.reinvestAmountPercent ?? null,
          useCategoryReinvestment: data.useCategoryReinvestment ?? false,
        },
      });
    } else {
      // Create new
      config = await prisma.capExConfig.create({
        data: {
          autoReinvestEnabled: data.autoReinvestEnabled,
          reinvestFrequency: data.reinvestFrequency ?? null,
          reinvestAmount: data.reinvestAmount ?? null,
          reinvestAmountPercent: data.reinvestAmountPercent ?? null,
          useCategoryReinvestment: data.useCategoryReinvestment ?? false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      config: {
        id: config.id,
        autoReinvestEnabled: config.autoReinvestEnabled,
        reinvestFrequency: config.reinvestFrequency,
        reinvestAmount: config.reinvestAmount
          ? Number(config.reinvestAmount)
          : null,
        reinvestAmountPercent: config.reinvestAmountPercent
          ? Number(config.reinvestAmountPercent)
          : null,
        useCategoryReinvestment: config.useCategoryReinvestment,
      },
    });
  } catch (error) {
    console.error("Failed to save CapEx configuration:", error);
    return NextResponse.json(
      { error: "Failed to save CapEx configuration" },
      { status: 500 },
    );
  }
}
