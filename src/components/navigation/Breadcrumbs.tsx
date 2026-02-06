/**
 * Breadcrumbs Navigation Component
 *
 * Executive Luxury design with Sahara Twilight theme integration.
 * Provides hierarchical navigation with semantic HTML and accessibility.
 *
 * Design Features:
 * - Typography: label.base (13px medium weight) from design tokens
 * - Spacing: 8px inline gaps using spacing[2]
 * - Colors: Copper for current item, muted foreground for inactive
 * - Smooth hover transitions with color change
 * - Responsive: Collapses gracefully on mobile
 * - Semantic HTML with aria-label for screen readers
 */

'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { typography } from '@/lib/design-tokens/typography';
import { spacing } from '@/lib/design-tokens/spacing';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  // Don't render if no items
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="breadcrumb"
      className={`flex items-center ${className}`}
    >
      <ol className="flex items-center flex-wrap gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isCurrent = isLast;

          return (
            <li key={index} className="flex items-center">
              {/* Breadcrumb Item */}
              {item.href && !isCurrent ? (
                <Link
                  href={item.href}
                  className="group inline-flex items-center transition-colors duration-200"
                  style={{
                    fontSize: typography.label.base.size,
                    fontWeight: typography.label.base.weight,
                    lineHeight: typography.label.base.lineHeight,
                    letterSpacing: typography.label.base.tracking,
                  }}
                >
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                    {item.label}
                  </span>
                </Link>
              ) : (
                <span
                  className="inline-flex items-center"
                  style={{
                    fontSize: typography.label.base.size,
                    fontWeight: typography.label.base.weight,
                    lineHeight: typography.label.base.lineHeight,
                    letterSpacing: typography.label.base.tracking,
                  }}
                  aria-current={isCurrent ? 'page' : undefined}
                >
                  <span
                    className={isCurrent ? 'text-copper-700' : 'text-muted-foreground'}
                  >
                    {item.label}
                  </span>
                </span>
              )}

              {/* Separator - Hide on last item */}
              {!isLast && (
                <ChevronRight
                  className="text-muted-foreground/50 mx-2 flex-shrink-0"
                  size={14}
                  aria-hidden="true"
                  style={{
                    marginLeft: spacing[2],
                    marginRight: spacing[2],
                  }}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Mobile-optimized variant that collapses middle items
 * Shows: First ... Last on mobile, full path on desktop
 */
export function BreadcrumbsResponsive({ items, className = '' }: BreadcrumbsProps) {
  if (!items || items.length === 0) {
    return null;
  }

  // If only 1-2 items, show regular breadcrumbs
  if (items.length <= 2) {
    return <Breadcrumbs items={items} className={className} />;
  }

  const firstItem = items[0];
  const lastItem = items[items.length - 1];
  const middleItems = items.slice(1, -1);

  return (
    <nav
      aria-label="breadcrumb"
      className={`flex items-center ${className}`}
    >
      <ol className="flex items-center flex-wrap gap-2">
        {/* First Item */}
        <li className="flex items-center">
          {firstItem.href ? (
            <Link
              href={firstItem.href}
              className="group inline-flex items-center transition-colors duration-200"
              style={{
                fontSize: typography.label.base.size,
                fontWeight: typography.label.base.weight,
                lineHeight: typography.label.base.lineHeight,
                letterSpacing: typography.label.base.tracking,
              }}
            >
              <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                {firstItem.label}
              </span>
            </Link>
          ) : (
            <span
              className="text-muted-foreground"
              style={{
                fontSize: typography.label.base.size,
                fontWeight: typography.label.base.weight,
              }}
            >
              {firstItem.label}
            </span>
          )}
          <ChevronRight
            className="text-muted-foreground/50 mx-2"
            size={14}
            aria-hidden="true"
          />
        </li>

        {/* Middle Items - Hidden on mobile, shown on tablet+ */}
        <li className="hidden md:flex items-center">
          {middleItems.map((item, index) => (
            <div key={index} className="flex items-center">
              {item.href ? (
                <Link
                  href={item.href}
                  className="group inline-flex items-center transition-colors duration-200"
                  style={{
                    fontSize: typography.label.base.size,
                    fontWeight: typography.label.base.weight,
                  }}
                >
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                    {item.label}
                  </span>
                </Link>
              ) : (
                <span className="text-muted-foreground" style={{ fontSize: typography.label.base.size }}>
                  {item.label}
                </span>
              )}
              <ChevronRight
                className="text-muted-foreground/50 mx-2"
                size={14}
                aria-hidden="true"
              />
            </div>
          ))}
        </li>

        {/* Ellipsis - Shown only on mobile when middle items exist */}
        <li className="flex items-center md:hidden">
          <span
            className="text-muted-foreground"
            style={{ fontSize: typography.label.base.size }}
            aria-hidden="true"
          >
            ...
          </span>
          <ChevronRight
            className="text-muted-foreground/50 mx-2"
            size={14}
            aria-hidden="true"
          />
        </li>

        {/* Last Item (Current) */}
        <li className="flex items-center">
          <span
            className="text-copper-700"
            style={{
              fontSize: typography.label.base.size,
              fontWeight: typography.label.base.weight,
            }}
            aria-current="page"
          >
            {lastItem.label}
          </span>
        </li>
      </ol>
    </nav>
  );
}
