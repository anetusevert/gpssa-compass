import { NextResponse } from "next/server";
import { pauseScreenResearchJob } from "@/lib/research/engine";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await pauseScreenResearchJob(params.id);
    return NextResponse.json({ status: "paused" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to pause job";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
