import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateUserWithRole } from "@/middleware/auth";
import { Role, NegotiationStatus } from "@/lib/types/roles";
import { CreateNegotiationSchema } from "@/lib/validation/negotiation";

/**
 * GET /api/negotiations
 *
 * List all negotiations with optional status filtering
 * Uses the new Negotiation entity (v2.2)
 */
export async function GET(req: Request) {
  const authResult = await authenticateUserWithRole([
    Role.ADMIN,
    Role.PLANNER,
    Role.VIEWER,
  ]);
  if (!authResult.success) return authResult.error;

  try {
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status"); // active | closed | all | specific status
    const developerFilter = searchParams.get("developer") || undefined;

    // Build where clause
    type NegotiationWhereInput = {
      developer?: { contains: string; mode: "insensitive" };
      status?: NegotiationStatus | { in: NegotiationStatus[] };
    };

    const where: NegotiationWhereInput = {};

    if (developerFilter) {
      where.developer = { contains: developerFilter, mode: "insensitive" };
    }

    // Handle status filtering
    if (statusFilter === "active") {
      where.status = NegotiationStatus.ACTIVE;
    } else if (statusFilter === "closed") {
      where.status = {
        in: [
          NegotiationStatus.ACCEPTED,
          NegotiationStatus.REJECTED,
          NegotiationStatus.CLOSED,
        ],
      };
    } else if (
      statusFilter &&
      Object.values(NegotiationStatus).includes(
        statusFilter as NegotiationStatus,
      )
    ) {
      where.status = statusFilter as NegotiationStatus;
    }

    // Fetch negotiations with proposals
    const negotiations = await prisma.negotiation.findMany({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: where as any,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        proposals: {
          orderBy: [{ offerNumber: "asc" }, { createdAt: "asc" }],
          select: {
            id: true,
            name: true,
            rentModel: true,
            offerNumber: true,
            origin: true,
            status: true,
            version: true,
            // PERF: Only fetch metrics for summary extraction (totalRent, npv, irr).
            // Fetching full metrics for every proposal in every negotiation was ~80% of payload.
            metrics: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: [{ updatedAt: "desc" }],
      take: 100,
    });

    // Transform response with summary data
    const result = negotiations.map((neg) => {
      const latestProposal = neg.proposals[neg.proposals.length - 1];
      const metrics = latestProposal?.metrics as Record<string, unknown> | null;

      return {
        id: neg.id,
        developer: neg.developer,
        property: neg.property,
        status: neg.status,
        notes: neg.notes,
        createdAt: neg.createdAt,
        updatedAt: neg.updatedAt,
        createdBy: neg.createdBy,
        creator: neg.creator,
        proposalCount: neg.proposals.length,
        ourOffers: neg.proposals.filter((p) => p.origin === "OUR_OFFER").length,
        theirCounters: neg.proposals.filter((p) => p.origin === "THEIR_COUNTER")
          .length,
        latestOffer: latestProposal
          ? {
              id: latestProposal.id,
              name: latestProposal.name,
              offerNumber: latestProposal.offerNumber,
              origin: latestProposal.origin,
              status: latestProposal.status,
              updatedAt: latestProposal.updatedAt,
            }
          : null,
        latestMetrics: metrics
          ? {
              totalRent: metrics.totalRent,
              npv: metrics.npv,
              irr: metrics.irr,
            }
          : null,
        // PERF: Removed full proposals array from response.
        // Clients should fetch per-negotiation proposals via GET /api/negotiations/[id].
        // Only summary counts and latestOffer are included here.
      };
    });

    return NextResponse.json({ negotiations: result });
  } catch (error) {
    console.error("Error fetching negotiations:", error);
    return NextResponse.json(
      { error: "Failed to fetch negotiations" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/negotiations
 *
 * Create a new negotiation
 */
export async function POST(req: Request) {
  const authResult = await authenticateUserWithRole([Role.ADMIN, Role.PLANNER]);
  if (!authResult.success) return authResult.error;

  try {
    const body = await req.json();

    // Validate request body
    const validationResult = CreateNegotiationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const { developer, property, notes } = validationResult.data;

    // Check if negotiation already exists for this developer+property
    const existing = await prisma.negotiation.findUnique({
      where: {
        developer_property: {
          developer,
          property,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          error: "A negotiation already exists for this developer and property",
          existingId: existing.id,
        },
        { status: 409 },
      );
    }

    // Create the negotiation
    const negotiation = await prisma.negotiation.create({
      data: {
        developer,
        property,
        notes,
        createdBy: authResult.user.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(negotiation, { status: 201 });
  } catch (error) {
    console.error("Error creating negotiation:", error);
    return NextResponse.json(
      { error: "Failed to create negotiation" },
      { status: 500 },
    );
  }
}
