import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import type { SpineDraft, SystemsQaOutline } from "@/lib/spine/generate";

type ApplySection = "all" | "process" | "systems-qa";

async function applySystemsQa(
  serviceId: string,
  processId: string,
  processName: string,
  outline: SystemsQaOutline
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

  const existingSc = await prisma.qAScorecard.findFirst({ where: { serviceId } });
  if (!existingSc && outline.qaApproach) {
    await prisma.qAScorecard.create({
      data: {
        name: outline.qaApproach.scorecardName,
        description: outline.qaApproach.summary,
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

  // Act 5: apply only the systems + QA outline onto the latest applied process.
  if (section === "systems-qa") {
    const outline = body.outline as SystemsQaOutline | null;
    if (!outline?.systems?.length) {
      return NextResponse.json({ error: "No outline to apply" }, { status: 400 });
    }
    const process = await prisma.operatingProcess.findFirst({
      where: { serviceId, sops: { some: {} } },
      orderBy: { createdAt: "desc" },
    });
    if (!process) {
      return NextResponse.json({ error: "Apply a process first" }, { status: 400 });
    }
    await applySystemsQa(serviceId, process.id, process.name, outline);
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

  // "process" section stops here — systems + QA arrive via the Act 5 agent.
  if (section === "all") {
    await applySystemsQa(serviceId, process.id, resolved.processName, {
      systems: resolved.systems ?? [],
      qaApproach: resolved.qaApproach,
    });
  }

  return NextResponse.json({
    processId: process.id,
    sopId: sop.id,
    ok: true,
  });
}
