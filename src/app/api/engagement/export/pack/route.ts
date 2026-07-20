import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/admin-guard";
import { ENGAGEMENT_PHASES, PLAYBOOK_ONE_LINER, PROJECT_JOBS } from "@/lib/engagement/playbook";

/**
 * GET /api/engagement/export/pack
 * Returns a markdown workshop/board pack (downloadable).
 */
export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const [opportunities, phases, initiatives, captures, kpis] = await Promise.all([
      prisma.opportunity.findMany({
        orderBy: [{ riceScore: "desc" }, { createdAt: "asc" }],
        take: 80,
      }),
      prisma.roadmapPhase.findMany({
        include: { initiatives: { orderBy: { sortOrder: "asc" } } },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.roadmapInitiative.findMany({ take: 1 }),
      prisma.engagementCapture.findMany({ orderBy: { updatedAt: "desc" }, take: 40 }),
      prisma.kPI.findMany({ take: 40, orderBy: { name: "asc" } }),
    ]);
    void initiatives;

    const decided = opportunities.filter((o) => o.decisionLoggedAt);
    const lines: string[] = [
      "# GPSSA Intelligence — Workshop / Board Pack",
      "",
      `Generated: ${new Date().toISOString()}`,
      "",
      "## Purpose",
      "",
      PLAYBOOK_ONE_LINER,
      "",
      "### Three jobs",
      "",
      ...PROJECT_JOBS.map((j) => `- **${j.label}** — ${j.blurb}`),
      "",
      "## Engagement phases (RFP GPSSA-016-2026)",
      "",
      ...ENGAGEMENT_PHASES.flatMap((p) => [
        `### ${p.label} (${p.weeks} · ${p.rfpRefs})`,
        "",
        p.summary,
        "",
        ...p.screens.map((s) => `- ${s.label}: ${s.why} _(owner: ${s.ownerHint})_`),
        "",
      ]),
      "## Opportunity backlog",
      "",
      `| Title | Category | Status | Owner | RFP | Decision |`,
      `|---|---|---|---|---|---|`,
      ...opportunities.map((o) =>
        `| ${esc(o.title)} | ${esc(o.category)} | ${esc(o.status)} | ${esc(o.owner ?? "—")} | ${esc(o.sourceSection ?? "—")} | ${o.decisionLoggedAt ? o.decisionLoggedAt.toISOString().slice(0, 10) : "—"} |`
      ),
      "",
      `Decisions logged: **${decided.length}** / ${opportunities.length}`,
      "",
      "## Roadmap phases",
      "",
    ];

    for (const phase of phases) {
      lines.push(`### ${phase.name}${phase.workstream ? ` (WS ${phase.workstream})` : ""}`);
      lines.push("");
      if (phase.description) lines.push(phase.description, "");
      for (const init of phase.initiatives) {
        lines.push(
          `- **${init.title}** — ${init.status}${init.owner ? ` · ${init.owner}` : ""}`
        );
      }
      lines.push("");
    }

    lines.push("## KPI / KQI (sample)", "", ...kpis.slice(0, 25).map((k) => `- ${k.name}${k.owner ? ` (${k.owner})` : ""}: target ${k.target ?? "—"} / actual ${k.actual ?? "—"}`), "");

    lines.push("## Workshop captures", "");
    if (captures.length === 0) {
      lines.push("_No workshop notes captured yet._", "");
    } else {
      for (const c of captures) {
        lines.push(`### ${c.entityType}${c.entityId ? ` · ${c.entityId}` : ""}`);
        lines.push("");
        lines.push(c.body);
        lines.push("");
      }
    }

    lines.push(
      "---",
      "",
      "_Gold seed may still populate ops modules. Replace with client evidence before decisions._",
      ""
    );

    const markdown = lines.join("\n");
    return new NextResponse(markdown, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="gpssa-workshop-pack-${new Date().toISOString().slice(0, 10)}.md"`,
      },
    });
  } catch (e) {
    console.error("export pack", e);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}

function esc(s: string): string {
  return s.replace(/\|/g, "\\|").replace(/\n/g, " ");
}
