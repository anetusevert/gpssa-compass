import { prisma } from "@/lib/db";
import { getOpenAIClient } from "@/lib/openai";
import {
  RESEARCH_SYSTEM_PROMPT,
  buildUserPrompt,
  parseResearchResponse,
} from "./prompts";

const GPT4O_INPUT_COST = 2.5 / 1_000_000;
const GPT4O_OUTPUT_COST = 10.0 / 1_000_000;

export async function createResearchJob(): Promise<string> {
  const pendingCountries = await prisma.country.findMany({
    where: { researchStatus: { in: ["pending", "failed"] } },
    select: { iso3: true },
    orderBy: { name: "asc" },
  });

  const job = await prisma.researchJob.create({
    data: {
      type: "country-research",
      status: "running",
      totalItems: pendingCountries.length,
      model: "gpt-4o",
      batchSize: 3,
      startedAt: new Date(),
      items: {
        create: pendingCountries.map((c) => ({
          countryIso3: c.iso3,
          status: "pending",
        })),
      },
    },
  });

  return job.id;
}

export async function runResearchJob(jobId: string): Promise<void> {
  const client = await getOpenAIClient();
  if (!client) {
    await prisma.researchJob.update({
      where: { id: jobId },
      data: { status: "failed", lastError: "OpenAI API key not configured" },
    });
    return;
  }

  while (true) {
    const job = await prisma.researchJob.findUnique({ where: { id: jobId } });
    if (!job || job.status === "paused" || job.status === "cancelled") break;

    const pendingItems = await prisma.researchJobItem.findMany({
      where: { jobId, status: "pending" },
      take: job.batchSize,
      orderBy: { createdAt: "asc" },
    });

    if (pendingItems.length === 0) {
      await prisma.researchJob.update({
        where: { id: jobId },
        data: { status: "completed", completedAt: new Date() },
      });
      break;
    }

    const countries = await prisma.country.findMany({
      where: { iso3: { in: pendingItems.map((i) => i.countryIso3).filter((v): v is string => v != null) } },
      select: { iso3: true, name: true },
    });

    const nameMap = new Map(countries.map((c) => [c.name, c.iso3]));
    const iso3ToName = new Map(countries.map((c) => [c.iso3, c.name]));

    await prisma.researchJobItem.updateMany({
      where: { id: { in: pendingItems.map((i) => i.id) } },
      data: { status: "processing" },
    });

    await prisma.researchJob.update({
      where: { id: jobId },
      data: { currentItem: countries.map((c) => c.name).join(", ") },
    });

    await prisma.country.updateMany({
      where: { iso3: { in: pendingItems.map((i) => i.countryIso3).filter((v): v is string => v != null) } },
      data: { researchStatus: "researching" },
    });

    const startTime = Date.now();

    try {
      const completion = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: RESEARCH_SYSTEM_PROMPT },
          {
            role: "user",
            content: buildUserPrompt(countries.map((c) => c.name)),
          },
        ],
        max_tokens: 12288,
        temperature: 0.3,
        response_format: { type: "json_object" },
      });

      const durationMs = Date.now() - startTime;
      const rawOutput = completion.choices[0]?.message?.content ?? "[]";
      const tokensUsed = completion.usage?.total_tokens ?? 0;
      const promptTokens = completion.usage?.prompt_tokens ?? 0;
      const completionTokens = completion.usage?.completion_tokens ?? 0;
      const cost = promptTokens * GPT4O_INPUT_COST + completionTokens * GPT4O_OUTPUT_COST;

      let results = parseResearchResponse(rawOutput);

      // If the LLM returned a wrapper object like { countries: [...] }, unwrap it
      if (results.length === 0) {
        try {
          const parsed = JSON.parse(rawOutput.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim());
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            const firstArrayKey = Object.keys(parsed).find((k) => Array.isArray(parsed[k]));
            if (firstArrayKey) {
              results = parseResearchResponse(JSON.stringify(parsed[firstArrayKey]));
            }
          }
        } catch {
          // ignore secondary parse attempt
        }
      }

      for (const item of pendingItems) {
        const countryName = iso3ToName.get(item.countryIso3) ?? "";
        const result = results.find(
          (r) =>
            r.countryName.toLowerCase() === countryName.toLowerCase() ||
            r.countryName.toLowerCase().includes(countryName.toLowerCase()) ||
            countryName.toLowerCase().includes(r.countryName.toLowerCase())
        );

        if (result) {
          await prisma.country.update({
            where: { iso3: item.countryIso3 },
            data: {
              institution: result.institution,
              systemType: result.systemType,
              yearEstablished: result.yearEstablished,
              maturityScore: result.maturityScore,
              maturityLabel: result.maturityLabel,
              coverageRate: result.coverageRate,
              replacementRate: result.replacementRate,
              sustainability: result.sustainability,
              digitalLevel: result.digitalLevel,
              keyFeatures: JSON.stringify(result.keyFeatures),
              challenges: JSON.stringify(result.challenges),
              insights: JSON.stringify(result.insights),
              legislativeFramework: result.legislativeFramework,
              contributionRates: result.contributionRates ? JSON.stringify(result.contributionRates) : null,
              retirementAge: result.retirementAge ? JSON.stringify(result.retirementAge) : null,
              benefitTypes: result.benefitTypes.length > 0 ? JSON.stringify(result.benefitTypes) : null,
              fundManagement: result.fundManagement,
              recentReforms: result.recentReforms.length > 0 ? JSON.stringify(result.recentReforms) : null,
              internationalRankings: result.internationalRankings ? JSON.stringify(result.internationalRankings) : null,
              iloConventionsRatified: result.iloConventionsRatified,
              populationCovered: result.populationCovered,
              dataSources: result.dataSources.length > 0 ? JSON.stringify(result.dataSources) : null,
              researchStatus: "completed",
              researchedAt: new Date(),
              researchSource: "agent-gpt4o",
              rawResearchData: rawOutput,
            },
          });

          await prisma.researchJobItem.update({
            where: { id: item.id },
            data: {
              status: "completed",
              tokensUsed: Math.round(tokensUsed / pendingItems.length),
              durationMs: Math.round(durationMs / pendingItems.length),
            },
          });
        } else {
          await prisma.country.update({
            where: { iso3: item.countryIso3 },
            data: { researchStatus: "failed" },
          });

          await prisma.researchJobItem.update({
            where: { id: item.id },
            data: {
              status: "failed",
              error: `No matching result found for ${countryName} in LLM response`,
              durationMs: Math.round(durationMs / pendingItems.length),
            },
          });
        }
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
          totalTokens: { increment: tokensUsed },
          totalCost: { increment: cost },
        },
      });
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      for (const item of pendingItems) {
        await prisma.researchJobItem.update({
          where: { id: item.id },
          data: { status: "failed", error: errorMessage, durationMs },
        });
        await prisma.country.update({
          where: { iso3: item.countryIso3 },
          data: { researchStatus: "failed" },
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

      if ((await prisma.researchJob.findUnique({ where: { id: jobId } }))!.errorCount >= 5) {
        await prisma.researchJob.update({
          where: { id: jobId },
          data: { status: "failed", lastError: `Too many errors: ${errorMessage}` },
        });
        break;
      }
    }
  }
}

export async function pauseResearchJob(jobId: string): Promise<void> {
  await prisma.researchJob.update({
    where: { id: jobId },
    data: { status: "paused", pausedAt: new Date() },
  });
}

export async function cancelResearchJob(jobId: string): Promise<void> {
  await prisma.researchJob.update({
    where: { id: jobId },
    data: { status: "cancelled", completedAt: new Date() },
  });

  await prisma.researchJobItem.updateMany({
    where: { jobId, status: { in: ["pending", "processing"] } },
    data: { status: "skipped" },
  });
}
