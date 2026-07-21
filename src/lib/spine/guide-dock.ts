import type { LucideIcon } from "lucide-react";
import {
  ClipboardCheck,
  Gauge,
  Globe,
  LayoutGrid,
  Layers,
  Lightbulb,
  ListChecks,
  Map,
  Scale,
  ShieldCheck,
  Truck,
  UserCircle,
  Workflow,
  Wrench,
} from "lucide-react";
import type { SpineNodeId } from "./types";

export type GuideTile = {
  id: string;
  label: string;
  hint: string;
  href: string;
  icon: LucideIcon;
  accentVar: string;
};

/** Contextual guide tiles for the selected spine planet. */
export const GUIDE_TILES: Record<SpineNodeId, GuideTile[]> = {
  episode: [
    {
      id: "catalog",
      label: "Catalog",
      hint: "Service catalogue",
      href: "/dashboard/services/catalog",
      icon: Layers,
      accentVar: "--adl-blue",
    },
    {
      id: "blueprint",
      label: "Blueprint",
      hint: "Operating spine detail",
      href: "/dashboard/services/operating",
      icon: Workflow,
      accentVar: "--gpssa-green",
    },
    {
      id: "mandate",
      label: "Mandate",
      hint: "Legal remit & RFP",
      href: "/dashboard/mandate",
      icon: Scale,
      accentVar: "--gpssa-green",
    },
    {
      id: "personas",
      label: "Profile",
      hint: "Full customer research",
      href: "/dashboard/delivery/personas",
      icon: UserCircle,
      accentVar: "--teal",
    },
  ],
  journey: [
    {
      id: "channels",
      label: "Channels",
      hint: "Delivery paths",
      href: "/dashboard/delivery/channels",
      icon: Truck,
      accentVar: "--teal",
    },
    {
      id: "atlas",
      label: "Atlas",
      hint: "Peer research",
      href: "/dashboard/atlas",
      icon: Globe,
      accentVar: "--gpssa-green",
    },
    {
      id: "blueprint",
      label: "Blueprint",
      hint: "Journey stages live here",
      href: "/dashboard/services/operating",
      icon: Workflow,
      accentVar: "--gpssa-green",
    },
    {
      id: "personas",
      label: "Profile",
      hint: "Full customer research",
      href: "/dashboard/delivery/personas",
      icon: UserCircle,
      accentVar: "--teal",
    },
  ],
  process: [
    {
      id: "blueprint",
      label: "Blueprint",
      hint: "SOP & process",
      href: "/dashboard/services/operating",
      icon: Workflow,
      accentVar: "--gpssa-green",
    },
    {
      id: "ops-model",
      label: "Ops model",
      hint: "CoE & operating model",
      href: "/dashboard/planning/operating-model",
      icon: Map,
      accentVar: "--gold",
    },
    {
      id: "backlog",
      label: "Backlog",
      hint: "Prioritised opportunities",
      href: "/dashboard/planning/backlog",
      icon: Lightbulb,
      accentVar: "--gold",
    },
    {
      id: "catalog",
      label: "Catalog",
      hint: "Service estate",
      href: "/dashboard/services/catalog",
      icon: Layers,
      accentVar: "--adl-blue",
    },
  ],
  systems: [
    {
      id: "cases",
      label: "Cases",
      hint: "Fulfilment board",
      href: "/dashboard/fulfilment/cases",
      icon: LayoutGrid,
      accentVar: "--amber",
    },
    {
      id: "sla",
      label: "SLA",
      hint: "Tiered targets",
      href: "/dashboard/fulfilment/sla",
      icon: Gauge,
      accentVar: "--amber",
    },
    {
      id: "analytics",
      label: "Analytics",
      hint: "Cycle time & sigma",
      href: "/dashboard/fulfilment/analytics",
      icon: LayoutGrid,
      accentVar: "--amber",
    },
    {
      id: "blueprint",
      label: "Blueprint",
      hint: "System links",
      href: "/dashboard/services/operating",
      icon: Workflow,
      accentVar: "--gpssa-green",
    },
  ],
  qa: [
    {
      id: "scorecards",
      label: "Scorecards",
      hint: "QA criteria",
      href: "/dashboard/quality/scorecards",
      icon: ClipboardCheck,
      accentVar: "--teal",
    },
    {
      id: "capa",
      label: "CAPA",
      hint: "Corrective action",
      href: "/dashboard/quality/capa",
      icon: Wrench,
      accentVar: "--teal",
    },
    {
      id: "reviews",
      label: "Reviews",
      hint: "Live sampling",
      href: "/dashboard/quality/reviews",
      icon: ListChecks,
      accentVar: "--teal",
    },
    {
      id: "framework",
      label: "Framework",
      hint: "COPC QA model",
      href: "/dashboard/quality/framework",
      icon: ShieldCheck,
      accentVar: "--teal",
    },
  ],
};

export function guideTilesFor(
  node: SpineNodeId,
  personaKey?: string | null
): GuideTile[] {
  const tiles = GUIDE_TILES[node] ?? GUIDE_TILES.episode;
  if (!personaKey) return tiles;
  return tiles.map((t) =>
    t.id === "personas"
      ? { ...t, href: `/dashboard/delivery/personas?persona=${personaKey}` }
      : t
  );
}
