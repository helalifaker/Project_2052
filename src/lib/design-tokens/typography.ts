/**
 * Typography Design Tokens
 *
 * Executive Luxury aesthetic with light font weights (300-400) for large numbers
 * to reduce visual noise and focus attention on precision.
 *
 * Philosophy:
 * - Light weights for financial values create elegance
 * - Medium weights for labels create clear hierarchy
 * - Consistent line heights enable predictable spacing
 * - Tighter tracking for large text improves readability
 */

export const typography = {
  /**
   * Financial Display Typography
   * Used for large financial values - light weights for sophisticated appearance
   */
  financial: {
    hero: {
      size: '3.5rem',        // 56px
      weight: '300',         // light
      lineHeight: '1',
      tracking: '-0.02em',
      use: 'Hero metrics, featured content on executive dashboards',
    },
    large: {
      size: '2.5rem',        // 40px
      weight: '300',         // light
      lineHeight: '1.1',
      tracking: '-0.01em',
      use: 'Standard KPI cards, primary metrics',
    },
    medium: {
      size: '1.75rem',       // 28px
      weight: '400',         // normal
      lineHeight: '1.2',
      tracking: '0',
      use: 'Compact cards, secondary metrics',
    },
    base: {
      size: '1.25rem',       // 20px
      weight: '400',         // normal
      lineHeight: '1.3',
      tracking: '0',
      use: 'Inline metrics, small cards',
    },
  },

  /**
   * Label Typography
   * Medium weights for clarity without competing with data
   */
  label: {
    large: {
      size: '0.875rem',      // 14px
      weight: '500',         // medium
      lineHeight: '1.4',
      tracking: '0.01em',
      use: 'Section labels, large card labels',
    },
    base: {
      size: '0.8125rem',     // 13px
      weight: '500',         // medium
      lineHeight: '1.4',
      tracking: '0.01em',
      use: 'Standard labels, most common',
    },
    small: {
      size: '0.75rem',       // 12px
      weight: '500',         // medium
      lineHeight: '1.4',
      tracking: '0.02em',
      use: 'Compact labels, metadata',
    },
  },

  /**
   * Body Typography
   * Normal weights for optimal readability
   */
  body: {
    large: {
      size: '1rem',          // 16px
      weight: '400',         // normal
      lineHeight: '1.6',
      tracking: '0',
      use: 'Long-form content, articles',
    },
    base: {
      size: '0.9375rem',     // 15px
      weight: '400',         // normal
      lineHeight: '1.6',
      tracking: '0',
      use: 'Standard paragraphs, descriptions',
    },
    small: {
      size: '0.875rem',      // 14px
      weight: '400',         // normal
      lineHeight: '1.5',
      tracking: '0',
      use: 'Supporting text, captions',
    },
  },

  /**
   * Heading Typography
   * Semibold weights for clear section hierarchy
   */
  heading: {
    h1: {
      size: '2rem',          // 32px
      weight: '600',         // semibold
      lineHeight: '1.2',
      tracking: '-0.01em',
      use: 'Page titles',
    },
    h2: {
      size: '1.5rem',        // 24px
      weight: '600',         // semibold
      lineHeight: '1.3',
      tracking: '-0.005em',
      use: 'Section headers',
    },
    h3: {
      size: '1.25rem',       // 20px
      weight: '600',         // semibold
      lineHeight: '1.4',
      tracking: '0',
      use: 'Subsection headers',
    },
    h4: {
      size: '1rem',          // 16px
      weight: '600',         // semibold
      lineHeight: '1.4',
      tracking: '0',
      use: 'Card titles, minor headers',
    },
  },

  /**
   * Chart Typography
   * Consistent sizing across all data visualizations
   */
  chart: {
    axis: {
      size: '0.6875rem',     // 11px
      weight: '500',         // medium
      lineHeight: '1',
      tracking: '0.01em',
      use: 'Axis labels and tick marks',
    },
    legend: {
      size: '0.75rem',       // 12px
      weight: '500',         // medium
      lineHeight: '1.3',
      tracking: '0.01em',
      use: 'Legend items',
    },
    tooltip: {
      size: '0.8125rem',     // 13px
      weight: '500',         // medium
      lineHeight: '1.4',
      tracking: '0',
      use: 'Tooltip content',
    },
    label: {
      size: '0.75rem',       // 12px
      weight: '600',         // semibold
      lineHeight: '1',
      tracking: '0.02em',
      use: 'Data labels on charts',
    },
  },
} as const;

/**
 * Helper function to generate Tailwind-compatible class strings
 */
export function getTypographyClass(category: keyof typeof typography, variant: string): string {
  const categoryConfig = typography[category];

  // Use type assertion with unknown for safe access
  const config = (categoryConfig as any)[variant];

  if (!config || typeof config !== 'object' || !('size' in config)) {
    throw new Error(`Typography variant not found: ${category}.${variant}`);
  }

  return `text-[${config.size}] font-[${config.weight}] leading-[${config.lineHeight}] tracking-[${config.tracking}]`;
}

/**
 * CSS Custom Property Names
 * For use in globals.css @theme definitions
 */
export const typographyVars = {
  // Financial Display
  'font-size-financial-hero': '3.5rem',
  'font-weight-financial-hero': '300',
  'line-height-financial-hero': '1',
  'letter-spacing-financial-hero': '-0.02em',

  'font-size-financial-large': '2.5rem',
  'font-weight-financial-large': '300',
  'line-height-financial-large': '1.1',
  'letter-spacing-financial-large': '-0.01em',

  'font-size-financial-medium': '1.75rem',
  'font-weight-financial-medium': '400',
  'line-height-financial-medium': '1.2',

  'font-size-financial-base': '1.25rem',
  'font-weight-financial-base': '400',
  'line-height-financial-base': '1.3',

  // Labels
  'font-size-label-large': '0.875rem',
  'font-size-label-base': '0.8125rem',
  'font-size-label-small': '0.75rem',
  'font-weight-label': '500',
  'line-height-label': '1.4',

  // Chart
  'font-size-chart-axis': '0.6875rem',
  'font-size-chart-legend': '0.75rem',
  'font-size-chart-tooltip': '0.8125rem',
  'font-size-chart-label': '0.75rem',
  'font-weight-chart': '500',
} as const;
