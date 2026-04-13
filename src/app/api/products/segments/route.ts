import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const segments = await prisma.segmentCoverage.findMany({
      orderBy: [{ segment: "asc" }, { coverageType: "asc" }],
      include: {
        sourceCitations: {
          include: { source: true },
          take: 5,
        },
      },
    });

    return NextResponse.json(segments);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch segments";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
