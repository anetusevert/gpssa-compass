import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { agingFor } from "@/lib/fulfilment/aging";

const ALLOWED_STATUS = ["open", "in-progress", "on-hold", "resolved"];

/**
 * PATCH /api/fulfilment/cases/[id]
 * Admin-only. Updates a case's status and/or owner (used by the Kanban drag).
 * Re-derives `breached` from live aging on save and stamps resolvedAt.
 */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const existing = await prisma.serviceCase.findUnique({
      where: { id: params.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    if (typeof body.status === "string") {
      if (!ALLOWED_STATUS.includes(body.status)) {
        return NextResponse.json(
          { error: "Invalid status" },
          { status: 400 }
        );
      }
      data.status = body.status;
      if (body.status === "resolved" && !existing.resolvedAt) {
        data.resolvedAt = new Date();
      }
      if (body.status !== "resolved") {
        data.resolvedAt = null;
      }
    }
    if (typeof body.owner === "string") {
      data.owner = body.owner;
    }

    const now = new Date();
    const aging = agingFor(existing.openedAt, existing.dueAt, now);
    data.breachRiskLevel =
      aging.riskLevel === "breached" ? "red" : aging.riskLevel;
    data.breached = aging.riskLevel === "breached";

    const updated = await prisma.serviceCase.update({
      where: { id: params.id },
      data,
      include: { sla: true },
    });

    const liveAging = agingFor(updated.openedAt, updated.dueAt, now);
    return NextResponse.json({
      id: updated.id,
      caseRef: updated.caseRef,
      status: updated.status,
      owner: updated.owner,
      resolvedAt: updated.resolvedAt,
      riskLevel: liveAging.riskLevel,
      pctElapsed: liveAging.pctElapsed,
      hoursToBreach: liveAging.hoursToBreach,
    });
  } catch (error) {
    console.error("Failed to update fulfilment case:", error);
    return NextResponse.json(
      { error: "Failed to update fulfilment case" },
      { status: 500 }
    );
  }
}
