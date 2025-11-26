import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, Role } from "@prisma/client";
import { authenticateUserWithRole } from "@/middleware/auth";

export async function POST() {
  // Protect seeding: only admins may seed
  const authResult = await authenticateUserWithRole([Role.ADMIN]);
  if (!authResult.success) return authResult.error;

  try {
    // Security: Only allow seeding in development environment
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Seed endpoint is disabled in production" },
        { status: 403 },
      );
    }

    // Check if already seeded
    const existingConfig = await prisma.systemConfig.findFirst();
    if (existingConfig) {
      return NextResponse.json({
        message: "Database already seeded",
        skipped: true,
      });
    }

    // Default SystemConfig
    const config = await prisma.systemConfig.create({
      data: {
        zakatRate: new Prisma.Decimal(0.025),
        debtInterestRate: new Prisma.Decimal(0.05),
        depositInterestRate: new Prisma.Decimal(0.02),
        minCashBalance: new Prisma.Decimal(1000000),
      },
    });

    // Test Admin User
    const admin = await prisma.user.upsert({
      where: { email: "admin@projectzeta.com" },
      update: {},
      create: {
        email: "admin@projectzeta.com",
        name: "Admin User",
        role: "ADMIN",
      },
    });

    return NextResponse.json({
      message: "Database seeded successfully",
      data: {
        config: { id: config.id, zakatRate: config.zakatRate.toString() },
        admin: { email: admin.email, role: admin.role },
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed database", details: String(error) },
      { status: 500 },
    );
  }
}
