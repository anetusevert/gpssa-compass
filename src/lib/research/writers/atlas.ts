import { prisma } from "@/lib/db";
import type { ScreenType, ResearchSource } from "../types";
import { createSourcesAndCitations } from "./sources";
import { ensureCountryBenchmarkScores } from "@/lib/benchmarking/scoring";
import { BENCHMARK_DATASET_SLUG } from "@/lib/benchmarking/catalog";

const PROMPT_TO_DIMENSION_SLUG: Record<string, string> = {
  serviceRange: "service-breadth",
  digitalMaturity: "digital-maturity",
  operationalEfficiency: "operational-efficiency",
  citizenExperience: "customer-experience",
  innovationCapacity: "innovation",
  governance: "governance-compliance",
};

function maturityLabelFor(score: number): string {
  if (score < 20) return "Initial";
  if (score < 40) return "Managed";
  if (score < 60) return "Defined";
  if (score < 80) return "Quantitatively Managed";
  return "Optimizing";
}

function jsonifyStringArr(val: unknown): string | undefined {
  if (!Array.isArray(val) || val.length === 0) return undefined;
  return JSON.stringify(val.map((v) => String(v)));
}

function jsonifyArr(val: unknown): string | undefined {
  return Array.isArray(val) && val.length > 0 ? JSON.stringify(val) : undefined;
}

function jsonifyObj(val: unknown): string | undefined {
  return val && typeof val === "object" && !Array.isArray(val) ? JSON.stringify(val) : undefined;
}

export async function writeAtlasWorldmap(
  results: Record<string, unknown>[],
  agentLabel: string
): Promise<number> {
  let written = 0;
  for (const r of results) {
    const iso3Key = r._itemKey as string | undefined;
    const countryName = String(r.countryName ?? r.name ?? "");

    let country = null;

    if (iso3Key) {
      country = await prisma.country.findUnique({ where: { iso3: iso3Key } });
    }

    if (!country && countryName) {
      country = await prisma.country.findFirst({
        where: { name: { equals: countryName, mode: "insensitive" } },
      });
    }

    if (!country) {
      console.warn(`[atlas-writer] No Country row found for iso3=${iso3Key} name="${countryName}" — skipping`);
      continue;
    }

    await prisma.country.update({
      where: { id: country.id },
      data: {
        institution: r.institution ? String(r.institution) : undefined,
        systemType: r.systemType ? String(r.systemType) : undefined,
        yearEstablished: typeof r.yearEstablished === "number" ? r.yearEstablished : undefined,
        maturityScore: typeof r.maturityScore === "number" ? r.maturityScore : undefined,
        maturityLabel: r.maturityLabel ? String(r.maturityLabel) : undefined,
        coverageRate: typeof r.coverageRate === "number" ? r.coverageRate : undefined,
        replacementRate: typeof r.replacementRate === "number" ? r.replacementRate : undefined,
        sustainability: typeof r.sustainability === "number" ? r.sustainability : undefined,
        digitalLevel: r.digitalLevel ? String(r.digitalLevel) : undefined,
        keyFeatures: jsonifyArr(r.keyFeatures),
        challenges: jsonifyArr(r.challenges),
        insights: jsonifyArr(r.insights),
        legislativeFramework: r.legislativeFramework ? String(r.legislativeFramework) : undefined,
        contributionRates: jsonifyObj(r.contributionRates),
        retirementAge: jsonifyObj(r.retirementAge),
        benefitTypes: jsonifyArr(r.benefitTypes),
        fundManagement: r.fundManagement ? String(r.fundManagement) : undefined,
        recentReforms: jsonifyArr(r.recentReforms),
        internationalRankings: jsonifyObj(r.internationalRankings),
        iloConventionsRatified: r.iloConventionsRatified ? String(r.iloConventionsRatified) : undefined,
        populationCovered: r.populationCovered ? String(r.populationCovered) : undefined,
        dataSources: jsonifyArr(r.dataSources),
        socialProtectionExpenditure: r.socialProtectionExpenditure ? String(r.socialProtectionExpenditure) : undefined,
        dependencyRatio: r.dependencyRatio ? String(r.dependencyRatio) : undefined,
        pensionFundAssets: r.pensionFundAssets ? String(r.pensionFundAssets) : undefined,
        benefitCalculation: r.benefitCalculation ? String(r.benefitCalculation) : undefined,
        indexationMechanism: r.indexationMechanism ? String(r.indexationMechanism) : undefined,
        vestingPeriod: r.vestingPeriod ? String(r.vestingPeriod) : undefined,
        governanceQuality: r.governanceQuality ? String(r.governanceQuality) : undefined,
        researchStatus: "completed",
        systemStatus: "completed",
        performanceStatus: "completed",
        insightsStatus: "completed",
        researchedAt: new Date(),
        researchSource: agentLabel,
        rawResearchData: JSON.stringify(r),
      },
    });
    written++;

    if (Array.isArray(r.dataSources)) {
      try {
        await createSourcesAndCitations(
          r.dataSources as ResearchSource[],
          "country",
          country.id
        );
      } catch (e) {
        console.warn(`[atlas-writer] CountrySourceCitation failed for ${country.iso3}:`, e);
      }
    }

    try {
      const dataset = await prisma.benchmarkDataset.findFirst({
        where: { targetInstitutionId: { not: null } },
        orderBy: { createdAt: "desc" },
      });
      if (dataset) {
        await ensureCountryBenchmarkScores(country.iso3, dataset.id);
      }
    } catch (e) {
      console.warn(`[atlas-writer] Benchmarking sync failed for ${country.iso3}:`, e);
    }
  }
  return written;
}

export async function writeAtlasBenchmarking(
  results: Record<string, unknown>[],
  agentLabel: string
): Promise<number> {
  let written = 0;
  for (const r of results) {
    const name = String(r.institutionName ?? r.name ?? "");
    const countryCode = String(r.countryCode ?? "");
    if (!name) continue;

    const strengthsJson = jsonifyStringArr(r.strengths);
    const gapsJson = jsonifyStringArr(r.gaps);
    const transferableJson = jsonifyStringArr(r.transferablePractices);

    const institution = await prisma.institution.upsert({
      where: { name },
      create: {
        name,
        shortName: name.length > 20 ? name.substring(0, 20) : undefined,
        country: String(r.country ?? ""),
        countryCode,
        region: String(r.region ?? "GCC"),
        description: r.description ? String(r.description) : undefined,
        services: r.services ? String(r.services) : undefined,
        digitalMaturity: r.digitalMaturity ? String(r.digitalMaturity) : undefined,
        keyInnovations: r.keyInnovations ? String(r.keyInnovations) : undefined,
        strengths: strengthsJson,
        gaps: gapsJson,
        transferablePractices: transferableJson,
      },
      update: {
        description: r.description ? String(r.description) : undefined,
        services: r.services ? String(r.services) : undefined,
        digitalMaturity: r.digitalMaturity ? String(r.digitalMaturity) : undefined,
        keyInnovations: r.keyInnovations ? String(r.keyInnovations) : undefined,
        strengths: strengthsJson,
        gaps: gapsJson,
        transferablePractices: transferableJson,
      },
    });

    if (Array.isArray(r.sources)) {
      await createSourcesAndCitations(
        r.sources as ResearchSource[],
        "institution",
        institution.id
      );
    }

    const scores = (r.scores ?? {}) as Record<string, unknown>;
    if (scores && typeof scores === "object" && Object.keys(scores).length > 0) {
      try {
        const dataset = await prisma.benchmarkDataset.upsert({
          where: { slug: BENCHMARK_DATASET_SLUG },
          create: {
            slug: BENCHMARK_DATASET_SLUG,
            name: "GPSSA Benchmarking Intelligence Dataset",
            description: "Benchmarking dataset hydrated from atlas-benchmarking agent.",
          },
          update: {},
        });

        for (const [promptKey, raw] of Object.entries(scores)) {
          const slug = PROMPT_TO_DIMENSION_SLUG[promptKey];
          if (!slug) continue;
          const score = typeof raw === "number" ? raw : Number(raw);
          if (!Number.isFinite(score)) continue;

          const dimension = await prisma.benchmarkDimension.findUnique({
            where: { slug },
          });
          if (!dimension) continue;

          await prisma.benchmarkInstitutionScore.upsert({
            where: {
              datasetId_institutionId_dimensionId: {
                datasetId: dataset.id,
                institutionId: institution.id,
                dimensionId: dimension.id,
              },
            },
            create: {
              datasetId: dataset.id,
              institutionId: institution.id,
              dimensionId: dimension.id,
              score,
              maturityLabel: maturityLabelFor(score),
            },
            update: { score, maturityLabel: maturityLabelFor(score) },
          });
        }
      } catch (e) {
        console.warn(`[atlas-benchmarking-writer] score persistence failed for ${name}:`, e);
      }
    }
    written++;
  }
  return written;
}

async function findCountry(iso3Key?: string, countryName?: string) {
  let country = null;
  if (iso3Key) {
    country = await prisma.country.findUnique({ where: { iso3: iso3Key } });
  }
  if (!country && countryName) {
    country = await prisma.country.findFirst({
      where: { name: { equals: countryName, mode: "insensitive" } },
    });
  }
  return country;
}

async function writeCountrySources(
  countryId: string,
  iso3: string,
  rawSources: unknown
): Promise<void> {
  if (!Array.isArray(rawSources)) return;
  try {
    await createSourcesAndCitations(rawSources as ResearchSource[], "country", countryId);
  } catch (e) {
    console.warn(`[atlas-writer] CountrySourceCitation failed for ${iso3}:`, e);
  }
}

export async function writeAtlasSystem(
  results: Record<string, unknown>[],
  agentLabel: string
): Promise<number> {
  let written = 0;
  for (const r of results) {
    const country = await findCountry(r._itemKey as string | undefined, String(r.countryName ?? ""));
    if (!country) {
      console.warn(`[atlas-system] No Country for iso3=${r._itemKey} name=${r.countryName}`);
      continue;
    }
    await prisma.country.update({
      where: { id: country.id },
      data: {
        institution: r.institution ? String(r.institution) : undefined,
        systemType: r.systemType ? String(r.systemType) : undefined,
        yearEstablished: typeof r.yearEstablished === "number" ? r.yearEstablished : undefined,
        legislativeFramework: r.legislativeFramework ? String(r.legislativeFramework) : undefined,
        contributionRates: jsonifyObj(r.contributionRates),
        retirementAge: jsonifyObj(r.retirementAge),
        benefitTypes: jsonifyArr(r.benefitTypes),
        fundManagement: r.fundManagement ? String(r.fundManagement) : undefined,
        vestingPeriod: r.vestingPeriod ? String(r.vestingPeriod) : undefined,
        benefitCalculation: r.benefitCalculation ? String(r.benefitCalculation) : undefined,
        indexationMechanism: r.indexationMechanism ? String(r.indexationMechanism) : undefined,
        governanceQuality: r.governanceQuality ? String(r.governanceQuality) : undefined,
        iloConventionsRatified: r.iloConventionsRatified ? String(r.iloConventionsRatified) : undefined,
        populationCovered: r.populationCovered ? String(r.populationCovered) : undefined,
        systemStatus: "completed",
        researchedAt: new Date(),
        researchSource: agentLabel,
      },
    });
    await writeCountrySources(country.id, country.iso3, r.dataSources);
    written++;
  }
  return written;
}

export async function writeAtlasPerformance(
  results: Record<string, unknown>[],
  agentLabel: string
): Promise<number> {
  let written = 0;
  for (const r of results) {
    const country = await findCountry(r._itemKey as string | undefined, String(r.countryName ?? ""));
    if (!country) {
      console.warn(`[atlas-performance] No Country for iso3=${r._itemKey} name=${r.countryName}`);
      continue;
    }
    await prisma.country.update({
      where: { id: country.id },
      data: {
        maturityScore: typeof r.maturityScore === "number" ? r.maturityScore : undefined,
        maturityLabel: r.maturityLabel ? String(r.maturityLabel) : undefined,
        coverageRate: typeof r.coverageRate === "number" ? r.coverageRate : undefined,
        replacementRate: typeof r.replacementRate === "number" ? r.replacementRate : undefined,
        sustainability: typeof r.sustainability === "number" ? r.sustainability : undefined,
        digitalLevel: r.digitalLevel ? String(r.digitalLevel) : undefined,
        internationalRankings: jsonifyObj(r.internationalRankings),
        socialProtectionExpenditure: r.socialProtectionExpenditure ? String(r.socialProtectionExpenditure) : undefined,
        dependencyRatio: r.dependencyRatio ? String(r.dependencyRatio) : undefined,
        pensionFundAssets: r.pensionFundAssets ? String(r.pensionFundAssets) : undefined,
        performanceStatus: "completed",
        researchedAt: new Date(),
        researchSource: agentLabel,
      },
    });
    await writeCountrySources(country.id, country.iso3, r.dataSources);

    try {
      const dataset = await prisma.benchmarkDataset.findFirst({
        where: { targetInstitutionId: { not: null } },
        orderBy: { createdAt: "desc" },
      });
      if (dataset) {
        await ensureCountryBenchmarkScores(country.iso3, dataset.id);
      }
    } catch (e) {
      console.warn(`[atlas-performance] Benchmarking sync failed for ${country.iso3}:`, e);
    }
    written++;
  }
  return written;
}

export async function writeAtlasInsights(
  results: Record<string, unknown>[],
  agentLabel: string
): Promise<number> {
  let written = 0;
  for (const r of results) {
    const country = await findCountry(r._itemKey as string | undefined, String(r.countryName ?? ""));
    if (!country) {
      console.warn(`[atlas-insights] No Country for iso3=${r._itemKey} name=${r.countryName}`);
      continue;
    }
    await prisma.country.update({
      where: { id: country.id },
      data: {
        keyFeatures: jsonifyArr(r.keyFeatures),
        challenges: jsonifyArr(r.challenges),
        insights: jsonifyArr(r.insights),
        recentReforms: jsonifyArr(r.recentReforms),
        insightsStatus: "completed",
        researchedAt: new Date(),
        researchSource: agentLabel,
      },
    });
    await writeCountrySources(country.id, country.iso3, r.dataSources);
    written++;
  }
  return written;
}

export async function writeAtlasResults(
  screenType: ScreenType,
  results: Record<string, unknown>[],
  agentLabel: string
): Promise<number> {
  switch (screenType) {
    case "atlas-worldmap":
      return writeAtlasWorldmap(results, agentLabel);
    case "atlas-system":
      return writeAtlasSystem(results, agentLabel);
    case "atlas-performance":
      return writeAtlasPerformance(results, agentLabel);
    case "atlas-insights":
      return writeAtlasInsights(results, agentLabel);
    case "atlas-benchmarking":
      return writeAtlasBenchmarking(results, agentLabel);
    default:
      return 0;
  }
}
