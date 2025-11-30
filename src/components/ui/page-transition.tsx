'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * PageTransition Component
 *
 * Wraps page content with smooth fade-in animation on route change.
 * Uses executive luxury aesthetic with subtle motion.
 *
 * Usage:
 * ```tsx
 * <PageTransition>
 *   <YourPageContent />
 * </PageTransition>
 * ```
 */
export function PageTransition({ children, className = '' }: PageTransitionProps) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    setTransitioning(true);
    setDisplayChildren(children);

    const timer = setTimeout(() => {
      setTransitioning(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname, children]);

  return (
    <div
      className={`page-transition-enter ${className}`}
      key={pathname}
      style={{
        animationPlayState: transitioning ? 'running' : 'paused'
      }}
    >
      {displayChildren}
    </div>
  );
}
