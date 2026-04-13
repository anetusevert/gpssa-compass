import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { userService } from "@/lib/services";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const users = await userService.listUsers();
    return NextResponse.json(users);
  } catch (err) {
    console.error("Failed to fetch users:", err);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();

    if (!body.email || !body.password || !body.name) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const user = await userService.createUser({
      name: body.name,
      email: body.email,
      password: body.password,
      role: body.role,
      userType: body.userType,
      department: body.department,
    });

    return NextResponse.json(user, { status: 201 });
  } catch (err: any) {
    if (err.message?.includes("already exists")) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    console.error("Failed to create user:", err);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const user = await userService.updateUser(body.id, {
      name: body.name,
      email: body.email,
      role: body.role,
      userType: body.userType,
      department: body.department,
    });

    return NextResponse.json(user);
  } catch (err) {
    console.error("Failed to update user:", err);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
