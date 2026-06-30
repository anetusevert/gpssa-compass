import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const actions = await prisma.correctiveAction.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        defect: {
          include: { taxonomyNode: { select: { code: true, name: true } } },
        },
      },
    });
    return NextResponse.json(actions);
  } catch (error) {
    console.error("GET /api/quality/capa failed:", error);
    return NextResponse.json({ error: "Failed to fetch corrective actions" }, { status: 500 });
  }
}
