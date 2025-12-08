/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateUserWithRole } from "@/middleware/auth";
import { Role } from "@/lib/types/roles";
import type { LeaseProposalWhereInput } from "@/lib/types/prisma-helpers";
import {
  CreateProposalSchema,
  RentModelSchema,
} from "@/lib/validation/proposal";
import { z } from "zod";

// Constants for pagination limits
const MIN_PAGE_SIZE = 1;
const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 10;

// Request size limit (1MB)
const MAX_REQUEST_SIZE = 1 * 1024 * 1024;

export async function GET(request: Request) {
  // Check auth - allow all authenticated roles to view proposals
  const authResult = await authenticateUserWithRole([
    Role.ADMIN,
    Role.PLANNER,
    Role.VIEWER,
  ]);
  if (!authResult.success) return authResult.error;

  try {
    const { searchParams } = new URL(request.url);

    // Pagination with limits
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const requestedPageSize = parseInt(
      searchParams.get("pageSize") || String(DEFAULT_PAGE_SIZE),
    );
    const pageSize = Math.min(
      MAX_PAGE_SIZE,
      Math.max(MIN_PAGE_SIZE, requestedPageSize),
    );
    const skip = (page - 1) * pageSize;

    // Filtering
    const search = searchParams.get("search");
    const rentModel = searchParams.get("rentModel");
    const createdBy = searchParams.get("createdBy");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const unlinked = searchParams.get("unlinked") === "true";

    // Sorting with validation to prevent injection
    const allowedSortFields = [
      "name",
      "createdAt",
      "updatedAt",
      "calculatedAt",
      "developer",
      "rentModel",
      "status",
    ];
    const requestedSortBy = searchParams.get("sortBy") || "createdAt";
    const sortBy = allowedSortFields.includes(requestedSortBy)
      ? requestedSortBy
      : "createdAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as
      | "asc"
      | "desc";

    // Build where clause
    const where: LeaseProposalWhereInput = {};

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    const rentModelValue =
      rentModel as (typeof RentModelSchema.options)[number];
    if (rentModel && RentModelSchema.options.includes(rentModelValue)) {
      where.rentModel = rentModelValue;
    }

    if (createdBy) {
      where.createdBy = createdBy;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    // Filter for unlinked proposals (not linked to any negotiation)
    if (unlinked) {
      where.negotiationId = null;
    }

    // Get total count for pagination
    const total = await prisma.leaseProposal.count({ where });

    // PERFORMANCE OPTIMIZATION: Use select to fetch only needed fields
    // Don't fetch large 'financials' JSON field for list view!
    const proposals = await prisma.leaseProposal.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: pageSize,
      select: {
        id: true,
        name: true,
        rentModel: true,
        contractPeriodYears: true, // For comparison page period mismatch detection
        developer: true,
        property: true,
        status: true,
        origin: true,
        purpose: true, // For LinkProposalDialog filtering
        negotiationId: true, // For LinkProposalDialog to identify unlinked proposals
        negotiationRound: true,
        createdAt: true,
        updatedAt: true,
        calculatedAt: true,
        // Exclude large fields: financials, transition, enrollment, etc.
        metrics: true, // Keep metrics for dashboard cards
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    });

    // SECURITY: Filter creator info based on user role
    // Non-admin users only see creator name, not email/role
    const { user } = authResult;
    const filteredProposals = proposals.map((proposal) => ({
      ...proposal,
      creator: proposal.creator
        ? user.role === Role.ADMIN
          ? proposal.creator
          : {
              id: proposal.creator.id,
              name: proposal.creator.name,
            }
        : null,
    }));

    // Short cache with stale-while-revalidate for proposal list
    return NextResponse.json(
      {
        data: filteredProposals,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
      {
        headers: {
          "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
        },
      },
    );
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
  const authResult = await authenticateUserWithRole([Role.ADMIN, Role.PLANNER]);
  if (!authResult.success) return authResult.error;

  const { user } = authResult;

  try {
    // Check content-length header for request size limit
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_REQUEST_SIZE) {
      return NextResponse.json(
        {
          error: "Request body too large",
          maxSize: `${MAX_REQUEST_SIZE / 1024 / 1024}MB`,
        },
        { status: 413 },
      );
    }

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

    // Convert otherOpexPercent to Decimal (Prisma handles conversion automatically)
    const otherOpexPercentDecimal = validatedData.otherOpexPercent;

    // Fetch TransitionConfig to record audit timestamp
    const transitionConfig = await prisma.transitionConfig.findFirst();

    // Create proposal (use authenticated user's ID)
    const proposal = await prisma.leaseProposal.create({
      data: {
        name: validatedData.name,
        rentModel: validatedData.rentModel,
        createdBy: user.id,
        enrollment: validatedData.enrollment as any,
        curriculum: validatedData.curriculum as any,
        staff: validatedData.staff as any,
        rentParams: validatedData.rentParams as any,
        otherOpexPercent: otherOpexPercentDecimal,
        financials: (validatedData.financials as any) ?? undefined,
        metrics: (validatedData.metrics as any) ?? undefined,
        calculatedAt: validatedData.calculatedAt
          ? new Date(validatedData.calculatedAt)
          : null,
        transitionConfigUpdatedAt: transitionConfig?.updatedAt || new Date(),
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
      { error: "Failed to create proposal. Please try again." },
      { status: 500 },
    );
  }
}
