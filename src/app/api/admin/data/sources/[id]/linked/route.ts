import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { dataService } from "@/lib/services";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await context.params;
    const linked = await dataService.listLinkedEntities(id);
    return NextResponse.json(linked);
  } catch (err) {
    console.error("Failed to load linked entities:", err);
    return NextResponse.json(
      { error: "Failed to load linked entities" },
      { status: 500 }
    );
  }
}
