import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin-guard";
import { buildBriefingSnapshot } from "@/lib/briefing/snapshot";

export const revalidate = 60;

/**
 * GET /api/briefing/snapshot
 *
 * Returns the full BriefingSnapshot used by the Executive Briefing deck.
 * All sections come from canonical Prisma rows so the deck is model-agnostic
 * (works with whichever LLM populated the database). Cached for 60s.
 */
export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const snapshot = await buildBriefingSnapshot();
    return NextResponse.json(snapshot);
  } catch (err) {
    console.error("[briefing/snapshot] failed", err);
    return NextResponse.json(
      { error: "Failed to build briefing snapshot" },
      { status: 500 }
    );
  }
}
