import { prisma } from "@/lib/db";

/**
 * Deterministic Computed References
 *
 * Aggregate metrics derived from the existing Country / Institution / Service
 * data. They are first-class comparators — alongside global Standards and
 * individual Countries — in every Benchmark view across the app.
 *
 * Each reference is computed in pure code, then materialized into the
 * `ComputedReference` table for fast lookup. Refresh is on-demand or via the
 * `/api/references/computed/refresh` endpoint.
 */

// ── Types ────────────────────────────────────────────────────────────────

export type ReferenceKind =
  | "average"
  | "best-practice"
  | "median"
  | "leader-cohort"
  | "peer-group";

export type ReferenceScope =
  | "global"
  | "gcc"
  | "mena"
  | "europe"
  | "asia-pacific"
  | "americas"
  | "africa"
  | "leaders"
  | "peer-group";

export interface MetricSnapshot {
  maturityScore: number;
  coverageRate: number;
  replacementRate: number;
  sustainability: number;
  digitalReadiness: number;
}

export interface ComputedReferencePayload {
  metrics: MetricSnapshot;
  serviceMaturity: Record<string, number>;
  channelMaturity: Record<string, number>;
  standardCompliance: Record<string, number>;
}

export interface ReferenceDefinition {
  slug: string;
  name: string;
  shortName: string;
  kind: ReferenceKind;
  scope: ReferenceScope;
  description: string;
  formula: string;
  filter: (country: { region: string | null; subRegion: string | null; iso3: string | null; maturityLabel: string | null }) => boolean;
  topPercentile?: number;
}

// ── Reference Definitions ────────────────────────────────────────────────

export const REFERENCE_DEFINITIONS: ReferenceDefinition[] = [
  {
    slug: "global-average",
    name: "Global Average",
    shortName: "Global Avg",
    kind: "average",
    scope: "global",
    description: "Mean of every tracked country with completed research data.",
    formula: "mean(metric, all_countries_with_data)",
    filter: () => true,
  },
  {
    slug: "global-best-practice",
    name: "Global Best Practice (Top Quartile)",
    shortName: "Global Best",
    kind: "best-practice",
    scope: "global",
    description: "Mean of the top 25% of tracked countries by composite maturity score.",
    formula: "mean(metric, top_25pct(maturityScore))",
    filter: () => true,
    topPercentile: 25,
  },
  {
    slug: "global-leaders",
    name: "Global Leader Cohort",
    shortName: "Leaders",
    kind: "leader-cohort",
    scope: "leaders",
    description: "Mean of countries labelled as 'Leader' by the Atlas maturity model.",
    formula: "mean(metric, where=maturityLabel='Leader')",
    filter: (c) => c.maturityLabel === "Leader",
  },
  {
    slug: "gcc-average",
    name: "GCC Regional Average",
    shortName: "GCC Avg",
    kind: "average",
    scope: "gcc",
    description: "Mean of GCC member states (UAE, KSA, Qatar, Kuwait, Bahrain, Oman).",
    formula: "mean(metric, where=region='GCC')",
    filter: (c) => c.region === "GCC",
  },
  {
    slug: "gcc-best-practice",
    name: "GCC Best Practice",
    shortName: "GCC Best",
    kind: "best-practice",
    scope: "gcc",
    description: "Top performer per metric within the GCC cohort.",
    formula: "max(metric, where=region='GCC')",
    filter: (c) => c.region === "GCC",
  },
  {
    slug: "mena-average",
    name: "MENA Regional Average",
    shortName: "MENA Avg",
    kind: "average",
    scope: "mena",
    description: "Mean of GCC + MENA countries (Middle East and North Africa).",
    formula: "mean(metric, where=region in ('GCC','MENA','Middle East'))",
    filter: (c) =>
      c.region === "GCC" ||
      c.region === "MENA" ||
      c.region === "Middle East",
  },
  {
    slug: "europe-average",
    name: "Europe Regional Average",
    shortName: "Europe Avg",
    kind: "average",
    scope: "europe",
    description: "Mean of European countries.",
    formula: "mean(metric, where=region='Europe')",
    filter: (c) => c.region === "Europe",
  },
  {
    slug: "asia-pacific-average",
    name: "Asia-Pacific Regional Average",
    shortName: "APAC Avg",
    kind: "average",
    scope: "asia-pacific",
    description: "Mean of Asia-Pacific countries.",
    formula: "mean(metric, where=region='Asia Pacific')",
    filter: (c) => c.region === "Asia Pacific" || c.region === "Asia-Pacific",
  },
  {
    slug: "peer-group-gpssa",
    name: "GPSSA Peer Group",
    shortName: "GPSSA Peers",
    kind: "peer-group",
    scope: "peer-group",
    description: "Curated peer group of pension authorities most comparable to GPSSA: GCC peers + leaders with similar mandate (Singapore CPF, Korea NPS, Australia ATO Super, etc.).",
    formula: "mean(metric, where=iso3 in PEER_GROUP)",
    filter: (c) =>
      [
        "ARE", "SAU", "QAT", "KWT", "BHR", "OMN",          // GCC
        "SGP", "KOR", "AUS", "MYS", "GBR", "NLD", "CAN",   // peers
      ].includes(c.iso3 ?? ""),
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function topQuartile<T>(items: T[], scoreOf: (i: T) => number): T[] {
  if (items.length === 0) return [];
  const sorted = [...items].sort((a, b) => scoreOf(b) - scoreOf(a));
  const cutoff = Math.max(1, Math.ceil(sorted.length * 0.25));
  return sorted.slice(0, cutoff);
}

// ── Compute ──────────────────────────────────────────────────────────────

interface CountryRow {
  iso3: string;
  region: string;
  subRegion: string | null;
  maturityLabel: string | null;
  maturityScore: number | null;
  coverageRate: number | null;
  replacementRate: number | null;
  sustainability: number | null;
  digitalLevel: string | null;
}

const DIGITAL_LEVEL_TO_SCORE: Record<string, number> = {
  "AI-Integrated": 95,
  "Digital-First": 85,
  "Digital-Enabled": 65,
  "Partially Digital": 55,
  "Basic Digital": 45,
  Transitioning: 35,
  Traditional: 25,
  Manual: 20,
};

async function loadCountryRows(): Promise<CountryRow[]> {
  const rows = await prisma.country.findMany({
    where: { researchStatus: "completed" },
    select: {
      iso3: true,
      region: true,
      subRegion: true,
      maturityLabel: true,
      maturityScore: true,
      coverageRate: true,
      replacementRate: true,
      sustainability: true,
      digitalLevel: true,
    },
  });
  if (rows.length === 0) {
    // Fall back to all countries (research status may not be marked completed)
    return prisma.country.findMany({
      select: {
        iso3: true,
        region: true,
        subRegion: true,
        maturityLabel: true,
        maturityScore: true,
        coverageRate: true,
        replacementRate: true,
        sustainability: true,
        digitalLevel: true,
      },
    });
  }
  return rows;
}

async function loadIntlServices() {
  return prisma.internationalService.findMany({
    select: {
      countryIso3: true,
      category: true,
      digitalReadiness: true,
      maturityLevel: true,
      channelCapabilities: true,
    },
  });
}

function digitalReadinessFromCountry(c: CountryRow): number {
  if (c.digitalLevel && DIGITAL_LEVEL_TO_SCORE[c.digitalLevel] != null) {
    return DIGITAL_LEVEL_TO_SCORE[c.digitalLevel];
  }
  return 0;
}

function metricsForCohort(cohort: CountryRow[], best = false): MetricSnapshot {
  if (cohort.length === 0) {
    return { maturityScore: 0, coverageRate: 0, replacementRate: 0, sustainability: 0, digitalReadiness: 0 };
  }
  const reduce = best
    ? (vals: number[]) => (vals.length === 0 ? 0 : Math.max(...vals))
    : (vals: number[]) => mean(vals);
  const scale = (v: number | null) => (v == null ? null : v);

  const ms = cohort.map((c) => scale(c.maturityScore)).filter((v): v is number => v != null && v > 0);
  const cr = cohort.map((c) => scale(c.coverageRate)).filter((v): v is number => v != null && v > 0);
  const rr = cohort.map((c) => scale(c.replacementRate)).filter((v): v is number => v != null && v > 0);
  const su = cohort.map((c) => scale(c.sustainability)).filter((v): v is number => v != null && v > 0);
  const dr = cohort.map((c) => digitalReadinessFromCountry(c)).filter((v) => v > 0);

  return {
    maturityScore: Number(reduce(ms).toFixed(2)),
    coverageRate: Number(reduce(cr).toFixed(2)),
    replacementRate: Number(reduce(rr).toFixed(2)),
    sustainability: Number(reduce(su).toFixed(2)),
    digitalReadiness: Number(reduce(dr).toFixed(2)),
  };
}

function serviceMaturityForCohort(
  intlServices: { countryIso3: string; category: string; digitalReadiness: number | null }[],
  cohortIsos: Set<string>
): Record<string, number> {
  const grouped = new Map<string, number[]>();
  for (const svc of intlServices) {
    if (!cohortIsos.has(svc.countryIso3)) continue;
    if (svc.digitalReadiness == null) continue;
    const list = grouped.get(svc.category) ?? [];
    list.push(svc.digitalReadiness);
    grouped.set(svc.category, list);
  }
  const out: Record<string, number> = {};
  for (const [cat, vals] of Array.from(grouped.entries())) {
    out[cat] = Number(mean(vals).toFixed(1));
  }
  return out;
}

function channelMaturityForCohort(
  intlServices: { countryIso3: string; channelCapabilities: string | null }[],
  cohortIsos: Set<string>
): Record<string, number> {
  const channels = ["portal", "mobile", "centers", "call", "partner", "api"];
  const tally = new Map<string, { sum: number; n: number }>();
  channels.forEach((c) => tally.set(c, { sum: 0, n: 0 }));

  const levelScore: Record<string, number> = { Full: 100, Partial: 60, Planned: 30, None: 0 };

  for (const svc of intlServices) {
    if (!cohortIsos.has(svc.countryIso3) || !svc.channelCapabilities) continue;
    let parsed: Record<string, string> | null = null;
    try {
      parsed = JSON.parse(svc.channelCapabilities) as Record<string, string>;
    } catch {
      continue;
    }
    if (!parsed) continue;
    for (const ch of channels) {
      const lvl = parsed[ch];
      if (lvl == null) continue;
      const score = levelScore[lvl] ?? 0;
      const cur = tally.get(ch)!;
      cur.sum += score;
      cur.n += 1;
      tally.set(ch, cur);
    }
  }

  const out: Record<string, number> = {};
  for (const [ch, { sum, n }] of Array.from(tally.entries())) {
    out[ch] = n === 0 ? 0 : Number((sum / n).toFixed(1));
  }
  return out;
}

async function standardComplianceForCohort(cohortIsos: Set<string>): Promise<Record<string, number>> {
  const compliances = await prisma.standardCompliance.findMany({
    where: { entityType: "country", countryIso3: { in: Array.from(cohortIsos) } },
    select: { standard: { select: { slug: true } }, score: true },
  });
  if (compliances.length === 0) return {};
  const grouped = new Map<string, number[]>();
  for (const cmp of compliances) {
    const list = grouped.get(cmp.standard.slug) ?? [];
    list.push(cmp.score);
    grouped.set(cmp.standard.slug, list);
  }
  const out: Record<string, number> = {};
  for (const [slug, vals] of Array.from(grouped.entries())) {
    out[slug] = Number(mean(vals).toFixed(1));
  }
  return out;
}

// ── Public: compute & persist ────────────────────────────────────────────

export async function computeAllReferences(): Promise<{ refreshed: number; cohortSizes: Record<string, number> }> {
  const [countries, intlServices] = await Promise.all([loadCountryRows(), loadIntlServices()]);
  const cohortSizes: Record<string, number> = {};
  let refreshed = 0;

  for (const def of REFERENCE_DEFINITIONS) {
    let cohort = countries.filter((c) => def.filter(c));

    if (def.kind === "best-practice" && def.topPercentile) {
      cohort = topQuartile(cohort, (c) => c.maturityScore ?? 0);
    }

    const isos = new Set(cohort.map((c) => c.iso3));
    const isBest = def.kind === "best-practice" || def.kind === "leader-cohort";

    const payload: ComputedReferencePayload = {
      metrics: metricsForCohort(cohort, def.kind === "best-practice" && def.scope === "gcc" ? true : false),
      serviceMaturity: serviceMaturityForCohort(intlServices, isos),
      channelMaturity: channelMaturityForCohort(intlServices, isos),
      standardCompliance: await standardComplianceForCohort(isos),
    };

    // For best-practice scope, also store a "best" view of metrics
    if (isBest) {
      payload.metrics = metricsForCohort(cohort, true);
    }

    await prisma.computedReference.upsert({
      where: { slug: def.slug },
      update: {
        name: def.name,
        shortName: def.shortName,
        kind: def.kind,
        scope: def.scope,
        description: def.description,
        formula: def.formula,
        cohortSize: cohort.length,
        asOfDate: new Date(),
        payload: JSON.stringify(payload),
      },
      create: {
        slug: def.slug,
        name: def.name,
        shortName: def.shortName,
        kind: def.kind,
        scope: def.scope,
        description: def.description,
        formula: def.formula,
        cohortSize: cohort.length,
        asOfDate: new Date(),
        payload: JSON.stringify(payload),
      },
    });

    cohortSizes[def.slug] = cohort.length;
    refreshed += 1;
  }

  return { refreshed, cohortSizes };
}

export async function getAllComputedReferences() {
  const rows = await prisma.computedReference.findMany({ orderBy: { slug: "asc" } });
  return rows.map((r) => ({
    slug: r.slug,
    name: r.name,
    shortName: r.shortName,
    kind: r.kind,
    scope: r.scope,
    description: r.description,
    formula: r.formula,
    cohortSize: r.cohortSize,
    asOfDate: r.asOfDate?.toISOString() ?? null,
    payload: JSON.parse(r.payload) as ComputedReferencePayload,
  }));
}

export async function getComputedReference(slug: string) {
  const row = await prisma.computedReference.findUnique({ where: { slug } });
  if (!row) return null;
  return {
    slug: row.slug,
    name: row.name,
    shortName: row.shortName,
    kind: row.kind,
    scope: row.scope,
    description: row.description,
    formula: row.formula,
    cohortSize: row.cohortSize,
    asOfDate: row.asOfDate?.toISOString() ?? null,
    payload: JSON.parse(row.payload) as ComputedReferencePayload,
  };
}
