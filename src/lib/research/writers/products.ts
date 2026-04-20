import { prisma } from "@/lib/db";
import type { ScreenType, ResearchSource } from "../types";
import { createSourcesAndCitations } from "./sources";
import { LABOR_SEGMENTS, resolveSegment } from "@/lib/taxonomy/segments";

// One-shot legacy migration: any SegmentCoverage row whose `segment` matches
// a known legacyAlias gets renamed to its canonical label. Idempotent — once
// rows are migrated, subsequent calls find no matches.
let __legacyMigrated = false;
async function migrateLegacySegmentLabels() {
  if (__legacyMigrated) return;
  __legacyMigrated = true;
  for (const seg of LABOR_SEGMENTS) {
    if (seg.legacyAliases.length === 0) continue;
    try {
      await prisma.segmentCoverage.updateMany({
        where: { segment: { in: seg.legacyAliases } },
        data: { segment: seg.label },
      });
    } catch (err) {
      // Tolerate unique-constraint conflicts when both old + new rows exist;
      // they'll be reconciled on next research run via upsert-by-(segment,coverageType).
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`[migrateLegacySegmentLabels] skipped ${seg.slug}:`, message);
    }
  }
}

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
      regulatoryBasis: r.regulatoryBasis ? String(r.regulatoryBasis) : undefined,
      comparableInternational: r.comparableInternational ? String(r.comparableInternational) : undefined,
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
  await migrateLegacySegmentLabels();

  let written = 0;
  for (const r of results) {
    const rawSegment = String(r.segment ?? "");
    const coverageType = String(r.coverageType ?? "");
    if (!rawSegment || !coverageType) continue;

    // Force canonical label so any "Saudi —" output from the LLM is rewritten
    // to "National —" / "Expat —" / etc. before persistence.
    const canonical = resolveSegment(rawSegment);
    const segment = canonical?.label ?? rawSegment;

    const existing = await prisma.segmentCoverage.findFirst({
      where: { segment: { equals: segment, mode: "insensitive" }, coverageType },
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

export async function writeProductsInnovation(
  results: Record<string, unknown>[],
  agentLabel: string
): Promise<number> {
  let written = 0;
  for (const r of results) {
    const title = String(r.title ?? r.name ?? "");
    if (!title) continue;

    const existing = await prisma.productInnovation.findFirst({
      where: { title: { equals: title, mode: "insensitive" } },
    });

    const data = {
      description: r.description ? String(r.description) : undefined,
      targetSegment: r.targetSegment ? String(r.targetSegment) : undefined,
      impactScore: typeof r.impactScore === "number" ? r.impactScore : undefined,
      feasibilityScore: typeof r.feasibilityScore === "number" ? r.feasibilityScore : undefined,
      status: r.status ? String(r.status) : undefined,
      innovationType: r.innovationType ? String(r.innovationType) : undefined,
      estimatedPopulation: r.estimatedPopulation ? String(r.estimatedPopulation) : undefined,
      researchStatus: "completed" as const,
      researchSource: agentLabel,
    };

    let innovationId: string;
    if (existing) {
      await prisma.productInnovation.update({ where: { id: existing.id }, data });
      innovationId = existing.id;
    } else {
      const created = await prisma.productInnovation.create({ data: { title, ...data } });
      innovationId = created.id;
    }

    if (Array.isArray(r.sources)) {
      await createSourcesAndCitations(r.sources as ResearchSource[], "innovation", innovationId);
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
    case "products-innovation":
      return writeProductsInnovation(results, agentLabel);
    default:
      return 0;
  }
}
