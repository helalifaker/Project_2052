import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { useEffect, useState } from "react";

interface UIState {
  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Modals
  activeModal: string | null;
  openModal: (modalId: string) => void;
  closeModal: () => void;

  // Command Palette
  commandPaletteOpen: boolean;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;

  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  loadingMessage: string | null;
  setLoadingMessage: (message: string | null) => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        // Sidebar
        sidebarCollapsed: false,
        toggleSidebar: () =>
          set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
        setSidebarCollapsed: (collapsed) =>
          set({ sidebarCollapsed: collapsed }),

        // Modals
        activeModal: null,
        openModal: (modalId) => set({ activeModal: modalId }),
        closeModal: () => set({ activeModal: null }),

        // Command Palette
        commandPaletteOpen: false,
        toggleCommandPalette: () =>
          set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
        setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

        // Loading states
        isLoading: false,
        setIsLoading: (loading) => set({ isLoading: loading }),
        loadingMessage: null,
        setLoadingMessage: (message) => set({ loadingMessage: message }),
      }),
      {
        name: "ui-storage",
        partialize: (state) => ({
          sidebarCollapsed: state.sidebarCollapsed,
        }),
        // Skip automatic hydration to prevent SSR/client mismatch
        // This prevents the app from hanging during hard refresh
        skipHydration: true,
      },
    ),
    { name: "UI Store" },
  ),
);

/**
 * Manually rehydrate the UI store
 * Call this in a useEffect on the client side only
 */
export function rehydrateUIStore(): void {
  if (typeof window !== "undefined") {
    useUIStore.persist.rehydrate();
  }
}

/**
 * Hook to track hydration status of the UI store
 * Returns true once the store has been rehydrated from localStorage
 */
export function useUIStoreHydration(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Rehydrate the store and mark as hydrated
    useUIStore.persist.rehydrate();
    // Defer state update to avoid synchronous setState within effect
    queueMicrotask(() => {
      setHydrated(true);
    });
  }, []);

  return hydrated;
}
