import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { dataService } from "@/lib/services";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const data = await dataService.exportAll();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Failed to export data:", err);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
