import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const capabilities = await prisma.serviceChannelCapability.findMany({
      include: {
        service: {
          select: { id: true, name: true, category: true },
        },
      },
      orderBy: [{ service: { name: "asc" } }, { channelName: "asc" }],
    });

    return NextResponse.json(capabilities);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch channel capabilities";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
