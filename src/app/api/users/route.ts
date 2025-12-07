/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateUserWithRole } from "@/middleware/auth";
import { Role } from "@/lib/types/roles";
import type { UserWhereInput } from "@/lib/types/prisma-helpers";
import { PrismaClientKnownRequestError } from "@/lib/types/prisma-helpers";
import { z } from "zod";

// Constants for pagination limits
const MIN_PAGE_SIZE = 1;
const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 20;

// Request size limit (100KB - users don't need large payloads)
const MAX_REQUEST_SIZE = 100 * 1024;

/**
 * Validation schema for creating a new user
 */
const CreateUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(1, "Name is required").max(255, "Name too long"),
  role: z.nativeEnum(Role).default(Role.VIEWER),
});

type CreateUserInput = z.infer<typeof CreateUserSchema>;

/**
 * GET /api/users
 *
 * List all users with pagination and filtering
 * Requires ADMIN role
 */
export async function GET(request: Request) {
  // Check auth - only ADMIN can list all users
  const authResult = await authenticateUserWithRole([Role.ADMIN]);
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
    const role = searchParams.get("role");

    // Sorting
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as
      | "asc"
      | "desc";

    // Validate sortBy to prevent SQL injection
    const allowedSortFields = ["createdAt", "email", "name", "role"];
    const validSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";

    // Build where clause
    const where: UserWhereInput = {};

    if (search) {
      where.OR = [
        {
          email: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (role && Object.values(Role).includes(role as Role)) {
      where.role = role as Role;
    }

    // Get total count for pagination
    const total = await prisma.user.count({ where: where as any });

    // Fetch users with pagination
    const users = await prisma.user.findMany({
      where: where as any,
      orderBy: {
        [validSortBy]: sortOrder,
      },
      skip,
      take: pageSize,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            proposalsCreated: true,
            scenariosCreated: true,
            sensitivityAnalysesCreated: true,
          },
        },
      },
    });

    return NextResponse.json({
      data: users,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/users
 *
 * Create a new user
 * Requires ADMIN role
 */
export async function POST(request: Request) {
  // Check auth - only ADMIN can create users
  const authResult = await authenticateUserWithRole([Role.ADMIN]);
  if (!authResult.success) return authResult.error;

  try {
    // Check content-length header for request size limit
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_REQUEST_SIZE) {
      return NextResponse.json(
        {
          error: "Request body too large",
          maxSize: `${MAX_REQUEST_SIZE / 1024}KB`,
        },
        { status: 413 },
      );
    }

    const body = await request.json();

    // Validate input
    const validationResult = CreateUserSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const validatedData: CreateUserInput = validationResult.data;

    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 },
      );
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        role: validatedData.role as any,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
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

    // Handle Prisma unique constraint violation
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 },
      );
    }

    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
}
