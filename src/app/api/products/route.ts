import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: [{ tier: "asc" }, { name: "asc" }],
      include: {
        sourceCitations: {
          include: { source: true },
          take: 5,
        },
      },
    });

    const mapped = products.map((p) => ({
      ...p,
      targetSegments: p.targetSegments ? JSON.parse(p.targetSegments) : [],
      keyFeatures: p.keyFeatures ? JSON.parse(p.keyFeatures) : [],
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch products";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
