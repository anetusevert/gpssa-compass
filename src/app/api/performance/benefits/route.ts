import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET → benefits-realisation rows with the linked roadmap initiative title
 * (when present), ordered by status priority then title.
 */
const STATUS_ORDER: Record<string, number> = {
  realised: 0,
  "on-track": 1,
  "at-risk": 2,
  missed: 3,
};

export async function GET() {
  try {
    const rows = await prisma.benefitsRealisation.findMany({
      include: { initiative: { select: { title: true } } },
    });

    const shaped = rows
      .map((b) => ({
        id: b.id,
        title: b.title,
        metric: b.metric,
        baseline: b.baseline,
        target: b.target,
        actual: b.actual,
        unit: b.unit,
        status: b.status,
        validatedBy: b.validatedBy,
        validatedAt: b.validatedAt,
        note: b.note,
        initiativeTitle: b.initiative?.title ?? null,
      }))
      .sort(
        (a, b) =>
          (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9) ||
          a.title.localeCompare(b.title)
      );

    return NextResponse.json(shaped);
  } catch (error) {
    console.error("Failed to fetch benefits realisation:", error);
    return NextResponse.json(
      { error: "Failed to fetch benefits realisation" },
      { status: 500 }
    );
  }
}
