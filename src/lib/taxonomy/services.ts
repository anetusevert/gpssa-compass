/**
 * Canonical Service Taxonomy
 *
 * Two orthogonal dimensions, both grounded in international standards:
 *
 *   1. SERVICE_FUNCTIONS   — ILO C102 nine branches + lifecycle additions
 *                            (Registration, Contributions, Information).
 *   2. SERVICE_AUDIENCES   — Who consumes the service (insured worker,
 *                            employer, beneficiary, guardian, GCC mobile
 *                            worker, military, general public).
 *
 * The legacy single-list `CATEGORIES` collapsed both dimensions into one,
 * which made benchmarking impossible. The canonical version keeps them
 * separate and provides a `SERVICE_CATEGORIES` flat list for back-compat.
 */

export interface ServiceFunction {
  slug: string;
  label: string;
  shortLabel: string;
  /** ILO C102 part / branch reference, when applicable. */
  iloReference?: string;
  /** Slugs of standards this function is most directly assessed against. */
  standardSlugs: string[];
  description: string;
  color: string;
  icon: string;
  sortOrder: number;
  /** Mapping from legacy free-text category names to this canonical slug. */
  legacyAliases: string[];
}

export const SERVICE_FUNCTIONS: ServiceFunction[] = [
  {
    slug: "registration",
    label: "Registration & Identity",
    shortLabel: "Registration",
    iloReference: "Administration (preamble)",
    standardSlugs: ["issa-ict", "wb-govtech-maturity", "un-egov-survey"],
    description: "Onboarding insured persons and employers; establishing legal identity in the social-security system.",
    color: "#7C3AED",
    icon: "user-plus",
    sortOrder: 1,
    legacyAliases: ["Registration"],
  },
  {
    slug: "contributions",
    label: "Contributions & Compliance",
    shortLabel: "Contributions",
    iloReference: "Administration / financing",
    standardSlugs: ["issa-good-governance", "issa-ict"],
    description: "Collection of contributions, compliance enforcement, employer reporting and reconciliation.",
    color: "#0EA5E9",
    icon: "credit-card",
    sortOrder: 2,
    legacyAliases: ["Contributions"],
  },
  {
    slug: "old-age-pensions",
    label: "Old-Age Pensions",
    shortLabel: "Pensions",
    iloReference: "C102 Part V · C128",
    standardSlugs: ["ilo-c102", "ilo-c128", "oecd-pensions-at-a-glance", "mercer-cfa-gpi"],
    description: "Old-age benefits — entitlement, calculation, payment, indexation.",
    color: "#F59E0B",
    icon: "sun",
    sortOrder: 3,
    legacyAliases: ["Pensions"],
  },
  {
    slug: "survivors-benefits",
    label: "Survivors' Benefits",
    shortLabel: "Survivors",
    iloReference: "C102 Part X · C128",
    standardSlugs: ["ilo-c102", "ilo-c128"],
    description: "Pensions and lump sums for survivors of deceased insured persons.",
    color: "#EC4899",
    icon: "heart",
    sortOrder: 4,
    legacyAliases: ["Survivors"],
  },
  {
    slug: "invalidity-benefits",
    label: "Invalidity Benefits",
    shortLabel: "Invalidity",
    iloReference: "C102 Part IX · C128",
    standardSlugs: ["ilo-c102", "ilo-c128"],
    description: "Long-term disability benefits resulting from non-occupational causes.",
    color: "#8B5CF6",
    icon: "activity",
    sortOrder: 5,
    legacyAliases: ["Disability"],
  },
  {
    slug: "employment-injury",
    label: "Employment Injury",
    shortLabel: "Injury",
    iloReference: "C102 Part VI",
    standardSlugs: ["ilo-c102"],
    description: "Compensation for occupational accidents and diseases.",
    color: "#EF4444",
    icon: "alert-triangle",
    sortOrder: 6,
    legacyAliases: ["Occupational Hazard"],
  },
  {
    slug: "unemployment",
    label: "Unemployment Support",
    shortLabel: "Unemployment",
    iloReference: "C102 Part IV",
    standardSlugs: ["ilo-c102", "ilo-r202"],
    description: "Cash support and active labor-market services for unemployed insured persons.",
    color: "#06B6D4",
    icon: "briefcase",
    sortOrder: 7,
    legacyAliases: ["Unemployment"],
  },
  {
    slug: "maternity-family",
    label: "Maternity & Family",
    shortLabel: "Family",
    iloReference: "C102 Parts VII & VIII",
    standardSlugs: ["ilo-c102", "ilo-r202"],
    description: "Maternity protection, family allowances and child-related benefits.",
    color: "#22C55E",
    icon: "users",
    sortOrder: 8,
    legacyAliases: ["Maternity", "Family"],
  },
  {
    slug: "healthcare-sickness",
    label: "Healthcare & Sickness",
    shortLabel: "Health",
    iloReference: "C102 Parts II & III · R202",
    standardSlugs: ["ilo-c102", "ilo-r202"],
    description: "Medical care and sickness cash benefits.",
    color: "#10B981",
    icon: "shield",
    sortOrder: 9,
    legacyAliases: ["Health Security", "Healthcare"],
  },
  {
    slug: "certificates-information",
    label: "Certificates & Information",
    shortLabel: "Certificates",
    standardSlugs: ["issa-service-quality", "un-egov-survey"],
    description: "Eligibility statements, contribution histories, no-objection letters and informational services.",
    color: "#A855F7",
    icon: "file-text",
    sortOrder: 10,
    legacyAliases: ["Certificates", "Information"],
  },
  {
    slug: "complaints-grievance",
    label: "Complaints & Grievance",
    shortLabel: "Complaints",
    standardSlugs: ["issa-service-quality", "issa-good-governance"],
    description: "Customer complaints, appeals, ombudsman and grievance redress.",
    color: "#F43F5E",
    icon: "message-circle",
    sortOrder: 11,
    legacyAliases: ["Complaints"],
  },
  {
    slug: "digital-self-service",
    label: "Digital & Self-Service",
    shortLabel: "Digital",
    standardSlugs: ["issa-ict", "wb-govtech-maturity", "un-egov-survey"],
    description: "Digital portals, mobile apps, AI assistants and self-service workflows.",
    color: "#3B82F6",
    icon: "smartphone",
    sortOrder: 12,
    legacyAliases: ["Digital"],
  },
];

export type ServiceFunctionSlug = (typeof SERVICE_FUNCTIONS)[number]["slug"];

// ── Audience dimension ────────────────────────────────────────────────────

export interface ServiceAudience {
  slug: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: string;
  sortOrder: number;
  legacyAliases: string[];
}

export const SERVICE_AUDIENCES: ServiceAudience[] = [
  { slug: "insured",      label: "Insured Worker",       shortLabel: "Insured",     description: "Active insured persons (UAE national or expat) accruing rights.", icon: "user",       sortOrder: 1, legacyAliases: ["Insured"] },
  { slug: "employer",     label: "Employer",             shortLabel: "Employer",    description: "Public, private or domestic-employer obligations.",               icon: "building",   sortOrder: 2, legacyAliases: ["Employer"] },
  { slug: "beneficiary",  label: "Beneficiary",          shortLabel: "Beneficiary", description: "Pensioners, survivors and other benefit recipients.",             icon: "smile",      sortOrder: 3, legacyAliases: ["Beneficiary"] },
  { slug: "guardian",     label: "Guardian / Agent",     shortLabel: "Guardian",    description: "Legal representatives acting on behalf of an insured person.",    icon: "shield",     sortOrder: 4, legacyAliases: ["Agent/Guardian"] },
  { slug: "gcc",          label: "GCC Mobile Worker",    shortLabel: "GCC",         description: "Cross-GCC posted workers under the Unified Insurance Extension.", icon: "globe",      sortOrder: 5, legacyAliases: ["GCC"] },
  { slug: "military",     label: "Military & Security",  shortLabel: "Military",    description: "Personnel covered under military pension and security schemes.",  icon: "compass",    sortOrder: 6, legacyAliases: ["Military"] },
  { slug: "general",      label: "General Public",       shortLabel: "Public",      description: "Information and entry-point services for the wider public.",      icon: "users",      sortOrder: 7, legacyAliases: ["General"] },
];

export type ServiceAudienceSlug = (typeof SERVICE_AUDIENCES)[number]["slug"];

// ── Back-compat: flat unified categories list ────────────────────────────

/**
 * For pages that still treat "category" as a single field, we publish a
 * unified flat list — functions first (ILO branches), then audiences.
 * Resolve any string back to its canonical entry via {@link resolveCategory}.
 */
export const SERVICE_CATEGORIES: string[] = [
  ...SERVICE_FUNCTIONS.map((f) => f.label),
  ...SERVICE_AUDIENCES.map((a) => a.label),
];

export type CanonicalCategory =
  | { kind: "function"; entry: ServiceFunction }
  | { kind: "audience"; entry: ServiceAudience };

const FUNCTION_LOOKUP = new Map<string, ServiceFunction>();
const AUDIENCE_LOOKUP = new Map<string, ServiceAudience>();

for (const f of SERVICE_FUNCTIONS) {
  FUNCTION_LOOKUP.set(f.slug.toLowerCase(), f);
  FUNCTION_LOOKUP.set(f.label.toLowerCase(), f);
  FUNCTION_LOOKUP.set(f.shortLabel.toLowerCase(), f);
  for (const alias of f.legacyAliases) FUNCTION_LOOKUP.set(alias.toLowerCase(), f);
}
for (const a of SERVICE_AUDIENCES) {
  AUDIENCE_LOOKUP.set(a.slug.toLowerCase(), a);
  AUDIENCE_LOOKUP.set(a.label.toLowerCase(), a);
  AUDIENCE_LOOKUP.set(a.shortLabel.toLowerCase(), a);
  for (const alias of a.legacyAliases) AUDIENCE_LOOKUP.set(alias.toLowerCase(), a);
}

/** Map any legacy or new string into its canonical entry, or `null`. */
export function resolveCategory(value: string | null | undefined): CanonicalCategory | null {
  if (!value) return null;
  const key = value.trim().toLowerCase();
  const fn = FUNCTION_LOOKUP.get(key);
  if (fn) return { kind: "function", entry: fn };
  const aud = AUDIENCE_LOOKUP.get(key);
  if (aud) return { kind: "audience", entry: aud };
  return null;
}

export function functionForCategory(value: string | null | undefined): ServiceFunction | null {
  const r = resolveCategory(value);
  return r?.kind === "function" ? r.entry : null;
}

export function audienceForCategory(value: string | null | undefined): ServiceAudience | null {
  const r = resolveCategory(value);
  return r?.kind === "audience" ? r.entry : null;
}

// ── Heuristic classification ──────────────────────────────────────────────

/**
 * Sentinel "function" returned when a service can't be confidently
 * mapped to one of the twelve canonical ILO branches. Lets the UI
 * surface a long-tail bucket instead of silently dropping rows.
 */
export const UNCLASSIFIED_FUNCTION: ServiceFunction = {
  slug: "unclassified",
  label: "Other / Unclassified",
  shortLabel: "Other",
  standardSlugs: [],
  description: "Services not yet mapped to a canonical ILO C102 branch — review and re-categorise.",
  color: "#64748B",
  icon: "help-circle",
  sortOrder: 99,
  legacyAliases: [],
};

/**
 * Each rule: a list of regex patterns evaluated against a lowercased
 * `name + description + category` blob. First rule that matches wins.
 * Rules ordered by specificity — narrower terms first.
 */
const HEURISTIC_RULES: Array<{ slug: string; patterns: RegExp[] }> = [
  { slug: "survivors-benefits",     patterns: [/\bsurviv/, /widow/, /orphan/, /\bdeath\b/, /funeral/, /bereav/] },
  { slug: "employment-injury",      patterns: [/\binjur/, /\baccident/, /workplace/, /occupational/, /work[- ]?related/] },
  { slug: "invalidity-benefits",    patterns: [/disab/, /invalid/, /incapacit/] },
  { slug: "old-age-pensions",       patterns: [/pension/, /retire/, /old[- ]?age/, /end of service/, /\beos\b/, /gratuity/] },
  { slug: "unemployment",           patterns: [/unemploy/, /jobseek/, /job seek/, /labou?r[- ]?market/, /redundan/] },
  { slug: "maternity-family",       patterns: [/matern/, /family/, /child(ren)?/, /allowance/, /parental/, /paternit/, /spouse/, /depend(e|a)nt/] },
  { slug: "healthcare-sickness",    patterns: [/health/, /sick/, /medical/, /hospital/, /clinic/, /pharmac/, /care\b/] },
  { slug: "complaints-grievance",   patterns: [/complaint/, /grievance/, /appeal/, /ombuds/, /dispute/] },
  { slug: "certificates-information",patterns: [/certificate/, /statement/, /no[- ]?objection/, /letter/, /attest/, /\binformation\b/, /inquiry/, /enquiry/, /suggest/] },
  { slug: "digital-self-service",   patterns: [/digital/, /portal/, /\bapp\b/, /mobile/, /self[- ]?service/, /chatbot/, /\bai\b/, /assistant/, /online/] },
  { slug: "contributions",          patterns: [/contribut/, /complian/, /payroll/, /reconcil/, /payment/, /settle/, /refund/, /purchase of service/] },
  { slug: "registration",           patterns: [/regist/, /onboard/, /enroll/, /enrol/, /identit/, /\bkyc\b/, /\bid\b/] },
];

/**
 * Robust resolver: tries the strict `resolveCategory()` first, then
 * keyword-classifies based on `name + description + category`, then
 * falls back to {@link UNCLASSIFIED_FUNCTION}.
 *
 * Always returns *some* function — guarantees every service lands in
 * exactly one bucket so counts add up to 100%.
 */
export function classifyServiceFunction(input: {
  name?: string | null;
  description?: string | null;
  category?: string | null;
}): ServiceFunction {
  const direct = functionForCategory(input.category);
  if (direct) return direct;

  const blob = `${input.name ?? ""} ${input.description ?? ""} ${input.category ?? ""}`.toLowerCase();
  for (const rule of HEURISTIC_RULES) {
    if (rule.patterns.some((re) => re.test(blob))) {
      const fn = SERVICE_FUNCTIONS.find((f) => f.slug === rule.slug);
      if (fn) return fn;
    }
  }
  return UNCLASSIFIED_FUNCTION;
}

/**
 * Returns canonical audience if `category` is an audience or any
 * audience alias appears in name/description; otherwise null.
 */
export function classifyServiceAudience(input: {
  name?: string | null;
  description?: string | null;
  category?: string | null;
  userTypes?: string[] | null;
}): ServiceAudience | null {
  const direct = audienceForCategory(input.category);
  if (direct) return direct;

  if (Array.isArray(input.userTypes)) {
    for (const ut of input.userTypes) {
      const found = audienceForCategory(ut);
      if (found) return found;
    }
  }

  const blob = `${input.name ?? ""} ${input.description ?? ""}`.toLowerCase();
  for (const aud of SERVICE_AUDIENCES) {
    if (blob.includes(aud.shortLabel.toLowerCase()) || blob.includes(aud.label.toLowerCase())) {
      return aud;
    }
  }
  return null;
}

/** All twelve ILO branches plus the long-tail bucket, in display order. */
export const SERVICE_FUNCTIONS_WITH_OTHER: ServiceFunction[] = [
  ...SERVICE_FUNCTIONS,
  UNCLASSIFIED_FUNCTION,
];
