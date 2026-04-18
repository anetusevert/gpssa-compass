import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";

/**
 * GET /api/mandate/milestones
 *
 * Returns every GpssaMilestone ordered chronologically. Used by the History
 * timeline.
 */
export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  const milestones = await prisma.gpssaMilestone.findMany({
    orderBy: [{ year: "asc" }, { sortOrder: "asc" }, { date: "asc" }],
  });

  return NextResponse.json(
    milestones.map((m) => ({
      id: m.id,
      year: m.year,
      date: m.date,
      title: m.title,
      description: m.description,
      kind: m.kind,
      sourceUrl: m.sourceUrl,
      imageUrl: m.imageUrl,
    }))
  );
}
