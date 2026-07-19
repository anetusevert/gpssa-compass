import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { pauseScreenResearchJob } from "@/lib/research/engine";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    await pauseScreenResearchJob(params.id);
    return NextResponse.json({ status: "paused" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to pause job";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
