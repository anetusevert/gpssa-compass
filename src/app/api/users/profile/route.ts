import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin-guard";
import { userService } from "@/lib/services";

export async function GET() {
  const { error, session } = await requireAuth();
  if (error) return error;

  try {
    const userId = (session!.user as any).id;
    const user = await userService.getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (err) {
    console.error("Failed to fetch profile:", err);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  // The shared demo account stays neutral; mutations are rejected so concurrent
  // viewers always see the same identity.
  if ((session!.user as any).userType === "demo") {
    return NextResponse.json(
      { error: "Demo accounts cannot edit their profile" },
      { status: 403 }
    );
  }

  try {
    const userId = (session!.user as any).id;
    const body = await req.json();
    const user = await userService.updateProfile(userId, {
      name: body.name,
      email: body.email,
    });
    return NextResponse.json(user);
  } catch (err) {
    console.error("Failed to update profile:", err);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
