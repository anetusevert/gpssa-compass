import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const { weights } = body as { weights: { dimension: string; weight: number }[] };

  if (!weights || !Array.isArray(weights)) {
    return NextResponse.json({ error: "Invalid weights" }, { status: 400 });
  }

  const dataset = await prisma.benchmarkDataset.findFirst({
    where: { targetInstitutionId: { not: null } },
    orderBy: { createdAt: "desc" },
    include: {
      scores: {
        include: { dimension: true, institution: true },
      },
    },
  });

  if (!dataset) {
    return NextResponse.json({ error: "No benchmark dataset found" }, { status: 404 });
  }

  const weightMap = new Map(weights.map((w) => [w.dimension, w.weight]));
  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);

  const institutionScores = new Map<string, { name: string; shortName: string; weighted: number }>();

  for (const score of dataset.scores) {
    const slug = score.dimension.slug;
    const w = weightMap.get(slug) ?? 1.0;
    const existing = institutionScores.get(score.institutionId) ?? {
      name: score.institution.name,
      shortName: score.institution.shortName ?? score.institution.name,
      weighted: 0,
    };
    existing.weighted += score.score * w;
    institutionScores.set(score.institutionId, existing);
  }

  const preview = Array.from(institutionScores.entries()).map(([id, data]) => ({
    institutionId: id,
    name: data.name,
    shortName: data.shortName,
    weightedScore: totalWeight > 0 ? Math.round((data.weighted / totalWeight) * 10) / 10 : 0,
  })).sort((a, b) => b.weightedScore - a.weightedScore);

  return NextResponse.json({ preview, totalWeight });
}
