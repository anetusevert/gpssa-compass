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
    title: "One operating system for pension intelligence",
    subtitle:
      "GPSSA Intelligence puts mandate, global benchmarks, portfolio design and operational excellence on a single command surface—no tool-switching.",
  },
  {
    id: "atlas-entry",
    path: "/dashboard",
    target: { kind: "selector", query: '[data-tour="compass-atlas-bar"]' },
    title: "Global evidence, on demand",
    subtitle:
      "The Atlas is your operating context: countries, maturity, and peer benchmarks. Hover to preview; click to enter the world map.",
  },
  {
    id: "mandate-entry",
    path: "/dashboard",
    target: { kind: "selector", query: '[data-tour="compass-mandate-bar"]' },
    title: "Mandate-grounded decisions",
    subtitle:
      "Every recommendation sits on GPSSA’s statutory remit and RFI alignment—open the Mandate hub when you need legal traceability.",
  },
  {
    id: "pillars",
    path: "/dashboard",
    target: { kind: "selector", query: '[data-tour="compass-pillar-grid"]' },
    title: "Core portfolio lenses",
    subtitle:
      "Services, Products, and Delivery — drill from catalogue to channels, segments and personas. Hover any tile to preview deep links in the focus stage.",
  },
  {
    id: "ops",
    path: "/dashboard",
    target: { kind: "selector", query: '[data-tour="compass-ops-grid"]' },
    title: "Operational excellence",
    subtitle:
      "Quality, Fulfilment, Performance and Roadmap & Governance — the Workstream B layer that turns strategy into assured delivery.",
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
      "Stack institutions, dimensions, and evidence here—so you quantify gaps before you commit the narrative.",
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
      "A twelve-slide McKinsey-grade pitch of what Compass does for GPSSA—live data, cinematic motion, ready for the room.",
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
