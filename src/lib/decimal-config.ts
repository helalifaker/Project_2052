import Decimal from "decimal.js";

// Configure once globally
Decimal.set({
  precision: 20,
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -9,
  toExpPos: 9,
});

// Pre-create constants for performance
export const DECIMAL_ZERO = new Decimal(0);
export const DECIMAL_ONE = new Decimal(1);
export const ZAKAT_RATE = new Decimal(0.025); // 2.5%
