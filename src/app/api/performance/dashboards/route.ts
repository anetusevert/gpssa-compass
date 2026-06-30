import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET → KPI/KQI measurements shaped for the three dashboard tiers
 * (operational / tactical / strategic). Each metric carries its latest value,
 * target, RAG status and a sparkline series. Supports ?tier=.
 *
 * RAG logic respects metric direction (higher-better vs lower-better) and the
 * attainment ratio against target.
 */
function ragStatus(
  value: number | null,
  target: number | null,
  direction: string
): string {
  if (value == null || target == null) return "gray";
  const ratio = direction === "lower-better" ? target / value : value / target;
  if (ratio >= 0.98) return "green";
  if (ratio >= 0.9) return "amber";
  return "red";
}

const REFRESH_CADENCE: Record<string, string> = {
  operational: "Real-time / intraday",
  tactical: "Daily / weekly",
  strategic: "Monthly / quarterly",
};

export async function GET(req: NextRequest) {
  try {
    const tierFilter = req.nextUrl.searchParams.get("tier");

    const kpis = await prisma.kPI.findMany({
      where: {
        pillar: "performance",
        ...(tierFilter ? { tier: tierFilter } : {}),
      },
      include: {
        measurements: {
          where: { comparator: "GPSSA" },
          orderBy: { period: "asc" },
        },
      },
      orderBy: [{ name: "asc" }],
    });

    const metrics = kpis.map((k) => {
      const series = k.measurements.map((m) => ({
        period: m.period,
        value: m.value,
      }));
      const latest = series.length ? series[series.length - 1].value : null;
      const target = k.measurements.length
        ? k.measurements[k.measurements.length - 1].target ?? null
        : k.target
        ? Number(k.target)
        : null;

      return {
        id: k.id,
        name: k.name,
        kind: k.kind,
        unit: k.unit,
        tier: k.tier,
        perspective: k.perspective,
        timing: k.timing,
        direction: k.direction,
        value: latest,
        target,
        rag: ragStatus(latest, target, k.direction),
        series,
      };
    });

    const tiers = ["operational", "tactical", "strategic"];
    const grouped: Record<string, { cadence: string; metrics: typeof metrics }> = {};
    for (const t of tiers) {
      grouped[t] = {
        cadence: REFRESH_CADENCE[t],
        metrics: metrics.filter((m) => m.tier === t),
      };
    }

    return NextResponse.json({ tiers: grouped, all: metrics });
  } catch (error) {
    console.error("Failed to fetch performance dashboards:", error);
    return NextResponse.json(
      { error: "Failed to fetch performance dashboards" },
      { status: 500 }
    );
  }
}
