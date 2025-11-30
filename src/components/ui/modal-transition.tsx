'use client';

import { useEffect, useState } from 'react';

interface ModalTransitionProps {
  children: React.ReactNode;
  className?: string;
  isOpen?: boolean;
}

/**
 * ModalTransition Component
 *
 * Wraps modal/dialog content with smooth slide-up animation.
 * Faster than page transitions (200ms) for snappy interactions.
 *
 * Usage:
 * ```tsx
 * <Dialog>
 *   <DialogContent>
 *     <ModalTransition>
 *       <YourModalContent />
 *     </ModalTransition>
 *   </DialogContent>
 * </Dialog>
 * ```
 */
export function ModalTransition({
  children,
  className = '',
  isOpen = true,
}: ModalTransitionProps) {
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    } else {
      // Delay unmounting to allow exit animation
      const timer = setTimeout(() => setShouldRender(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div
      className={`modal-transition-enter ${className}`}
      style={{
        animationPlayState: isOpen ? 'running' : 'paused',
      }}
    >
      {children}
    </div>
  );
}
