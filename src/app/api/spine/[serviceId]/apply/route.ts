import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import type { SpineDraft } from "@/lib/spine/generate";

export async function POST(
  req: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  const { error } = await requireAuth();
  if (error) return error;

  const serviceId = params.serviceId;
  const body = await req.json();
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

  for (const sys of resolved.systems ?? []) {
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
      where: { processId_systemId: { processId: process.id, systemId: row.id } },
      create: { processId: process.id, systemId: row.id, role: sys.role || "workflow" },
      update: { role: sys.role || "workflow" },
    });
  }

  const existingSc = await prisma.qAScorecard.findFirst({
    where: { serviceId },
  });
  if (!existingSc && resolved.qaApproach) {
    await prisma.qAScorecard.create({
      data: {
        name: resolved.qaApproach.scorecardName,
        description: resolved.qaApproach.summary,
        serviceId,
        serviceScope: resolved.processName,
        status: "draft",
      },
    });
  }

  return NextResponse.json({
    processId: process.id,
    sopId: sop.id,
    ok: true,
  });
}
