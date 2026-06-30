import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { computeReviewOutcome } from "@/lib/qa/scoring";

export async function GET(req: NextRequest) {
  try {
    const scorecardId = req.nextUrl.searchParams.get("scorecardId") ?? undefined;
    const reviews = await prisma.qAReview.findMany({
      where: scorecardId ? { scorecardId } : undefined,
      orderBy: { reviewedAt: "desc" },
      take: 60,
      include: {
        scorecard: { select: { id: true, name: true, serviceScope: true } },
      },
    });
    return NextResponse.json(reviews);
  } catch (error) {
    console.error("GET /api/quality/reviews failed:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

interface IncomingItem {
  criterionId: string;
  passed: boolean;
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const { scorecardId, caseRef, reviewer, items } = body as {
      scorecardId: string;
      caseRef: string;
      reviewer?: string;
      items: IncomingItem[];
    };

    if (!scorecardId || !caseRef || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "scorecardId, caseRef and items are required" },
        { status: 400 }
      );
    }

    const scorecard = await prisma.qAScorecard.findUnique({
      where: { id: scorecardId },
      include: { criteria: { include: { dimension: true } } },
    });

    if (!scorecard) {
      return NextResponse.json({ error: "Scorecard not found" }, { status: 404 });
    }

    const scoringCriteria = scorecard.criteria.map((cr) => ({
      id: cr.id,
      weight: cr.weight,
      critical: cr.critical,
      copcFamily: cr.dimension?.copcFamily ?? null,
    }));

    const outcome = computeReviewOutcome(scoringCriteria, items);

    const passedById = new Map(items.map((i) => [i.criterionId, i.passed]));

    const review = await prisma.qAReview.create({
      data: {
        scorecardId,
        serviceName: scorecard.serviceScope,
        caseRef,
        reviewer: reviewer ?? null,
        totalScore: outcome.totalScore,
        customerAccuracy: outcome.customerAccuracy,
        businessAccuracy: outcome.businessAccuracy,
        complianceAccuracy: outcome.complianceAccuracy,
        autoFailTriggered: outcome.autoFailTriggered,
        status: "completed",
        items: {
          create: scorecard.criteria.map((cr) => {
            const passed = passedById.get(cr.id) ?? true;
            return { criterionId: cr.id, passed, score: passed ? 1 : 0 };
          }),
        },
      },
      include: {
        scorecard: { select: { id: true, name: true, serviceScope: true } },
        items: true,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("POST /api/quality/reviews failed:", error);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}
