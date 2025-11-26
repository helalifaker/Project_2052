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
      const response = await fetch(`/api/auth/session`, {
        credentials: "include", // Ensure cookies are sent
      });

      if (!response.ok) {
        // If 401, user is not authenticated - this is expected
        if (response.status === 401) {
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
      console.error("Error fetching user data:", error);
      return null;
    }
  }, []);

  /**
   * Refresh user state from Supabase and database
   */
  const refreshUser = useCallback(async () => {
    const supabase = createClient();

    try {
      setLoading(true);

      const {
        data: { user: authUser },
        error,
      } = await supabase.auth.getUser();

      if (error || !authUser) {
        setUser(null);
        return;
      }

      const userData = await fetchUserData(authUser.id);
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
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
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

    // Initial fetch
    refreshUser();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const userData = await fetchUserData(session.user.id);
        setUser(userData);
        setLoading(false);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setLoading(false);
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        // Silently refresh user data on token refresh
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
