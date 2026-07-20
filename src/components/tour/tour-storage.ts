/** Bumped when tour structure changes so returning users see the new path. */
export const COMPASS_TOUR_STORAGE_KEY = "gpssa_compass_tour_v3" as const;

export type TourCompletionStatus = "done" | "skipped";

export function readTourCompletion(): TourCompletionStatus | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(COMPASS_TOUR_STORAGE_KEY);
  if (v === "done" || v === "skipped") return v;
  return null;
}

export function writeTourCompletion(status: TourCompletionStatus) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(COMPASS_TOUR_STORAGE_KEY, status);
}

export function shouldAutoStartTour(): boolean {
  return readTourCompletion() === null;
}
