/**
 * Canonical Standards Library
 *
 * Globally accepted reference frameworks for social security and pension
 * systems. This is the single source of truth — seeded into the `Standard`
 * and `StandardRequirement` tables, and consumed by the UI ComparatorPicker
 * and the standards-aware research agents.
 *
 * Bodies covered:
 *   - ILO  (International Labour Organization)        → Conventions & Recommendations
 *   - ISSA (International Social Security Assoc.)      → Guidelines
 *   - World Bank                                       → GovTech Maturity Index
 *   - OECD                                             → Pensions at a Glance
 *   - Mercer / CFA Institute                           → Global Pension Index
 *   - UN DESA                                          → E-Government Survey
 *
 * Each Standard exposes a list of `requirements` — concrete, verifiable
 * criteria that an entity (institution / service / product / channel /
 * country) is scored against in `StandardCompliance`.
 */

export interface StandardRequirementSeed {
  slug: string;
  code?: string;
  title: string;
  description?: string;
  weight?: number;
  pillar?: string;
  sortOrder?: number;
}

export interface StandardSeed {
  slug: string;
  code?: string;
  title: string;
  body: StandardBody;
  bodyShort?: string;
  category: StandardCategory;
  scope: "global" | "regional";
  region?: string;
  description: string;
  rationale?: string;
  url?: string;
  publishedYear?: number;
  sortOrder?: number;
  sourceSlugs?: string[];
  requirements: StandardRequirementSeed[];
}

export type StandardBody =
  | "ILO"
  | "ISSA"
  | "World Bank"
  | "OECD"
  | "Mercer"
  | "UN";

export type StandardCategory =
  | "social-protection-floor"
  | "social-security-minimum"
  | "service-quality"
  | "ict-administration"
  | "good-governance"
  | "govtech-maturity"
  | "pension-adequacy"
  | "digital-government"
  | "pension-index";

/**
 * The canonical reference catalog. Order here drives `sortOrder` in the DB
 * and the order of options in the ComparatorPicker.
 */
export const STANDARDS_CATALOG: StandardSeed[] = [
  // ── ILO ──────────────────────────────────────────────────────────────
  {
    slug: "ilo-c102",
    code: "C102",
    title: "ILO Convention 102 — Social Security (Minimum Standards)",
    body: "ILO",
    bodyShort: "ILO C102",
    category: "social-security-minimum",
    scope: "global",
    description:
      "The flagship ILO instrument defining the nine branches of social security and the minimum benefits, coverage, and conditions a national system must guarantee.",
    rationale:
      "C102 is the universally accepted minimum bar for any contributory social security system and is the canonical taxonomy for service categories.",
    url: "https://www.ilo.org/dyn/normlex/en/f?p=NORMLEXPUB:12100:0::NO::P12100_INSTRUMENT_ID:312247",
    publishedYear: 1952,
    sortOrder: 1,
    sourceSlugs: ["ilo-c102"],
    requirements: [
      { slug: "medical-care",          code: "Part II",   title: "Medical Care",           weight: 1, sortOrder: 1, pillar: "Coverage" },
      { slug: "sickness-benefit",      code: "Part III",  title: "Sickness Benefit",       weight: 1, sortOrder: 2, pillar: "Coverage" },
      { slug: "unemployment-benefit",  code: "Part IV",   title: "Unemployment Benefit",   weight: 1, sortOrder: 3, pillar: "Coverage" },
      { slug: "old-age-benefit",       code: "Part V",    title: "Old-Age Benefit",        weight: 1.5, sortOrder: 4, pillar: "Coverage" },
      { slug: "employment-injury",     code: "Part VI",   title: "Employment Injury Benefit", weight: 1, sortOrder: 5, pillar: "Coverage" },
      { slug: "family-benefit",        code: "Part VII",  title: "Family Benefit",         weight: 1, sortOrder: 6, pillar: "Coverage" },
      { slug: "maternity-benefit",     code: "Part VIII", title: "Maternity Benefit",      weight: 1, sortOrder: 7, pillar: "Coverage" },
      { slug: "invalidity-benefit",    code: "Part IX",   title: "Invalidity Benefit",     weight: 1, sortOrder: 8, pillar: "Coverage" },
      { slug: "survivors-benefit",     code: "Part X",    title: "Survivors' Benefit",     weight: 1, sortOrder: 9, pillar: "Coverage" },
    ],
  },
  {
    slug: "ilo-c128",
    code: "C128",
    title: "ILO Convention 128 — Invalidity, Old-Age and Survivors' Benefits",
    body: "ILO",
    bodyShort: "ILO C128",
    category: "pension-adequacy",
    scope: "global",
    description:
      "Higher standard than C102 for old-age, invalidity and survivors' benefits — sets stricter qualifying conditions, replacement rates and indexation.",
    url: "https://www.ilo.org/dyn/normlex/en/f?p=NORMLEXPUB:12100:0::NO::P12100_INSTRUMENT_ID:312273",
    publishedYear: 1967,
    sortOrder: 2,
    sourceSlugs: ["ilo-c128"],
    requirements: [
      { slug: "old-age-replacement",     title: "Old-age replacement rate ≥ 45% of reference wage", weight: 1.5, sortOrder: 1, pillar: "Adequacy" },
      { slug: "invalidity-replacement",  title: "Invalidity benefit ≥ 50% of reference wage",       weight: 1, sortOrder: 2, pillar: "Adequacy" },
      { slug: "survivors-replacement",   title: "Survivors' benefit ≥ 45% of reference wage",        weight: 1, sortOrder: 3, pillar: "Adequacy" },
      { slug: "indexation",              title: "Periodic adjustment to cost-of-living / wage index", weight: 1, sortOrder: 4, pillar: "Sustainability" },
      { slug: "qualifying-period",       title: "Qualifying period ≤ 30 years contributions",        weight: 1, sortOrder: 5, pillar: "Coverage" },
    ],
  },
  {
    slug: "ilo-r202",
    code: "R202",
    title: "ILO Recommendation 202 — Social Protection Floors",
    body: "ILO",
    bodyShort: "ILO R202",
    category: "social-protection-floor",
    scope: "global",
    description:
      "The Social Protection Floors framework — four nationally-defined basic social security guarantees that must be universally available throughout the life cycle.",
    url: "https://www.ilo.org/dyn/normlex/en/f?p=NORMLEXPUB:12100:0::NO::P12100_INSTRUMENT_ID:3065524",
    publishedYear: 2012,
    sortOrder: 3,
    sourceSlugs: ["ilo-r202"],
    requirements: [
      { slug: "spf-children",       title: "Basic income security for children",                 weight: 1, sortOrder: 1, pillar: "SPF" },
      { slug: "spf-working-age",    title: "Basic income security for persons of working age unable to earn enough", weight: 1, sortOrder: 2, pillar: "SPF" },
      { slug: "spf-old-age",        title: "Basic income security for older persons",            weight: 1.5, sortOrder: 3, pillar: "SPF" },
      { slug: "spf-health",         title: "Essential health care, including maternity care",    weight: 1, sortOrder: 4, pillar: "SPF" },
    ],
  },

  // ── ISSA ─────────────────────────────────────────────────────────────
  {
    slug: "issa-service-quality",
    title: "ISSA Guidelines on Service Quality",
    body: "ISSA",
    bodyShort: "ISSA SQ",
    category: "service-quality",
    scope: "global",
    description:
      "ISSA's reference for the service-delivery quality of social security institutions: customer-centric design, accessibility, multi-channel delivery and continuous improvement.",
    url: "https://ww1.issa.int/guidelines/sq",
    publishedYear: 2019,
    sortOrder: 4,
    sourceSlugs: ["issa-sq"],
    requirements: [
      { slug: "customer-centricity",   title: "Customer-centric service design",          weight: 1.2, sortOrder: 1, pillar: "Experience" },
      { slug: "accessibility",         title: "Universal accessibility (incl. assistive)", weight: 1, sortOrder: 2, pillar: "Experience" },
      { slug: "service-charter",       title: "Published service charter and SLAs",       weight: 1, sortOrder: 3, pillar: "Governance" },
      { slug: "omnichannel",           title: "Multi-channel and omnichannel delivery",   weight: 1.2, sortOrder: 4, pillar: "Channels" },
      { slug: "feedback-loop",         title: "Customer feedback and continuous improvement", weight: 1, sortOrder: 5, pillar: "Governance" },
      { slug: "transparency",          title: "Transparent communication and information access", weight: 1, sortOrder: 6, pillar: "Trust" },
    ],
  },
  {
    slug: "issa-ict",
    title: "ISSA Guidelines on Information & Communication Technology",
    body: "ISSA",
    bodyShort: "ISSA ICT",
    category: "ict-administration",
    scope: "global",
    description:
      "Reference framework for ICT governance, architecture, data, and digital service delivery in social security administration.",
    url: "https://ww1.issa.int/guidelines/ict",
    publishedYear: 2022,
    sortOrder: 5,
    sourceSlugs: ["issa-ict"],
    requirements: [
      { slug: "ict-governance",        title: "ICT governance and strategic alignment",   weight: 1, sortOrder: 1, pillar: "Governance" },
      { slug: "enterprise-architecture", title: "Enterprise architecture and standards",  weight: 1, sortOrder: 2, pillar: "Architecture" },
      { slug: "data-management",       title: "Data quality, integration and analytics",  weight: 1.2, sortOrder: 3, pillar: "Data" },
      { slug: "cybersecurity",         title: "Cybersecurity and information protection", weight: 1.2, sortOrder: 4, pillar: "Trust" },
      { slug: "digital-services",      title: "Digital service delivery and self-service", weight: 1.2, sortOrder: 5, pillar: "Channels" },
      { slug: "interoperability",      title: "Interoperability with national digital ID & registers", weight: 1, sortOrder: 6, pillar: "Architecture" },
      { slug: "ai-emerging-tech",      title: "Responsible adoption of AI and emerging tech", weight: 1, sortOrder: 7, pillar: "Innovation" },
    ],
  },
  {
    slug: "issa-good-governance",
    title: "ISSA Guidelines on Good Governance",
    body: "ISSA",
    bodyShort: "ISSA Gov",
    category: "good-governance",
    scope: "global",
    description:
      "Reference framework for governance and oversight of social security institutions: accountability, transparency, predictability, participation, and dynamism.",
    url: "https://ww1.issa.int/guidelines/gg",
    publishedYear: 2019,
    sortOrder: 6,
    sourceSlugs: ["issa-gg"],
    requirements: [
      { slug: "accountability",   title: "Accountability of governance bodies",      weight: 1, sortOrder: 1, pillar: "Governance" },
      { slug: "transparency",     title: "Transparency of decisions and operations", weight: 1, sortOrder: 2, pillar: "Governance" },
      { slug: "predictability",   title: "Predictable, rule-based decision making",  weight: 1, sortOrder: 3, pillar: "Governance" },
      { slug: "participation",    title: "Tripartite participation and stakeholder voice", weight: 1, sortOrder: 4, pillar: "Governance" },
      { slug: "dynamism",         title: "Dynamism and responsiveness to change",    weight: 1, sortOrder: 5, pillar: "Governance" },
      { slug: "risk-management",  title: "Enterprise risk management and audit",     weight: 1, sortOrder: 6, pillar: "Governance" },
    ],
  },

  // ── World Bank ───────────────────────────────────────────────────────
  {
    slug: "wb-govtech-maturity",
    title: "World Bank GovTech Maturity Index",
    body: "World Bank",
    bodyShort: "WB GTMI",
    category: "govtech-maturity",
    scope: "global",
    description:
      "World Bank's index of government technology maturity, scoring four focus areas: core government systems, public service delivery, citizen engagement, and GovTech enablers.",
    url: "https://www.worldbank.org/en/programs/govtech/gtmi",
    publishedYear: 2022,
    sortOrder: 7,
    sourceSlugs: ["wb-gtmi"],
    requirements: [
      { slug: "core-systems",      title: "Core government systems index",        weight: 1, sortOrder: 1, pillar: "Architecture" },
      { slug: "public-service",    title: "Public service delivery index",        weight: 1.2, sortOrder: 2, pillar: "Channels" },
      { slug: "citizen-engagement",title: "Citizen engagement index",             weight: 1, sortOrder: 3, pillar: "Experience" },
      { slug: "govtech-enablers",  title: "GovTech enablers index (talent, data, innovation)", weight: 1, sortOrder: 4, pillar: "Innovation" },
    ],
  },

  // ── OECD ─────────────────────────────────────────────────────────────
  {
    slug: "oecd-pensions-at-a-glance",
    title: "OECD Pensions at a Glance",
    body: "OECD",
    bodyShort: "OECD PaaG",
    category: "pension-adequacy",
    scope: "global",
    description:
      "OECD's biennial benchmarking of pension systems — replacement rates, coverage, fiscal sustainability, and reform outlook.",
    url: "https://www.oecd.org/pensions/pensions-at-a-glance/",
    publishedYear: 2023,
    sortOrder: 8,
    sourceSlugs: ["oecd-paag"],
    requirements: [
      { slug: "gross-replacement",  title: "Gross replacement rate (mandatory)",     weight: 1.5, sortOrder: 1, pillar: "Adequacy" },
      { slug: "net-replacement",    title: "Net replacement rate (after tax)",       weight: 1, sortOrder: 2, pillar: "Adequacy" },
      { slug: "coverage-mandatory", title: "Coverage of mandatory pension scheme",   weight: 1.2, sortOrder: 3, pillar: "Coverage" },
      { slug: "expenditure-gdp",    title: "Pension expenditure as % of GDP",        weight: 1, sortOrder: 4, pillar: "Sustainability" },
      { slug: "old-age-poverty",    title: "Old-age poverty rate",                   weight: 1, sortOrder: 5, pillar: "Adequacy" },
    ],
  },

  // ── Mercer / CFA Institute ───────────────────────────────────────────
  {
    slug: "mercer-cfa-gpi",
    title: "Mercer CFA Institute Global Pension Index",
    body: "Mercer",
    bodyShort: "Mercer GPI",
    category: "pension-index",
    scope: "global",
    description:
      "Composite global pension index scoring countries on adequacy, sustainability and integrity. Each sub-index weighted: 40% / 35% / 25%.",
    url: "https://www.mercer.com/insights/investments/market-outlook-and-trends/mercer-cfa-institute-global-pension-index/",
    publishedYear: 2024,
    sortOrder: 9,
    sourceSlugs: ["mercer-gpi"],
    requirements: [
      { slug: "adequacy",      title: "Adequacy sub-index (40% weight)",       weight: 1.6, sortOrder: 1, pillar: "Adequacy" },
      { slug: "sustainability",title: "Sustainability sub-index (35% weight)", weight: 1.4, sortOrder: 2, pillar: "Sustainability" },
      { slug: "integrity",     title: "Integrity sub-index (25% weight)",      weight: 1, sortOrder: 3, pillar: "Governance" },
    ],
  },

  // ── UN DESA ──────────────────────────────────────────────────────────
  {
    slug: "un-egov-survey",
    title: "UN E-Government Survey",
    body: "UN",
    bodyShort: "UN EGDI",
    category: "digital-government",
    scope: "global",
    description:
      "United Nations biennial assessment of e-government development across member states. Composite of OSI, TII and HCI sub-indices.",
    url: "https://publicadministration.un.org/egovkb/en-us/Reports/UN-E-Government-Survey-2024",
    publishedYear: 2024,
    sortOrder: 10,
    sourceSlugs: ["un-egov"],
    requirements: [
      { slug: "osi", title: "Online Service Index (OSI)",       weight: 1.4, sortOrder: 1, pillar: "Channels" },
      { slug: "tii", title: "Telecom Infrastructure Index (TII)", weight: 1, sortOrder: 2, pillar: "Architecture" },
      { slug: "hci", title: "Human Capital Index (HCI)",         weight: 1, sortOrder: 3, pillar: "Capacity" },
      { slug: "epi", title: "E-Participation Index (EPI)",       weight: 1, sortOrder: 4, pillar: "Experience" },
    ],
  },
];

/**
 * Reference data sources that back each standard. These are upserted into the
 * `DataSource` table during seeding so each Standard can hard-link to its
 * authoritative source for the "follow the source" UX in the RAG library.
 */
export const STANDARDS_DATA_SOURCES = [
  { slug: "ilo-c102",    title: "ILO Convention C102 — Minimum Standards",      url: "https://www.ilo.org/dyn/normlex/en/f?p=NORMLEXPUB:12100:0::NO::P12100_INSTRUMENT_ID:312247", publisher: "ILO", region: "Global", sourceType: "standard" },
  { slug: "ilo-c128",    title: "ILO Convention C128 — Invalidity, Old-Age and Survivors", url: "https://www.ilo.org/dyn/normlex/en/f?p=NORMLEXPUB:12100:0::NO::P12100_INSTRUMENT_ID:312273", publisher: "ILO", region: "Global", sourceType: "standard" },
  { slug: "ilo-r202",    title: "ILO Recommendation R202 — Social Protection Floors", url: "https://www.ilo.org/dyn/normlex/en/f?p=NORMLEXPUB:12100:0::NO::P12100_INSTRUMENT_ID:3065524", publisher: "ILO", region: "Global", sourceType: "standard" },
  { slug: "issa-sq",     title: "ISSA Guidelines on Service Quality",            url: "https://ww1.issa.int/guidelines/sq",   publisher: "ISSA", region: "Global", sourceType: "standard" },
  { slug: "issa-ict",    title: "ISSA Guidelines on ICT",                        url: "https://ww1.issa.int/guidelines/ict",  publisher: "ISSA", region: "Global", sourceType: "standard" },
  { slug: "issa-gg",     title: "ISSA Guidelines on Good Governance",            url: "https://ww1.issa.int/guidelines/gg",   publisher: "ISSA", region: "Global", sourceType: "standard" },
  { slug: "wb-gtmi",     title: "World Bank GovTech Maturity Index",             url: "https://www.worldbank.org/en/programs/govtech/gtmi", publisher: "World Bank", region: "Global", sourceType: "standard" },
  { slug: "oecd-paag",   title: "OECD Pensions at a Glance",                     url: "https://www.oecd.org/pensions/pensions-at-a-glance/", publisher: "OECD",       region: "Global", sourceType: "standard" },
  { slug: "mercer-gpi",  title: "Mercer CFA Institute Global Pension Index",     url: "https://www.mercer.com/insights/investments/market-outlook-and-trends/mercer-cfa-institute-global-pension-index/", publisher: "Mercer", region: "Global", sourceType: "standard" },
  { slug: "un-egov",     title: "UN E-Government Survey",                        url: "https://publicadministration.un.org/egovkb/en-us/Reports/UN-E-Government-Survey-2024", publisher: "UN DESA", region: "Global", sourceType: "standard" },
];

export type StandardSlug = (typeof STANDARDS_CATALOG)[number]["slug"];
