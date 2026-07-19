import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireEditor } from "@/lib/admin-guard";

const VALID_STATUS = ["open", "in-progress", "verified", "closed"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireEditor();
  if (error) return error;

  try {
    const body = await req.json();
    const { status } = body as { status?: string };

    if (!status || !VALID_STATUS.includes(status)) {
      return NextResponse.json(
        { error: `status must be one of ${VALID_STATUS.join(", ")}` },
        { status: 400 }
      );
    }

    const updated = await prisma.correctiveAction.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/quality/capa/[id] failed:", error);
    return NextResponse.json({ error: "Failed to update corrective action" }, { status: 500 });
  }
}
