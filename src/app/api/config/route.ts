import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/middleware/rbac";
import { Role, Prisma } from "@prisma/client";
import { SystemConfigUpdateSchema } from "@/lib/validation/config";
import { z } from "zod";

// Mock user for now (since we don't have full auth yet)
const mockUser = { role: Role.ADMIN };

export async function GET() {
  // Check auth - allow all authenticated roles to view config
  const authError = requireRole(mockUser.role, [
    Role.ADMIN,
    Role.PLANNER,
    Role.VIEWER,
  ]);
  if (authError) return authError;

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
  const authError = requireRole(mockUser.role, [Role.ADMIN]);
  if (authError) return authError;

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

    // Build update data object, converting numbers to Prisma.Decimal
    const updateData: {
      zakatRate?: Prisma.Decimal;
      debtInterestRate?: Prisma.Decimal;
      depositInterestRate?: Prisma.Decimal;
      minCashBalance?: Prisma.Decimal;
      confirmedAt?: Date | null;
      updatedBy?: string | null;
    } = {};

    if (validatedData.zakatRate !== undefined) {
      updateData.zakatRate = new Prisma.Decimal(validatedData.zakatRate);
    }
    if (validatedData.debtInterestRate !== undefined) {
      updateData.debtInterestRate = new Prisma.Decimal(
        validatedData.debtInterestRate,
      );
    }
    if (validatedData.depositInterestRate !== undefined) {
      updateData.depositInterestRate = new Prisma.Decimal(
        validatedData.depositInterestRate,
      );
    }
    if (validatedData.minCashBalance !== undefined) {
      updateData.minCashBalance = new Prisma.Decimal(
        validatedData.minCashBalance,
      );
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
