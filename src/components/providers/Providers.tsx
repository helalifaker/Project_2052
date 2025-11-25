"use client";

import * as React from "react";
import { Toaster } from "sonner";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { KeyboardShortcutsDialog } from "@/components/layout/KeyboardShortcutsDialog";
import { useGlobalKeyboardShortcuts } from "@/lib/hooks/useKeyboardShortcuts";
import { AuthProvider } from "@/components/providers/AuthProvider";

interface ProvidersProps {
  children: React.ReactNode;
}

// Separate component to use hooks
function GlobalProviders({ children }: ProvidersProps) {
  const [shortcutsDialogOpen, setShortcutsDialogOpen] = React.useState(false);

  // Initialize global keyboard shortcuts
  useGlobalKeyboardShortcuts();

  // ? key to show keyboard shortcuts help
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
          e.preventDefault();
          setShortcutsDialogOpen((prev) => !prev);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {children}
      <CommandPalette />
      <KeyboardShortcutsDialog
        open={shortcutsDialogOpen}
        onOpenChange={setShortcutsDialogOpen}
      />
      <Toaster
        position="top-right"
        expand={false}
        richColors
        closeButton
        duration={5000}
        toastOptions={{
          style: {
            fontFamily: "var(--font-geist-sans)",
          },
        }}
      />
    </>
  );
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <GlobalProviders>{children}</GlobalProviders>
    </AuthProvider>
  );
}
