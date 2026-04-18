/**
 * Canonical Labor-Market Segmentation
 *
 * Aligned with the ILO labor-market taxonomy (formal/informal, employment
 * status) and the GPSSA mandate (national/non-national, GCC mobile,
 * military). Used by:
 *   • Products → Segments coverage matrix
 *   • Delivery → Personas
 *   • Atlas / Benchmarking → coverage decomposition
 */

export interface LaborSegment {
  slug: string;
  label: string;
  shortLabel: string;
  description: string;
  /** Top-level cohort grouping for visualisation. */
  cohort: "national" | "non-national" | "regional" | "uniformed";
  /** ILO formality status. */
  formality: "formal" | "informal" | "self-employed" | "mixed";
  color: string;
  sortOrder: number;
  legacyAliases: string[];
}

export const LABOR_SEGMENTS: LaborSegment[] = [
  // National (UAE / Saudi)
  { slug: "national-formal",        label: "National — Formal Employment",     shortLabel: "Nat'l Formal",   description: "UAE/Saudi nationals in public or private formal employment.",                cohort: "national",     formality: "formal",        color: "#0EA5E9", sortOrder: 1, legacyAliases: ["Saudi — Formal employment", "UAE nationals", "Emirati formal"] },
  { slug: "national-self-employed", label: "National — Self-Employed",         shortLabel: "Nat'l Self-Emp", description: "Self-employed nationals contributing voluntarily or through dedicated schemes.", cohort: "national",  formality: "self-employed", color: "#8B5CF6", sortOrder: 2, legacyAliases: ["Saudi — Self-employed", "Self-Employed Emirati", "Self-employed"] },
  { slug: "national-informal",      label: "National — Informal Employment",   shortLabel: "Nat'l Informal", description: "Nationals in informal or uncovered work.",                                       cohort: "national",     formality: "informal",      color: "#F59E0B", sortOrder: 3, legacyAliases: ["Saudi — Informal employment"] },

  // Non-national (Expat)
  { slug: "expat-formal",           label: "Expat — Formal Employment",        shortLabel: "Expat Formal",   description: "Non-nationals in formal private-sector employment.",                              cohort: "non-national", formality: "formal",        color: "#22C55E", sortOrder: 4, legacyAliases: ["Non-Saudi — Formal employment", "Expat Corporate Professional"] },
  { slug: "expat-domestic",         label: "Expat — Domestic Workers",         shortLabel: "Domestic",       description: "Domestic workers under household sponsorship.",                                  cohort: "non-national", formality: "formal",        color: "#EC4899", sortOrder: 5, legacyAliases: ["Non-Saudi — Domestic workers", "Domestic Worker", "Domestic workers"] },
  { slug: "expat-other",            label: "Expat — Other",                    shortLabel: "Expat Other",    description: "Other non-national workers, including informal cohorts.",                       cohort: "non-national", formality: "mixed",         color: "#A855F7", sortOrder: 6, legacyAliases: ["Non-Saudi — Others", "Expats"] },

  // GCC mobile workers
  { slug: "gcc-mobile",             label: "GCC Mobile Workers",               shortLabel: "GCC Mobile",     description: "GCC nationals posted across borders under the GCC unified extension.",          cohort: "regional",     formality: "formal",        color: "#06B6D4", sortOrder: 7, legacyAliases: ["GCC-posted nationals", "GCC Cross-Border Worker", "GCC nationals"] },

  // Military / uniformed
  { slug: "military-security",      label: "Military & Security",              shortLabel: "Military",       description: "Personnel covered under military pension and security schemes.",                  cohort: "uniformed",    formality: "formal",        color: "#EF4444", sortOrder: 8, legacyAliases: ["Military & security"] },

  // Cross-cutting cohorts
  { slug: "youth-entrants",         label: "Youth & New Entrants",             shortLabel: "Youth",          description: "Young workers entering the labor market for the first time.",                    cohort: "national",     formality: "mixed",         color: "#10B981", sortOrder: 9, legacyAliases: ["Young Emirati Graduate", "Youth entrants", "New labor market entrants"] },
  { slug: "gig-workers",            label: "Gig & Platform Workers",           shortLabel: "Gig",            description: "Platform-economy workers without formal employer relationships.",                cohort: "national",     formality: "self-employed", color: "#F97316", sortOrder: 10, legacyAliases: ["Gig Economy Worker", "Gig workers"] },
  { slug: "retirees",               label: "Retirees & Pensioners",            shortLabel: "Retirees",       description: "Persons drawing old-age, survivors or disability benefits.",                     cohort: "national",     formality: "mixed",         color: "#6366F1", sortOrder: 11, legacyAliases: ["Emirati Retiree", "Retirees", "Elderly users"] },
  { slug: "guardians-survivors",    label: "Guardians & Survivors",            shortLabel: "Guardians",      description: "Survivors and legal guardians acting on behalf of minors or incapacitated.",      cohort: "national",     formality: "mixed",         color: "#94A3B8", sortOrder: 12, legacyAliases: ["Guardians", "Beneficiaries"] },
];

export type LaborSegmentSlug = (typeof LABOR_SEGMENTS)[number]["slug"];

const SEGMENT_LOOKUP = new Map<string, LaborSegment>();
for (const s of LABOR_SEGMENTS) {
  SEGMENT_LOOKUP.set(s.slug, s);
  SEGMENT_LOOKUP.set(s.label.toLowerCase(), s);
  SEGMENT_LOOKUP.set(s.shortLabel.toLowerCase(), s);
  for (const a of s.legacyAliases) SEGMENT_LOOKUP.set(a.toLowerCase(), s);
}

export function resolveSegment(value: string | null | undefined): LaborSegment | null {
  if (!value) return null;
  return SEGMENT_LOOKUP.get(value.trim().toLowerCase()) ?? null;
}

// ── Coverage rubric (used by Segment Matrix) ─────────────────────────────

export const COVERAGE_LEVELS = ["Covered", "Voluntary", "Limited", "Not Covered"] as const;
export type CoverageLevel = (typeof COVERAGE_LEVELS)[number];

export const COVERAGE_LEVEL_SCORES: Record<CoverageLevel, number> = {
  Covered: 100,
  Voluntary: 60,
  Limited: 35,
  "Not Covered": 0,
};

export const COVERAGE_LEVEL_COLORS: Record<CoverageLevel, string> = {
  Covered: "#10B981",
  Voluntary: "#3B82F6",
  Limited: "#F59E0B",
  "Not Covered": "#64748B",
};
