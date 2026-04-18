import { prisma } from "@/lib/db";
import { DEFAULT_AGENTS } from "@/lib/agents";

export interface SeedDefaultsResult {
  created: number;
  updated: number;
  failed: Array<{ id: string; name: string; error: string }>;
}

export class AgentService {
  /**
   * Idempotent, resilient upsert of every entry in DEFAULT_AGENTS.
   *
   * - Looks up existing rows by `id` first (the stable identifier we control), then by
   *   `name` (for backwards compatibility with rows seeded before id-keyed lookups
   *   existed). This avoids the unique-constraint failure that occurs when an agent is
   *   renamed in DEFAULT_AGENTS but its `id` already exists in the DB.
   * - Each agent is processed independently — one failed row never rolls back the rest,
   *   so a partial schema drift can't take down /api/agents.
   */
  async seedDefaults(): Promise<SeedDefaultsResult> {
    const result: SeedDefaultsResult = { created: 0, updated: 0, failed: [] };

    for (const agent of DEFAULT_AGENTS) {
      try {
        const updateData = {
          name: agent.name,
          description: agent.description,
          systemPrompt: agent.systemPrompt,
          userPromptTemplate: agent.userPromptTemplate,
          maxTokens: agent.maxTokens,
          temperature: agent.temperature,
          targetScreen: agent.targetScreen ?? null,
          researchType: agent.researchType ?? null,
          sortOrder: agent.sortOrder,
          isActive: agent.isActive,
        };

        const byId = await prisma.agentConfig.findUnique({
          where: { id: agent.id },
          select: { id: true, name: true },
        });

        if (byId) {
          // Row exists by id — refresh all fields (including a renamed name).
          await prisma.agentConfig.update({ where: { id: agent.id }, data: updateData });
          result.updated++;
          continue;
        }

        // No row with this id — check whether the name is taken by another (legacy) row.
        const byName = await prisma.agentConfig.findUnique({
          where: { name: agent.name },
          select: { id: true },
        });

        if (byName) {
          // Update fields on the existing row but preserve its id (and don't touch name).
          const { name: _name, ...rest } = updateData;
          void _name;
          await prisma.agentConfig.update({ where: { id: byName.id }, data: rest });
          result.updated++;
          continue;
        }

        // Neither id nor name exists — create a fresh row.
        await prisma.agentConfig.create({
          data: {
            id: agent.id,
            model: agent.model,
            ...updateData,
          },
        });
        result.created++;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        result.failed.push({ id: agent.id, name: agent.name, error: message });
        console.error(`[seedDefaults] Failed for agent ${agent.id} (${agent.name}):`, message);
      }
    }

    return result;
  }

  async listAgents() {
    // Auto-seed on every request only in development. In production, the deploy script
    // (prisma/seed.ts, invoked by railway.json's startCommand) handles seeding once, so
    // running it again per-request is wasted work and any transient failure here would
    // 500 the entire admin page. seedDefaults is also resilient (per-row try/catch) so a
    // dev-time failure logs but doesn't propagate.
    if (process.env.NODE_ENV !== "production") {
      try {
        await this.seedDefaults();
      } catch (err) {
        console.error("[listAgents] seedDefaults threw (ignored):", err);
      }
    }

    return prisma.agentConfig.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { executions: true } } },
    });
  }

  async getAgent(id: string) {
    return prisma.agentConfig.findUnique({
      where: { id },
      include: {
        executions: {
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            id: true,
            input: true,
            output: true,
            model: true,
            tokensUsed: true,
            durationMs: true,
            status: true,
            error: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async createAgent(data: {
    name: string;
    description?: string;
    systemPrompt: string;
    userPromptTemplate: string;
    model?: string;
    provider?: string;
    maxTokens?: number;
    temperature?: number;
  }) {
    return prisma.agentConfig.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        systemPrompt: data.systemPrompt,
        userPromptTemplate: data.userPromptTemplate,
        model: data.model ?? "gpt-4o",
        provider: data.provider ?? "openai",
        maxTokens: data.maxTokens ?? 4096,
        temperature: data.temperature ?? 0.7,
      },
    });
  }

  async updateAgent(
    id: string,
    data: {
      name?: string;
      description?: string;
      systemPrompt?: string;
      userPromptTemplate?: string;
      model?: string;
      provider?: string;
      maxTokens?: number;
      temperature?: number;
      isActive?: boolean;
    }
  ) {
    const existing = await prisma.agentConfig.findUnique({ where: { id } });
    if (!existing) return null;

    return prisma.agentConfig.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.systemPrompt !== undefined && { systemPrompt: data.systemPrompt }),
        ...(data.userPromptTemplate !== undefined && { userPromptTemplate: data.userPromptTemplate }),
        ...(data.model !== undefined && { model: data.model }),
        ...(data.provider !== undefined && { provider: data.provider }),
        ...(data.maxTokens !== undefined && { maxTokens: data.maxTokens }),
        ...(data.temperature !== undefined && { temperature: data.temperature }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  }

  async deactivateAgent(id: string) {
    const existing = await prisma.agentConfig.findUnique({ where: { id } });
    if (!existing) return null;

    return prisma.agentConfig.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

export const agentService = new AgentService();
