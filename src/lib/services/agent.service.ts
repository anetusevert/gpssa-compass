import { prisma } from "@/lib/db";
import { DEFAULT_AGENTS } from "@/lib/agents";

export class AgentService {
  async seedDefaults() {
    return prisma.$transaction(
      DEFAULT_AGENTS.map((agent) =>
        prisma.agentConfig.upsert({
          where: { name: agent.name },
          update: {},
          create: {
            id: agent.id,
            name: agent.name,
            description: agent.description,
            systemPrompt: agent.systemPrompt,
            userPromptTemplate: agent.userPromptTemplate,
            model: agent.model,
            maxTokens: agent.maxTokens,
            temperature: agent.temperature,
          },
        })
      )
    );
  }

  async listAgents() {
    let agents = await prisma.agentConfig.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { executions: true } } },
    });

    if (agents.length === 0) {
      await this.seedDefaults();
      agents = await prisma.agentConfig.findMany({
        orderBy: { name: "asc" },
        include: { _count: { select: { executions: true } } },
      });
    }

    return agents;
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
