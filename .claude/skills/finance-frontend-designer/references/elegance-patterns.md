# Elegance Patterns

The difference between good and exceptional is in the details no one consciously notices but everyone feels. This file contains the micro-patterns that create that feeling.

## Philosophy

> *"Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away."* — Antoine de Saint-Exupéry

Elegant interfaces:
- Feel effortless to use
- Reward attention without demanding it
- Create trust through consistency
- Surprise with subtle delight

---

## Refined Component Patterns

### The Executive Card (Perfected)

```tsx
/**
 * A card that feels crafted, not assembled.
 *
 * Key refinements:
 * - 300ms transitions (not 150ms - too snappy, not 500ms - too slow)
 * - ease-out-expo for natural deceleration
 * - Border opacity shift, not color change
 * - Icon at 20% opacity, rises to 40% on hover (never 100%)
 * - Accent line scales from left (origin-left)
 */
const ElegantCard = ({ children, className }: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "group relative",
      "p-6 rounded-2xl",
      "bg-[var(--executive-card)]",
      "border border-[var(--executive-border)]/60",
      "hover:border-[var(--executive-accent)]/30",
      "transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
      className
    )}
  >
    {children}

    {/* The signature accent line */}
    <div
      className="absolute bottom-0 left-6 right-6 h-px
                 bg-gradient-to-r from-transparent via-[var(--executive-accent)] to-transparent
                 scale-x-0 group-hover:scale-x-100
                 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
                 origin-center"
    />
  </div>
);
```

### Refined Button States

```tsx
/**
 * Button with thoughtful state transitions.
 *
 * Refinements:
 * - Slight scale on hover (1.01) and press (0.99)
 * - Shadow lifts on hover, compresses on press
 * - Color transitions are 200ms, transform is 150ms
 */
const ElegantButton = ({
  children,
  variant = 'primary',
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
}) => {
  const variants = {
    primary: `
      bg-[var(--executive-accent)] text-zinc-900
      hover:bg-[var(--executive-accent)]/90
      shadow-sm hover:shadow-md active:shadow-sm
    `,
    secondary: `
      bg-transparent text-[var(--executive-text)]
      border border-[var(--executive-border)]
      hover:border-[var(--executive-accent)]/40
      hover:bg-[var(--executive-accent)]/[0.03]
    `,
    ghost: `
      bg-transparent text-[var(--executive-text-secondary)]
      hover:text-[var(--executive-text)]
      hover:bg-[var(--executive-accent)]/[0.04]
    `,
  };

  return (
    <button
      className={cn(
        "relative px-4 py-2 rounded-lg font-medium text-sm",
        "transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "hover:scale-[1.01] active:scale-[0.99]",
        "focus:outline-none focus:ring-2 focus:ring-[var(--executive-accent)]/20",
        variants[variant]
      )}
    >
      {children}
    </button>
  );
};
```

### Graceful Number Animation

```tsx
/**
 * Numbers that count up with easing.
 *
 * Refinements:
 * - Uses ease-out-expo for natural deceleration
 * - Respects reduced motion preferences
 * - Formats with locale-aware separators
 */
const AnimatedNumber = ({
  value,
  duration = 1000,
  format = 'number',
}: {
  value: number;
  duration?: number;
  format?: 'number' | 'currency' | 'percentage';
}) => {
  const [displayed, setDisplayed] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayed(value);
      return;
    }

    let startTime: number;
    let animationFrame: number;

    const easeOutExpo = (t: number) =>
      t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);

      setDisplayed(Math.round(easedProgress * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration, prefersReducedMotion]);

  const formatted = useMemo(() => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-SA', {
          style: 'currency',
          currency: 'SAR',
          notation: 'compact',
          maximumFractionDigits: 1,
        }).format(displayed);
      case 'percentage':
        return `${displayed.toFixed(1)}%`;
      default:
        return displayed.toLocaleString();
    }
  }, [displayed, format]);

  return (
    <span className="tabular-nums">{formatted}</span>
  );
};
```

---

## Micro-Interaction Recipes

### Fade-Through (Not Fade-Out/In)

```tsx
// When changing content, fade through a middle state
const FadeThrough = ({ children, trigger }: {
  children: React.ReactNode;
  trigger: unknown;
}) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [content, setContent] = useState(children);

  useEffect(() => {
    setIsTransitioning(true);
    const timeout = setTimeout(() => {
      setContent(children);
      setIsTransitioning(false);
    }, 150);
    return () => clearTimeout(timeout);
  }, [trigger]);

  return (
    <div
      className={cn(
        "transition-opacity duration-150",
        isTransitioning ? "opacity-0" : "opacity-100"
      )}
    >
      {content}
    </div>
  );
};
```

### Staggered Entrance

```tsx
// Children appear one after another
const StaggeredList = ({ children }: { children: React.ReactNode[] }) => (
  <div className="space-y-4">
    {React.Children.map(children, (child, index) => (
      <div
        className="animate-in fade-in slide-in-from-bottom-2"
        style={{
          animationDelay: `${index * 50}ms`,
          animationFillMode: 'backwards',
        }}
      >
        {child}
      </div>
    ))}
  </div>
);
```

### Reveal on Scroll

```tsx
// Elements fade in as they enter viewport
const RevealOnScroll = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
        isInView
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4"
      )}
    >
      {children}
    </div>
  );
};
```

---

## Typography Refinements

### Display Numbers (The Hero Metric)

```tsx
// Large numbers that command attention
const DisplayNumber = ({ value, label }: {
  value: string;
  label: string;
}) => (
  <div>
    <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--executive-text-secondary)] mb-2">
      {label}
    </p>
    <p className="text-5xl font-light tracking-tight tabular-nums text-[var(--executive-text)]
                  leading-none">
      {value}
    </p>
  </div>
);

// Refinements applied:
// - text-5xl with font-light (not bold - feels aggressive)
// - tracking-tight (-0.02em) for large text
// - tabular-nums for alignment
// - leading-none to reduce line-height on single-line numbers
```

### Label Hierarchy

```tsx
// Three levels of labels, each with specific treatment
const labels = {
  // Primary label - section headers
  primary: "text-sm font-medium tracking-tight text-[var(--executive-text)]",

  // Secondary label - field labels, chart legends
  secondary: "text-[11px] text-[var(--executive-text-secondary)]",

  // Tertiary label - timestamps, metadata
  tertiary: "text-[10px] uppercase tracking-[0.15em] text-[var(--executive-text-tertiary)]",

  // Micro label - badges, status indicators
  micro: "text-[9px] uppercase tracking-[0.2em] font-medium",
};
```

---

## Color Application

### The Accent Gradient

```tsx
// Never use flat accent colors - add subtle gradients
const accentGradients = {
  // Horizontal - for buttons, badges
  horizontal: "bg-gradient-to-r from-[var(--executive-accent)] to-[var(--executive-accent)]/80",

  // Vertical - for chart fills
  vertical: "bg-gradient-to-b from-[var(--executive-accent)]/20 to-transparent",

  // Radial - for glows, highlights
  radial: "bg-[radial-gradient(circle_at_center,var(--executive-accent)/15,transparent_70%)]",

  // Text gradient (for special emphasis)
  text: `bg-gradient-to-r from-[var(--executive-accent)] to-[var(--executive-accent)]/70
         bg-clip-text text-transparent`,
};
```

### Contextual Opacity

```tsx
// Same color, different contexts
const accentOpacity = {
  // Solid - buttons, active states
  solid: "bg-[var(--executive-accent)]",

  // Muted - badges, tags
  muted: "bg-[var(--executive-accent)]/20",

  // Subtle - hover backgrounds
  subtle: "bg-[var(--executive-accent)]/[0.04]",

  // Whisper - barely visible emphasis
  whisper: "bg-[var(--executive-accent)]/[0.02]",

  // Border - interactive state
  border: "border-[var(--executive-accent)]/40",
};
```

---

## Loading States

### Skeleton with Shimmer

```tsx
// Skeleton that feels alive, not frozen
const Skeleton = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "relative overflow-hidden rounded-md bg-[var(--executive-border)]/30",
      className
    )}
  >
    <div
      className="absolute inset-0 -translate-x-full
                 bg-gradient-to-r from-transparent via-white/5 to-transparent
                 animate-[shimmer_2s_infinite]"
    />
  </div>
);

// Add to globals.css:
// @keyframes shimmer {
//   100% { transform: translateX(100%); }
// }
```

### Pulse with Restraint

```tsx
// Subtle pulse, not aggressive
const LoadingDot = () => (
  <div className="w-2 h-2 rounded-full bg-[var(--executive-accent)]/60
                  animate-pulse" />
);

// Multiple dots with stagger
const LoadingDots = () => (
  <div className="flex gap-1">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="w-1.5 h-1.5 rounded-full bg-[var(--executive-accent)]
                   animate-pulse"
        style={{ animationDelay: `${i * 150}ms` }}
      />
    ))}
  </div>
);
```

---

## Empty States

### Elegant Empty

```tsx
const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
      style={{ background: "var(--executive-accent-subtle)" }}
    >
      <Icon
        className="w-7 h-7"
        style={{ color: "var(--executive-accent)" }}
        strokeWidth={1.5}
      />
    </div>

    <h3 className="text-lg font-medium text-[var(--executive-text)] mb-2">
      {title}
    </h3>

    <p className="text-sm text-[var(--executive-text-secondary)] max-w-sm mb-6">
      {description}
    </p>

    {action}
  </div>
);

// Usage:
<EmptyState
  icon={FileText}
  title="No proposals yet"
  description="Create your first lease proposal to see financial projections and analysis."
  action={
    <ElegantButton variant="primary">
      Create Proposal
    </ElegantButton>
  }
/>
```

---

## The Details That Matter

### Focus States

```tsx
// Focus should be visible but not jarring
const focusStyles = `
  focus:outline-none
  focus-visible:ring-2
  focus-visible:ring-[var(--executive-accent)]/30
  focus-visible:ring-offset-2
  focus-visible:ring-offset-[var(--executive-card)]
`;
```

### Selection States

```tsx
// Selected items should feel confident, not aggressive
const selectionStyles = {
  selected: `
    bg-[var(--executive-accent)]/[0.08]
    border-[var(--executive-accent)]/30
  `,
  hover: `
    hover:bg-[var(--executive-accent)]/[0.04]
  `,
  active: `
    active:bg-[var(--executive-accent)]/[0.12]
  `,
};
```

### Disabled States

```tsx
// Disabled should be quiet, not ugly
const disabledStyles = `
  disabled:opacity-40
  disabled:cursor-not-allowed
  disabled:pointer-events-none
`;
```

---

## Final Checklist

Before shipping, verify:

- [ ] All transitions use custom easing curves
- [ ] No opacity values above 0.05 for hover backgrounds
- [ ] All borders use CSS variables with opacity
- [ ] Font weights stay between 300-600
- [ ] Numbers use tabular-nums
- [ ] Large text has negative tracking
- [ ] Small/uppercase text has positive tracking
- [ ] Shadows are multi-layered and subtle
- [ ] Loading states feel alive (shimmer, not spinner)
- [ ] Empty states are designed, not placeholder
- [ ] The accent line appears on card hover
- [ ] Icons never exceed 40% opacity
- [ ] It looks like it cost $50K to build
