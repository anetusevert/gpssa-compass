import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/roadmap/backlog → opportunities ordered by RICE score (desc),
// each flagged with whether it has a concept sheet.
export async function GET() {
  try {
    const opportunities = await prisma.opportunity.findMany({
      include: { conceptSheet: true },
      orderBy: [{ riceScore: "desc" }, { createdAt: "asc" }],
    });

    const backlog = opportunities.map((o) => ({
      id: o.id,
      title: o.title,
      category: o.category,
      description: o.description,
      impact: o.impact,
      effort: o.effort,
      strategicFit: o.strategicFit,
      feasibility: o.feasibility,
      status: o.status,
      sourceSection: o.sourceSection,
      riceScore: o.riceScore,
      wsjfScore: o.wsjfScore,
      hasConceptSheet: Boolean(o.conceptSheet),
      conceptSheet: o.conceptSheet?.content ?? null,
    }));

    return NextResponse.json(backlog);
  } catch (error) {
    console.error("Failed to fetch backlog:", error);
    return NextResponse.json(
      { error: "Failed to fetch backlog" },
      { status: 500 }
    );
  }
}
