import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { pauseResearchJob } from "@/lib/countries/research-agent";

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  await pauseResearchJob(params.id);
  return NextResponse.json({ success: true, status: "paused" });
}
