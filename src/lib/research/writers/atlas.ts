import { prisma } from "@/lib/db";
import type { ScreenType, ResearchSource } from "../types";
import { createSourcesAndCitations } from "./sources";

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

    if (!country) continue;

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
        researchedAt: new Date(),
        researchSource: agentLabel,
        rawResearchData: JSON.stringify(r),
      },
    });
    written++;
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

    await prisma.institution.upsert({
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
      },
      update: {
        description: r.description ? String(r.description) : undefined,
        services: r.services ? String(r.services) : undefined,
        digitalMaturity: r.digitalMaturity ? String(r.digitalMaturity) : undefined,
        keyInnovations: r.keyInnovations ? String(r.keyInnovations) : undefined,
      },
    });

    if (Array.isArray(r.sources)) {
      const institution = await prisma.institution.findUnique({ where: { name } });
      if (institution) {
        await createSourcesAndCitations(
          r.sources as ResearchSource[],
          "institution",
          institution.id
        );
      }
    }
    written++;
  }
  return written;
}

export async function writeAtlasResults(
  screenType: ScreenType,
  results: Record<string, unknown>[],
  agentLabel: string
): Promise<number> {
  if (screenType === "atlas-worldmap") {
    return writeAtlasWorldmap(results, agentLabel);
  }
  return writeAtlasBenchmarking(results, agentLabel);
}
