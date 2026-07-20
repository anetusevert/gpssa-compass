import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin-guard";
import { listSpineServices } from "@/lib/spine/query";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const services = await listSpineServices();
    return NextResponse.json(services);
  } catch (e) {
    console.error("spine services", e);
    return NextResponse.json({ error: "Failed to load spine services" }, { status: 500 });
  }
}
