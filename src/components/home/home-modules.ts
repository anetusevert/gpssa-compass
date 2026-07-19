import {
  Globe,
  Layers,
  Package,
  Truck,
  GitCompare,
  Radio,
  Users2,
  UserCircle,
  Network,
  Scale,
  ShieldCheck,
  ClipboardCheck,
  ListChecks,
  Wrench,
  LayoutGrid,
  Gauge,
  AlertTriangle,
  LineChart,
  Target,
  Activity,
  MessageSquare,
  TrendingUp,
  Map,
  Lightbulb,
  Workflow,
  ScrollText,
  Landmark,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface HomeLink {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface HomeModule {
  id: string;
  title: string;
  subtitle: string;
  valueLine: string;
  icon: LucideIcon;
  accentVar: string;
  glowColor: string;
  primaryHref: string;
  links: HomeLink[];
  tier: "hero" | "core" | "ops";
}

export const HERO_MODULES: HomeModule[] = [
  {
    id: "atlas",
    title: "Global Atlas",
    subtitle: "World map & peer benchmarks",
    valueLine: "Set the global bar — living maturity map and dimension scorecards vs peers.",
    icon: Globe,
    accentVar: "--gpssa-green",
    glowColor: "rgba(0,168,107,0.28)",
    primaryHref: "/dashboard/atlas",
    tier: "hero",
    links: [
      { label: "World Map", href: "/dashboard/atlas", icon: Globe },
      { label: "Benchmarking", href: "/dashboard/atlas/benchmarking", icon: GitCompare },
    ],
  },
  {
    id: "mandate",
    title: "Mandate",
    subtitle: "Legal remit & RFP alignment",
    valueLine: "Ground every recommendation in GPSSA’s statutory remit and RFP GPSSA-016-2026.",
    icon: Scale,
    accentVar: "--gpssa-green",
    glowColor: "rgba(0,168,107,0.22)",
    primaryHref: "/dashboard/mandate",
    tier: "hero",
    links: [
      { label: "Mandate Hub", href: "/dashboard/mandate", icon: Landmark },
      { label: "RFP Alignment", href: "/dashboard/mandate/rfi-alignment", icon: Network },
      { label: "Legal Corpus", href: "/dashboard/mandate/legal", icon: ScrollText },
    ],
  },
];

export const CORE_MODULES: HomeModule[] = [
  {
    id: "services",
    title: "Services",
    subtitle: "Catalogue & channel capability",
    valueLine: "ILO-aligned service catalogue with channel maturity and pain-point diagnostics.",
    icon: Layers,
    accentVar: "--adl-blue",
    glowColor: "rgba(45,74,140,0.22)",
    primaryHref: "/dashboard/services/catalog",
    tier: "core",
    links: [
      { label: "Service Catalog", href: "/dashboard/services/catalog", icon: Layers },
      { label: "Channel Capabilities", href: "/dashboard/services/channels", icon: Radio },
    ],
  },
  {
    id: "products",
    title: "Products",
    subtitle: "Portfolio & segments",
    valueLine: "Core, complementary and pilot offers mapped to who is covered.",
    icon: Package,
    accentVar: "--gold",
    glowColor: "rgba(197,165,114,0.22)",
    primaryHref: "/dashboard/products/portfolio",
    tier: "core",
    links: [
      { label: "Portfolio", href: "/dashboard/products/portfolio", icon: Package },
      { label: "Segment Coverage", href: "/dashboard/products/segments", icon: Users2 },
    ],
  },
  {
    id: "delivery",
    title: "Delivery",
    subtitle: "Channels, personas & models",
    valueLine: "How benefits reach citizens — channels, personas and operating models.",
    icon: Truck,
    accentVar: "--teal",
    glowColor: "rgba(45,212,191,0.22)",
    primaryHref: "/dashboard/delivery/channels",
    tier: "core",
    links: [
      { label: "Channels", href: "/dashboard/delivery/channels", icon: Truck },
      { label: "Personas", href: "/dashboard/delivery/personas", icon: UserCircle },
      { label: "Delivery Models", href: "/dashboard/delivery/models", icon: Network },
    ],
  },
];

export const OPS_MODULES: HomeModule[] = [
  {
    id: "quality",
    title: "Quality Assurance",
    subtitle: "COPC framework & CAPA",
    valueLine: "End-to-end QA — scorecards, sampling, calibration and corrective action.",
    icon: ShieldCheck,
    accentVar: "--teal",
    glowColor: "rgba(45,212,191,0.22)",
    primaryHref: "/dashboard/quality/framework",
    tier: "ops",
    links: [
      { label: "Framework", href: "/dashboard/quality/framework", icon: ShieldCheck },
      { label: "Scorecards", href: "/dashboard/quality/scorecards", icon: ClipboardCheck },
      { label: "Reviews", href: "/dashboard/quality/reviews", icon: ListChecks },
      { label: "CAPA", href: "/dashboard/quality/capa", icon: Wrench },
    ],
  },
  {
    id: "fulfilment",
    title: "Service Fulfilment",
    subtitle: "Cases, SLA & breach",
    valueLine: "Case board, tiered SLAs and Lean cycle-time analytics.",
    icon: LayoutGrid,
    accentVar: "--amber",
    glowColor: "rgba(233,162,59,0.22)",
    primaryHref: "/dashboard/fulfilment/cases",
    tier: "ops",
    links: [
      { label: "Case Board", href: "/dashboard/fulfilment/cases", icon: LayoutGrid },
      { label: "SLA / OLA", href: "/dashboard/fulfilment/sla", icon: Gauge },
      { label: "Breach & Aging", href: "/dashboard/fulfilment/breach", icon: AlertTriangle },
      { label: "Analytics", href: "/dashboard/fulfilment/analytics", icon: LineChart },
    ],
  },
  {
    id: "performance",
    title: "Performance",
    subtitle: "KPI, VoC & benefits",
    valueLine: "KPI↔KQI catalogue, voice of customer and benefits realisation.",
    icon: Target,
    accentVar: "--gpssa-green",
    glowColor: "rgba(0,168,107,0.22)",
    primaryHref: "/dashboard/performance/catalogue",
    tier: "ops",
    links: [
      { label: "KPI / KQI", href: "/dashboard/performance/catalogue", icon: Target },
      { label: "Dashboards", href: "/dashboard/performance/dashboards", icon: Activity },
      { label: "Voice of Customer", href: "/dashboard/performance/voc", icon: MessageSquare },
      { label: "Benefits", href: "/dashboard/performance/benefits", icon: TrendingUp },
    ],
  },
  {
    id: "planning",
    title: "Roadmap & Governance",
    subtitle: "Plan, backlog & CoE",
    valueLine: "12-month roadmap, prioritised backlog, RACI and operating model.",
    icon: Map,
    accentVar: "--gold",
    glowColor: "rgba(197,165,114,0.22)",
    primaryHref: "/dashboard/planning",
    tier: "ops",
    links: [
      { label: "12-Month Roadmap", href: "/dashboard/planning", icon: Map },
      { label: "Opportunity Backlog", href: "/dashboard/planning/backlog", icon: Lightbulb },
      { label: "Governance & RACI", href: "/dashboard/planning/governance", icon: Network },
      { label: "Operating Model", href: "/dashboard/planning/operating-model", icon: Workflow },
    ],
  },
];

export const ALL_MODULES: HomeModule[] = [
  ...HERO_MODULES,
  ...CORE_MODULES,
  ...OPS_MODULES,
];

export function findModule(id: string | null): HomeModule | null {
  if (!id) return null;
  return ALL_MODULES.find((m) => m.id === id) ?? null;
}
