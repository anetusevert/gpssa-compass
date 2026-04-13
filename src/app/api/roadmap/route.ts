import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  try {
    const phases = await prisma.roadmapPhase.findMany({
      include: { initiatives: { orderBy: { sortOrder: "asc" } } },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(phases);
  } catch (error) {
    console.error("Failed to fetch roadmap phases:", error);
    return NextResponse.json(
      { error: "Failed to fetch roadmap phases" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const phase = await prisma.roadmapPhase.create({
      data: {
        name: body.name,
        description: body.description ?? null,
        startDate: body.startDate ?? null,
        endDate: body.endDate ?? null,
        objectives: body.objectives ?? [],
        sortOrder: body.sortOrder ?? 0,
      },
    });
    return NextResponse.json(phase, { status: 201 });
  } catch (error) {
    console.error("Failed to create roadmap phase:", error);
    return NextResponse.json(
      { error: "Failed to create roadmap phase" },
      { status: 500 }
    );
  }
}
