# Deprecated Code Cleanup Checklist

**Phase 2: Dashboard and Comparison Chart Cleanup**

This checklist tracks all files with deprecated color code that needs to be migrated to design tokens.

## Priority 1: Broken Files (Immediate Fix Required)

### ❌ CumulativeCashFlowChart.tsx
**Location:** `/src/components/dashboard/CumulativeCashFlowChart.tsx`

**Issue:** References undefined constants `CHART_COLORS` and `FINANCIAL_COLORS`

**Lines to Fix:**
- Line 69: `chartColors.positive` ✅ (already using design token)
- Line 140: `CHART_COLORS[index].fill` → Use `getProposalColor(index)`
- Line 145: `CHART_COLORS[index].fill` → Use `getProposalColor(index)`
- Line 180: `FINANCIAL_COLORS.breakeven` → Use `chartColors.axis`
- Line 195: `CHART_COLORS[index].stroke` → Use `getProposalColor(index)`
- Line 219: `CHART_COLORS[index].stroke` → Use `getProposalColor(index)`
- Line 226: `FINANCIAL_COLORS.positive/negative` ✅ (already using chartColors)
- Line 241: `FINANCIAL_COLORS.positive` ✅ (already using chartColors)
- Line 247: `FINANCIAL_COLORS.negative` ✅ (already using chartColors)

**Replacement Pattern:**
```typescript
// Before
stopColor={CHART_COLORS[index % CHART_COLORS.length].fill}
stroke={CHART_COLORS[index % CHART_COLORS.length].stroke}

// After
stopColor={getProposalColor(index)}
stroke={getProposalColor(index)}
```

**Estimated Time:** 15 minutes

---

## Priority 2: Heavy Hardcoded Files

### ⚠️ CashFlowWaterfallChart.tsx
**Location:** `/src/components/dashboard/CashFlowWaterfallChart.tsx`

**Hardcoded Hex Values:** 30+

**Lines to Fix:**
- 246, 247: `#3b82f6` → `chartColors.neutral`
- 251: `#e5e7eb` → `chartColors.grid`
- 255, 256, 257: `#6b7280` → `chartColors.axis`
- 261, 262, 263: `#6b7280` → `chartColors.axis`
- 280, 288: `#f43f5e` → `chartColors.negative`
- 295, 303: `#f59e0b` → `chartColors.warning`
- 311, 318, 326, 333, 343: `#8b5cf6` → `chartColors.series[3]` (purple)
- 353: `#e5e7eb` → `chartColors.grid`
- 357, 358, 359: `#6b7280` → `chartColors.axis`
- 363, 364, 365: `#6b7280` → `chartColors.axis`
- 385, 390, 397: `#6b7280` / `#8b5cf6` → Use design tokens
- 405: `#10b981` → `chartColors.positive`
- 411: `#f43f5e` → `chartColors.negative`
- 417: `#8b5cf6` → `chartColors.series[3]`

**Estimated Time:** 45 minutes

---

### ⚠️ ProfitabilityJourneyChart.tsx
**Location:** `/src/components/dashboard/ProfitabilityJourneyChart.tsx`

**Hardcoded Hex Values:** 15+

**Lines to Fix:**
- 209, 210: `#8b5cf6` → `chartColors.series[3]`
- 210: `#3b82f6` → `chartColors.neutral`
- 215, 216: `#f43f5e` → `chartColors.negative`
- 221, 222: `#10b981` → `chartColors.positive`
- 226: `#e5e7eb` → `chartColors.grid`
- 230, 231, 232: `#6b7280` → `chartColors.axis`
- 236, 237, 238: `#6b7280` → `chartColors.axis`
- 247, 255, 263, 271: `#9ca3af` / `#6b7280` → `chartColors.axis`
- 279, 286, 295, 302, 313: `#8b5cf6` → `chartColors.series[3]`
- 322: `#f43f5e` → `chartColors.negative`
- 331: `#10b981` → `chartColors.positive`

**Estimated Time:** 30 minutes

---

## Priority 3: Light Cleanup

### ⚠️ ExecutiveRentChart.tsx
**Location:** `/src/components/dashboard/ExecutiveRentChart.tsx`

**Hardcoded Hex Values:** 6

**Lines to Fix:**
- 38-43: Color array → Use `getProposalColor()` helper

**Before:**
```typescript
const colors = [
  "#c9a86c", // Copper
  "#6b8e7a", // Sage green
  "#8b7355", // Warm brown
  "#7c8b99", // Steel blue
  "#9c7c6c", // Terracotta
  "#6c7c8c", // Slate
];
```

**After:**
```typescript
import { getProposalColor } from '@/lib/design-tokens/chart-colors';
// Use getProposalColor(index) inline
```

**Estimated Time:** 10 minutes

---

### ⚠️ AverageAnnualCostChart.tsx
**Location:** `/src/components/dashboard/AverageAnnualCostChart.tsx`

**Hardcoded Hex Values:** 3

**Lines to Fix:**
- 35-37: Color object → Use `chartColorMappings.costBreakdown`

**Before:**
```typescript
const COLORS = {
  rent: "#c9a86c", // Copper
  staff: "#4a7c96", // Twilight Blue
  other: "#7a9e8a", // Sage
};
```

**After:**
```typescript
import { chartColorMappings } from '@/lib/design-tokens/chart-colors';
// Use chartColorMappings.costBreakdown.rent, etc.
```

**Estimated Time:** 10 minutes

---

### ⚠️ NAVComparisonChart.tsx
**Location:** `/src/components/dashboard/NAVComparisonChart.tsx`

**Hardcoded Hex Values:** 2

**Lines to Fix:**
- 78: `#f59e0b` → `chartColors.warning`
- 81: `#94a3b8` → `chartColors.axis`

**Estimated Time:** 5 minutes

---

### ⚠️ ProfitabilityWaterfallChart.tsx
**Location:** `/src/components/dashboard/ProfitabilityWaterfallChart.tsx`

**Hardcoded Hex Values:** 3

**Lines to Fix:**
- 38-40: Color object → Use `chartColorMappings.profitability`

**Before:**
```typescript
const COLORS = {
  positive: "#2d7a4f", // Sage green
  negative: "#b84233", // Terracotta red
  total: "#4a7c96", // Twilight blue
};
```

**After:**
```typescript
import { chartColorMappings } from '@/lib/design-tokens/chart-colors';
// Use chartColorMappings.profitability colors
```

**Estimated Time:** 10 minutes

---

## Priority 4: Comparison Charts

### ⚠️ RentTrajectoryComparisonChart.tsx
**Location:** `/src/components/proposals/comparison/RentTrajectoryComparisonChart.tsx`

**Deprecated Constant:** `PROPOSAL_COLORS` array

**Lines to Fix:**
- 58-64: Remove `PROPOSAL_COLORS` array
- Replace usage with `getProposalColor(index)`

**Before:**
```typescript
const PROPOSAL_COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"
];
```

**After:**
```typescript
import { getProposalColor } from '@/lib/design-tokens/chart-colors';
// Use getProposalColor(index) inline
```

**Estimated Time:** 10 minutes

---

## Summary

| Priority | Files | Hex Values | Constants | Est. Time |
|----------|-------|------------|-----------|-----------|
| P1 - Broken | 1 | 0 | 2 | 15 min |
| P2 - Heavy | 2 | 45+ | 0 | 75 min |
| P3 - Light | 4 | 14 | 4 | 45 min |
| P4 - Comparison | 1 | 5 | 1 | 10 min |
| **TOTAL** | **8** | **64+** | **7** | **145 min** |

**Total Estimated Time:** ~2.5 hours

---

## Migration Process

### Step-by-Step for Each File:

1. **Add Import**
   ```typescript
   import { chartColors, getProposalColor, chartColorMappings } from '@/lib/design-tokens/chart-colors';
   ```

2. **Remove Deprecated Constants**
   - Delete `CHART_COLORS` arrays
   - Delete `FINANCIAL_COLORS` objects
   - Delete `PROPOSAL_COLORS` arrays

3. **Replace Hardcoded Hex Values**
   - Financial colors: `#10b981` → `chartColors.positive`
   - Grid/Axis: `#e5e7eb`, `#6b7280` → `chartColors.grid`, `chartColors.axis`
   - Series colors: Use `getSeriesColor(index)` or `getProposalColor(index)`

4. **Test Visual Output**
   - Light mode: Verify colors match design
   - Dark mode: Verify colors adapt correctly
   - Hover states: Check tooltip colors

5. **Commit Changes**
   ```bash
   git add <file>
   git commit -m "refactor(charts): migrate <ChartName> to design tokens"
   ```

---

## Validation Checklist

After migrating each file:

- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Chart renders correctly in light mode
- [ ] Chart renders correctly in dark mode
- [ ] Tooltips show correct colors
- [ ] Legends match chart elements
- [ ] No hardcoded hex values remain
- [ ] No undefined constant references

---

## Next Steps

1. **Phase 2A**: Fix broken file (Priority 1) - 15 min
2. **Phase 2B**: Clean heavy files (Priority 2) - 75 min
3. **Phase 2C**: Clean light files (Priority 3) - 45 min
4. **Phase 2D**: Clean comparison charts (Priority 4) - 10 min
5. **Phase 2E**: Visual regression testing - 30 min
6. **Phase 2F**: Final cleanup and commit - 15 min

**Total Phase 2 Time:** ~3 hours

---

## Success Criteria

- ✅ All files compile without errors
- ✅ No hardcoded hex values in chart components
- ✅ No deprecated color constant arrays
- ✅ All charts use design token colors
- ✅ Dark mode works correctly
- ✅ Visual regression tests pass
- ✅ Code review approved
