import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { seedFulfilment } from "@/lib/fulfilment/seed";

/**
 * POST /api/fulfilment/seed
 * Admin-only. Re-seeds (idempotent upsert) the fulfilment demo data, which also
 * re-anchors case aging to "now" so the live board has a fresh healthy spread.
 */
export async function POST() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const result = await seedFulfilment(prisma);
    return NextResponse.json({ success: true, ...result });
  } catch (requestError) {
    console.error("Failed to seed fulfilment data:", requestError);
    return NextResponse.json(
      { error: "Failed to seed fulfilment data" },
      { status: 500 }
    );
  }
}
