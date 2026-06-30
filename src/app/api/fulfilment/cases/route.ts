import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { agingFor } from "@/lib/fulfilment/aging";
import { seedFulfilment } from "@/lib/fulfilment/seed";

/**
 * GET /api/fulfilment/cases
 * Returns all service cases with LIVE aging/risk recomputed at request time
 * (relative to `new Date()`), so the board always looks live.
 * Filters: ?status=open|in-progress|on-hold|resolved  ?service=<serviceName>
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const service = searchParams.get("service");

    // Auto-seed on first hit so the demo works with zero manual steps.
    const count = await prisma.serviceCase.count();
    if (count === 0) {
      await seedFulfilment(prisma);
    }

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (service) where.serviceName = service;

    const cases = await prisma.serviceCase.findMany({
      where,
      orderBy: { openedAt: "asc" },
      include: { sla: true },
    });

    const now = new Date();
    const enriched = cases.map((c) => {
      const aging = agingFor(c.openedAt, c.dueAt, now);
      return {
        id: c.id,
        caseRef: c.caseRef,
        serviceName: c.serviceName,
        segment: c.segment,
        impact: c.impact,
        urgency: c.urgency,
        priority: c.priority,
        status: c.status,
        owner: c.owner,
        openedAt: c.openedAt,
        dueAt: c.dueAt,
        resolvedAt: c.resolvedAt,
        slaId: c.slaId,
        slaName: c.sla?.name ?? null,
        slaTier: c.sla?.tier ?? null,
        slaTargetHours: c.sla?.targetHours ?? null,
        // Live aging fields (never persisted).
        ageDays: aging.ageDays,
        ageHours: Math.round(aging.ageHours * 10) / 10,
        pctElapsed: aging.pctElapsed,
        riskLevel: aging.riskLevel,
        hoursToBreach: aging.hoursToBreach,
        bucket: c.status === "resolved" ? "resolved" : agingBucketLabel(aging.ageDays),
      };
    });

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("Failed to fetch fulfilment cases:", error);
    return NextResponse.json(
      { error: "Failed to fetch fulfilment cases" },
      { status: 500 }
    );
  }
}

function agingBucketLabel(ageDays: number): string {
  if (ageDays <= 10) return "0–10 days";
  if (ageDays <= 20) return "11–20 days";
  if (ageDays <= 30) return "21–30 days";
  return ">30 days";
}
