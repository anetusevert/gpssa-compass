import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { aggregateAccuracy } from "@/lib/qa/scoring";

/**
 * Monthly COPC 3-metric trend: customer / business / compliance accuracy %
 * aggregated over reviews grouped by YYYY-MM.
 */
export async function GET() {
  try {
    const reviews = await prisma.qAReview.findMany({
      orderBy: { reviewedAt: "asc" },
      select: {
        reviewedAt: true,
        customerAccuracy: true,
        businessAccuracy: true,
        complianceAccuracy: true,
      },
    });

    const groups = new Map<string, typeof reviews>();
    for (const r of reviews) {
      const d = r.reviewedAt;
      const period = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const arr = groups.get(period) ?? [];
      arr.push(r);
      groups.set(period, arr);
    }

    const result = Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([period, rows]) => {
        const agg = aggregateAccuracy(rows);
        return {
          period,
          customer: agg.customer,
          business: agg.business,
          compliance: agg.compliance,
          count: agg.count,
        };
      });

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/quality/reviews/summary failed:", error);
    return NextResponse.json({ error: "Failed to compute review summary" }, { status: 500 });
  }
}
