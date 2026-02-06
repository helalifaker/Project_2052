/**
 * CONFIG CACHE
 *
 * In-memory cache for SystemConfig and TransitionConfig.
 * These values rarely change (admin-only updates) but are fetched on every calculation.
 *
 * Features:
 * - 5-minute TTL (same as auth session cache)
 * - Manual invalidation on config update via PUT routes
 * - Uses Map insertion-order for O(1) operations
 */

import { prisma } from "@/lib/prisma";
import Decimal from "decimal.js";

// ============================================================================
// TYPES
// ============================================================================

interface SystemConfigCached {
  zakatRate: Decimal;
  debtInterestRate: Decimal;
  depositInterestRate: Decimal;
  discountRate: Decimal | undefined;
  minCashBalance: Decimal;
}

interface TransitionConfigCached {
  year2025Students: number;
  year2025AvgTuition: Decimal;
  year2026Students: number;
  year2026AvgTuition: Decimal;
  year2027Students: number;
  year2027AvgTuition: Decimal;
  rentGrowthPercent: Decimal;
}

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

// ============================================================================
// CACHE CONFIGURATION
// ============================================================================

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ============================================================================
// CACHE STORAGE
// ============================================================================

let systemConfigCache: CacheEntry<SystemConfigCached> | null = null;
let transitionConfigCache: CacheEntry<TransitionConfigCached> | null = null;

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Get cached SystemConfig, fetching from DB if cache is empty or expired.
 * Returns null if no config exists in database.
 */
export async function getCachedSystemConfig(): Promise<SystemConfigCached | null> {
  const now = Date.now();

  if (systemConfigCache && now < systemConfigCache.expiresAt) {
    return systemConfigCache.data;
  }

  // Cache miss or expired - fetch from database
  const config = await prisma.systemConfig.findFirst({
    orderBy: { confirmedAt: "desc" },
  });

  if (!config) {
    systemConfigCache = null;
    return null;
  }

  const cached: SystemConfigCached = {
    zakatRate: new Decimal(config.zakatRate),
    debtInterestRate: new Decimal(config.debtInterestRate),
    depositInterestRate: new Decimal(config.depositInterestRate),
    discountRate: config.discountRate
      ? new Decimal(config.discountRate)
      : undefined,
    minCashBalance: new Decimal(config.minCashBalance),
  };

  systemConfigCache = {
    data: cached,
    expiresAt: now + CACHE_TTL_MS,
  };

  return cached;
}

/**
 * Get cached TransitionConfig, fetching from DB if cache is empty or expired.
 * Returns null if no config exists in database.
 */
export async function getCachedTransitionConfig(): Promise<TransitionConfigCached | null> {
  const now = Date.now();

  if (transitionConfigCache && now < transitionConfigCache.expiresAt) {
    return transitionConfigCache.data;
  }

  // Cache miss or expired - fetch from database
  const config = await prisma.transitionConfig.findFirst({
    orderBy: { updatedAt: "desc" },
  });

  if (!config) {
    transitionConfigCache = null;
    return null;
  }

  const cached: TransitionConfigCached = {
    year2025Students: config.year2025Students,
    year2025AvgTuition: new Decimal(config.year2025AvgTuition),
    year2026Students: config.year2026Students,
    year2026AvgTuition: new Decimal(config.year2026AvgTuition),
    year2027Students: config.year2027Students,
    year2027AvgTuition: new Decimal(config.year2027AvgTuition),
    rentGrowthPercent: new Decimal(config.rentGrowthPercent),
  };

  transitionConfigCache = {
    data: cached,
    expiresAt: now + CACHE_TTL_MS,
  };

  return cached;
}

/**
 * Invalidate SystemConfig cache.
 * Call this when config is updated via PUT /api/config.
 */
export function invalidateSystemConfigCache(): void {
  systemConfigCache = null;
}

/**
 * Invalidate TransitionConfig cache.
 * Call this when config is updated via PUT /api/transition-config.
 */
export function invalidateTransitionConfigCache(): void {
  transitionConfigCache = null;
}

/**
 * Invalidate all config caches.
 * Useful for testing or admin actions.
 */
export function invalidateAllConfigCaches(): void {
  systemConfigCache = null;
  transitionConfigCache = null;
}
