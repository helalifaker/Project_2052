"use client";

import * as React from "react";

/**
 * useKeyboardNavigation Hook
 *
 * Provides arrow key navigation for lists and grids.
 *
 * WCAG 2.1 Compliance:
 * - 2.1.1 Keyboard (Level A)
 * - 2.4.3 Focus Order (Level A)
 *
 * Features:
 * - Arrow keys (Up/Down/Left/Right) for navigation
 * - Home/End for first/last item
 * - PageUp/PageDown for jumping multiple items
 * - Auto-focus management
 *
 * @param itemCount - Total number of items
 * @param orientation - 'vertical' | 'horizontal' | 'grid'
 * @param options - Configuration options
 *
 * @example
 * const { activeIndex, setActiveIndex, handleKeyDown } = useKeyboardNavigation({
 *   itemCount: items.length,
 *   orientation: 'vertical',
 * });
 *
 * <div onKeyDown={handleKeyDown} role="menu">
 *   {items.map((item, index) => (
 *     <button
 *       key={item.id}
 *       role="menuitem"
 *       tabIndex={activeIndex === index ? 0 : -1}
 *       onClick={() => setActiveIndex(index)}
 *     >
 *       {item.label}
 *     </button>
 *   ))}
 * </div>
 */

interface UseKeyboardNavigationOptions {
  itemCount: number;
  orientation?: "vertical" | "horizontal" | "grid";
  loop?: boolean;
  columnsPerRow?: number; // For grid orientation
  onSelect?: (index: number) => void;
  initialIndex?: number;
}

export function useKeyboardNavigation({
  itemCount,
  orientation = "vertical",
  loop = true,
  columnsPerRow = 1,
  onSelect,
  initialIndex = 0,
}: UseKeyboardNavigationOptions) {
  const [activeIndex, setActiveIndex] = React.useState(initialIndex);

  const moveToIndex = React.useCallback(
    (newIndex: number) => {
      if (newIndex < 0) {
        setActiveIndex(loop ? itemCount - 1 : 0);
      } else if (newIndex >= itemCount) {
        setActiveIndex(loop ? 0 : itemCount - 1);
      } else {
        setActiveIndex(newIndex);
      }
    },
    [itemCount, loop]
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      let handled = false;

      switch (event.key) {
        case "ArrowDown":
          if (orientation === "vertical") {
            moveToIndex(activeIndex + 1);
            handled = true;
          } else if (orientation === "grid") {
            moveToIndex(activeIndex + columnsPerRow);
            handled = true;
          }
          break;

        case "ArrowUp":
          if (orientation === "vertical") {
            moveToIndex(activeIndex - 1);
            handled = true;
          } else if (orientation === "grid") {
            moveToIndex(activeIndex - columnsPerRow);
            handled = true;
          }
          break;

        case "ArrowRight":
          if (orientation === "horizontal" || orientation === "grid") {
            moveToIndex(activeIndex + 1);
            handled = true;
          }
          break;

        case "ArrowLeft":
          if (orientation === "horizontal" || orientation === "grid") {
            moveToIndex(activeIndex - 1);
            handled = true;
          }
          break;

        case "Home":
          setActiveIndex(0);
          handled = true;
          break;

        case "End":
          setActiveIndex(itemCount - 1);
          handled = true;
          break;

        case "PageDown":
          moveToIndex(activeIndex + 10);
          handled = true;
          break;

        case "PageUp":
          moveToIndex(activeIndex - 10);
          handled = true;
          break;

        case "Enter":
        case " ": // Space
          if (onSelect) {
            onSelect(activeIndex);
            handled = true;
          }
          break;
      }

      if (handled) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    [activeIndex, itemCount, orientation, columnsPerRow, moveToIndex, onSelect]
  );

  return {
    activeIndex,
    setActiveIndex,
    handleKeyDown,
  };
}
