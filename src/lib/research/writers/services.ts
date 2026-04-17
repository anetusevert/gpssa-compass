import { prisma } from "@/lib/db";
import type { ScreenType, ResearchSource } from "../types";
import { createSourcesAndCitations } from "./sources";

const UAE_ISO3 = "ARE";

export async function writeServicesCatalog(
  results: Record<string, unknown>[],
  agentLabel: string
): Promise<number> {
  let written = 0;
  for (const r of results) {
    const countryIso3 = String(r.countryIso3 ?? r._itemKey ?? "");
    const name = String(r.serviceName ?? r.name ?? "");
    if (!name || !countryIso3) continue;

    const institutionName = String(r.institutionName ?? "");
    let institutionId: string | null = null;
    if (institutionName) {
      const inst = await prisma.institution.findFirst({
        where: { name: { equals: institutionName, mode: "insensitive" } },
      });
      institutionId = inst?.id ?? null;
    }

    const channels = r.channelCapabilities as Record<string, string> | undefined;

    const intlData = {
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
      researchStatus: "completed" as const,
      researchSource: agentLabel,
    };

    const existing = await prisma.internationalService.findFirst({
      where: { name: { equals: name, mode: "insensitive" }, countryIso3 },
    });

    let intlServiceId: string;
    if (existing) {
      await prisma.internationalService.update({ where: { id: existing.id }, data: intlData });
      intlServiceId = existing.id;
    } else {
      const created = await prisma.internationalService.create({
        data: { name, countryIso3, ...intlData },
      });
      intlServiceId = created.id;
    }

    if (Array.isArray(r.sources)) {
      await createSourcesAndCitations(r.sources as ResearchSource[], "intlService", intlServiceId);
    }

    if (countryIso3 === UAE_ISO3) {
      await upsertGPSSAService(r, name, agentLabel);
    }

    written++;
  }
  return written;
}

export async function writeServicesChannels(
  results: Record<string, unknown>[],
  agentLabel: string
): Promise<number> {
  let written = 0;
  for (const r of results) {
    const countryIso3 = String(r.countryIso3 ?? r._itemKey ?? "");
    const name = String(r.serviceName ?? r.name ?? "");
    if (!name || !countryIso3) continue;

    const institutionName = String(r.institutionName ?? "");
    let institutionId: string | null = null;
    if (institutionName) {
      const inst = await prisma.institution.findFirst({
        where: { name: { equals: institutionName, mode: "insensitive" } },
      });
      institutionId = inst?.id ?? null;
    }

    const channels = r.channels as Record<string, string> | undefined;

    const intlData = {
      institutionId,
      category: String(r.serviceCategory ?? r.category ?? "General"),
      channelCapabilities: channels ? JSON.stringify(channels) : undefined,
      digitalReadiness: typeof r.channelMaturityScore === "number" ? r.channelMaturityScore : undefined,
      maturityLevel: r.digitalTransformationStage ? String(r.digitalTransformationStage) : undefined,
      researchStatus: "completed" as const,
      researchSource: agentLabel,
    };

    const existing = await prisma.internationalService.findFirst({
      where: { name: { equals: name, mode: "insensitive" }, countryIso3 },
    });

    if (existing) {
      await prisma.internationalService.update({ where: { id: existing.id }, data: intlData });
    } else {
      await prisma.internationalService.create({
        data: { name, countryIso3, ...intlData },
      });
    }

    if (countryIso3 === UAE_ISO3 && channels) {
      const gpssaService = await findOrCreateGPSSAService(name, String(r.serviceCategory ?? r.category ?? "General"), agentLabel);
      for (const [channelName, level] of Object.entries(channels)) {
        await prisma.serviceChannelCapability.upsert({
          where: { serviceId_channelName: { serviceId: gpssaService.id, channelName } },
          create: {
            serviceId: gpssaService.id,
            channelName,
            capabilityLevel: String(level),
            notes: r.notes ? String(r.notes) : undefined,
            researchStatus: "completed",
            researchSource: agentLabel,
          },
          update: {
            capabilityLevel: String(level),
            notes: r.notes ? String(r.notes) : undefined,
            researchStatus: "completed",
            researchSource: agentLabel,
          },
        });
      }
    }

    written++;
  }
  return written;
}

async function upsertGPSSAService(
  r: Record<string, unknown>,
  name: string,
  agentLabel: string
): Promise<void> {
  const data = {
    category: String(r.category ?? "General"),
    description: r.description ? String(r.description) : undefined,
    userTypes: Array.isArray(r.userTypes) ? JSON.stringify(r.userTypes) : undefined,
    currentState: r.currentState ? String(r.currentState) : undefined,
    painPoints: Array.isArray(r.painPoints) ? JSON.stringify(r.painPoints) : undefined,
    opportunities: Array.isArray(r.opportunities) ? JSON.stringify(r.opportunities) : undefined,
    digitalReadiness: typeof r.digitalReadiness === "number" ? r.digitalReadiness : undefined,
    maturityLevel: r.maturityLevel ? String(r.maturityLevel) : undefined,
    bestPracticeComparison: r.bestPracticeComparison ? String(r.bestPracticeComparison) : undefined,
    strengths: Array.isArray(r.strengths) ? JSON.stringify(r.strengths) : undefined,
    iloAlignment: r.iloAlignment ? String(r.iloAlignment) : undefined,
    researchStatus: "completed" as const,
    researchSource: agentLabel,
  };

  const existing = await prisma.gPSSAService.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });

  if (existing) {
    await prisma.gPSSAService.update({ where: { id: existing.id }, data });
  } else {
    await prisma.gPSSAService.create({ data: { name, ...data } });
  }
}

async function findOrCreateGPSSAService(
  name: string,
  category: string,
  agentLabel: string
) {
  const existing = await prisma.gPSSAService.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });
  if (existing) return existing;
  return prisma.gPSSAService.create({
    data: {
      name,
      category,
      researchStatus: "completed",
      researchSource: agentLabel,
    },
  });
}

export async function writeServicesResults(
  screenType: ScreenType,
  results: Record<string, unknown>[],
  agentLabel: string
): Promise<number> {
  switch (screenType) {
    case "services-catalog":
      return writeServicesCatalog(results, agentLabel);
    case "services-channels":
      return writeServicesChannels(results, agentLabel);
    default:
      return 0;
  }
}
