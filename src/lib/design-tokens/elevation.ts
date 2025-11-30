/**
 * Elevation & Shadow Design Tokens
 *
 * Four-tier shadow system mapped to component importance.
 * Uses warm shadow tints (hsl(24 10% 10%)) aligned to Sahara Twilight theme.
 *
 * Philosophy:
 * - Systematic hierarchy (card → floating → elevated → command)
 * - Warm shadows complement warm color palette
 * - Progressive opacity for depth perception
 * - Dark mode adjustments for contrast
 */

/**
 * Shadow Levels
 * Four tiers of elevation with warm tints
 */
export const shadows = {
  /**
   * Level 0 - None
   * For flush elements with no elevation
   */
  none: 'none',

  /**
   * Level 1 - Card
   * Default elevation for cards on page background
   * Use: KPICard, MetricCard, standard panels
   */
  card: '0 1px 3px 0 hsl(24 10% 10% / 0.08), 0 1px 2px -1px hsl(24 10% 10% / 0.06)',

  /**
   * Level 2 - Floating
   * For elements that float above content
   * Use: Dropdown menus, popovers, tooltips, date pickers
   */
  floating: '0 4px 6px -1px hsl(24 10% 10% / 0.12), 0 2px 4px -2px hsl(24 10% 10% / 0.08)',

  /**
   * Level 3 - Elevated
   * For important, sticky, or prominent elements
   * Use: Sticky headers, floating action buttons, toast notifications
   */
  elevated: '0 10px 15px -3px hsl(24 10% 10% / 0.14), 0 4px 6px -4px hsl(24 10% 10% / 0.10)',

  /**
   * Level 4 - Command
   * For critical UI that demands attention
   * Use: Modals, dialogs, command palette, critical alerts
   */
  command: '0 20px 25px -5px hsl(24 10% 10% / 0.16), 0 8px 10px -6px hsl(24 10% 10% / 0.12)',

  /**
   * Focus Glows
   * Copper accent glow for focus states
   */
  glowCopper: '0 0 0 3px hsl(var(--color-copper) / 0.15)',
  glowSage: '0 0 0 3px hsl(var(--color-sage) / 0.15)',
  glowTerracotta: '0 0 0 3px hsl(var(--color-terracotta) / 0.15)',
} as const;

/**
 * Dark Mode Shadows
 * Stronger shadows for better contrast against dark backgrounds
 */
export const shadowsDark = {
  none: 'none',
  card: '0 1px 3px 0 hsl(0 0% 0% / 0.20), 0 1px 2px -1px hsl(0 0% 0% / 0.16)',
  floating: '0 4px 6px -1px hsl(0 0% 0% / 0.28), 0 2px 4px -2px hsl(0 0% 0% / 0.20)',
  elevated: '0 10px 15px -3px hsl(0 0% 0% / 0.36), 0 4px 6px -4px hsl(0 0% 0% / 0.24)',
  command: '0 20px 25px -5px hsl(0 0% 0% / 0.44), 0 8px 10px -6px hsl(0 0% 0% / 0.32)',
  glowCopper: '0 0 0 3px hsl(var(--color-copper) / 0.20)',
  glowSage: '0 0 0 3px hsl(var(--color-sage) / 0.20)',
  glowTerracotta: '0 0 0 3px hsl(var(--color-terracotta) / 0.20)',
} as const;

/**
 * Component Shadow Mapping
 * Guidelines for which shadow to use for each component type
 */
export const componentShadows = {
  // Cards & Panels
  kpiCard: shadows.card,
  metricCard: shadows.card,
  proposalCard: shadows.card,
  chartPanel: shadows.card,
  standardPanel: shadows.card,

  // Floating Elements
  dropdown: shadows.floating,
  popover: shadows.floating,
  tooltip: shadows.floating,
  datePicker: shadows.floating,
  contextMenu: shadows.floating,

  // Elevated Elements
  stickyHeader: shadows.elevated,
  floatingActionButton: shadows.elevated,
  toast: shadows.elevated,
  hoverCard: shadows.elevated,

  // Command/Critical Elements
  modal: shadows.command,
  dialog: shadows.command,
  commandPalette: shadows.command,
  criticalAlert: shadows.command,
  drawerOverlay: shadows.command,
} as const;

/**
 * Tailwind Shadow Class Mapping
 * For use in components
 */
export const shadowClasses = {
  none: 'shadow-none',
  card: 'shadow-[0_1px_3px_0_hsl(24_10%_10%/0.08),0_1px_2px_-1px_hsl(24_10%_10%/0.06)]',
  floating: 'shadow-[0_4px_6px_-1px_hsl(24_10%_10%/0.12),0_2px_4px_-2px_hsl(24_10%_10%/0.08)]',
  elevated: 'shadow-[0_10px_15px_-3px_hsl(24_10%_10%/0.14),0_4px_6px_-4px_hsl(24_10%_10%/0.10)]',
  command: 'shadow-[0_20px_25px_-5px_hsl(24_10%_10%/0.16),0_8px_10px_-6px_hsl(24_10%_10%/0.12)]',
  glowCopper: 'shadow-[0_0_0_3px_hsl(var(--color-copper)/0.15)]',
  glowSage: 'shadow-[0_0_0_3px_hsl(var(--color-sage)/0.15)]',
} as const;

/**
 * CSS Custom Property Names
 * For use in globals.css @theme definitions
 */
export const shadowVars = {
  // Light mode shadows
  '--shadow-none': 'none',
  '--shadow-card': '0 1px 3px 0 hsl(24 10% 10% / 0.08), 0 1px 2px -1px hsl(24 10% 10% / 0.06)',
  '--shadow-floating': '0 4px 6px -1px hsl(24 10% 10% / 0.12), 0 2px 4px -2px hsl(24 10% 10% / 0.08)',
  '--shadow-elevated': '0 10px 15px -3px hsl(24 10% 10% / 0.14), 0 4px 6px -4px hsl(24 10% 10% / 0.10)',
  '--shadow-command': '0 20px 25px -5px hsl(24 10% 10% / 0.16), 0 8px 10px -6px hsl(24 10% 10% / 0.12)',
  '--shadow-glow-copper': '0 0 0 3px hsl(var(--color-copper) / 0.15)',
  '--shadow-glow-sage': '0 0 0 3px hsl(var(--color-sage) / 0.15)',
  '--shadow-glow-terracotta': '0 0 0 3px hsl(var(--color-terracotta) / 0.15)',
} as const;

/**
 * CSS Custom Property Names (Dark Mode)
 * Override values for dark theme
 */
export const shadowVarsDark = {
  '--shadow-card': '0 1px 3px 0 hsl(0 0% 0% / 0.20), 0 1px 2px -1px hsl(0 0% 0% / 0.16)',
  '--shadow-floating': '0 4px 6px -1px hsl(0 0% 0% / 0.28), 0 2px 4px -2px hsl(0 0% 0% / 0.20)',
  '--shadow-elevated': '0 10px 15px -3px hsl(0 0% 0% / 0.36), 0 4px 6px -4px hsl(0 0% 0% / 0.24)',
  '--shadow-command': '0 20px 25px -5px hsl(0 0% 0% / 0.44), 0 8px 10px -6px hsl(0 0% 0% / 0.32)',
  '--shadow-glow-copper': '0 0 0 3px hsl(var(--color-copper) / 0.20)',
  '--shadow-glow-sage': '0 0 0 3px hsl(var(--color-sage) / 0.20)',
  '--shadow-glow-terracotta': '0 0 0 3px hsl(var(--color-terracotta) / 0.20)',
} as const;

/**
 * Helper: Get shadow for component type
 */
export function getComponentShadow(componentType: keyof typeof componentShadows): string {
  return componentShadows[componentType];
}

/**
 * Helper: Get shadow class for component type
 */
export function getComponentShadowClass(componentType: keyof typeof componentShadows): string {
  const shadowValue = componentShadows[componentType];

  // Map shadow value to class using string includes for safer comparison
  if (shadowValue.includes('none')) return shadowClasses.none;
  if (shadowValue.includes('1px 3px')) return shadowClasses.card;
  if (shadowValue.includes('4px 6px')) return shadowClasses.floating;
  if (shadowValue.includes('10px 15px')) return shadowClasses.elevated;
  if (shadowValue.includes('20px 25px')) return shadowClasses.command;

  return shadowClasses.card; // Default fallback
}

/**
 * Migration Guide
 *
 * Old Pattern → New Pattern
 * ------------------------------
 * shadow-sm      → shadow-[...card]     (use shadowClasses.card)
 * shadow-md      → shadow-[...floating]  (use shadowClasses.floating)
 * shadow-lg      → shadow-[...elevated]  (use shadowClasses.elevated)
 * shadow-xl      → shadow-[...command]   (use shadowClasses.command)
 * shadow-2xl     → shadow-[...command]   (use shadowClasses.command)
 *
 * Usage in components:
 * ```tsx
 * import { shadowClasses } from '@/lib/design-tokens/elevation';
 *
 * <div className={shadowClasses.card}>...</div>
 * <div className={shadowClasses.floating}>...</div>
 * ```
 */
