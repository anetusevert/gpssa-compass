import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { ScreenType } from "@/lib/research/types";

async function resetDomainData(screenType: ScreenType): Promise<number> {
  switch (screenType) {
    case "atlas-worldmap": {
      const result = await prisma.country.updateMany({
        where: { researchStatus: { not: "pending" } },
        data: {
          researchStatus: "pending",
          researchedAt: null,
          researchSource: null,
          rawResearchData: null,
        },
      });
      return result.count;
    }

    case "atlas-benchmarking": {
      const result = await prisma.institution.updateMany({
        data: {
          description: null,
          services: null,
          digitalMaturity: null,
          keyInnovations: null,
          aiAnalysis: null,
        },
      });
      return result.count;
    }

    case "services-catalog": {
      const result = await prisma.gPSSAService.updateMany({
        where: { researchStatus: { not: "pending" } },
        data: {
          researchStatus: "pending",
          researchSource: null,
          currentState: null,
          painPoints: null,
          opportunities: null,
        },
      });
      return result.count;
    }

    case "services-channels": {
      const result = await prisma.serviceChannelCapability.updateMany({
        where: { researchStatus: { not: "pending" } },
        data: {
          researchStatus: "pending",
          researchSource: null,
          capabilityLevel: "None",
          notes: null,
        },
      });
      return result.count;
    }

    case "products-portfolio": {
      const result = await prisma.product.updateMany({
        where: { researchStatus: { not: "pending" } },
        data: {
          researchStatus: "pending",
          researchSource: null,
          description: null,
          keyFeatures: null,
        },
      });
      return result.count;
    }

    case "products-segments": {
      const result = await prisma.segmentCoverage.updateMany({
        where: { researchStatus: { not: "pending" } },
        data: {
          researchStatus: "pending",
          researchSource: null,
          notes: null,
        },
      });
      return result.count;
    }

    case "delivery-channels": {
      const result = await prisma.deliveryChannel.updateMany({
        where: { researchStatus: { not: "pending" } },
        data: {
          researchStatus: "pending",
          researchSource: null,
          capabilities: null,
          strengths: null,
          gaps: null,
        },
      });
      return result.count;
    }

    case "delivery-personas": {
      const result = await prisma.customerPersona.updateMany({
        where: { researchStatus: { not: "pending" } },
        data: {
          researchStatus: "pending",
          researchSource: null,
          description: null,
          needs: null,
          coverageMap: null,
        },
      });
      return result.count;
    }

    case "delivery-models": {
      const result = await prisma.deliveryModel.updateMany({
        where: { researchStatus: { not: "pending" } },
        data: {
          researchStatus: "pending",
          researchSource: null,
          description: null,
          channelMix: null,
          enablers: null,
        },
      });
      return result.count;
    }

    default:
      return 0;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { agentConfigId } = body;

    if (!agentConfigId) {
      return NextResponse.json(
        { error: "agentConfigId is required" },
        { status: 400 }
      );
    }

    const agent = await prisma.agentConfig.findUnique({
      where: { id: agentConfigId },
      select: { targetScreen: true, name: true },
    });

    if (!agent || !agent.targetScreen) {
      return NextResponse.json(
        { error: "Agent not found or has no target screen" },
        { status: 404 }
      );
    }

    const screenType = agent.targetScreen as ScreenType;

    // Cancel any running jobs for this agent
    await prisma.researchJob.updateMany({
      where: {
        agentConfigId,
        status: { in: ["running", "paused"] },
      },
      data: { status: "cancelled", completedAt: new Date() },
    });

    // Delete job items then jobs for this agent
    const jobs = await prisma.researchJob.findMany({
      where: { agentConfigId },
      select: { id: true },
    });

    if (jobs.length > 0) {
      await prisma.researchJobItem.deleteMany({
        where: { jobId: { in: jobs.map((j) => j.id) } },
      });

      await prisma.researchJob.deleteMany({
        where: { agentConfigId },
      });
    }

    // Reset domain data
    const resetCount = await resetDomainData(screenType);

    // Reset agent execution stats
    await prisma.agentConfig.update({
      where: { id: agentConfigId },
      data: { executionCount: 0, lastRunAt: null },
    });

    return NextResponse.json({
      success: true,
      resetCount,
      screenType,
      agent: agent.name,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to clear progress";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
