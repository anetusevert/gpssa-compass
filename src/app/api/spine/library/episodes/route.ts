import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin-guard";
import { EPISODE_LIBRARY, LIFECYCLE_CATEGORIES } from "@/lib/spine/library";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;
  return NextResponse.json({ categories: LIFECYCLE_CATEGORIES, episodes: EPISODE_LIBRARY });
}
