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
      orderBy: { year: "asc" },
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
          }
        : null,
      manualItems: manualItems.map((item) => ({
        id: item.id,
        year: item.year,
        assetName: item.assetName,
        amount: Number(item.amount),
        usefulLife: item.usefulLife,
        depreciationMethod: item.depreciationMethod,
        nbv: Number(item.nbv),
        createdAt: item.createdAt,
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
