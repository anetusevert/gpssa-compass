import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { ensureCountryBenchmarkScores } from "@/lib/benchmarking/scoring";

export async function POST() {
  const { error } = await requireAdmin();
  if (error) return error;

  const dataset = await prisma.benchmarkDataset.findFirst({
    where: { targetInstitutionId: { not: null } },
    orderBy: { createdAt: "desc" },
  });

  if (!dataset) {
    return NextResponse.json({ error: "No benchmark dataset found" }, { status: 404 });
  }

  const countries = await prisma.country.findMany({
    where: {
      researchStatus: "completed",
      maturityScore: { not: null, gt: 0 },
    },
    select: { iso3: true },
  });

  let synced = 0;
  const errors: string[] = [];

  for (const c of countries) {
    try {
      const instId = await ensureCountryBenchmarkScores(c.iso3, dataset.id);
      if (instId) synced++;
    } catch (e) {
      errors.push(`${c.iso3}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return NextResponse.json({
    total: countries.length,
    synced,
    errors: errors.length > 0 ? errors : undefined,
    datasetId: dataset.id,
  });
}
