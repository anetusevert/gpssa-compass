import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin-guard";
import { resolvePersonaLens } from "@/lib/spine/estate";
import { personas } from "@/data/personas";

export async function GET(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const personaKey =
    req.nextUrl.searchParams.get("personaKey") ||
    req.nextUrl.searchParams.get("persona") ||
    "emirati-govt-employee";

  if (!personas.some((p) => p.id === personaKey)) {
    return NextResponse.json({ error: "Unknown persona" }, { status: 400 });
  }

  const lens = await resolvePersonaLens(personaKey);
  return NextResponse.json(lens);
}
