import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";

/**
 * GET /api/mandate/standards/[slug]
 *
 * Full record for a single Standard in the GPSSA mandate corpus, used by the
 * Article Browser on /dashboard/mandate/legal: every requirement (with the
 * agent's plain-English explainer), every linked source, and a list of the
 * concrete app entities (services / products / channels / segments / personas)
 * fulfilling each requirement.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { error } = await requireAuth();
  if (error) return error;

  const slug = params.slug;
  const standard = await prisma.standard.findUnique({
    where: { slug },
    include: {
      requirements: { orderBy: [{ sortOrder: "asc" }, { code: "asc" }] },
      sourceLinks: {
        include: {
          source: {
            select: { id: true, title: true, url: true, publisher: true, accessedAt: true },
          },
        },
      },
      compliances: {
        where: { computedBy: "agent:mandate-corpus" },
        select: { entityType: true, entityId: true, entityLabel: true, rationale: true },
      },
    },
  });

  if (!standard) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: standard.id,
    slug: standard.slug,
    code: standard.code,
    title: standard.title,
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
      pillar: r.pillar,
      sortOrder: r.sortOrder,
    })),
    sources: standard.sourceLinks.map((l) => l.source),
    obligationLinks: standard.compliances.map((c) => ({
      entityType: c.entityType,
      entityId: c.entityId,
      entityLabel: c.entityLabel,
      rationale: c.rationale,
    })),
  });
}
