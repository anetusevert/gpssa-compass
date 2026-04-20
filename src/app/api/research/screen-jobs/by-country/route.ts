import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createScreenResearchJobForItems } from "@/lib/research/dispatcher";
import { runScreenResearchJob } from "@/lib/research/engine";
import type { ScreenType } from "@/lib/research/types";

const ATLAS_SCREEN_TO_STATUS: Record<string, "researchStatus" | "systemStatus" | "performanceStatus" | "insightsStatus"> = {
  "atlas-worldmap": "researchStatus",
  "atlas-system": "systemStatus",
  "atlas-performance": "performanceStatus",
  "atlas-insights": "insightsStatus",
};

const DEFAULT_SCREENS: ScreenType[] = [
  "atlas-worldmap",
  "atlas-system",
  "atlas-performance",
  "atlas-insights",
];

type Body = {
  iso3?: string;
  screenTypes?: ScreenType[];
  force?: boolean;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;
    const iso3 = body?.iso3?.toUpperCase();
    if (!iso3) {
      return NextResponse.json({ error: "iso3 is required" }, { status: 400 });
    }

    const country = await prisma.country.findUnique({
      where: { iso3 },
      select: {
        iso3: true,
        name: true,
        researchStatus: true,
        systemStatus: true,
        performanceStatus: true,
        insightsStatus: true,
      },
    });
    if (!country) {
      return NextResponse.json({ error: `Country ${iso3} not found` }, { status: 404 });
    }

    const requested: ScreenType[] = body.screenTypes && body.screenTypes.length > 0
      ? body.screenTypes
      : DEFAULT_SCREENS;

    const recentCutoff = new Date(Date.now() - 5 * 60 * 1000);

    const dispatched: Array<{ screenType: ScreenType; jobId: string }> = [];
    const skipped: Array<{ screenType: ScreenType; reason: string }> = [];

    for (const screenType of requested) {
      const statusField = ATLAS_SCREEN_TO_STATUS[screenType];

      if (!body.force && statusField) {
        const status = (country as Record<string, unknown>)[statusField] as string | undefined;
        if (status === "completed" || status === "running") {
          skipped.push({ screenType, reason: `status=${status}` });
          continue;
        }
      }

      const agent = await prisma.agentConfig.findFirst({
        where: { targetScreen: screenType, isActive: true },
        orderBy: { updatedAt: "desc" },
      });
      if (!agent) {
        skipped.push({ screenType, reason: "no active agent configured" });
        continue;
      }

      if (!body.force) {
        const recentJob = await prisma.researchJob.findFirst({
          where: {
            agentConfigId: agent.id,
            status: { in: ["running", "pending"] },
            createdAt: { gte: recentCutoff },
            items: { some: { itemKey: iso3 } },
          },
          orderBy: { createdAt: "desc" },
        });
        if (recentJob) {
          skipped.push({ screenType, reason: `already running (${recentJob.id})` });
          continue;
        }
      }

      const jobId = await createScreenResearchJobForItems(agent.id, [
        { key: country.iso3, label: country.name },
      ]);

      runScreenResearchJob(jobId).catch((err) => {
        console.error(`[by-country] Job ${jobId} (${screenType} / ${iso3}) failed:`, err);
      });

      dispatched.push({ screenType, jobId });
    }

    return NextResponse.json({
      iso3,
      dispatched,
      skipped,
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to dispatch by-country jobs";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
