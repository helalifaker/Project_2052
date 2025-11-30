/**
 * Spacing Design Tokens
 *
 * 4px base unit system with T-shirt sizing and semantic naming.
 *
 * Philosophy:
 * - Systematic spacing creates visual rhythm
 * - Semantic names improve developer experience
 * - Predictable scale enables consistent layouts
 * - No arbitrary spacing values
 */

/**
 * Base Spacing Scale
 * All spacing derived from 4px base unit
 */
export const spacing = {
  0: '0',
  1: '0.25rem',    // 4px  - Tight inline spacing
  2: '0.5rem',     // 8px  - Default inline spacing
  3: '0.75rem',    // 12px - Relaxed inline spacing
  4: '1rem',       // 16px - Section spacing
  5: '1.25rem',    // 20px - Comfortable section spacing
  6: '1.5rem',     // 24px - Card spacing
  8: '2rem',       // 32px - Page section spacing
  10: '2.5rem',    // 40px - Major section breaks
  12: '3rem',      // 48px - Extra large spacing
  16: '4rem',      // 64px - Maximum spacing
} as const;

/**
 * Component Padding Standards
 * T-shirt sizing for consistent component spacing
 */
export const componentPadding = {
  /**
   * Cards & Panels
   */
  card: {
    compact: 'p-4',       // 16px - Dense data tables, comparison views
    default: 'p-6',       // 24px - Standard cards, most common
    comfortable: 'p-8',   // 32px - Executive dashboards, premium cards
    hero: 'p-10',         // 40px - Hero metrics, featured content
  },

  /**
   * Sections within Cards
   */
  section: {
    tight: 'space-y-2',       // 8px  - Tightly related items
    default: 'space-y-4',     // 16px - Standard section spacing
    relaxed: 'space-y-6',     // 24px - Distinct sections
  },

  /**
   * Grid Gaps
   */
  grid: {
    tight: 'gap-4',       // 16px - Dense layouts (4+ columns)
    default: 'gap-6',     // 24px - Standard grids (2-3 columns)
    relaxed: 'gap-8',     // 32px - Spacious layouts (large cards)
  },

  /**
   * Container Padding (Page Level)
   * Responsive padding for different breakpoints
   */
  container: {
    mobile: 'px-4 py-6',      // 16px horizontal, 24px vertical
    tablet: 'px-6 py-8',      // 24px horizontal, 32px vertical
    desktop: 'px-8 py-10',    // 32px horizontal, 40px vertical
  },
} as const;

/**
 * Semantic Spacing
 * Named spacing for specific use cases
 */
export const semanticSpacing = {
  // Inline spacing (horizontal gaps between related elements)
  inline: {
    tight: spacing[2],        // 8px  - Icon + label
    default: spacing[3],      // 12px - Related elements
    relaxed: spacing[4],      // 16px - Distinct groups
  },

  // Stack spacing (vertical gaps between stacked elements)
  stack: {
    tight: spacing[1],        // 4px  - Label above value
    default: spacing[2],      // 8px  - Form fields
    relaxed: spacing[4],      // 16px - Distinct sections
  },

  // Section spacing (gaps between major page sections)
  section: {
    default: spacing[6],      // 24px - Between card sections
    page: spacing[8],         // 32px - Between page sections
  },
} as const;

/**
 * Border Radius Scale
 * Larger radius for larger components
 */
export const borderRadius = {
  none: '0',
  sm: '0.375rem',      // 6px  - Small buttons, badges
  base: '0.5rem',      // 8px  - Inputs, small buttons
  md: '0.75rem',       // 12px - Standard cards (DEFAULT)
  lg: '1rem',          // 16px - Large cards, modals
  xl: '1.25rem',       // 20px - Hero cards, premium surfaces
  full: '9999px',      // Pills, circular elements
} as const;

/**
 * Component Border Radius Standards
 */
export const componentRadius = {
  input: borderRadius.base,      // 8px  - Form inputs
  button: borderRadius.base,     // 8px  - Buttons
  card: borderRadius.md,         // 12px - Standard cards
  cardLarge: borderRadius.lg,    // 16px - Large/executive cards
  cardHero: borderRadius.xl,     // 20px - Hero metric cards
  modal: borderRadius.lg,        // 16px - Modals, dialogs
  tooltip: borderRadius.md,      // 12px - Tooltips, popovers
  badge: borderRadius.sm,        // 6px  - Small badges
} as const;

/**
 * CSS Custom Property Names
 * For use in globals.css @theme definitions
 */
export const spacingVars = {
  // Base scale
  'space-0': '0',
  'space-1': '0.25rem',
  'space-2': '0.5rem',
  'space-3': '0.75rem',
  'space-4': '1rem',
  'space-5': '1.25rem',
  'space-6': '1.5rem',
  'space-8': '2rem',
  'space-10': '2.5rem',
  'space-12': '3rem',
  'space-16': '4rem',

  // Semantic spacing
  'space-card-compact': 'var(--space-4)',
  'space-card-default': 'var(--space-6)',
  'space-card-comfortable': 'var(--space-8)',
  'space-card-hero': 'var(--space-10)',

  'space-section-gap': 'var(--space-6)',
  'space-page-gap': 'var(--space-8)',

  'space-inline-tight': 'var(--space-2)',
  'space-inline-default': 'var(--space-3)',
  'space-inline-relaxed': 'var(--space-4)',

  'space-stack-tight': 'var(--space-1)',
  'space-stack-default': 'var(--space-2)',
  'space-stack-relaxed': 'var(--space-4)',

  // Border radius
  'radius-none': '0',
  'radius-sm': '0.375rem',
  'radius-base': '0.5rem',
  'radius-md': '0.75rem',
  'radius-lg': '1rem',
  'radius-xl': '1.25rem',
  'radius-full': '9999px',

  // Component-specific radius
  'radius-card-default': 'var(--radius-md)',
  'radius-card-large': 'var(--radius-lg)',
  'radius-card-hero': 'var(--radius-xl)',
  'radius-input': 'var(--radius-base)',
  'radius-button': 'var(--radius-base)',
  'radius-modal': 'var(--radius-lg)',
} as const;

/**
 * Migration Guide
 *
 * Old Pattern → New Pattern
 * ------------------------------
 * py-6 px-6    → p-6 (use componentPadding.card.default)
 * p-8          → p-8 (use componentPadding.card.comfortable)
 * p-4          → p-4 (use componentPadding.card.compact)
 * rounded-xl   → rounded-xl (use componentRadius.card)
 * rounded-2xl  → rounded-2xl (use componentRadius.cardLarge)
 */
