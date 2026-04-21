export type TourSpotTarget =
  | { kind: "center" }
  | { kind: "selector"; query: string };

export interface CompassTourStep {
  id: string;
  path: string;
  target: TourSpotTarget;
  title: string;
  subtitle: string;
  /** Final step: two CTAs (Executive Briefing vs explore app), no Next button */
  finale?: boolean;
}

export const COMPASS_TOUR_STEPS: CompassTourStep[] = [
  {
    id: "welcome",
    path: "/dashboard",
    target: { kind: "center" },
    title: "One command surface for pension intelligence",
    subtitle:
      "GPSSA Intelligence gives leadership a single view of what you deliver, how you benchmark globally, and where mandate meets execution—without switching tools.",
  },
  {
    id: "atlas-entry",
    path: "/dashboard",
    target: { kind: "selector", query: '[data-tour="compass-atlas-bar"]' },
    title: "Global evidence, on demand",
    subtitle:
      "The Atlas is your operating context: countries, maturity, and benchmarks. Open it whenever you need the world map or peer comparisons.",
  },
  {
    id: "pillars",
    path: "/dashboard",
    target: { kind: "selector", query: '[data-tour="compass-pillar-grid"]' },
    title: "Three lenses on the operating model",
    subtitle:
      "Services, Products, and Delivery are structured so teams drill from strategy to channel design—each tile expands into the modules underneath.",
  },
  {
    id: "sidebar",
    path: "/dashboard",
    target: { kind: "selector", query: '[data-tour="compass-sidebar-nav"]' },
    title: "Persistent navigation",
    subtitle:
      "Every pillar stays one click away in the rail. Use it to move fast in workshops or board prep without losing place.",
  },
  {
    id: "world-map",
    path: "/dashboard/atlas",
    target: { kind: "selector", query: '[data-tour="compass-atlas-map"]' },
    title: "196 countries, one choropleth",
    subtitle:
      "Pick a metric, scan leaders, then drop into a country profile. The map is the executive summary; detail is one click deep.",
  },
  {
    id: "benchmarking",
    path: "/dashboard/atlas/benchmarking",
    target: { kind: "selector", query: '[data-tour="compass-benchmark-workspace"]' },
    title: "Benchmarks you can defend",
    subtitle:
      "GPSSA Intelligence stacks institutions, dimensions, and evidence here—so you quantify gaps before you commit the narrative.",
  },
  {
    id: "catalog",
    path: "/dashboard/services/catalog",
    target: { kind: "selector", query: '[data-tour="compass-catalog-glance"]' },
    title: "The full service portfolio, classified",
    subtitle:
      "ILO-aligned branches, KPIs, and benchmark rails—see what GPSSA runs today and how it stacks up before you redesign anything.",
  },
  {
    id: "portfolio",
    path: "/dashboard/products/portfolio",
    target: { kind: "selector", query: '[data-tour="compass-products-portfolio"]' },
    title: "Products, tiered and comparable",
    subtitle:
      "Portfolio view ties core, complementary, and pilot offers to segments and mandate—then lets you contrast international peers in one cockpit.",
  },
  {
    id: "personas",
    path: "/dashboard/delivery/personas",
    target: { kind: "selector", query: '[data-tour="compass-personas-surface"]' },
    title: "Delivery through real people",
    subtitle:
      "Ten personas encode coverage and channel reality—how segments experience GPSSA today, and where journeys still break.",
  },
  {
    id: "mandate-rfi",
    path: "/dashboard/mandate/rfi-alignment",
    target: { kind: "selector", query: '[data-tour="compass-mandate-rfi"]' },
    title: "Mandate meets RFI",
    subtitle:
      "Statutory articles, RFI sections, and application pillars connect here—traceability you can take into governance or sponsor reviews.",
  },
  {
    id: "briefing",
    path: "/dashboard",
    target: { kind: "selector", query: '[data-tour="compass-briefing"]' },
    title: "Executive Briefing, ready to present",
    subtitle:
      "The deck is the sponsor storyline for GPSSA Intelligence: evidence, gaps, and opportunities in one flow. Open it when you walk the room.",
  },
  {
    id: "finale",
    path: "/dashboard",
    target: { kind: "center" },
    title: "GPSSA Intelligence is ready when you are",
    subtitle:
      "Open the Executive Briefing to present with the deck, or step straight into the application and keep working.",
    finale: true,
  },
];

export const COMPASS_TOUR_STEP_COUNT = COMPASS_TOUR_STEPS.length;
