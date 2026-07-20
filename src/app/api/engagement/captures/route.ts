import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, requireEditor } from "@/lib/admin-guard";

/** GET /api/engagement/captures?entityType=&entityId= */
export async function GET(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const entityType = req.nextUrl.searchParams.get("entityType");
    const entityId = req.nextUrl.searchParams.get("entityId");
    const where: { entityType?: string; entityId?: string | null } = {};
    if (entityType) where.entityType = entityType;
    if (entityId !== null && entityId !== undefined) {
      where.entityId = entityId === "" ? null : entityId;
    }

    const rows = await prisma.engagementCapture.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: 100,
    });
    return NextResponse.json(rows);
  } catch (e) {
    console.error("engagement captures GET", e);
    return NextResponse.json({ error: "Failed to load captures" }, { status: 500 });
  }
}

/** POST /api/engagement/captures — upsert by entityType+entityId when provided */
export async function POST(req: NextRequest) {
  const { error, session } = await requireEditor();
  if (error) return error;

  try {
    const body = await req.json();
    const entityType = String(body.entityType ?? "").trim();
    const entityId = body.entityId != null ? String(body.entityId) : null;
    const text = String(body.body ?? "").trim();
    if (!entityType || !text) {
      return NextResponse.json({ error: "entityType and body required" }, { status: 400 });
    }

    const author =
      (session?.user as { name?: string; email?: string } | undefined)?.name ??
      (session?.user as { email?: string } | undefined)?.email ??
      null;

    if (entityId) {
      const existing = await prisma.engagementCapture.findFirst({
        where: { entityType, entityId },
      });
      if (existing) {
        const updated = await prisma.engagementCapture.update({
          where: { id: existing.id },
          data: { body: text, author },
        });
        return NextResponse.json(updated);
      }
    }

    const created = await prisma.engagementCapture.create({
      data: { entityType, entityId, body: text, author },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    console.error("engagement captures POST", e);
    return NextResponse.json({ error: "Failed to save capture" }, { status: 500 });
  }
}
