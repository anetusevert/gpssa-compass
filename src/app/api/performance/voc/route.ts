import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET → Voice-of-Customer data:
 *  - CxMeasurements grouped by metric, each with a period-ordered series
 *    (overall, plus per-service / per-channel breakdowns).
 *  - Complaint themes aggregated for a Pareto (latest period, sorted desc with
 *    cumulative %).
 */
export async function GET() {
  try {
    const cx = await prisma.cxMeasurement.findMany({
      orderBy: { period: "asc" },
    });

    // Group overall trend (no service/channel) by metric.
    const metrics: Record<
      string,
      {
        overall: { period: string; value: number }[];
        breakdowns: {
          label: string;
          kind: "service" | "channel";
          series: { period: string; value: number }[];
        }[];
        latestSampleSize: number | null;
        driver: string | null;
      }
    > = {};

    for (const m of cx) {
      if (!metrics[m.metric]) {
        metrics[m.metric] = {
          overall: [],
          breakdowns: [],
          latestSampleSize: null,
          driver: null,
        };
      }
      const bucket = metrics[m.metric];

      if (!m.serviceName && !m.channel) {
        bucket.overall.push({ period: m.period, value: m.value });
        bucket.latestSampleSize = m.sampleSize ?? bucket.latestSampleSize;
        bucket.driver = m.driver ?? bucket.driver;
      } else {
        const label = m.serviceName ?? m.channel ?? "";
        const kind: "service" | "channel" = m.serviceName ? "service" : "channel";
        let bd = bucket.breakdowns.find((b) => b.label === label && b.kind === kind);
        if (!bd) {
          bd = { label, kind, series: [] };
          bucket.breakdowns.push(bd);
        }
        bd.series.push({ period: m.period, value: m.value });
      }
    }

    // Complaint Pareto — aggregate counts per theme, sort desc, cumulative %.
    const themes = await prisma.complaintTheme.findMany();
    const byTheme: Record<string, { count: number; sentiment: string }> = {};
    for (const t of themes) {
      if (!byTheme[t.theme]) byTheme[t.theme] = { count: 0, sentiment: t.sentiment };
      byTheme[t.theme].count += t.count;
    }
    const sorted = Object.entries(byTheme)
      .map(([theme, v]) => ({ theme, count: v.count, sentiment: v.sentiment }))
      .sort((a, b) => b.count - a.count);

    const total = sorted.reduce((acc, t) => acc + t.count, 0) || 1;
    let running = 0;
    const pareto = sorted.map((t) => {
      running += t.count;
      return {
        theme: t.theme,
        count: t.count,
        sentiment: t.sentiment,
        cumulativePct: Math.round((running / total) * 1000) / 10,
      };
    });

    return NextResponse.json({ metrics, pareto });
  } catch (error) {
    console.error("Failed to fetch VoC data:", error);
    return NextResponse.json(
      { error: "Failed to fetch VoC data" },
      { status: 500 }
    );
  }
}
