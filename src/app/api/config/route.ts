import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateUserWithRole } from "@/middleware/auth";
import { Role } from "@/lib/types/roles";
import { SystemConfigUpdateSchema } from "@/lib/validation/config";
import { z } from "zod";

export async function GET() {
  // Check auth - allow all authenticated roles to view config
  const authResult = await authenticateUserWithRole([
    Role.ADMIN,
    Role.PLANNER,
    Role.VIEWER,
  ]);
  if (!authResult.success) return authResult.error;

  try {
    const config = await prisma.systemConfig.findFirst();
    if (!config) {
      return NextResponse.json(
        { error: "System configuration not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(config);
  } catch (error) {
    console.error("Error fetching system config:", error);
    return NextResponse.json(
      { error: "Failed to fetch system configuration" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  // Check auth - only ADMIN can update config
  const authResult = await authenticateUserWithRole([Role.ADMIN]);
  if (!authResult.success) return authResult.error;

  try {
    const body = await request.json();

    // Validate input
    const validationResult = SystemConfigUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const validatedData = validationResult.data;

    // Build update data object - Prisma automatically converts numbers to Decimal
    /* eslint-disable no-restricted-syntax -- DTO type for Prisma update operation, not used in calculations */
    const updateData: {
      zakatRate?: number;
      debtInterestRate?: number;
      depositInterestRate?: number;
      discountRate?: number;
      minCashBalance?: number;
      confirmedAt?: Date | null;
      updatedBy?: string | null;
    } = {};
    /* eslint-enable no-restricted-syntax */

    if (validatedData.zakatRate !== undefined) {
      updateData.zakatRate = validatedData.zakatRate;
    }
    if (validatedData.debtInterestRate !== undefined) {
      updateData.debtInterestRate = validatedData.debtInterestRate;
    }
    if (validatedData.depositInterestRate !== undefined) {
      updateData.depositInterestRate = validatedData.depositInterestRate;
    }
    if (validatedData.discountRate !== undefined) {
      updateData.discountRate = validatedData.discountRate;
    }
    if (validatedData.minCashBalance !== undefined) {
      updateData.minCashBalance = validatedData.minCashBalance;
    }
    if (validatedData.confirmedAt !== undefined) {
      updateData.confirmedAt = validatedData.confirmedAt
        ? new Date(validatedData.confirmedAt)
        : null;
    }
    if (validatedData.updatedBy !== undefined) {
      updateData.updatedBy = validatedData.updatedBy;
    }

    // Update config
    const config = await prisma.systemConfig.update({
      where: { id: validatedData.id },
      data: updateData,
    });

    return NextResponse.json(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.issues,
        },
        { status: 400 },
      );
    }

    // Handle Prisma not found error
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "System configuration not found" },
        { status: 404 },
      );
    }

    console.error("Error updating system config:", error);
    return NextResponse.json(
      { error: "Failed to update system configuration" },
      { status: 500 },
    );
  }
}
