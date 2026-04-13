import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, requireAuth } from "@/lib/admin-guard";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await requireAuth();
    if (error) return error;

    const agent = await prisma.agentConfig.findUnique({
      where: { id: params.id },
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

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    return NextResponse.json(agent);
  } catch (error) {
    console.error("Failed to fetch agent:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const existing = await prisma.agentConfig.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const body = await req.json();

    const agent = await prisma.agentConfig.update({
      where: { id: params.id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.systemPrompt !== undefined && {
          systemPrompt: body.systemPrompt,
        }),
        ...(body.userPromptTemplate !== undefined && {
          userPromptTemplate: body.userPromptTemplate,
        }),
        ...(body.model !== undefined && { model: body.model }),
        ...(body.provider !== undefined && { provider: body.provider }),
        ...(body.maxTokens !== undefined && { maxTokens: body.maxTokens }),
        ...(body.temperature !== undefined && {
          temperature: body.temperature,
        }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });

    return NextResponse.json(agent);
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "An agent with this name already exists" },
        { status: 409 }
      );
    }
    console.error("Failed to update agent:", error);
    return NextResponse.json(
      { error: "Failed to update agent" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const existing = await prisma.agentConfig.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    await prisma.agentConfig.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true, message: "Agent deactivated" });
  } catch (error) {
    console.error("Failed to deactivate agent:", error);
    return NextResponse.json(
      { error: "Failed to deactivate agent" },
      { status: 500 }
    );
  }
}
