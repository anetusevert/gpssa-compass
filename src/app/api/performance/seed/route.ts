import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { seedPerformance } from "@/lib/kpi/seed";

/**
 * POST (admin) → (re)seed the Performance & VoC + Benefits demo data.
 * Idempotent: safe to run repeatedly.
 */
export async function POST() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const result = await seedPerformance(prisma);
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error("Failed to seed performance module:", err);
    return NextResponse.json(
      { error: "Failed to seed performance module" },
      { status: 500 }
    );
  }
}
