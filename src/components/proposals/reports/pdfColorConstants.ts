/**
 * PDF Report Color Constants
 *
 * Centralized color palette for PDF report generation.
 * These mirror the design system tokens but use raw hex values
 * because PDF charts are rendered off-screen and captured as
 * static images where CSS variables are not resolved.
 *
 * Keep in sync with globals.css design tokens.
 */
export const pdfColors = {
  // Primary accent (copper/gold)
  accent: "#A68B5B",
  accentLight: "rgba(166, 139, 91, 0.4)",
  accentMedium: "rgba(166, 139, 91, 0.15)",

  // Text
  heading: "#1e293b",
  body: "#64748b",
  muted: "#94a3b8",

  // Borders & grid
  border: "#e2e8f0",
  axis: "#cbd5e1",

  // Backgrounds
  background: "#ffffff",

  // Semantic
  info: "#3b82f6",

  // Tooltip
  tooltipBg: "#ffffff",
  tooltipBorder: "#e2e8f0",
  tooltipShadow: "0 4px 12px rgba(0,0,0,0.1)",
} as const;
