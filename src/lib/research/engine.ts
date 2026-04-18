import { prisma } from "@/lib/db";
import { getOpenAIClient, resolveSystemPrompt } from "@/lib/openai";
import { withOpenAIRetry } from "@/lib/openai/retry";
import { calcCostUSD } from "@/lib/openai/pricing";
import { PROMPT_MODULES } from "./prompts";
import { writeScreenResults } from "./writers";
import type { ScreenType } from "./types";
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

const STRICT_BATCH_MATCHING =
  (process.env.STRICT_BATCH_MATCHING ?? "true").toLowerCase() !== "false";

function normalizeKey(v: unknown): string {
  return String(v ?? "").toLowerCase().trim();
}

function extractResultKey(r: Record<string, unknown>): string | null {
  const candidates = [
    r._itemKey,
    r.iso3,
    r.itemKey,
    r.id,
    r.code,
    r.institutionId,
    r.serviceId,
    r.productId,
    r.personaId,
    r.modelId,
    r.channelId,
  ];
  for (const c of candidates) {
    const norm = normalizeKey(c);
    if (norm) return norm;
  }
  return null;
}

function extractResultLabel(r: Record<string, unknown>): string {
  return normalizeKey(
    r.countryName ??
      r.institutionName ??
      r.serviceName ??
      r.name ??
      r.title ??
      r.segment ??
      r.theme
  );
}

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

    const completion = await withOpenAIRetry(() =>
      ctx.client.chat.completions.create({
        model: ctx.model,
        messages: [
          { role: "system", content: ctx.systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_completion_tokens: ctx.maxTokens,
        ...(!isReasoningModel && { temperature: ctx.temperature }),
        ...(!isReasoningModel && { response_format: { type: "json_object" } }),
      })
    );

    const durationMs = Date.now() - startTime;
    const rawOutput = completion.choices[0]?.message?.content ?? "{}";
    const tokensUsed = completion.usage?.total_tokens ?? 0;
    const promptTokens = completion.usage?.prompt_tokens ?? 0;
    const completionTokens = completion.usage?.completion_tokens ?? 0;
    const cost = calcCostUSD(ctx.model, promptTokens, completionTokens);

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
      const remaining = [...results];
      const unmatched: ResearchJobItemRecord[] = [];

      for (const item of items) {
        const itemKey = normalizeKey(item.itemKey);
        const itemLabel = normalizeKey(item.itemLabel);
        const itemContext = normalizeKey(item.itemContext);

        let matchIdx = -1;

        if (itemKey) {
          matchIdx = remaining.findIndex((r) => extractResultKey(r) === itemKey);
        }

        if (matchIdx === -1 && itemLabel) {
          matchIdx = remaining.findIndex((r) => {
            const rLabel = extractResultLabel(r);
            if (!rLabel) return false;
            const labelMatch = rLabel === itemLabel;
            if (!labelMatch) return false;
            if (itemContext && r.coverageType) {
              return normalizeKey(r.coverageType).includes(itemContext);
            }
            return true;
          });
        }

        if (matchIdx === -1 && itemLabel) {
          matchIdx = remaining.findIndex((r) => {
            const rLabel = extractResultLabel(r);
            if (!rLabel) return false;
            return rLabel.includes(itemLabel) || itemLabel.includes(rLabel);
          });
        }

        if (matchIdx !== -1) {
          const itemResult = remaining.splice(matchIdx, 1)[0];
          itemResult._itemKey = item.itemKey;
          itemResult._itemLabel = item.itemLabel;
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
          unmatched.push(item);
        }
      }

      if (!STRICT_BATCH_MATCHING && unmatched.length > 0 && remaining.length > 0) {
        console.log(
          `[engine] Positional fallback (STRICT_BATCH_MATCHING=false): ${unmatched.length} unmatched, ${remaining.length} remaining`
        );
        const stillUnmatched: ResearchJobItemRecord[] = [];
        for (const item of unmatched) {
          if (remaining.length === 0) {
            stillUnmatched.push(item);
            continue;
          }
          const fallbackResult = remaining.shift()!;
          fallbackResult._itemKey = item.itemKey;
          fallbackResult._itemLabel = item.itemLabel;
          matchedResults.push(fallbackResult);

          await prisma.researchJobItem.update({
            where: { id: item.id },
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

      for (const item of unmatched) {
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

  const systemPrompt = resolveSystemPrompt(
    job.agentConfig?.systemPrompt ?? "USE_CANONICAL_PROMPT",
    screenType
  );
  const agentLabel = `agent-${job.model}-${screenType}`;

  const concurrency = job.agentConfig?.concurrency ?? job.concurrency ?? 5;

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

  console.log(
    `[engine] Job ${jobId}: starting with batchSize=${job.batchSize}, concurrency=${concurrency}, model=${job.model}, strictMatch=${STRICT_BATCH_MATCHING}`
  );

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

    const batches: (typeof allPending)[] = [];
    for (let i = 0; i < allPending.length; i += currentJob.batchSize) {
      batches.push(allPending.slice(i, i + currentJob.batchSize));
    }

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

    console.log(`[engine] Job ${jobId}: wave of ${allPending.length} items in ${batches.length} parallel batches`);
    const settled = await Promise.allSettled(
      batches.map((batch) => processBatch(batch, batchCtx))
    );

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

    if (allMatchedResults.length > 0) {
      await writeScreenResults(screenType, allMatchedResults, agentLabel);
    }

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
