import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

/**
 * GET → the KPI/KQI catalogue. Returns KQIs (kind:"kqi") with their feeding
 * KPIs nested (children via parentId), plus any orphan KPIs. Shaped for the
 * Balanced-Scorecard catalogue view.
 */
export async function GET() {
  try {
    const rows = await prisma.kPI.findMany({
      where: { pillar: "performance" },
      orderBy: [{ tier: "asc" }, { name: "asc" }],
    });

    const kqis = rows.filter((r) => r.kind === "kqi");
    const kpis = rows.filter((r) => r.kind === "kpi");

    const shapedKqis = kqis.map((kqi) => ({
      ...kqi,
      feedingKpis: kpis.filter((k) => k.parentId === kqi.id),
    }));

    const orphanKpis = kpis.filter(
      (k) => !k.parentId || !kqis.some((q) => q.id === k.parentId)
    );

    return NextResponse.json({ kqis: shapedKqis, orphanKpis });
  } catch (error) {
    console.error("Failed to fetch performance catalogue:", error);
    return NextResponse.json(
      { error: "Failed to fetch performance catalogue" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const created = await prisma.kPI.create({
      data: {
        name: body.name,
        description: body.description ?? null,
        unit: body.unit ?? null,
        target: body.target ?? null,
        kind: body.kind === "kqi" ? "kqi" : "kpi",
        timing: body.timing ?? null,
        perspective: body.perspective ?? null,
        tier: body.tier ?? null,
        direction: body.direction ?? "higher-better",
        parentId: body.parentId ?? null,
        pillar: "performance",
        category: body.kind === "kqi" ? "KQI" : "KPI",
        frequency: body.frequency ?? "monthly",
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Failed to create KPI/KQI:", error);
    return NextResponse.json(
      { error: "Failed to create KPI/KQI" },
      { status: 500 }
    );
  }
}
