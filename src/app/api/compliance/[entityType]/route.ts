import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";

/**
 * GET /api/compliance/[entityType]
 *
 * Returns StandardCompliance rows for a given entityType
 *   ("country" | "service" | "product" | "channel" | "institution" | "gpssa")
 *
 * Optional query params:
 *   ?entityId=<id>     // restrict to a single entity
 *   ?countryIso3=<iso> // restrict to a single country (for "country" type)
 *   ?standardSlug=<slug>
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entityType: string }> }
) {
  const { error } = await requireAuth();
  if (error) return error;

  const { entityType } = await params;
  const { searchParams } = new URL(request.url);
  const entityId = searchParams.get("entityId");
  const countryIso3 = searchParams.get("countryIso3");
  const standardSlug = searchParams.get("standardSlug");

  const where: Record<string, unknown> = { entityType };
  if (entityId) where.entityId = entityId;
  if (countryIso3) where.countryIso3 = countryIso3;
  if (standardSlug) {
    where.standard = { slug: standardSlug };
  }

  const compliances = await prisma.standardCompliance.findMany({
    where,
    orderBy: [{ score: "desc" }],
    include: {
      standard: {
        select: { id: true, slug: true, code: true, title: true, body: true, bodyShort: true, category: true, scope: true },
      },
      itemScores: {
        include: {
          requirement: { select: { slug: true, title: true, weight: true, pillar: true } },
        },
      },
      sourceLinks: {
        include: {
          source: { select: { id: true, title: true, url: true, publisher: true } },
        },
      },
    },
  });

  return NextResponse.json(
    compliances.map((c) => ({
      id: c.id,
      standard: c.standard,
      entityType: c.entityType,
      entityId: c.entityId,
      entityLabel: c.entityLabel,
      countryIso3: c.countryIso3,
      score: c.score,
      band: c.band,
      rationale: c.rationale,
      computedBy: c.computedBy,
      asOfDate: c.asOfDate?.toISOString() ?? null,
      itemScores: c.itemScores.map((i) => ({
        requirementSlug: i.requirement.slug,
        requirementTitle: i.requirement.title,
        weight: i.requirement.weight,
        pillar: i.requirement.pillar,
        score: i.score,
        status: i.status,
        evidence: i.evidence,
      })),
      sources: c.sourceLinks.map((l) => l.source),
    }))
  );
}
