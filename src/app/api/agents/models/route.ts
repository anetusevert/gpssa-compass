import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin-guard";
import { fetchAvailableModels, getOpenAIClient } from "@/lib/openai";

export async function GET() {
  try {
    const { error } = await requireAuth();
    if (error) return error;

    const client = await getOpenAIClient();
    if (!client) {
      return NextResponse.json({
        models: [],
        message:
          "OpenAI API key not configured. Add your key in Admin → Settings to see available models.",
      });
    }

    const models = await fetchAvailableModels();

    return NextResponse.json({ models });
  } catch (error) {
    console.error("Failed to fetch models:", error);
    return NextResponse.json(
      { error: "Failed to fetch models" },
      { status: 500 }
    );
  }
}
