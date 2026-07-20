export type TourSpotTarget =
  | { kind: "center" }
  | { kind: "selector"; query: string };

export interface CompassTourStep {
  id: string;
  path: string;
  target: TourSpotTarget;
  title: string;
  subtitle: string;
  /** Final step: Engagement Mode + Briefing CTAs, no Next button */
  finale?: boolean;
}

/**
 * First-run tour: journey spine, What/How/Value, Morph stage — then Engagement Mode.
 */
export const COMPASS_TOUR_STEPS: CompassTourStep[] = [
  {
    id: "welcome",
    path: "/dashboard",
    target: { kind: "center" },
    title: "This is the engagement working file",
    subtitle:
      "GPSSA Intelligence runs RFP GPSSA-016-2026. You don’t explore thirty screens — you walk a journey: Discover → Evidence → Shape → Lock → Handover.",
  },
  {
    id: "engagement",
    path: "/dashboard",
    target: { kind: "selector", query: '[data-tour="compass-engagement"]' },
    title: "Engagement Mode is your home base",
    subtitle:
      "Open it to see the journey spine. Each phase tells you What to do, How to use Compass, and the Value — then Start jumps to the first screen.",
  },
  {
    id: "spine",
    path: "/dashboard",
    target: { kind: "selector", query: '[data-tour="compass-engagement-spine"], [data-tour="compass-engagement-panel"]' },
    title: "Flow first — inventory second",
    subtitle:
      "Click a phase on the spine. Read What / How / Value. Work only the listed screens. Sidebar Focus mirrors them.",
  },
  {
    id: "morph",
    path: "/dashboard",
    target: { kind: "selector", query: '[data-tour="compass-focus-stage"]' },
    title: "The stage morphs with you",
    subtitle:
      "The living form shifts with your phase (and with hovered modules when Engagement Mode is closed). Atmosphere that tracks where you are.",
  },
  {
    id: "sidebar",
    path: "/dashboard",
    target: { kind: "selector", query: '[data-tour="compass-sidebar-nav"]' },
    title: "Focus nav cuts the noise",
    subtitle:
      "Focus shows this phase only. Switch to All modules when you need the full rail — not before.",
  },
  {
    id: "finale",
    path: "/dashboard",
    target: { kind: "center" },
    title: "Ready to run the project",
    subtitle:
      "Start Engagement Mode in Discover for the workshop path, or open the Executive Briefing for sponsors.",
    finale: true,
  },
];

export const COMPASS_TOUR_STEP_COUNT = COMPASS_TOUR_STEPS.length;
