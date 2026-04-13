import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, requireAuth } from "@/lib/admin-guard";
import { DEFAULT_AGENTS } from "@/lib/agents";

async function seedDefaultAgents() {
  const agents = await prisma.$transaction(
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
  return agents;
}

export async function GET() {
  try {
    const { error } = await requireAuth();
    if (error) return error;

    let agents = await prisma.agentConfig.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { executions: true } },
      },
    });

    if (agents.length === 0) {
      await seedDefaultAgents();
      agents = await prisma.agentConfig.findMany({
        orderBy: { name: "asc" },
        include: {
          _count: { select: { executions: true } },
        },
      });
    }

    return NextResponse.json(agents);
  } catch (error) {
    console.error("Failed to fetch agents:", error);
    return NextResponse.json(
      { error: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();

    if (!body.name || !body.systemPrompt || !body.userPromptTemplate) {
      return NextResponse.json(
        { error: "name, systemPrompt, and userPromptTemplate are required" },
        { status: 400 }
      );
    }

    const agent = await prisma.agentConfig.create({
      data: {
        name: body.name,
        description: body.description ?? null,
        systemPrompt: body.systemPrompt,
        userPromptTemplate: body.userPromptTemplate,
        model: body.model ?? "gpt-4o",
        provider: body.provider ?? "openai",
        maxTokens: body.maxTokens ?? 4096,
        temperature: body.temperature ?? 0.7,
      },
    });

    return NextResponse.json(agent, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "An agent with this name already exists" },
        { status: 409 }
      );
    }
    console.error("Failed to create agent:", error);
    return NextResponse.json(
      { error: "Failed to create agent" },
      { status: 500 }
    );
  }
}
