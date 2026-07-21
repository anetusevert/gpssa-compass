import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { generateSystemsQaOutline } from "@/lib/spine/generate";

export async function POST(
  _req: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  const { error } = await requireAuth();
  if (error) return error;

  const serviceId = params.serviceId;
  const service = await prisma.gPSSAService.findUnique({ where: { id: serviceId } });
  if (!service) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const process = await prisma.operatingProcess.findFirst({
    where: { serviceId, sops: { some: {} } },
    orderBy: { createdAt: "desc" },
    include: {
      sops: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { steps: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });
  const sop = process?.sops[0];
  if (!process || !sop?.steps.length) {
    return NextResponse.json(
      { error: "Apply a process with an SOP first" },
      { status: 400 }
    );
  }

  const { outline, source } = await generateSystemsQaOutline({
    serviceName: service.name,
    processName: process.name,
    sopTitle: sop.title,
    steps: sop.steps.map((s) => ({
      title: s.title,
      instruction: s.instruction,
      qaCheckpoint: s.qaCheckpoint,
    })),
  });

  return NextResponse.json({ outline, source, processId: process.id });
}
