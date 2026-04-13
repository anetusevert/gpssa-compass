import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, requireAuth } from "@/lib/admin-guard";
import { agentService } from "@/lib/services";

export async function GET() {
  try {
    const { error } = await requireAuth();
    if (error) return error;

    const agents = await agentService.listAgents();
    return NextResponse.json(agents);
  } catch (err) {
    console.error("Failed to fetch agents:", err);
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

    const agent = await agentService.createAgent(body);
    return NextResponse.json(agent, { status: 201 });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json(
        { error: "An agent with this name already exists" },
        { status: 409 }
      );
    }
    console.error("Failed to create agent:", err);
    return NextResponse.json(
      { error: "Failed to create agent" },
      { status: 500 }
    );
  }
}
