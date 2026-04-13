import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  try {
    const risks = await prisma.risk.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(risks);
  } catch (error) {
    console.error("Failed to fetch risks:", error);
    return NextResponse.json(
      { error: "Failed to fetch risks" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const risk = await prisma.risk.create({
      data: {
        title: body.title,
        description: body.description ?? null,
        category: body.category ?? null,
        probability: body.probability ?? "medium",
        impact: body.impact ?? "medium",
        mitigation: body.mitigation ?? null,
        owner: body.owner ?? null,
        status: body.status ?? "open",
      },
    });
    return NextResponse.json(risk, { status: 201 });
  } catch (error) {
    console.error("Failed to create risk:", error);
    return NextResponse.json(
      { error: "Failed to create risk" },
      { status: 500 }
    );
  }
}
