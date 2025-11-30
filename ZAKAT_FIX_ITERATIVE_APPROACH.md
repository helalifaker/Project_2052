# Zakat Calculation Fix - Iterative Approach

## Problem Statement

Zakat is being calculated using the **previous period's** Equity and Non-Current Assets when it should use the **current period's** values.

**Example (Year 2057):**
- Current Implementation: Uses 2056's Balance Sheet → Zakat = 2,641,451 SAR
- Correct Implementation: Should use 2057's Balance Sheet → Zakat = 2,929,230 SAR
- Error: -287,779 SAR (9.8% understatement)

## Root Cause

The calculation flow in `calculateDynamicPeriod` is:

1. Calculate P&L (includes Zakat calculation using PREVIOUS period's BS)
2. Calculate Balance Sheet (uses the P&L to derive current period's Equity)
3. Zakat was already calculated in step 1 with wrong values!

This is a **circular dependency**:
- Zakat depends on current Equity
- Equity depends on Net Income
- Net Income depends on Zakat

## Solution: Iterative Convergence

Implement a simple iteration loop in `calculateDynamicPeriod`:

```typescript
// Iteration Loop (2-3 iterations usually sufficient)
let zakatEstimate = ZERO; // Initial estimate
let iterations = 0;
const MAX_ITERATIONS = 10;
const CONVERGENCE_TOLERANCE = new Decimal(0.01); // 1 cent

while (iterations < MAX_ITERATIONS) {
  // 1. Calculate P&L with current Zakat estimate
  const profitLoss = calculateProfitLoss(..., zakatEstimate);

  // 2. Calculate Balance Sheet
  const balanceSheet = calculateBalanceSheet(profitLoss, ...);

  // 3. Calculate new Zakat using CURRENT period's balance sheet
  const zakatBase = balanceSheet.totalEquity - balanceSheet.totalNonCurrentAssets;
  let newZakat: Decimal;

  if (zakatBase > 0) {
    // Tier 1: Asset-based
    newZakat = zakatBase × zakatRate;
  } else if (profitLoss.ebt > 0) {
    // Tier 2: Profit-based
    newZakat = profitLoss.ebt × zakatRate;
  } else {
    // Tier 3: Zero
    newZakat = 0;
  }

  // 4. Check convergence
  const difference = abs(newZakat - zakatEstimate);
  if (difference < CONVERGENCE_TOLERANCE) {
    // Converged! Use final values
    break;
  }

  // 5. Update estimate for next iteration
  zakatEstimate = newZakat;
  iterations++;
}
```

## Implementation Steps

1. **Modify `calculateProfitLoss` signature** to accept `zakatExpense` as parameter
2. **Add iteration loop** in `calculateDynamicPeriod` function
3. **Implement 3-tier Zakat formula** within the iteration loop
4. **Update transition.ts** with same approach (simpler as no circular solver needed there either)
5. **Test convergence** on actual proposals

## Benefits

- ✅ Uses current period's balance sheet (accurate)
- ✅ Implements 3-tier formula correctly
- ✅ Converges in 2-3 iterations (fast)
- ✅ Localized change (doesn't affect circular solver)
- ✅ Easy to test and validate

## Alternative Considered (Rejected)

Modify the existing circular solver to handle Zakat calculation. Rejected because:
- More complex (requires changes to solver core)
- Affects more files (circular.ts, all its test files)
- Higher risk of breaking existing functionality
- Circular solver may not be called in all periods
