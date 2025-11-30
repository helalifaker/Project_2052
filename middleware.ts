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
 * Public routes that don't require authentication
 */
const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/api/auth/callback",
  "/api/auth/logout",
  "/api/auth/signup",
  "/api/auth/signin",
];

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
  try {
    const { pathname } = request.nextUrl;

    // Create a response that we can modify
    let supabaseResponse = NextResponse.next({
      request,
    });

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ssxwmxqvafesyldycqzy.supabase.co";
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_80OaSML8y7OdJH52Rtr-jQ_B5YM15eD";

    if (!url || !key) {
      console.error("Middleware: Missing Supabase env vars", { url: !!url, key: !!key });
      return NextResponse.json(
        { error: "Configuration Error: Missing Supabase URL or Key" },
        { status: 500 }
      );
    }

    // Create Supabase client with proper cookie handling
    const supabase = createServerClient(
      url,
      key,
      {
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
      },
    );

    // Allow access to public routes regardless of auth status
    if (isPublicRoute(pathname)) {
      return supabaseResponse;
    }

    // Try to get the user - this will refresh the session if needed
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    // If there's an error, check if it's a transient "session missing" error
    // This can happen during session refresh, so we should allow the request through
    // and let the API routes handle authentication
    if (error) {
      // "Auth session missing!" is a transient error that can occur during session refresh
      // We'll allow the request through and let API routes handle auth
      if (error.message === "Auth session missing!") {
        // For API routes, return 401 so they can handle it
        if (pathname.startsWith("/api/")) {
          return NextResponse.json(
            { error: "Unauthorized - Authentication required" },
            { status: 401 },
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
    console.error("Middleware error:", error);
    return NextResponse.json(
      { error: "Middleware Error", details: String(error) },
      { status: 500 }
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
