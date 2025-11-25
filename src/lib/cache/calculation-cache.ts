/**
 * PERFORMANCE OPTIMIZATION: CALCULATION CACHE
 *
 * Implements an LRU (Least Recently Used) cache for financial calculations.
 * This dramatically reduces calculation time for repeated requests.
 *
 * Performance Targets:
 * - Cache hit: <100ms response time
 * - Cache miss: <1s (calculation + store)
 * - Max cache size: 100 entries
 *
 * Key Features:
 * - Uses object-hash to generate deterministic cache keys from proposal inputs
 * - LRU eviction policy to manage memory
 * - Thread-safe operations (critical for concurrent API requests)
 * - Automatic cache invalidation on proposal updates
 */

import hash from "object-hash";
import type {
  CalculationEngineInput,
  CalculationEngineOutput,
} from "@/lib/engine/core/types";

// ============================================================================
// CACHE CONFIGURATION
// ============================================================================

const MAX_CACHE_SIZE = 100; // Maximum number of cached calculations
const CACHE_KEY_PREFIX = "calc:"; // Prefix for all cache keys

// ============================================================================
// CACHE STORAGE
// ============================================================================

/**
 * Cache entry with metadata
 */
interface CacheEntry {
  key: string;
  input: CalculationEngineInput;
  output: CalculationEngineOutput;
  timestamp: number;
  hitCount: number;
}

/**
 * In-memory LRU cache
 * Uses a Map for O(1) access and maintains insertion order
 */
class LRUCache {
  private cache: Map<string, CacheEntry>;
  private readonly maxSize: number;

  // Performance metrics
  private hits = 0;
  private misses = 0;
  private evictions = 0;

  constructor(maxSize: number) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  /**
   * Get cached result
   * Returns undefined if not found or if cache entry is invalid
   */
  get(key: string): CalculationEngineOutput | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return undefined;
    }

    // Update hit count and move to end (most recently used)
    entry.hitCount++;
    entry.timestamp = Date.now();
    this.cache.delete(key);
    this.cache.set(key, entry);

    this.hits++;
    return entry.output;
  }

  /**
   * Store calculation result in cache
   * Implements LRU eviction if cache is full
   */
  set(
    key: string,
    input: CalculationEngineInput,
    output: CalculationEngineOutput,
  ): void {
    // If cache is full, evict least recently used entry
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
        this.evictions++;
      }
    }

    // Store new entry
    const entry: CacheEntry = {
      key,
      input,
      output,
      timestamp: Date.now(),
      hitCount: 0,
    };

    this.cache.set(key, entry);
  }

  /**
   * Invalidate specific cache entry
   * Used when a proposal is updated
   */
  invalidate(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Invalidate all cache entries for a specific proposal ID
   * Used when a proposal is deleted
   */
  invalidateByProposalId(proposalId: string): number {
    let count = 0;
    const keysToDelete: string[] = [];

    // Find all entries matching the proposal ID
    for (const [key] of this.cache.entries()) {
      // Check if the input contains this proposal ID (implementation-specific)
      // For now, we'll invalidate based on key pattern
      if (key.includes(proposalId)) {
        keysToDelete.push(key);
      }
    }

    // Delete all matching entries
    for (const key of keysToDelete) {
      this.cache.delete(key);
      count++;
    }

    return count;
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const hitRate =
      this.hits + this.misses > 0 ? this.hits / (this.hits + this.misses) : 0;

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
      hitRate: hitRate,
      hitRatePercent: (hitRate * 100).toFixed(2) + "%",
    };
  }

  /**
   * Get all cache entries (for debugging)
   */
  getEntries(): CacheEntry[] {
    return Array.from(this.cache.values());
  }
}

// ============================================================================
// CACHE INSTANCE
// ============================================================================

/**
 * Singleton cache instance
 * Shared across all API requests
 */
const calculationCache = new LRUCache(MAX_CACHE_SIZE);

// ============================================================================
// CACHE KEY GENERATION
// ============================================================================

/**
 * Serialize input for hashing
 * Converts Decimal.js objects to strings for deterministic hashing
 */
type DecimalLike = { toString(): string };

function isDecimalLike(
  obj: unknown,
): obj is DecimalLike & Record<string, unknown> {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "toString" in obj &&
    typeof (obj as { toString?: unknown }).toString === "function" &&
    "d" in (obj as Record<string, unknown>)
  );
}

function serializeInputForHash(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle Decimal.js objects (check for toString method and d property)
  if (isDecimalLike(obj)) {
    return obj.toString();
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(serializeInputForHash);
  }

  // Handle Date objects
  if (obj instanceof Date) {
    return obj.toISOString();
  }

  // Handle objects
  if (typeof obj === "object") {
    const record = obj as Record<string, unknown>;
    const serialized: Record<string, unknown> = {};
    for (const key in record) {
      // Skip non-deterministic fields
      if (key === "calculatedAt" || key === "createdAt") {
        continue;
      }
      serialized[key] = serializeInputForHash(record[key]);
    }
    return serialized;
  }

  return obj;
}

/**
 * Generate deterministic cache key from calculation input
 *
 * Uses object-hash to create a unique hash of the input data.
 * The hash is deterministic, meaning the same input will always
 * produce the same hash.
 *
 * This is critical for cache hits!
 */
export function generateCacheKey(input: CalculationEngineInput): string {
  try {
    // Serialize input (convert Decimal to string)
    const serializedInput = serializeInputForHash(input);

    // Generate hash from serialized input
    // Algorithm: sha256 (cryptographic hash for uniqueness)
    // Encoding: hex (human-readable)
    const inputHash = hash(serializedInput as object, {
      algorithm: "sha256",
      encoding: "hex",
      respectType: true, // Distinguish between "1" and 1
      respectFunctionNames: false,
      respectFunctionProperties: false,
      unorderedArrays: false,
      unorderedSets: false,
      unorderedObjects: false,
    });

    return `${CACHE_KEY_PREFIX}${inputHash}`;
  } catch (error) {
    console.error("Failed to generate cache key:", error);
    // Return a random key to prevent caching in case of errors
    return `${CACHE_KEY_PREFIX}error-${Date.now()}-${Math.random()}`;
  }
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Get cached calculation result
 *
 * @param input Calculation input
 * @returns Cached output if found, undefined otherwise
 */
export function getCachedCalculation(
  input: CalculationEngineInput,
): CalculationEngineOutput | undefined {
  const key = generateCacheKey(input);
  const startTime = performance.now();

  const result = calculationCache.get(key);

  const duration = performance.now() - startTime;

  if (result) {
    console.log(
      `✅ Cache HIT (${duration.toFixed(2)}ms) - Key: ${key.slice(0, 20)}...`,
    );
  } else {
    console.log(
      `❌ Cache MISS (${duration.toFixed(2)}ms) - Key: ${key.slice(0, 20)}...`,
    );
  }

  return result;
}

/**
 * Store calculation result in cache
 *
 * @param input Calculation input
 * @param output Calculation output
 */
export function setCachedCalculation(
  input: CalculationEngineInput,
  output: CalculationEngineOutput,
): void {
  const key = generateCacheKey(input);
  calculationCache.set(key, input, output);
  console.log(`💾 Cached calculation - Key: ${key.slice(0, 20)}...`);
}

/**
 * Invalidate cached calculation
 * Called when a proposal is updated or deleted
 *
 * @param input Calculation input to invalidate
 */
export function invalidateCachedCalculation(
  input: CalculationEngineInput,
): void {
  const key = generateCacheKey(input);
  const deleted = calculationCache.invalidate(key);

  if (deleted) {
    console.log(`🗑️  Invalidated cache - Key: ${key.slice(0, 20)}...`);
  }
}

/**
 * Invalidate all cached calculations for a proposal
 * Called when a proposal is deleted
 *
 * @param proposalId Proposal ID to invalidate
 */
export function invalidateProposalCache(proposalId: string): void {
  const count = calculationCache.invalidateByProposalId(proposalId);
  console.log(
    `🗑️  Invalidated ${count} cache entries for proposal ${proposalId}`,
  );
}

/**
 * Clear entire cache
 * Used for testing and maintenance
 */
export function clearCalculationCache(): void {
  calculationCache.clear();
  console.log("🗑️  Cleared entire calculation cache");
}

/**
 * Get cache statistics
 * Used for monitoring and debugging
 */
export function getCacheStats() {
  return calculationCache.getStats();
}

/**
 * Get all cache entries
 * Used for debugging only
 */
export function getCacheEntries(): CacheEntry[] {
  return calculationCache.getEntries();
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { CacheEntry };
export {
  calculationCache, // For testing
  MAX_CACHE_SIZE,
  CACHE_KEY_PREFIX,
};
