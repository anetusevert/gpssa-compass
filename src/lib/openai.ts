import OpenAI from "openai";
import { prisma } from "@/lib/db";
import { withOpenAIRetry } from "@/lib/openai/retry";
import { calcCostUSD } from "@/lib/openai/pricing";
import { PROMPT_MODULES } from "@/lib/research/prompts";
import type { ScreenType } from "@/lib/research/types";

export interface AgentInput {
  name: string;
  systemPrompt: string;
  userPromptTemplate: string;
  model: string;
  maxTokens: number;
  temperature: number;
  targetScreen?: string | null;
}

export interface AgentExecutionResult {
  success: boolean;
  output: string | null;
  tokensUsed: number;
  durationMs: number;
  model: string;
  costUSD?: number;
  error?: string;
}

let cachedClient: OpenAI | null = null;
let cachedKeyHash: string | null = null;

export async function getOpenAIClient(): Promise<OpenAI | null> {
  const config = await prisma.appConfig.findUnique({
    where: { key: "openai_api_key" },
  });

  if (!config?.value) return null;

  if (cachedClient && cachedKeyHash === config.value) return cachedClient;

  cachedClient = new OpenAI({ apiKey: config.value });
  cachedKeyHash = config.value;
  return cachedClient;
}

export async function fetchAvailableModels(): Promise<
  { id: string; name: string }[]
> {
  const client = await getOpenAIClient();
  if (!client) return [];

  try {
    const response = await client.models.list();
    const models: { id: string; name: string }[] = [];

    const CHAT_PREFIXES = ["gpt-", "o1", "o3", "o4", "chatgpt-"];

    for await (const model of response) {
      if (CHAT_PREFIXES.some((p) => model.id.startsWith(p))) {
        models.push({ id: model.id, name: model.id });
      }
    }

    models.sort((a, b) => a.id.localeCompare(b.id));
    return models;
  } catch (error) {
    console.error("Failed to fetch OpenAI models:", error);
    return [];
  }
}

export function substituteVariables(
  template: string,
  variables: Record<string, string>
): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return variables[key] !== undefined ? variables[key] : match;
  });
}

/**
 * Resolve "USE_CANONICAL_PROMPT" sentinel to the canonical system prompt for the
 * agent's targetScreen. This prevents the literal sentinel from being sent to OpenAI.
 */
export function resolveSystemPrompt(
  systemPrompt: string,
  targetScreen?: string | null
): string {
  if (systemPrompt && systemPrompt !== "USE_CANONICAL_PROMPT") return systemPrompt;
  if (!targetScreen) return systemPrompt;
  const canonical = PROMPT_MODULES[targetScreen as ScreenType];
  return canonical?.systemPrompt ?? systemPrompt;
}

export async function runAgent(
  agentConfigId: string,
  agentInput: AgentInput,
  variables: Record<string, string>
): Promise<AgentExecutionResult> {
  const client = await getOpenAIClient();
  if (!client) {
    throw new Error(
      "OpenAI API key not configured. Go to Admin → Settings to add your API key."
    );
  }

  const execution = await prisma.agentExecution.create({
    data: {
      agentId: agentConfigId,
      input: JSON.stringify(variables),
      model: agentInput.model,
      status: "running",
    },
  });

  const startTime = Date.now();

  try {
    const userPrompt = substituteVariables(
      agentInput.userPromptTemplate,
      variables
    );

    const isReasoningModel = /^(o1|o3|o4)/.test(agentInput.model);
    const systemPrompt = resolveSystemPrompt(agentInput.systemPrompt, agentInput.targetScreen);

    const completion = await withOpenAIRetry(() =>
      client.chat.completions.create({
        model: agentInput.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_completion_tokens: agentInput.maxTokens,
        ...(!isReasoningModel && { temperature: agentInput.temperature }),
      })
    );

    const durationMs = Date.now() - startTime;
    const output = completion.choices[0]?.message?.content ?? null;
    const tokensUsed = completion.usage?.total_tokens ?? 0;
    const promptTokens = completion.usage?.prompt_tokens ?? 0;
    const completionTokens = completion.usage?.completion_tokens ?? 0;
    const costUSD = calcCostUSD(agentInput.model, promptTokens, completionTokens);

    await prisma.agentExecution.update({
      where: { id: execution.id },
      data: {
        output: output ? JSON.stringify({ content: output }) : null,
        tokensUsed,
        durationMs,
        status: "completed",
      },
    });

    await prisma.agentConfig.update({
      where: { id: agentConfigId },
      data: {
        executionCount: { increment: 1 },
        lastRunAt: new Date(),
      },
    });

    return { success: true, output, tokensUsed, durationMs, model: agentInput.model, costUSD };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    await prisma.agentExecution.update({
      where: { id: execution.id },
      data: {
        durationMs,
        status: "failed",
        error: errorMessage,
      },
    });

    console.error(`Agent execution failed [${agentInput.name}]:`, error);

    return {
      success: false,
      output: null,
      tokensUsed: 0,
      durationMs,
      model: agentInput.model,
      error: errorMessage,
    };
  }
}
