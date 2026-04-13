import type { PrismaClient } from "@prisma/client";
import {
  BENCHMARK_DATASET,
  BENCHMARK_DIMENSIONS,
  BENCHMARK_INSTITUTIONS,
  BENCHMARK_KPIS,
  BENCHMARK_SCORE_MATRIX,
  BENCHMARK_SOURCES,
} from "./catalog";

function maturityLabel(score: number) {
  if (score >= 90) return "World-class";
  if (score >= 78) return "Advanced";
  if (score >= 60) return "Emerging";
  return "Developing";
}

function benchmarkReferenceSlug(region: string, isBenchmarkTarget?: boolean) {
  if (isBenchmarkTarget) return "un-egov";
  if (region === "GCC") return "oecd-pensions";
  return "mercer-gpi";
}

export async function seedBenchmarkDataset(prisma: PrismaClient) {
  const sourceIds = new Map<string, string>();
  const institutionIds = new Map<string, string>();
  const dimensionIds = new Map<string, string>();
  const kpiIds = new Map<string, string>();

  for (const source of BENCHMARK_SOURCES) {
    const record = await prisma.benchmarkSource.upsert({
      where: { slug: source.slug },
      update: {
        title: source.title,
        publisher: source.publisher,
        url: source.url,
        sourceType: source.sourceType,
        description: source.description,
        region: source.region ?? null,
        notes: source.notes ?? null,
        accessedAt: new Date(),
      },
      create: {
        slug: source.slug,
        title: source.title,
        publisher: source.publisher,
        url: source.url,
        sourceType: source.sourceType,
        description: source.description,
        region: source.region ?? null,
        notes: source.notes ?? null,
        accessedAt: new Date(),
      },
    });
    sourceIds.set(source.slug, record.id);
  }

  for (const institution of BENCHMARK_INSTITUTIONS) {
    const record = await prisma.institution.upsert({
      where: { name: institution.name },
      update: {
        shortName: institution.shortName,
        country: institution.country,
        countryCode: institution.countryCode,
        region: institution.region,
        description: institution.description,
        digitalMaturity: institution.digitalMaturity,
        websiteUrl: institution.websiteUrl,
        isBenchmarkTarget: institution.isBenchmarkTarget ?? false,
      },
      create: {
        name: institution.name,
        shortName: institution.shortName,
        country: institution.country,
        countryCode: institution.countryCode,
        region: institution.region,
        description: institution.description,
        digitalMaturity: institution.digitalMaturity,
        websiteUrl: institution.websiteUrl,
        isBenchmarkTarget: institution.isBenchmarkTarget ?? false,
      },
    });
    institutionIds.set(institution.shortName, record.id);
  }

  for (const dimension of BENCHMARK_DIMENSIONS) {
    const record = await prisma.benchmarkDimension.upsert({
      where: { slug: dimension.slug },
      update: {
        name: dimension.name,
        description: dimension.description,
        category: dimension.category,
        sortOrder: dimension.sortOrder,
      },
      create: dimension,
    });
    dimensionIds.set(dimension.slug, record.id);
  }

  for (const kpi of BENCHMARK_KPIS) {
    const record = await prisma.benchmarkKpi.upsert({
      where: { slug: kpi.slug },
      update: {
        name: kpi.name,
        description: kpi.description,
        category: kpi.category,
        unit: kpi.unit,
        direction: kpi.direction,
        ribbonLabel: kpi.ribbonLabel,
      },
      create: {
        slug: kpi.slug,
        name: kpi.name,
        description: kpi.description,
        category: kpi.category,
        unit: kpi.unit,
        direction: kpi.direction,
        ribbonLabel: kpi.ribbonLabel,
        ribbonOrder: BENCHMARK_KPIS.findIndex((item) => item.slug === kpi.slug) + 1,
      },
    });
    kpiIds.set(kpi.slug, record.id);
  }

  const existingDataset = await prisma.benchmarkDataset.findUnique({
    where: { slug: BENCHMARK_DATASET.slug },
    select: { id: true },
  });

  if (existingDataset) {
    await prisma.benchmarkDataset.delete({
      where: { id: existingDataset.id },
    });
  }

  const targetInstitutionId = institutionIds.get("GPSSA");
  if (!targetInstitutionId) {
    throw new Error("GPSSA target institution is missing from benchmark seed.");
  }

  const dataset = await prisma.benchmarkDataset.create({
    data: {
      slug: BENCHMARK_DATASET.slug,
      name: BENCHMARK_DATASET.name,
      description: BENCHMARK_DATASET.description,
      methodology: BENCHMARK_DATASET.methodology,
      coverageNote: BENCHMARK_DATASET.coverageNote,
      publishedAt: new Date("2026-04-13T00:00:00.000Z"),
      targetInstitutionId,
    },
  });

  let scoreCount = 0;
  let kpiValueCount = 0;
  let sourceLinkCount = 0;

  for (const institution of BENCHMARK_INSTITUTIONS) {
    const institutionId = institutionIds.get(institution.shortName);
    if (!institutionId) continue;

    for (const dimension of BENCHMARK_DIMENSIONS) {
      const score = BENCHMARK_SCORE_MATRIX[institution.shortName]?.[dimension.slug];
      if (typeof score !== "number") continue;

      const institutionSourceId = sourceIds.get(institution.sourceSlug);
      const referenceSourceId = sourceIds.get(
        benchmarkReferenceSlug(institution.region, institution.isBenchmarkTarget)
      );

      const createdScore = await prisma.benchmarkInstitutionScore.create({
        data: {
          datasetId: dataset.id,
          institutionId,
          dimensionId: dimensionIds.get(dimension.slug)!,
          score,
          maturityLabel: maturityLabel(score),
          note: `${institution.shortName} score for ${dimension.name} is a curated benchmark index derived from public evidence and normalized onto a 100-point comparative scale.`,
        },
      });

      const sourceLinks = [institutionSourceId, referenceSourceId].filter(
        (value): value is string => Boolean(value)
      );

      for (let sortOrder = 0; sortOrder < sourceLinks.length; sortOrder += 1) {
        const sourceId = sourceLinks[sortOrder];
        await prisma.benchmarkInstitutionScoreSource.create({
          data: {
            scoreId: createdScore.id,
            sourceId,
            sortOrder,
            citation:
              sortOrder === 0
                ? `${institution.shortName} official digital presence and service information`
                : "Comparative benchmark reference used to calibrate the score",
            evidenceNote:
              sortOrder === 0
                ? `Primary institutional source for ${institution.shortName}.`
                : "External comparative context for normalization and peer positioning.",
          },
        });
        sourceLinkCount += 1;
      }

      scoreCount += 1;
    }
  }

  for (const kpi of BENCHMARK_KPIS) {
    const kpiId = kpiIds.get(kpi.slug);
    if (!kpiId) continue;

    for (const value of kpi.values) {
      const createdValue = await prisma.benchmarkKpiValue.create({
        data: {
          datasetId: dataset.id,
          kpiId,
          comparator: value.comparator,
          label: value.label,
          value: value.value,
          note: value.note,
        },
      });

      for (let sortOrder = 0; sortOrder < value.sourceSlugs.length; sortOrder += 1) {
        const sourceSlug = value.sourceSlugs[sortOrder];
        const sourceId = sourceIds.get(sourceSlug);
        if (!sourceId) continue;
        await prisma.benchmarkKpiValueSource.create({
          data: {
            valueId: createdValue.id,
            sourceId,
            sortOrder,
            citation: `${kpi.name} evidence reference`,
            evidenceNote: value.note,
          },
        });
        sourceLinkCount += 1;
      }

      kpiValueCount += 1;
    }
  }

  return {
    datasetId: dataset.id,
    institutionCount: BENCHMARK_INSTITUTIONS.filter((item) => !item.isBenchmarkTarget).length,
    scoreCount,
    kpiValueCount,
    sourceCount: BENCHMARK_SOURCES.length,
    sourceLinkCount,
  };
}
