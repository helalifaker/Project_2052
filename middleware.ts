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
  const { pathname } = request.nextUrl;

  // Create a response that we can modify
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Create Supabase client with proper cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
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

  // Refresh session if needed (this also updates cookies automatically)
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // Allow access to public routes regardless of auth status
  if (isPublicRoute(pathname)) {
    return supabaseResponse;
  }

  // Redirect unauthenticated users to login
  if (error || !user) {
    const loginUrl = new URL("/login", request.url);
    // Preserve the original URL as a redirect parameter
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // User is authenticated, allow access
  return supabaseResponse;
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
