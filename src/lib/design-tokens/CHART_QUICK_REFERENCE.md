# Chart Design Tokens - Quick Reference

## Import Statements

```typescript
// Components
import { BaseLineChart, BaseBarChart, BaseAreaChart, CustomTooltip } from '@/components/charts';

// Colors
import { chartColors, getSeriesColor, getProposalColor } from '@/lib/design-tokens/chart-colors';

// Configuration
import { getAxisProps, getGridProps, getTooltipProps } from '@/lib/design-tokens/chart-config';
```

## Color Tokens

### Financial Semantic Colors
```typescript
chartColors.positive    // Sage green - gains, profits, positive trends
chartColors.negative    // Terracotta - losses, costs, negative trends
chartColors.neutral     // Copper - neutral values, baselines
chartColors.warning     // Amber - warnings, alerts
```

### Multi-Series Colors
```typescript
chartColors.series[0]   // Copper (primary)
chartColors.series[1]   // Sage (secondary)
chartColors.series[2]   // Blue-gray (tertiary)
chartColors.series[3]   // Purple (quaternary)

// Or use helper
getSeriesColor(index)   // Auto-cycles through series colors
```

### Proposal Comparison Colors
```typescript
chartColors.proposalA   // Copper
chartColors.proposalB   // Twilight Blue
chartColors.proposalC   // Blue-gray
chartColors.proposalD   // Purple
chartColors.proposalE   // Terracotta

// Or use helper
getProposalColor(index) // Auto-cycles through proposal colors
```

### Chart Structure Colors
```typescript
chartColors.grid        // Grid lines
chartColors.axis        // Axis lines and labels
chartColors.background  // Chart background
chartColors.cardBackground  // Card background
```

## Base Components

### BaseLineChart

```tsx
<BaseLineChart
  data={chartData}
  series={[
    { dataKey: "revenue", name: "Revenue", color: chartColors.positive },
    { dataKey: "costs", name: "Costs", color: chartColors.negative },
  ]}
  xAxisKey="year"
  xAxisFormatter={(value) => `${value}`}
  yAxisFormatter={(value) => `${value}M`}
  tooltipFormat="millions"
  showLegend
  showGrid
  height={400}
/>
```

### BaseBarChart

```tsx
<BaseBarChart
  data={chartData}
  series={[
    { dataKey: "value", name: "Monthly Value" },
  ]}
  xAxisKey="month"
  tooltipFormat="millions"
  layout="vertical"  // or "horizontal"
/>
```

### BaseAreaChart

```tsx
<BaseAreaChart
  data={chartData}
  series={[
    {
      dataKey: "cumulative",
      name: "Cumulative Cash",
      useGradient: true,
      stroke: chartColors.neutral
    },
  ]}
  xAxisKey="year"
  tooltipFormat="millions"
/>
```

## Configuration Helpers

### Axis Configuration
```tsx
import { getAxisProps } from '@/lib/design-tokens/chart-config';

<XAxis {...getAxisProps('x')} dataKey="year" />
<YAxis {...getAxisProps('y')} tickFormatter={formatMillions} />
```

### Grid Configuration
```tsx
import { getGridProps } from '@/lib/design-tokens/chart-config';

<CartesianGrid {...getGridProps()} />
<CartesianGrid {...getGridProps({ vertical: true })} />
```

### Tooltip Configuration
```tsx
import { getTooltipProps } from '@/lib/design-tokens/chart-config';

<Tooltip {...getTooltipProps()} content={<CustomTooltip format="millions" />} />
```

### Legend Configuration
```tsx
import { getLegendProps } from '@/lib/design-tokens/chart-config';

<Legend {...getLegendProps()} />
```

## Common Patterns

### Positive/Negative Bar Colors
```tsx
series={[{
  dataKey: "netCashFlow",
  cellColors: data.map(d =>
    d.netCashFlow >= 0 ? chartColors.positive : chartColors.negative
  )
}]}
```

### Multi-Proposal Line Chart
```tsx
series={proposals.map((p, i) => ({
  dataKey: p.id,
  name: p.name,
  color: getProposalColor(i)
}))}
```

### Stacked Areas with Gradients
```tsx
series={[
  { dataKey: "tuition", stackId: "1", useGradient: true },
  { dataKey: "fees", stackId: "1", useGradient: true },
]}
```

### Reference Lines
```tsx
import { chartColors } from '@/lib/design-tokens/chart-colors';

<ReferenceLine
  y={0}
  stroke={chartColors.axis}
  strokeDasharray="5 5"
  label="Break-even"
/>
```

## Tooltip Formats

```tsx
// Millions with SAR
<CustomTooltip format="millions" currency="SAR" />

// Billions
<CustomTooltip format="billions" currency="SAR" />

// Percentage
<CustomTooltip format="percent" />

// Plain numbers
<CustomTooltip format="number" />

// Or use pre-configured
<FinancialTooltip />     // millions format
<PercentTooltip />       // percent format
<NumberTooltip />        // number format
```

## Color Mappings (Specific Use Cases)

### Rent Trajectory
```typescript
import { chartColorMappings } from '@/lib/design-tokens/chart-colors';

stroke={chartColorMappings.rentTrajectory.primaryRent}
stroke={chartColorMappings.rentTrajectory.historicalRent}
stroke={chartColorMappings.rentTrajectory.projectedRent}
```

### NPV Sensitivity
```typescript
fill={chartColorMappings.sensitivity.positiveImpact}
fill={chartColorMappings.sensitivity.negativeImpact}
stroke={chartColorMappings.sensitivity.baseline}
```

### Cost Breakdown
```typescript
fill={chartColorMappings.costBreakdown.rent}
fill={chartColorMappings.costBreakdown.staff}
fill={chartColorMappings.costBreakdown.otherOpex}
fill={chartColorMappings.costBreakdown.capex}
```

### Cash Flow
```typescript
fill={chartColorMappings.cashFlow.positive}
fill={chartColorMappings.cashFlow.negative}
stroke={chartColorMappings.cashFlow.cumulative}
```

## Loading States

```tsx
import { ChartSkeleton } from '@/components/charts';

{isLoading ? (
  <ChartSkeleton type="line" height={400} />
) : (
  <BaseLineChart data={data} {...props} />
)}
```

## Performance Tips

### Memoize Data
```tsx
const chartData = useMemo(() =>
  transformDataForChart(rawData),
  [rawData]
);
```

### Debounce Updates
```tsx
const debouncedValue = useDebouncedValue(sliderValue, 300);
```

### Sample Large Datasets
```tsx
const sampledData = useMemo(() =>
  data.filter((_, idx) => idx % 2 === 0),
  [data]
);
```

## Dark Mode

All colors automatically adapt to dark mode via CSS variables. No code changes needed.

## Color Constants Reference

| Token | Light Mode | Dark Mode | Use Case |
|-------|-----------|-----------|----------|
| `positive` | Sage Green | Brighter Sage | Profits, gains |
| `negative` | Terracotta | Brighter Terracotta | Losses, costs |
| `neutral` | Copper | Brighter Copper | Neutral values |
| `grid` | Stone-300 | Stone-700 | Grid lines |
| `axis` | Stone-600 | Stone-400 | Axis labels |

## Migration from Hex Values

```typescript
// ❌ Old
stroke="#3b82f6"
fill="#10b981"

// ✅ New
stroke={chartColors.neutral}
fill={chartColors.positive}
```

## Need More Help?

- Full migration guide: `/src/components/charts/MIGRATION_GUIDE.md`
- Color tokens source: `/src/lib/design-tokens/chart-colors.ts`
- Config tokens source: `/src/lib/design-tokens/chart-config.ts`
- Component examples: `/src/components/charts/`
