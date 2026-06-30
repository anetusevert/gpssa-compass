import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { seedFulfilment } from "@/lib/fulfilment/seed";

/** Six Sigma DPMO → sigma level (long-term, 1.5σ shift). */
function dpmoToSigma(dpmo: number): number {
  // Approximation across the practical 1–6σ band.
  const table: [number, number][] = [
    [690000, 1],
    [308000, 2],
    [66800, 3],
    [6210, 4],
    [233, 5],
    [3.4, 6],
  ];
  // Linear-ish interpolation on the bracketing rows.
  for (let i = 0; i < table.length - 1; i++) {
    const [hiDpmo, loSigma] = table[i];
    const [loDpmo, hiSigma] = table[i + 1];
    if (dpmo <= hiDpmo && dpmo >= loDpmo) {
      const frac = (Math.log(hiDpmo) - Math.log(dpmo)) / (Math.log(hiDpmo) - Math.log(loDpmo));
      return Math.round((loSigma + frac * (hiSigma - loSigma)) * 10) / 10;
    }
  }
  if (dpmo > 690000) return 1;
  return 6;
}

/**
 * GET /api/fulfilment/analytics
 * Returns fulfilment snapshots grouped for trend charts plus headline
 * Lean Six Sigma figures (latest PCE vs ≥25% target, DPMO→sigma).
 */
export async function GET() {
  try {
    const count = await prisma.fulfilmentSnapshot.count();
    if (count === 0) {
      await seedFulfilment(prisma);
    }

    const snapshots = await prisma.fulfilmentSnapshot.findMany({
      orderBy: [{ period: "asc" }],
    });

    const periods = Array.from(new Set(snapshots.map((s) => s.period))).sort();
    const services = Array.from(new Set(snapshots.map((s) => s.serviceName ?? "All")));

    // Aggregate (mean across services) per period for the headline trend series.
    const trend = periods.map((period) => {
      const rows = snapshots.filter((s) => s.period === period);
      const n = rows.length || 1;
      const sum = rows.reduce(
        (acc, r) => ({
          avgTatHours: acc.avgTatHours + r.avgTatHours,
          firstTimeRightPct: acc.firstTimeRightPct + r.firstTimeRightPct,
          reworkPct: acc.reworkPct + r.reworkPct,
          backlogCount: acc.backlogCount + r.backlogCount,
          wipOver30: acc.wipOver30 + r.wipOver30,
          pcePct: acc.pcePct + r.pcePct,
          dpmo: acc.dpmo + r.dpmo,
        }),
        { avgTatHours: 0, firstTimeRightPct: 0, reworkPct: 0, backlogCount: 0, wipOver30: 0, pcePct: 0, dpmo: 0 }
      );
      return {
        period,
        avgTatHours: Math.round((sum.avgTatHours / n) * 10) / 10,
        firstTimeRightPct: Math.round((sum.firstTimeRightPct / n) * 10) / 10,
        reworkPct: Math.round((sum.reworkPct / n) * 10) / 10,
        backlogCount: Math.round(sum.backlogCount),
        wipOver30: Math.round(sum.wipOver30),
        pcePct: Math.round((sum.pcePct / n) * 10) / 10,
        dpmo: Math.round(sum.dpmo / n),
      };
    });

    const latest = trend[trend.length - 1] ?? null;
    const first = trend[0] ?? null;

    const byService = services.map((serviceName) => ({
      serviceName,
      points: snapshots
        .filter((s) => (s.serviceName ?? "All") === serviceName)
        .map((s) => ({
          period: s.period,
          avgTatHours: s.avgTatHours,
          firstTimeRightPct: s.firstTimeRightPct,
          reworkPct: s.reworkPct,
          backlogCount: s.backlogCount,
          wipOver30: s.wipOver30,
          pcePct: s.pcePct,
          dpmo: s.dpmo,
        })),
    }));

    const currentPce = latest?.pcePct ?? 0;
    const currentDpmo = latest?.dpmo ?? 0;

    return NextResponse.json({
      periods,
      services,
      trend,
      byService,
      headline: {
        currentPce,
        pceTarget: 25, // world-class Lean
        pceStart: first?.pcePct ?? 0,
        currentDpmo,
        sigma: dpmoToSigma(currentDpmo),
        currentFtr: latest?.firstTimeRightPct ?? 0,
        currentRework: latest?.reworkPct ?? 0,
        currentBacklog: latest?.backlogCount ?? 0,
        backlogStart: first?.backlogCount ?? 0,
        currentTat: latest?.avgTatHours ?? 0,
        tatStart: first?.avgTatHours ?? 0,
      },
    });
  } catch (error) {
    console.error("Failed to fetch fulfilment analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch fulfilment analytics" },
      { status: 500 }
    );
  }
}
