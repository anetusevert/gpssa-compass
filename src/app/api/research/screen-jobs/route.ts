import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createScreenResearchJob } from "@/lib/research/dispatcher";
import { runScreenResearchJob } from "@/lib/research/engine";

export async function GET() {
  try {
    const jobs = await prisma.researchJob.findMany({
      where: {
        type: {
          not: "country-research",
        },
      },
      include: {
        agentConfig: {
          select: { id: true, name: true, targetScreen: true, model: true },
        },
        _count: {
          select: { items: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(jobs);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch jobs";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { agentConfigId, model } = body;

    if (!agentConfigId) {
      return NextResponse.json({ error: "agentConfigId is required" }, { status: 400 });
    }

    const jobId = await createScreenResearchJob(agentConfigId, model);

    // Run in background (non-blocking)
    runScreenResearchJob(jobId).catch((err) => {
      console.error(`Screen research job ${jobId} failed:`, err);
    });

    return NextResponse.json({ jobId, status: "running" }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create job";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
