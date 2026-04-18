import { prisma } from "@/lib/db";
import type { ScreenType, ResearchSource } from "../types";
import { createSourcesAndCitations } from "./sources";

export async function writeDeliveryChannels(
  results: Record<string, unknown>[],
  agentLabel: string
): Promise<number> {
  let written = 0;
  for (const r of results) {
    const name = String(r.name ?? "");
    if (!name) continue;

    const data = {
      channelType: String(r.channelType ?? "digital"),
      maturity: typeof r.maturity === "number" ? r.maturity : 0,
      servicesAvailable: typeof r.servicesAvailable === "number" ? r.servicesAvailable : 0,
      servicesTotal: typeof r.servicesTotal === "number" ? r.servicesTotal : 31,
      status: String(r.status ?? "Active"),
      capabilities: r.capabilities ? String(r.capabilities) : undefined,
      strengths: Array.isArray(r.strengths) ? JSON.stringify(r.strengths) : undefined,
      gaps: Array.isArray(r.gaps) ? JSON.stringify(r.gaps) : undefined,
      benchmarkComparison: r.benchmarkComparison ? String(r.benchmarkComparison) : undefined,
      researchStatus: "completed" as const,
      researchSource: agentLabel,
    };

    let channelId: string;
    const existing = await prisma.deliveryChannel.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });

    if (existing) {
      await prisma.deliveryChannel.update({ where: { id: existing.id }, data });
      channelId = existing.id;
    } else {
      const created = await prisma.deliveryChannel.create({ data: { name, ...data } });
      channelId = created.id;
    }

    if (Array.isArray(r.sources)) {
      await createSourcesAndCitations(r.sources as ResearchSource[], "channel", channelId);
    }
    written++;
  }
  return written;
}

export async function writeDeliveryPersonas(
  results: Record<string, unknown>[],
  agentLabel: string
): Promise<number> {
  let written = 0;
  for (const r of results) {
    const name = String(r.name ?? "");
    if (!name) continue;

    const data = {
      headline: r.headline ? String(r.headline) : undefined,
      ageRange: r.ageRange ? String(r.ageRange) : undefined,
      city: r.city ? String(r.city) : undefined,
      occupation: r.occupation ? String(r.occupation) : undefined,
      incomeRange: r.incomeRange ? String(r.incomeRange) : undefined,
      description: r.description ? String(r.description) : undefined,
      needs: Array.isArray(r.needs) ? JSON.stringify(r.needs) : undefined,
      coverageMap: r.coverageMap ? JSON.stringify(r.coverageMap) : undefined,
      segment: r.segment ? String(r.segment) : undefined,
      journeyHighlights: Array.isArray(r.journeyHighlights) ? JSON.stringify(r.journeyHighlights) : undefined,
      channelPreference: r.channelPreference ? String(r.channelPreference) : undefined,
      researchStatus: "completed" as const,
      researchSource: agentLabel,
    };

    let personaId: string;
    const existing = await prisma.customerPersona.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });

    if (existing) {
      await prisma.customerPersona.update({ where: { id: existing.id }, data });
      personaId = existing.id;
    } else {
      const created = await prisma.customerPersona.create({ data: { name, ...data } });
      personaId = created.id;
    }

    if (Array.isArray(r.sources)) {
      await createSourcesAndCitations(r.sources as ResearchSource[], "persona", personaId);
    }
    written++;
  }
  return written;
}

export async function writeDeliveryModels(
  results: Record<string, unknown>[],
  agentLabel: string
): Promise<number> {
  let written = 0;
  for (const r of results) {
    const name = String(r.name ?? "");
    if (!name) continue;

    const maturityLabel = String(r.maturity ?? "Low");
    const maturityScore = typeof r.maturityScore === "number" ? r.maturityScore
      : maturityLabel === "High" ? 85
      : maturityLabel === "Medium" ? 55
      : 30;

    const data = {
      description: r.description ? String(r.description) : undefined,
      channelMix: Array.isArray(r.channelMix) ? JSON.stringify(r.channelMix) : undefined,
      targetSegments: Array.isArray(r.targetSegments) ? JSON.stringify(r.targetSegments) : undefined,
      maturity: maturityScore,
      enablers: Array.isArray(r.enablers) ? JSON.stringify(r.enablers) : undefined,
      risks: Array.isArray(r.risks) ? JSON.stringify(r.risks) : undefined,
      benchmarkExamples: Array.isArray(r.benchmarkExamples) ? JSON.stringify(r.benchmarkExamples) : undefined,
      researchStatus: "completed" as const,
      researchSource: agentLabel,
    };

    let modelId: string;
    const existing = await prisma.deliveryModel.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });

    if (existing) {
      await prisma.deliveryModel.update({ where: { id: existing.id }, data });
      modelId = existing.id;
    } else {
      const created = await prisma.deliveryModel.create({ data: { name, ...data } });
      modelId = created.id;
    }

    if (Array.isArray(r.sources)) {
      await createSourcesAndCitations(r.sources as ResearchSource[], "deliveryModel", modelId);
    }
    written++;
  }
  return written;
}

export async function writeDeliveryResults(
  screenType: ScreenType,
  results: Record<string, unknown>[],
  agentLabel: string
): Promise<number> {
  switch (screenType) {
    case "delivery-channels":
      return writeDeliveryChannels(results, agentLabel);
    case "delivery-personas":
      return writeDeliveryPersonas(results, agentLabel);
    case "delivery-models":
      return writeDeliveryModels(results, agentLabel);
    default:
      return 0;
  }
}
