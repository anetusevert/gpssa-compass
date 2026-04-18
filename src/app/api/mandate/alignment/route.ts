import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { RFI_SECTIONS } from "@/lib/mandate/rfi-sections";

const MANDATE_CATEGORIES = ["legal-mandate", "circular", "policy"] as const;

const APP_SCREENS: { id: string; label: string; pillar: string; href: string }[] = [
  { id: "screen-services-catalog", label: "Services — Catalog", pillar: "services", href: "/dashboard/services/catalog" },
  { id: "screen-services-channels", label: "Services — Channel Capabilities", pillar: "services", href: "/dashboard/services/channels" },
  { id: "screen-products-portfolio", label: "Products — Portfolio", pillar: "products", href: "/dashboard/products/portfolio" },
  { id: "screen-products-segments", label: "Products — Segment Coverage", pillar: "products", href: "/dashboard/products/segments" },
  { id: "screen-delivery-channels", label: "Delivery — Channels", pillar: "delivery", href: "/dashboard/delivery/channels" },
  { id: "screen-delivery-personas", label: "Delivery — Personas", pillar: "delivery", href: "/dashboard/delivery/personas" },
  { id: "screen-atlas-benchmarking", label: "Atlas — Benchmarking", pillar: "atlas", href: "/dashboard/atlas/benchmarking" },
  { id: "screen-mandate-governance", label: "Mandate — Governance", pillar: "mandate", href: "/dashboard/mandate/governance" },
  { id: "screen-mandate-obligations", label: "Mandate — Obligations", pillar: "mandate", href: "/dashboard/mandate/obligations" },
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
 * board: legal articles ↔ RFI sections ↔ app screens.
 *
 * - Left column  → StandardRequirement rows (with their parent Standard)
 * - Middle column → RFI sections (the static RFI_SECTIONS catalog)
 * - Right column → curated APP_SCREENS list
 *
 * Edges:
 *   - article → screen: from StandardCompliance (computed by mandate-corpus)
 *   - article → rfi:    derived by matching requirement.pillar to RFI section pillars
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
          return rfi.relatedPillars.includes("mandate") || rfi.relatedPillars.includes("delivery");
        case "digital":
          return rfi.relatedPillars.includes("delivery");
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
