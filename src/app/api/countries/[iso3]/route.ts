import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: { iso3: string } }
) {
  const { error } = await requireAuth();
  if (error) return error;

  const country = await prisma.country.findUnique({
    where: { iso3: params.iso3.toUpperCase() },
    include: { institutions: true },
  });

  if (!country) {
    return NextResponse.json({ error: "Country not found" }, { status: 404 });
  }

  return NextResponse.json(country);
}
