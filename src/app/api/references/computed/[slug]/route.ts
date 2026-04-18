import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin-guard";
import { getComputedReference } from "@/lib/references/computed";

/**
 * GET /api/references/computed/[slug]
 *
 * Single ComputedReference with full payload (metrics, serviceMaturity,
 * channelMaturity, standardCompliance).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { error } = await requireAuth();
  if (error) return error;

  const { slug } = await params;
  const ref = await getComputedReference(slug);
  if (!ref) return NextResponse.json({ error: "Reference not found" }, { status: 404 });
  return NextResponse.json(ref);
}
