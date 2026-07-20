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
 * Shortened onboarding: sell the three jobs, then land in Engagement Mode.
 * Deep feature tours are out — the playbook replaces them.
 */
export const COMPASS_TOUR_STEPS: CompassTourStep[] = [
  {
    id: "welcome",
    path: "/dashboard",
    target: { kind: "center" },
    title: "This is the engagement working file",
    subtitle:
      "GPSSA Intelligence runs RFP GPSSA-016-2026 — diagnose the estate, decide the roadmap, design/pilot QA & fulfilment. It is not a museum of thirty screens.",
  },
  {
    id: "engagement",
    path: "/dashboard",
    target: { kind: "selector", query: '[data-tour="compass-engagement"]' },
    title: "Start in Engagement Mode",
    subtitle:
      "Open Engagement Mode, pick the RFP phase you are in (Discover → Evidence → Shape → Lock → Handover), and work only those three to five screens.",
  },
  {
    id: "mandate-entry",
    path: "/dashboard",
    target: { kind: "selector", query: '[data-tour="compass-mandate-bar"]' },
    title: "Every call needs a mandate / RFP anchor",
    subtitle:
      "Recommendations stay tied to GPSSA’s statutory remit and RFP alignment — open Mandate when you need legal traceability.",
  },
  {
    id: "ops",
    path: "/dashboard",
    target: { kind: "selector", query: '[data-tour="compass-ops-grid"]' },
    title: "Three jobs, not every module",
    subtitle:
      "Quality, Fulfilment, Performance and Planning are the Workstream B / roadmap layer. Use them when the phase asks — ignore them until then.",
  },
  {
    id: "sidebar",
    path: "/dashboard",
    target: { kind: "selector", query: '[data-tour="compass-sidebar-nav"]' },
    title: "Focus nav cuts the noise",
    subtitle:
      "Sidebar Focus mode mirrors the current engagement phase. Switch to All modules only when you need the full catalogue.",
  },
  {
    id: "catalog",
    path: "/dashboard/services/catalog",
    target: { kind: "selector", query: '[data-tour="compass-catalog-glance"]' },
    title: "Job 1 — Diagnose starts here",
    subtitle:
      "Service catalogue is the discovery baseline. Capture workshop notes, then move via the Next action bar — not by wandering the rail.",
  },
  {
    id: "finale",
    path: "/dashboard",
    target: { kind: "center" },
    title: "Ready to run the project",
    subtitle:
      "Start Engagement Mode in Discover for the workshop path, or open the Executive Briefing when you need the sponsor pitch.",
    finale: true,
  },
];

export const COMPASS_TOUR_STEP_COUNT = COMPASS_TOUR_STEPS.length;
