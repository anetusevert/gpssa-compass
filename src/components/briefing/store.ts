"use client";

import { create } from "zustand";

interface BriefingState {
  open: boolean;
  openDeck: () => void;
  closeDeck: () => void;
  toggleDeck: () => void;
}

export const useBriefingStore = create<BriefingState>((set) => ({
  open: false,
  openDeck: () => set({ open: true }),
  closeDeck: () => set({ open: false }),
  toggleDeck: () => set((s) => ({ open: !s.open })),
}));
