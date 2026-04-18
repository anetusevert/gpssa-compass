/**
 * Writer for the Standards Auditor agent.
 *
 * Each result is a single GPSSA-level audit against one canonical Standard.
 * We persist:
 *   - one StandardCompliance row (entityType="institution", entityLabel=GPSSA)
 *   - one StandardComplianceItem per requirementScores[] entry
 *
 * The standards-bridge writer would also pick this up via standardsAlignment,
 * but the auditor is special because it carries per-requirement evidence,
 * so we write the items here directly.
 */

import { prisma } from "@/lib/db";
import type { ScreenType, ResearchSource } from "../types";
import { createSourcesAndCitations } from "./sources";

interface RequirementScore {
  requirementSlug: string;
  score: number;
  status?: string;
  evidence?: string;
}

const GPSSA_NAME = "General Pension and Social Security Authority (GPSSA)";

function clamp(n: unknown, fallback = 50): number {
  if (typeof n !== "number" || Number.isNaN(n)) return fallback;
  return Math.max(0, Math.min(100, n));
}

function bandFor(score: number): string {
  if (score >= 85) return "leading";
  if (score >= 70) return "advanced";
  if (score >= 55) return "competent";
  if (score >= 35) return "developing";
  return "basic";
}

function statusFor(score: number): string {
  if (score >= 70) return "met";
  if (score >= 40) return "partial";
  return "not-met";
}

export async function writeStandardsAuditorResults(
  _screenType: ScreenType,
  results: Record<string, unknown>[],
  agentLabel: string
): Promise<number> {
  let written = 0;
  const now = new Date();

  // Resolve GPSSA institution once (best-effort).
  const gpssaInst = await prisma.institution.findFirst({
    where: { name: { contains: "GPSSA", mode: "insensitive" } },
  });
  const gpssaEntityId = gpssaInst?.id ?? "gpssa";

  for (const r of results) {
    const slug = String(r.standardSlug ?? r._itemKey ?? "").trim();
    if (!slug) continue;

    const standard = await prisma.standard.findUnique({
      where: { slug },
      include: { requirements: true },
    });
    if (!standard) continue;

    const score = clamp(r.overallScore, 50);
    const band = String(r.overallBand ?? bandFor(score)).toLowerCase();
    const rationale = r.summary ? String(r.summary).slice(0, 1500) : null;

    const entityLabel = String(r.entityName ?? GPSSA_NAME);
    const countryIso3 = String(r.countryIso3 ?? "ARE");
    const entityType = String(r.entityType ?? "institution");

    const existing = await prisma.standardCompliance.findUnique({
      where: {
        standardId_entityType_entityId: {
          standardId: standard.id,
          entityType,
          entityId: gpssaEntityId,
        },
      },
    });

    let complianceId: string;
    if (existing) {
      const u = await prisma.standardCompliance.update({
        where: { id: existing.id },
        data: { entityLabel, countryIso3, score, band, rationale, computedBy: agentLabel, asOfDate: now },
      });
      complianceId = u.id;
    } else {
      const c = await prisma.standardCompliance.create({
        data: {
          standardId: standard.id,
          entityType,
          entityId: gpssaEntityId,
          entityLabel,
          countryIso3,
          score,
          band,
          rationale,
          computedBy: agentLabel,
          asOfDate: now,
        },
      });
      complianceId = c.id;
    }

    /* ── Per-requirement items ── */
    const reqScores = (Array.isArray(r.requirementScores) ? r.requirementScores : []) as RequirementScore[];
    for (const rs of reqScores) {
      const req = standard.requirements.find((x) => x.slug === rs.requirementSlug);
      if (!req) continue;
      const itemScore = clamp(rs.score, score);
      await prisma.standardComplianceItem.upsert({
        where: { complianceId_requirementId: { complianceId, requirementId: req.id } },
        create: {
          complianceId,
          requirementId: req.id,
          score: itemScore,
          status: rs.status ?? statusFor(itemScore),
          evidence: rs.evidence ? String(rs.evidence).slice(0, 1500) : null,
        },
        update: {
          score: itemScore,
          status: rs.status ?? statusFor(itemScore),
          evidence: rs.evidence ? String(rs.evidence).slice(0, 1500) : null,
        },
      });
    }

    /* ── Source citations ── */
    if (Array.isArray(r.sources) && gpssaInst) {
      try {
        await createSourcesAndCitations(r.sources as ResearchSource[], "institution", gpssaInst.id);
      } catch { /* ignore */ }
    }

    written++;
  }
  return written;
}
