import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

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
      },
    ),
    { name: "UI Store" },
  ),
);
