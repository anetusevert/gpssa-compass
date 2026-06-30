import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/governance/raci → RACI entries grouped by processArea.
// Shape: [{ processArea, teams[], activities: [{ activity, roles: { team: role } }] }]
export async function GET() {
  try {
    const entries = await prisma.raciEntry.findMany({
      orderBy: [{ processArea: "asc" }, { sortOrder: "asc" }],
    });

    // Stable team ordering as first seen.
    const teamOrder: string[] = [];
    for (const e of entries) {
      if (!teamOrder.includes(e.team)) teamOrder.push(e.team);
    }

    const groupMap = new Map<
      string,
      Map<string, Record<string, string>>
    >();

    for (const e of entries) {
      if (!groupMap.has(e.processArea)) groupMap.set(e.processArea, new Map());
      const activities = groupMap.get(e.processArea)!;
      if (!activities.has(e.activity)) activities.set(e.activity, {});
      activities.get(e.activity)![e.team] = e.role;
    }

    const grouped = Array.from(groupMap.entries()).map(
      ([processArea, activities]) => ({
        processArea,
        teams: teamOrder,
        activities: Array.from(activities.entries()).map(
          ([activity, roles]) => ({ activity, roles })
        ),
      })
    );

    return NextResponse.json(grouped);
  } catch (error) {
    console.error("Failed to fetch RACI entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch RACI entries" },
      { status: 500 }
    );
  }
}
