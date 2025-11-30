# Chart Components System

**Production-ready, design token-based chart components for Project Zeta financial visualizations.**

## Overview

This directory contains the base chart components and utilities for building consistent, accessible, and performant financial charts across the application.

All components use:
- **Design Tokens** for colors, typography, and spacing
- **React.memo** for performance optimization
- **Recharts** for chart rendering
- **TypeScript** for type safety
- **Dark Mode** support via CSS variables

## Quick Start

```tsx
import { BaseLineChart } from '@/components/charts';
import { chartColors } from '@/lib/design-tokens/chart-colors';

<BaseLineChart
  data={rentData}
  series={[
    { dataKey: "rent", name: "Monthly Rent", color: chartColors.neutral }
  ]}
  xAxisKey="year"
  tooltipFormat="millions"
/>
```

## Components

### Base Chart Components

#### BaseLineChart
Line charts for trends, trajectories, and time-series data.

**Best for:**
- Rent trajectories
- Revenue/profit trends
- Year-over-year comparisons

**Props:**
- `data`: Array of data objects
- `series`: Array of line configurations
- `xAxisKey`: X-axis data key
- `tooltipFormat`: "millions" | "billions" | "percent" | "number"
- `showLegend`: Boolean (auto-enabled for multiple series)
- `showGrid`: Boolean (default: true)

**Example:**
```tsx
<BaseLineChart
  data={[
    { year: 2023, rent: 100, projected: 95 },
    { year: 2024, rent: 105, projected: 100 },
  ]}
  series={[
    { dataKey: "rent", name: "Actual Rent" },
    { dataKey: "projected", name: "Projected", strokeDasharray: "5 5" },
  ]}
  xAxisKey="year"
  tooltipFormat="millions"
/>
```

#### BaseBarChart
Bar charts for categorical comparisons and breakdowns.

**Best for:**
- Cost breakdowns
- Year comparisons
- Category analysis

**Props:**
- `data`: Array of data objects
- `series`: Array of bar configurations
- `xAxisKey`: X-axis data key
- `layout`: "vertical" | "horizontal"
- `tooltipFormat`: Format type

**Example:**
```tsx
<BaseBarChart
  data={costData}
  series={[
    { dataKey: "rent", name: "Rent", stackId: "a" },
    { dataKey: "staff", name: "Staff", stackId: "a" },
  ]}
  xAxisKey="year"
  tooltipFormat="millions"
/>
```

#### BaseAreaChart
Area charts for cumulative values and ranges.

**Best for:**
- Cumulative cash flow
- Revenue stacking
- Gradient fills

**Props:**
- `data`: Array of data objects
- `series`: Array of area configurations (with `useGradient` option)
- `xAxisKey`: X-axis data key
- `tooltipFormat`: Format type

**Example:**
```tsx
<BaseAreaChart
  data={cashFlowData}
  series={[
    {
      dataKey: "cumulative",
      name: "Cumulative Cash",
      useGradient: true,
      stroke: chartColors.neutral
    }
  ]}
  xAxisKey="year"
  tooltipFormat="millions"
/>
```

### Tooltip Components

#### CustomTooltip
Fully customizable tooltip with design token styling.

**Props:**
- `format`: "millions" | "billions" | "percent" | "number"
- `currency`: String (default: "SAR")
- `labelFormatter`: Custom label formatter
- `valueFormatter`: Custom value formatter

**Pre-configured Variants:**
```tsx
import { FinancialTooltip, PercentTooltip, NumberTooltip } from '@/components/charts';

<Tooltip content={<FinancialTooltip />} />  // millions format
<Tooltip content={<PercentTooltip />} />     // percent format
<Tooltip content={<NumberTooltip />} />      // number format
```

### Loading States

#### ChartSkeleton
Animated loading skeleton for charts.

**Props:**
- `type`: "line" | "bar" | "area"
- `height`: Number (default: 300)

**Example:**
```tsx
{isLoading ? (
  <ChartSkeleton type="line" height={400} />
) : (
  <BaseLineChart data={data} {...props} />
)}
```

## Design Tokens

### Colors

All chart colors are defined in `/src/lib/design-tokens/chart-colors.ts`.

**Financial Semantic Colors:**
```typescript
import { chartColors } from '@/lib/design-tokens/chart-colors';

chartColors.positive    // Sage green - gains, profits
chartColors.negative    // Terracotta - losses, costs
chartColors.neutral     // Copper - neutral values
chartColors.warning     // Amber - warnings
```

**Series Colors (Multi-line):**
```typescript
chartColors.series[0]   // Copper (primary)
chartColors.series[1]   // Sage (secondary)
chartColors.series[2]   // Blue-gray (tertiary)
chartColors.series[3]   // Purple (quaternary)

// Or use helper
getSeriesColor(0)       // Auto-cycles through series
```

**Proposal Comparison:**
```typescript
chartColors.proposalA   // Copper
chartColors.proposalB   // Twilight Blue
chartColors.proposalC   // Blue-gray
chartColors.proposalD   // Purple
chartColors.proposalE   // Terracotta

// Or use helper
getProposalColor(0)     // Auto-cycles through proposals
```

**Semantic Mappings:**
```typescript
import { chartColorMappings } from '@/lib/design-tokens/chart-colors';

// Rent charts
chartColorMappings.rentTrajectory.primaryRent
chartColorMappings.rentTrajectory.historicalRent

// Sensitivity analysis
chartColorMappings.sensitivity.positiveImpact
chartColorMappings.sensitivity.negativeImpact

// Cost breakdown
chartColorMappings.costBreakdown.rent
chartColorMappings.costBreakdown.staff

// Cash flow
chartColorMappings.cashFlow.positive
chartColorMappings.cashFlow.negative
```

### Configuration

All Recharts configuration is centralized in `/src/lib/design-tokens/chart-config.ts`.

**Helper Functions:**
```typescript
import {
  getAxisProps,
  getGridProps,
  getTooltipProps,
  getLegendProps
} from '@/lib/design-tokens/chart-config';

// Use in custom charts
<XAxis {...getAxisProps('x')} dataKey="year" />
<YAxis {...getAxisProps('y')} />
<CartesianGrid {...getGridProps()} />
<Tooltip {...getTooltipProps()} />
<Legend {...getLegendProps()} />
```

**Pre-configured Objects:**
```typescript
import {
  lineChartConfig,
  barChartConfig,
  areaChartConfig,
  chartAnimation,
  chartSpacing
} from '@/lib/design-tokens/chart-config';

// Access specific values
lineChartConfig.type           // "monotone"
chartAnimation.duration        // 500ms
chartSpacing.strokeWidth       // 2px
```

## Performance

### Optimization Techniques

1. **React.memo**: All base components are memoized
2. **Data Memoization**: Wrap data transformations in `useMemo`
3. **Debouncing**: Use 300ms debounce for interactive charts
4. **Sampling**: Limit data points to <1000 for smooth rendering

**Example:**
```tsx
const chartData = useMemo(() => {
  // Transform and sample data
  return rawData
    .filter((_, idx) => idx % 2 === 0)  // Sample every 2nd point
    .map(d => ({
      year: d.year,
      value: d.value / 1_000_000  // Convert to millions
    }));
}, [rawData]);

<BaseLineChart data={chartData} {...props} />
```

### Performance Targets

- **UI Interaction:** <200ms response
- **Chart Render:** <500ms initial
- **Re-render:** <100ms with memo
- **Animation:** 60fps (500ms duration)

## Accessibility

All charts include:
- ✅ Semantic color usage (not relying on color alone)
- ✅ ARIA labels on interactive elements
- ✅ Keyboard navigation support
- ✅ Screen reader friendly tooltips
- ✅ WCAG 2.1 AA color contrast

**Best Practices:**
```tsx
// Good: Multiple visual cues
<Bar fill={chartColors.positive} radius={[4, 4, 0, 0]} />

// Better: Pattern + color for colorblind users
<Bar
  fill={chartColors.positive}
  stroke={chartColors.positive}
  strokeDasharray={isPositive ? "0" : "5 5"}
/>
```

## Dark Mode

All colors automatically adapt to dark mode via CSS variables. No code changes needed.

**Colors are defined as:**
```css
/* Light mode (default) */
--color-chart-grid: 24 6% 83%;

/* Dark mode (automatically applied) */
.dark {
  --color-chart-grid: 24 6% 25%;
}
```

## File Structure

```
src/components/charts/
├── index.ts                      # Central export
├── README.md                     # This file
├── MIGRATION_GUIDE.md            # Migration guide
├── BaseLineChart.tsx             # Line chart component
├── BaseBarChart.tsx              # Bar chart component
├── BaseAreaChart.tsx             # Area chart component
├── CustomTooltip.tsx             # Tooltip components
└── ChartSkeleton.tsx             # Loading skeleton

src/lib/design-tokens/
├── chart-colors.ts               # Color tokens
├── chart-config.ts               # Configuration tokens
└── CHART_QUICK_REFERENCE.md      # Quick reference
```

## Common Patterns

### Multi-Proposal Comparison
```tsx
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

### Positive/Negative Coloring
```tsx
<BaseBarChart
  data={cashFlowData}
  series={[{
    dataKey: "netCashFlow",
    cellColors: cashFlowData.map(d =>
      d.netCashFlow >= 0 ? chartColors.positive : chartColors.negative
    )
  }]}
  xAxisKey="year"
/>
```

### Stacked Revenue
```tsx
<BaseAreaChart
  data={revenueData}
  series={[
    { dataKey: "tuition", stackId: "1", useGradient: true },
    { dataKey: "fees", stackId: "1", useGradient: true },
  ]}
  xAxisKey="year"
/>
```

## Testing

### Unit Tests
```tsx
import { render, screen } from '@testing-library/react';
import { BaseLineChart } from '@/components/charts';

test('renders chart with data', () => {
  const data = [{ year: 2023, value: 100 }];
  render(<BaseLineChart data={data} series={[{ dataKey: 'value' }]} xAxisKey="year" />);
  // Test assertions
});
```

### Visual Testing
Use Playwright for E2E visual regression:
```typescript
await page.goto('/dashboard');
await page.waitForSelector('[data-chart-type="line"]');
await expect(page).toHaveScreenshot('dashboard-chart.png');
```

## Troubleshooting

### Common Issues

**Issue:** Chart not rendering
- ✅ Check data array is not empty
- ✅ Verify `xAxisKey` matches data property
- ✅ Ensure series `dataKey` matches data properties

**Issue:** Colors not showing
- ✅ Import `chartColors` from design tokens
- ✅ Don't use hardcoded hex values
- ✅ Check CSS variables are defined in globals.css

**Issue:** Tooltip not formatted
- ✅ Specify `tooltipFormat` prop
- ✅ Use `CustomTooltip` component
- ✅ Check format matches data type (millions/billions/percent)

**Issue:** Performance lag
- ✅ Memoize data transformations
- ✅ Sample large datasets (>1000 points)
- ✅ Debounce interactive updates (300ms)

## Resources

- **Quick Reference:** `/src/lib/design-tokens/CHART_QUICK_REFERENCE.md`
- **Migration Guide:** `/src/components/charts/MIGRATION_GUIDE.md`
- **Color Tokens:** `/src/lib/design-tokens/chart-colors.ts`
- **Config Tokens:** `/src/lib/design-tokens/chart-config.ts`
- **Recharts Docs:** https://recharts.org

## Contributing

When adding new chart components:

1. Use base components when possible
2. Apply design tokens (never hardcode colors)
3. Add React.memo for performance
4. Document with JSDoc
5. Export from index.ts
6. Test in light/dark mode
7. Verify accessibility

## Support

For questions or issues:
- Check `/src/components/charts/MIGRATION_GUIDE.md`
- See examples in `/src/components/dashboard/`
- Review design tokens in `/src/lib/design-tokens/`
