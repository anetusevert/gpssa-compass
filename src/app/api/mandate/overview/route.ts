import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";

const MANDATE_CATEGORIES = ["legal-mandate", "circular", "policy"] as const;

/**
 * GET /api/mandate/overview
 *
 * Returns aggregate counts and the small set of "featured" objects used by the
 * Mandate Hero / Overview page: the latest milestones, the most prominent laws
 * (the federal pension law and its executive regulations when present), and a
 * snapshot of how many obligation-to-entity links the agent has produced so
 * far.
 */
export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  const [
    standardsCount,
    requirementsCount,
    milestonesCount,
    pagesCount,
    pdfPagesCount,
    complianceCount,
    featuredStandards,
    latestMilestones,
  ] = await Promise.all([
    prisma.standard.count({ where: { category: { in: [...MANDATE_CATEGORIES] }, region: "AE" } }),
    prisma.standardRequirement.count({
      where: { standard: { category: { in: [...MANDATE_CATEGORIES] }, region: "AE" } },
    }),
    prisma.gpssaMilestone.count(),
    prisma.gpssaPage.count(),
    prisma.gpssaPage.count({ where: { contentType: "pdf" } }),
    prisma.standardCompliance.count({ where: { computedBy: "agent:mandate-corpus" } }),
    prisma.standard.findMany({
      where: { category: { in: [...MANDATE_CATEGORIES] }, region: "AE", isActive: true },
      orderBy: [{ category: "asc" }, { publishedAt: "desc" }, { title: "asc" }],
      take: 6,
      include: { _count: { select: { requirements: true } } },
    }),
    prisma.gpssaMilestone.findMany({
      orderBy: [{ year: "desc" }, { sortOrder: "asc" }],
      take: 6,
    }),
  ]);

  return NextResponse.json({
    counts: {
      standards: standardsCount,
      requirements: requirementsCount,
      milestones: milestonesCount,
      sourcePages: pagesCount,
      pdfPages: pdfPagesCount,
      obligationLinks: complianceCount,
    },
    featuredStandards: featuredStandards.map((s) => ({
      id: s.id,
      slug: s.slug,
      code: s.code,
      title: s.title,
      category: s.category,
      description: s.description,
      url: s.url,
      publishedAt: s.publishedAt?.toISOString() ?? null,
      requirementCount: s._count.requirements,
    })),
    latestMilestones: latestMilestones.map((m) => ({
      id: m.id,
      year: m.year,
      date: m.date,
      title: m.title,
      description: m.description,
      kind: m.kind,
      sourceUrl: m.sourceUrl,
    })),
  });
}
