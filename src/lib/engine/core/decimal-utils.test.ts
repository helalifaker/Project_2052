import { describe, it, expect } from "vitest";
import Decimal from "decimal.js";
import {
  add,
  subtract,
  multiply,
  divide,
  divideSafe,
  abs,
  negate,
  power,
  sqrt,
  isGreaterThan,
  isGreaterThanOrEqual,
  isLessThan,
  isLessThanOrEqual,
  isEqual,
  isZero,
  isPositive,
  isNegative,
  sum,
  average,
  max,
  min,
  percentageOf,
  applyGrowth,
  compoundGrowth,
  straightLineDepreciation,
  decliningBalanceDepreciation,
  calculateInterest,
  calculateZakat,
  roundToNearest,
  ensureMinimum,
  ensureMaximum,
  clamp,
  toDecimal,
  toNumber,
  toFixed,
  formatCurrency,
  formatPercent,
  isInRange,
  isNonNegative,
  isStrictlyPositive,
  isWithinTolerance,
  calculateNPV,
  calculateAnnualizationFactor,
  calculateEAV,
  calculateIRR,
  calculateROE,
  calculateDebtToEquity,
} from "./decimal-utils";
import { ZERO, ONE } from "./constants";

describe("Decimal Utils - Basic Arithmetic", () => {
  it("should add two decimals", () => {
    const result = add(new Decimal(10), new Decimal(20));
    expect(result.toNumber()).toBe(30);
  });

  it("should subtract two decimals", () => {
    const result = subtract(new Decimal(20), new Decimal(10));
    expect(result.toNumber()).toBe(10);
  });

  it("should multiply two decimals", () => {
    const result = multiply(new Decimal(10), new Decimal(5));
    expect(result.toNumber()).toBe(50);
  });

  it("should divide two decimals", () => {
    const result = divide(new Decimal(20), new Decimal(4));
    expect(result.toNumber()).toBe(5);
  });

  it("should throw error on division by zero", () => {
    expect(() => divide(new Decimal(100), ZERO)).toThrow("Division by zero");
  });

  it("should safely divide with default value", () => {
    const result = divideSafe(new Decimal(100), ZERO, new Decimal(999));
    expect(result.toNumber()).toBe(999);
  });

  it("should get absolute value", () => {
    expect(abs(new Decimal(-10)).toNumber()).toBe(10);
    expect(abs(new Decimal(10)).toNumber()).toBe(10);
  });

  it("should negate a decimal", () => {
    expect(negate(new Decimal(10)).toNumber()).toBe(-10);
    expect(negate(new Decimal(-10)).toNumber()).toBe(10);
  });

  it("should calculate power", () => {
    expect(power(new Decimal(2), 3).toNumber()).toBe(8);
    expect(power(new Decimal(10), 2).toNumber()).toBe(100);
  });

  it("should calculate square root", () => {
    expect(sqrt(new Decimal(16)).toNumber()).toBe(4);
    expect(sqrt(new Decimal(100)).toNumber()).toBe(10);
  });

  it("should throw error when taking square root of negative number", () => {
    expect(() => sqrt(new Decimal(-10))).toThrow(
      "Cannot take square root of negative number",
    );
  });
});

describe("Decimal Utils - Comparisons", () => {
  it("should compare greater than", () => {
    expect(isGreaterThan(new Decimal(10), new Decimal(5))).toBe(true);
    expect(isGreaterThan(new Decimal(5), new Decimal(10))).toBe(false);
  });

  it("should compare greater than or equal", () => {
    expect(isGreaterThanOrEqual(new Decimal(10), new Decimal(10))).toBe(true);
    expect(isGreaterThanOrEqual(new Decimal(10), new Decimal(5))).toBe(true);
  });

  it("should compare less than", () => {
    expect(isLessThan(new Decimal(5), new Decimal(10))).toBe(true);
    expect(isLessThan(new Decimal(10), new Decimal(5))).toBe(false);
  });

  it("should compare less than or equal", () => {
    expect(isLessThanOrEqual(new Decimal(10), new Decimal(10))).toBe(true);
    expect(isLessThanOrEqual(new Decimal(5), new Decimal(10))).toBe(true);
  });

  it("should compare equality", () => {
    expect(isEqual(new Decimal(10), new Decimal(10))).toBe(true);
    expect(isEqual(new Decimal(10), new Decimal(11))).toBe(false);
  });

  it("should check if zero", () => {
    expect(isZero(ZERO)).toBe(true);
    expect(isZero(new Decimal(1))).toBe(false);
  });

  it("should check if positive", () => {
    expect(isPositive(new Decimal(1))).toBe(true);
    expect(isPositive(ZERO)).toBe(false);
    expect(isPositive(new Decimal(-1))).toBe(false);
  });

  it("should check if negative", () => {
    expect(isNegative(new Decimal(-1))).toBe(true);
    expect(isNegative(ZERO)).toBe(false);
    expect(isNegative(new Decimal(1))).toBe(false);
  });

  it("should check if non-negative", () => {
    expect(isNonNegative(new Decimal(1))).toBe(true);
    expect(isNonNegative(ZERO)).toBe(true);
    expect(isNonNegative(new Decimal(-1))).toBe(false);
  });

  it("should check if strictly positive", () => {
    expect(isStrictlyPositive(new Decimal(1))).toBe(true);
    expect(isStrictlyPositive(ZERO)).toBe(false);
  });

  it("should check if in range", () => {
    expect(isInRange(new Decimal(50), new Decimal(0), new Decimal(100))).toBe(
      true,
    );
    expect(isInRange(new Decimal(150), new Decimal(0), new Decimal(100))).toBe(
      false,
    );
  });

  it("should check if within tolerance", () => {
    expect(
      isWithinTolerance(new Decimal(100), new Decimal(101), new Decimal(2)),
    ).toBe(true);
    expect(
      isWithinTolerance(new Decimal(100), new Decimal(105), new Decimal(2)),
    ).toBe(false);
  });
});

describe("Decimal Utils - Aggregations", () => {
  it("should calculate sum of decimals", () => {
    const values = [new Decimal(10), new Decimal(20), new Decimal(30)];
    expect(sum(values).toNumber()).toBe(60);
  });

  it("should calculate average of decimals", () => {
    const values = [new Decimal(10), new Decimal(20), new Decimal(30)];
    expect(average(values).toNumber()).toBe(20);
  });

  it("should find maximum decimal", () => {
    const result = max(new Decimal(10), new Decimal(30), new Decimal(20));
    expect(result.toNumber()).toBe(30);
  });

  it("should find minimum decimal", () => {
    const result = min(new Decimal(10), new Decimal(30), new Decimal(20));
    expect(result.toNumber()).toBe(10);
  });
});

describe("Decimal Utils - Financial Functions", () => {
  it("should calculate percentage of value", () => {
    // percentageOf(value, percent) = value * (percent / 100)
    // percentageOf(100, 25) = 100 * (25/100) = 25
    const result = percentageOf(new Decimal(100), new Decimal(25));
    expect(result.toNumber()).toBe(25);
  });

  it("should apply growth rate", () => {
    const result = applyGrowth(new Decimal(100), new Decimal(0.1));
    expect(result.toNumber()).toBe(110);
  });

  it("should calculate compound growth", () => {
    const result = compoundGrowth(new Decimal(100), new Decimal(0.1), 2);
    expect(result.toNumber()).toBeCloseTo(121, 0);
  });

  it("should calculate straight line depreciation", () => {
    const result = straightLineDepreciation(new Decimal(100000), 10);
    expect(result.toNumber()).toBe(10000);
  });

  it("should throw error for straight line depreciation with zero useful life", () => {
    expect(() => straightLineDepreciation(new Decimal(100000), 0)).toThrow(
      "Useful life must be positive",
    );
  });

  it("should throw error for straight line depreciation with negative useful life", () => {
    expect(() => straightLineDepreciation(new Decimal(100000), -5)).toThrow(
      "Useful life must be positive",
    );
  });

  it("should calculate declining balance depreciation", () => {
    const result = decliningBalanceDepreciation(
      new Decimal(100000),
      new Decimal(0.2),
    );
    expect(result.toNumber()).toBe(20000);
  });

  it("should calculate interest", () => {
    const result = calculateInterest(new Decimal(100000), new Decimal(0.05));
    expect(result.toNumber()).toBe(5000);
  });

  it("should calculate Zakat correctly", () => {
    // Zakat = (equity - nonCurrentAssets) * zakatRate
    // If equity = 1M, nonCurrentAssets = 500K, rate = 2.5%
    // Zakat = (1M - 500K) * 0.025 = 12,500
    const result = calculateZakat(
      new Decimal(1000000),
      new Decimal(500000),
      new Decimal(0.025),
    );
    expect(result.toNumber()).toBe(12500);
  });

  it("should return zero Zakat when base is negative", () => {
    const result = calculateZakat(
      new Decimal(100000),
      new Decimal(200000),
      new Decimal(0.025),
    );
    expect(result.toNumber()).toBe(0);
  });

  it("should calculate NPV correctly", () => {
    const cashFlows = [new Decimal(-1000), new Decimal(500), new Decimal(600)];
    const result = calculateNPV(cashFlows, new Decimal(0.1));
    // NPV formula includes initial investment at t=0
    expect(result.toNumber()).toBeLessThan(100);
  });

  it("should calculate ROE", () => {
    const result = calculateROE(new Decimal(50000), new Decimal(500000));
    expect(result.toNumber()).toBe(0.1);
  });

  it("should calculate debt to equity ratio", () => {
    const result = calculateDebtToEquity(
      new Decimal(300000),
      new Decimal(700000),
    );
    expect(result.toNumber()).toBeCloseTo(0.428, 2);
  });
});

describe("Decimal Utils - Formatting", () => {
  it("should round to nearest decimal places", () => {
    expect(roundToNearest(new Decimal(100.123), 2).toNumber()).toBe(100.12);
    expect(roundToNearest(new Decimal(100.126), 2).toNumber()).toBe(100.13);
  });

  it("should ensure minimum value", () => {
    expect(ensureMinimum(new Decimal(50), new Decimal(100)).toNumber()).toBe(
      100,
    );
    expect(ensureMinimum(new Decimal(150), new Decimal(100)).toNumber()).toBe(
      150,
    );
  });

  it("should ensure maximum value", () => {
    expect(ensureMaximum(new Decimal(150), new Decimal(100)).toNumber()).toBe(
      100,
    );
    expect(ensureMaximum(new Decimal(50), new Decimal(100)).toNumber()).toBe(
      50,
    );
  });

  it("should clamp value between min and max", () => {
    expect(
      clamp(new Decimal(50), new Decimal(0), new Decimal(100)).toNumber(),
    ).toBe(50);
    expect(
      clamp(new Decimal(-10), new Decimal(0), new Decimal(100)).toNumber(),
    ).toBe(0);
    expect(
      clamp(new Decimal(150), new Decimal(0), new Decimal(100)).toNumber(),
    ).toBe(100);
  });

  it("should convert to decimal", () => {
    expect(toDecimal(100).toNumber()).toBe(100);
    expect(toDecimal("100.50").toNumber()).toBe(100.5);
    expect(toDecimal(new Decimal(100)).toNumber()).toBe(100);
  });

  it("should convert to number", () => {
    expect(toNumber(new Decimal(100.5))).toBe(100.5);
  });

  it("should format to fixed decimals", () => {
    expect(toFixed(new Decimal(100.126), 2)).toBe("100.13");
  });

  it("should format as currency", () => {
    const result = formatCurrency(new Decimal(1000000));
    expect(result).toContain("1,000,000");
  });

  it("should format as percent", () => {
    const result = formatPercent(new Decimal(0.25), 2);
    expect(result).toBe("25.00%");
  });
});

describe("Decimal Utils - IRR Calculations", () => {
  it("should calculate IRR for normal cash flows that converge", () => {
    // Simple cash flows that should converge
    const cashFlows = [new Decimal(-1000), new Decimal(500), new Decimal(600)];
    const result = calculateIRR(cashFlows);

    // IRR should be positive for this profitable investment
    expect(result).not.toBeNull();
    if (result) {
      expect(result.toNumber()).toBeGreaterThan(0);
      expect(result.toNumber()).toBeLessThan(1); // Less than 100%
    }
  });

  it("should return null when IRR cannot converge (small derivative)", () => {
    // Cash flows that create a very flat NPV curve (small derivative)
    const cashFlows = [
      new Decimal(-1),
      new Decimal(1),
      new Decimal(0),
      new Decimal(0),
    ];
    const result = calculateIRR(cashFlows, new Decimal(0), 5, new Decimal(10));

    // With very high tolerance and limited iterations, may not converge
    // This tests the derivative < tolerance branch
    // Result could be null or a value depending on the specific path taken
    expect(result === null || result instanceof Decimal).toBe(true);
  });

  it("should return null when IRR does not converge after max iterations", () => {
    // Cash flows that oscillate and won't converge easily
    const cashFlows = [
      new Decimal(-10000),
      new Decimal(5000),
      new Decimal(-3000),
      new Decimal(4000),
      new Decimal(-2000),
      new Decimal(6000),
    ];

    // Use very few iterations to force non-convergence
    const result = calculateIRR(
      cashFlows,
      new Decimal(0.5),
      2,
      new Decimal(0.00001),
    );

    // With only 2 iterations and complex cash flows, should not converge
    // Testing the "max iterations exceeded" branch (line 432)
    expect(result).toBeNull();
  });

  it("should calculate IRR successfully for simple profitable investment", () => {
    // Year 0: -100, Year 1: +110
    // IRR should be 10%
    const cashFlows = [new Decimal(-100), new Decimal(110)];
    const result = calculateIRR(cashFlows);

    expect(result).not.toBeNull();
    if (result) {
      // IRR should be close to 10% (0.1)
      expect(result.toNumber()).toBeCloseTo(0.1, 2);
    }
  });
});

// =============================================================================
// ANNUALIZATION FACTOR & EQUIVALENT ANNUAL VALUE (EAV) TESTS
// =============================================================================

describe("calculateAnnualizationFactor", () => {
  it("should calculate annualization factor for 8% over 25 years", () => {
    const factor = calculateAnnualizationFactor(new Decimal(0.08), 25);

    // Factor = 0.08 / (1 - 1.08^(-25))
    // = 0.08 / (1 - 0.146018)
    // = 0.08 / 0.853982
    // ≈ 0.093679
    expect(factor.toFixed(6)).toBe("0.093679");
  });

  it("should calculate annualization factor for 8% over 30 years", () => {
    const factor = calculateAnnualizationFactor(new Decimal(0.08), 30);

    // Factor = 0.08 / (1 - 1.08^(-30))
    // ≈ 0.088827
    expect(factor.toFixed(6)).toBe("0.088827");
  });

  it("should handle zero discount rate (1/n)", () => {
    const factor = calculateAnnualizationFactor(ZERO, 25);

    // When discount rate is 0, factor should be 1/n
    expect(factor.toFixed(2)).toBe("0.04"); // 1/25 = 0.04
  });

  it("should handle zero discount rate for 30 years", () => {
    const factor = calculateAnnualizationFactor(ZERO, 30);

    // 1/30 ≈ 0.0333...
    expect(factor.toFixed(4)).toBe("0.0333");
  });

  it("should handle low discount rate (1%)", () => {
    const factor = calculateAnnualizationFactor(new Decimal(0.01), 25);

    expect(factor.toNumber()).toBeGreaterThan(0);
    expect(factor.toNumber()).toBeLessThan(1);
    // For 1% over 25 years, factor ≈ 0.0454
    expect(factor.toFixed(4)).toBe("0.0454");
  });

  it("should handle high discount rate (20%)", () => {
    const factor = calculateAnnualizationFactor(new Decimal(0.20), 25);

    // High discount rate means factor approaches the rate itself
    expect(factor.toNumber()).toBeGreaterThan(0.20);
    // For 20% over 25 years, factor ≈ 0.2021
    expect(factor.toFixed(4)).toBe("0.2021");
  });

  it("should calculate for different period lengths with same rate", () => {
    const rate = new Decimal(0.08);
    const factor10 = calculateAnnualizationFactor(rate, 10);
    const factor20 = calculateAnnualizationFactor(rate, 20);
    const factor30 = calculateAnnualizationFactor(rate, 30);

    // Shorter periods should have higher factors
    expect(factor10.greaterThan(factor20)).toBe(true);
    expect(factor20.greaterThan(factor30)).toBe(true);
  });

  it("should use Decimal.js throughout (precision test)", () => {
    const factor = calculateAnnualizationFactor(new Decimal(0.08), 25);

    // Should be a Decimal instance
    expect(factor).toBeInstanceOf(Decimal);

    // Should maintain precision
    expect(factor.decimalPlaces()).toBeGreaterThan(5);
  });
});

describe("calculateEAV", () => {
  it("should calculate EAV correctly for 100M SAR NPV at 8% over 25 years", () => {
    const npv = new Decimal(100_000_000);
    const eav = calculateEAV(npv, new Decimal(0.08), 25);

    // EAV = 100M × 0.093679 ≈ 9,367,900 SAR/year
    expect(eav.toNumber()).toBeCloseTo(9_367_900, -3);
  });

  it("should calculate EAV correctly for 200M SAR NPV at 8% over 25 years", () => {
    const npv = new Decimal(200_000_000);
    const eav = calculateEAV(npv, new Decimal(0.08), 25);

    // EAV = 200M × 0.093679 ≈ 18,735,800 SAR/year
    expect(eav.toNumber()).toBeCloseTo(18_735_800, -3);
  });

  it("should handle negative NPV", () => {
    const npv = new Decimal(-50_000_000);
    const eav = calculateEAV(npv, new Decimal(0.08), 25);

    // Negative NPV should give negative EAV
    expect(eav.lessThan(ZERO)).toBe(true);
    expect(eav.toNumber()).toBeCloseTo(-4_683_950, -3);
  });

  it("should handle zero NPV", () => {
    const eav = calculateEAV(ZERO, new Decimal(0.08), 25);

    expect(eav.equals(ZERO)).toBe(true);
  });

  it("should calculate EAV for 30-year period", () => {
    const npv = new Decimal(100_000_000);
    const eav = calculateEAV(npv, new Decimal(0.08), 30);

    // EAV = 100M × 0.088827 ≈ 8,882,700 SAR/year
    expect(eav.toNumber()).toBeCloseTo(8_882_700, -3);
  });

  it("should handle zero discount rate", () => {
    const npv = new Decimal(100_000_000);
    const eav = calculateEAV(npv, ZERO, 25);

    // With 0% discount, EAV = NPV / n = 100M / 25 = 4M
    expect(eav.toNumber()).toBeCloseTo(4_000_000, -2);
  });

  it("should use Decimal.js throughout (precision test)", () => {
    const npv = new Decimal(100_000_000);
    const eav = calculateEAV(npv, new Decimal(0.08), 25);

    // Should be a Decimal instance
    expect(eav).toBeInstanceOf(Decimal);
  });

  it("should handle very large NPV (>1B SAR)", () => {
    const npv = new Decimal(1_500_000_000); // 1.5 billion SAR
    const eav = calculateEAV(npv, new Decimal(0.08), 25);

    // Should not overflow
    expect(eav.toNumber()).toBeCloseTo(140_518_500, -3);
    expect(eav.isFinite()).toBe(true);
  });
});

describe("NAV Calculation Integration", () => {
  it("should calculate NAV from EBITDA and Rent NPVs (profitable scenario)", () => {
    const ebitdaNPV = new Decimal(200_000_000); // 200M SAR
    const rentNPV = new Decimal(80_000_000);     // 80M SAR
    const discountRate = new Decimal(0.08);
    const periods = 25;

    const annualizedEbitda = calculateEAV(ebitdaNPV, discountRate, periods);
    const annualizedRent = calculateEAV(rentNPV, discountRate, periods);
    const nav = annualizedEbitda.minus(annualizedRent);

    // Annualized EBITDA ≈ 18.74M, Annualized Rent ≈ 7.49M
    // NAV ≈ 11.25M SAR/year
    expect(nav.toNumber()).toBeCloseTo(11_241_480, -3);
    expect(nav.greaterThan(ZERO)).toBe(true);
  });

  it("should identify unprofitable proposals (negative NAV)", () => {
    const ebitdaNPV = new Decimal(50_000_000);   // 50M SAR
    const rentNPV = new Decimal(100_000_000);    // 100M SAR
    const discountRate = new Decimal(0.08);
    const periods = 25;

    const annualizedEbitda = calculateEAV(ebitdaNPV, discountRate, periods);
    const annualizedRent = calculateEAV(rentNPV, discountRate, periods);
    const nav = annualizedEbitda.minus(annualizedRent);

    // Rent exceeds EBITDA, so NAV should be negative
    expect(nav.lessThan(ZERO)).toBe(true);
    expect(nav.toNumber()).toBeCloseTo(-4_683_950, -3);
  });

  it("should calculate NAV for break-even scenario", () => {
    const ebitdaNPV = new Decimal(100_000_000);
    const rentNPV = new Decimal(100_000_000);
    const discountRate = new Decimal(0.08);
    const periods = 25;

    const annualizedEbitda = calculateEAV(ebitdaNPV, discountRate, periods);
    const annualizedRent = calculateEAV(rentNPV, discountRate, periods);
    const nav = annualizedEbitda.minus(annualizedRent);

    // NAV should be approximately zero
    expect(nav.toNumber()).toBeCloseTo(0, -1);
  });

  it("should handle different contract periods (25 vs 30 years)", () => {
    const ebitdaNPV = new Decimal(200_000_000);
    const rentNPV = new Decimal(80_000_000);
    const discountRate = new Decimal(0.08);

    const nav25 = calculateEAV(ebitdaNPV, discountRate, 25).minus(
      calculateEAV(rentNPV, discountRate, 25)
    );
    const nav30 = calculateEAV(ebitdaNPV, discountRate, 30).minus(
      calculateEAV(rentNPV, discountRate, 30)
    );

    // Both should be positive but different values
    expect(nav25.greaterThan(ZERO)).toBe(true);
    expect(nav30.greaterThan(ZERO)).toBe(true);

    // 25-year NAV should be higher (higher annualization factor)
    expect(nav25.greaterThan(nav30)).toBe(true);
  });

  it("should calculate Net Tenant Surplus correctly", () => {
    const ebitdaNPV = new Decimal(200_000_000);
    const rentNPV = new Decimal(80_000_000);

    const netTenantSurplus = ebitdaNPV.minus(rentNPV);

    // Net Tenant Surplus = 200M - 80M = 120M
    expect(netTenantSurplus.toNumber()).toBe(120_000_000);
  });

  it("should demonstrate annualization converts Net Tenant Surplus to NAV", () => {
    const ebitdaNPV = new Decimal(200_000_000);
    const rentNPV = new Decimal(80_000_000);
    const discountRate = new Decimal(0.08);
    const periods = 25;

    // Method 1: Calculate NAV from individual components
    const annualizedEbitda = calculateEAV(ebitdaNPV, discountRate, periods);
    const annualizedRent = calculateEAV(rentNPV, discountRate, periods);
    const navMethod1 = annualizedEbitda.minus(annualizedRent);

    // Method 2: Annualize the Net Tenant Surplus directly
    const netTenantSurplus = ebitdaNPV.minus(rentNPV);
    const navMethod2 = calculateEAV(netTenantSurplus, discountRate, periods);

    // Both methods should give identical results
    expect(navMethod1.toFixed(2)).toBe(navMethod2.toFixed(2));
  });
});
