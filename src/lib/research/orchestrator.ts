import { prisma } from "@/lib/db";
import { createScreenResearchJob } from "./dispatcher";
import { runScreenResearchJob } from "./engine";

/**
 * Pillar-by-pillar orchestrator for "Run all" workflows.
 *
 * Within each pillar:
 *   - Atlas runs the 3 sub-agents (system / performance / insights) in parallel,
 *     then runs atlas-benchmarking only after all three complete successfully.
 *   - Other pillars run their agents sequentially in `sortOrder`, awaiting each
 *     job before starting the next so persistence and dependent screens stay coherent.
 *
 * Across pillars:
 *   - Atlas → Services → Products → Delivery → International → ILO is the
 *     default execution order. Each pillar finishes before the next starts so
 *     model-spend pacing and rate limits stay predictable.
 */

type ScreenName = string;

export const PILLAR_ORDER = [
  "mandate",
  "atlas",
  "services",
  "products",
  "delivery",
  "international",
  "ilo",
] as const;

export type PillarKey = (typeof PILLAR_ORDER)[number];

export const PILLAR_SCREENS: Record<PillarKey, ScreenName[]> = {
  mandate: ["mandate-corpus"],
  atlas: ["atlas-system", "atlas-performance", "atlas-insights", "atlas-benchmarking", "atlas-worldmap"],
  services: ["services-catalog", "services-channels", "services-analysis"],
  products: ["products-portfolio", "products-segments", "products-innovation"],
  delivery: ["delivery-channels", "delivery-personas", "delivery-models"],
  international: [
    "intl-services-catalog",
    "intl-services-channels",
    "intl-products-portfolio",
    "intl-products-segments",
    "intl-delivery-channels",
    "intl-delivery-personas",
    "intl-delivery-models",
  ],
  ilo: ["ilo-standards"],
};

export const ATLAS_SUB_SCREENS: ScreenName[] = [
  "atlas-system",
  "atlas-performance",
  "atlas-insights",
];
export const ATLAS_BENCHMARK_SCREEN: ScreenName = "atlas-benchmarking";

interface OrchestratorAgent {
  id: string;
  targetScreen: string;
  sortOrder: number;
  isActive: boolean;
}

export interface OrchestrationResult {
  pillar: PillarKey;
  agentId: string;
  targetScreen: string;
  jobId: string | null;
  status: "completed" | "failed" | "skipped";
  error?: string;
}

async function runAgentJob(agent: OrchestratorAgent): Promise<OrchestrationResult> {
  const baseResult: Omit<OrchestrationResult, "status"> = {
    pillar: pillarFromScreen(agent.targetScreen),
    agentId: agent.id,
    targetScreen: agent.targetScreen,
    jobId: null,
  };

  let jobId: string;
  try {
    jobId = await createScreenResearchJob(agent.id);
  } catch (err) {
    const message = err instanceof Error ? err.message : "create_failed";
    // "No items to research" is a benign skip — treat as completed to keep pipeline moving.
    if (/no items to research/i.test(message)) {
      return { ...baseResult, status: "skipped" };
    }
    return { ...baseResult, status: "failed", error: message };
  }

  try {
    await runScreenResearchJob(jobId);
    return { ...baseResult, jobId, status: "completed" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "run_failed";
    return { ...baseResult, jobId, status: "failed", error: message };
  }
}

function pillarFromScreen(screen: string): PillarKey {
  for (const key of PILLAR_ORDER) {
    if (PILLAR_SCREENS[key].includes(screen)) return key;
  }
  return "atlas";
}

async function loadActiveAgentsByScreen(): Promise<Map<ScreenName, OrchestratorAgent>> {
  const agents = await prisma.agentConfig.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  const byScreen = new Map<ScreenName, OrchestratorAgent>();
  for (const a of agents) {
    if (!a.targetScreen) continue;
    // Always prefer the first active agent for a screen (lowest sort order)
    if (!byScreen.has(a.targetScreen)) {
      byScreen.set(a.targetScreen, {
        id: a.id,
        targetScreen: a.targetScreen,
        sortOrder: a.sortOrder ?? 0,
        isActive: a.isActive,
      });
    }
  }
  return byScreen;
}

async function runAtlasPillar(
  byScreen: Map<ScreenName, OrchestratorAgent>,
  results: OrchestrationResult[]
): Promise<void> {
  const subAgents = ATLAS_SUB_SCREENS.map((s) => byScreen.get(s)).filter(
    (a): a is OrchestratorAgent => !!a
  );

  if (subAgents.length === 0) {
    // Fall back to legacy worldmap if sub-agents aren't seeded yet
    const fallback = byScreen.get("atlas-worldmap");
    if (fallback) {
      results.push(await runAgentJob(fallback));
    }
  } else {
    const subResults = await Promise.all(subAgents.map(runAgentJob));
    results.push(...subResults);

    const allOk = subResults.every((r) => r.status === "completed" || r.status === "skipped");
    const benchmark = byScreen.get(ATLAS_BENCHMARK_SCREEN);
    if (allOk && benchmark) {
      results.push(await runAgentJob(benchmark));
    } else if (benchmark) {
      results.push({
        pillar: "atlas",
        agentId: benchmark.id,
        targetScreen: benchmark.targetScreen,
        jobId: null,
        status: "skipped",
        error: "skipped because one or more atlas sub-agents failed",
      });
    }
  }
}

async function runSequentialPillar(
  pillar: PillarKey,
  byScreen: Map<ScreenName, OrchestratorAgent>,
  results: OrchestrationResult[]
): Promise<void> {
  const screens = PILLAR_SCREENS[pillar];
  const agents = screens
    .map((s) => byScreen.get(s))
    .filter((a): a is OrchestratorAgent => !!a)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  for (const agent of agents) {
    results.push(await runAgentJob(agent));
  }
}

export async function runAllPillars(opts: {
  pillars?: PillarKey[];
} = {}): Promise<OrchestrationResult[]> {
  const order = opts.pillars ?? PILLAR_ORDER;
  const byScreen = await loadActiveAgentsByScreen();
  const results: OrchestrationResult[] = [];

  for (const pillar of order) {
    if (pillar === "atlas") {
      await runAtlasPillar(byScreen, results);
    } else {
      await runSequentialPillar(pillar, byScreen, results);
    }
  }

  return results;
}
