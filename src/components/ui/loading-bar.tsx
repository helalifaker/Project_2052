'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * LoadingBar Component
 *
 * A premium top-mounted progress bar that indicates page navigation.
 * Uses executive copper accent color with smooth animations.
 *
 * Features:
 * - Automatically shows on route change
 * - 100ms delay to avoid flicker on fast transitions
 * - Smooth ease-out animation
 * - Self-clearing after 500ms
 */
export function LoadingBar() {
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Add slight delay to avoid flickering on instant navigation
    const showTimer = setTimeout(() => {
      setLoading(true);
      setShow(true);
    }, 100);

    // Auto-hide after animation completes
    const hideTimer = setTimeout(() => {
      setLoading(false);
      setShow(false);
    }, 600);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [pathname]);

  if (!show) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[2px] bg-copper-100 dark:bg-copper-900/20 z-[100]"
      role="progressbar"
      aria-label="Page loading"
      aria-busy={loading}
    >
      <div
        className={`h-full bg-gradient-to-r from-copper-500 via-copper-700 to-copper-900 transition-all duration-500 ease-out ${
          loading ? 'w-full' : 'w-0'
        }`}
        style={{
          boxShadow: '0 0 10px rgba(201, 168, 108, 0.4)'
        }}
      />
    </div>
  );
}
