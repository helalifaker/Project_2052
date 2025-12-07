import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

/**
 * Authenticated user with role from database
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
}

// ============================================================================
// SESSION CACHE - Reduces database lookups by caching user data
// ============================================================================

interface CachedUser {
  user: AuthenticatedUser;
  expiresAt: number;
}

/**
 * In-memory cache for authenticated user sessions.
 * TTL: 10 minutes - balances performance with role change propagation.
 */
const SESSION_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_CACHE_SIZE = 1000; // Prevent unbounded growth
const userSessionCache = new Map<string, CachedUser>();

/**
 * Get cached user data if not expired
 */
function getCachedUser(userId: string): AuthenticatedUser | null {
  const cached = userSessionCache.get(userId);
  if (!cached) return null;

  // Check if expired
  if (Date.now() > cached.expiresAt) {
    userSessionCache.delete(userId);
    return null;
  }

  return cached.user;
}

/**
 * Cache user data with TTL
 */
function cacheUser(user: AuthenticatedUser): void {
  // Prevent unbounded cache growth - evict oldest if at limit
  if (userSessionCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = userSessionCache.keys().next().value;
    if (oldestKey) userSessionCache.delete(oldestKey);
  }

  userSessionCache.set(user.id, {
    user,
    expiresAt: Date.now() + SESSION_CACHE_TTL_MS,
  });
}

/**
 * Invalidate a user's cached session (call on role change, logout, etc.)
 */
export function invalidateUserSession(userId: string): void {
  userSessionCache.delete(userId);
}

/**
 * Clear all cached sessions (useful for testing or admin actions)
 */
export function clearAllSessions(): void {
  userSessionCache.clear();
}

/**
 * Result of authentication attempt
 */
export type AuthResult =
  | { success: true; user: AuthenticatedUser }
  | { success: false; error: NextResponse };

/**
 * Creates a Supabase server client for API routes
 */
async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Support both old (ANON_KEY) and new (PUBLISHABLE_KEY) naming conventions
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    console.error("Missing Supabase env vars:", { url: !!url, key: !!key });
    throw new Error("Missing Supabase URL or Key");
  }

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component - cookies are read-only
        }
      },
    },
  });
}

/**
 * Authenticates a user from the request and fetches their role from the database
 *
 * @returns AuthResult with user data or error response
 *
 * @example
 * ```ts
 * export async function GET() {
 *   const authResult = await authenticateUser();
 *   if (!authResult.success) return authResult.error;
 *
 *   const { user } = authResult;
 *   // user.id, user.email, user.role are now available
 * }
 * ```
 */
export async function authenticateUser(): Promise<AuthResult> {
  try {
    const supabase = await createSupabaseServerClient();

    // Get authenticated user from Supabase Auth (JWT validation - always required)
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      console.error("Supabase auth error:", authError);
      return {
        success: false,
        error: NextResponse.json(
          { error: "Unauthorized - Authentication required" },
          { status: 401 },
        ),
      };
    }

    // Check session cache first (avoids database lookup)
    const cachedUser = getCachedUser(authUser.id);
    if (cachedUser) {
      return { success: true, user: cachedUser };
    }

    // Cache miss - fetch user details from database to get role
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: authUser.id },
        select: { id: true, email: true, role: true },
      });

      if (!dbUser) {
        return {
          success: false,
          error: NextResponse.json(
            { error: "User not found in database" },
            { status: 404 },
          ),
        };
      }

      const authenticatedUser: AuthenticatedUser = {
        id: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
      };

      // Cache the user for subsequent requests
      cacheUser(authenticatedUser);

      return { success: true, user: authenticatedUser };
    } catch (dbError) {
      console.error("Database error in authenticateUser:", dbError);
      return {
        success: false,
        error: NextResponse.json(
          { error: "Database authentication error. Please try again." },
          { status: 500 },
        ),
      };
    }
  } catch (error) {
    console.error("Unexpected error in authenticateUser:", error);
    return {
      success: false,
      error: NextResponse.json(
        { error: "Authentication failed. Please try again." },
        { status: 500 },
      ),
    };
  }
}

/**
 * Authenticates a user and checks if they have one of the required roles
 *
 * @param allowedRoles - Array of roles that are allowed to access the resource
 * @returns AuthResult with user data or error response
 *
 * @example
 * ```ts
 * export async function PUT(request: Request) {
 *   const authResult = await authenticateUserWithRole([Role.ADMIN]);
 *   if (!authResult.success) return authResult.error;
 *
 *   const { user } = authResult;
 *   // Only admins reach this point
 * }
 * ```
 */
export async function authenticateUserWithRole(
  allowedRoles: Role[],
): Promise<AuthResult> {
  const authResult = await authenticateUser();

  if (!authResult.success) {
    return authResult;
  }

  const { user } = authResult;

  // Check if user has required role
  if (!allowedRoles.includes(user.role)) {
    return {
      success: false,
      error: NextResponse.json(
        { error: "Forbidden - Insufficient permissions" },
        { status: 403 },
      ),
    };
  }

  return { success: true, user };
}
