import { create } from "zustand";
import { writeTourCompletion } from "./tour-storage";

export interface CompassTourState {
  active: boolean;
  stepIndex: number;
  suppressTransitionLoader: boolean;
  start: (fromStep?: number) => void;
  replay: () => void;
  closeSkip: () => void;
  complete: () => void;
  setStepIndex: (i: number) => void;
  setSuppressTransitionLoader: (v: boolean) => void;
}

export const useCompassTourStore = create<CompassTourState>((set) => ({
  active: false,
  stepIndex: 0,
  suppressTransitionLoader: false,

  start: (fromStep = 0) =>
    set({ active: true, stepIndex: fromStep, suppressTransitionLoader: false }),

  replay: () =>
    set({ active: true, stepIndex: 0, suppressTransitionLoader: false }),

  closeSkip: () => {
    writeTourCompletion("skipped");
    set({
      active: false,
      stepIndex: 0,
      suppressTransitionLoader: false,
    });
  },

  complete: () => {
    writeTourCompletion("done");
    set({
      active: false,
      stepIndex: 0,
      suppressTransitionLoader: false,
    });
  },

  setStepIndex: (i) => set({ stepIndex: i }),

  setSuppressTransitionLoader: (v) => set({ suppressTransitionLoader: v }),
}));
