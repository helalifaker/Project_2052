import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/middleware/rbac";
import { Role, Prisma } from "@prisma/client";
import { HistoricalDataArraySchema } from "@/lib/validation/historical";
import { z } from "zod";

// Mock user for now (since we don't have full auth yet)
const mockUser = { role: Role.ADMIN };

export async function GET() {
  // Check auth - allow all authenticated roles to view historical data
  const authError = requireRole(mockUser.role, [
    Role.ADMIN,
    Role.PLANNER,
    Role.VIEWER,
  ]);
  if (authError) return authError;

  try {
    const data = await prisma.historicalData.findMany({
      orderBy: [{ year: "asc" }, { statementType: "asc" }, { lineItem: "asc" }],
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching historical data:", error);
    return NextResponse.json(
      { error: "Failed to fetch historical data" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  // Check auth - only ADMIN and PLANNER can create/update historical data
  const authError = requireRole(mockUser.role, [Role.ADMIN, Role.PLANNER]);
  if (authError) return authError;

  try {
    const body = await request.json();

    // Validate input
    const validationResult = HistoricalDataArraySchema.safeParse(body);
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

    // Check immutability: if any item is confirmed, reject the entire request
    // (unless user is ADMIN - but for now, we'll be strict)
    const existingData = await prisma.historicalData.findMany({
      where: {
        OR: validatedData.map((item) => ({
          year: item.year,
          statementType: item.statementType,
          lineItem: item.lineItem,
        })),
      },
      select: {
        year: true,
        statementType: true,
        lineItem: true,
        confirmed: true,
      },
    });

    // Check if any existing item is confirmed
    const confirmedItems = existingData.filter((item) => item.confirmed);
    if (confirmedItems.length > 0) {
      return NextResponse.json(
        {
          error: "Forbidden",
          message:
            "Cannot modify confirmed historical data. Some items are already confirmed and immutable.",
          confirmedItems: confirmedItems.map((item) => ({
            year: item.year,
            statementType: item.statementType,
            lineItem: item.lineItem,
          })),
        },
        { status: 403 },
      );
    }

    // Upsert all items (create or update)
    const results = await Promise.all(
      validatedData.map(async (item) => {
        // Convert amount to Prisma.Decimal
        const amountDecimal = new Prisma.Decimal(item.amount);

        return prisma.historicalData.upsert({
          where: {
            year_statementType_lineItem: {
              year: item.year,
              statementType: item.statementType,
              lineItem: item.lineItem,
            },
          },
          update: {
            amount: amountDecimal,
            confirmed: item.confirmed ?? false,
          },
          create: {
            year: item.year,
            statementType: item.statementType,
            lineItem: item.lineItem,
            amount: amountDecimal,
            confirmed: item.confirmed ?? false,
          },
        });
      }),
    );

    return NextResponse.json(
      {
        message: "Historical data saved successfully",
        count: results.length,
        data: results,
      },
      { status: 201 },
    );
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

    console.error("Error saving historical data:", error);
    return NextResponse.json(
      { error: "Failed to save historical data" },
      { status: 500 },
    );
  }
}
