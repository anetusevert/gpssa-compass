import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";

const MANDATE_CATEGORIES = ["legal-mandate", "circular", "policy"] as const;

/**
 * GET /api/mandate/standards
 *
 * Lists every Standard belonging to the GPSSA mandate corpus (legal mandates,
 * circulars, policies issued at the national level for the UAE). Supports an
 * optional ?category=... filter.
 */
export async function GET(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  const where: Record<string, unknown> = {
    region: "AE",
    isActive: true,
    category: category && (MANDATE_CATEGORIES as readonly string[]).includes(category)
      ? category
      : { in: [...MANDATE_CATEGORIES] },
  };

  const standards = await prisma.standard.findMany({
    where,
    orderBy: [{ category: "asc" }, { publishedAt: "desc" }, { title: "asc" }],
    include: {
      _count: { select: { requirements: true, compliances: true } },
      sourceLinks: {
        include: { source: { select: { id: true, title: true, url: true, publisher: true } } },
        take: 4,
      },
    },
  });

  return NextResponse.json(
    standards.map((s) => ({
      id: s.id,
      slug: s.slug,
      code: s.code,
      title: s.title,
      category: s.category,
      description: s.description,
      rationale: s.rationale,
      url: s.url,
      publishedAt: s.publishedAt?.toISOString() ?? null,
      requirementCount: s._count.requirements,
      complianceCount: s._count.compliances,
      sources: s.sourceLinks.map((l) => l.source),
    }))
  );
}
