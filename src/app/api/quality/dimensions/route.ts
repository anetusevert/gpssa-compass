import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const dimensions = await prisma.qualityDimension.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(dimensions);
  } catch (error) {
    console.error("GET /api/quality/dimensions failed:", error);
    return NextResponse.json({ error: "Failed to fetch quality dimensions" }, { status: 500 });
  }
}
