"use client";

import * as React from "react";

/**
 * FocusTrap Component
 *
 * Traps keyboard focus within a container (typically a modal or dialog).
 * Essential for accessible modal dialogs.
 *
 * WCAG 2.1 Compliance:
 * - 2.1.2 No Keyboard Trap (Level A) - Ensures user can escape
 * - 2.4.3 Focus Order (Level A)
 *
 * Features:
 * - Traps Tab/Shift+Tab navigation within container
 * - Escape key to close (via onEscape callback)
 * - Restores focus to trigger element on unmount
 *
 * @example
 * <FocusTrap onEscape={() => setModalOpen(false)}>
 *   <div role="dialog" aria-modal="true">
 *     <h2>Modal Title</h2>
 *     <button>Action</button>
 *     <button onClick={() => setModalOpen(false)}>Close</button>
 *   </div>
 * </FocusTrap>
 */
interface FocusTrapProps {
  children: React.ReactNode;
  onEscape?: () => void;
  enabled?: boolean;
  className?: string;
}

export function FocusTrap({
  children,
  onEscape,
  enabled = true,
  className,
}: FocusTrapProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!enabled) return;

    // Store currently focused element
    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    // Focus first focusable element in container
    const focusableElements = getFocusableElements(containerRef.current);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Restore focus on unmount
    return () => {
      if (previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [enabled]);

  React.useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle Escape key
      if (event.key === "Escape" && onEscape) {
        event.preventDefault();
        onEscape();
        return;
      }

      // Handle Tab key
      if (event.key === "Tab") {
        const focusableElements = getFocusableElements(containerRef.current);
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // Shift+Tab on first element -> focus last
        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
        // Tab on last element -> focus first
        else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enabled, onEscape]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

/**
 * Get all focusable elements within a container
 */
function getFocusableElements(
  container: HTMLElement | null
): HTMLElement[] {
  if (!container) return [];

  const selector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(",");

  return Array.from(container.querySelectorAll<HTMLElement>(selector));
}
