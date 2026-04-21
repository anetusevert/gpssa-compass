import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin-guard";
import { uploadService } from "@/lib/services";

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  // The demo account's avatar is hardwired to the GPSSA logo; uploads from this
  // shared session are rejected so it can't be repainted for other viewers.
  if ((session!.user as any).userType === "demo") {
    return NextResponse.json(
      { error: "Demo accounts cannot change their avatar" },
      { status: 403 }
    );
  }

  try {
    const userId = (session!.user as any).id;
    const formData = await req.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Use JPEG, PNG, GIF, or WebP." },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum 5MB." },
        { status: 400 }
      );
    }

    const avatar = await uploadService.saveAvatar(userId, file);
    return NextResponse.json({ avatar });
  } catch (err) {
    console.error("Failed to upload avatar:", err);
    return NextResponse.json(
      { error: "Failed to upload avatar" },
      { status: 500 }
    );
  }
}
