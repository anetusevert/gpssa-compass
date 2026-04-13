import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { seedBenchmarkDataset } from "@/lib/benchmarking/seed";

export async function POST() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const result = await seedBenchmarkDataset(prisma);
    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (requestError) {
    console.error("Failed to seed benchmark dataset:", requestError);
    return NextResponse.json(
      { error: "Failed to seed benchmark dataset" },
      { status: 500 }
    );
  }
}
