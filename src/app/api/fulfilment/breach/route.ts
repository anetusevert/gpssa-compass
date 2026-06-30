import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { agingFor, agingBucket, type RiskLevel } from "@/lib/fulfilment/aging";
import { seedFulfilment } from "@/lib/fulfilment/seed";

/**
 * GET /api/fulfilment/breach
 * Returns the breach log (with case + SLA names) plus a LIVE aging summary
 * computed across all open cases at request time — counts per aging bucket and
 * per risk level. Polled by the breach board (~20s) so aging visibly advances.
 */
export async function GET() {
  try {
    const count = await prisma.serviceCase.count();
    if (count === 0) {
      await seedFulfilment(prisma);
    }

    const breaches = await prisma.breach.findMany({
      orderBy: { breachedAt: "desc" },
      include: {
        case: { select: { caseRef: true, serviceName: true, priority: true, owner: true } },
        sla: { select: { name: true, tier: true } },
      },
    });

    const breachLog = breaches.map((b) => ({
      id: b.id,
      caseRef: b.case?.caseRef ?? null,
      serviceName: b.case?.serviceName ?? null,
      priority: b.case?.priority ?? null,
      owner: b.case?.owner ?? null,
      slaName: b.sla?.name ?? null,
      slaTier: b.sla?.tier ?? null,
      breachedAt: b.breachedAt,
      hoursOver: b.hoursOver,
      reason: b.reason,
      escalationType: b.escalationType,
    }));

    // Live aging summary across OPEN (non-resolved) cases.
    const openCases = await prisma.serviceCase.findMany({
      where: { status: { not: "resolved" } },
      select: { id: true, openedAt: true, dueAt: true, serviceName: true },
    });

    const now = new Date();
    const buckets: Record<string, { bucket: string; total: number; amber: number; red: number; breached: number }> = {
      "0–10 days": { bucket: "0–10 days", total: 0, amber: 0, red: 0, breached: 0 },
      "11–20 days": { bucket: "11–20 days", total: 0, amber: 0, red: 0, breached: 0 },
      "21–30 days": { bucket: "21–30 days", total: 0, amber: 0, red: 0, breached: 0 },
      ">30 days": { bucket: ">30 days", total: 0, amber: 0, red: 0, breached: 0 },
    };
    const riskCounts: Record<RiskLevel, number> = { green: 0, amber: 0, red: 0, breached: 0 };

    const liveCases = openCases.map((c) => {
      const aging = agingFor(c.openedAt, c.dueAt, now);
      const bucket = agingBucket(aging.ageDays);
      riskCounts[aging.riskLevel]++;
      const b = buckets[bucket];
      if (b) {
        b.total++;
        if (aging.riskLevel === "amber") b.amber++;
        else if (aging.riskLevel === "red") b.red++;
        else if (aging.riskLevel === "breached") b.breached++;
      }
      return {
        id: c.id,
        serviceName: c.serviceName,
        ageDays: aging.ageDays,
        bucket,
        riskLevel: aging.riskLevel,
        pctElapsed: aging.pctElapsed,
        hoursToBreach: aging.hoursToBreach,
      };
    });

    // Little's-Law inputs: WIP (open cases) and a rough 30-day throughput proxy.
    const wip = openCases.length;
    const resolvedLast30 = await prisma.serviceCase.count({
      where: {
        status: "resolved",
        resolvedAt: { gte: new Date(now.getTime() - 30 * 24 * 36e5) },
      },
    });

    return NextResponse.json({
      breaches: breachLog,
      buckets: Object.values(buckets),
      riskCounts,
      liveCases,
      littlesLaw: {
        wip,
        // throughput per day (avoid divide-by-zero on the client)
        throughputPerDay: resolvedLast30 > 0 ? Math.round((resolvedLast30 / 30) * 100) / 100 : 0,
        resolvedLast30,
      },
      now: now.toISOString(),
    });
  } catch (error) {
    console.error("Failed to fetch breach data:", error);
    return NextResponse.json(
      { error: "Failed to fetch breach data" },
      { status: 500 }
    );
  }
}
