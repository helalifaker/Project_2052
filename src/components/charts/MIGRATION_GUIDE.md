# Chart System Migration Guide

## Overview

This guide helps you migrate from hardcoded chart styles to the new design token system.

## What Changed?

### Before (Deprecated)
- Hardcoded hex color values (`#3b82f6`, `#10b981`, etc.)
- Inconsistent Recharts configuration across components
- Duplicate color constant arrays (`CHART_COLORS`, `FINANCIAL_COLORS`, `PROPOSAL_COLORS`)
- No dark mode support
- Manual tooltip styling

### After (Current)
- Semantic color tokens from `@/lib/design-tokens/chart-colors`
- Centralized Recharts configuration from `@/lib/design-tokens/chart-config`
- Single source of truth for all chart styling
- Automatic dark mode adaptation via CSS variables
- Pre-built base components and tooltips

## Migration Steps

### 1. Remove Deprecated Color Constants

**Before:**
```typescript
// ❌ Old - Deprecated
const CHART_COLORS = [
  { stroke: "#c9a86c", fill: "#c9a86c" },
  { stroke: "#6b8e7a", fill: "#6b8e7a" },
];

const FINANCIAL_COLORS = {
  positive: "#10b981",
  negative: "#f43f5e",
  breakeven: "#6b7280"
};

const PROPOSAL_COLORS = [
  "#3b82f6", "#10b981", "#f59e0b"
];
```

**After:**
```typescript
// ✅ New - Use design tokens
import { chartColors, getSeriesColor, getProposalColor } from '@/lib/design-tokens/chart-colors';

// Access colors semantically
chartColors.positive      // Sage green for gains
chartColors.negative      // Terracotta for losses
chartColors.neutral       // Copper for neutral values
chartColors.series[0]     // First series color

// Helper functions
getSeriesColor(0)         // Returns first series color
getProposalColor(0)       // Returns first proposal color
```

### 2. Replace Hardcoded Hex Values

**Before:**
```tsx
// ❌ Old - Hardcoded
<Line stroke="#3b82f6" />
<Area fill="#10b981" />
<CartesianGrid stroke="#e5e7eb" />
<ReferenceLine stroke="#6b7280" />
```

**After:**
```tsx
// ✅ New - Design tokens
import { chartColors } from '@/lib/design-tokens/chart-colors';

<Line stroke={chartColors.neutral} />
<Area fill={chartColors.positive} />
<CartesianGrid stroke={chartColors.grid} />
<ReferenceLine stroke={chartColors.axis} />
```

### 3. Use Base Chart Components

**Before:**
```tsx
// ❌ Old - Manual configuration
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
    <XAxis
      dataKey="year"
      tick={{ fontSize: 11, fill: "#6b7280" }}
      stroke="#6b7280"
    />
    <YAxis
      tick={{ fontSize: 11, fill: "#6b7280" }}
      stroke="#6b7280"
    />
    <Tooltip />
    <Legend />
    <Line
      dataKey="rent"
      stroke="#c9a86c"
      strokeWidth={2}
      type="monotone"
      animationDuration={500}
    />
  </LineChart>
</ResponsiveContainer>
```

**After:**
```tsx
// ✅ New - Base component with tokens
import { BaseLineChart } from '@/components/charts';

<BaseLineChart
  data={data}
  series={[
    { dataKey: "rent", name: "Monthly Rent" }
  ]}
  xAxisKey="year"
  tooltipFormat="millions"
/>
```

### 4. Migrate Recharts Configuration

**Before:**
```tsx
// ❌ Old - Inline configuration
<XAxis
  tick={{ fontSize: 11, fill: "#6b7280", fontFamily: "Inter" }}
  stroke="#6b7280"
  tickLine={{ stroke: "#6b7280" }}
  axisLine={{ stroke: "#6b7280" }}
/>
```

**After:**
```tsx
// ✅ New - Helper functions
import { getAxisProps } from '@/lib/design-tokens/chart-config';

<XAxis {...getAxisProps('x')} dataKey="year" />
```

### 5. Update Tooltips

**Before:**
```tsx
// ❌ Old - Custom tooltip with hardcoded styles
const CustomTooltip = ({ active, payload, label }) => {
  if (!active) return null;
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e5e7eb",
      padding: "12px",
      borderRadius: "8px"
    }}>
      {/* ... */}
    </div>
  );
};

<Tooltip content={<CustomTooltip />} />
```

**After:**
```tsx
// ✅ New - Pre-built tooltip
import { CustomTooltip } from '@/components/charts';

<Tooltip content={<CustomTooltip format="millions" />} />
```

## Common Patterns

### Financial Charts (Positive/Negative Values)

```tsx
import { chartColors } from '@/lib/design-tokens/chart-colors';
import { BaseBarChart } from '@/components/charts';

<BaseBarChart
  data={cashFlowData}
  series={[{
    dataKey: "netCashFlow",
    cellColors: cashFlowData.map(d =>
      d.netCashFlow >= 0 ? chartColors.positive : chartColors.negative
    )
  }]}
  xAxisKey="year"
  tooltipFormat="millions"
/>
```

### Multi-Proposal Comparison

```tsx
import { getProposalColor } from '@/lib/design-tokens/chart-colors';
import { BaseLineChart } from '@/components/charts';

<BaseLineChart
  data={comparisonData}
  series={proposals.map((p, i) => ({
    dataKey: p.id,
    name: p.name,
    color: getProposalColor(i)
  }))}
  xAxisKey="year"
  showLegend
/>
```

### Stacked Area Chart

```tsx
import { chartColors } from '@/lib/design-tokens/chart-colors';
import { BaseAreaChart } from '@/components/charts';

<BaseAreaChart
  data={revenueData}
  series={[
    {
      dataKey: "tuition",
      name: "Tuition Revenue",
      stackId: "1",
      useGradient: true
    },
    {
      dataKey: "fees",
      name: "Fees",
      stackId: "1",
      useGradient: true
    },
  ]}
  xAxisKey="year"
  tooltipFormat="millions"
/>
```

### Waterfall Chart (Custom Colors)

```tsx
import { chartColorMappings } from '@/lib/design-tokens/chart-colors';

// Use semantic color mappings
<Bar fill={chartColorMappings.cashFlow.positive} />
<Bar fill={chartColorMappings.cashFlow.negative} />
<Line stroke={chartColorMappings.cashFlow.cumulative} />
```

## Color Reference

### Financial Colors
```typescript
chartColors.positive    // Sage green - gains, profits
chartColors.negative    // Terracotta - losses, costs
chartColors.neutral     // Copper - neutral values
chartColors.warning     // Amber - warnings
```

### Series Colors (Multi-line charts)
```typescript
chartColors.series[0]   // Copper (primary)
chartColors.series[1]   // Sage (secondary)
chartColors.series[2]   // Blue-gray (tertiary)
chartColors.series[3]   // Purple (quaternary)
```

### Proposal Colors (Comparison)
```typescript
chartColors.proposalA   // Copper
chartColors.proposalB   // Twilight Blue
chartColors.proposalC   // Blue-gray
chartColors.proposalD   // Purple
chartColors.proposalE   // Terracotta
```

### Chart Structure
```typescript
chartColors.grid        // Grid lines
chartColors.axis        // Axis lines and labels
chartColors.background  // Chart background
```

## Import Paths

```typescript
// Base components
import { BaseLineChart, BaseBarChart, BaseAreaChart } from '@/components/charts';

// Tooltips
import { CustomTooltip, FinancialTooltip, PercentTooltip } from '@/components/charts';

// Loading states
import { ChartSkeleton } from '@/components/charts';

// Design tokens
import { chartColors, getSeriesColor, getProposalColor } from '@/lib/design-tokens/chart-colors';
import { getAxisProps, getGridProps, getTooltipProps } from '@/lib/design-tokens/chart-config';
```

## Performance Tips

1. **Use Base Components**: Pre-optimized with React.memo
2. **Memoize Data**: Wrap data transformations in `useMemo`
3. **Debounce Updates**: Use 300ms debounce for interactive charts
4. **Limit Data Points**: Sample data for charts with >1000 points

```tsx
// Good: Memoized data transformation
const chartData = useMemo(() =>
  transformDataForChart(rawData),
  [rawData]
);

<BaseLineChart data={chartData} {...props} />
```

## Testing Migration

1. **Visual Inspection**: Check all charts render correctly
2. **Dark Mode**: Toggle dark mode to verify colors adapt
3. **Responsive**: Test at different screen sizes
4. **Tooltips**: Hover over data points to verify tooltip styling
5. **Legends**: Verify legend colors match chart elements

## Deprecated Code Checklist

- [ ] Remove `CHART_COLORS` array constants
- [ ] Remove `FINANCIAL_COLORS` object constants
- [ ] Remove `PROPOSAL_COLORS` array constants
- [ ] Replace all hex color values with design tokens
- [ ] Replace inline Recharts config with helper functions
- [ ] Use base chart components where possible
- [ ] Update imports to use new paths

## Need Help?

- See `/src/lib/design-tokens/chart-colors.ts` for all available colors
- See `/src/lib/design-tokens/chart-config.ts` for all configuration options
- See `/src/components/charts/` for all base components
- Check existing dashboard charts for examples
