"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/lib/stores/ui-store";

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
  global?: boolean; // If true, works even when input is focused
}

// Check if an element is an input-like element
function isInputElement(element: Element | null): boolean {
  if (!element) return false;
  const tagName = element.tagName.toLowerCase();
  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    (element as HTMLElement).isContentEditable
  );
}

// Hook for using a single keyboard shortcut
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: {
    ctrl?: boolean;
    meta?: boolean;
    shift?: boolean;
    alt?: boolean;
    enabled?: boolean;
    global?: boolean;
  } = {},
) {
  const {
    ctrl = false,
    meta = false,
    shift = false,
    alt = false,
    enabled = true,
    global = false,
  } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if we're in an input and this isn't a global shortcut
      if (!global && isInputElement(document.activeElement)) {
        return;
      }

      // Check modifier keys
      const ctrlMatch = ctrl ? event.ctrlKey : !event.ctrlKey;
      const metaMatch = meta ? event.metaKey : !event.metaKey;
      const shiftMatch = shift ? event.shiftKey : !event.shiftKey;
      const altMatch = alt ? event.altKey : !event.altKey;

      // Check if the key matches (case-insensitive)
      const keyMatch = event.key.toLowerCase() === key.toLowerCase();

      if (keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [key, ctrl, meta, shift, alt, enabled, global, callback]);
}

// Hook for managing multiple keyboard shortcuts
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        // Skip if we're in an input and this isn't a global shortcut
        if (!shortcut.global && isInputElement(document.activeElement)) {
          continue;
        }

        // Check modifier keys
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey : !event.ctrlKey;
        const metaMatch = shortcut.meta ? event.metaKey : !event.metaKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;

        // Check if the key matches (case-insensitive)
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch) {
          event.preventDefault();
          shortcut.action();
          return;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}

// Pre-configured global shortcuts hook
export function useGlobalKeyboardShortcuts() {
  const router = useRouter();
  const { setCommandPaletteOpen, toggleSidebar } = useUIStore();

  const shortcuts: KeyboardShortcut[] = [
    // Command palette (Cmd+K or Ctrl+K)
    {
      key: "k",
      meta: true,
      description: "Open command palette",
      action: () => setCommandPaletteOpen(true),
      global: true,
    },
    {
      key: "k",
      ctrl: true,
      description: "Open command palette",
      action: () => setCommandPaletteOpen(true),
      global: true,
    },

    // Navigation shortcuts (with Cmd/Ctrl modifier)
    {
      key: "d",
      meta: true,
      shift: true,
      description: "Go to Dashboard",
      action: () => router.push("/dashboard"),
      global: false,
    },
    {
      key: "p",
      meta: true,
      shift: true,
      description: "Go to Proposals",
      action: () => router.push("/proposals"),
      global: false,
    },
    {
      key: "n",
      meta: true,
      shift: true,
      description: "Create New Proposal",
      action: () => router.push("/proposals/new"),
      global: false,
    },

    // UI toggles
    {
      key: "/",
      meta: true,
      description: "Toggle sidebar",
      action: toggleSidebar,
      global: false,
    },
    {
      key: "/",
      ctrl: true,
      description: "Toggle sidebar",
      action: toggleSidebar,
      global: false,
    },

    // Escape to close modals (handled in CommandPalette)
  ];

  useKeyboardShortcuts(shortcuts);
}

// Utility to format shortcut for display
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];

  // Detect OS for proper modifier display
  const isMac =
    typeof window !== "undefined" &&
    navigator.platform.toUpperCase().indexOf("MAC") >= 0;

  if (shortcut.ctrl) {
    parts.push(isMac ? "⌃" : "Ctrl");
  }
  if (shortcut.meta) {
    parts.push(isMac ? "⌘" : "Ctrl");
  }
  if (shortcut.shift) {
    parts.push(isMac ? "⇧" : "Shift");
  }
  if (shortcut.alt) {
    parts.push(isMac ? "⌥" : "Alt");
  }

  // Format the key
  const keyDisplay =
    shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key;
  parts.push(keyDisplay);

  return parts.join(isMac ? "" : "+");
}

// Keyboard shortcuts help data
export const keyboardShortcutsHelp = [
  {
    category: "Navigation",
    shortcuts: [
      { keys: ["⌘", "K"], description: "Open command palette" },
      { keys: ["⌘", "⇧", "D"], description: "Go to Dashboard" },
      { keys: ["⌘", "⇧", "P"], description: "Go to Proposals" },
      { keys: ["⌘", "⇧", "N"], description: "Create new proposal" },
    ],
  },
  {
    category: "Actions",
    shortcuts: [
      { keys: ["⌘", "/"], description: "Toggle sidebar" },
      { keys: ["Esc"], description: "Close dialog/modal" },
    ],
  },
];
