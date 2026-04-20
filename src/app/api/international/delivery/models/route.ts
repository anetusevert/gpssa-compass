import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const countries = searchParams.get("countries");

    const where: Record<string, unknown> = {};
    if (countries) {
      const iso3List = countries.split(",").map((c) => c.trim().toUpperCase());
      where.countryIso3 = { in: iso3List };
    }

    const models = await prisma.internationalDeliveryModel.findMany({
      where,
      include: {
        sourceCitations: { include: { source: true }, take: 3 },
      },
      orderBy: [{ countryIso3: "asc" }, { name: "asc" }],
    });

    return NextResponse.json(models);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch international delivery models";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
