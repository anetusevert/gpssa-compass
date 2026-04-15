import { prisma } from "@/lib/db";
import type { ScreenType, ResearchSource } from "../types";
import { createSourcesAndCitations } from "./sources";

export async function writeProductsPortfolio(
  results: Record<string, unknown>[],
  agentLabel: string
): Promise<number> {
  let written = 0;
  for (const r of results) {
    const name = String(r.name ?? "");
    if (!name) continue;

    const existing = await prisma.product.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });

    const data = {
      tier: String(r.tier ?? "Core"),
      status: String(r.status ?? "Active"),
      description: r.description ? String(r.description) : undefined,
      targetSegments: Array.isArray(r.targetSegments) ? JSON.stringify(r.targetSegments) : undefined,
      coverageType: r.coverageType ? String(r.coverageType) : undefined,
      keyFeatures: Array.isArray(r.keyFeatures) ? JSON.stringify(r.keyFeatures) : undefined,
      researchStatus: "completed" as const,
      researchSource: agentLabel,
    };

    let productId: string;
    if (existing) {
      await prisma.product.update({ where: { id: existing.id }, data });
      productId = existing.id;
    } else {
      const created = await prisma.product.create({ data: { name, ...data } });
      productId = created.id;
    }

    if (Array.isArray(r.sources)) {
      await createSourcesAndCitations(r.sources as ResearchSource[], "product", productId);
    }
    written++;
  }
  return written;
}

export async function writeProductsSegments(
  results: Record<string, unknown>[],
  agentLabel: string
): Promise<number> {
  let written = 0;
  for (const r of results) {
    const segment = String(r.segment ?? "");
    const coverageType = String(r.coverageType ?? "");
    if (!segment || !coverageType) continue;

    const existing = await prisma.segmentCoverage.findFirst({
      where: { segment: { equals: segment, mode: "insensitive" }, coverageType },
    });

    const data = {
      level: String(r.level ?? "Limited"),
      population: r.population ? String(r.population) : undefined,
      notes: r.notes ? String(r.notes) : undefined,
      researchStatus: "completed" as const,
      researchSource: agentLabel,
    };

    let segmentId: string;
    if (existing) {
      await prisma.segmentCoverage.update({ where: { id: existing.id }, data });
      segmentId = existing.id;
    } else {
      const created = await prisma.segmentCoverage.create({ data: { segment, coverageType, ...data } });
      segmentId = created.id;
    }

    if (Array.isArray(r.sources)) {
      await createSourcesAndCitations(r.sources as ResearchSource[], "segment", segmentId);
    }
    written++;
  }
  return written;
}

export async function writeProductsResults(
  screenType: ScreenType,
  results: Record<string, unknown>[],
  agentLabel: string
): Promise<number> {
  switch (screenType) {
    case "products-portfolio":
      return writeProductsPortfolio(results, agentLabel);
    case "products-segments":
      return writeProductsSegments(results, agentLabel);
    default:
      return 0;
  }
}
