import { create } from "zustand";

interface AppState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  activeSection: string;
  setActiveSection: (s: string) => void;
}

export const useAppStore = create<AppState>()((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set({ sidebarCollapsed: false }),
  setSidebarCollapsed: () => set({ sidebarCollapsed: false }),
  activeSection: "dashboard",
  setActiveSection: (s) => set({ activeSection: s }),
}));
