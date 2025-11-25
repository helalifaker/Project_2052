import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateUserWithRole } from "@/middleware/auth";
import { Role, Prisma } from "@prisma/client";
import { TransitionConfigUpsertSchema } from "@/lib/validation/transition";
import { z } from "zod";

export async function GET() {
  const authResult = await authenticateUserWithRole([
    Role.ADMIN,
    Role.PLANNER,
    Role.VIEWER,
  ]);
  if (!authResult.success) return authResult.error;

  try {
    const config = await prisma.transitionConfig.findFirst();
    if (!config) {
      return NextResponse.json(
        { error: "Transition configuration not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(config);
  } catch (error) {
    console.error("Error fetching transition config:", error);
    return NextResponse.json(
      { error: "Failed to fetch transition configuration" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  const authResult = await authenticateUserWithRole([Role.ADMIN]);
  if (!authResult.success) return authResult.error;

  try {
    const body = await request.json();
    const validationResult = TransitionConfigUpsertSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.issues },
        { status: 400 },
      );
    }

    const data = validationResult.data;
    const updateData = {
      year2025Students: data.year2025Students,
      year2025AvgTuition: new Prisma.Decimal(data.year2025AvgTuition ?? 0),
      year2026Students: data.year2026Students,
      year2026AvgTuition: new Prisma.Decimal(data.year2026AvgTuition ?? 0),
      year2027Students: data.year2027Students,
      year2027AvgTuition: new Prisma.Decimal(data.year2027AvgTuition ?? 0),
      rentGrowthPercent: new Prisma.Decimal(data.rentGrowthPercent ?? 0),
      updatedBy: authResult.user?.id,
    };

    const existing = await prisma.transitionConfig.findFirst();
    let saved;
    if (existing) {
      saved = await prisma.transitionConfig.update({
        where: { id: existing.id },
        data: updateData,
      });
    } else {
      saved = await prisma.transitionConfig.create({
        data: {
          ...updateData,
          year2025Students: updateData.year2025Students ?? 0,
          year2026Students: updateData.year2026Students ?? 0,
          year2027Students: updateData.year2027Students ?? 0,
        },
      });
    }

    return NextResponse.json(saved);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 },
      );
    }
    console.error("Error saving transition config:", error);
    return NextResponse.json(
      { error: "Failed to save transition configuration" },
      { status: 500 },
    );
  }
}
