import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/governance/capability → capability-transfer items ordered by sortOrder.
export async function GET() {
  try {
    const items = await prisma.capabilityTransferItem.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error("Failed to fetch capability items:", error);
    return NextResponse.json(
      { error: "Failed to fetch capability items" },
      { status: 500 }
    );
  }
}
