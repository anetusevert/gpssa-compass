import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const job = await prisma.researchJob.findUnique({
      where: { id: params.id },
      include: {
        agentConfig: {
          select: { id: true, name: true, targetScreen: true, model: true },
        },
        items: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            itemKey: true,
            itemLabel: true,
            countryIso3: true,
            status: true,
            tokensUsed: true,
            durationMs: true,
            error: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch job";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
