import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin-guard";
import { buildPersonaServiceMatrix, generateEstateDrafts } from "@/lib/spine/estate";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const matrix = await buildPersonaServiceMatrix();
    return NextResponse.json(matrix);
  } catch (e) {
    console.error("[spine/estate GET]", e);
    return NextResponse.json({ error: "Failed to build matrix" }, { status: 500 });
  }
}

/** Draft-only bulk generate for up to 3 services. */
export async function POST(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await req.json();
    const serviceIds = Array.isArray(body.serviceIds) ? (body.serviceIds as string[]) : [];
    const personaKey = String(body.personaKey || "emirati-govt-employee");
    if (!serviceIds.length) {
      return NextResponse.json({ error: "serviceIds required" }, { status: 400 });
    }
    const result = await generateEstateDrafts({ serviceIds, personaKey });
    return NextResponse.json(result);
  } catch (e) {
    console.error("[spine/estate POST]", e);
    return NextResponse.json({ error: "Failed to generate drafts" }, { status: 500 });
  }
}
