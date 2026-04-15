import { prisma } from "@/lib/db";
import { digitalLevelScore } from "@/lib/countries/country-data";

interface CountryScoreInput {
  maturityScore: number | null;
  coverageRate: number | null;
  replacementRate: number | null;
  sustainability: number | null;
  digitalLevel: string | null;
}

const DIMENSION_MAPPERS: Record<string, (c: CountryScoreInput) => number> = {
  "digital-maturity": (c) => ((c.maturityScore ?? 0) / 4) * 100,
  "service-breadth": (c) => (c.coverageRate ?? 0),
  "customer-experience": (c) => digitalLevelScore(c.digitalLevel) > 25 ? digitalLevelScore(c.digitalLevel) : 30,
  "operational-efficiency": (c) => ((c.sustainability ?? 0) / 4) * 100,
  "innovation": (c) => ((c.maturityScore ?? 0) / 4) * 85,
  "governance-compliance": (c) => ((c.sustainability ?? 0) / 4) * 90,
  "data-analytics": (c) => digitalLevelScore(c.digitalLevel),
  "channel-strategy": (c) => Math.min(((c.coverageRate ?? 0) + digitalLevelScore(c.digitalLevel)) / 2, 100),
};

export function computeCountryDimensionScores(
  country: CountryScoreInput
): Record<string, number> {
  const scores: Record<string, number> = {};
  for (const [dim, mapper] of Object.entries(DIMENSION_MAPPERS)) {
    scores[dim] = Math.round(mapper(country) * 10) / 10;
  }
  return scores;
}

export async function ensureCountryBenchmarkScores(
  countryIso3: string,
  datasetId: string
): Promise<string | null> {
  const country = await prisma.country.findUnique({
    where: { iso3: countryIso3 },
  });

  if (!country || country.researchStatus !== "completed") return null;

  let institution = await prisma.institution.findFirst({
    where: { countryCode: country.iso2 ?? "" },
  });

  if (!institution) {
    institution = await prisma.institution.create({
      data: {
        name: country.institution ?? `${country.name} Social Security`,
        shortName: country.iso3,
        country: country.name,
        countryCode: country.iso2 ?? country.iso3.substring(0, 2),
        region: country.region,
        countryId: country.id,
        description: `Social security system of ${country.name}`,
        digitalMaturity: country.digitalLevel ?? "Unknown",
      },
    });
  }

  const dimensions = await prisma.benchmarkDimension.findMany();
  const scores = computeCountryDimensionScores({
    maturityScore: country.maturityScore,
    coverageRate: country.coverageRate,
    replacementRate: country.replacementRate,
    sustainability: country.sustainability,
    digitalLevel: country.digitalLevel,
  });

  for (const dim of dimensions) {
    const score = scores[dim.slug] ?? 50;
    await prisma.benchmarkInstitutionScore.upsert({
      where: {
        datasetId_institutionId_dimensionId: {
          datasetId,
          institutionId: institution.id,
          dimensionId: dim.id,
        },
      },
      update: { score },
      create: {
        datasetId,
        institutionId: institution.id,
        dimensionId: dim.id,
        score,
        maturityLabel: country.maturityLabel,
      },
    });
  }

  return institution.id;
}
