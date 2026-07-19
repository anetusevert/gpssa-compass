import type { PrismaClient } from "@prisma/client";

/**
 * Gold offline service × channel matrix so the briefing Diagnose slide and
 * Channels page never render empty when research agents are paused.
 */
const CHANNELS = ["Portal", "Mobile App", "Service Centers", "Call Center", "API"] as const;

const LEVEL_CYCLE: Array<"Full" | "Partial" | "Planned" | "None"> = [
  "Full",
  "Partial",
  "Full",
  "Planned",
  "Partial",
  "Full",
  "None",
  "Partial",
];

export async function seedGoldChannelMatrix(prisma: PrismaClient): Promise<number> {
  const services = await prisma.gPSSAService.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  if (services.length === 0) return 0;

  const existing = await prisma.serviceChannelCapability.count();
  if (existing >= services.length * 2) {
    // Already populated enough for a demo heatmap
    return existing;
  }

  let upserted = 0;
  let i = 0;
  for (const svc of services) {
    for (const channel of CHANNELS) {
      const level = LEVEL_CYCLE[i % LEVEL_CYCLE.length];
      i += 1;
      await prisma.serviceChannelCapability.upsert({
        where: {
          serviceId_channelName: { serviceId: svc.id, channelName: channel },
        },
        update: {},
        create: {
          serviceId: svc.id,
          channelName: channel,
          capabilityLevel: level,
          researchStatus: "seeded",
          researchSource: "gold-seed",
        },
      });
      upserted += 1;
    }
  }
  return upserted;
}
