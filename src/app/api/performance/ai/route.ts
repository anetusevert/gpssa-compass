import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getOpenAIClient } from "@/lib/openai";
import { prisma } from "@/lib/db";

/**
 * POST (admin) → AI helpers for the Performance & VoC module.
 *
 * task "voc-synthesis"  — raw complaint themes → drivers + recommended actions.
 * task "kqi-catalogue"  — a service → suggested KQIs each with feeding KPIs.
 *
 * Uses gpt-4o-mini with response_format json_object. Returns parsed JSON.
 */
export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const client = await getOpenAIClient();
    if (!client) {
      return NextResponse.json(
        { error: "AI not configured. Add an OpenAI API key in Admin → Settings." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const task = body.task as string;

    let system = "";
    let user = "";

    if (task === "voc-synthesis") {
      // Pull current complaint themes if none supplied.
      let themes = body.themes as
        | { theme: string; count: number; sentiment?: string }[]
        | undefined;
      if (!themes || themes.length === 0) {
        const rows = await prisma.complaintTheme.findMany();
        const agg: Record<string, { count: number; sentiment: string }> = {};
        for (const r of rows) {
          if (!agg[r.theme]) agg[r.theme] = { count: 0, sentiment: r.sentiment };
          agg[r.theme].count += r.count;
        }
        themes = Object.entries(agg)
          .map(([theme, v]) => ({ theme, count: v.count, sentiment: v.sentiment }))
          .sort((a, b) => b.count - a.count);
      }

      system =
        "You are a Voice-of-Customer analyst for a government pension authority (GPSSA). " +
        "Given raw complaint themes with volumes, synthesise the underlying drivers and concrete, prioritised corrective actions. " +
        "Apply Pareto thinking (focus on the vital few). Respond ONLY as JSON with shape: " +
        '{"drivers":[{"driver":string,"themes":string[],"impact":"high|medium|low"}],' +
        '"recommendedActions":[{"action":string,"rationale":string,"owner":string,"priority":"high|medium|low"}],' +
        '"summary":string}.';
      user =
        "Complaint themes (theme, count, sentiment):\n" +
        themes
          .map((t) => `- ${t.theme} | ${t.count} | ${t.sentiment ?? "negative"}`)
          .join("\n");
    } else if (task === "kqi-catalogue") {
      const service = (body.service as string) ?? "a core pension service";
      system =
        "You are a service-performance architect applying TM Forum GB917 (KPI→KQI aggregation) and the Balanced Scorecard. " +
        "For the given GPSSA service, propose citizen-facing KQIs (service-quality commitments), each decomposing into named feeding operational KPIs with a formula. " +
        "Mark each KQI's Balanced-Scorecard perspective (financial|customer|process|capacity), timing (leading|lagging) and tier (operational|tactical|strategic). " +
        "Respond ONLY as JSON with shape: " +
        '{"service":string,"kqis":[{"name":string,"unit":string,"target":string,' +
        '"perspective":string,"timing":string,"tier":string,' +
        '"feedingKpis":[{"name":string,"unit":string,"timing":string,"formula":string}]}]}.';
      user = `Service: ${service}. Propose 3–4 KQIs with feeding KPIs.`;
    } else {
      return NextResponse.json(
        { error: "Unknown task. Use 'voc-synthesis' or 'kqi-catalogue'." },
        { status: 400 }
      );
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
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
    console.error("Performance AI task failed:", error);
    return NextResponse.json(
      { error: "AI task failed" },
      { status: 500 }
    );
  }
}
