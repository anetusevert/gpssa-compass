import { NextResponse } from "next/server";
import { resumeScreenResearchJob, runScreenResearchJob } from "@/lib/research/engine";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await resumeScreenResearchJob(params.id);

    runScreenResearchJob(params.id).catch((err) => {
      console.error(`Screen research job ${params.id} resume failed:`, err);
    });

    return NextResponse.json({ status: "running" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to resume job";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
