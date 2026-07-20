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
 * First-run tour: service operating spine first, then Engagement Mode journey.
 */
export const COMPASS_TOUR_STEPS: CompassTourStep[] = [
  {
    id: "welcome",
    path: "/dashboard",
    target: { kind: "center" },
    title: "This is the leave-behind working file",
    subtitle:
      "GPSSA Intelligence proves one operable service path and runs RFP GPSSA-016-2026. Start on the service spine; use Engagement Mode for the 20-week project.",
  },
  {
    id: "operating-spine",
    path: "/dashboard",
    target: { kind: "selector", query: '[data-tour="compass-operating-spine"]' },
    title: "Service operating spine",
    subtitle:
      "Episode → Journey → Process → Systems → QA. Click a node to inspect real SOP steps, cases, and CAPAs. Open blueprint for the full chain.",
  },
  {
    id: "engagement",
    path: "/dashboard",
    target: { kind: "selector", query: '[data-tour="compass-engagement"]' },
    title: "Engagement Mode is the project path",
    subtitle:
      "Open it for Discover → Evidence → Shape → Lock → Handover. What / How / Value per phase, then Start jumps to the first screen.",
  },
  {
    id: "spine",
    path: "/dashboard",
    target: {
      kind: "selector",
      query: '[data-tour="compass-engagement-spine"], [data-tour="compass-engagement-panel"]',
    },
    title: "Flow first — inventory second",
    subtitle:
      "Click a phase on the journey spine. Work only the listed screens. Sidebar Focus mirrors them.",
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
    title: "Ready to run",
    subtitle:
      "Walk the gold-path service on the spine, or open Engagement Mode in Discover for the workshop path. Sponsors: Executive Briefing.",
    finale: true,
  },
];

export const COMPASS_TOUR_STEP_COUNT = COMPASS_TOUR_STEPS.length;
