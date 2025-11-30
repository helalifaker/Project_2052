'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * usePageTransition Hook
 *
 * Manages page transition states for smooth navigation experiences.
 * Returns loading state and transition helpers.
 *
 * Usage:
 * ```tsx
 * const { isTransitioning } = usePageTransition();
 * ```
 */
export function usePageTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Start transition with 100ms delay to avoid flicker
    const startTimer = setTimeout(() => {
      setIsTransitioning(true);
    }, 100);

    // End transition after animation completes
    const endTimer = setTimeout(() => {
      setIsTransitioning(false);
    }, 400);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(endTimer);
    };
  }, [pathname]);

  return { isTransitioning };
}
