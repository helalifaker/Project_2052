/**
 * Next.js Middleware for Authentication
 *
 * This middleware handles:
 * - Session validation for protected routes
 * - Automatic session refresh
 * - Redirects for unauthenticated users
 * - Public route access
 *
 * Uses @supabase/ssr for proper cookie handling in middleware context.
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Generate a unique request ID for error correlation
 */
function generateRequestId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `req_${timestamp}_${random}`;
}

/**
 * Get existing request ID from headers or generate new one
 */
function getOrCreateRequestId(request: NextRequest): string {
  return (
    request.headers.get("X-Request-ID") ||
    request.headers.get("X-Correlation-ID") ||
    generateRequestId()
  );
}

/**
 * Public routes that don't require authentication
 */
const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/api/auth/callback",
  "/api/auth/logout",
  "/api/auth/signup",
  "/api/auth/signin",
  "/health",
  "/api/health",
];

/**
 * Timeout duration for Supabase auth calls (in milliseconds)
 * Prevents dev server from hanging when Supabase is slow/unreachable
 */
const AUTH_TIMEOUT_MS = 5000;

/**
 * Check if a path is public (doesn't require authentication)
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Main middleware function
 */
export async function middleware(request: NextRequest) {
  // Generate request ID for error correlation
  const requestId = getOrCreateRequestId(request);

  try {
    const { pathname } = request.nextUrl;

    // Create a response that we can modify, including the request ID header
    let supabaseResponse = NextResponse.next({
      request,
    });
    supabaseResponse.headers.set("X-Request-ID", requestId);

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    // Support both old (ANON_KEY) and new (PUBLISHABLE_KEY) naming conventions
    const key =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!url || !key) {
      console.error(`[${requestId}] Middleware: Missing Supabase env vars`, {
        url: !!url,
        key: !!key,
      });
      return NextResponse.json(
        {
          error: "Configuration Error: Missing Supabase URL or Key",
          requestId,
        },
        { status: 500, headers: { "X-Request-ID": requestId } },
      );
    }

    // Create Supabase client with proper cookie handling
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Set on the request for immediate use
            request.cookies.set({
              name,
              value,
              ...options,
            });
            // Set on the response to persist
            supabaseResponse = NextResponse.next({
              request,
            });
            supabaseResponse.cookies.set({
              name,
              value,
              ...options,
            });
          });
        },
      },
    });

    // Allow access to public routes regardless of auth status
    if (isPublicRoute(pathname)) {
      return supabaseResponse;
    }

    // Try to get the user - this will refresh the session if needed
    // IMPORTANT: Wrap in Promise.race with timeout to prevent dev server hangs
    // when Supabase is slow or unreachable
    let user = null;
    let authError = null;

    try {
      const authPromise = supabase.auth.getUser();
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Auth timeout")), AUTH_TIMEOUT_MS),
      );

      const result = await Promise.race([authPromise, timeoutPromise]);
      user = result.data?.user ?? null;
      authError = result.error;
    } catch (err) {
      // Handle timeout or other errors
      if (err instanceof Error && err.message === "Auth timeout") {
        console.warn(
          `[Middleware] Auth timeout after ${AUTH_TIMEOUT_MS}ms for ${pathname}`,
        );
        // On timeout, treat as unauthenticated and redirect to login
        // This prevents the server from hanging indefinitely
        if (pathname.startsWith("/api/")) {
          return NextResponse.json(
            {
              error: "Authentication timeout - please try again",
              requestId,
              code: "AUTH_TIMEOUT",
            },
            { status: 503, headers: { "X-Request-ID": requestId } },
          );
        }
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirectTo", pathname);
        loginUrl.searchParams.set("reason", "timeout");
        return NextResponse.redirect(loginUrl);
      }
      // Re-throw unexpected errors
      throw err;
    }

    // If there's an error, check if it's a transient "session missing" error
    // This can happen during session refresh, so we should allow the request through
    // and let the API routes handle authentication
    if (authError) {
      // "Auth session missing!" is a transient error that can occur during session refresh
      // We'll allow the request through and let API routes handle auth
      if (authError.message === "Auth session missing!") {
        // For API routes, return 401 so they can handle it
        if (pathname.startsWith("/api/")) {
          return NextResponse.json(
            {
              error: "Unauthorized - Authentication required",
              requestId,
              code: "UNAUTHORIZED",
            },
            { status: 401, headers: { "X-Request-ID": requestId } },
          );
        }
        // For page routes, redirect to login
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirectTo", pathname);
        return NextResponse.redirect(loginUrl);
      }
      // For other errors, also redirect to login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Redirect unauthenticated users to login
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      // Preserve the original URL as a redirect parameter
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // User is authenticated, allow access
    return supabaseResponse;
  } catch (error) {
    console.error(`[${requestId}] Middleware error:`, error);
    return NextResponse.json(
      {
        error: "Internal server error. Please try again.",
        requestId,
        code: "INTERNAL_ERROR",
      },
      { status: 500, headers: { "X-Request-ID": requestId } },
    );
  }
}

/**
 * Configure which routes the middleware should run on
 *
 * This matcher excludes:
 * - _next/static (static files)
 * - _next/image (image optimization)
 * - favicon.ico
 * - Public assets (images, fonts, etc.)
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (images, fonts, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)",
  ],
};
