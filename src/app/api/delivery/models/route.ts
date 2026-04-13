import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const models = await prisma.deliveryModel.findMany({
      orderBy: { maturity: "desc" },
      include: {
        sourceCitations: {
          include: { source: true },
          take: 5,
        },
      },
    });

    const mapped = models.map((m) => ({
      ...m,
      channelMix: m.channelMix ? JSON.parse(m.channelMix) : [],
      targetSegments: m.targetSegments ? JSON.parse(m.targetSegments) : [],
      enablers: m.enablers ? JSON.parse(m.enablers) : [],
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch delivery models";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
