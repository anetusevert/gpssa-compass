import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const scorecard = await prisma.qAScorecard.findUnique({
      where: { id: params.id },
      include: {
        criteria: {
          orderBy: { sortOrder: "asc" },
          include: { dimension: true },
        },
        samplingPlans: true,
        reviews: {
          orderBy: { reviewedAt: "desc" },
          take: 10,
        },
        _count: { select: { reviews: true } },
      },
    });

    if (!scorecard) {
      return NextResponse.json({ error: "Scorecard not found" }, { status: 404 });
    }

    return NextResponse.json(scorecard);
  } catch (error) {
    console.error("GET /api/quality/scorecards/[id] failed:", error);
    return NextResponse.json({ error: "Failed to fetch scorecard" }, { status: 500 });
  }
}
