import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { dataService } from "@/lib/services";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const sources = await dataService.listSources();
    return NextResponse.json(sources);
  } catch (err) {
    console.error("Failed to fetch sources:", err);
    return NextResponse.json(
      { error: "Failed to fetch sources" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();

    if (!body.title || !body.url) {
      return NextResponse.json(
        { error: "Title and URL are required" },
        { status: 400 }
      );
    }

    const source = await dataService.createSource({
      title: body.title,
      url: body.url,
      publisher: body.publisher,
      sourceType: body.sourceType,
      description: body.description,
      region: body.region,
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined,
      accessedAt: body.accessedAt ? new Date(body.accessedAt) : undefined,
    });

    return NextResponse.json(source, { status: 201 });
  } catch (err) {
    console.error("Failed to create source:", err);
    return NextResponse.json(
      { error: "Failed to create source" },
      { status: 500 }
    );
  }
}
