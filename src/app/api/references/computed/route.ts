import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin-guard";
import { getAllComputedReferences, computeAllReferences } from "@/lib/references/computed";

/**
 * GET /api/references/computed
 *
 * All ComputedReferences (Global Average, Global Best, GCC Avg/Best,
 * MENA Avg, Europe Avg, APAC Avg, GPSSA Peer Group, etc.) with their
 * derived metric snapshots. Used as comparators across the app.
 */
export async function GET(_request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;
  const refs = await getAllComputedReferences();
  return NextResponse.json(refs);
}

/**
 * POST /api/references/computed
 *
 * Recompute all references from current Country / InternationalService
 * data and persist into the ComputedReference table. Idempotent.
 */
export async function POST(_request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;
  const result = await computeAllReferences();
  return NextResponse.json(result);
}
