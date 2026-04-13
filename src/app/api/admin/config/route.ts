import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { configService } from "@/lib/services";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const all = await configService.getAll();
    return NextResponse.json(all);
  } catch (err) {
    console.error("Failed to fetch config:", err);
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

    if (body.openai_api_key !== undefined) {
      const result = await configService.set("openai_api_key", body.openai_api_key);
      return NextResponse.json({ openai_api_key: result.value });
    }

    if (body.key && body.value !== undefined) {
      const result = await configService.set(body.key, body.value);
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: "No valid configuration provided" },
      { status: 400 }
    );
  } catch (err) {
    console.error("Failed to update config:", err);
    return NextResponse.json(
      { error: "Failed to update configuration" },
      { status: 500 }
    );
  }
}
