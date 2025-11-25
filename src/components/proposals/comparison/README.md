# Proposal Comparison Chart Components

This directory contains reusable chart components for comparing multiple lease proposals visually.

## Components

### 1. RentTrajectoryComparisonChart

**Purpose:** Displays rent trajectory over 30 years for multiple proposals on a single line chart.

**Location:** `./RentTrajectoryComparisonChart.tsx`

**Features:**
- Multiple proposals displayed simultaneously (supports up to 5)
- Unique color for each proposal (blue, green, amber, violet, red)
- Winner proposal highlighted with thicker line (3px vs 2px) and star emoji
- X-axis: Years (1-30)
- Y-axis: Rent in Millions (M)
- Interactive tooltip showing exact values
- Responsive design with proper margins
- Empty state handling

**Props:**
```typescript
interface RentTrajectoryComparisonChartProps {
  proposals: ProposalData[];  // Array of proposals to compare
  winnerId?: string;           // ID of winning proposal (for highlighting)
  className?: string;          // Optional Tailwind classes
}

interface ProposalData {
  id: string;
  name: string;
  developer?: string;
  rentModel: string;
  financials: {
    years: Array<{
      year: number;   // e.g., 2025, 2026, ...
      rent: number;   // Annual rent in SAR
    }>;
  };
  metrics?: {
    totalRent?: number;
    npv?: number;
  };
}
```

**Usage Example:**
```tsx
import { RentTrajectoryComparisonChart } from '@/components/proposals/comparison';

<RentTrajectoryComparisonChart
  proposals={selectedProposals}
  winnerId={winningProposalId}
/>
```

---

### 2. CostBreakdownComparisonChart

**Purpose:** Stacked bar chart showing cost breakdown (Rent, Staff Salaries, Other OpEx) for each proposal.

**Location:** `./CostBreakdownComparisonChart.tsx`

**Features:**
- Stacked bars showing three cost categories
- Consistent colors across proposals:
  - Rent: Blue (#3b82f6)
  - Staff Salaries: Green (#10b981)
  - Other OpEx: Amber (#f59e0b)
- Winner proposal highlighted with star emoji and bold text
- Y-axis: Total cost in Millions (M)
- Interactive tooltip with totals
- Summary table below chart showing detailed breakdown
- Responsive design with angled labels for readability
- Empty state handling

**Props:**
```typescript
interface CostBreakdownComparisonChartProps {
  proposals: ProposalCostData[];  // Array of proposals to compare
  winnerId?: string;               // ID of winning proposal (for highlighting)
  className?: string;              // Optional Tailwind classes
}

interface ProposalCostData {
  id: string;
  name: string;
  developer?: string;
  rentModel: string;
  financials?: {
    years: Array<{
      year: number;
      rent: number;
      staffSalaries: number;
      otherOpEx: number;
    }>;
  };
  metrics?: {
    totalRent?: number;
  };
}
```

**Usage Example:**
```tsx
import { CostBreakdownComparisonChart } from '@/components/proposals/comparison';

<CostBreakdownComparisonChart
  proposals={selectedProposals}
  winnerId={winningProposalId}
/>
```

---

### 3. FinancialStatementsComparison (Existing)

**Purpose:** Side-by-side comparison of full financial statements (P&L, Balance Sheet, Cash Flow).

**Location:** `./FinancialStatementsComparison.tsx`

**Note:** This component was created by another agent. See the component file for full documentation.

---

## Integration Guide

### Step 1: Import Components

```tsx
import {
  RentTrajectoryComparisonChart,
  CostBreakdownComparisonChart,
  ProposalData,
  ProposalCostData,
} from '@/components/proposals/comparison';
```

### Step 2: Fetch Proposal Data

```tsx
// Example: Fetch multiple proposals
const fetchProposals = async (proposalIds: string[]) => {
  const proposals = await Promise.all(
    proposalIds.map(id =>
      fetch(`/api/proposals/${id}`).then(res => res.json())
    )
  );
  return proposals;
};
```

### Step 3: Determine Winner

```tsx
// Example: Find proposal with lowest total rent
const winnerId = proposals.reduce((winner, current) => {
  const winnerRent = winner.metrics?.totalRent || Infinity;
  const currentRent = current.metrics?.totalRent || Infinity;
  return currentRent < winnerRent ? current : winner;
}, proposals[0])?.id;
```

### Step 4: Render Charts

```tsx
function ComparisonPage() {
  const [proposals, setProposals] = useState<ProposalData[]>([]);
  const [winnerId, setWinnerId] = useState<string>();

  return (
    <div className="space-y-6">
      <RentTrajectoryComparisonChart
        proposals={proposals}
        winnerId={winnerId}
      />

      <CostBreakdownComparisonChart
        proposals={proposals}
        winnerId={winnerId}
      />
    </div>
  );
}
```

---

## Data Structure Requirements

### Financials Data Format

Both charts expect financial data in the following structure:

```typescript
{
  financials: {
    years: [
      {
        year: 2025,          // Actual year
        rent: 5000000,       // Amount in SAR (not millions)
        staffSalaries: 2000000,
        otherOpEx: 1000000,
        // ... other financial line items
      },
      // ... for years 2025-2054 (30 years)
    ]
  }
}
```

**Important Notes:**
1. Years are stored as actual years (2025-2054), not indices
2. All amounts are in SAR (full currency), not millions
3. Charts automatically convert to millions for display
4. Missing data is handled gracefully (displays as 0)

---

## Styling & Design

### Color Palette

**Proposal Colors (RentTrajectoryChart):**
- Proposal 1: Blue (#3b82f6)
- Proposal 2: Green (#10b981)
- Proposal 3: Amber (#f59e0b)
- Proposal 4: Violet (#8b5cf6)
- Proposal 5: Red (#ef4444)

**Cost Category Colors (CostBreakdownChart):**
- Rent: Blue (#3b82f6)
- Staff Salaries: Green (#10b981)
- Other OpEx: Amber (#f59e0b)

### Winner Highlighting

- Rent Trajectory: Thicker line (3px vs 2px) + Star emoji in legend
- Cost Breakdown: Star emoji in labels + Bold text + Highlighted in table

### Responsive Behavior

- Charts use ResponsiveContainer (100% width)
- Height: Fixed at 400px for consistency
- Mobile: Horizontal scroll enabled for labels/legends
- Tablets/Desktop: Full width display

---

## Dependencies

- `recharts` (v3.4.1+) - Chart library
- `@/lib/utils/financial` - Utility functions (formatMillions)
- `@/components/ui/card` - Card wrapper component
- React (v19.2.0+)

---

## Testing Recommendations

### Unit Tests
```tsx
describe('RentTrajectoryComparisonChart', () => {
  it('should render empty state when no proposals', () => {
    // Test empty state
  });

  it('should highlight winner with thicker line', () => {
    // Test winner highlighting
  });

  it('should display correct number of proposals', () => {
    // Test multiple proposals
  });
});
```

### Integration Tests
- Test with 2-5 proposals
- Test winner highlighting
- Test responsive behavior
- Test tooltip interactions
- Test data formatting (millions display)

---

## Performance Considerations

- Charts use `useMemo` to prevent unnecessary recalculations
- Data transformation happens only on props change
- Recharts handles canvas optimization internally
- Tooltip renders only on hover (not always mounted)

---

## Accessibility

- Charts include proper ARIA labels
- Tooltips are keyboard accessible
- Color coding supplemented with text labels
- High contrast mode compatible
- Screen reader friendly legends

---

## Future Enhancements

Potential improvements for future phases:

1. **Export to Image:** Add button to export charts as PNG/SVG
2. **Toggle Proposals:** Allow hiding/showing individual proposals
3. **Zoom & Pan:** Enable zooming into specific year ranges
4. **Comparison Metrics:** Add delta/percentage change indicators
5. **Animation:** Add smooth transitions when data changes
6. **Dark Mode:** Optimize colors for dark theme
7. **Multiple Metrics:** Allow switching between rent, NPV, EBITDA in trajectory chart

---

## Troubleshooting

### Chart Not Rendering
- Verify proposals array is not empty
- Check financials.years data exists
- Ensure year values are numbers, not strings
- Check console for Recharts warnings

### Incorrect Values
- Verify amounts are in SAR (not millions)
- Check year range (2025-2054)
- Ensure data types match interface definitions

### Styling Issues
- Verify Card component is imported
- Check Tailwind classes are applied
- Ensure responsive container has parent with defined width

---

**Created:** November 24, 2025
**Track:** Phase 3, Week 11, Track 4B
**Status:** Complete
**Dependencies:** Recharts, Next.js 16, React 19, Tailwind CSS
