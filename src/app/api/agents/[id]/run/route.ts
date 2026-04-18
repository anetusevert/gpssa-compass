import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/admin-guard";
import { runAgent } from "@/lib/openai";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const agent = await prisma.agentConfig.findUnique({
      where: { id: params.id },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    if (!agent.isActive) {
      return NextResponse.json(
        { error: "Agent is deactivated" },
        { status: 400 }
      );
    }

    const apiKey = await prisma.appConfig.findUnique({
      where: { key: "openai_api_key" },
    });

    if (!apiKey?.value) {
      return NextResponse.json(
        {
          error: "OpenAI API key not configured",
          message:
            "Please configure your OpenAI API key in Admin → Settings before running agents.",
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const variables: Record<string, string> = body.variables ?? {};

    const result = await runAgent(
      agent.id,
      {
        name: agent.name,
        systemPrompt: agent.systemPrompt,
        userPromptTemplate: agent.userPromptTemplate,
        model: agent.model,
        maxTokens: agent.maxTokens,
        temperature: agent.temperature,
        targetScreen: agent.targetScreen,
      },
      variables
    );

    if (!result.success) {
      return NextResponse.json(
        { error: "Agent execution failed", details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to run agent";
    console.error("Agent run error:", error);

    if (message.includes("API key not configured")) {
      return NextResponse.json(
        { error: message },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
