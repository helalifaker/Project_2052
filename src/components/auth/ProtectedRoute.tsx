"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { Role } from "@prisma/client";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: Role[];
  redirectTo?: string;
  fallback?: React.ReactNode;
}

/**
 * ProtectedRoute Component
 *
 * Wraps pages that require specific role-based access.
 * Redirects or shows error if user doesn't have required role.
 *
 * @param {Role[]} allowedRoles - Array of roles that can access this route
 * @param {string} redirectTo - Optional redirect path (default: '/')
 * @param {ReactNode} fallback - Optional custom unauthorized UI
 *
 * @example
 * ```tsx
 * export default function AdminPage() {
 *   return (
 *     <ProtectedRoute allowedRoles={[Role.ADMIN]}>
 *       <AdminDashboard />
 *     </ProtectedRoute>
 *   );
 * }
 * ```
 */
export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = "/",
  fallback,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, loading, hasRole } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      // User not authenticated, redirect to login or home
      router.push(redirectTo);
    }

    if (!loading && user && !hasRole(allowedRoles)) {
      // User authenticated but doesn't have required role
      if (redirectTo !== window.location.pathname) {
        router.push(redirectTo);
      }
    }
  }, [user, loading, hasRole, allowedRoles, redirectTo, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Verifying permissions...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized state
  if (!user || !hasRole(allowedRoles)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-6 max-w-md">
          <div className="flex justify-center">
            <div className="rounded-full bg-destructive/10 p-6">
              <ShieldAlert className="h-16 w-16 text-destructive" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="text-muted-foreground">
              You don&apos;t have permission to access this page.
              {allowedRoles.length === 1 && (
                <> Only {allowedRoles[0]} users can access this resource.</>
              )}
            </p>
          </div>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => router.back()}>
              Go Back
            </Button>
            <Button onClick={() => router.push("/")}>Go to Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  // User is authorized, render children
  return <>{children}</>;
}

/**
 * Higher-order component version of ProtectedRoute
 *
 * @example
 * ```tsx
 * const AdminOnlyPage = withProtectedRoute(
 *   AdminDashboard,
 *   [Role.ADMIN]
 * );
 * ```
 */
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: Role[],
  redirectTo?: string,
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute allowedRoles={allowedRoles} redirectTo={redirectTo}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
