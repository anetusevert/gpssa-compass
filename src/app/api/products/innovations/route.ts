import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const innovations = await prisma.productInnovation.findMany({
      orderBy: [{ impactScore: "desc" }, { title: "asc" }],
      include: {
        sourceCitations: {
          include: { source: true },
          take: 5,
        },
      },
    });

    return NextResponse.json(innovations);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch innovations";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
