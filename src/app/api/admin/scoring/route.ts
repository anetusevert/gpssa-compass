import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const methodology = await prisma.scoringMethodology.findFirst({
    where: { isActive: true },
    include: { weights: { orderBy: { dimension: "asc" } } },
  });

  if (!methodology) {
    return NextResponse.json({ error: "No active methodology found" }, { status: 404 });
  }

  return NextResponse.json(methodology);
}

export async function PUT(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const { weights } = body as { weights: { dimension: string; weight: number }[] };

  if (!weights || !Array.isArray(weights)) {
    return NextResponse.json({ error: "Invalid weights array" }, { status: 400 });
  }

  const methodology = await prisma.scoringMethodology.findFirst({
    where: { isActive: true },
  });

  if (!methodology) {
    return NextResponse.json({ error: "No active methodology found" }, { status: 404 });
  }

  for (const w of weights) {
    await prisma.scoringWeight.upsert({
      where: {
        methodologyId_dimension: {
          methodologyId: methodology.id,
          dimension: w.dimension,
        },
      },
      update: { weight: w.weight },
      create: {
        methodologyId: methodology.id,
        dimension: w.dimension,
        weight: w.weight,
        maxScore: 100,
      },
    });
  }

  const updated = await prisma.scoringMethodology.findFirst({
    where: { isActive: true },
    include: { weights: { orderBy: { dimension: "asc" } } },
  });

  return NextResponse.json(updated);
}
