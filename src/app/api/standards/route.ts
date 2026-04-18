import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";

/**
 * GET /api/standards
 *
 * Returns all canonical Standards (ILO, ISSA, World Bank, OECD, Mercer, UN)
 * with their requirements and source citations. Used by the ComparatorPicker
 * across Atlas, Service Catalog, Channels, Products, Delivery and Benchmarking.
 *
 * Optional query params:
 *   ?body=ILO|ISSA|World Bank|OECD|Mercer|UN
 *   ?category=social-protection-floor|social-security-minimum|...
 *   ?scope=global|regional
 */
export async function GET(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const body = searchParams.get("body");
  const category = searchParams.get("category");
  const scope = searchParams.get("scope");

  const where: Record<string, unknown> = { isActive: true };
  if (body) where.body = body;
  if (category) where.category = category;
  if (scope) where.scope = scope;

  const standards = await prisma.standard.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    include: {
      requirements: { orderBy: { sortOrder: "asc" } },
      sourceLinks: {
        include: {
          source: {
            select: { id: true, title: true, url: true, publisher: true, accessedAt: true },
          },
        },
      },
      _count: { select: { compliances: true } },
    },
  });

  return NextResponse.json(
    standards.map((s) => ({
      id: s.id,
      slug: s.slug,
      code: s.code,
      title: s.title,
      body: s.body,
      bodyShort: s.bodyShort,
      category: s.category,
      scope: s.scope,
      region: s.region,
      description: s.description,
      rationale: s.rationale,
      url: s.url,
      publishedAt: s.publishedAt?.toISOString() ?? null,
      sortOrder: s.sortOrder,
      requirements: s.requirements.map((r) => ({
        id: r.id,
        slug: r.slug,
        code: r.code,
        title: r.title,
        description: r.description,
        weight: r.weight,
        pillar: r.pillar,
        sortOrder: r.sortOrder,
      })),
      sources: s.sourceLinks.map((l) => l.source),
      complianceCount: s._count.compliances,
    }))
  );
}
