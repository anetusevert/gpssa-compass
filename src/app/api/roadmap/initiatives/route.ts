import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  try {
    const initiatives = await prisma.roadmapInitiative.findMany({
      include: { phase: true },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(initiatives);
  } catch (error) {
    console.error("Failed to fetch initiatives:", error);
    return NextResponse.json(
      { error: "Failed to fetch initiatives" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const initiative = await prisma.roadmapInitiative.create({
      data: {
        phaseId: body.phaseId,
        title: body.title,
        description: body.description ?? null,
        status: body.status ?? "planned",
        owner: body.owner ?? null,
        dependencies: body.dependencies ?? [],
        estimatedImpact: body.estimatedImpact ?? null,
        sortOrder: body.sortOrder ?? 0,
      },
    });
    return NextResponse.json(initiative, { status: 201 });
  } catch (error) {
    console.error("Failed to create initiative:", error);
    return NextResponse.json(
      { error: "Failed to create initiative" },
      { status: 500 }
    );
  }
}
