import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const where: Record<string, unknown> = {};

    if (category && category !== "All") {
      where.category = category;
    }

    const standards = await prisma.iLOStandard.findMany({
      where,
      orderBy: { code: "asc" },
    });

    return NextResponse.json(standards);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch ILO standards";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
