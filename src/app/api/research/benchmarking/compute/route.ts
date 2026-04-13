import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { ensureCountryBenchmarkScores } from "@/lib/benchmarking/scoring";

export async function POST(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const body = await request.json();
  const { countryIso3 } = body as { countryIso3: string };

  if (!countryIso3) {
    return NextResponse.json({ error: "countryIso3 required" }, { status: 400 });
  }

  const dataset = await prisma.benchmarkDataset.findFirst({
    where: { targetInstitutionId: { not: null } },
    orderBy: { createdAt: "desc" },
  });

  if (!dataset) {
    return NextResponse.json({ error: "No benchmark dataset found" }, { status: 404 });
  }

  const institutionId = await ensureCountryBenchmarkScores(countryIso3, dataset.id);

  if (!institutionId) {
    return NextResponse.json({ error: "Country not researched yet" }, { status: 400 });
  }

  return NextResponse.json({ institutionId, datasetId: dataset.id });
}
