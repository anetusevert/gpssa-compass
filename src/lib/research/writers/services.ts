import { prisma } from "@/lib/db";
import type { ScreenType, ResearchSource } from "../types";
import { createSourcesAndCitations } from "./sources";

export async function writeServicesCatalog(
  results: Record<string, unknown>[],
  agentLabel: string
): Promise<number> {
  let written = 0;
  for (const r of results) {
    const itemKey = r._itemKey as string | undefined;
    const name = String(r.serviceName ?? r.name ?? "");
    if (!name && !itemKey) continue;

    let existing = null;
    if (itemKey) {
      existing = await prisma.gPSSAService.findUnique({ where: { id: itemKey } });
    }
    if (!existing && name) {
      existing = await prisma.gPSSAService.findFirst({
        where: { name: { equals: name, mode: "insensitive" } },
      });
    }

    const data = {
      category: String(r.category ?? "General"),
      description: r.description ? String(r.description) : undefined,
      userTypes: Array.isArray(r.userTypes) ? JSON.stringify(r.userTypes) : undefined,
      currentState: r.currentState ? String(r.currentState) : undefined,
      painPoints: Array.isArray(r.painPoints) ? JSON.stringify(r.painPoints) : undefined,
      opportunities: Array.isArray(r.opportunities) ? JSON.stringify(r.opportunities) : undefined,
      researchStatus: "completed" as const,
      researchSource: agentLabel,
    };

    let serviceId: string;
    if (existing) {
      await prisma.gPSSAService.update({ where: { id: existing.id }, data });
      serviceId = existing.id;
    } else {
      const created = await prisma.gPSSAService.create({ data: { name, ...data } });
      serviceId = created.id;
    }

    if (Array.isArray(r.sources)) {
      await createSourcesAndCitations(r.sources as ResearchSource[], "service", serviceId);
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
    const serviceName = String(r.serviceName ?? r.name ?? "");
    if (!serviceName) continue;

    const service = await prisma.gPSSAService.findFirst({
      where: { name: { equals: serviceName, mode: "insensitive" } },
    });

    let serviceId: string;
    if (service) {
      serviceId = service.id;
    } else {
      const created = await prisma.gPSSAService.create({
        data: {
          name: serviceName,
          category: String(r.serviceCategory ?? "General"),
          researchStatus: "completed",
          researchSource: agentLabel,
        },
      });
      serviceId = created.id;
    }

    const channels = r.channels as Record<string, string> | undefined;
    if (channels && typeof channels === "object") {
      for (const [channelName, level] of Object.entries(channels)) {
        await prisma.serviceChannelCapability.upsert({
          where: { serviceId_channelName: { serviceId, channelName } },
          create: {
            serviceId,
            channelName,
            capabilityLevel: String(level),
            researchStatus: "completed",
            researchSource: agentLabel,
          },
          update: {
            capabilityLevel: String(level),
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
