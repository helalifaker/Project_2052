import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateUserWithRole } from "@/middleware/auth";
import { Role, ProposalStatus, ProposalOrigin } from "@/lib/types/roles";

type NegotiationThread = {
  developer: string;
  property: string;
  totalRounds: number;
  currentRound: number;
  latestVersion?: string | null;
  latestStatus: ProposalStatus;
  latestOrigin: ProposalOrigin;
  lastActivity: Date;
  proposals: Array<{
    id: string;
    version: string | null;
    origin: ProposalOrigin;
    status: ProposalStatus;
    negotiationRound: number;
    createdAt: Date;
    updatedAt: Date;
  }>;
};

type LeaseProposalWhereInput = {
  developer?: string;
  property?: string;
  status?: ProposalStatus | { in: ProposalStatus[] };
};

const ACTIVE_STATUSES: ProposalStatus[] = [
  ProposalStatus.DRAFT,
  ProposalStatus.READY_TO_SUBMIT,
  ProposalStatus.SUBMITTED,
  ProposalStatus.UNDER_REVIEW,
  ProposalStatus.COUNTER_RECEIVED,
  ProposalStatus.EVALUATING_COUNTER,
];

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
    const propertyFilter = searchParams.get("property") || undefined;

    const where: LeaseProposalWhereInput = {};
    if (developerFilter) where.developer = developerFilter;
    if (propertyFilter) where.property = propertyFilter;

    // Handle status filtering
    if (statusFilter === "active") {
      where.status = { in: ACTIVE_STATUSES };
    } else if (statusFilter === "closed") {
      where.status = {
        in: [
          ProposalStatus.ACCEPTED,
          ProposalStatus.REJECTED,
          ProposalStatus.NEGOTIATION_CLOSED,
        ],
      };
    } else if (
      statusFilter &&
      Object.values(ProposalStatus).includes(statusFilter as ProposalStatus)
    ) {
      where.status = statusFilter as ProposalStatus;
    }

    const proposals = await prisma.leaseProposal.findMany({
      where,
      orderBy: [
        { developer: "asc" },
        { property: "asc" },
        { updatedAt: "desc" },
      ],
    });

    const threads = new Map<string, NegotiationThread>();

    for (const proposal of proposals) {
      const dev = proposal.developer || "Unknown Developer";
      const prop = proposal.property || "Unknown Property";
      const key = `${dev}::${prop}`;

      const existing = threads.get(key);
      const currentRound = proposal.negotiationRound || 1;

      const entry: NegotiationThread = existing || {
        developer: dev,
        property: prop,
        totalRounds: currentRound,
        currentRound,
        latestVersion: proposal.version,
        latestStatus: proposal.status as ProposalStatus,
        latestOrigin: proposal.origin as ProposalOrigin,
        lastActivity: proposal.updatedAt,
        proposals: [],
      };

      entry.totalRounds = Math.max(entry.totalRounds, currentRound);
      if (proposal.updatedAt > entry.lastActivity) {
        entry.currentRound = currentRound;
        entry.latestVersion = proposal.version;
        entry.latestStatus = proposal.status as ProposalStatus;
        entry.latestOrigin = proposal.origin as ProposalOrigin;
        entry.lastActivity = proposal.updatedAt;
      }

      entry.proposals.push({
        id: proposal.id,
        version: proposal.version,
        origin: proposal.origin as ProposalOrigin,
        status: proposal.status as ProposalStatus,
        negotiationRound: currentRound,
        createdAt: proposal.createdAt,
        updatedAt: proposal.updatedAt,
      });

      threads.set(key, entry);
    }

    // Sort proposals within thread by round desc then updated
    const result = Array.from(threads.values()).map((thread) => ({
      ...thread,
      proposals: thread.proposals.sort((a, b) => {
        if (a.negotiationRound === b.negotiationRound) {
          return b.updatedAt.getTime() - a.updatedAt.getTime();
        }
        return b.negotiationRound - a.negotiationRound;
      }),
    }));

    return NextResponse.json({ negotiations: result });
  } catch (error) {
    console.error("Error fetching negotiations:", error);
    return NextResponse.json(
      { error: "Failed to fetch negotiations" },
      { status: 500 },
    );
  }
}
