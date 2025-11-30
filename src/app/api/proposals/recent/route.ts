import { NextResponse } from "next/server";
import { authenticateUserWithRole } from "@/middleware/auth";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { proposalToFormData } from "@/lib/proposals/transform-to-form";

/**
 * GET /api/proposals/recent?includeFormData=true
 *
 * Fetch the most recent proposal created by the current user.
 * Optionally transform to wizard format for pre-filling.
 *
 * @query includeFormData - If "true", transform to ProposalFormData
 * @returns Most recent proposal (optionally transformed)
 */
export async function GET(request: Request) {
  // 1. Authenticate user
  const authResult = await authenticateUserWithRole([
    Role.ADMIN,
    Role.PLANNER,
  ]);
  if (!authResult.success) return authResult.error;

  // 2. Parse query parameters
  const { searchParams } = new URL(request.url);
  const includeFormData = searchParams.get("includeFormData") === "true";

  // 3. Fetch most recent proposal by current user
  const proposal = await prisma.leaseProposal.findFirst({
    where: {
      createdBy: authResult.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      rentModel: true,
      contractPeriodYears: true,
      enrollment: true,
      curriculum: true,
      staff: true,
      rentParams: true,
      otherOpexPercent: true,
      createdAt: true,
      createdBy: true,
    },
  });

  if (!proposal) {
    return NextResponse.json(
      { error: "No proposals found" },
      { status: 404 }
    );
  }

  // 4. Return with or without transformation
  if (includeFormData) {
    const formData = proposalToFormData(proposal);
    return NextResponse.json({
      id: proposal.id,
      name: proposal.name,
      createdAt: proposal.createdAt,
      formData,
    });
  }

  return NextResponse.json(proposal);
}
