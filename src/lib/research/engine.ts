import { prisma } from "@/lib/db";
import { getOpenAIClient } from "@/lib/openai";
import { PROMPT_MODULES } from "./prompts";
import { writeScreenResults } from "./writers";
import type { ScreenType } from "./types";
import { GPT4O_INPUT_COST, GPT4O_OUTPUT_COST } from "./types";

export async function runScreenResearchJob(jobId: string): Promise<void> {
  const client = await getOpenAIClient();
  if (!client) {
    await prisma.researchJob.update({
      where: { id: jobId },
      data: { status: "failed", lastError: "OpenAI API key not configured" },
    });
    return;
  }

  const job = await prisma.researchJob.findUnique({
    where: { id: jobId },
    include: { agentConfig: true },
  });

  if (!job) return;

  const screenType = job.type as ScreenType;
  const promptModule = PROMPT_MODULES[screenType];

  if (!promptModule) {
    await prisma.researchJob.update({
      where: { id: jobId },
      data: { status: "failed", lastError: `No prompt module for screen type: ${screenType}` },
    });
    return;
  }

  const systemPrompt = job.agentConfig?.systemPrompt ?? promptModule.systemPrompt;
  const agentLabel = `agent-${job.model}-${screenType}`;

  while (true) {
    const currentJob = await prisma.researchJob.findUnique({ where: { id: jobId } });
    if (!currentJob || currentJob.status === "paused" || currentJob.status === "cancelled") break;

    const pendingItems = await prisma.researchJobItem.findMany({
      where: { jobId, status: "pending" },
      take: currentJob.batchSize,
      orderBy: { createdAt: "asc" },
    });

    if (pendingItems.length === 0) {
      await prisma.researchJob.update({
        where: { id: jobId },
        data: { status: "completed", completedAt: new Date() },
      });
      break;
    }

    await prisma.researchJobItem.updateMany({
      where: { id: { in: pendingItems.map((i) => i.id) } },
      data: { status: "processing" },
    });

    const itemLabels = pendingItems.map((i) => i.itemLabel ?? i.itemKey ?? "Unknown");
    await prisma.researchJob.update({
      where: { id: jobId },
      data: { currentItem: itemLabels.join(", ") },
    });

    const startTime = Date.now();

    try {
      const promptItems = pendingItems.map((item) => ({
        key: item.itemKey ?? item.id,
        label: item.itemLabel ?? item.itemKey ?? "Unknown",
      }));

      const userPrompt = promptModule.buildUserPrompt(promptItems);

      const isReasoningModel = /^(o1|o3|o4)/.test(currentJob.model);

      const completion = await client.chat.completions.create({
        model: currentJob.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_completion_tokens: job.agentConfig?.maxTokens ?? 16384,
        ...(!isReasoningModel && { temperature: job.agentConfig?.temperature ?? 0.3 }),
        ...(!isReasoningModel && { response_format: { type: "json_object" } }),
      });

      const durationMs = Date.now() - startTime;
      const rawOutput = completion.choices[0]?.message?.content ?? "{}";
      const tokensUsed = completion.usage?.total_tokens ?? 0;
      const promptTokens = completion.usage?.prompt_tokens ?? 0;
      const completionTokens = completion.usage?.completion_tokens ?? 0;
      const cost = promptTokens * GPT4O_INPUT_COST + completionTokens * GPT4O_OUTPUT_COST;

      let results: Record<string, unknown>[];
      try {
        results = promptModule.parseResponse(rawOutput);
      } catch {
        results = [];
      }

      for (const item of pendingItems) {
        const itemResult = results.find((r) => {
          const rName = String(
            r.countryName ?? r.institutionName ?? r.serviceName ?? r.name ?? r.title ?? r.segment ?? r.theme ?? ""
          ).toLowerCase();
          const itemName = (item.itemLabel ?? item.itemKey ?? "").toLowerCase();
          return rName === itemName || rName.includes(itemName) || itemName.includes(rName);
        });

        if (itemResult) {
          itemResult._itemKey = item.itemKey;
          itemResult._itemLabel = item.itemLabel;
        }

        await prisma.researchJobItem.update({
          where: { id: item.id },
          data: {
            status: itemResult ? "completed" : "failed",
            tokensUsed: Math.round(tokensUsed / pendingItems.length),
            durationMs: Math.round(durationMs / pendingItems.length),
            output: itemResult ? JSON.stringify(itemResult) : undefined,
            error: itemResult ? undefined : "No matching result in LLM response",
          },
        });
      }

      await writeScreenResults(screenType, results, agentLabel);

      const completedCount = await prisma.researchJobItem.count({
        where: { jobId, status: "completed" },
      });
      const failedCount = await prisma.researchJobItem.count({
        where: { jobId, status: "failed" },
      });

      await prisma.researchJob.update({
        where: { id: jobId },
        data: {
          completedItems: completedCount,
          failedItems: failedCount,
          totalTokens: { increment: tokensUsed },
          totalCost: { increment: cost },
          rawOutput: rawOutput.length > 50000 ? rawOutput.substring(0, 50000) : rawOutput,
        },
      });

      if (job.agentConfig) {
        await prisma.agentConfig.update({
          where: { id: job.agentConfig.id },
          data: {
            executionCount: { increment: 1 },
            lastRunAt: new Date(),
          },
        });
      }
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      for (const item of pendingItems) {
        await prisma.researchJobItem.update({
          where: { id: item.id },
          data: { status: "failed", error: errorMessage, durationMs },
        });
      }

      const failedCount = await prisma.researchJobItem.count({
        where: { jobId, status: "failed" },
      });

      await prisma.researchJob.update({
        where: { id: jobId },
        data: {
          failedItems: failedCount,
          lastError: errorMessage,
          errorCount: { increment: 1 },
        },
      });

      const updatedJob = await prisma.researchJob.findUnique({ where: { id: jobId } });
      if (updatedJob && updatedJob.errorCount >= 5) {
        await prisma.researchJob.update({
          where: { id: jobId },
          data: { status: "failed", lastError: `Too many errors: ${errorMessage}` },
        });
        break;
      }
    }
  }
}

export async function pauseScreenResearchJob(jobId: string): Promise<void> {
  await prisma.researchJob.update({
    where: { id: jobId },
    data: { status: "paused", pausedAt: new Date() },
  });
}

export async function retryFailedItems(jobId: string): Promise<void> {
  await prisma.researchJobItem.updateMany({
    where: { jobId, status: "failed" },
    data: { status: "pending", error: null },
  });
}

export async function resumeScreenResearchJob(jobId: string): Promise<void> {
  await retryFailedItems(jobId);
  await prisma.researchJob.update({
    where: { id: jobId },
    data: { status: "running", pausedAt: null },
  });
}

export async function cancelScreenResearchJob(jobId: string): Promise<void> {
  await prisma.researchJob.update({
    where: { id: jobId },
    data: { status: "cancelled", completedAt: new Date() },
  });

  await prisma.researchJobItem.updateMany({
    where: { jobId, status: { in: ["pending", "processing"] } },
    data: { status: "skipped" },
  });
}
