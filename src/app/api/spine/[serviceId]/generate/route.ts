import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { generateSpineDraft } from "@/lib/spine/generate";
import { personas } from "@/data/personas";

export async function POST(
  req: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  const { error } = await requireAuth();
  if (error) return error;

  const serviceId = params.serviceId;
  const service = await prisma.gPSSAService.findUnique({ where: { id: serviceId } });
  if (!service) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const config = await prisma.spineConfig.findUnique({ where: { serviceId } });
  const episode = await prisma.customerEpisode.findFirst({
    where: { serviceId, isActive: true },
    include: { stages: { orderBy: { sortOrder: "asc" } } },
  });
  if (!episode) {
    return NextResponse.json({ error: "Activate an episode first" }, { status: 400 });
  }

  const personaKey = config?.activePersonaKey ?? episode.personaKey;
  const persona = personaKey ? personas.find((p) => p.id === personaKey) : null;
  let painPoints: string[] = [];
  try {
    painPoints = service.painPoints ? (JSON.parse(service.painPoints) as string[]) : [];
  } catch {
    painPoints = [];
  }

  const { draft, source } = await generateSpineDraft({
    serviceName: service.name,
    episodeName: episode.name,
    episodeDescription: episode.description ?? undefined,
    personaName: persona?.name,
    stages: episode.stages.map((s) => ({
      name: s.name,
      actor: s.actor,
      outcome: s.outcome ?? undefined,
    })),
    painPoints,
  });

  await prisma.spineConfig.upsert({
    where: { serviceId },
    create: {
      serviceId,
      activeEpisodeId: episode.id,
      draftJson: JSON.stringify(draft),
    },
    update: { draftJson: JSON.stringify(draft) },
  });

  return NextResponse.json({ draft, source });
}
