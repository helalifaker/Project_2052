"use client";

import { useAuth } from "./useAuth";
import { Role } from "@/lib/types/roles";

/**
 * useRoleCheck Hook
 *
 * Provides convenient role-checking utilities for UI components.
 * Extends useAuth with permission-based helpers.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { canEdit, canCreate, canDelete, isViewer } = useRoleCheck();
 *
 *   return (
 *     <div>
 *       {canEdit && <EditButton />}
 *       {canCreate && <CreateButton />}
 *       {canDelete && <DeleteButton />}
 *       {isViewer && <ReadOnlyNotice />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useRoleCheck() {
  const { user, hasRole, isViewer, isAdmin, isPlanner, loading } = useAuth();

  /**
   * Check if user can edit proposals (ADMIN or PLANNER)
   */
  const canEdit = hasRole([Role.ADMIN, Role.PLANNER]);

  /**
   * Check if user can create proposals (ADMIN or PLANNER)
   */
  const canCreate = hasRole([Role.ADMIN, Role.PLANNER]);

  /**
   * Check if user can delete proposals (ADMIN or PLANNER)
   */
  const canDelete = hasRole([Role.ADMIN, Role.PLANNER]);

  /**
   * Check if user can run scenarios (ADMIN or PLANNER)
   * VIEWER can view but cannot save scenarios
   */
  const canRunScenarios = hasRole([Role.ADMIN, Role.PLANNER]);

  /**
   * Check if user can configure system settings (ADMIN only)
   */
  const canConfigureSystem = isAdmin;

  /**
   * Check if user can manage historical data (ADMIN only)
   */
  const canManageHistoricalData = isAdmin;

  /**
   * Check if user can manage CapEx (ADMIN only)
   */
  const canManageCapEx = isAdmin;

  return {
    user,
    loading,
    // Role flags
    isAdmin,
    isPlanner,
    isViewer,
    // Permission flags
    canEdit,
    canCreate,
    canDelete,
    canRunScenarios,
    canConfigureSystem,
    canManageHistoricalData,
    canManageCapEx,
    // Raw role check function
    hasRole,
  };
}

