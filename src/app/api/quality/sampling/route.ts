import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const plans = await prisma.qASamplingPlan.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        scorecard: { select: { id: true, name: true, serviceScope: true } },
      },
    });
    return NextResponse.json(plans);
  } catch (error) {
    console.error("GET /api/quality/sampling failed:", error);
    return NextResponse.json({ error: "Failed to fetch sampling plans" }, { status: 500 });
  }
}
