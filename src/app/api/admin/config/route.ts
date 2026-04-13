import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

const SENSITIVE_KEYS = ["openai_api_key"];

function maskValue(key: string, value: string): string {
  if (SENSITIVE_KEYS.includes(key) && value.length > 4) {
    return "•".repeat(value.length - 4) + value.slice(-4);
  }
  return value;
}

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const configs = await prisma.appConfig.findMany();

    const masked = configs.map((c) => ({
      key: c.key,
      value: maskValue(c.key, c.value),
    }));

    return NextResponse.json(masked);
  } catch (error) {
    console.error("Failed to fetch config:", error);
    return NextResponse.json(
      { error: "Failed to fetch configuration" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();

    if (!body.key || body.value === undefined) {
      return NextResponse.json(
        { error: "key and value are required" },
        { status: 400 }
      );
    }

    const config = await prisma.appConfig.upsert({
      where: { key: body.key },
      update: { value: body.value },
      create: { key: body.key, value: body.value },
    });

    return NextResponse.json({
      key: config.key,
      value: maskValue(config.key, config.value),
    });
  } catch (error) {
    console.error("Failed to update config:", error);
    return NextResponse.json(
      { error: "Failed to update configuration" },
      { status: 500 }
    );
  }
}
