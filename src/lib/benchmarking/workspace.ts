import { prisma } from "@/lib/db";
import { BENCHMARK_DATASET_SLUG } from "./catalog";

export interface BenchmarkSourceReference {
  id: string;
  title: string;
  publisher: string | null;
  url: string;
  sourceType: string;
  description: string | null;
  region: string | null;
  citation: string | null;
  evidenceNote: string | null;
}

export interface BenchmarkDimensionPayload {
  slug: string;
  name: string;
  description: string | null;
  category: string | null;
  sortOrder: number;
}

export interface BenchmarkInstitutionPayload {
  id: string;
  name: string;
  shortName: string;
  country: string;
  countryCode: string;
  region: string;
  description: string | null;
  digitalMaturity: string | null;
  websiteUrl: string | null;
  isBenchmarkTarget: boolean;
  scores: Record<string, number>;
  scoreEvidence: Record<string, BenchmarkSourceReference[]>;
}

export interface BenchmarkKpiPayload {
  slug: string;
  name: string;
  ribbonLabel: string | null;
  unit: string | null;
  category: string | null;
  direction: string;
  description: string | null;
  values: {
    comparator: string;
    label: string;
    value: number;
    note: string | null;
    sources: BenchmarkSourceReference[];
  }[];
}

export interface BenchmarkWorkspacePayload {
  dataset: {
    slug: string;
    name: string;
    description: string | null;
    methodology: string | null;
    coverageNote: string | null;
    publishedAt: string | null;
  };
  dimensions: BenchmarkDimensionPayload[];
  targetInstitution: BenchmarkInstitutionPayload;
  peerInstitutions: BenchmarkInstitutionPayload[];
  kpis: BenchmarkKpiPayload[];
  sourceCount: number;
}

function mapScoreSources(
  links: Array<{
    citation: string | null;
    evidenceNote: string | null;
    source: {
      id: string;
      title: string;
      publisher: string | null;
      url: string;
      sourceType: string;
      description: string | null;
      region: string | null;
    };
  }>
): BenchmarkSourceReference[] {
  return links.map((link) => ({
    id: link.source.id,
    title: link.source.title,
    publisher: link.source.publisher,
    url: link.source.url,
    sourceType: link.source.sourceType,
    description: link.source.description,
    region: link.source.region,
    citation: link.citation,
    evidenceNote: link.evidenceNote,
  }));
}

export async function getBenchmarkWorkspace(
  datasetSlug = BENCHMARK_DATASET_SLUG
): Promise<BenchmarkWorkspacePayload | null> {
  const dataset = await prisma.benchmarkDataset.findUnique({
    where: { slug: datasetSlug },
    include: {
      targetInstitution: true,
    },
  });

  if (!dataset || !dataset.targetInstitution) {
    return null;
  }

  const [dimensions, institutions, scores, kpiValues, sourceCount] = await Promise.all([
    prisma.benchmarkDimension.findMany({
      orderBy: { sortOrder: "asc" },
    }),
    prisma.institution.findMany({
      where: {
        OR: [
          { isBenchmarkTarget: true },
          { benchmarkScores: { some: { datasetId: dataset.id } } },
        ],
      },
      orderBy: [{ isBenchmarkTarget: "desc" }, { shortName: "asc" }, { name: "asc" }],
    }),
    prisma.benchmarkInstitutionScore.findMany({
      where: { datasetId: dataset.id },
      include: {
        institution: true,
        dimension: true,
        sourceLinks: {
          include: { source: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    }),
    prisma.benchmarkKpiValue.findMany({
      where: { datasetId: dataset.id },
      include: {
        kpi: true,
        sourceLinks: {
          include: { source: true },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: [{ kpi: { ribbonOrder: "asc" } }, { comparator: "asc" }],
    }),
    prisma.benchmarkSource.count(),
  ]);

  const scoreMap = new Map<string, Record<string, number>>();
  const evidenceMap = new Map<string, Record<string, BenchmarkSourceReference[]>>();

  for (const score of scores) {
    const currentScores = scoreMap.get(score.institutionId) ?? {};
    currentScores[score.dimension.slug] = score.score;
    scoreMap.set(score.institutionId, currentScores);

    const currentEvidence = evidenceMap.get(score.institutionId) ?? {};
    currentEvidence[score.dimension.slug] = mapScoreSources(score.sourceLinks);
    evidenceMap.set(score.institutionId, currentEvidence);
  }

  const institutionPayload = institutions.map<BenchmarkInstitutionPayload>((institution) => ({
    id: institution.id,
    name: institution.name,
    shortName: institution.shortName ?? institution.name,
    country: institution.country,
    countryCode: institution.countryCode,
    region: institution.region,
    description: institution.description,
    digitalMaturity: institution.digitalMaturity,
    websiteUrl: institution.websiteUrl,
    isBenchmarkTarget: institution.isBenchmarkTarget,
    scores: scoreMap.get(institution.id) ?? {},
    scoreEvidence: evidenceMap.get(institution.id) ?? {},
  }));

  const targetInstitution =
    institutionPayload.find((institution) => institution.isBenchmarkTarget) ?? institutionPayload[0];

  const kpiMap = new Map<string, BenchmarkKpiPayload>();
  for (const value of kpiValues) {
    const existing = kpiMap.get(value.kpi.slug);
    const payloadValue = {
      comparator: value.comparator,
      label: value.label,
      value: value.value,
      note: value.note,
      sources: mapScoreSources(value.sourceLinks),
    };

    if (existing) {
      existing.values.push(payloadValue);
      continue;
    }

    kpiMap.set(value.kpi.slug, {
      slug: value.kpi.slug,
      name: value.kpi.name,
      ribbonLabel: value.kpi.ribbonLabel,
      unit: value.kpi.unit,
      category: value.kpi.category,
      direction: value.kpi.direction,
      description: value.kpi.description,
      values: [payloadValue],
    });
  }

  return {
    dataset: {
      slug: dataset.slug,
      name: dataset.name,
      description: dataset.description,
      methodology: dataset.methodology,
      coverageNote: dataset.coverageNote,
      publishedAt: dataset.publishedAt?.toISOString() ?? null,
    },
    dimensions: dimensions.map((dimension) => ({
      slug: dimension.slug,
      name: dimension.name,
      description: dimension.description,
      category: dimension.category,
      sortOrder: dimension.sortOrder,
    })),
    targetInstitution,
    peerInstitutions: institutionPayload.filter((institution) => institution.id !== targetInstitution.id),
    kpis: Array.from(kpiMap.values()),
    sourceCount,
  };
}
