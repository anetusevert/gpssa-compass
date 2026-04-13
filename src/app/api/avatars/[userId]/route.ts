import { NextRequest, NextResponse } from "next/server";
import { uploadService } from "@/lib/services";

export async function GET(
  _req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const result = await uploadService.readAvatar(params.userId);
    if (!result) {
      return new NextResponse(null, { status: 404 });
    }

    return new NextResponse(new Uint8Array(result.buffer), {
      headers: {
        "Content-Type": result.mimeType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
