# PHASE 3: UI/UX SPECIFICATIONS & COMPONENT LIBRARY
## School Lease Proposal Assessment Application - Project Zeta

**Document Version:** 1.0
**Date:** November 24, 2025
**Status:** COMPLETE - Ready for Implementation
**Alignment:** 100% with PRD v2.0, PRD v2.1, TSD, and Financial Rules

---

## TABLE OF CONTENTS

1. [Design System Foundation](#1-design-system-foundation)
2. [Component Library Specifications](#2-component-library-specifications)
3. [Screen Layouts & Mockups](#3-screen-layouts--mockups)
4. [Navigation & Information Architecture](#4-navigation--information-architecture)
5. [Interaction Patterns](#5-interaction-patterns)
6. [Responsive Design](#6-responsive-design)
7. [Implementation Checklist](#7-implementation-checklist)

---

## 1. DESIGN SYSTEM FOUNDATION

### 1.1 Color Palette

**Primary Colors:**
```css
--primary-900: #1e3a8a;      /* Deep Blue - Headers, Primary Actions */
--primary-700: #1d4ed8;      /* Blue - Interactive Elements */
--primary-500: #3b82f6;      /* Sky Blue - Hover States */
--primary-300: #93c5fd;      /* Light Blue - Backgrounds */
--primary-100: #dbeafe;      /* Very Light Blue - Subtle Backgrounds */
```

**Neutral Colors:**
```css
--neutral-900: #111827;      /* Almost Black - Body Text */
--neutral-700: #374151;      /* Dark Gray - Secondary Text */
--neutral-500: #6b7280;      /* Medium Gray - Muted Text */
--neutral-300: #d1d5db;      /* Light Gray - Borders */
--neutral-100: #f3f4f6;      /* Very Light Gray - Backgrounds */
--neutral-50: #f9fafb;       /* Off-White - Page Background */
--white: #ffffff;            /* Pure White - Cards, Modals */
```

**Semantic Colors:**
```css
/* Success (Green) */
--success-700: #15803d;      /* Dark Green */
--success-500: #22c55e;      /* Green - Positive Values */
--success-100: #dcfce7;      /* Light Green - Success Backgrounds */

/* Warning (Amber) */
--warning-700: #b45309;      /* Dark Amber */
--warning-500: #f59e0b;      /* Amber - Warnings */
--warning-100: #fef3c7;      /* Light Amber - Warning Backgrounds */

/* Danger (Red) */
--danger-700: #b91c1c;       /* Dark Red */
--danger-500: #ef4444;       /* Red - Negative Values, Errors */
--danger-100: #fee2e2;       /* Light Red - Error Backgrounds */

/* Info (Cyan) */
--info-700: #0e7490;         /* Dark Cyan */
--info-500: #06b6d4;         /* Cyan - Information */
--info-100: #cffafe;         /* Light Cyan - Info Backgrounds */
```

**Chart Colors (for Recharts):**
```css
--chart-1: #3b82f6;          /* Primary Blue */
--chart-2: #10b981;          /* Emerald Green */
--chart-3: #f59e0b;          /* Amber */
--chart-4: #ef4444;          /* Red */
--chart-5: #8b5cf6;          /* Purple */
--chart-6: #ec4899;          /* Pink */
```

### 1.2 Typography

**Font Family:**
```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'Fira Code', 'Consolas', monospace; /* For financial values */
```

**Font Sizes:**
```css
--text-xs: 0.75rem;          /* 12px - Small labels */
--text-sm: 0.875rem;         /* 14px - Secondary text */
--text-base: 1rem;           /* 16px - Body text */
--text-lg: 1.125rem;         /* 18px - Large body */
--text-xl: 1.25rem;          /* 20px - Small headings */
--text-2xl: 1.5rem;          /* 24px - Card headings */
--text-3xl: 1.875rem;        /* 30px - Section headings */
--text-4xl: 2.25rem;         /* 36px - Page headings */
```

**Font Weights:**
```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

**Line Heights:**
```css
--leading-tight: 1.25;       /* Headings */
--leading-normal: 1.5;       /* Body text */
--leading-relaxed: 1.75;     /* Large blocks */
```

### 1.3 Spacing System

**Base Unit: 4px (0.25rem)**

```css
--space-1: 0.25rem;          /* 4px */
--space-2: 0.5rem;           /* 8px */
--space-3: 0.75rem;          /* 12px */
--space-4: 1rem;             /* 16px */
--space-5: 1.25rem;          /* 20px */
--space-6: 1.5rem;           /* 24px */
--space-8: 2rem;             /* 32px */
--space-10: 2.5rem;          /* 40px */
--space-12: 3rem;            /* 48px */
--space-16: 4rem;            /* 64px */
```

**Layout Spacing:**
```css
--container-padding: var(--space-6);     /* 24px */
--card-padding: var(--space-6);          /* 24px */
--section-gap: var(--space-8);           /* 32px */
--page-gap: var(--space-12);             /* 48px */
```

### 1.4 Border Radius

```css
--radius-sm: 0.25rem;        /* 4px - Small elements */
--radius-md: 0.375rem;       /* 6px - Buttons, inputs */
--radius-lg: 0.5rem;         /* 8px - Cards */
--radius-xl: 0.75rem;        /* 12px - Large cards */
--radius-full: 9999px;       /* Fully rounded - Pills, badges */
```

### 1.5 Shadows

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
```

### 1.6 Financial Number Formatting

**CRITICAL: All financial amounts display in Millions (M) with 2 decimals**

```typescript
// Format function
function formatMillions(value: number | Decimal): string {
  const millions = (value instanceof Decimal ? value.toNumber() : value) / 1_000_000;
  return `${millions.toFixed(2)} M`;
}

// Display examples:
// 1,500,000 → "1.50 M"
// 125,750,000 → "125.75 M"
// -5,000,000 → "-5.00 M"
```

**Color Coding:**
- Positive values: `--neutral-900` (dark gray)
- Negative values: `--danger-500` (red) + parentheses
- Zero: `--neutral-500` (medium gray)

---

## 2. COMPONENT LIBRARY SPECIFICATIONS

### 2.1 Button Component

**Variants:**

```tsx
// Primary Button
<Button variant="primary" size="md">
  Calculate 30 Years
</Button>

// Secondary Button
<Button variant="secondary" size="md">
  Cancel
</Button>

// Danger Button
<Button variant="danger" size="md">
  Delete Proposal
</Button>

// Ghost Button
<Button variant="ghost" size="sm">
  View Details
</Button>
```

**Specifications:**

| Variant | Background | Text Color | Border | Hover |
|---------|------------|------------|--------|-------|
| Primary | `primary-700` | White | None | `primary-900` |
| Secondary | `neutral-100` | `neutral-900` | `neutral-300` | `neutral-200` |
| Danger | `danger-500` | White | None | `danger-700` |
| Ghost | Transparent | `primary-700` | None | `primary-100` bg |

**Sizes:**

| Size | Height | Padding X | Font Size |
|------|--------|-----------|-----------|
| sm | 32px | 12px | 14px |
| md | 40px | 16px | 16px |
| lg | 48px | 24px | 18px |

**States:**
- Default
- Hover (cursor pointer)
- Active (pressed)
- Disabled (opacity 50%, cursor not-allowed)
- Loading (spinner icon + disabled)

---

### 2.2 Input Component

```tsx
<Input
  label="Base Rent 2028"
  placeholder="Enter amount in SAR"
  type="number"
  value={baseRent}
  onChange={handleChange}
  error={errors.baseRent}
  helpText="Base rent for year 2028"
/>
```

**Specifications:**
- Height: 40px
- Border: 1px solid `neutral-300`
- Border Radius: `radius-md`
- Padding: 12px
- Font Size: 16px
- Label: 14px, `font-medium`, `neutral-700`

**States:**
- Default
- Focus (border `primary-500`, ring `primary-300`)
- Error (border `danger-500`, ring `danger-100`)
- Disabled (bg `neutral-100`, cursor not-allowed)

**With Units:**
```tsx
<Input
  label="Revenue Share %"
  type="number"
  suffix="%"
  value={revenueShare}
/>
// Displays: [8] %
```

---

### 2.3 Card Component

```tsx
<Card>
  <CardHeader>
    <CardTitle>Proposal Overview</CardTitle>
    <CardDescription>Key metrics and assumptions</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Card content */}
  </CardContent>
  <CardFooter>
    <Button>View Details</Button>
  </CardFooter>
</Card>
```

**Specifications:**
- Background: White
- Border: 1px solid `neutral-200`
- Border Radius: `radius-lg`
- Padding: 24px
- Shadow: `shadow-sm`
- Hover: `shadow-md` (subtle lift)

**Card Header:**
- Title: `text-2xl`, `font-semibold`
- Description: `text-sm`, `neutral-500`
- Gap: 8px

---

### 2.4 Table Component (Financial Statements)

**CRITICAL: All amounts in Millions (M)**

```tsx
<FinancialTable
  statement="PL"  // P&L, BS, or CF
  years={[2023, 2024, 2025, ...2053]}
  data={financialData}
  format="millions"  // REQUIRED
  showFormulas={true}  // Tooltip on hover
/>
```

**Specifications:**

**Header Row:**
- Background: `neutral-100`
- Font: `text-sm`, `font-semibold`, `neutral-700`
- Padding: 12px 16px
- Border Bottom: 2px solid `neutral-300`

**Data Rows:**
- Font: `font-mono`, `text-sm` (financial values)
- Padding: 10px 16px
- Border Bottom: 1px solid `neutral-200`
- Hover: `neutral-50` background

**Financial Values:**
- Right-aligned
- Font: `font-mono` (monospace for alignment)
- Color: Positive = `neutral-900`, Negative = `danger-500`
- Format: `"125.75 M"` or `"(5.00 M)"` for negative

**Row Types:**
```tsx
// Regular line item
<tr className="data-row">
  <td>Revenue</td>
  <td>125.75 M</td>
  ...
</tr>

// Subtotal (e.g., EBITDA)
<tr className="subtotal-row font-semibold bg-neutral-50">
  <td>EBITDA</td>
  <td>35.20 M</td>
  ...
</tr>

// Total (e.g., Net Income)
<tr className="total-row font-bold bg-primary-100 border-t-2">
  <td>Net Income</td>
  <td>22.50 M</td>
  ...
</tr>
```

**Calculation Tooltip:**
```tsx
// Hover over any value
<Tooltip content="12.05 M = 11.00 M × 1.05">
  <td>12.05 M</td>
</Tooltip>
```

---

### 2.5 Slider Component (Scenario Analysis)

```tsx
<Slider
  label="Enrollment %"
  min={50}
  max={150}
  step={5}
  value={enrollment}
  onChange={handleChange}
  defaultValue={100}
  unit="%"
  showValue={true}
/>
```

**Specifications:**
- Track: 4px height, `neutral-300` background
- Filled Track: `primary-500`
- Thumb: 20px circle, `primary-700`, shadow
- Label: Above slider, `text-sm`, `font-medium`
- Value Display: Right side, `text-lg`, `font-bold`, `primary-700`

**Layout:**
```
Enrollment %                          120%
━━━━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━━━━━
50%            100%                  150%
```

---

### 2.6 Badge Component

```tsx
<Badge variant="success">Active</Badge>
<Badge variant="warning">Draft</Badge>
<Badge variant="danger">Archived</Badge>
<Badge variant="info">New</Badge>
```

**Specifications:**

| Variant | Background | Text Color |
|---------|------------|------------|
| Success | `success-100` | `success-700` |
| Warning | `warning-100` | `warning-700` |
| Danger | `danger-100` | `danger-700` |
| Info | `info-100` | `info-700` |

- Border Radius: `radius-full` (pill shape)
- Padding: 4px 12px
- Font: `text-xs`, `font-medium`
- Height: 24px

---

### 2.7 Tab Component

```tsx
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="transition">Transition Setup</TabsTrigger>
    <TabsTrigger value="dynamic">Dynamic Setup</TabsTrigger>
    <TabsTrigger value="financials">Financial Statements</TabsTrigger>
    <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
    <TabsTrigger value="sensitivity">Sensitivity Analysis</TabsTrigger>
  </TabsList>

  <TabsContent value="overview">
    {/* Content */}
  </TabsContent>
</Tabs>
```

**Specifications:**

**Tab List:**
- Background: `neutral-100`
- Border Bottom: 2px solid `neutral-200`
- Padding: 4px
- Border Radius: `radius-md`

**Tab Trigger (Inactive):**
- Background: Transparent
- Color: `neutral-700`
- Padding: 8px 16px
- Border Radius: `radius-sm`

**Tab Trigger (Active):**
- Background: White
- Color: `primary-700`
- Border Bottom: 2px solid `primary-700`
- Font Weight: `font-semibold`

---

### 2.8 Chart Components (Recharts)

**Line Chart (Rent Over Time):**
```tsx
<ResponsiveContainer width="100%" height={400}>
  <LineChart data={rentData}>
    <CartesianGrid strokeDasharray="3 3" stroke={colors.neutral300} />
    <XAxis
      dataKey="year"
      stroke={colors.neutral700}
      style={{ fontSize: '12px' }}
    />
    <YAxis
      stroke={colors.neutral700}
      style={{ fontSize: '12px' }}
      tickFormatter={(value) => `${value} M`}
    />
    <Tooltip
      contentStyle={{
        background: 'white',
        border: `1px solid ${colors.neutral200}`,
        borderRadius: '8px'
      }}
    />
    <Legend />
    <Line
      type="monotone"
      dataKey="proposalA"
      stroke={colors.chart1}
      strokeWidth={2}
      name="Proposal A"
    />
    <Line
      type="monotone"
      dataKey="proposalB"
      stroke={colors.chart2}
      strokeWidth={2}
      name="Proposal B"
    />
  </LineChart>
</ResponsiveContainer>
```

**Tornado Diagram (Sensitivity Analysis):**
```tsx
<ResponsiveContainer width="100%" height={400}>
  <BarChart
    data={sensitivityData}
    layout="vertical"
    margin={{ left: 120 }}
  >
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis type="number" tickFormatter={(value) => `${value} M`} />
    <YAxis
      type="category"
      dataKey="variable"
      width={120}
      style={{ fontSize: '12px' }}
    />
    <Tooltip />
    <Bar
      dataKey="impactRange"
      fill={colors.primary500}
      radius={[0, 8, 8, 0]}
    />
  </BarChart>
</ResponsiveContainer>
```

---

### 2.9 Modal / Dialog Component

```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Delete Proposal</DialogTitle>
      <DialogDescription>
        This action cannot be undone.
      </DialogDescription>
    </DialogHeader>

    <DialogBody>
      {/* Content */}
    </DialogBody>

    <DialogFooter>
      <Button variant="secondary" onClick={handleCancel}>
        Cancel
      </Button>
      <Button variant="danger" onClick={handleConfirm}>
        Delete
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Specifications:**
- Background: White
- Max Width: 600px
- Border Radius: `radius-lg`
- Shadow: `shadow-xl`
- Overlay: Black with 50% opacity
- Animation: Fade in + Scale up (200ms)

---

## 3. SCREEN LAYOUTS & MOCKUPS

### 3.1 Admin Dashboard

```
┌─────────────────────────────────────────────────────────────────────┐
│ Header: Project Zeta                                 [Admin] [Logout]│
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Admin Dashboard                                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                      │
│  ┌────────────────────┐  ┌────────────────────┐  ┌──────────────┐ │
│  │ Historical Data    │  │ System Config      │  │ CapEx Module │ │
│  │ ──────────────────│  │ ──────────────────│  │ ─────────────│ │
│  │                    │  │                    │  │              │ │
│  │ Status: Complete ✓ │  │ Status: Configured │  │ Auto-Invest  │ │
│  │                    │  │                    │  │ Enabled: Yes │ │
│  │ 2023: ✓ Confirmed  │  │ Zakat: 2.5%       │  │              │ │
│  │ 2024: ✓ Confirmed  │  │ Min Cash: 1.00 M  │  │ Frequency:   │ │
│  │                    │  │                    │  │ Every 5 yrs  │ │
│  │ [View Data]        │  │ [Edit Config]      │  │ [Configure]  │ │
│  └────────────────────┘  └────────────────────┘  └──────────────┘ │
│                                                                      │
│  Quick Actions                                                       │
│  ──────────────                                                      │
│  [+ New Proposal]  [View All Proposals]  [System Settings]          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 3.2 Historical Data Input (2023-2024)

```
┌─────────────────────────────────────────────────────────────────────┐
│ ← Back to Admin                          Historical Data Entry      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Historical Financial Data (2023-2024)                              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                      │
│  Year:  [2023 ▼]                                                    │
│                                                                      │
│  ┌─ Profit & Loss Statement ───────────────────────────────────┐   │
│  │                                                               │   │
│  │  Revenue                                                      │   │
│  │  ├─ FR Tuition         [____________] M  SAR                │   │
│  │  ├─ IB Tuition         [____________] M  SAR                │   │
│  │  └─ Other Revenue      [____________] M  SAR                │   │
│  │                                                               │   │
│  │  Operating Expenses                                           │   │
│  │  ├─ Staff Costs        [____________] M  SAR                │   │
│  │  ├─ Rent               [____________] M  SAR                │   │
│  │  └─ Other OpEx         [____________] M  SAR                │   │
│  │                                                               │   │
│  │  Below EBITDA                                                 │   │
│  │  ├─ Depreciation       [____________] M  SAR                │   │
│  │  ├─ Interest           [____________] M  SAR                │   │
│  │  └─ Zakat              [____________] M  SAR                │   │
│  │                                                               │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─ Balance Sheet ──────────────────────────────────────────────┐   │
│  │  [Expandable - Click to expand]                              │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─ Cash Flow Statement ────────────────────────────────────────┐   │
│  │  [Expandable - Click to expand]                              │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Status: Draft                                                       │
│  [Save as Draft]  [Confirm & Lock Data]                             │
│                                                                      │
│  ⓘ Once confirmed, this data becomes immutable and locked.          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 3.3 Proposal List View

```
┌─────────────────────────────────────────────────────────────────────┐
│ Project Zeta                                    [Faker] [Settings]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Lease Proposals                                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                      │
│  [+ New Proposal]     [🔍 Search]  [Filter: All ▼]  [Sort: Recent ▼]│
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ 🏢 Developer ABC - Downtown Campus                             │ │
│  │    Fixed Escalation Model                          [Active]    │ │
│  │    ────────────────────────────────────────────────────────────│ │
│  │    Total Rent (25yr): 125.30 M │ NPV: (89.20 M) │ EBITDA: 220.40 M│ │
│  │    Last Updated: 2 days ago                                    │ │
│  │    [View Details] [Compare] [⋮ More]                           │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ 🏢 Developer XYZ - North Campus                                │ │
│  │    Revenue Share Model (8%)                        [Draft]     │ │
│  │    ────────────────────────────────────────────────────────────│ │
│  │    Total Rent (25yr): 142.70 M │ NPV: (102.40 M) │ EBITDA: 235.10 M│ │
│  │    Last Updated: 5 days ago                                    │ │
│  │    [View Details] [Compare] [⋮ More]                           │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ 🏢 Developer QRS - South Campus                                │ │
│  │    Partner Model                                   [Archived]  │ │
│  │    ────────────────────────────────────────────────────────────│ │
│  │    Total Rent (25yr): 138.90 M │ NPV: (95.80 M) │ EBITDA: 228.50 M│ │
│  │    Last Updated: 10 days ago                                   │ │
│  │    [View Details] [Compare] [⋮ More]                           │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 3.4 Proposal Detail - Overview Tab

```
┌─────────────────────────────────────────────────────────────────────┐
│ ← Back to Proposals              Developer ABC - Downtown Campus    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  [Overview] [Transition] [Dynamic] [Financials] [Scenarios] [Sensitivity]│
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                      │
│  Key Metrics                                                         │
│  ──────────                                                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐│
│  │Total Rent    │ │NPV (4%)      │ │Cumulative    │ │Lowest Cash ││
│  │(25 years)    │ │              │ │EBITDA        │ │Position    ││
│  │              │ │              │ │              │ │            ││
│  │ 125.30 M     │ │ (89.20 M)    │ │ 220.40 M     │ │ 2.50 M     ││
│  │              │ │              │ │              │ │            ││
│  │ ✅ Lowest    │ │ ⚠️ High      │ │ ✅ Strong    │ │ ⚠️ Low     ││
│  └──────────────┘ └──────────────┘ └──────────────┘ └────────────┘│
│                                                                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐│
│  │Avg Annual    │ │Maximum Debt  │ │Year 1 Rent   │ │Year 25 Rent││
│  │Rent          │ │              │ │              │ │            ││
│  │              │ │              │ │              │ │            ││
│  │ 5.01 M       │ │ 45.00 M      │ │ 3.50 M       │ │ 8.20 M     ││
│  └──────────────┘ └──────────────┘ └──────────────┘ └────────────┘│
│                                                                      │
│  Rent Trajectory (2028-2053)                                        │
│  ───────────────────────────                                        │
│  [Line Chart showing rent growth over 25 years]                     │
│                                                                      │
│  Assumptions Summary                                                 │
│  ───────────────────                                                 │
│  ▼ Rent Model: Fixed Escalation                                     │
│     └─ Base Rent 2028: 3.50 M │ Growth: 3% │ Frequency: 1 year     │
│                                                                      │
│  ▼ Enrollment                                                        │
│     └─ Capacity: 2,000 │ Ramp-up: 20%-40%-60%-80%-100%             │
│                                                                      │
│  ▼ Curriculum                                                        │
│     └─ FR: Active │ IB: Inactive                                    │
│                                                                      │
│  [Edit Proposal] [Duplicate] [Delete] [Export Report]               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 3.5 Proposal Detail - Financial Statements Tab (CRITICAL)

```
┌─────────────────────────────────────────────────────────────────────┐
│ ← Back                           Developer ABC - Downtown Campus    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  [Overview] [Transition] [Dynamic] [Financials] [Scenarios] [Sensitivity]│
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                      │
│  Year Range: [All Years▼]  │  [P&L] [Balance Sheet] [Cash Flow]    │
│  ────────────────────────────────────────────────────────────────  │
│                                                                      │
│  Profit & Loss Statement (in Millions SAR)                          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                      │
│  ┌───────────────┬──────┬──────┬──────┬──────┬─────┬──────────────┐│
│  │ Line Item     │ 2023 │ 2024 │ 2025 │ 2026 │ ... │ 2053         ││
│  ├───────────────┼──────┼──────┼──────┼──────┼─────┼──────────────┤│
│  │ Revenue       │45.20 │48.50 │52.30 │57.80 │ ... │ 180.75 M     ││
│  │ - Staff Costs │18.00 │19.50 │21.20 │23.40 │ ... │  72.10 M     ││
│  │ - Rent        │10.00 │11.00 │12.05 │13.20 │ ... │  45.30 M     ││
│  │ - Other OpEx  │ 8.50 │ 9.20 │10.15 │11.20 │ ... │  35.40 M     ││
│  │ = EBITDA      │ 8.70 │ 8.80 │ 8.90 │10.00 │ ... │  27.95 M  💡 ││
│  │ - Depreciation│ 5.00 │ 5.00 │ 5.20 │ 5.40 │ ... │   8.50 M  💡 ││
│  │ = EBIT        │ 3.70 │ 3.80 │ 3.70 │ 4.60 │ ... │  19.45 M  💡 ││
│  │ - Interest    │ 1.20 │ 1.30 │ 1.25 │ 1.15 │ ... │   2.10 M  💡 ││
│  │ = EBT         │ 2.50 │ 2.50 │ 2.45 │ 3.45 │ ... │  17.35 M  💡 ││
│  │ - Zakat (2.5%)│ 0.06 │ 0.06 │ 0.06 │ 0.09 │ ... │   0.43 M  💡 ││
│  │ = Net Income  │ 2.44 │ 2.44 │ 2.39 │ 3.36 │ ... │  16.92 M  💡 ││
│  └───────────────┴──────┴──────┴──────┴──────┴─────┴──────────────┘│
│                                                                      │
│  💡 = Hover for formula                                              │
│                                                                      │
│  [Export to Excel] [Export to PDF]                                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Tooltip on Hover:**
```
┌────────────────────────────────┐
│ EBITDA Calculation             │
│ ────────────────────────────── │
│ Revenue - Operating Expenses   │
│ = 52.30 M - 43.40 M            │
│ = 8.90 M                       │
└────────────────────────────────┘
```

---

### 3.6 Proposal Detail - Scenarios Tab (Interactive Sliders)

```
┌─────────────────────────────────────────────────────────────────────┐
│ ← Back                           Developer ABC - Downtown Campus    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  [Overview] [Transition] [Dynamic] [Financials] [Scenarios] [Sensitivity]│
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                      │
│  Interactive Scenario Analysis                                       │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                      │
│  Adjust assumptions with sliders to see real-time impact            │
│                                                                      │
│  Enrollment %                                      120%              │
│  ━━━━━━━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━━━━━━━━━━                    │
│  50%              100%                             150%              │
│                                                                      │
│  CPI Rate %                                        4.5%              │
│  ━━━━━━━━━━━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━━━━━━━                    │
│  0%                5%                              10%               │
│                                                                      │
│  Tuition Growth %                                  6%                │
│  ━━━━━━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                    │
│  0%                8%                              15%               │
│                                                                      │
│  Rent Escalation %                                 3.5%              │
│  ━━━━━━━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━━━━━━━━━━━                    │
│  0%                5%                              10%               │
│                                                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                      │
│  Impact Summary                                                      │
│  ──────────────                                                      │
│  ┌──────────────────┬──────────────┬──────────────┬──────────────┐ │
│  │ Metric           │ Baseline     │ Current      │ Change       │ │
│  ├──────────────────┼──────────────┼──────────────┼──────────────┤ │
│  │Total Rent (25yr) │ 125.30 M     │ 138.50 M ⬆   │ +10.5%       │ │
│  │NPV (4%)          │ (89.20 M)    │ (95.10 M) ⬇  │  -6.6%       │ │
│  │Cumulative EBITDA │ 220.40 M     │ 245.80 M ⬆   │ +11.5%       │ │
│  │Lowest Cash       │   2.50 M     │   1.80 M ⬇   │ -28.0%       │ │
│  └──────────────────┴──────────────┴──────────────┴──────────────┘ │
│                                                                      │
│  [Reset to Baseline] [Save as Scenario "Optimistic Growth"]         │
│                                                                      │
│  Saved Scenarios                                                     │
│  ───────────────                                                     │
│  • Base Case [Load] [Delete]                                        │
│  • Conservative [Load] [Delete]                                     │
│  • Aggressive Growth [Load] [Delete]                                │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 3.7 Proposal Detail - Sensitivity Analysis Tab

```
┌─────────────────────────────────────────────────────────────────────┐
│ ← Back                           Developer ABC - Downtown Campus    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  [Overview] [Transition] [Dynamic] [Financials] [Scenarios] [Sensitivity]│
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                      │
│  Formal Sensitivity Analysis                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                      │
│  Variable: [Enrollment % ▼]   Range: [-20% to +20%]   Metric: [NPV ▼]│
│                                                        [Run Analysis] │
│                                                                      │
│  Tornado Diagram (Impact on NPV)                                    │
│  ────────────────────────────────────────────────────────────────  │
│                                                                      │
│  Enrollment %    ██████████████████████████████████  30.3 M         │
│  Rent Escalation ████████████████████████            20.8 M         │
│  Tuition Growth  ██████████████                      10.4 M         │
│  CPI Rate        ████                                  3.6 M         │
│                  ─────────────────────────────────                  │
│                  0        10       20       30        40 M           │
│                         Impact Range                                 │
│                                                                      │
│  Sensitivity Table                                                   │
│  ─────────────────                                                   │
│  ┌──────────────────┬─────────┬─────────┬─────────┬─────────┬──────┐│
│  │ Variable         │  -20%   │  -10%   │  Base   │  +10%   │ +20% ││
│  ├──────────────────┼─────────┼─────────┼─────────┼─────────┼──────┤│
│  │ Enrollment %     │ (110.2) │ (118.5) │ (89.2)  │ (60.5)  │(32.1)││
│  │ Rent Escalation  │ (115.0) │ (102.1) │ (89.2)  │ (76.3)  │(63.4)││
│  │ Tuition Growth   │ (120.1) │ (104.7) │ (89.2)  │ (73.8)  │(58.3)││
│  │ CPI Rate         │  (85.6) │  (87.4) │ (89.2)  │ (91.0)  │(92.8)││
│  └──────────────────┴─────────┴─────────┴─────────┴─────────┴──────┘│
│                                                                      │
│  Key Insights                                                        │
│  ────────────                                                        │
│  • Enrollment has the highest impact on NPV (30.3 M range)          │
│  • Rent escalation is second most sensitive (20.8 M range)          │
│  • CPI rate has minimal impact (3.6 M range)                        │
│                                                                      │
│  [Export Sensitivity Report (PDF)] [Export Data (Excel)]            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 3.8 Proposal Comparison Screen

```
┌─────────────────────────────────────────────────────────────────────┐
│ ← Back to Proposals                      Compare Proposals          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Select Proposals to Compare (2-5)                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                      │
│  ☑ Developer ABC - Downtown (Fixed 3%)                              │
│  ☑ Developer XYZ - North (Revenue Share 8%)                         │
│  ☑ Developer QRS - South (Partner)                                  │
│  ☐ Developer LMN - East (Fixed 4%)                                  │
│                                                                      │
│  [Compare Selected (3)]                                              │
│                                                                      │
│  Comparison Matrix                                                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                      │
│  ┌────────────────────┬───────────┬───────────┬───────────┬───────┐│
│  │ Metric             │ ABC       │ XYZ       │ QRS       │ Winner││
│  ├────────────────────┼───────────┼───────────┼───────────┼───────┤│
│  │Total Rent (25yr)   │125.30 M ✅│142.70 M   │138.90 M   │  ABC  ││
│  │NPV (4%)            │(89.20 M)✅│(102.40 M) │(95.80 M)  │  ABC  ││
│  │Cumulative EBITDA   │220.40 M   │235.10 M ✅│228.50 M   │  XYZ  ││
│  │Avg Annual Rent     │  4.80 M ✅│  5.50 M   │  5.20 M   │  ABC  ││
│  │Lowest Cash Position│  2.50 M   │  3.10 M ✅│  2.80 M   │  XYZ  ││
│  │Maximum Debt        │ 45.00 M ✅│ 52.00 M   │ 48.00 M   │  ABC  ││
│  └────────────────────┴───────────┴───────────┴───────────┴───────┘│
│                                                                      │
│  Overall Winner: Developer ABC (4 out of 6 metrics)                 │
│                                                                      │
│  Rent Trajectory (2028-2053)                                        │
│  ────────────────────────────────────────────────────────────────  │
│  [Line chart with 3 lines - ABC (blue), XYZ (green), QRS (amber)]  │
│                                                                      │
│  [View Side-by-Side Financials] [Export Comparison (PDF)]          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. NAVIGATION & INFORMATION ARCHITECTURE

### 4.1 Primary Navigation (Top Level)

```
┌─────────────────────────────────────────────────────────────┐
│ Project Zeta   [Dashboard] [Proposals] [Reports] [Settings] │
└─────────────────────────────────────────────────────────────┘
```

**Navigation Items:**

1. **Dashboard** `/`
   - Role: All (ADMIN, PLANNER, VIEWER)
   - Content: Overview, quick actions, recent proposals

2. **Proposals** `/proposals`
   - Role: All
   - Content: List view of all proposals
   - Actions: Create (ADMIN, PLANNER only)

3. **Reports** `/reports`
   - Role: All
   - Content: Export center, comparison tools

4. **Settings** `/settings`
   - Role: ADMIN only (hidden for others)
   - Content: Historical data, system config, CapEx module

**User Menu (Top Right):**
```
[Faker (Admin) ▼]
  ├─ Profile
  ├─ Settings
  ├─ Help
  └─ Logout
```

---

### 4.2 Proposal-Level Navigation (Secondary)

**When viewing specific proposal:**

```
Proposal: Developer ABC - Downtown Campus
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Overview] [Transition] [Dynamic] [Financials] [Scenarios] [Sensitivity]
```

**Tab Descriptions:**

| Tab | Content | Role Access |
|-----|---------|-------------|
| Overview | Key metrics, assumptions summary, charts | All |
| Transition | Edit 2025-2027 inputs | ADMIN, PLANNER |
| Dynamic | Edit 2028-2053 inputs | ADMIN, PLANNER |
| **Financials** | **P&L / BS / CF (within proposal)** | All |
| Scenarios | Interactive sliders | ADMIN, PLANNER |
| Sensitivity | Tornado diagrams, formal analysis | All |

---

### 4.3 Information Architecture Diagram

```
Project Zeta
│
├─ Dashboard (/)
│  ├─ Admin Cards (if ADMIN)
│  ├─ Recent Proposals
│  └─ Quick Actions
│
├─ Proposals (/proposals)
│  ├─ List View
│  ├─ New Proposal Wizard (/proposals/new) [ADMIN, PLANNER]
│  └─ Proposal Detail (/proposals/[id])
│     ├─ Overview Tab
│     ├─ Transition Setup Tab [ADMIN, PLANNER]
│     ├─ Dynamic Setup Tab [ADMIN, PLANNER]
│     ├─ Financial Statements Tab ← CRITICAL
│     │  ├─ P&L
│     │  ├─ Balance Sheet
│     │  └─ Cash Flow
│     ├─ Scenarios Tab [ADMIN, PLANNER]
│     └─ Sensitivity Analysis Tab
│
├─ Reports (/reports)
│  ├─ Comparison Tool (/reports/compare)
│  └─ Export Center
│
└─ Settings (/settings) [ADMIN ONLY]
   ├─ Historical Data (/settings/historical)
   ├─ System Configuration (/settings/config)
   └─ CapEx Module (/settings/capex)
```

---

## 5. INTERACTION PATTERNS

### 5.1 Form Validation

**Real-time Validation:**
- Validate on blur (when user leaves field)
- Show error message below input
- Highlight field border in red
- Disable submit button until valid

**Example:**
```tsx
<Input
  label="Base Rent 2028"
  value={baseRent}
  error={errors.baseRent}  // "Base rent must be greater than 0"
  onChange={handleChange}
/>
// Border: Red if error
// Helper text: Red error message
// Icon: ⚠️ in input (right side)
```

---

### 5.2 Loading States

**Calculation in Progress:**
```
┌───────────────────────────────────┐
│  Calculating 30-Year Projection   │
│  ─────────────────────────────────│
│  [Spinner Animation]              │
│  Please wait... (target <1s)      │
└───────────────────────────────────┘
```

**Button Loading State:**
```tsx
<Button variant="primary" loading={isCalculating}>
  {isCalculating ? (
    <> <Spinner /> Calculating...</>
  ) : (
    "Calculate 30 Years"
  )}
</Button>
```

---

### 5.3 Success / Error Notifications

**Toast Notifications (Top Right):**

```
┌────────────────────────────────────┐
│ ✅ Proposal saved successfully     │
└────────────────────────────────────┘
```

```
┌────────────────────────────────────┐
│ ❌ Error: Calculation failed       │
│    Balance sheet didn't balance.   │
│    [Retry] [View Details]          │
└────────────────────────────────────┘
```

**Specifications:**
- Position: Fixed top-right
- Width: 400px max
- Auto-dismiss: 5 seconds (success), 10 seconds (error)
- Animation: Slide in from right + fade
- Multiple toasts stack vertically

---

### 5.4 Calculation Transparency (Tooltips)

**Hover any financial value:**

```
      ┌─────────────────────────────────┐
      │ Rent Calculation                │
      │ ─────────────────────────────── │
      │ Formula:                        │
      │ Base Rent × (1 + Growth Rate)^n │
      │                                 │
      │ Calculation:                    │
      │ 11.00 M × (1 + 0.05)^1          │
      │ = 11.00 M × 1.05                │
      │ = 11.55 M                       │
      └─────────────────────────────────┘
       ↑
   [12.05 M]
```

**Implementation:**
```tsx
<Tooltip content={getFormulaTooltip('rent', year, value)}>
  <td className="financial-value">{formatMillions(value)}</td>
</Tooltip>
```

---

### 5.5 Confirmation Dialogs

**Delete Proposal:**
```
┌────────────────────────────────────────────┐
│ Delete Proposal                        [×] │
│ ──────────────────────────────────────────│
│                                            │
│ Are you sure you want to delete            │
│ "Developer ABC - Downtown Campus"?         │
│                                            │
│ This action cannot be undone.              │
│                                            │
│ ┌────────────────────────────────────────┐│
│ │ Type "DELETE" to confirm: [________]   ││
│ └────────────────────────────────────────┘│
│                                            │
│       [Cancel]  [Delete Proposal]          │
│                                            │
└────────────────────────────────────────────┘
```

---

## 6. RESPONSIVE DESIGN

### 6.1 Breakpoints

```css
--breakpoint-sm: 640px;    /* Mobile landscape, small tablets */
--breakpoint-md: 768px;    /* Tablets */
--breakpoint-lg: 1024px;   /* Laptop */
--breakpoint-xl: 1280px;   /* Desktop */
--breakpoint-2xl: 1536px;  /* Large desktop */
```

### 6.2 Device-Specific Layouts

**Desktop (≥1024px):** Primary experience
- Full sidebar navigation
- Multi-column layouts
- Large financial tables (all years visible)
- Side-by-side comparisons

**Tablet (768px - 1023px):** Simplified
- Collapsible sidebar
- Single-column layouts in some areas
- Horizontal scroll for financial tables
- Stacked comparisons

**Mobile (≤767px):** Essential features only
- Bottom navigation
- All single-column
- Vertical scroll for tables
- Limited scenario controls

### 6.3 Financial Table Responsiveness

**Desktop:**
- Show all years horizontally
- Freeze first column (line items)
- Horizontal scroll if needed

**Tablet:**
- Show year ranges (e.g., 2023-2027)
- Dropdown to select range
- Horizontal scroll within range

**Mobile:**
- Show 2-3 years at a time
- Swipe left/right to navigate years
- Vertical layout option (year as row)

---

## 7. IMPLEMENTATION CHECKLIST

### 7.1 Design System Setup

- [ ] Configure Tailwind with custom color palette
- [ ] Install and configure Inter font
- [ ] Set up CSS custom properties (variables)
- [ ] Create utility classes for spacing, shadows
- [ ] Test color contrast (WCAG AA compliance)

### 7.2 Component Library

**shadcn/ui Base Components:**
- [x] Button ✅ (Phase 1)
- [x] Input ✅ (Phase 1)
- [x] Card ✅ (Phase 1)
- [x] Table ✅ (Phase 1)
- [x] Dialog ✅ (Phase 1)
- [x] Tabs ✅ (Phase 1)
- [x] Label ✅ (Phase 1)
- [x] Select ✅ (Phase 1)
- [x] Slider ✅ (Phase 1)
- [x] Tooltip ✅ (Phase 1)
- [x] Alert ✅ (Phase 1)
- [ ] Badge (Phase 3)
- [ ] Progress (Phase 3)
- [ ] Toast/Sonner (Phase 3)

**Custom Components:**
- [ ] FinancialTable (with millions formatting)
- [ ] MillionsInput (input with M suffix)
- [ ] YearRangeSelector
- [ ] ProposalCard
- [ ] MetricCard
- [ ] ScenarioSlider
- [ ] TornadoDiagram (Recharts wrapper)
- [ ] ComparisonMatrix

### 7.3 Screen Implementation Order

**Week 1 (Setup):**
- [ ] Design system configuration
- [ ] Component library completion
- [ ] Storybook setup for component testing

**Week 2-3 (Admin & Setup):**
- [ ] Admin Dashboard
- [ ] Historical Data Input
- [ ] System Configuration
- [ ] CapEx Module

**Week 4-5 (Proposal Management):**
- [ ] Proposal List View
- [ ] New Proposal Wizard (7 steps)
- [ ] Proposal Detail - Overview Tab
- [ ] Proposal Detail - Edit Tabs

**Week 6-7 (Financial Features):**
- [ ] Financial Statements Tab (CRITICAL)
- [ ] P&L / BS / CF tables
- [ ] Year Range Selector
- [ ] Calculation tooltips

**Week 8-9 (Analysis Features):**
- [ ] Scenarios Tab with sliders
- [ ] Sensitivity Analysis Tab
- [ ] Tornado diagrams
- [ ] Comparison Screen

**Week 10 (Polish):**
- [ ] Responsive design refinements
- [ ] Loading states
- [ ] Error handling
- [ ] Accessibility improvements

### 7.4 Testing Checklist

**Visual Testing:**
- [ ] All components match design specs
- [ ] Colors match palette exactly
- [ ] Spacing uses design system units
- [ ] Typography matches specifications
- [ ] Icons are consistent

**Interaction Testing:**
- [ ] All buttons work (hover, active, disabled)
- [ ] Forms validate correctly
- [ ] Sliders update in real-time
- [ ] Tooltips appear on hover
- [ ] Dialogs open/close properly

**Financial Display Testing:**
- [ ] All amounts display in Millions (M)
- [ ] 2 decimal places always shown
- [ ] Negative values in parentheses
- [ ] Color coding works (positive/negative)
- [ ] Formulas display correctly in tooltips

**Responsive Testing:**
- [ ] Desktop (1920x1080, 1366x768)
- [ ] Tablet (iPad, 1024x768)
- [ ] Mobile (iPhone, 375x667)
- [ ] Financial tables scroll correctly
- [ ] Navigation adapts to screen size

---

## COMPLETION SIGN-OFF

**Design System:** ✅ Complete and documented
**Component Library:** ✅ Specifications complete (implementation in progress)
**Screen Mockups:** ✅ All 8 critical screens documented
**Navigation:** ✅ IA and navigation patterns defined
**Interactions:** ✅ All patterns specified
**Responsive:** ✅ Breakpoints and adaptations defined

**Status:** ✅ READY FOR PHASE 3 IMPLEMENTATION

**Next Steps:**
1. Review and approve this specification
2. Set up design system in Tailwind config
3. Complete remaining shadcn/ui components
4. Begin screen-by-screen implementation

**Prepared By:** Claude (AI UX/UI Designer)
**Date:** November 24, 2025
**Alignment:** 100% with PRD v2.0, v2.1, TSD, Financial Rules

---

**— END OF UI/UX SPECIFICATIONS —**
