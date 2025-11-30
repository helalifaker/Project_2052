---
name: finance-frontend-designer
description: Create elegant, refined, production-grade finance applications with sophisticated design that feels crafted, not generated. Use this skill when building financial planning tools, KPI dashboards, budget vs actuals interfaces, DCF models, cash flow forecasting, or any finance-related frontend. Emphasizes elegance, refinement, and attention to micro-details that elevate interfaces from functional to memorable. Triggers on "build a budget dashboard", "create a KPI tracker", "design a financial planning interface", or any finance application work.
---

# Finance Frontend Designer

This skill creates **elegant, refined** finance applications. Every detail matters — from the easing curve of an animation to the precise weight of a border. The goal is interfaces that feel *crafted by hand*, not assembled from components.

## Core Principles

### Elegance
> *"Elegance is not about being noticed, it's about being remembered."* — Giorgio Armani

Elegant interfaces have:
- **Restraint** — Know what to leave out
- **Proportion** — Golden ratios, musical scales in spacing
- **Quietness** — The interface serves the data, not itself

### Refinement
Refinement is in the details others miss:
- The 0.5px border that feels lighter than 1px
- The 300ms ease-out that feels natural, not robotic
- The 4% opacity hover state instead of 10%
- The tracking adjustment that makes uppercase labels breathe

## Finance Design Philosophy

Finance UIs are notoriously boring: gray tables, blue charts, cramped data. **Reject this.** Financial data deserves the same design ambition as any other domain — but with *sophistication*, not flash.

### The Challenge

Finance applications must balance competing needs:

- Data density vs. visual clarity
- Professional credibility vs. memorable aesthetics
- Complex hierarchies vs. intuitive navigation
- Multi-currency/multi-entity complexity vs. clean presentation

## Design Directions for Finance

Choose a bold direction that fits the context:

| Direction | When to Use | Key Elements |
|-----------|-------------|--------------|
| **Executive Luxury** | C-suite dashboards, board presentations | Generous whitespace, large typography, subtle animations, dark themes with gold/copper accents |
| **Data-Dense Editorial** | Analyst workstations, detailed reporting | Magazine-inspired layouts, sophisticated typography, information hierarchy through scale |
| **Brutalist Clarity** | Operational dashboards, real-time monitoring | Raw typography, high contrast, no decoration, data speaks for itself |
| **Warm Corporate** | Client-facing portals, stakeholder reports | Approachable colors, rounded elements, friendly but professional |
| **Technical Precision** | Trading interfaces, financial modeling | Monospace fonts, grid-heavy, information-dense, minimal but purposeful color |

**NEVER:** Default to generic blue dashboards, Bootstrap-style cards, or cookie-cutter admin templates.

## Elegance & Refinement Patterns

### Micro-Interactions That Feel Crafted

```tsx
// Refined hover states - subtle, not aggressive
const refinedHover = {
  // Border color shift - barely perceptible but felt
  borderColor: 'transition-colors duration-300',
  hoverBorder: 'hover:border-[var(--accent)]/40', // 40% opacity, not 100%

  // Background on hover - whisper, not shout
  hoverBg: 'hover:bg-[var(--accent)]/[0.03]', // 3% opacity

  // Scale on interaction - subtle lift
  hoverScale: 'hover:scale-[1.01] active:scale-[0.99]',

  // Icon opacity dance
  iconHover: 'opacity-20 group-hover:opacity-40 transition-opacity duration-500',
};

// The signature accent line - slides in on hover
const AccentLine = () => (
  <div className="absolute bottom-0 left-6 right-6 h-px
                  bg-[var(--accent)] origin-left
                  scale-x-0 group-hover:scale-x-100
                  transition-transform duration-500 ease-out" />
);
```

### Animation Curves That Feel Natural

```tsx
// Timing functions - never use 'linear' or default 'ease'
const easings = {
  // For elements entering - starts fast, settles gently
  out: 'cubic-bezier(0.16, 1, 0.3, 1)',      // ease-out-expo

  // For elements leaving - quick exit
  in: 'cubic-bezier(0.55, 0, 1, 0.45)',       // ease-in-expo

  // For continuous motion - smooth throughout
  inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',    // ease-in-out-cubic

  // For bouncy, playful interactions
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // overshoot
};

// Tailwind custom easings (add to tailwind.config.js)
transitionTimingFunction: {
  'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
  'in-expo': 'cubic-bezier(0.55, 0, 1, 0.45)',
  'smooth': 'cubic-bezier(0.65, 0, 0.35, 1)',
}

// Duration guidelines
const durations = {
  instant: '150ms',    // Micro-feedback (button press)
  quick: '200ms',      // Hover states, small reveals
  normal: '300ms',     // Standard transitions
  smooth: '500ms',     // Larger reveals, page transitions
  slow: '800ms',       // Dramatic entrances, charts loading
};
```

### Spacing That Breathes (Musical Scale)

```tsx
// Spacing based on musical intervals - creates natural rhythm
// Base unit: 4px (minor second)
const space = {
  0: '0',
  px: '1px',
  0.5: '2px',      // Hairline
  1: '4px',        // Minor second
  1.5: '6px',      // Major second
  2: '8px',        // Minor third
  3: '12px',       // Major third
  4: '16px',       // Perfect fourth
  5: '20px',       // Tritone
  6: '24px',       // Perfect fifth
  8: '32px',       // Minor sixth
  10: '40px',      // Major sixth
  12: '48px',      // Minor seventh
  16: '64px',      // Octave
  20: '80px',      // Major ninth
  24: '96px',      // Major tenth
};

// Golden ratio for visual harmony: 1.618
const goldenSpacing = (base: number) => Math.round(base * 1.618);
```

### Border Refinements

```tsx
// Borders should be felt, not seen
const borders = {
  // Standard - visible but quiet
  default: 'border border-[var(--border)]',

  // Subtle - barely there
  subtle: 'border border-[var(--border)]/50',

  // Hairline - for separators
  hairline: 'border-b border-[var(--border)]/30',

  // On dark backgrounds - use white with low opacity
  onDark: 'border border-white/[0.06]',

  // Focus rings - visible but not harsh
  focusRing: 'focus:ring-2 focus:ring-[var(--accent)]/20 focus:ring-offset-0',
};
```

### Shadow Layers (Depth Without Weight)

```tsx
// Shadows should create depth, not darkness
const shadows = {
  // Subtle lift - for cards
  sm: '0 1px 2px rgba(0,0,0,0.02), 0 1px 3px rgba(0,0,0,0.03)',

  // Medium elevation - for dropdowns
  md: '0 4px 6px rgba(0,0,0,0.02), 0 2px 4px rgba(0,0,0,0.03)',

  // High elevation - for modals, tooltips
  lg: '0 10px 25px rgba(0,0,0,0.04), 0 4px 10px rgba(0,0,0,0.02)',

  // Premium glow - for featured elements
  glow: '0 0 40px rgba(var(--accent-rgb), 0.15)',

  // Inner shadow - for inset elements
  inner: 'inset 0 1px 2px rgba(0,0,0,0.04)',
};
```

### Typography Refinements

```tsx
// Letter-spacing adjustments by size
const tracking = {
  // Tighter for large text
  display: '-0.02em',     // text-4xl and up
  headline: '-0.01em',    // text-2xl to text-3xl

  // Normal for body
  body: '0',              // text-base

  // Wider for small/uppercase
  label: '0.02em',        // text-sm labels
  uppercase: '0.15em',    // All caps text
  micro: '0.2em',         // text-[10px] and smaller
};

// Line height by context
const leading = {
  display: '1.1',         // Large headlines
  headline: '1.25',       // Section titles
  body: '1.6',            // Readable paragraphs
  tight: '1.4',           // Cards, compact areas
  data: '1.2',            // Numbers, tables
};

// Font weight nuance
const fontWeight = {
  light: 300,             // Large display numbers
  normal: 400,            // Body text
  medium: 500,            // Emphasis, labels
  semibold: 600,          // Headings
  // Avoid 700+ for finance - feels aggressive
};
```

### Color Opacity Scale (for Elegance)

```tsx
// Instead of hard colors, use opacity for subtlety
const opacityScale = {
  // Text hierarchy
  textPrimary: '100%',
  textSecondary: '60%',
  textTertiary: '40%',
  textDisabled: '25%',

  // Interactive states
  hoverBg: '4%',          // Barely visible
  activeBg: '8%',         // Slightly more
  selectedBg: '12%',      // Clear selection

  // Borders
  borderDefault: '12%',
  borderSubtle: '6%',
  borderFocus: '30%',

  // Icons
  iconDefault: '40%',
  iconHover: '60%',
  iconActive: '80%',
};
```

## Tech Stack

- **Framework**: React/Next.js with TypeScript
- **Styling**: Tailwind CSS with CSS variables for theming
- **Charts**: Recharts (customize heavily—default Recharts looks generic)
- **Motion**: Framer Motion for React, CSS animations for HTML
- **Fonts**: Choose distinctive fonts—finance doesn't mean boring

## Typography for Finance

Finance applications often default to system fonts. Don't.

```
Display/Headers:
  - Söhne, Styrene, Suisse Int'l, GT America, Untitled Sans
  - OR go bold: Druk, Monument Extended, Migra

Body/Data:
  - Favorit, Akkurat, Atlas Grotesk, Graphik

Monospace (for numbers):
  - JetBrains Mono, Berkeley Mono, TX-02, Dank Mono
  - Critical: Use tabular figures (font-variant-numeric: tabular-nums)
```

Font loading pattern:

```tsx
// Use Google Fonts or self-host for distinctive choices
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
```

## Color Philosophy

Reject the blue-gray finance cliché. Build palettes with intention:

```tsx
// Executive Dark (Luxury)
const executiveDark = {
  '--bg-primary': '#0a0a0a',
  '--bg-elevated': '#141414',
  '--bg-card': '#1a1a1a',
  '--text-primary': '#fafafa',
  '--text-secondary': '#737373',
  '--accent': '#d4a574',        // Warm copper
  '--accent-subtle': '#d4a574/10',
  '--positive': '#4ade80',
  '--negative': '#f87171',
  '--border': '#262626',
};

// Editorial Light (Magazine-inspired)
const editorialLight = {
  '--bg-primary': '#f5f5f0',    // Warm paper
  '--bg-elevated': '#ffffff',
  '--bg-card': '#ffffff',
  '--text-primary': '#1a1a1a',
  '--text-secondary': '#666666',
  '--accent': '#c41e3a',        // Editorial red
  '--accent-subtle': '#c41e3a/08',
  '--positive': '#16a34a',
  '--negative': '#dc2626',
  '--border': '#e5e5e0',
};

// Brutalist (High contrast)
const brutalist = {
  '--bg-primary': '#ffffff',
  '--bg-elevated': '#ffffff',
  '--bg-card': '#f0f0f0',
  '--text-primary': '#000000',
  '--text-secondary': '#000000',
  '--accent': '#0000ff',        // Pure blue
  '--positive': '#00ff00',
  '--negative': '#ff0000',
  '--border': '#000000',
};
```

## Finance-Specific Patterns

### Number & Currency Formatting

```tsx
const formatCurrency = (
  value: number,
  options?: { compact?: boolean; showSign?: boolean }
): string => {
  const { compact = false, showSign = false } = options || {};

  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 1 : 0,
    signDisplay: showSign ? 'exceptZero' : 'auto',
  }).format(value);

  return formatted;
};

// Variance with visual indicator
const formatVariance = (actual: number, budget: number) => {
  const diff = actual - budget;
  const pct = budget !== 0 ? (diff / budget) * 100 : 0;
  return {
    value: diff,
    percentage: pct,
    status: Math.abs(pct) < 1 ? 'neutral' : diff > 0 ? 'positive' : 'negative',
  };
};
```

### KPI Cards (Opinionated, Not Generic)

Don't build Bootstrap cards. Build components with presence:

```tsx
// Executive style: Large, confident, minimal
const KPICard = ({ title, value, change, format = 'currency' }) => (
  <div className="group relative p-8 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)]
                  hover:border-[var(--accent)] transition-all duration-500">
    <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-4">
      {title}
    </p>
    <p className="text-5xl font-light tracking-tight text-[var(--text-primary)] tabular-nums">
      {format === 'currency' ? formatCurrency(value, { compact: true }) :
       format === 'percentage' ? `${value.toFixed(1)}%` : value.toLocaleString()}
    </p>
    {change !== undefined && (
      <div className={`mt-4 flex items-center gap-2 text-sm ${
        change >= 0 ? 'text-[var(--positive)]' : 'text-[var(--negative)]'
      }`}>
        <span className="text-lg">{change >= 0 ? '↑' : '↓'}</span>
        <span className="tabular-nums">{Math.abs(change).toFixed(1)}%</span>
      </div>
    )}
    {/* Subtle accent line on hover */}
    <div className="absolute bottom-0 left-8 right-8 h-px bg-[var(--accent)]
                    scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
  </div>
);
```

### Data Tables (Editorial, Not Spreadsheet)

```tsx
// Magazine-style table with proper typography hierarchy
const FinanceTable = ({ data, columns }) => (
  <div className="overflow-hidden rounded-xl border border-[var(--border)]">
    <table className="w-full">
      <thead>
        <tr className="border-b border-[var(--border)] bg-[var(--bg-elevated)]">
          {columns.map(col => (
            <th key={col.key}
                className="px-6 py-4 text-left text-[10px] uppercase tracking-[0.15em]
                           font-medium text-[var(--text-secondary)]">
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-[var(--border)]">
        {data.map((row, i) => (
          <tr key={i} className="hover:bg-[var(--accent-subtle)] transition-colors">
            {columns.map(col => (
              <td key={col.key}
                  className={`px-6 py-4 ${col.numeric ? 'text-right tabular-nums font-mono' : ''}`}>
                {col.render ? col.render(row[col.key], row) : row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
```

### Chart Customization (Critical)

Default Recharts looks like every other dashboard. Customize aggressively:

```tsx
// Custom chart theme
const chartTheme = {
  axis: {
    tick: { fill: 'var(--text-secondary)', fontSize: 11 },
    line: { stroke: 'var(--border)' },
  },
  grid: {
    stroke: 'var(--border)',
    strokeDasharray: '2 4',
    opacity: 0.5,
  },
  tooltip: {
    contentStyle: {
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
      padding: '16px',
    },
  },
};

// Gradient fills instead of flat colors
<defs>
  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.4}/>
    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0}/>
  </linearGradient>
</defs>
```

See `references/chart-patterns.md` for complete chart configurations.

## Reference Files

- `references/elegance-patterns.md` — **NEW** Micro-interactions, refined components, animation curves
- `references/chart-patterns.md` — Recharts configurations with proper styling
- `references/selector-patterns.md` — Entity, period, currency, and scope selectors
- `references/planning-patterns.md` — Multi-year grids, scenarios, DCF interfaces
- `references/data-patterns.md` — TypeScript interfaces, multi-currency utilities

## Implementation Checklist

Before considering a finance UI complete:

### Elegance & Refinement

- [ ] Every transition has an intentional duration and easing curve
- [ ] Hover states are subtle (3-4% opacity backgrounds, not 10%+)
- [ ] Borders are quiet (use opacity, not solid colors)
- [ ] Typography tracking is adjusted for size (tighter for large, wider for small)
- [ ] Font weights are restrained (300-600, rarely 700)
- [ ] Shadows create depth without weight
- [ ] The accent line animation slides in smoothly on hover
- [ ] Icons fade in/out with opacity, never pop

### Design

- [ ] Chose a distinctive aesthetic direction (not generic blue dashboard)
- [ ] Typography is intentional (display + body + mono for numbers)
- [ ] Color palette has character (warm copper, not cold blue)
- [ ] Spacing follows a musical/golden ratio scale
- [ ] Above-the-fold layout shows key metrics without scrolling

### Finance-Specific

- [ ] Number formatting is consistent (locale, compact notation, signs)
- [ ] Variances show both absolute and percentage
- [ ] Color coding follows accounting convention (green=favorable context-aware)
- [ ] Numbers use tabular figures (`font-variant-numeric: tabular-nums`)

### Polish

- [ ] Hover states feel crafted, not default
- [ ] Loading states have skeleton animations (not spinners)
- [ ] Empty states are designed with elegance (not just "No data")
- [ ] Chart tooltips have premium styling (rounded corners, subtle shadows)
- [ ] The interface is memorable — someone would screenshot it
- [ ] It feels like a $10M product, not an admin template

## Anti-Patterns to Avoid

### Visual Crimes
❌ Blue/gray color schemes by default
❌ Cards with heavy drop shadows
❌ Roboto, Inter, or system fonts (they scream "default")
❌ Generic icons from random packs
❌ Charts with default Recharts/Chart.js styling
❌ "Dashboard" templates from UI kits

### Refinement Failures
❌ `transition: all 0.3s ease` — use specific properties + custom easings
❌ `opacity: 0.1` hover states — too aggressive, use 0.03-0.05
❌ `border: 1px solid #e5e5e5` — too harsh, use CSS variables with opacity
❌ `font-weight: 700` on financial data — too heavy, use 300-500
❌ `linear` or default `ease` timing functions — feels robotic
❌ Hard color transitions — everything should fade, never snap

### Layout Mistakes
❌ KPIs below the fold requiring scroll
❌ Cramped tables with no breathing room
❌ Inconsistent spacing throughout
❌ Charts taller than they need to be

---

## The Elegance Test

Ask yourself:
1. Would a luxury brand use this design language?
2. Does every animation feel intentional?
3. Are the borders and shadows barely visible but still effective?
4. Would someone mistake this for a $50K custom build?

If yes to all — ship it.

**Finance applications can be beautiful. Make them unforgettable.**
