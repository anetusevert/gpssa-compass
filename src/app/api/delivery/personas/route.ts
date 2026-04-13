import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const personas = await prisma.customerPersona.findMany({
      orderBy: { name: "asc" },
      include: {
        sourceCitations: {
          include: { source: true },
          take: 5,
        },
      },
    });

    const mapped = personas.map((p) => ({
      ...p,
      needs: p.needs ? JSON.parse(p.needs) : [],
      coverageMap: p.coverageMap ? JSON.parse(p.coverageMap) : null,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch personas";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
