import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const sessions = await prisma.qACalibrationSession.findMany({
      orderBy: { sessionDate: "asc" },
      include: {
        scores: true,
        scorecard: { select: { id: true, name: true, serviceScope: true } },
      },
    });
    return NextResponse.json(sessions);
  } catch (error) {
    console.error("GET /api/quality/calibration failed:", error);
    return NextResponse.json({ error: "Failed to fetch calibration sessions" }, { status: 500 });
  }
}
