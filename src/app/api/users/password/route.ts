import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin-guard";
import { authService } from "@/lib/services";

export async function PUT(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  try {
    const userId = (session!.user as any).id;
    const body = await req.json();

    if (!body.currentPassword || !body.newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    if (body.newPassword.length < 4) {
      return NextResponse.json(
        { error: "New password must be at least 4 characters" },
        { status: 400 }
      );
    }

    const result = await authService.changePassword(
      userId,
      body.currentPassword,
      body.newPassword
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to change password:", err);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
}
