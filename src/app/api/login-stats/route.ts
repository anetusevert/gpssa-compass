import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const STATS_PASSWORD = process.env.LOGIN_STATS_PASSWORD ?? "HowMany";

/**
 * Password-gated demo-login counters. Does not create a NextAuth session.
 * POST { password } → totals for successful standard demo password logins.
 */
export async function POST(req: NextRequest) {
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!body.password || body.password !== STATS_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [total, last7Days, first, last] = await Promise.all([
    prisma.activity.count({ where: { action: "demo_login" } }),
    prisma.activity.count({
      where: { action: "demo_login", createdAt: { gte: sevenDaysAgo } },
    }),
    prisma.activity.findFirst({
      where: { action: "demo_login" },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    }),
    prisma.activity.findFirst({
      where: { action: "demo_login" },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
  ]);

  return NextResponse.json({
    total,
    last7Days,
    firstAt: first?.createdAt?.toISOString() ?? null,
    lastAt: last?.createdAt?.toISOString() ?? null,
  });
}
