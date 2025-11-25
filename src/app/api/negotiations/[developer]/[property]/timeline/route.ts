import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateUserWithRole } from "@/middleware/auth";
import { Role } from "@prisma/client";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ developer: string; property: string }> },
) {
  const authResult = await authenticateUserWithRole([
    Role.ADMIN,
    Role.PLANNER,
    Role.VIEWER,
  ]);
  if (!authResult.success) return authResult.error;

  try {
    const resolvedParams = await params;
    const developer = decodeURIComponent(resolvedParams.developer);
    const property = decodeURIComponent(resolvedParams.property);

    const proposals = await prisma.leaseProposal.findMany({
      where: { developer, property },
      orderBy: [{ negotiationRound: "asc" }, { createdAt: "asc" }],
    });

    if (!proposals.length) {
      return NextResponse.json(
        { error: "Negotiation not found" },
        { status: 404 },
      );
    }

    const timeline = proposals.map((p) => {
      const metrics = (p.metrics as Record<string, unknown>) || {};
      const totalRent =
        typeof metrics.totalRent === "number" ? metrics.totalRent : undefined;
      const npv = typeof metrics.npv === "number" ? metrics.npv : undefined;

      return {
        id: p.id,
        version: p.version,
        origin: p.origin,
        status: p.status,
        negotiationRound: p.negotiationRound,
        summary: `${p.rentModel} ${p.version || ""}`.trim(),
        submittedDate: p.submittedDate,
        responseReceivedDate: p.responseReceivedDate,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        metrics: {
          totalRent,
          npv,
        },
      };
    });

    return NextResponse.json({
      negotiation: { developer, property, status: proposals[0].status },
      timeline,
    });
  } catch (error) {
    console.error("Error fetching negotiation timeline:", error);
    return NextResponse.json(
      { error: "Failed to fetch negotiation timeline" },
      { status: 500 },
    );
  }
}
