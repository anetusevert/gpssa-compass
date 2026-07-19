import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { RFI_SECTIONS } from "@/lib/mandate/rfi-sections";

const MANDATE_CATEGORIES = ["legal-mandate", "circular", "policy"] as const;

/** Curated app screens that appear in the right-hand alignment column. */
const APP_SCREENS: { id: string; label: string; pillar: string; href: string }[] = [
  // Command
  { id: "screen-home", label: "Command — Home & Briefing", pillar: "mandate", href: "/dashboard" },

  // Services / Products / Delivery
  { id: "screen-services-catalog", label: "Services — Catalog", pillar: "services", href: "/dashboard/services/catalog" },
  { id: "screen-services-channels", label: "Services — Channel Capabilities", pillar: "services", href: "/dashboard/services/channels" },
  { id: "screen-products-portfolio", label: "Products — Portfolio", pillar: "products", href: "/dashboard/products/portfolio" },
  { id: "screen-products-segments", label: "Products — Segment Coverage", pillar: "products", href: "/dashboard/products/segments" },
  { id: "screen-delivery-channels", label: "Delivery — Channels", pillar: "delivery", href: "/dashboard/delivery/channels" },
  { id: "screen-delivery-personas", label: "Delivery — Personas", pillar: "delivery", href: "/dashboard/delivery/personas" },

  // Atlas
  { id: "screen-atlas-hub", label: "Atlas — World Map", pillar: "atlas", href: "/dashboard/atlas" },
  { id: "screen-atlas-benchmarking", label: "Atlas — Benchmarking", pillar: "atlas", href: "/dashboard/atlas/benchmarking" },

  // Mandate
  { id: "screen-mandate-hub", label: "Mandate — Legal & Governance", pillar: "mandate", href: "/dashboard/mandate" },
  { id: "screen-mandate-governance", label: "Mandate — Governance", pillar: "mandate", href: "/dashboard/mandate/governance" },

  // Quality (Workstream B)
  { id: "screen-quality-framework", label: "Quality — Framework", pillar: "quality", href: "/dashboard/quality/framework" },
  { id: "screen-quality-scorecards", label: "Quality — Scorecards", pillar: "quality", href: "/dashboard/quality/scorecards" },
  { id: "screen-quality-reviews", label: "Quality — Reviews", pillar: "quality", href: "/dashboard/quality/reviews" },
  { id: "screen-quality-calibration", label: "Quality — Calibration", pillar: "quality", href: "/dashboard/quality/calibration" },
  { id: "screen-quality-taxonomy", label: "Quality — Error Taxonomy", pillar: "quality", href: "/dashboard/quality/taxonomy" },
  { id: "screen-quality-capa", label: "Quality — CAPA", pillar: "quality", href: "/dashboard/quality/capa" },

  // Fulfilment
  { id: "screen-fulfilment-cases", label: "Fulfilment — Cases", pillar: "fulfilment", href: "/dashboard/fulfilment/cases" },
  { id: "screen-fulfilment-sla", label: "Fulfilment — SLA / OLA", pillar: "fulfilment", href: "/dashboard/fulfilment/sla" },
  { id: "screen-fulfilment-breach", label: "Fulfilment — Breach", pillar: "fulfilment", href: "/dashboard/fulfilment/breach" },
  { id: "screen-fulfilment-analytics", label: "Fulfilment — Analytics", pillar: "fulfilment", href: "/dashboard/fulfilment/analytics" },

  // Performance
  { id: "screen-performance-voc", label: "Performance — Voice of Customer", pillar: "performance", href: "/dashboard/performance/voc" },
  { id: "screen-performance-catalogue", label: "Performance — KPI / KQI Catalogue", pillar: "performance", href: "/dashboard/performance/catalogue" },
  { id: "screen-performance-dashboards", label: "Performance — Dashboards", pillar: "performance", href: "/dashboard/performance/dashboards" },
  { id: "screen-performance-benefits", label: "Performance — Benefits Realisation", pillar: "performance", href: "/dashboard/performance/benefits" },

  // Planning (Roadmap & Governance)
  { id: "screen-planning-hub", label: "Planning — 12-Month Roadmap", pillar: "planning", href: "/dashboard/planning" },
  { id: "screen-planning-backlog", label: "Planning — Opportunity Backlog", pillar: "planning", href: "/dashboard/planning/backlog" },
  { id: "screen-planning-governance", label: "Planning — Governance", pillar: "planning", href: "/dashboard/planning/governance" },
  { id: "screen-planning-operating-model", label: "Planning — Operating Model", pillar: "planning", href: "/dashboard/planning/operating-model" },
];

const ENTITY_TYPE_TO_SCREEN: Record<string, string[]> = {
  "gpssa-service": ["screen-services-catalog", "screen-services-channels"],
  product: ["screen-products-portfolio"],
  segment: ["screen-products-segments"],
  "delivery-channel": ["screen-delivery-channels"],
  persona: ["screen-delivery-personas"],
};

/**
 * GET /api/mandate/alignment
 *
 * Returns the join payload powering the three-column cinematic alignment
 * board: legal articles ↔ RFP sections ↔ app screens.
 *
 * - Left column  → StandardRequirement rows (with their parent Standard)
 * - Middle column → RFP sections (the static RFI_SECTIONS catalog)
 * - Right column → curated APP_SCREENS list
 *
 * Edges:
 *   - article → screen: from StandardCompliance (computed by mandate-corpus)
 *   - article → rfi:    derived by matching requirement.pillar to RFP section pillars
 *   - rfi → screen:     from RfiSection.relatedScreens
 */
export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  const requirements = await prisma.standardRequirement.findMany({
    where: { standard: { region: "AE", category: { in: [...MANDATE_CATEGORIES] }, isActive: true } },
    orderBy: [{ sortOrder: "asc" }],
    include: {
      standard: { select: { id: true, slug: true, code: true, title: true, category: true } },
      scores: {
        where: { compliance: { computedBy: "agent:mandate-corpus" } },
        include: {
          compliance: {
            select: { entityType: true, entityId: true, entityLabel: true, rationale: true },
          },
        },
      },
    },
  });

  const articles = requirements.map((r) => {
    const screenLinks = new Map<string, { screenId: string; rationale?: string | null; entityLabel?: string | null }>();
    for (const item of r.scores) {
      const c = item.compliance;
      const targets = ENTITY_TYPE_TO_SCREEN[c.entityType] ?? [];
      for (const screenId of targets) {
        if (!screenLinks.has(screenId)) {
          screenLinks.set(screenId, { screenId, rationale: c.rationale, entityLabel: c.entityLabel });
        }
      }
    }
    const rfiPillarMatches = RFI_SECTIONS.filter((rfi) => {
      if (!r.pillar) return false;
      switch (r.pillar) {
        case "registration":
        case "contribution":
        case "complaint":
        case "advisory":
          return rfi.relatedPillars.includes("services");
        case "pension":
        case "end-of-service":
        case "death":
        case "injury":
        case "gcc":
          return rfi.relatedPillars.includes("products") || rfi.relatedPillars.includes("services");
        case "governance":
        case "transparency":
          return (
            rfi.relatedPillars.includes("mandate") ||
            rfi.relatedPillars.includes("delivery") ||
            rfi.relatedPillars.includes("planning") ||
            rfi.relatedPillars.includes("quality")
          );
        case "digital":
          return (
            rfi.relatedPillars.includes("delivery") ||
            rfi.relatedPillars.includes("fulfilment") ||
            rfi.relatedPillars.includes("performance")
          );
        default:
          return false;
      }
    });

    return {
      id: r.id,
      slug: r.slug,
      code: r.code,
      title: r.title,
      pillar: r.pillar,
      description: r.description,
      standard: r.standard,
      screenLinks: Array.from(screenLinks.values()),
      rfiSectionIds: rfiPillarMatches.map((rfi) => rfi.id),
    };
  });

  return NextResponse.json({
    articles,
    rfiSections: RFI_SECTIONS,
    appScreens: APP_SCREENS,
  });
}
