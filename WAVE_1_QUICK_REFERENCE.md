# Wave 1 Chart Migration - Quick Reference Card

## Migration Complete ✅

**Charts Migrated:** 2/15
**Code Reduced:** 64 lines (11.7%)
**Hardcoded Colors Removed:** 10+

---

## Files Modified

1. **AverageAnnualCostChart** - `/src/components/dashboard/AverageAnnualCostChart.tsx`
   - 239 → 210 lines (29 lines reduced)
   - 4 hardcoded colors removed
   - Now uses: `chartColorMappings.costBreakdown.*`

2. **ProfitabilityWaterfallChart** - `/src/components/dashboard/ProfitabilityWaterfallChart.tsx`
   - 306 → 270 lines (36 lines reduced)
   - 6+ hardcoded colors removed
   - Now uses: `chartColors.positive/negative`, `chartColorMappings.profitability.*`

---

## Before/After Pattern

### Before (Hardcoded)
```typescript
const COLORS = {
  rent: "#c9a86c",
  staff: "#4a7c96",
  other: "#7a9e8a",
};

<BarChart data={data}>
  <Bar dataKey="rent" fill={COLORS.rent} />
  <Bar dataKey="staff" fill={COLORS.staff} />
  <Bar dataKey="other" fill={COLORS.other} />
</BarChart>
```

### After (Design Tokens)
```typescript
import { chartColorMappings } from "@/lib/design-tokens/chart-colors";
import { BaseBarChart } from "@/components/charts/BaseBarChart";

<BaseBarChart
  data={data}
  series={[
    { dataKey: "rent", color: chartColorMappings.costBreakdown.rent },
    { dataKey: "staff", color: chartColorMappings.costBreakdown.staff },
    { dataKey: "other", color: chartColorMappings.costBreakdown.otherOpex },
  ]}
  xAxisKey="name"
  showLegend
/>
```

---

## Design Tokens Used

### Cost Breakdown
```typescript
chartColorMappings.costBreakdown.rent       // Copper
chartColorMappings.costBreakdown.staff      // Sage
chartColorMappings.costBreakdown.otherOpex  // Blue-gray
```

### Profitability
```typescript
chartColors.positive                          // Sage green (revenue)
chartColors.negative                          // Terracotta (costs)
chartColorMappings.profitability.ebitda       // Blue-gray (totals)
```

---

## Key Learnings

1. **BaseBarChart handles 90% of bar chart needs**
   - Automatic axis/grid/tooltip configuration
   - Built-in stacked bar support
   - Cell-level coloring via `cellColors` prop

2. **Waterfall charts = Bar chart + cellColors**
   - Map each bar's color based on segment type
   - Use `getBarColor()` helper for semantic mapping

3. **Custom tooltips still work**
   - Reference design tokens in inline `style={{ color: chartColors.positive }}`
   - No need to recreate tooltip from scratch

4. **Opacity modifiers on HSL colors**
   - Append `dd` for 87% opacity: `${chartColors.positive}dd`

---

## Testing Checklist

- ✅ Zero hardcoded hex colors (`grep -E '#[0-9a-fA-F]{6}'`)
- ✅ All design token imports present
- ✅ BaseBarChart wrapper used
- ✅ Custom tooltips preserved
- ✅ TypeScript strict mode passes
- ✅ Line count reduced by 10-15%

---

## Next Wave Preview

**Wave 2 Targets:**
- RentTrajectoryChart (line chart)
- NPVSensitivityChart (tornado chart - complex)
- CumulativeCashFlowChart (area chart)
- CostBreakdownChart (stacked bar - similar to Wave 1)

**New Components Needed:**
- BaseLineChart (for RentTrajectory)
- BaseAreaChart (for CumulativeCashFlow)
- TornadoChart base component (for NPV Sensitivity)

---

## Quick Command Reference

```bash
# Verify no hardcoded colors
grep -E '#[0-9a-fA-F]{6}' src/components/dashboard/*.tsx

# Count design token usage
grep -c "chartColors\|chartColorMappings" src/components/dashboard/*.tsx

# Check line counts
wc -l src/components/dashboard/AverageAnnualCostChart.tsx
wc -l src/components/dashboard/ProfitabilityWaterfallChart.tsx
```

---

**Wave 1 Status:** COMPLETE ✅
**Next Wave:** Ready to start
**Blockers:** None
