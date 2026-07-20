"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { EngagementPhaseId } from "./playbook";

export type NavMode = "focus" | "all";

interface EngagementState {
  phaseId: EngagementPhaseId;
  navMode: NavMode;
  engagementOpen: boolean;
  setPhaseId: (id: EngagementPhaseId) => void;
  setNavMode: (mode: NavMode) => void;
  setEngagementOpen: (open: boolean) => void;
  openDiscover: () => void;
}

export const useEngagementStore = create<EngagementState>()(
  persist(
    (set) => ({
      phaseId: "discover",
      navMode: "focus",
      engagementOpen: false,
      setPhaseId: (phaseId) => set({ phaseId }),
      setNavMode: (navMode) => set({ navMode }),
      setEngagementOpen: (engagementOpen) => set({ engagementOpen }),
      openDiscover: () =>
        set({ phaseId: "discover", engagementOpen: true, navMode: "focus" }),
    }),
    { name: "gpssa_engagement_v1" }
  )
);
