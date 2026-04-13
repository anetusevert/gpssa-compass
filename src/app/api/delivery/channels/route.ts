import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const channels = await prisma.deliveryChannel.findMany({
      orderBy: [{ maturity: "desc" }, { name: "asc" }],
      include: {
        sourceCitations: {
          include: { source: true },
          take: 5,
        },
      },
    });

    const mapped = channels.map((c) => ({
      ...c,
      strengths: c.strengths ? JSON.parse(c.strengths) : [],
      gaps: c.gaps ? JSON.parse(c.gaps) : [],
      capabilities: c.capabilities ?? "",
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch channels";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
