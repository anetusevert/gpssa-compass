import { prisma } from "@/lib/db";
import { getOpenAIClient } from "@/lib/openai";
import { PROMPT_MODULES } from "./prompts";
import { writeScreenResults } from "./writers";
import type { ScreenType } from "./types";
import { GPT4O_INPUT_COST, GPT4O_OUTPUT_COST } from "./types";
import type OpenAI from "openai";

interface PromptModuleRef {
  systemPrompt: string;
  buildUserPrompt: (items: { key: string; label: string; context?: string }[]) => string;
  parseResponse: (raw: string) => Record<string, unknown>[];
}

interface BatchContext {
  jobId: string;
  model: string;
  screenType: ScreenType;
  systemPrompt: string;
  promptModule: PromptModuleRef;
  client: OpenAI;
  maxTokens: number;
  temperature: number;
  agentConfigId?: string | null;
}

interface BatchResult {
  tokensUsed: number;
  cost: number;
  rawOutput: string;
  matchedResults: Record<string, unknown>[];
  errorCount: number;
}

type ResearchJobItemRecord = Awaited<ReturnType<typeof prisma.researchJobItem.findMany>>[number];

async function processBatch(
  items: ResearchJobItemRecord[],
  ctx: BatchContext
): Promise<BatchResult> {
  const startTime = Date.now();

  try {
    const promptItems = items.map((item) => ({
      key: item.itemKey ?? item.id,
      label: item.itemLabel ?? item.itemKey ?? "Unknown",
      context: item.itemContext ?? undefined,
    }));

    const userPrompt = ctx.promptModule.buildUserPrompt(promptItems);
    const isReasoningModel = /^(o1|o3|o4)/.test(ctx.model);

    const completion = await ctx.client.chat.completions.create({
      model: ctx.model,
      messages: [
        { role: "system", content: ctx.systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_completion_tokens: ctx.maxTokens,
      ...(!isReasoningModel && { temperature: ctx.temperature }),
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
      const raw = ctx.promptModule.parseResponse(rawOutput);
      results = raw.filter(
        (r): r is Record<string, unknown> =>
          r != null && typeof r === "object" && !Array.isArray(r)
      );
    } catch {
      results = [];
    }

    const matchedResults: Record<string, unknown>[] = [];

    // Fast path: single-item batch — assign the first result directly
    if (items.length === 1 && results.length >= 1) {
      const item = items[0];
      const itemResult = results[0];
      itemResult._itemKey = item.itemKey;
      itemResult._itemLabel = item.itemLabel;
      matchedResults.push(itemResult);

      await prisma.researchJobItem.update({
        where: { id: item.id },
        data: {
          status: "completed",
          tokensUsed,
          durationMs: Date.now() - startTime,
          output: JSON.stringify(itemResult),
        },
      });
    } else {
      // Multi-item batch: try name-based matching first
      const unmatched: { item: ResearchJobItemRecord; idx: number }[] = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemName = (item.itemLabel ?? item.itemKey ?? "").toLowerCase().trim();
        const itemKey = (item.itemKey ?? "").toLowerCase().trim();
        const itemContext = (item.itemContext ?? "").toLowerCase().trim();

        const itemResult = results.find((r) => {
          const rName = String(
            r.countryName ?? r.institutionName ?? r.serviceName ?? r.name ?? r.title ?? r.segment ?? r.theme ?? ""
          ).toLowerCase().trim();

          // Try key/ISO3 match first
          if (itemKey && r.iso3) {
            if (String(r.iso3).toLowerCase() === itemKey) return true;
          }

          if (!rName || !itemName) return false;
          const nameMatch = rName === itemName || rName.includes(itemName) || itemName.includes(rName);
          if (!nameMatch) return false;

          if (itemContext && r.coverageType) {
            return String(r.coverageType).toLowerCase().includes(itemContext);
          }
          return true;
        });

        if (itemResult) {
          itemResult._itemKey = item.itemKey;
          itemResult._itemLabel = item.itemLabel;
          const idx = results.indexOf(itemResult);
          if (idx !== -1) results.splice(idx, 1);
          matchedResults.push(itemResult);

          await prisma.researchJobItem.update({
            where: { id: item.id },
            data: {
              status: "completed",
              tokensUsed: Math.round(tokensUsed / items.length),
              durationMs: Math.round(durationMs / items.length),
              output: JSON.stringify(itemResult),
            },
          });
        } else {
          unmatched.push({ item, idx: i });
        }
      }

      // Positional fallback: if unmatched items remain and results remain, assign by position
      if (unmatched.length > 0 && results.length > 0) {
        console.log(`[engine] Positional fallback: ${unmatched.length} unmatched items, ${results.length} remaining results`);
        const stillUnmatched: typeof unmatched = [];
        for (const entry of unmatched) {
          if (results.length === 0) {
            stillUnmatched.push(entry);
            continue;
          }
          const fallbackResult = results.shift()!;
          fallbackResult._itemKey = entry.item.itemKey;
          fallbackResult._itemLabel = entry.item.itemLabel;
          matchedResults.push(fallbackResult);

          await prisma.researchJobItem.update({
            where: { id: entry.item.id },
            data: {
              status: "completed",
              tokensUsed: Math.round(tokensUsed / items.length),
              durationMs: Math.round(durationMs / items.length),
              output: JSON.stringify(fallbackResult),
            },
          });
        }
        unmatched.length = 0;
        unmatched.push(...stillUnmatched);
      }

      // Mark any truly unmatched items as failed
      for (const { item } of unmatched) {
        await prisma.researchJobItem.update({
          where: { id: item.id },
          data: {
            status: "failed",
            tokensUsed: Math.round(tokensUsed / items.length),
            durationMs: Math.round(durationMs / items.length),
            error: "No matching result in LLM response",
          },
        });
      }
    }

    return { tokensUsed, cost, rawOutput, matchedResults, errorCount: 0 };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    for (const item of items) {
      await prisma.researchJobItem.update({
        where: { id: item.id },
        data: { status: "failed", error: errorMessage, durationMs },
      });
    }

    return { tokensUsed: 0, cost: 0, rawOutput: "", matchedResults: [], errorCount: 1 };
  }
}

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

  const agentSysPrompt = job.agentConfig?.systemPrompt;
  const systemPrompt =
    !agentSysPrompt || agentSysPrompt === "USE_CANONICAL_PROMPT"
      ? promptModule.systemPrompt
      : agentSysPrompt;
  const agentLabel = `agent-${job.model}-${screenType}`;

  const concurrency = job.concurrency ?? 5;

  const batchCtx: BatchContext = {
    jobId,
    model: job.model,
    screenType,
    systemPrompt,
    promptModule,
    client,
    maxTokens: job.agentConfig?.maxTokens ?? 16384,
    temperature: job.agentConfig?.temperature ?? 0.3,
    agentConfigId: job.agentConfigId,
  };

  console.log(`[engine] Job ${jobId}: starting with batchSize=${job.batchSize}, concurrency=${concurrency}, model=${job.model}`);

  while (true) {
    const currentJob = await prisma.researchJob.findUnique({ where: { id: jobId } });
    if (!currentJob || currentJob.status === "paused" || currentJob.status === "cancelled") break;

    const totalTake = currentJob.batchSize * concurrency;
    const allPending = await prisma.researchJobItem.findMany({
      where: { jobId, status: "pending" },
      take: totalTake,
      orderBy: { createdAt: "asc" },
    });

    if (allPending.length === 0) {
      await finalRewritePass(jobId, screenType, agentLabel);
      await prisma.researchJob.update({
        where: { id: jobId },
        data: { status: "completed", completedAt: new Date() },
      });
      break;
    }

    // Split into batches of batchSize
    const batches: (typeof allPending)[] = [];
    for (let i = 0; i < allPending.length; i += currentJob.batchSize) {
      batches.push(allPending.slice(i, i + currentJob.batchSize));
    }

    // Mark all items in this wave as processing
    await prisma.researchJobItem.updateMany({
      where: { id: { in: allPending.map((i) => i.id) } },
      data: { status: "processing" },
    });

    const itemLabels = allPending
      .slice(0, 6)
      .map((i) => i.itemLabel ?? i.itemKey ?? "Unknown");
    const suffix = allPending.length > 6 ? ` (+${allPending.length - 6} more)` : "";
    await prisma.researchJob.update({
      where: { id: jobId },
      data: { currentItem: itemLabels.join(", ") + suffix },
    });

    // Run batches concurrently
    console.log(`[engine] Job ${jobId}: wave of ${allPending.length} items in ${batches.length} parallel batches`);
    const settled = await Promise.allSettled(
      batches.map((batch) => processBatch(batch, batchCtx))
    );

    // Aggregate results
    let totalTokensWave = 0;
    let totalCostWave = 0;
    let totalErrors = 0;
    let lastRawOutput = "";
    const allMatchedResults: Record<string, unknown>[] = [];

    for (const result of settled) {
      if (result.status === "fulfilled") {
        totalTokensWave += result.value.tokensUsed;
        totalCostWave += result.value.cost;
        totalErrors += result.value.errorCount;
        if (result.value.rawOutput) lastRawOutput = result.value.rawOutput;
        allMatchedResults.push(...result.value.matchedResults);
      } else {
        totalErrors += 1;
      }
    }

    // Write all matched results to domain tables
    if (allMatchedResults.length > 0) {
      await writeScreenResults(screenType, allMatchedResults, agentLabel);
    }

    // Update job progress
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
        totalTokens: { increment: totalTokensWave },
        totalCost: { increment: totalCostWave },
        ...(lastRawOutput && {
          rawOutput: lastRawOutput.length > 50000
            ? lastRawOutput.substring(0, 50000)
            : lastRawOutput,
        }),
        ...(totalErrors > 0 && { errorCount: { increment: totalErrors } }),
      },
    });

    if (job.agentConfig) {
      await prisma.agentConfig.update({
        where: { id: job.agentConfig.id },
        data: {
          executionCount: { increment: batches.length },
          lastRunAt: new Date(),
        },
      });
    }

    // Check error threshold
    const updatedJob = await prisma.researchJob.findUnique({ where: { id: jobId } });
    if (updatedJob && updatedJob.errorCount >= 25) {
      await prisma.researchJob.update({
        where: { id: jobId },
        data: { status: "failed", lastError: "Too many errors — job halted" },
      });
      break;
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

async function finalRewritePass(
  jobId: string,
  screenType: ScreenType,
  agentLabel: string
): Promise<void> {
  try {
    const completedItems = await prisma.researchJobItem.findMany({
      where: { jobId, status: "completed", output: { not: null } },
      orderBy: { createdAt: "asc" },
    });

    const results: Record<string, unknown>[] = [];
    for (const item of completedItems) {
      if (!item.output) continue;
      try {
        const parsed = JSON.parse(item.output);
        parsed._itemKey = item.itemKey;
        parsed._itemLabel = item.itemLabel;
        results.push(parsed);
      } catch {
        // skip
      }
    }

    if (results.length > 0) {
      await writeScreenResults(screenType, results, agentLabel);
    }
  } catch (err) {
    console.error(`Final rewrite pass failed for job ${jobId}:`, err);
  }
}
