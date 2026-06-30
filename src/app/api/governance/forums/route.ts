import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/governance/forums → governance forums ordered by tier then sortOrder.
export async function GET() {
  try {
    const forums = await prisma.governanceForum.findMany({
      orderBy: [{ tier: "asc" }, { sortOrder: "asc" }],
    });
    return NextResponse.json(forums);
  } catch (error) {
    console.error("Failed to fetch governance forums:", error);
    return NextResponse.json(
      { error: "Failed to fetch governance forums" },
      { status: 500 }
    );
  }
}
