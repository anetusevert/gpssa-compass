import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const job = await prisma.researchJob.findUnique({
    where: { id: params.id },
    include: {
      items: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          countryIso3: true,
          status: true,
          tokensUsed: true,
          durationMs: true,
          error: true,
        },
      },
    },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json(job);
}
