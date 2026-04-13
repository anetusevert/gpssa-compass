import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { createResearchJob, runResearchJob } from "@/lib/countries/research-agent";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const jobs = await prisma.researchJob.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { _count: { select: { items: true } } },
  });

  return NextResponse.json(jobs);
}

export async function POST() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const jobId = await createResearchJob();

    // Fire-and-forget: start processing in background
    runResearchJob(jobId).catch((err) => {
      console.error("Research job failed:", err);
    });

    return NextResponse.json({ jobId, status: "running" });
  } catch (err) {
    console.error("Failed to create research job:", err);
    return NextResponse.json({ error: "Failed to create research job" }, { status: 500 });
  }
}
