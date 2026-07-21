import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import type { QaOutline, SpineDraft, SystemsOutline } from "@/lib/spine/generate";

type ApplySection = "all" | "process" | "systems" | "qa" | "systems-qa";

async function latestProcess(serviceId: string) {
  return prisma.operatingProcess.findFirst({
    where: { serviceId, sops: { some: {} } },
    orderBy: { createdAt: "desc" },
  });
}

async function applySystems(
  processId: string,
  outline: SystemsOutline
) {
  for (const sys of outline.systems ?? []) {
    const row = await prisma.backofficeSystem.upsert({
      where: { code: sys.code },
      create: {
        code: sys.code,
        name: sys.name,
        kind: sys.kind || "other",
      },
      update: { name: sys.name },
    });
    await prisma.processSystemLink.upsert({
      where: { processId_systemId: { processId, systemId: row.id } },
      create: { processId, systemId: row.id, role: sys.role || "workflow" },
      update: { role: sys.role || "workflow" },
    });
  }
}

async function applyQa(
  serviceId: string,
  processName: string,
  outline: QaOutline
) {
  const existingSc = await prisma.qAScorecard.findFirst({ where: { serviceId } });
  const description = [
    outline.summary,
    "",
    "KPIs:",
    ...(outline.kpis ?? []).map(
      (k) => `- ${k.name}${k.target ? `: ${k.target}` : ""}${k.unit ? ` (${k.unit})` : ""}`
    ),
    "",
    "Criteria:",
    ...(outline.criteria ?? []).map((c) => `- ${c}`),
    "",
    "Checkpoint focus:",
    ...(outline.checkpointFocus ?? []).map((c) => `- ${c}`),
  ].join("\n");

  if (existingSc) {
    await prisma.qAScorecard.update({
      where: { id: existingSc.id },
      data: {
        name: outline.scorecardName,
        description,
        serviceScope: processName,
        status: "draft",
      },
    });
  } else {
    await prisma.qAScorecard.create({
      data: {
        name: outline.scorecardName,
        description,
        serviceId,
        serviceScope: processName,
        status: "draft",
      },
    });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  const { error } = await requireAuth();
  if (error) return error;

  const serviceId = params.serviceId;
  const body = await req.json();
  const section = (body.section ?? "all") as ApplySection;

  if (section === "systems" || section === "systems-qa") {
    const systems =
      (body.outline as SystemsOutline | null)?.systems ??
      (body.systems as SystemsOutline["systems"] | undefined);
    if (!systems?.length) {
      return NextResponse.json({ error: "No systems outline to apply" }, { status: 400 });
    }
    const process = await latestProcess(serviceId);
    if (!process) {
      return NextResponse.json({ error: "Apply a process first" }, { status: 400 });
    }
    await applySystems(process.id, { systems });

    // Legacy combined payload may include qaApproach
    const qa =
      (body.outline as { qaApproach?: QaOutline } | null)?.qaApproach ??
      (body.qaOutline as QaOutline | undefined);
    if (section === "systems-qa" && qa) {
      await applyQa(serviceId, process.name, qa);
    }
    return NextResponse.json({ ok: true, processId: process.id });
  }

  if (section === "qa") {
    const outline = (body.outline ?? body.qaOutline) as QaOutline | null;
    if (!outline?.scorecardName) {
      return NextResponse.json({ error: "No QA outline to apply" }, { status: 400 });
    }
    const process = await latestProcess(serviceId);
    if (!process) {
      return NextResponse.json({ error: "Apply a process first" }, { status: 400 });
    }
    await applyQa(serviceId, process.name, outline);
    return NextResponse.json({ ok: true, processId: process.id });
  }

  const draft = (body.draft ?? null) as SpineDraft | null;
  const config = await prisma.spineConfig.findUnique({ where: { serviceId } });
  const resolved: SpineDraft | null =
    draft ?? (config?.draftJson ? (JSON.parse(config.draftJson) as SpineDraft) : null);
  if (!resolved?.steps?.length) {
    return NextResponse.json({ error: "No draft to apply" }, { status: 400 });
  }

  const process = await prisma.operatingProcess.create({
    data: {
      serviceId,
      name: resolved.processName,
      description: resolved.processDescription,
      ownerHint: resolved.ownerHint,
    },
  });

  const sop = await prisma.sopDocument.create({
    data: {
      processId: process.id,
      title: resolved.sopTitle,
      version: "1.0",
      status: "draft",
      steps: {
        create: resolved.steps.map((st, i) => ({
          title: st.title,
          instruction: st.instruction,
          qaCheckpoint: !!st.qaCheckpoint,
          checkpointNote: st.checkpointNote,
          sortOrder: i,
        })),
      },
    },
  });

  if (section === "all") {
    await applySystems(process.id, { systems: resolved.systems ?? [] });
    if (resolved.qaApproach) {
      await applyQa(serviceId, resolved.processName, {
        scorecardName: resolved.qaApproach.scorecardName,
        summary: resolved.qaApproach.summary,
        kpis: [],
        criteria: resolved.qaApproach.checkpointFocus ?? [],
        checkpointFocus: resolved.qaApproach.checkpointFocus ?? [],
      });
    }
  }

  return NextResponse.json({
    processId: process.id,
    sopId: sop.id,
    ok: true,
  });
}
