import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";

/**
 * GET /api/standards/[slug]
 *
 * Full detail for one Standard: requirements, source citations, and the
 * complete compliance matrix (every entity scored against this standard).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { error } = await requireAuth();
  if (error) return error;

  const { slug } = await params;

  const standard = await prisma.standard.findUnique({
    where: { slug },
    include: {
      requirements: { orderBy: { sortOrder: "asc" } },
      sourceLinks: {
        include: {
          source: true,
        },
      },
      compliances: {
        orderBy: { score: "desc" },
        include: {
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
      },
    },
  });

  if (!standard) {
    return NextResponse.json({ error: "Standard not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: standard.id,
    slug: standard.slug,
    code: standard.code,
    title: standard.title,
    body: standard.body,
    bodyShort: standard.bodyShort,
    category: standard.category,
    scope: standard.scope,
    region: standard.region,
    description: standard.description,
    rationale: standard.rationale,
    url: standard.url,
    publishedAt: standard.publishedAt?.toISOString() ?? null,
    requirements: standard.requirements.map((r) => ({
      id: r.id,
      slug: r.slug,
      code: r.code,
      title: r.title,
      description: r.description,
      weight: r.weight,
      pillar: r.pillar,
      sortOrder: r.sortOrder,
    })),
    sources: standard.sourceLinks.map((l) => ({
      ...l.source,
      citation: l.citation,
      evidenceNote: l.evidenceNote,
    })),
    compliances: standard.compliances.map((c) => ({
      id: c.id,
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
    })),
  });
}
