import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  try {
    const kpis = await prisma.kPI.findMany({
      orderBy: { category: "asc" },
    });
    return NextResponse.json(kpis);
  } catch (error) {
    console.error("Failed to fetch KPIs:", error);
    return NextResponse.json(
      { error: "Failed to fetch KPIs" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const kpi = await prisma.kPI.create({
      data: {
        name: body.name,
        description: body.description ?? null,
        category: body.category ?? null,
        target: body.target ?? null,
        actual: body.actual ?? null,
        unit: body.unit ?? null,
        frequency: body.frequency ?? "monthly",
        owner: body.owner ?? null,
        pillar: body.pillar ?? "roadmap",
      },
    });
    return NextResponse.json(kpi, { status: 201 });
  } catch (error) {
    console.error("Failed to create KPI:", error);
    return NextResponse.json(
      { error: "Failed to create KPI" },
      { status: 500 }
    );
  }
}
