import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireEditor } from "@/lib/admin-guard";

export async function GET() {
  try {
    const scorecards = await prisma.qAScorecard.findMany({
      orderBy: { name: "asc" },
      include: {
        criteria: {
          orderBy: { sortOrder: "asc" },
          include: { dimension: true },
        },
        _count: { select: { reviews: true } },
      },
    });
    return NextResponse.json(scorecards);
  } catch (error) {
    console.error("GET /api/quality/scorecards failed:", error);
    return NextResponse.json({ error: "Failed to fetch scorecards" }, { status: 500 });
  }
}

interface IncomingCriterion {
  dimensionId?: string | null;
  text: string;
  weight?: number;
  critical?: boolean;
}

export async function POST(req: NextRequest) {
  const { error } = await requireEditor();
  if (error) return error;

  try {
    const body = await req.json();
    const { name, description, serviceScope, status, criteria } = body as {
      name: string;
      description?: string;
      serviceScope?: string;
      status?: string;
      criteria?: IncomingCriterion[];
    };

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const created = await prisma.qAScorecard.create({
      data: {
        name,
        description: description ?? null,
        serviceScope: serviceScope ?? null,
        status: status ?? "draft",
        criteria: {
          create: (criteria ?? []).map((c, i) => ({
            dimensionId: c.dimensionId ?? null,
            text: c.text,
            weight: c.weight ?? 1,
            critical: c.critical ?? false,
            sortOrder: i + 1,
          })),
        },
      },
      include: { criteria: { include: { dimension: true } } },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/quality/scorecards failed:", error);
    return NextResponse.json({ error: "Failed to create scorecard" }, { status: 500 });
  }
}
