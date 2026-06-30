import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

/**
 * PATCH → update a benefit's actual value and/or status (admin only).
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const body = await req.json();

    const data: Record<string, unknown> = {};
    if (body.actual !== undefined) data.actual = body.actual;
    if (body.status !== undefined) data.status = body.status;
    if (body.note !== undefined) data.note = body.note;
    if (body.validatedBy !== undefined) data.validatedBy = body.validatedBy;
    if (body.validatedAt !== undefined) data.validatedAt = body.validatedAt;

    const updated = await prisma.benefitsRealisation.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update benefit:", error);
    return NextResponse.json(
      { error: "Failed to update benefit" },
      { status: 500 }
    );
  }
}
