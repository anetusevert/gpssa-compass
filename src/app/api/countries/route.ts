import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region");
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};

  if (region && region !== "All") {
    where.region = region;
  }

  if (status && status !== "all") {
    where.researchStatus = status;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { institution: { contains: search, mode: "insensitive" } },
      { iso3: { contains: search, mode: "insensitive" } },
    ];
  }

  const countries = await prisma.country.findMany({
    where,
    orderBy: { name: "asc" },
  });

  return NextResponse.json(countries);
}
