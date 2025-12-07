/**
 * Decimal.js Serialization Utilities for Web Workers
 *
 * When data crosses the worker boundary (via postMessage/workerData), JavaScript's
 * Structured Clone Algorithm serializes objects but doesn't preserve class prototypes.
 * Decimal.js instances become plain objects, causing method calls to fail.
 *
 * This module provides efficient serialization/deserialization with tagged values:
 * - Serialize: Decimal(123.45) → { __decimal: '123.45' }
 * - Deserialize: { __decimal: '123.45' } → Decimal(123.45)
 */

import Decimal from "decimal.js";

// Tag used to identify serialized Decimal values
const DECIMAL_TAG = "__decimal";

/**
 * Recursively serializes Decimal instances to tagged objects.
 * Optimized for the financial engine's data structures.
 *
 * @param value - Any value that may contain Decimal instances
 * @returns Serialized value safe for Structured Clone Algorithm
 */
export function serializeDecimals<T>(value: T): T {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return value;
  }

  // Handle Decimal instances
  if (value instanceof Decimal) {
    return { [DECIMAL_TAG]: value.toString() } as unknown as T;
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return value.map(serializeDecimals) as unknown as T;
  }

  // Handle plain objects (most of the engine output)
  if (typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(value as object)) {
      result[key] = serializeDecimals((value as Record<string, unknown>)[key]);
    }
    return result as T;
  }

  // Primitives pass through unchanged
  return value;
}

/**
 * Recursively deserializes tagged objects back to Decimal instances.
 *
 * @param value - Serialized value from worker boundary
 * @returns Value with Decimal instances restored
 */
export function deserializeDecimals<T>(value: T): T {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return value;
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return value.map(deserializeDecimals) as unknown as T;
  }

  // Handle objects
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;

    // Check if this is a tagged Decimal
    if (DECIMAL_TAG in obj && typeof obj[DECIMAL_TAG] === "string") {
      return new Decimal(obj[DECIMAL_TAG]) as unknown as T;
    }

    // Recursively process object properties
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
      result[key] = deserializeDecimals(obj[key]);
    }
    return result as T;
  }

  // Primitives pass through unchanged
  return value;
}

/**
 * JSON replacer function for serializing Decimal instances.
 * Use with JSON.stringify(value, decimalReplacer)
 */
export function decimalReplacer(_key: string, value: unknown): unknown {
  if (value instanceof Decimal) {
    return { [DECIMAL_TAG]: value.toString() };
  }
  return value;
}

/**
 * JSON reviver function for deserializing Decimal instances.
 * Use with JSON.parse(json, decimalReviver)
 */
export function decimalReviver(_key: string, value: unknown): unknown {
  if (
    value !== null &&
    typeof value === "object" &&
    DECIMAL_TAG in value &&
    typeof (value as Record<string, unknown>)[DECIMAL_TAG] === "string"
  ) {
    return new Decimal((value as Record<string, string>)[DECIMAL_TAG]);
  }
  return value;
}

/**
 * Check if a value contains any Decimal instances.
 * Useful for debugging serialization issues.
 */
export function containsDecimals(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }

  if (value instanceof Decimal) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.some(containsDecimals);
  }

  if (typeof value === "object") {
    return Object.values(value as object).some(containsDecimals);
  }

  return false;
}

/**
 * Check if a value contains any serialized Decimal tags.
 * Useful for verifying deserialization.
 */
export function containsSerializedDecimals(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }

  if (Array.isArray(value)) {
    return value.some(containsSerializedDecimals);
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (DECIMAL_TAG in obj) {
      return true;
    }
    return Object.values(obj).some(containsSerializedDecimals);
  }

  return false;
}
