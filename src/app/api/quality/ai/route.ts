import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getOpenAIClient } from "@/lib/openai";

/**
 * AI-assist for the QA module.
 *   task "scorecard" → draft scorecard criteria for a service.
 *   task "rootcause" → ranked root-cause hypotheses + corrective actions for a defect cluster.
 * Returns parsed JSON; nothing is persisted.
 */

const SYSTEM_PROMPTS: Record<string, string> = {
  scorecard:
    "You are a COPC-certified quality-assurance designer for a government pension authority (GPSSA, UAE). " +
    "Given a service, draft a QA scorecard of 10–14 criteria grouped by the six quality dimensions " +
    "(accuracy, completeness, compliance, timeliness, customer experience, consistency). " +
    "Mark 2–3 compliance/identity criteria as critical auto-fails. " +
    'Respond ONLY as JSON: { "criteria": [ { "text": string, "dimension": string, "weight": number, "critical": boolean } ] }.',
  rootcause:
    "You are a Lean Six Sigma root-cause analyst for a government pension authority. " +
    "Given a cluster of defects, return ranked root-cause hypotheses (most likely first) and concrete corrective actions, " +
    "each tagged with an RCA method (5why | fishbone | fault-tree) and an improvement cycle (pdca | dmaic). " +
    'Respond ONLY as JSON: { "hypotheses": [ { "rootCause": string, "rationale": string, "method": string, "confidence": number } ], ' +
    '"correctiveActions": [ { "title": string, "owner": string, "cycle": string, "effectivenessCheck": string } ] }.',
};

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const client = await getOpenAIClient();
    if (!client) {
      return NextResponse.json(
        { error: "AI not configured. Set the OpenAI key in Admin → AI Configuration." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { task, payload } = body as { task: string; payload: unknown };

    const system = SYSTEM_PROMPTS[task];
    if (!system) {
      return NextResponse.json(
        { error: `Unknown task '${task}'. Expected 'scorecard' or 'rootcause'.` },
        { status: 400 }
      );
    }

    const userContent =
      typeof payload === "string" ? payload : JSON.stringify(payload ?? {}, null, 2);

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: userContent },
      ],
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { error: "Model returned invalid JSON", raw };
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("POST /api/quality/ai failed:", error);
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }
}
