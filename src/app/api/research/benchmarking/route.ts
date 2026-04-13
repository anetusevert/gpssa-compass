import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin-guard";
import { getBenchmarkWorkspace } from "@/lib/benchmarking/workspace";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const workspace = await getBenchmarkWorkspace();
    if (!workspace) {
      return NextResponse.json(
        { error: "Benchmark dataset not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(workspace);
  } catch (requestError) {
    console.error("Failed to fetch benchmark workspace:", requestError);
    return NextResponse.json(
      { error: "Failed to fetch benchmark workspace" },
      { status: 500 }
    );
  }
}
