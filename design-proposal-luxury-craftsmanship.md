# LUXURY CRAFTSMANSHIP DESIGN SYSTEM
## Project Zeta — "The Atelier Edition"

**Design Philosophy:** *"Financial precision meets artisanal craft"*

---

## EXECUTIVE VISION

Your application should feel like walking into a Swiss watchmaker's atelier — where every detail is intentional, every surface thoughtfully considered, and the precision of the underlying machinery is reflected in the elegance of its presentation.

This is not a dashboard. This is a **financial instrument of the highest order**.

---

## I. THE FOUNDING PRINCIPLES

### 1. Luxury Is Restraint
True luxury doesn't shout — it whispers. We remove the unnecessary, elevate the essential, and let the data breathe.

### 2. Details Are Everything
The difference between good and exceptional is in the 2px adjustments, the 0.5 second animation curves, the precise color temperature shifts.

### 3. Every Screen Tells a Story
Each page has a narrative arc: introduction (hero metrics), development (supporting data), and resolution (actionable insights).

### 4. Craft Over Convention
No generic UI patterns. Every component is purpose-built for financial excellence.

---

## II. COLOR PHILOSOPHY: "Burnished Gold & Midnight Stone"

### LIGHT MODE — "The Ivory Ledger"

A warm, paper-like canvas reminiscent of fine Italian stationery, touched with gold leaf accents.

```css
:root {
  /* Foundation — Warm Paper Tones */
  --ivory-canvas: #FDFCF9;           /* Main background — warm ivory */
  --ivory-paper: #FFFFFF;            /* Card surfaces — pure white */
  --ivory-linen: #F9F8F4;            /* Subtle alternating rows */
  --ivory-parchment: #F5F3ED;        /* Hover states, secondary surfaces */
  
  /* The Craft Accent System */
  --craft-gold: #9B7B4D;             /* Primary accent — aged gold */
  --craft-gold-bright: #C4A265;      /* Hover/active gold */
  --craft-gold-soft: rgba(155, 123, 77, 0.08);  /* Subtle gold wash */
  --craft-gold-glow: rgba(155, 123, 77, 0.15);  /* Focus rings */
  
  /* Stone Typography */
  --stone-900: #1C1917;              /* Headlines — warm charcoal */
  --stone-700: #44403C;              /* Body text — readable dark */
  --stone-500: #78716C;              /* Secondary text — balanced gray */
  --stone-400: #A8A29E;              /* Muted labels */
  --stone-300: #D6D3D1;              /* Borders — subtle definition */
  --stone-200: #E7E5E4;              /* Dividers — whisper-thin */
  
  /* Semantic — The Financial Ink */
  --ink-positive: #2D6A4F;           /* Forest green — substantial gains */
  --ink-positive-soft: rgba(45, 106, 79, 0.08);
  --ink-negative: #9B2C2C;           /* Burgundy — dignified losses */
  --ink-negative-soft: rgba(155, 44, 44, 0.08);
  --ink-warning: #92610E;            /* Deep amber — attention */
  --ink-info: #1E4C6B;               /* Steel blue — informational */
  
  /* Borders & Shadows */
  --border-hairline: rgba(28, 25, 23, 0.06);
  --border-subtle: rgba(28, 25, 23, 0.10);
  --border-defined: rgba(28, 25, 23, 0.15);
  
  /* Shadows — Warm & Refined */
  --shadow-whisper: 0 1px 2px rgba(28, 25, 23, 0.04);
  --shadow-subtle: 0 2px 8px rgba(28, 25, 23, 0.06), 0 1px 2px rgba(28, 25, 23, 0.04);
  --shadow-lifted: 0 4px 16px rgba(28, 25, 23, 0.08), 0 2px 4px rgba(28, 25, 23, 0.04);
  --shadow-floating: 0 12px 32px rgba(28, 25, 23, 0.10), 0 4px 12px rgba(28, 25, 23, 0.06);
  --shadow-gold-glow: 0 0 0 3px rgba(155, 123, 77, 0.12);
}
```

### DARK MODE — "The Obsidian Chamber"

A sophisticated, warm-tinted darkness reminiscent of a private banker's study at night.

```css
.dark {
  /* Foundation — Rich Darkness */
  --obsidian-deep: #0D0C0A;          /* True background — almost black */
  --obsidian-surface: #1A1816;       /* Card surfaces — warm charcoal */
  --obsidian-elevated: #252320;      /* Elevated surfaces */
  --obsidian-hover: #2D2A27;         /* Hover states */
  
  /* The Craft Accent System (Luminous) */
  --craft-gold: #D4A867;             /* Primary accent — luminous gold */
  --craft-gold-bright: #E4C088;      /* Hover/active gold */
  --craft-gold-soft: rgba(212, 168, 103, 0.10);
  --craft-gold-glow: rgba(212, 168, 103, 0.20);
  
  /* Silk Typography */
  --silk-100: #FAF9F7;               /* Headlines — warm white */
  --silk-200: #E7E5E4;               /* Body text — high readability */
  --silk-300: #A8A29E;               /* Secondary text */
  --silk-400: #78716C;               /* Muted labels */
  --silk-500: #57534E;               /* Very muted */
  
  /* Semantic — Luminous Indicators */
  --ink-positive: #4ADE80;           /* Emerald glow — gains */
  --ink-positive-soft: rgba(74, 222, 128, 0.12);
  --ink-negative: #F87171;           /* Coral glow — losses */
  --ink-negative-soft: rgba(248, 113, 113, 0.12);
  --ink-warning: #FBBF24;            /* Amber glow */
  --ink-info: #60A5FA;               /* Sky blue */
  
  /* Borders & Shadows */
  --border-hairline: rgba(250, 249, 247, 0.04);
  --border-subtle: rgba(250, 249, 247, 0.08);
  --border-defined: rgba(250, 249, 247, 0.12);
  
  /* Shadows — Deep & Luminous */
  --shadow-whisper: 0 1px 2px rgba(0, 0, 0, 0.20);
  --shadow-subtle: 0 2px 8px rgba(0, 0, 0, 0.30), 0 1px 2px rgba(0, 0, 0, 0.20);
  --shadow-lifted: 0 4px 16px rgba(0, 0, 0, 0.40), 0 0 0 1px rgba(250, 249, 247, 0.05);
  --shadow-floating: 0 12px 32px rgba(0, 0, 0, 0.50), 0 0 0 1px rgba(250, 249, 247, 0.05);
  --shadow-gold-glow: 0 0 24px rgba(212, 168, 103, 0.15);
}
```

---

## III. TYPOGRAPHY: "The Ledger Script"

### Font Selections

| Role | Font | Weight | Character |
|------|------|--------|-----------|
| Display/Hero | **Cormorant Garamond** | 300-500 | Timeless elegance, editorial authority |
| UI/Labels | **Inter** | 400-600 | Precision, clarity, modern professionalism |
| Financial Numbers | **Tabac Mono** or **IBM Plex Mono** | 400-500 | Banking-grade number display |

### Typography Scale — "The Golden Ratio"

```css
:root {
  /* Display Typography — For Impact Moments */
  --type-display-hero: 4.5rem;     /* 72px — Page heroes, major announcements */
  --type-display-large: 3.5rem;    /* 56px — Section heroes */
  --type-display-medium: 2.5rem;   /* 40px — Card heroes */
  
  /* Heading Typography — For Structure */
  --type-heading-1: 2rem;          /* 32px — Page titles */
  --type-heading-2: 1.5rem;        /* 24px — Section titles */
  --type-heading-3: 1.25rem;       /* 20px — Card titles */
  --type-heading-4: 1.125rem;      /* 18px — Subsections */
  
  /* Body Typography — For Content */
  --type-body-large: 1.0625rem;    /* 17px — Featured body */
  --type-body-base: 0.9375rem;     /* 15px — Standard body */
  --type-body-small: 0.875rem;     /* 14px — Compact body */
  
  /* Label Typography — For UI */
  --type-label-large: 0.8125rem;   /* 13px — Section labels */
  --type-label-base: 0.75rem;      /* 12px — Field labels */
  --type-label-small: 0.6875rem;   /* 11px — Micro labels */
  
  /* Financial Numbers — Monospaced Excellence */
  --type-financial-hero: 5rem;     /* 80px — Dashboard hero numbers */
  --type-financial-large: 3rem;    /* 48px — KPI cards */
  --type-financial-medium: 2rem;   /* 32px — Supporting metrics */
  --type-financial-base: 1.25rem;  /* 20px — Table values */
  --type-financial-small: 1rem;    /* 16px — Inline values */
}

/* Letter Spacing — The Craft Details */
.label-uppercase {
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.display-tight {
  letter-spacing: -0.02em;
}

.financial-tabular {
  font-feature-settings: 'tnum' 1, 'lnum' 1;
  font-variant-numeric: tabular-nums lining-nums;
}
```

---

## IV. SPACING SYSTEM: "The White Space Philosophy"

Generous white space is the hallmark of luxury. We use an 8px base with golden ratio progressions.

```css
:root {
  /* Base Unit: 8px */
  --space-0: 0;
  --space-1: 0.25rem;    /* 4px — Hairline */
  --space-2: 0.5rem;     /* 8px — Tight */
  --space-3: 0.75rem;    /* 12px — Compact */
  --space-4: 1rem;       /* 16px — Base */
  --space-5: 1.5rem;     /* 24px — Comfortable */
  --space-6: 2rem;       /* 32px — Relaxed */
  --space-8: 3rem;       /* 48px — Generous */
  --space-10: 4rem;      /* 64px — Expansive */
  --space-12: 5rem;      /* 80px — Heroic */
  --space-16: 8rem;      /* 128px — Monumental */
  
  /* Component-Specific Spacing */
  --card-padding-compact: var(--space-4);     /* 16px */
  --card-padding-default: var(--space-6);     /* 32px */
  --card-padding-hero: var(--space-8);        /* 48px */
  --card-padding-monument: var(--space-10);   /* 64px */
  
  /* Section Spacing */
  --section-gap-tight: var(--space-4);        /* 16px */
  --section-gap-default: var(--space-6);      /* 32px */
  --section-gap-generous: var(--space-10);    /* 64px */
}
```

---

## V. THE COMPONENT LIBRARY: "Artisanal Elements"

### 1. THE MONUMENT CARD

The primary container for major metrics. A statement piece.

```css
.monument-card {
  /* Structure */
  position: relative;
  padding: var(--space-8);
  background: var(--ivory-paper);
  border-radius: 1.5rem;
  border: 1px solid var(--border-hairline);
  box-shadow: var(--shadow-subtle);
  overflow: hidden;
  
  /* The Gold Thread — Bottom accent line */
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 2rem;
    right: 2rem;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      var(--craft-gold) 20%,
      var(--craft-gold) 80%,
      transparent 100%
    );
    opacity: 0;
    transform: scaleX(0);
    transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  }
  
  &:hover::after {
    opacity: 1;
    transform: scaleX(1);
  }
  
  /* The Corner Flourish — Optional craft detail */
  &::before {
    content: '';
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    width: 3rem;
    height: 3rem;
    background: linear-gradient(
      135deg,
      transparent 50%,
      var(--craft-gold-soft) 50%
    );
    opacity: 0.5;
  }
}

/* Dark Mode */
.dark .monument-card {
  background: var(--obsidian-surface);
  border-color: var(--border-subtle);
  box-shadow: var(--shadow-lifted);
}
```

### 2. THE LEDGER CARD

For financial data displays with precise number alignment.

```css
.ledger-card {
  position: relative;
  padding: var(--space-6);
  background: var(--ivory-paper);
  border-radius: 1rem;
  border: 1px solid var(--border-subtle);
  
  /* The Ruled Lines Effect — Subtle paper texture */
  background-image: repeating-linear-gradient(
    180deg,
    transparent 0px,
    transparent 31px,
    var(--border-hairline) 31px,
    var(--border-hairline) 32px
  );
  background-position: 0 var(--space-6);
  background-size: 100% 32px;
  
  /* Red Margin Line — Classic ledger detail */
  &::before {
    content: '';
    position: absolute;
    top: var(--space-6);
    bottom: var(--space-6);
    left: 4rem;
    width: 1px;
    background: var(--ink-negative-soft);
  }
}
```

### 3. THE FLOATING METRIC

For hero KPIs that demand attention.

```css
.floating-metric {
  position: relative;
  padding: var(--space-8) var(--space-10);
  background: var(--ivory-paper);
  border-radius: 2rem;
  border: 1px solid var(--border-hairline);
  box-shadow: 
    var(--shadow-floating),
    0 0 60px rgba(155, 123, 77, 0.05);
  
  /* The Glow Halo */
  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: inherit;
    background: linear-gradient(
      135deg,
      var(--craft-gold-soft),
      transparent 50%,
      var(--craft-gold-soft)
    );
    opacity: 0;
    transition: opacity 0.5s ease;
    z-index: -1;
  }
  
  &:hover::before {
    opacity: 1;
  }
}
```

### 4. THE SEGMENT INDICATOR

For status indicators and category markers.

```css
.segment-indicator {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: 2rem;
  font-size: var(--type-label-base);
  font-weight: 500;
  letter-spacing: 0.02em;
  
  &--positive {
    background: var(--ink-positive-soft);
    color: var(--ink-positive);
  }
  
  &--negative {
    background: var(--ink-negative-soft);
    color: var(--ink-negative);
  }
  
  &--gold {
    background: var(--craft-gold-soft);
    color: var(--craft-gold);
  }
  
  /* The Pulse Dot */
  &__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    animation: pulse 2s ease-in-out infinite;
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.15); }
}
```

---

## VI. ICONOGRAPHY: "The Engraved Mark"

### Icon Style Guidelines

- **Line Weight:** 1.5px stroke — delicate but visible
- **Corner Radius:** 2px — soft but precise
- **Size System:** 16px, 20px, 24px, 32px, 48px
- **Animation:** Subtle draw-in effects, 0.3s duration

### The Signature Icon Set

Create custom icon variants for:
- **Financial operations:** Ledger, Calculator, Scale, Vault
- **Navigation:** Compass, Waypoint, Anchor
- **Status:** Seal, Badge, Ribbon
- **Charts:** Candlestick, Trajectory, Distribution

```css
.icon-craft {
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
  
  /* Draw-in Animation */
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  transition: stroke-dashoffset 0.5s ease-out;
  
  .card:hover & {
    stroke-dashoffset: 0;
  }
}
```

---

## VII. MOTION DESIGN: "The Choreography"

### Timing Functions — "The Movement Language"

```css
:root {
  /* Easing Curves */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);     /* Quick start, smooth finish */
  --ease-in-out-circ: cubic-bezier(0.85, 0, 0.15, 1); /* Smooth acceleration */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);   /* Slight overshoot */
  
  /* Duration Scale */
  --duration-instant: 100ms;    /* Micro-interactions */
  --duration-fast: 200ms;       /* Hover states */
  --duration-normal: 350ms;     /* Standard transitions */
  --duration-slow: 500ms;       /* Page transitions */
  --duration-dramatic: 800ms;   /* Hero animations */
}
```

### Animation Patterns

#### 1. The Reveal — For Page Entry
```css
@keyframes reveal {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.reveal-on-enter {
  animation: reveal var(--duration-slow) var(--ease-out-expo) forwards;
}

/* Stagger children */
.reveal-stagger > * {
  animation: reveal var(--duration-slow) var(--ease-out-expo) forwards;
  opacity: 0;
}

.reveal-stagger > *:nth-child(1) { animation-delay: 0ms; }
.reveal-stagger > *:nth-child(2) { animation-delay: 75ms; }
.reveal-stagger > *:nth-child(3) { animation-delay: 150ms; }
.reveal-stagger > *:nth-child(4) { animation-delay: 225ms; }
```

#### 2. The Number Cascade — For Value Changes
```css
@keyframes number-cascade {
  0% { 
    opacity: 0; 
    transform: translateY(-8px); 
    filter: blur(2px);
  }
  100% { 
    opacity: 1; 
    transform: translateY(0); 
    filter: blur(0);
  }
}

.number-animate {
  animation: number-cascade var(--duration-fast) var(--ease-out-expo);
}
```

#### 3. The Gold Shimmer — For Attention
```css
@keyframes gold-shimmer {
  0% { 
    background-position: -200% center;
  }
  100% { 
    background-position: 200% center;
  }
}

.shimmer-gold {
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--craft-gold-soft) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: gold-shimmer 3s ease-in-out infinite;
}
```

---

## VIII. DATA VISUALIZATION: "The Chart Gallery"

### Chart Color System

```css
:root {
  /* Proposal Colors — Distinct & Memorable */
  --chart-proposal-a: #7C3AED;    /* Royal Violet — Fixed Rent */
  --chart-proposal-b: #0891B2;    /* Ocean Teal — Revenue Share */
  --chart-proposal-c: #CA8A04;    /* Burnished Gold — Partnership */
  
  /* Semantic Chart Colors */
  --chart-positive: var(--ink-positive);
  --chart-negative: var(--ink-negative);
  --chart-baseline: var(--stone-400);
  --chart-projection: var(--craft-gold);
  
  /* Chart Grid & Axis */
  --chart-grid: rgba(28, 25, 23, 0.05);
  --chart-axis: var(--stone-300);
  --chart-tick: var(--stone-400);
}

.dark {
  --chart-proposal-a: #A78BFA;    /* Soft Violet */
  --chart-proposal-b: #22D3EE;    /* Bright Cyan */
  --chart-proposal-c: #FCD34D;    /* Bright Gold */
  
  --chart-grid: rgba(250, 249, 247, 0.03);
  --chart-axis: var(--silk-500);
  --chart-tick: var(--silk-400);
}
```

### Chart Styling Philosophy

1. **Minimal Grid:** Only horizontal lines, very faint (5% opacity)
2. **No Axis Lines:** Clean chart area, data speaks
3. **Subtle Tooltips:** Floating cards with gold accent
4. **Animated Entry:** Lines draw in, bars rise up
5. **Interactive Highlights:** Glowing dots on hover

---

## IX. SPECIAL TOUCHES: "The Craftsman Details"

### 1. The Paper Texture
```css
.paper-texture {
  background-image: url("data:image/svg+xml,..."); /* Subtle noise */
  background-blend-mode: overlay;
  opacity: 0.4;
}
```

### 2. The Gilded Border
```css
.gilded-border {
  border: 1px solid transparent;
  background: 
    linear-gradient(var(--ivory-paper), var(--ivory-paper)) padding-box,
    linear-gradient(
      135deg, 
      var(--craft-gold) 0%, 
      transparent 50%, 
      var(--craft-gold) 100%
    ) border-box;
}
```

### 3. The Embossed Text
```css
.embossed {
  text-shadow: 
    0 1px 0 rgba(255, 255, 255, 0.5),
    0 -1px 0 rgba(0, 0, 0, 0.1);
}

.dark .embossed {
  text-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.5),
    0 0 20px var(--craft-gold-soft);
}
```

### 4. The Hover Depth
```css
.hover-lift {
  transition: 
    transform var(--duration-normal) var(--ease-out-expo),
    box-shadow var(--duration-normal) var(--ease-out-expo);
  
  &:hover {
    transform: translateY(-4px) scale(1.01);
    box-shadow: var(--shadow-floating);
  }
}
```

### 5. The Focus Ring
```css
.focus-craft:focus-visible {
  outline: none;
  box-shadow: 
    0 0 0 2px var(--ivory-paper),
    0 0 0 4px var(--craft-gold);
}

.dark .focus-craft:focus-visible {
  box-shadow: 
    0 0 0 2px var(--obsidian-surface),
    0 0 0 4px var(--craft-gold),
    0 0 20px var(--craft-gold-soft);
}
```

---

## X. PAGE COMPOSITIONS: "The Story Templates"

### Template 1: The Grand Opening
For major dashboards and landing pages.

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│   ┌──────────────────────────────────────────────────────┐    │
│   │                                                      │    │
│   │               THE HERO MONUMENT                      │    │
│   │         "SAR 2.4B Total Contract Value"              │    │
│   │                                                      │    │
│   └──────────────────────────────────────────────────────┘    │
│                                                                │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│   │ KPI Stone 1 │  │ KPI Stone 2 │  │ KPI Stone 3 │           │
│   │   NPV: 45M  │  │  IRR: 12.5% │  │ Payback: 8Y │           │
│   └─────────────┘  └─────────────┘  └─────────────┘           │
│                                                                │
│   ┌──────────────────────────────┐  ┌───────────────────┐     │
│   │                              │  │                   │     │
│   │     THE TRAJECTORY CHART     │  │   THE BREAKDOWN   │     │
│   │   30-Year Financial Journey  │  │   Cost Analysis   │     │
│   │                              │  │                   │     │
│   └──────────────────────────────┘  └───────────────────┘     │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Template 2: The Comparison Chamber
For side-by-side proposal analysis.

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│   THE COMPARISON CHAMBER — Choose Your Path                    │
│                                                                │
│   ┌──────────────────┐ ┌──────────────────┐ ┌────────────────┐│
│   │                  │ │                  │ │                ││
│   │   PROPOSAL A     │ │   PROPOSAL B     │ │   PROPOSAL C   ││
│   │   "The Anchor"   │ │  "The Balance"   │ │ "The Pioneer"  ││
│   │                  │ │                  │ │                ││
│   │   Fixed Rent     │ │  Revenue Share   │ │  Partnership   ││
│   │                  │ │                  │ │                ││
│   │  ┌────────────┐  │ │  ┌────────────┐  │ │ ┌────────────┐ ││
│   │  │ Total Cost │  │ │  │ Total Cost │  │ │ │ Total Cost │ ││
│   │  │  SAR 890M  │  │ │  │  SAR 845M  │  │ │ │  SAR 780M  │ ││
│   │  └────────────┘  │ │  └────────────┘  │ │ └────────────┘ ││
│   │                  │ │                  │ │      ★ BEST    ││
│   └──────────────────┘ └──────────────────┘ └────────────────┘│
│                                                                │
│   ════════════════════════════════════════════════════════    │
│                    DETAILED METRICS TABLE                      │
│   ════════════════════════════════════════════════════════    │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## XI. IMPLEMENTATION PRIORITIES

### Phase 1: Foundation (Week 1)
- [ ] Update CSS custom properties with new color system
- [ ] Implement typography scale with Cormorant + Inter
- [ ] Create base card components (Monument, Ledger, Floating)
- [ ] Set up animation utilities

### Phase 2: Components (Week 2)
- [ ] Upgrade KPICard to Monument/Floating variants
- [ ] Implement new chart color system
- [ ] Create segment indicators
- [ ] Build hover/focus state system

### Phase 3: Polish (Week 3)
- [ ] Add paper textures and craft details
- [ ] Implement staggered reveal animations
- [ ] Add number cascade effects
- [ ] Dark mode refinements

### Phase 4: Pages (Week 4)
- [ ] Apply Grand Opening template to Dashboard
- [ ] Apply Comparison Chamber to Proposals
- [ ] Final QA on every detail

---

*"The difference between something good and something great is attention to detail."*
— Charles R. Swindoll

---

**Document Version:** 1.0
**Design System:** The Atelier Edition
**Last Updated:** December 2024
