/**
 * Standards-Compliance Writer
 *
 * Post-processes any agent result that contains a `standardsAlignment`
 * array (see `standards-instruction.ts`) and creates / updates the
 * corresponding `StandardCompliance` rows linking the entity to the
 * canonical Standards.
 *
 * Idempotent — safe to call repeatedly.
 *
 * Entity-type vocabulary used here matches the API:
 *   "country" | "service" | "product" | "channel" | "institution" |
 *   "gpssa-service" | "delivery-model" | "persona" | "segment"
 */

import { prisma } from "@/lib/db";
import type { ResearchSource } from "../types";
import { createSourcesAndCitations } from "./sources";

export interface StandardsAlignmentItem {
  standardSlug: string;
  score?: number;
  band?: string;
  rationale?: string;
  requirementSlugs?: string[];
}

export interface ComplianceWriteParams {
  entityType: string;
  entityId: string;
  entityLabel?: string | null;
  countryIso3?: string | null;
  agentLabel: string;
  alignment: unknown;
  sources?: ResearchSource[];
}

const VALID_BANDS = new Set(["leading", "advanced", "competent", "developing", "basic"]);

function normaliseBand(band?: string, score?: number): string {
  if (band) {
    const lower = band.toLowerCase();
    if (VALID_BANDS.has(lower)) return lower;
  }
  if (score == null) return "developing";
  if (score >= 85) return "leading";
  if (score >= 70) return "advanced";
  if (score >= 55) return "competent";
  if (score >= 35) return "developing";
  return "basic";
}

function clampScore(score?: number): number {
  if (typeof score !== "number" || Number.isNaN(score)) return 50;
  return Math.max(0, Math.min(100, score));
}

/**
 * Write StandardCompliance rows for a single entity.
 *
 * Returns the number of compliance rows written.
 */
export async function writeStandardsAlignment(
  params: ComplianceWriteParams
): Promise<number> {
  const { entityType, entityId, entityLabel, countryIso3, agentLabel, alignment, sources } = params;

  if (!Array.isArray(alignment)) return 0;
  const items = alignment as StandardsAlignmentItem[];
  if (items.length === 0) return 0;

  let written = 0;
  const now = new Date();

  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const slug = String(item.standardSlug ?? "").trim();
    if (!slug) continue;

    const standard = await prisma.standard.findUnique({
      where: { slug },
      include: { requirements: true },
    });
    if (!standard) continue;

    const score = clampScore(item.score);
    const band = normaliseBand(item.band, score);
    const rationale = item.rationale ? String(item.rationale).slice(0, 1000) : null;

    const existing = await prisma.standardCompliance.findUnique({
      where: {
        standardId_entityType_entityId: {
          standardId: standard.id,
          entityType,
          entityId,
        },
      },
    });

    let complianceId: string;
    if (existing) {
      const updated = await prisma.standardCompliance.update({
        where: { id: existing.id },
        data: {
          entityLabel: entityLabel ?? existing.entityLabel,
          countryIso3: countryIso3 ?? existing.countryIso3,
          score,
          band,
          rationale,
          computedBy: agentLabel,
          asOfDate: now,
        },
      });
      complianceId = updated.id;
    } else {
      const created = await prisma.standardCompliance.create({
        data: {
          standardId: standard.id,
          entityType,
          entityId,
          entityLabel: entityLabel ?? null,
          countryIso3: countryIso3 ?? null,
          score,
          band,
          rationale,
          computedBy: agentLabel,
          asOfDate: now,
        },
      });
      complianceId = created.id;
    }

    /* ── Item-level scores when requirementSlugs given ── */
    if (Array.isArray(item.requirementSlugs) && item.requirementSlugs.length > 0) {
      for (const reqSlug of item.requirementSlugs) {
        const requirement = standard.requirements.find((r) => r.slug === reqSlug);
        if (!requirement) continue;
        await prisma.standardComplianceItem.upsert({
          where: {
            complianceId_requirementId: { complianceId, requirementId: requirement.id },
          },
          create: {
            complianceId,
            requirementId: requirement.id,
            score,
            status: score >= 70 ? "met" : score >= 40 ? "partial" : "not-met",
          },
          update: {
            score,
            status: score >= 70 ? "met" : score >= 40 ? "partial" : "not-met",
          },
        });
      }
    }

    /* ── Citation back to original sources used by this entity ── */
    if (Array.isArray(sources) && sources.length > 0) {
      try {
        // Re-use the generic source citation pipeline by piggy-backing on the
        // entity itself; the Standard already carries its own source links.
        // Here we do nothing extra because StandardComplianceSourceCitation
        // would require finer-grained source ids per item — left for a future
        // pass.
        await createSourcesAndCitations(sources, "intlService", entityId).catch(() => undefined);
      } catch { /* ignore */ }
    }

    written++;
  }

  return written;
}

/**
 * Convenience wrapper that walks an array of result rows and writes
 * compliance for each one. The caller provides a function that maps a
 * single result row to the entity-id/label it persisted.
 */
export async function writeStandardsAlignmentBatch(
  results: Record<string, unknown>[],
  agentLabel: string,
  resolver: (row: Record<string, unknown>) => {
    entityType: string;
    entityId: string;
    entityLabel?: string;
    countryIso3?: string | null;
  } | null
): Promise<number> {
  let total = 0;
  for (const row of results) {
    const ref = resolver(row);
    if (!ref) continue;
    total += await writeStandardsAlignment({
      ...ref,
      agentLabel,
      alignment: row.standardsAlignment,
      sources: Array.isArray(row.sources) ? (row.sources as ResearchSource[]) : undefined,
    });
  }
  return total;
}
