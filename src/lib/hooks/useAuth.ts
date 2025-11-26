"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Role } from "@/lib/types/roles";

/**
 * Authenticated User Data
 */
export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  name?: string;
}

/**
 * useAuth Hook
 *
 * Provides authentication state and user role information.
 * Fetches user data from Supabase Auth and database.
 *
 * @returns {object} Auth state
 * @property {AuthUser | null} user - Current authenticated user with role
 * @property {boolean} loading - Whether auth state is being loaded
 * @property {boolean} isAdmin - Convenience flag for admin check
 * @property {boolean} isPlanner - Convenience flag for planner check
 * @property {boolean} isViewer - Convenience flag for viewer check
 * @property {Function} hasRole - Function to check if user has specific role(s)
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, loading, isAdmin, hasRole } = useAuth();
 *
 *   if (loading) return <Loader />;
 *   if (!user) return <LoginPrompt />;
 *
 *   return (
 *     <div>
 *       <h1>Welcome {user.email}</h1>
 *       {isAdmin && <AdminPanel />}
 *       {hasRole([Role.ADMIN, Role.PLANNER]) && <CreateButton />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Fetch current user
    async function fetchUser() {
      try {
        setLoading(true);

        // Get Supabase auth user
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !authUser) {
          setUser(null);
          return;
        }

        // Fetch user details from database (includes role)
        const response = await fetch(`/api/users/${authUser.id}`);

        if (!response.ok) {
          console.error("Failed to fetch user details");
          setUser(null);
          return;
        }

        const userData = await response.json();

        setUser({
          id: userData.id,
          email: userData.email,
          role: userData.role,
          name: userData.name,
        });
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUser();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Check if user has one of the specified roles
   */
  const hasRole = (roles: Role | Role[]): boolean => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  return {
    user,
    loading,
    isAdmin: user?.role === Role.ADMIN,
    isPlanner: user?.role === Role.PLANNER,
    isViewer: user?.role === Role.VIEWER,
    hasRole,
  };
}

/**
 * Hook to check if user has required permissions
 * Throws error or redirects if unauthorized
 *
 * @param requiredRoles - Role(s) required to access the resource
 * @param redirectOnFail - Path to redirect to if unauthorized (default: null)
 *
 * @example
 * ```tsx
 * function AdminPage() {
 *   const { user, loading } = useRequireAuth([Role.ADMIN], '/');
 *
 *   if (loading) return <Loader />;
 *
 *   return <AdminDashboard user={user} />;
 * }
 * ```
 */
export function useRequireAuth(
  requiredRoles: Role | Role[],
  redirectOnFail: string | null = null,
) {
  const auth = useAuth();
  const { user, loading, hasRole } = auth;

  useEffect(() => {
    if (!loading && !user) {
      if (redirectOnFail) {
        window.location.href = redirectOnFail;
      }
    }

    if (!loading && user && !hasRole(requiredRoles)) {
      if (redirectOnFail) {
        window.location.href = redirectOnFail;
      } else {
        console.error("Unauthorized: Insufficient permissions");
      }
    }
  }, [user, loading, hasRole, requiredRoles, redirectOnFail]);

  return auth;
}
