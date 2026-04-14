import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cancelScreenResearchJob } from "@/lib/research/engine";
import { createScreenResearchJob } from "@/lib/research/dispatcher";
import { runScreenResearchJob } from "@/lib/research/engine";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const existingJob = await prisma.researchJob.findUnique({
      where: { id: params.id },
      select: { agentConfigId: true, model: true, status: true },
    });

    if (!existingJob || !existingJob.agentConfigId) {
      return NextResponse.json(
        { error: "Job not found or has no agent assigned" },
        { status: 404 }
      );
    }

    if (existingJob.status === "running" || existingJob.status === "paused") {
      await cancelScreenResearchJob(params.id);
    }

    const newJobId = await createScreenResearchJob(
      existingJob.agentConfigId
    );

    runScreenResearchJob(newJobId).catch((err) => {
      console.error(`Restarted research job ${newJobId} failed:`, err);
    });

    return NextResponse.json({ jobId: newJobId, status: "running" }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to restart job";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
