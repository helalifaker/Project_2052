import { NextResponse } from "next/server";
import { authenticateUserWithRole } from "@/middleware/auth";
import { Role } from "@/lib/types/roles";
import { prisma } from "@/lib/prisma";
import { proposalToFormData } from "@/lib/proposals/transform-to-form";

/**
 * GET /api/proposals/[id]/prefill
 *
 * Fetch a proposal in wizard-ready format for pre-filling the creation form.
 * Only allows users to fetch their own proposals for security.
 *
 * @returns ProposalFormData for wizard initialization
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  // 1. Authenticate user
  const authResult = await authenticateUserWithRole([Role.ADMIN, Role.PLANNER]);
  if (!authResult.success) return authResult.error;

  const { id } = await context.params;

  // 2. Validate UUID format
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return NextResponse.json(
      { error: "Invalid proposal ID format" },
      { status: 400 },
    );
  }

  // 3. Defensive check: GET requests should not have a body
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength) > 0) {
    return NextResponse.json(
      { error: "GET requests should not include a request body" },
      { status: 400 },
    );
  }

  // 4. Fetch proposal with only needed fields (exclude financials/metrics)
  const proposal = await prisma.leaseProposal.findUnique({
    where: { id },
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
      createdBy: true,
    },
  });

  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  // 5. Authorization check: Only allow user to fetch their own proposals
  if (proposal.createdBy !== authResult.user.id) {
    return NextResponse.json(
      { error: "Forbidden: You can only pre-fill from your own proposals" },
      { status: 403 },
    );
  }

  // 6. Transform to wizard format
  const formData = proposalToFormData(proposal);

  return NextResponse.json({
    data: formData,
    name: proposal.name, // Include name for toast notification
  });
}
