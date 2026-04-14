import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { writeScreenResults } from "@/lib/research/writers";
import type { ScreenType } from "@/lib/research/types";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const job = await prisma.researchJob.findUnique({
      where: { id: params.id },
      include: {
        agentConfig: true,
        items: {
          where: { status: "completed", output: { not: null } },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const screenType = job.type as ScreenType;
    const agentLabel = `agent-${job.model}-${screenType}`;

    const results: Record<string, unknown>[] = [];
    for (const item of job.items) {
      if (!item.output) continue;
      try {
        const parsed = JSON.parse(item.output);
        parsed._itemKey = item.itemKey;
        parsed._itemLabel = item.itemLabel;
        results.push(parsed);
      } catch {
        // skip unparseable items
      }
    }

    const writtenCount = await writeScreenResults(screenType, results, agentLabel);

    return NextResponse.json({
      success: true,
      itemsProcessed: results.length,
      writtenCount,
      screenType,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to rewrite";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
