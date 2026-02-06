"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { Role } from "@/lib/types/roles";
import { useRouter } from "next/navigation";

/**
 * Fetch with timeout using AbortController
 * Prevents indefinite hangs when API endpoints are slow/unresponsive
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = 5000,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

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
 * Auth Context Value
 */
interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  isPlanner: boolean;
  isViewer: boolean;
  hasRole: (roles: Role | Role[]) => boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider
 *
 * Provides global authentication state to the entire application.
 * Wraps children with auth context for efficient state sharing.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  /**
   * Fetch user data from database
   * Uses /api/auth/session which handles authentication gracefully
   * @param _authUserId - Not used, kept for backward compatibility
   */
  const fetchUserData = useCallback(async (_authUserId?: string) => {
    try {
      // Use fetchWithTimeout to prevent indefinite hangs (5s timeout)
      const response = await fetchWithTimeout(
        `/api/auth/session`,
        { credentials: "include" },
        5000,
      );

      if (!response.ok) {
        // If 401, user is not authenticated - this is expected
        if (response.status === 401) {
          return null;
        }
        // If 500, server error - log but don't crash
        if (response.status === 500) {
          console.warn(
            "Auth session endpoint returned 500 - server may be initializing",
          );
          return null;
        }
        console.error("Failed to fetch user details:", response.status);
        return null;
      }

      const data = await response.json();

      // /api/auth/session returns { user: {...} } or { user: null }
      if (!data.user) {
        return null;
      }

      return {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role as Role,
        name: data.user.name,
      };
    } catch (error) {
      // Handle timeout (AbortError) gracefully
      if (error instanceof DOMException && error.name === "AbortError") {
        console.warn("Auth session request timed out after 5 seconds");
        return null;
      }
      // Network errors (Failed to fetch) are common during dev server startup
      // Don't spam console with errors - just silently return null
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        // Server might not be ready yet - this is expected during startup
        return null;
      }
      console.error("Error fetching user data:", error);
      return null;
    }
  }, []);

  /**
   * Refresh user state from the server session endpoint.
   * The server validates the JWT and checks the DB (with LRU cache),
   * so no client-side getUser() is needed here.
   */
  const refreshUser = useCallback(async () => {
    try {
      setLoading(true);
      const userData = await fetchUserData();
      setUser(userData);
    } catch (error) {
      console.error("Error refreshing user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [fetchUserData]);

  /**
   * Sign out user
   */
  const signOut = useCallback(async () => {
    try {
      // Use fetchWithTimeout for logout to prevent hanging
      await fetchWithTimeout("/api/auth/logout", { method: "POST" }, 5000);
      setUser(null);
      router.push("/login");
      router.refresh();
    } catch (error) {
      // Still clear user and redirect even if logout API fails
      console.error("Error signing out:", error);
      setUser(null);
      router.push("/login");
    }
  }, [router]);

  /**
   * Check if user has one of the specified roles
   */
  const hasRole = useCallback(
    (roles: Role | Role[]): boolean => {
      if (!user) return false;
      const roleArray = Array.isArray(roles) ? roles : [roles];
      return roleArray.includes(user.role);
    },
    [user],
  );

  // Initialize auth state and listen for changes
  useEffect(() => {
    const supabase = createClient();
    let initialFetchDone = false;

    // Initial fetch
    refreshUser().then(() => {
      initialFetchDone = true;
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        // Skip if the initial refreshUser() is still handling this
        if (!initialFetchDone) return;
        const userData = await fetchUserData(session.user.id);
        setUser(userData);
        setLoading(false);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setLoading(false);
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        // Silently refresh user data on token refresh
        // Also invalidate server-side session cache to ensure fresh role data
        try {
          await fetchWithTimeout(
            "/api/auth/invalidate-session",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({}), // Empty body = invalidate own session
              credentials: "include",
            },
            3000, // Shorter timeout for non-critical operation
          );
        } catch {
          // Non-critical - server cache will expire naturally
          console.warn(
            "Failed to invalidate server session cache on token refresh",
          );
        }

        const userData = await fetchUserData(session.user.id);
        setUser(userData);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshUser, fetchUserData]);

  const value: AuthContextValue = {
    user,
    loading,
    isAdmin: user?.role === Role.ADMIN,
    isPlanner: user?.role === Role.PLANNER,
    isViewer: user?.role === Role.VIEWER,
    hasRole,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuthContext Hook
 *
 * Access auth state from AuthProvider context.
 * Must be used within an AuthProvider.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, loading, isAdmin, signOut } = useAuthContext();
 *
 *   if (loading) return <Loader />;
 *
 *   return (
 *     <div>
 *       <span>Welcome, {user?.name}</span>
 *       <button onClick={signOut}>Logout</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuthContext() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }

  return context;
}
