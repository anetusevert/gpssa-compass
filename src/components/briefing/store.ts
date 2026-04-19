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

// ─── Comparator picker ────────────────────────────────────────────────────

/** Type of entity that can be added to a comparator slot. */
export type ComparatorKind = "country" | "institution" | "standard" | "aggregate";

export interface ComparatorRef {
  /** Stable id (`${kind}:${slug-or-iso3-or-id}`). */
  id: string;
  kind: ComparatorKind;
  /** Display name. */
  label: string;
  /** Optional subtitle (region, country, scope). */
  sublabel?: string;
  /** Optional emoji flag for countries. */
  flag?: string;
  /** Assigned color hex (one of COMPARATOR_COLORS). */
  color: string;
}

export type SlideKey = "slide5" | "slide7";

/** Curated palette assigned in order. UAE/GPSSA always green so excluded here. */
export const COMPARATOR_COLORS = [
  "#3b82f6", // blue
  "#a855f7", // purple
  "#f59e0b", // amber
  "#ef4444", // red
];

const MAX_SELECTIONS = 4;

interface ComparatorState {
  slide5: ComparatorRef[];
  slide7: ComparatorRef[];
  pickerOpen: boolean;
  /** Which slide invoked the picker, used to route add/remove. */
  pickerSlide: SlideKey;
  openPicker: (slide: SlideKey) => void;
  closePicker: () => void;
  add: (slide: SlideKey, ref: Omit<ComparatorRef, "color">) => void;
  remove: (slide: SlideKey, id: string) => void;
  reset: (slide: SlideKey, refs: ComparatorRef[]) => void;
  toggle: (slide: SlideKey, ref: Omit<ComparatorRef, "color">) => void;
}

function nextColor(existing: ComparatorRef[]): string {
  const used = new Set(existing.map((r) => r.color));
  for (const c of COMPARATOR_COLORS) {
    if (!used.has(c)) return c;
  }
  // All 4 colors used — fall back to the oldest (caller will bump the
  // oldest ref out, freeing its color).
  return COMPARATOR_COLORS[0];
}

export const useComparatorStore = create<ComparatorState>((set, get) => ({
  slide5: [],
  slide7: [],
  pickerOpen: false,
  pickerSlide: "slide5",
  openPicker: (slide) => set({ pickerOpen: true, pickerSlide: slide }),
  closePicker: () => set({ pickerOpen: false }),
  add: (slide, ref) =>
    set((state) => {
      const list = state[slide];
      if (list.some((r) => r.id === ref.id)) return state;
      let next = list;
      if (next.length >= MAX_SELECTIONS) {
        // bump the oldest (front of the list)
        next = next.slice(1);
      }
      const colored: ComparatorRef = { ...ref, color: nextColor(next) };
      return { ...state, [slide]: [...next, colored] } as Partial<ComparatorState> as ComparatorState;
    }),
  remove: (slide, id) =>
    set((state) => ({
      ...state,
      [slide]: state[slide].filter((r) => r.id !== id),
    })),
  reset: (slide, refs) =>
    set((state) => {
      // Re-color in order so colors are deterministic on reset.
      const colored = refs.slice(0, MAX_SELECTIONS).map((r, i) => ({
        ...r,
        color: COMPARATOR_COLORS[i % COMPARATOR_COLORS.length],
      }));
      return { ...state, [slide]: colored };
    }),
  toggle: (slide, ref) => {
    const list = get()[slide];
    if (list.some((r) => r.id === ref.id)) {
      get().remove(slide, ref.id);
    } else {
      get().add(slide, ref);
    }
  },
}));
