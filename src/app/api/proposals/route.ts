import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/middleware/rbac";
import { Role, Prisma } from "@prisma/client";
import { CreateProposalSchema } from "@/lib/validation/proposal";
import { z } from "zod";

// Mock user for now (since we don't have full auth yet)
const mockUser = { role: Role.ADMIN };

export async function GET() {
  // Check auth - allow all authenticated roles to view proposals
  const authError = requireRole(mockUser.role, [
    Role.ADMIN,
    Role.PLANNER,
    Role.VIEWER,
  ]);
  if (authError) return authError;

  try {
    const proposals = await prisma.leaseProposal.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(proposals);
  } catch (error) {
    console.error("Error fetching proposals:", error);
    return NextResponse.json(
      { error: "Failed to fetch proposals" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  // Check auth - only ADMIN and PLANNER can create proposals
  const authError = requireRole(mockUser.role, [Role.ADMIN, Role.PLANNER]);
  if (authError) return authError;

  try {
    const body = await request.json();

    // Validate input
    const validationResult = CreateProposalSchema.safeParse(body);
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

    // Convert otherOpex to Prisma.Decimal
    const otherOpexDecimal = new Prisma.Decimal(validatedData.otherOpex);

    // Create proposal
    const proposal = await prisma.leaseProposal.create({
      data: {
        name: validatedData.name,
        rentModel: validatedData.rentModel,
        createdBy: validatedData.createdBy,
        transition: validatedData.transition as Prisma.InputJsonValue,
        enrollment: validatedData.enrollment as Prisma.InputJsonValue,
        curriculum: validatedData.curriculum as Prisma.InputJsonValue,
        staff: validatedData.staff as Prisma.InputJsonValue,
        rentParams: validatedData.rentParams as Prisma.InputJsonValue,
        otherOpex: otherOpexDecimal,
        financials: validatedData.financials as
          | Prisma.InputJsonValue
          | undefined,
        metrics: validatedData.metrics as Prisma.InputJsonValue | undefined,
        calculatedAt: validatedData.calculatedAt
          ? new Date(validatedData.calculatedAt)
          : null,
      },
    });

    return NextResponse.json(proposal, { status: 201 });
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

    console.error("Error creating proposal:", error);
    return NextResponse.json(
      { error: "Failed to create proposal" },
      { status: 500 },
    );
  }
}
