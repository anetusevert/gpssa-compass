/**
 * Canonical Product Tier Taxonomy
 *
 * Three-tier model that maps directly onto the ILO Recommendation 202
 * Social Protection Floors framework. Every product in the portfolio
 * sits in exactly one tier.
 *
 *   • Statutory       (formerly "Core")          → mandatory, contributory or non-contributory floor
 *   • Supplementary   (formerly "Complementary") → second-pillar voluntary or hybrid coverage
 *   • Innovative      (formerly "Non-Core")      → emerging, third-pillar or partnership products
 */

export interface ProductTier {
  slug: string;
  label: string;
  shortLabel: string;
  description: string;
  iloPillar: string;
  /** Standard slugs whose requirements are most relevant to this tier. */
  standardSlugs: string[];
  color: string;
  accent: string;
  sortOrder: number;
  legacyAliases: string[];
}

export const PRODUCT_TIERS: ProductTier[] = [
  {
    slug: "statutory",
    label: "Statutory",
    shortLabel: "Statutory",
    description:
      "Mandatory protections forming the social protection floor — old-age, survivors, invalidity, employment-injury and basic health and family benefits guaranteed by law.",
    iloPillar: "ILO R202 — Social Protection Floor (Tier 1)",
    standardSlugs: ["ilo-c102", "ilo-r202", "ilo-c128"],
    color: "#0EA5E9",
    accent: "#7DD3FC",
    sortOrder: 1,
    legacyAliases: ["Core", "Mandatory", "Statutory"],
  },
  {
    slug: "supplementary",
    label: "Supplementary",
    shortLabel: "Supplementary",
    description:
      "Voluntary or hybrid second-pillar products that top up the statutory floor — savings schemes, voluntary contributions, occupational pensions, top-up insurance.",
    iloPillar: "ILO R202 — Above the Floor (Tier 2)",
    standardSlugs: ["oecd-pensions-at-a-glance", "mercer-cfa-gpi"],
    color: "#A855F7",
    accent: "#D8B4FE",
    sortOrder: 2,
    legacyAliases: ["Complementary", "Voluntary", "Supplementary"],
  },
  {
    slug: "innovative",
    label: "Innovative",
    shortLabel: "Innovative",
    description:
      "Emerging or partnership products — financial wellbeing, gig-economy coverage, micro-pensions, open-finance integrations, behavioural-economics nudges.",
    iloPillar: "ILO R202 — Innovation & Inclusion",
    standardSlugs: ["wb-govtech-maturity", "issa-ict"],
    color: "#F59E0B",
    accent: "#FCD34D",
    sortOrder: 3,
    legacyAliases: ["Non-Core", "NonCore", "Emerging", "Innovative"],
  },
];

export type ProductTierSlug = (typeof PRODUCT_TIERS)[number]["slug"];

export const PRODUCT_STATUSES = ["Active", "Pilot", "Planned", "Concept"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const PRODUCT_STATUS_COLORS: Record<ProductStatus, string> = {
  Active: "#10B981",
  Pilot: "#F59E0B",
  Planned: "#3B82F6",
  Concept: "#6366F1",
};

const TIER_LOOKUP = new Map<string, ProductTier>();
for (const t of PRODUCT_TIERS) {
  TIER_LOOKUP.set(t.slug, t);
  TIER_LOOKUP.set(t.label.toLowerCase(), t);
  for (const a of t.legacyAliases) TIER_LOOKUP.set(a.toLowerCase(), t);
}

export function resolveProductTier(value: string | null | undefined): ProductTier | null {
  if (!value) return null;
  return TIER_LOOKUP.get(value.trim().toLowerCase()) ?? null;
}
