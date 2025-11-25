/**
 * /api/capex/items
 *
 * Manual CapEx Items API - CRUD operations for individual CapEx assets
 *
 * POST: Create a new manual CapEx item
 * DELETE: Delete a manual CapEx item (via query param ?id=xxx)
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authenticateUserWithRole } from "@/middleware/auth";
import { Role } from "@prisma/client";

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const ManualCapExItemSchema = z.object({
  year: z.number().min(2025).max(2053),
  assetName: z.string().min(1, "Asset name is required"),
  amount: z.number().min(0, "Amount must be positive"),
  usefulLife: z.number().min(1, "Useful life must be at least 1 year").max(50),
  depreciationMethod: z.enum(["OLD", "NEW"]).optional(),
});

// ============================================================================
// POST - Create a new manual CapEx item
// ============================================================================

export async function POST(request: Request) {
  const authResult = await authenticateUserWithRole([Role.ADMIN]);
  if (!authResult.success) return authResult.error;

  try {
    const body = await request.json();
    const validationResult = ManualCapExItemSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid CapEx item data",
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const data = validationResult.data;

    // Determine depreciation method based on year if not provided
    const depreciationMethod =
      data.depreciationMethod ?? (data.year < 2028 ? "OLD" : "NEW");

    const item = await prisma.capExAsset.create({
      data: {
        proposalId: null, // Global item, not attached to a proposal
        year: data.year,
        assetName: data.assetName,
        amount: data.amount,
        usefulLife: data.usefulLife,
        depreciationMethod,
        nbv: data.amount, // Initial NBV equals amount
      },
    });

    return NextResponse.json({
      success: true,
      item: {
        id: item.id,
        year: item.year,
        assetName: item.assetName,
        amount: Number(item.amount),
        usefulLife: item.usefulLife,
        depreciationMethod: item.depreciationMethod,
        nbv: Number(item.nbv),
        createdAt: item.createdAt,
      },
    });
  } catch (error) {
    console.error("Failed to create CapEx item:", error);
    return NextResponse.json(
      { error: "Failed to create CapEx item" },
      { status: 500 },
    );
  }
}

// ============================================================================
// DELETE - Delete a manual CapEx item
// ============================================================================

export async function DELETE(request: Request) {
  const authResult = await authenticateUserWithRole([Role.ADMIN]);
  if (!authResult.success) return authResult.error;

  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("id");

    if (!itemId) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 },
      );
    }

    // Check if item exists and is a global item (not attached to a proposal)
    const existingItem = await prisma.capExAsset.findUnique({
      where: { id: itemId },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "CapEx item not found" },
        { status: 404 },
      );
    }

    if (existingItem.proposalId !== null) {
      return NextResponse.json(
        {
          error:
            "Cannot delete proposal-specific CapEx items from this endpoint",
        },
        { status: 400 },
      );
    }

    await prisma.capExAsset.delete({
      where: { id: itemId },
    });

    return NextResponse.json({
      success: true,
      message: "CapEx item deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete CapEx item:", error);
    return NextResponse.json(
      { error: "Failed to delete CapEx item" },
      { status: 500 },
    );
  }
}
