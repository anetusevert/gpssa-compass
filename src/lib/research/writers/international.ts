import { prisma } from "@/lib/db";
import type { ScreenType, ResearchSource } from "../types";
import { createSourcesAndCitations } from "./sources";

export async function writeIntlServicesCatalog(
  results: Record<string, unknown>[],
  agentLabel: string
): Promise<number> {
  let written = 0;
  for (const r of results) {
    const name = String(r.serviceName ?? r.name ?? "");
    const countryIso3 = String(r.countryIso3 ?? "");
    if (!name || !countryIso3) continue;

    const institutionName = String(r.institutionName ?? "");
    let institutionId: string | null = null;
    if (institutionName) {
      const inst = await prisma.institution.findFirst({
        where: { name: { equals: institutionName, mode: "insensitive" } },
      });
      institutionId = inst?.id ?? null;
    }

    const existing = await prisma.internationalService.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        countryIso3,
      },
    });

    const channels = r.channelCapabilities as Record<string, string> | undefined;

    const data = {
      institutionId,
      category: String(r.category ?? "General"),
      description: r.description ? String(r.description) : undefined,
      userTypes: Array.isArray(r.userTypes) ? JSON.stringify(r.userTypes) : undefined,
      digitalReadiness: typeof r.digitalReadiness === "number" ? r.digitalReadiness : undefined,
      maturityLevel: r.maturityLevel ? String(r.maturityLevel) : undefined,
      channelCapabilities: channels ? JSON.stringify(channels) : undefined,
      painPoints: Array.isArray(r.painPoints) ? JSON.stringify(r.painPoints) : undefined,
      strengths: Array.isArray(r.strengths) ? JSON.stringify(r.strengths) : undefined,
      iloAlignment: r.iloAlignment ? String(r.iloAlignment) : undefined,
      currentState: r.currentState ? String(r.currentState) : undefined,
      opportunities: Array.isArray(r.opportunities) ? JSON.stringify(r.opportunities) : undefined,
      bestPracticeComparison: r.bestPracticeComparison ? String(r.bestPracticeComparison) : undefined,
      researchStatus: "completed" as const,
      researchSource: agentLabel,
    };

    let serviceId: string;
    if (existing) {
      await prisma.internationalService.update({ where: { id: existing.id }, data });
      serviceId = existing.id;
    } else {
      const created = await prisma.internationalService.create({
        data: { name, countryIso3, ...data },
      });
      serviceId = created.id;
    }

    if (Array.isArray(r.sources)) {
      await createSourcesAndCitations(r.sources as ResearchSource[], "intlService", serviceId);
    }
    written++;
  }
  return written;
}

export async function writeIntlServicesChannels(
  results: Record<string, unknown>[],
  agentLabel: string
): Promise<number> {
  let written = 0;
  for (const r of results) {
    const name = String(r.serviceName ?? r.name ?? "");
    const countryIso3 = String(r.countryIso3 ?? "");
    if (!name || !countryIso3) continue;

    const existing = await prisma.internationalService.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        countryIso3,
      },
    });

    const channels = r.channelCapabilities as Record<string, string> | undefined;
    const data = {
      category: existing?.category ?? String(r.category ?? "General"),
      channelCapabilities: channels ? JSON.stringify(channels) : undefined,
      digitalReadiness: typeof r.digitalReadiness === "number" ? r.digitalReadiness : undefined,
      bestChannelPractice: r.bestChannelPractice ? String(r.bestChannelPractice) : undefined,
      gapAnalysis: r.gapAnalysis ? String(r.gapAnalysis) : undefined,
      researchStatus: "completed" as const,
      researchSource: agentLabel,
    };

    let serviceId: string;
    if (existing) {
      await prisma.internationalService.update({ where: { id: existing.id }, data });
      serviceId = existing.id;
    } else {
      const created = await prisma.internationalService.create({
        data: { name, countryIso3, ...data },
      });
      serviceId = created.id;
    }

    if (Array.isArray(r.sources)) {
      await createSourcesAndCitations(r.sources as ResearchSource[], "intlService", serviceId);
    }
    written++;
  }
  return written;
}

export async function writeIntlProductsPortfolio(
  results: Record<string, unknown>[],
  agentLabel: string
): Promise<number> {
  let written = 0;
  for (const r of results) {
    const name = String(r.name ?? "");
    const countryIso3 = String(r.countryIso3 ?? "");
    if (!name || !countryIso3) continue;

    const institutionName = String(r.institutionName ?? "");
    let institutionId: string | null = null;
    if (institutionName) {
      const inst = await prisma.institution.findFirst({
        where: { name: { equals: institutionName, mode: "insensitive" } },
      });
      institutionId = inst?.id ?? null;
    }

    const existing = await prisma.internationalProduct.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        countryIso3,
      },
    });

    const data = {
      institutionId,
      tier: String(r.tier ?? "Core"),
      status: String(r.status ?? "Active"),
      description: r.description ? String(r.description) : undefined,
      targetSegments: Array.isArray(r.targetSegments) ? JSON.stringify(r.targetSegments) : undefined,
      coverageType: r.coverageType ? String(r.coverageType) : undefined,
      keyFeatures: Array.isArray(r.keyFeatures) ? JSON.stringify(r.keyFeatures) : undefined,
      regulatoryBasis: r.regulatoryBasis ? String(r.regulatoryBasis) : undefined,
      iloAlignment: r.iloAlignment ? String(r.iloAlignment) : undefined,
      researchStatus: "completed" as const,
      researchSource: agentLabel,
    };

    let productId: string;
    if (existing) {
      await prisma.internationalProduct.update({ where: { id: existing.id }, data });
      productId = existing.id;
    } else {
      const created = await prisma.internationalProduct.create({
        data: { name, countryIso3, ...data },
      });
      productId = created.id;
    }

    if (Array.isArray(r.sources)) {
      await createSourcesAndCitations(r.sources as ResearchSource[], "intlProduct", productId);
    }
    written++;
  }
  return written;
}

export async function writeIntlProductsSegments(
  results: Record<string, unknown>[],
  agentLabel: string
): Promise<number> {
  let written = 0;
  for (const r of results) {
    const segment = String(r.segment ?? "");
    const coverageType = String(r.coverageType ?? "");
    const countryIso3 = String(r.countryIso3 ?? "");
    if (!segment || !coverageType || !countryIso3) continue;

    const existing = await prisma.internationalSegmentCoverage.findFirst({
      where: { segment: { equals: segment, mode: "insensitive" }, coverageType, countryIso3 },
    });

    const data = {
      level: String(r.level ?? "Limited"),
      population: r.population ? String(r.population) : undefined,
      notes: r.notes ? String(r.notes) : undefined,
      regulatoryBasis: r.regulatoryBasis ? String(r.regulatoryBasis) : undefined,
      researchStatus: "completed" as const,
      researchSource: agentLabel,
    };

    let segmentId: string;
    if (existing) {
      await prisma.internationalSegmentCoverage.update({ where: { id: existing.id }, data });
      segmentId = existing.id;
    } else {
      const created = await prisma.internationalSegmentCoverage.create({
        data: { segment, coverageType, countryIso3, ...data },
      });
      segmentId = created.id;
    }

    if (Array.isArray(r.sources)) {
      await createSourcesAndCitations(r.sources as ResearchSource[], "intlSegment", segmentId);
    }
    written++;
  }
  return written;
}

export async function writeIntlDeliveryChannels(
  results: Record<string, unknown>[],
  agentLabel: string
): Promise<number> {
  let written = 0;
  for (const r of results) {
    const name = String(r.name ?? "");
    const countryIso3 = String(r.countryIso3 ?? "");
    if (!name || !countryIso3) continue;

    const institutionName = String(r.institutionName ?? "");
    let institutionId: string | null = null;
    if (institutionName) {
      const inst = await prisma.institution.findFirst({
        where: { name: { equals: institutionName, mode: "insensitive" } },
      });
      institutionId = inst?.id ?? null;
    }

    const existing = await prisma.internationalDeliveryChannel.findFirst({
      where: { name: { equals: name, mode: "insensitive" }, countryIso3 },
    });

    const data = {
      institutionId,
      channelType: String(r.channelType ?? "Digital — Web"),
      maturity: typeof r.maturity === "number" ? r.maturity : 0,
      servicesAvailable: typeof r.servicesAvailable === "number" ? r.servicesAvailable : 0,
      servicesTotal: typeof r.servicesTotal === "number" ? r.servicesTotal : 0,
      status: String(r.status ?? "Active"),
      capabilities: r.capabilities ? String(r.capabilities) : undefined,
      strengths: r.strengths ? String(r.strengths) : undefined,
      gaps: r.gaps ? String(r.gaps) : undefined,
      benchmarkComparison: r.benchmarkComparison ? String(r.benchmarkComparison) : undefined,
      researchStatus: "completed" as const,
      researchSource: agentLabel,
    };

    let channelId: string;
    if (existing) {
      await prisma.internationalDeliveryChannel.update({ where: { id: existing.id }, data });
      channelId = existing.id;
    } else {
      const created = await prisma.internationalDeliveryChannel.create({
        data: { name, countryIso3, ...data },
      });
      channelId = created.id;
    }

    if (Array.isArray(r.sources)) {
      await createSourcesAndCitations(r.sources as ResearchSource[], "intlChannel", channelId);
    }
    written++;
  }
  return written;
}

export async function writeIntlDeliveryPersonas(
  results: Record<string, unknown>[],
  agentLabel: string
): Promise<number> {
  let written = 0;
  for (const r of results) {
    const name = String(r.name ?? "");
    const countryIso3 = String(r.countryIso3 ?? "");
    if (!name || !countryIso3) continue;

    const existing = await prisma.internationalCustomerPersona.findFirst({
      where: { name: { equals: name, mode: "insensitive" }, countryIso3 },
    });

    const data = {
      headline: r.headline ? String(r.headline) : undefined,
      ageRange: r.ageRange ? String(r.ageRange) : undefined,
      city: r.city ? String(r.city) : undefined,
      occupation: r.occupation ? String(r.occupation) : undefined,
      incomeRange: r.incomeRange ? String(r.incomeRange) : undefined,
      description: r.description ? String(r.description) : undefined,
      needs: r.needs ? String(r.needs) : undefined,
      coverageMap: r.coverageMap ? String(r.coverageMap) : undefined,
      segment: r.segment ? String(r.segment) : undefined,
      journeyHighlights: r.journeyHighlights ? String(r.journeyHighlights) : undefined,
      channelPreference: r.channelPreference ? String(r.channelPreference) : undefined,
      researchStatus: "completed" as const,
      researchSource: agentLabel,
    };

    let personaId: string;
    if (existing) {
      await prisma.internationalCustomerPersona.update({ where: { id: existing.id }, data });
      personaId = existing.id;
    } else {
      const created = await prisma.internationalCustomerPersona.create({
        data: { name, countryIso3, ...data },
      });
      personaId = created.id;
    }

    if (Array.isArray(r.sources)) {
      await createSourcesAndCitations(r.sources as ResearchSource[], "intlPersona", personaId);
    }
    written++;
  }
  return written;
}

export async function writeIntlDeliveryModels(
  results: Record<string, unknown>[],
  agentLabel: string
): Promise<number> {
  let written = 0;
  for (const r of results) {
    const name = String(r.name ?? "");
    const countryIso3 = String(r.countryIso3 ?? "");
    if (!name || !countryIso3) continue;

    const existing = await prisma.internationalDeliveryModel.findFirst({
      where: { name: { equals: name, mode: "insensitive" }, countryIso3 },
    });

    const data = {
      description: r.description ? String(r.description) : undefined,
      channelMix: r.channelMix ? String(r.channelMix) : undefined,
      targetSegments: r.targetSegments ? String(r.targetSegments) : undefined,
      maturity: typeof r.maturity === "number" ? r.maturity : 0,
      enablers: r.enablers ? String(r.enablers) : undefined,
      risks: r.risks ? String(r.risks) : undefined,
      benchmarkExamples: r.benchmarkExamples ? String(r.benchmarkExamples) : undefined,
      researchStatus: "completed" as const,
      researchSource: agentLabel,
    };

    let modelId: string;
    if (existing) {
      await prisma.internationalDeliveryModel.update({ where: { id: existing.id }, data });
      modelId = existing.id;
    } else {
      const created = await prisma.internationalDeliveryModel.create({
        data: { name, countryIso3, ...data },
      });
      modelId = created.id;
    }

    if (Array.isArray(r.sources)) {
      await createSourcesAndCitations(r.sources as ResearchSource[], "intlDeliveryModel", modelId);
    }
    written++;
  }
  return written;
}

export async function writeILOStandards(
  results: Record<string, unknown>[],
  _agentLabel: string
): Promise<number> {
  let written = 0;
  for (const r of results) {
    const code = String(r.code ?? "");
    const title = String(r.title ?? "");
    if (!code || !title) continue;

    const data = {
      title,
      category: String(r.category ?? "governance"),
      description: r.description ? String(r.description) : undefined,
      provisions: Array.isArray(r.provisions) ? JSON.stringify(r.provisions) : undefined,
      applicableTo: Array.isArray(r.applicableTo) ? JSON.stringify(r.applicableTo) : undefined,
      adoptionStatus: r.adoptionStatus ? String(r.adoptionStatus) : undefined,
      url: r.url ? String(r.url) : undefined,
      researchStatus: "completed" as const,
      researchSource: _agentLabel,
    };

    await prisma.iLOStandard.upsert({
      where: { code },
      create: { code, ...data },
      update: data,
    });
    written++;
  }
  return written;
}

export async function writeInternationalResults(
  screenType: ScreenType,
  results: Record<string, unknown>[],
  agentLabel: string
): Promise<number> {
  switch (screenType) {
    case "intl-services-catalog":
      return writeIntlServicesCatalog(results, agentLabel);
    case "intl-services-channels":
      return writeIntlServicesChannels(results, agentLabel);
    case "intl-products-portfolio":
      return writeIntlProductsPortfolio(results, agentLabel);
    case "intl-products-segments":
      return writeIntlProductsSegments(results, agentLabel);
    case "intl-delivery-channels":
      return writeIntlDeliveryChannels(results, agentLabel);
    case "intl-delivery-personas":
      return writeIntlDeliveryPersonas(results, agentLabel);
    case "intl-delivery-models":
      return writeIntlDeliveryModels(results, agentLabel);
    case "ilo-standards":
      return writeILOStandards(results, agentLabel);
    default:
      return 0;
  }
}
