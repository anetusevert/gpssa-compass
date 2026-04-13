import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { runResearchJob } from "@/lib/countries/research-agent";

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  await prisma.researchJob.update({
    where: { id: params.id },
    data: { status: "running" },
  });

  // Re-queue failed items as pending so they get retried
  await prisma.researchJobItem.updateMany({
    where: { jobId: params.id, status: { in: ["failed", "processing"] } },
    data: { status: "pending", error: null },
  });

  runResearchJob(params.id).catch((err) => {
    console.error("Research job resume failed:", err);
  });

  return NextResponse.json({ success: true, status: "running" });
}
