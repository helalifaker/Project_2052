/**
 * CONSTANTS MODULE - UNIT TESTS
 *
 * Tests for helper functions in the constants module to improve branch coverage.
 */

import { describe, it, expect } from "vitest";
import Decimal from "decimal.js";
import {
  percentToDecimal,
  decimalToPercent,
  isEffectivelyZero,
  areEffectivelyEqual,
  ZERO,
  ONE,
  HUNDRED,
  CONVERGENCE_TOLERANCE,
} from "./constants";

describe("Constants Helper Functions", () => {
  describe("percentToDecimal", () => {
    it("should convert 5% to 0.05", () => {
      const result = percentToDecimal(new Decimal(5));
      expect(result.toNumber()).toBe(0.05);
    });

    it("should convert 100% to 1.0", () => {
      const result = percentToDecimal(new Decimal(100));
      expect(result.toNumber()).toBe(1.0);
    });

    it("should convert 0% to 0", () => {
      const result = percentToDecimal(new Decimal(0));
      expect(result.toNumber()).toBe(0);
    });

    it("should convert 2.5% to 0.025", () => {
      const result = percentToDecimal(new Decimal(2.5));
      expect(result.toNumber()).toBe(0.025);
    });

    it("should handle negative percentages", () => {
      const result = percentToDecimal(new Decimal(-10));
      expect(result.toNumber()).toBe(-0.1);
    });
  });

  describe("decimalToPercent", () => {
    it("should convert 0.05 to 5%", () => {
      const result = decimalToPercent(new Decimal(0.05));
      expect(result.toNumber()).toBe(5);
    });

    it("should convert 1.0 to 100%", () => {
      const result = decimalToPercent(new Decimal(1.0));
      expect(result.toNumber()).toBe(100);
    });

    it("should convert 0 to 0%", () => {
      const result = decimalToPercent(new Decimal(0));
      expect(result.toNumber()).toBe(0);
    });

    it("should convert 0.025 to 2.5%", () => {
      const result = decimalToPercent(new Decimal(0.025));
      expect(result.toNumber()).toBe(2.5);
    });

    it("should handle negative decimals", () => {
      const result = decimalToPercent(new Decimal(-0.1));
      expect(result.toNumber()).toBe(-10);
    });
  });

  describe("isEffectivelyZero", () => {
    it("should return true for exactly zero", () => {
      expect(isEffectivelyZero(ZERO)).toBe(true);
    });

    it("should return true for very small positive value within tolerance", () => {
      expect(isEffectivelyZero(new Decimal(0.001))).toBe(true);
    });

    it("should return true for very small negative value within tolerance", () => {
      expect(isEffectivelyZero(new Decimal(-0.001))).toBe(true);
    });

    it("should return false for value greater than tolerance", () => {
      expect(isEffectivelyZero(new Decimal(1))).toBe(false);
    });

    it("should return false for negative value greater than tolerance", () => {
      expect(isEffectivelyZero(new Decimal(-1))).toBe(false);
    });

    it("should use custom tolerance", () => {
      const customTolerance = new Decimal(100);
      expect(isEffectivelyZero(new Decimal(50), customTolerance)).toBe(true);
      expect(isEffectivelyZero(new Decimal(150), customTolerance)).toBe(false);
    });

    it("should return true for value exactly at tolerance boundary", () => {
      expect(isEffectivelyZero(CONVERGENCE_TOLERANCE)).toBe(true);
    });
  });

  describe("areEffectivelyEqual", () => {
    it("should return true for identical values", () => {
      const value = new Decimal(1000000);
      expect(areEffectivelyEqual(value, value)).toBe(true);
    });

    it("should return true for values within tolerance", () => {
      const a = new Decimal(1000000);
      const b = new Decimal(1000000.005);
      expect(areEffectivelyEqual(a, b)).toBe(true);
    });

    it("should return false for values outside tolerance", () => {
      const a = new Decimal(1000000);
      const b = new Decimal(1000001);
      expect(areEffectivelyEqual(a, b)).toBe(false);
    });

    it("should return true for zero and very small value", () => {
      expect(areEffectivelyEqual(ZERO, new Decimal(0.001))).toBe(true);
    });

    it("should use custom tolerance", () => {
      const a = new Decimal(1000);
      const b = new Decimal(1050);
      const customTolerance = new Decimal(100);
      expect(areEffectivelyEqual(a, b, customTolerance)).toBe(true);
    });

    it("should handle negative values", () => {
      const a = new Decimal(-1000000);
      const b = new Decimal(-1000000.005);
      expect(areEffectivelyEqual(a, b)).toBe(true);
    });

    it("should return false for opposite sign values", () => {
      const a = new Decimal(1);
      const b = new Decimal(-1);
      expect(areEffectivelyEqual(a, b)).toBe(false);
    });
  });
});

describe("Constant Values", () => {
  it("should have correct ZERO value", () => {
    expect(ZERO.toNumber()).toBe(0);
  });

  it("should have correct ONE value", () => {
    expect(ONE.toNumber()).toBe(1);
  });

  it("should have correct HUNDRED value", () => {
    expect(HUNDRED.toNumber()).toBe(100);
  });

  it("should have correct CONVERGENCE_TOLERANCE value", () => {
    expect(CONVERGENCE_TOLERANCE.toNumber()).toBe(0.01);
  });
});
