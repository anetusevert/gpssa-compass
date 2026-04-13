import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, requireAuth } from "@/lib/admin-guard";
import { agentService } from "@/lib/services";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await requireAuth();
    if (error) return error;

    const agent = await agentService.getAgent(params.id);
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }
    return NextResponse.json(agent);
  } catch (err) {
    console.error("Failed to fetch agent:", err);
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
    const body = await req.json();
    const agent = await agentService.updateAgent(params.id, body);

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }
    return NextResponse.json(agent);
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json(
        { error: "An agent with this name already exists" },
        { status: 409 }
      );
    }
    console.error("Failed to update agent:", err);
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
    const agent = await agentService.deactivateAgent(params.id);
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Agent deactivated" });
  } catch (err) {
    console.error("Failed to deactivate agent:", err);
    return NextResponse.json(
      { error: "Failed to deactivate agent" },
      { status: 500 }
    );
  }
}
