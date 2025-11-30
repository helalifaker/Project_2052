/**
 * Back Button Navigation Component
 *
 * Executive Luxury design with Sahara Twilight theme integration.
 * Provides consistent back navigation with router support.
 *
 * Design Features:
 * - Typography: label.base (13px medium weight) from design tokens
 * - Spacing: 8px gap between icon and text using spacing[2]
 * - Colors: Copper hover effect with smooth transitions
 * - Icon animation: Subtle slide on hover
 * - Responsive: Text hidden on mobile, icon-only
 * - Flexible: Can use router.back() or custom href
 */

'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { typography } from '@/lib/design-tokens/typography';
import { spacing } from '@/lib/design-tokens/spacing';

export interface BackButtonProps {
  /**
   * Custom href to navigate to (overrides router.back())
   */
  href?: string;

  /**
   * Custom label text (default: "Back")
   */
  label?: string;

  /**
   * Hide label on mobile (show icon only)
   * Default: true
   */
  hideTextOnMobile?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Custom click handler (only used when href is not provided)
   */
  onClick?: () => void;
}

export function BackButton({
  href,
  label = 'Back',
  hideTextOnMobile = true,
  className = '',
  onClick,
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    } else {
      router.back();
    }
  };

  // Base button styles with design token integration
  const buttonClasses = `
    inline-flex items-center group
    text-muted-foreground hover:text-foreground
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-[var(--copper-500)] focus:ring-offset-2
    rounded-md px-2 py-1.5
    ${className}
  `.trim();

  const textClasses = hideTextOnMobile
    ? 'hidden sm:inline-block'
    : 'inline-block';

  const content = (
    <>
      {/* Icon with slide animation on hover */}
      <ArrowLeft
        size={16}
        className="transition-transform duration-200 group-hover:-translate-x-0.5"
        aria-hidden="true"
      />

      {/* Label Text */}
      <span
        className={textClasses}
        style={{
          marginLeft: spacing[2],
          fontSize: typography.label.base.size,
          fontWeight: typography.label.base.weight,
          lineHeight: typography.label.base.lineHeight,
          letterSpacing: typography.label.base.tracking,
        }}
      >
        {label}
      </span>
    </>
  );

  // If href provided, render as Link
  if (href) {
    return (
      <Link
        href={href}
        className={buttonClasses}
        aria-label={hideTextOnMobile ? label : undefined}
      >
        {content}
      </Link>
    );
  }

  // Otherwise, render as button with router.back()
  return (
    <button
      type="button"
      onClick={handleClick}
      className={buttonClasses}
      aria-label={hideTextOnMobile ? label : undefined}
    >
      {content}
    </button>
  );
}

/**
 * Icon-only variant for compact layouts
 * Always shows only the icon, no text
 */
export function BackButtonIcon({
  href,
  label = 'Back',
  className = '',
  onClick,
}: Omit<BackButtonProps, 'hideTextOnMobile'>) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    } else {
      router.back();
    }
  };

  const buttonClasses = `
    inline-flex items-center justify-center
    w-9 h-9 rounded-md
    text-muted-foreground hover:text-foreground
    hover:bg-accent
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-[var(--copper-500)] focus:ring-offset-2
    group
    ${className}
  `.trim();

  const content = (
    <ArrowLeft
      size={18}
      className="transition-transform duration-200 group-hover:-translate-x-0.5"
      aria-hidden="true"
    />
  );

  if (href) {
    return (
      <Link href={href} className={buttonClasses} aria-label={label}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={buttonClasses}
      aria-label={label}
    >
      {content}
    </button>
  );
}

/**
 * Pill-style back button with Executive Luxury aesthetics
 * Features rounded design with glass-morphism effect
 */
export function BackButtonPill({
  href,
  label = 'Back',
  className = '',
  onClick,
}: Omit<BackButtonProps, 'hideTextOnMobile'>) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    } else {
      router.back();
    }
  };

  const buttonClasses = `
    inline-flex items-center gap-2
    px-4 py-2 rounded-full
    bg-card border border-border
    text-muted-foreground hover:text-foreground
    hover:border-[var(--copper-500)] hover:bg-accent
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-[var(--copper-500)] focus:ring-offset-2
    shadow-sm hover:shadow-md
    group
    ${className}
  `.trim();

  const content = (
    <>
      <ArrowLeft
        size={16}
        className="transition-transform duration-200 group-hover:-translate-x-0.5"
        aria-hidden="true"
      />
      <span
        style={{
          fontSize: typography.label.base.size,
          fontWeight: typography.label.base.weight,
          lineHeight: typography.label.base.lineHeight,
          letterSpacing: typography.label.base.tracking,
        }}
      >
        {label}
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={buttonClasses} aria-label={label}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={handleClick} className={buttonClasses} aria-label={label}>
      {content}
    </button>
  );
}
