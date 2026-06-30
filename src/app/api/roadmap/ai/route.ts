import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getOpenAIClient } from "@/lib/openai";

// POST /api/roadmap/ai (requireAdmin)
//   { task: "raci",              process: string }            → suggested RACI rows
//   { task: "roadmap-narrative", context: string }            → executive narrative
// Returns parsed JSON. Null OpenAI client → 400.
export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const task: string = body.task;

    const client = await getOpenAIClient();
    if (!client) {
      return NextResponse.json(
        {
          error:
            "AI not configured. Add your OpenAI API key in Admin → Settings to use AI suggestions.",
        },
        { status: 400 }
      );
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (task === "raci") {
      const process: string = body.process ?? "";
      systemPrompt =
        "You are a governance design assistant for a public pension authority. " +
        "Produce a sector-wide RACI for a process. The teams are: Front-Line, Specialist, " +
        "QA CoE, Ops Mgmt, Compliance. Roles are R (Responsible), A (Accountable), " +
        "S (Support), C (Consulted), I (Informed). CARDINAL RULE: exactly ONE 'A' per activity. " +
        'Respond ONLY with JSON of shape: {"processArea": string, "rows": ' +
        '[{"activity": string, "roles": {"Front-Line": "R|A|S|C|I", "Specialist": "...", ' +
        '"QA CoE": "...", "Ops Mgmt": "...", "Compliance": "..."}}]}.';
      userPrompt = `Generate a RACI for this process: "${process}". Provide 4-6 deliverable-framed activities.`;
    } else if (task === "roadmap-narrative") {
      const context: string = body.context ?? "";
      systemPrompt =
        "You are a strategy consultant writing an executive roadmap narrative for GPSSA. " +
        'Respond ONLY with JSON of shape: {"headline": string, "summary": string, ' +
        '"workstreamA": string, "workstreamB": string, "risks": [string], "nextSteps": [string]}.';
      userPrompt = `Write the roadmap narrative given this context:\n${context}`;
    } else {
      return NextResponse.json(
        { error: "Unknown task. Use 'raci' or 'roadmap-narrative'." },
        { status: 400 }
      );
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.4,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "AI returned malformed JSON", raw },
        { status: 502 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Roadmap AI request failed:", error);
    return NextResponse.json(
      { error: "AI request failed" },
      { status: 500 }
    );
  }
}
