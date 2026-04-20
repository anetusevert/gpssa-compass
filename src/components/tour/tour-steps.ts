export type TourSpotTarget =
  | { kind: "center" }
  | { kind: "selector"; query: string };

export interface CompassTourStep {
  id: string;
  path: string;
  target: TourSpotTarget;
  title: string;
  subtitle: string;
}

export const COMPASS_TOUR_STEPS: CompassTourStep[] = [
  {
    id: "welcome",
    path: "/dashboard",
    target: { kind: "center" },
    title: "One command surface for pension intelligence",
    subtitle: "We built Compass so leadership sees what GPSSA delivers, how it compares, and where mandate meets execution—without switching tools.",
  },
  {
    id: "atlas-entry",
    path: "/dashboard",
    target: { kind: "selector", query: '[data-tour="compass-atlas-bar"]' },
    title: "Global evidence, on demand",
    subtitle: "The Atlas is your operating context: countries, maturity, and benchmarks. Open it whenever you need the world map or peer comparisons.",
  },
  {
    id: "pillars",
    path: "/dashboard",
    target: { kind: "selector", query: '[data-tour="compass-pillar-grid"]' },
    title: "Three lenses on the operating model",
    subtitle: "Services, Products, and Delivery are structured so teams drill from strategy to channel design—each tile expands into the modules underneath.",
  },
  {
    id: "mandate",
    path: "/dashboard",
    target: { kind: "selector", query: '[data-tour="compass-mandate-bar"]' },
    title: "Mandate, anchored in law and RFI",
    subtitle: "Legal corpus, alignment boards, and RFI traceability live here. This is how you defend scope and priorities with evidence.",
  },
  {
    id: "sidebar",
    path: "/dashboard",
    target: { kind: "selector", query: '[data-tour="compass-sidebar-nav"]' },
    title: "Persistent navigation",
    subtitle: "Every pillar stays one click away in the rail. Use it to move fast in workshops or board prep without losing place.",
  },
  {
    id: "world-map",
    path: "/dashboard/atlas",
    target: { kind: "selector", query: '[data-tour="compass-atlas-map"]' },
    title: "196 countries, one choropleth",
    subtitle: "Pick a metric, scan leaders, then drop into a country profile. The map is the executive summary; detail is one click deep.",
  },
  {
    id: "catalog",
    path: "/dashboard/services/catalog",
    target: { kind: "selector", query: '[data-tour="compass-catalog-glance"]' },
    title: "The full service portfolio, classified",
    subtitle: "ILO-aligned branches, KPIs, and benchmark rails—so you see what GPSSA runs today and how it stacks up before you redesign anything.",
  },
  {
    id: "briefing",
    path: "/dashboard",
    target: { kind: "selector", query: '[data-tour="compass-briefing"]' },
    title: "Executive Briefing, ready to present",
    subtitle: "The deck is the storyline for sponsors: evidence, gaps, and opportunities in a single narrative. Open it when you walk the room.",
  },
];

export const COMPASS_TOUR_STEP_COUNT = COMPASS_TOUR_STEPS.length;
