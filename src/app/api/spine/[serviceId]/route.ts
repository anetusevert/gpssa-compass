import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin-guard";
import { buildSpineGraph } from "@/lib/spine/query";

export async function GET(
  _req: Request,
  { params }: { params: { serviceId: string } }
) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const graph = await buildSpineGraph(params.serviceId);
    if (!graph) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }
    return NextResponse.json(graph);
  } catch (e) {
    console.error("spine graph", e);
    return NextResponse.json({ error: "Failed to load spine" }, { status: 500 });
  }
}
