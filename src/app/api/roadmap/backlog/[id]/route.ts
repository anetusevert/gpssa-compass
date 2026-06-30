import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

// PATCH /api/roadmap/backlog/[id] → update status, scores (requireAdmin).
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (body.status !== undefined) data.status = body.status;
    if (body.riceScore !== undefined) data.riceScore = body.riceScore;
    if (body.wsjfScore !== undefined) data.wsjfScore = body.wsjfScore;
    if (body.impact !== undefined) data.impact = body.impact;
    if (body.effort !== undefined) data.effort = body.effort;

    const updated = await prisma.opportunity.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update opportunity:", error);
    return NextResponse.json(
      { error: "Failed to update opportunity" },
      { status: 500 }
    );
  }
}
